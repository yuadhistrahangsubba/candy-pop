import { cloneBoard, getCell, isAdjacent, setCell } from "./board";
import { findMatches } from "./match";
import type { Board, Position } from "./types";

/**
 * A swap is legal if the two cells are adjacent and either produces a match,
 * or either tile is a special candy (swapping a special always activates it,
 * independent of whether a color match forms).
 */
export function isValidSwap(board: Board, a: Position, b: Position): boolean {
  if (!isAdjacent(a, b)) return false;

  const cellA = getCell(board, a);
  const cellB = getCell(board, b);
  if (!cellA || !cellB) return false;

  if (cellA.special || cellB.special) return true;

  const trial = cloneBoard(board);
  setCell(trial, a, cellB);
  setCell(trial, b, cellA);
  return findMatches(trial).length > 0;
}

export function swapCells(board: Board, a: Position, b: Position): Board {
  const next = cloneBoard(board);
  const cellA = getCell(board, a);
  const cellB = getCell(board, b);
  setCell(next, a, cellB);
  setCell(next, b, cellA);
  return next;
}
