import { applyGravity, cloneBoard, getCell, refillBoard, setCell } from "./board";
import { findMatches } from "./match";
import { activatePositions } from "./specials";
import { cascadeMultiplier, SCORE_PER_TILE, SPECIAL_ACTIVATION_BONUS } from "./scoring";
import type { Rng } from "./rng";
import type {
  Board,
  CandyColor,
  Position,
  ResolveResult,
  SpecialType,
} from "./types";

let specialIdCounter = 0;
function nextSpecialId(): string {
  specialIdCounter += 1;
  return `s${specialIdCounter}`;
}

export interface SeedActivation {
  origin: Position;
  special: SpecialType;
  otherColor: CandyColor | null;
}

function posKey(pos: Position): string {
  return `${pos.row},${pos.col}`;
}

/**
 * Runs the full match -> clear -> gravity -> refill cascade to a stable
 * state. `seedActivations` lets a caller (a swap that directly triggers a
 * special candy) inject the first round's clears before normal match
 * detection takes over for any resulting cascades.
 */
export function resolveBoard(
  board: Board,
  colorCount: number,
  rng: Rng,
  seedActivations: SeedActivation[] = [],
): ResolveResult {
  let workingBoard = cloneBoard(board);
  let scoreGained = 0;
  let cascadeCount = 0;
  let tilesCleared = 0;
  let iceBrokenTotal = 0;
  const collectedColors: Partial<Record<CandyColor, number>> = {};
  const steps: ResolveResult["steps"] = [];
  let pendingSeed = seedActivations;

  for (;;) {
    const matches = findMatches(workingBoard);
    const clearMap = new Map<string, Position>();

    for (const seed of pendingSeed) {
      for (const pos of activatePositions(workingBoard, seed.origin, seed.special, seed.otherColor)) {
        clearMap.set(posKey(pos), pos);
      }
    }
    for (const match of matches) {
      for (const pos of match.positions) {
        clearMap.set(posKey(pos), pos);
      }
    }

    if (clearMap.size === 0) break;

    // Chain-activate any already-special tile swept up by this round's clears.
    const activationQueue = [...clearMap.values()];
    const processed = new Set<string>();
    while (activationQueue.length > 0) {
      const pos = activationQueue.pop()!;
      const key = posKey(pos);
      if (processed.has(key)) continue;
      processed.add(key);

      const cell = getCell(workingBoard, pos);
      if (!cell?.special) continue;

      for (const extra of activatePositions(workingBoard, pos, cell.special, null)) {
        const extraKey = posKey(extra);
        if (!clearMap.has(extraKey)) {
          clearMap.set(extraKey, extra);
          activationQueue.push(extra);
        }
      }
    }

    const clearedTiles: ResolveResult["steps"][number]["clearedTiles"] = [];
    const iceBroken: Position[] = [];
    for (const pos of clearMap.values()) {
      const cell = getCell(workingBoard, pos);
      if (!cell) continue;
      tilesCleared += 1;
      clearedTiles.push({ pos, color: cell.color });
      if (cell.color) {
        collectedColors[cell.color] = (collectedColors[cell.color] ?? 0) + 1;
      }
      if (workingBoard.ice[pos.row][pos.col] > 0) {
        workingBoard.ice[pos.row][pos.col] -= 1;
        iceBroken.push(pos);
        iceBrokenTotal += 1;
      }
    }

    const stepScore =
      clearMap.size * SCORE_PER_TILE * cascadeMultiplier(cascadeCount) +
      matches.filter((m) => m.createsSpecial).length * SPECIAL_ACTIVATION_BONUS;
    scoreGained += stepScore;

    for (const pos of clearMap.values()) {
      setCell(workingBoard, pos, null);
    }
    for (const match of matches) {
      if (!match.createsSpecial) continue;
      setCell(workingBoard, match.specialOrigin, {
        id: nextSpecialId(),
        color: match.color,
        special: match.createsSpecial,
      });
    }

    const clearedSnapshot = cloneBoard(workingBoard);

    cascadeCount += 1;
    pendingSeed = [];

    workingBoard = applyGravity(workingBoard);
    workingBoard = refillBoard(workingBoard, colorCount, rng);

    steps.push({
      cleared: clearedSnapshot,
      settled: cloneBoard(workingBoard),
      scoreGained: stepScore,
      clearedTiles,
      iceBroken,
    });
  }

  return {
    board: workingBoard,
    scoreGained,
    cascadeCount,
    collectedColors,
    tilesCleared,
    iceBroken: iceBrokenTotal,
    steps,
  };
}
