import { describe, expect, it } from "vitest";
import { findMatches } from "../match";
import { makeBoard } from "./test-utils";

describe("findMatches", () => {
  it("finds a horizontal run of 3", () => {
    const board = makeBoard([
      ["red", "red", "red", "blue"],
      ["blue", "green", "yellow", "purple"],
    ]);
    const matches = findMatches(board);
    expect(matches).toHaveLength(1);
    expect(matches[0].positions).toHaveLength(3);
    expect(matches[0].color).toBe("red");
    expect(matches[0].createsSpecial).toBeNull();
  });

  it("finds a vertical run of 3", () => {
    const board = makeBoard([
      ["red", "blue"],
      ["green", "blue"],
      ["yellow", "blue"],
    ]);
    const matches = findMatches(board);
    expect(matches).toHaveLength(1);
    expect(matches[0].color).toBe("blue");
  });

  it("ignores runs shorter than 3", () => {
    const board = makeBoard([["red", "red", "blue", "green"]]);
    expect(findMatches(board)).toHaveLength(0);
  });

  it("merges an overlapping horizontal + vertical run into one L-shaped group and creates a wrapped candy", () => {
    const board = makeBoard([
      ["red", "green", "blue"],
      ["red", "yellow", "purple"],
      ["red", "red", "red"],
    ]);
    const matches = findMatches(board);
    expect(matches).toHaveLength(1);
    expect(matches[0].positions.length).toBeGreaterThanOrEqual(5);
    expect(matches[0].createsSpecial).toBe("wrapped");
  });

  it("creates a horizontal striped candy from a line of 4", () => {
    const board = makeBoard([["red", "red", "red", "red", "blue"]]);
    const matches = findMatches(board);
    expect(matches).toHaveLength(1);
    expect(matches[0].createsSpecial).toBe("striped-h");
  });

  it("creates a vertical striped candy from a line of 4", () => {
    const board = makeBoard([["red"], ["red"], ["red"], ["red"], ["blue"]]);
    const matches = findMatches(board);
    expect(matches[0].createsSpecial).toBe("striped-v");
  });

  it("creates a color bomb from a line of 5", () => {
    const board = makeBoard([["red", "red", "red", "red", "red"]]);
    const matches = findMatches(board);
    expect(matches[0].createsSpecial).toBe("color-bomb");
  });

  it("does not match across a blocked (tile-less) cell", () => {
    const board = makeBoard(
      [["red", null, "red"]],
      [[0, 1]],
    );
    // the blocked cell has no tile, so the run is broken into two runs of length 1
    expect(findMatches(board)).toHaveLength(0);
  });

  it("does not treat existing special candies as part of a color run", () => {
    const board = makeBoard([
      ["red", { color: "red", special: "striped-h" }, "red", "red"],
    ]);
    expect(findMatches(board)).toHaveLength(0);
  });
});
