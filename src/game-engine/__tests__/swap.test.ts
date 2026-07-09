import { describe, expect, it } from "vitest";
import { isValidSwap } from "../swap";
import { makeBoard } from "./test-utils";

describe("isValidSwap", () => {
  it("rejects non-adjacent swaps", () => {
    const board = makeBoard([
      ["red", "blue", "green"],
      ["yellow", "purple", "orange"],
    ]);
    expect(isValidSwap(board, { row: 0, col: 0 }, { row: 1, col: 2 })).toBe(false);
  });

  it("rejects an adjacent swap that creates no match", () => {
    const board = makeBoard([
      ["red", "blue", "green"],
      ["yellow", "purple", "orange"],
    ]);
    expect(isValidSwap(board, { row: 0, col: 0 }, { row: 0, col: 1 })).toBe(false);
  });

  it("accepts an adjacent swap that creates a match", () => {
    const board = makeBoard([
      ["red", "red", "blue"],
      ["yellow", "purple", "red"],
    ]);
    // swapping (1,2) red up into (0,2) completes a horizontal red run
    expect(isValidSwap(board, { row: 0, col: 2 }, { row: 1, col: 2 })).toBe(true);
  });

  it("always accepts a swap involving a special candy", () => {
    const board = makeBoard([
      [{ color: "red", special: "striped-h" }, "blue"],
      ["yellow", "purple"],
    ]);
    expect(isValidSwap(board, { row: 0, col: 0 }, { row: 0, col: 1 })).toBe(true);
  });
});
