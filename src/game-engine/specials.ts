import type { Board, CandyColor, Position, SpecialType } from "./types";
import { getCell, inBounds } from "./board";

/**
 * Returns the extra positions cleared when a special candy at `origin`
 * activates. `otherColor` is used by the color bomb, which has no color of
 * its own and instead clears every candy matching whatever it was swapped
 * with (or, if triggered by a cascade rather than a swap, the color of an
 * adjacent candy).
 */
export function activatePositions(
  board: Board,
  origin: Position,
  special: SpecialType,
  otherColor: CandyColor | null,
): Position[] {
  switch (special) {
    case "striped-h": {
      const positions: Position[] = [];
      for (let col = 0; col < board.width; col += 1) {
        if (!board.blocked[origin.row][col]) positions.push({ row: origin.row, col });
      }
      return positions;
    }
    case "striped-v": {
      const positions: Position[] = [];
      for (let row = 0; row < board.height; row += 1) {
        if (!board.blocked[row][origin.col]) positions.push({ row, col: origin.col });
      }
      return positions;
    }
    case "wrapped": {
      const positions: Position[] = [];
      for (let dRow = -1; dRow <= 1; dRow += 1) {
        for (let dCol = -1; dCol <= 1; dCol += 1) {
          const pos = { row: origin.row + dRow, col: origin.col + dCol };
          if (inBounds(board, pos) && !board.blocked[pos.row][pos.col]) {
            positions.push(pos);
          }
        }
      }
      return positions;
    }
    case "color-bomb": {
      if (!otherColor) return [origin];
      const positions: Position[] = [origin];
      for (let row = 0; row < board.height; row += 1) {
        for (let col = 0; col < board.width; col += 1) {
          const cell = getCell(board, { row, col });
          if (cell && cell.color === otherColor) positions.push({ row, col });
        }
      }
      return positions;
    }
    default:
      return [origin];
  }
}
