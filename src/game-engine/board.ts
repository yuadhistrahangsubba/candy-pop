import { CANDY_COLORS, type Board, type Cell, type Position } from "./types";
import type { Rng } from "./rng";

let tileIdCounter = 0;

function nextTileId(): string {
  tileIdCounter += 1;
  return `t${tileIdCounter}`;
}

/** Exposed for tests that need deterministic tile ids across runs. */
export function resetTileIdCounter(): void {
  tileIdCounter = 0;
}

function randomColor(rng: Rng, colorCount: number) {
  const palette = CANDY_COLORS.slice(0, colorCount);
  return palette[rng.int(palette.length)];
}

export function inBounds(board: Board, pos: Position): boolean {
  return (
    pos.row >= 0 && pos.row < board.height && pos.col >= 0 && pos.col < board.width
  );
}

export function isAdjacent(a: Position, b: Position): boolean {
  const dRow = Math.abs(a.row - b.row);
  const dCol = Math.abs(a.col - b.col);
  return dRow + dCol === 1;
}

export function cloneBoard(board: Board): Board {
  return {
    width: board.width,
    height: board.height,
    blocked: board.blocked.map((row) => [...row]),
    cells: board.cells.map((row) => [...row]),
    ice: board.ice.map((row) => [...row]),
  };
}

export function getCell(board: Board, pos: Position): Cell {
  return board.cells[pos.row][pos.col];
}

export function setCell(board: Board, pos: Position, cell: Cell): void {
  board.cells[pos.row][pos.col] = cell;
}

/**
 * Builds a board with no pre-existing matches, so every level starts in a
 * playable state.
 */
export function createInitialBoard(
  width: number,
  height: number,
  colorCount: number,
  blockedCells: Position[],
  rng: Rng,
  iceCells: Position[] = [],
): Board {
  const blocked = Array.from({ length: height }, () => Array(width).fill(false));
  for (const pos of blockedCells) {
    blocked[pos.row][pos.col] = true;
  }

  const ice = Array.from({ length: height }, () => Array(width).fill(0));
  for (const pos of iceCells) {
    if (!blocked[pos.row][pos.col]) ice[pos.row][pos.col] = 1;
  }

  const cells: Cell[][] = Array.from({ length: height }, () => Array(width).fill(null));

  for (let row = 0; row < height; row += 1) {
    for (let col = 0; col < width; col += 1) {
      if (blocked[row][col]) continue;

      let color = randomColor(rng, colorCount);
      // Avoid spawning an immediate 3-in-a-row so the board starts stable.
      let guard = 0;
      while (guard < 20 && createsImmediateRun(cells, row, col, color)) {
        color = randomColor(rng, colorCount);
        guard += 1;
      }

      cells[row][col] = { id: nextTileId(), color, special: null };
    }
  }

  return { width, height, cells, blocked, ice };
}

function createsImmediateRun(
  cells: Cell[][],
  row: number,
  col: number,
  color: string,
): boolean {
  const left1 = cells[row]?.[col - 1];
  const left2 = cells[row]?.[col - 2];
  if (left1?.color === color && left2?.color === color) return true;

  const up1 = cells[row - 1]?.[col];
  const up2 = cells[row - 2]?.[col];
  if (up1?.color === color && up2?.color === color) return true;

  return false;
}

/** Compacts each column downward, leaving `null` gaps at the top. */
export function applyGravity(board: Board): Board {
  const next = cloneBoard(board);

  for (let col = 0; col < board.width; col += 1) {
    const stack: Cell[] = [];
    for (let row = board.height - 1; row >= 0; row -= 1) {
      if (next.blocked[row][col]) continue;
      const cell = next.cells[row][col];
      if (cell) stack.push(cell);
    }

    let stackIndex = 0;
    for (let row = board.height - 1; row >= 0; row -= 1) {
      if (next.blocked[row][col]) continue;
      next.cells[row][col] = stack[stackIndex] ?? null;
      stackIndex += 1;
    }
  }

  return next;
}

/** Fills any empty, non-blocked cells with fresh random candies. */
export function refillBoard(board: Board, colorCount: number, rng: Rng): Board {
  const next = cloneBoard(board);

  for (let row = 0; row < board.height; row += 1) {
    for (let col = 0; col < board.width; col += 1) {
      if (next.blocked[row][col]) continue;
      if (next.cells[row][col]) continue;
      next.cells[row][col] = {
        id: nextTileId(),
        color: randomColor(rng, colorCount),
        special: null,
      };
    }
  }

  return next;
}

export function boardHasEmptyPlayableCell(board: Board): boolean {
  for (let row = 0; row < board.height; row += 1) {
    for (let col = 0; col < board.width; col += 1) {
      if (!board.blocked[row][col] && !board.cells[row][col]) return true;
    }
  }
  return false;
}
