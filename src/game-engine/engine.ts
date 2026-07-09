import { cloneBoard, createInitialBoard, getCell, setCell } from "./board";
import { createRng, type Rng } from "./rng";
import { resolveBoard, type SeedActivation } from "./resolve";
import { isValidSwap, swapCells } from "./swap";
import { hasValidMove, reshuffleBoard } from "./reshuffle";
import { evaluateObjectives, allObjectivesComplete } from "./objectives";
import type {
  Board,
  CandyColor,
  CascadeStep,
  LevelDefinition,
  MoveResult,
  ObjectiveProgress,
  Position,
} from "./types";

export interface GameSession {
  level: LevelDefinition;
  board: Board;
  movesLeft: number;
  score: number;
  collectedColors: Partial<Record<CandyColor, number>>;
  iceBroken: number;
  rng: Rng;
}

export function createGameSession(level: LevelDefinition): GameSession {
  const rng = createRng(level.rngSeed ?? Date.now());
  let board = createInitialBoard(
    level.boardWidth,
    level.boardHeight,
    level.colorCount,
    level.blockedCells,
    rng,
    level.iceCells,
  );
  if (!hasValidMove(board)) {
    board = reshuffleBoard(board, rng);
  }

  return {
    level,
    board,
    movesLeft: level.moveLimit,
    score: 0,
    collectedColors: {},
    iceBroken: 0,
    rng,
  };
}

/**
 * If the session's board has no legal swap left, shuffle the existing tiles
 * into a playable arrangement. Returns the same session when playable.
 */
export function reshuffleIfStuck(session: GameSession): { session: GameSession; reshuffled: boolean } {
  if (hasValidMove(session.board)) return { session, reshuffled: false };
  return { session: { ...session, board: reshuffleBoard(session.board, session.rng) }, reshuffled: true };
}

export interface MoveOutcome {
  session: GameSession;
  result: MoveResult;
  objectives: ObjectiveProgress[];
  won: boolean;
  lost: boolean;
  stars: number;
  /** Animation playback data: the board right after the swap, then each cascade round. Null for invalid moves. */
  timeline: { swappedBoard: Board; steps: CascadeStep[] } | null;
}

export function attemptMove(session: GameSession, a: Position, b: Position): MoveOutcome {
  const valid = isValidSwap(session.board, a, b);

  if (!valid) {
    const objectives = evaluateObjectives(session.level.objectives, {
      score: session.score,
      collectedColors: session.collectedColors,
      iceBroken: session.iceBroken,
    });
    return {
      session,
      result: { valid: false, board: session.board, scoreGained: 0, cascadeCount: 0, collectedColors: {} },
      objectives,
      won: false,
      lost: false,
      stars: 0,
      timeline: null,
    };
  }

  const cellA = getCell(session.board, a);
  const cellB = getCell(session.board, b);
  const seedActivations: SeedActivation[] = [];
  if (cellA?.special) {
    seedActivations.push({ origin: b, special: cellA.special, otherColor: cellB?.color ?? null });
  }
  if (cellB?.special) {
    seedActivations.push({ origin: a, special: cellB.special, otherColor: cellA?.color ?? null });
  }

  const swappedBoard = swapCells(session.board, a, b);
  const result = resolveBoard(swappedBoard, session.level.colorCount, session.rng, seedActivations);

  const nextScore = session.score + result.scoreGained;
  const nextCollected: Partial<Record<CandyColor, number>> = { ...session.collectedColors };
  for (const [color, count] of Object.entries(result.collectedColors) as [CandyColor, number][]) {
    nextCollected[color] = (nextCollected[color] ?? 0) + count;
  }

  const nextSession: GameSession = {
    ...session,
    board: result.board,
    score: nextScore,
    collectedColors: nextCollected,
    iceBroken: session.iceBroken + result.iceBroken,
    movesLeft: session.movesLeft - 1,
  };

  const objectives = evaluateObjectives(session.level.objectives, {
    score: nextSession.score,
    collectedColors: nextSession.collectedColors,
    iceBroken: nextSession.iceBroken,
  });
  const won = allObjectivesComplete(objectives);
  const lost = !won && nextSession.movesLeft <= 0;
  const stars = won ? starsForScore(session.level, nextSession.score) : 0;

  return {
    session: nextSession,
    result: { ...result, valid: true },
    objectives,
    won,
    lost,
    stars,
    timeline: { swappedBoard, steps: result.steps },
  };
}

export function starsForScore(level: LevelDefinition, score: number): number {
  const [one, two, three] = level.starThresholds;
  if (score >= three) return 3;
  if (score >= two) return 2;
  if (score >= one) return 1;
  return 0;
}

export interface SugarCrushResult {
  session: GameSession;
  /** Board after leftover moves became striped candies, before they blast. */
  convertedBoard: Board;
  /** Cells that received a bonus striped candy. */
  converted: Position[];
  steps: CascadeStep[];
  scoreGained: number;
}

/**
 * The end-of-level bonus: every leftover move turns a random candy into a
 * striped candy, then every special on the board detonates in one grand
 * cascade. The bonus score counts toward the level's star rating.
 */
export function sugarCrush(session: GameSession): SugarCrushResult {
  const board = cloneBoard(session.board);
  const { rng } = session;

  const convertible: Position[] = [];
  for (let row = 0; row < board.height; row += 1) {
    for (let col = 0; col < board.width; col += 1) {
      const cell = board.cells[row][col];
      if (cell && !cell.special) convertible.push({ row, col });
    }
  }
  for (let i = convertible.length - 1; i > 0; i -= 1) {
    const j = rng.int(i + 1);
    [convertible[i], convertible[j]] = [convertible[j], convertible[i]];
  }

  const converted = convertible.slice(0, Math.min(session.movesLeft, convertible.length));
  for (const pos of converted) {
    const cell = getCell(board, pos)!;
    setCell(board, pos, {
      ...cell,
      special: rng.int(2) === 0 ? "striped-h" : "striped-v",
    });
  }

  const seeds: SeedActivation[] = [];
  for (let row = 0; row < board.height; row += 1) {
    for (let col = 0; col < board.width; col += 1) {
      const cell = board.cells[row][col];
      if (!cell?.special) continue;
      seeds.push({ origin: { row, col }, special: cell.special, otherColor: cell.color });
    }
  }

  const result = resolveBoard(board, session.level.colorCount, rng, seeds);

  const nextCollected: Partial<Record<CandyColor, number>> = { ...session.collectedColors };
  for (const [color, count] of Object.entries(result.collectedColors) as [CandyColor, number][]) {
    nextCollected[color] = (nextCollected[color] ?? 0) + count;
  }

  return {
    session: {
      ...session,
      board: result.board,
      score: session.score + result.scoreGained,
      collectedColors: nextCollected,
      iceBroken: session.iceBroken + result.iceBroken,
      movesLeft: 0,
    },
    convertedBoard: board,
    converted,
    steps: result.steps,
    scoreGained: result.scoreGained,
  };
}
