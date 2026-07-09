import type { Board, CandyColor, SpecialType } from "../types";
import type { Rng } from "../rng";

type CellSpec = CandyColor | null | { color: CandyColor | null; special: SpecialType };

let idCounter = 0;

/** Builds a board from a literal grid so tests can assert on exact layouts. */
export function makeBoard(
  grid: CellSpec[][],
  blockedAt: [number, number][] = [],
  iceAt: [number, number][] = [],
): Board {
  const height = grid.length;
  const width = grid[0].length;
  const blocked = Array.from({ length: height }, () => Array(width).fill(false));
  for (const [row, col] of blockedAt) blocked[row][col] = true;

  const ice = Array.from({ length: height }, () => Array(width).fill(0));
  for (const [row, col] of iceAt) ice[row][col] = 1;

  const cells = grid.map((row) =>
    row.map((spec) => {
      if (spec === null) return null;
      idCounter += 1;
      if (typeof spec === "string") {
        return { id: `test${idCounter}`, color: spec, special: null };
      }
      return { id: `test${idCounter}`, color: spec.color, special: spec.special };
    }),
  );

  return { width, height, cells, blocked, ice };
}

/**
 * A deterministic Rng that cycles through 0..max-1 on each call, so refills
 * in tests produce a predictable, non-repeating sequence of colors instead
 * of relying on a real PRNG (which could coincidentally create extra
 * cascades and make assertions flaky).
 */
export function makeSequentialRng(): Rng {
  let counter = 0;
  return {
    next: () => 0,
    int: (max: number) => {
      const value = counter % max;
      counter += 1;
      return value;
    },
  };
}
