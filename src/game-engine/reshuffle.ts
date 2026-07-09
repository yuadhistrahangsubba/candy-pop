import type { Board, Position, Tile } from "./types";
import { cloneBoard, getCell, setCell } from "./board";
import { isValidSwap } from "./swap";
import { findMatches } from "./match";
import type { Rng } from "./rng";

/** True if at least one legal swap exists anywhere on the board. */
export function hasValidMove(board: Board): boolean {
  for (let row = 0; row < board.height; row += 1) {
    for (let col = 0; col < board.width; col += 1) {
      const here: Position = { row, col };
      if (!getCell(board, here)) continue;
      const right: Position = { row, col: col + 1 };
      const down: Position = { row: row + 1, col };
      if (col + 1 < board.width && getCell(board, right) && isValidSwap(board, here, right)) return true;
      if (row + 1 < board.height && getCell(board, down) && isValidSwap(board, here, down)) return true;
    }
  }
  return false;
}

/**
 * Shuffles the existing tiles into new positions until the board has at
 * least one valid move and no pre-made matches. Tile identities (and any
 * special candies and ice state) are preserved — only positions change, the
 * classic "no more moves — reshuffling" behaviour.
 */
export function reshuffleBoard(board: Board, rng: Rng): Board {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const next = cloneBoard(board);
    const tiles: Tile[] = [];
    const slots: Position[] = [];
    for (let row = 0; row < board.height; row += 1) {
      for (let col = 0; col < board.width; col += 1) {
        const cell = next.cells[row][col];
        if (cell) {
          tiles.push(cell);
          slots.push({ row, col });
        }
      }
    }

    // Fisher–Yates with the injected RNG so reshuffles stay deterministic
    // for a seeded session.
    for (let i = tiles.length - 1; i > 0; i -= 1) {
      const j = rng.int(i + 1);
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }
    slots.forEach((slot, i) => setCell(next, slot, tiles[i]));

    if (findMatches(next).length === 0 && hasValidMove(next)) return next;
  }

  // Board too constrained to shuffle cleanly (tiny boards) — return as-is
  // rather than loop forever; the caller keeps the original board.
  return board;
}
