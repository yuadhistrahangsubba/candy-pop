import type { Board, CandyColor, MatchGroup, Position } from "./types";
import { getCell } from "./board";

interface Run {
  color: CandyColor;
  positions: Position[];
  orientation: "horizontal" | "vertical";
}

function findRuns(board: Board): Run[] {
  const runs: Run[] = [];

  for (let row = 0; row < board.height; row += 1) {
    let run: Position[] = [];
    let runColor: CandyColor | null = null;

    const flush = () => {
      if (runColor && run.length >= 3) {
        runs.push({ color: runColor, positions: run, orientation: "horizontal" });
      }
      run = [];
      runColor = null;
    };

    for (let col = 0; col < board.width; col += 1) {
      const cell = getCell(board, { row, col });
      const color = cell && !cell.special ? cell.color : null;
      if (color && color === runColor) {
        run.push({ row, col });
      } else {
        flush();
        if (color) {
          runColor = color;
          run = [{ row, col }];
        }
      }
    }
    flush();
  }

  for (let col = 0; col < board.width; col += 1) {
    let run: Position[] = [];
    let runColor: CandyColor | null = null;

    const flush = () => {
      if (runColor && run.length >= 3) {
        runs.push({ color: runColor, positions: run, orientation: "vertical" });
      }
      run = [];
      runColor = null;
    };

    for (let row = 0; row < board.height; row += 1) {
      const cell = getCell(board, { row, col });
      const color = cell && !cell.special ? cell.color : null;
      if (color && color === runColor) {
        run.push({ row, col });
      } else {
        flush();
        if (color) {
          runColor = color;
          run = [{ row, col }];
        }
      }
    }
    flush();
  }

  return runs;
}

function posKey(pos: Position): string {
  return `${pos.row},${pos.col}`;
}

/**
 * Merges overlapping runs (a horizontal and vertical run sharing a cell)
 * into a single match group so L/T shapes are treated as one match rather
 * than two, and detects the special candy each group creates.
 *
 * Special-creation convention: a pure line of 4 becomes a striped candy
 * that clears its own row (from a horizontal match) or column (from a
 * vertical match); a pure line of 5+ becomes a color bomb; any group that
 * combines a horizontal and vertical run (L/T shape) becomes a wrapped
 * candy, regardless of size.
 */
export function findMatches(board: Board): MatchGroup[] {
  const runs = findRuns(board);
  if (runs.length === 0) return [];

  const groups: Run[][] = [];
  const assigned = new Map<Run, number>();

  for (const run of runs) {
    const overlapping = new Set<number>();
    for (const pos of run.positions) {
      for (const [otherRun, groupIndex] of assigned) {
        if (otherRun === run) continue;
        if (otherRun.positions.some((p) => posKey(p) === posKey(pos))) {
          overlapping.add(groupIndex);
        }
      }
    }

    if (overlapping.size === 0) {
      const groupIndex = groups.length;
      groups.push([run]);
      assigned.set(run, groupIndex);
    } else {
      const [firstIndex, ...rest] = [...overlapping];
      groups[firstIndex].push(run);
      assigned.set(run, firstIndex);
      for (const idx of rest) {
        groups[firstIndex].push(...groups[idx]);
        groups[idx] = [];
      }
    }
  }

  return groups
    .filter((group) => group.length > 0)
    .map((group) => buildMatchGroup(group));
}

function buildMatchGroup(runs: Run[]): MatchGroup {
  const positionMap = new Map<string, Position>();
  for (const run of runs) {
    for (const pos of run.positions) {
      positionMap.set(posKey(pos), pos);
    }
  }
  const positions = [...positionMap.values()];
  const color = runs[0].color;

  const hasHorizontal = runs.some((r) => r.orientation === "horizontal");
  const hasVertical = runs.some((r) => r.orientation === "vertical");
  const longestRun = runs.reduce((max, r) => Math.max(max, r.positions.length), 0);

  let createsSpecial: MatchGroup["createsSpecial"] = null;
  let specialOrigin = positions[Math.floor(positions.length / 2)];

  if (hasHorizontal && hasVertical) {
    createsSpecial = "wrapped";
    const center = runs.find((r) => r.orientation === "horizontal" && r.positions.length >= 3);
    const intersection = center?.positions.find((p) =>
      runs.some((r) => r.orientation === "vertical" && r.positions.some((v) => posKey(v) === posKey(p))),
    );
    if (intersection) specialOrigin = intersection;
  } else if (longestRun >= 5) {
    createsSpecial = "color-bomb";
    const run = runs.find((r) => r.positions.length === longestRun);
    if (run) specialOrigin = run.positions[Math.floor(run.positions.length / 2)];
  } else if (longestRun === 4) {
    const run = runs[0];
    createsSpecial = run.orientation === "horizontal" ? "striped-h" : "striped-v";
    specialOrigin = run.positions[Math.floor(run.positions.length / 2)];
  }

  return { positions, color, createsSpecial, specialOrigin };
}
