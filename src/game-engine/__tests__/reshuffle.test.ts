import { describe, expect, it } from "vitest";
import { hasValidMove, reshuffleBoard } from "../reshuffle";
import { findMatches } from "../match";
import { createRng } from "../rng";
import { makeBoard } from "./test-utils";

describe("hasValidMove", () => {
  it("detects an available match-making swap", () => {
    const board = makeBoard([
      ["red", "blue", "red", "red"],
      ["green", "yellow", "purple", "orange"],
    ]);
    // swapping (0,0) and (0,1) lines up red at cols 1-3
    expect(hasValidMove(board)).toBe(true);
  });

  it("reports a dead board", () => {
    // A 3x3 latin square has no swap that lines up three of a kind.
    const board = makeBoard([
      ["red", "blue", "green"],
      ["green", "red", "blue"],
      ["blue", "green", "red"],
    ]);
    expect(hasValidMove(board)).toBe(false);
  });
});

describe("reshuffleBoard", () => {
  it("turns a dead board into a playable one without pre-made matches", () => {
    const board = makeBoard([
      ["red", "blue", "green"],
      ["green", "red", "blue"],
      ["blue", "green", "red"],
    ]);
    expect(hasValidMove(board)).toBe(false);

    const shuffled = reshuffleBoard(board, createRng(7));

    expect(hasValidMove(shuffled)).toBe(true);
    expect(findMatches(shuffled)).toHaveLength(0);

    // Same multiset of tiles — only positions changed.
    const ids = (b: typeof board) =>
      b.cells.flat().filter(Boolean).map((t) => t!.id).sort();
    expect(ids(shuffled)).toEqual(ids(board));
  });
});
