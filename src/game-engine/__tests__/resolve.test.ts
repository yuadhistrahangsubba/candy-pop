import { describe, expect, it } from "vitest";
import { resolveBoard } from "../resolve";
import { makeBoard, makeSequentialRng } from "./test-utils";

describe("resolveBoard", () => {
  it("clears a single match and refills with no further cascade", () => {
    const board = makeBoard([["red", "red", "red", "blue"]]);
    const result = resolveBoard(board, 3, makeSequentialRng());

    expect(result.tilesCleared).toBe(3);
    expect(result.cascadeCount).toBe(1);
    expect(result.scoreGained).toBe(30); // 3 tiles * 10 * multiplier(0)=1
    expect(result.collectedColors.red).toBe(3);

    // no cell should be left empty after gravity + refill
    for (const cell of result.board.cells[0]) {
      expect(cell).not.toBeNull();
    }
  });

  it("chains a second cascade when gravity/refill produces a new match", () => {
    // Bottom row starts as a match; clearing it lets the two columns above
    // fall, and the sequential refill deterministically completes a second,
    // vertical match in column 0.
    const board = makeBoard([
      ["red", "green", "yellow"],
      ["red", "purple", "orange"],
      ["blue", "blue", "blue"],
    ]);

    const result = resolveBoard(board, 6, makeSequentialRng());

    expect(result.cascadeCount).toBe(2);
    expect(result.tilesCleared).toBe(6);
    // first cascade: 3 * 10 * 1 = 30; second: 3 * 10 * 1.5 = 45
    expect(result.scoreGained).toBe(75);
    expect(result.collectedColors.blue).toBe(3);
    expect(result.collectedColors.red).toBe(3);
  });

  it("applies a seeded special activation even without a color match", () => {
    const board = makeBoard([
      ["red", { color: "green", special: "striped-h" }, "blue", "yellow"],
    ]);

    const result = resolveBoard(board, 4, makeSequentialRng(), [
      { origin: { row: 0, col: 1 }, special: "striped-h", otherColor: null },
    ]);

    expect(result.tilesCleared).toBe(4);
    expect(result.cascadeCount).toBe(1);
    expect(result.scoreGained).toBe(40); // 4 tiles * 10 * multiplier(0)=1
  });

  it("reports activated specials on the step for VFX playback", () => {
    const board = makeBoard([
      ["red", { color: "green", special: "striped-h" }, "blue", "yellow"],
    ]);

    const result = resolveBoard(board, 4, makeSequentialRng(), [
      { origin: { row: 0, col: 1 }, special: "striped-h", otherColor: null },
    ]);

    expect(result.steps[0].specials).toEqual([
      { pos: { row: 0, col: 1 }, special: "striped-h", color: "green" },
    ]);
  });

  it("reports chain-activated specials swept up by a match", () => {
    // The red match clears col 0-2 of row 0; the striped-v at (0,2) is part
    // of the row... place striped candy adjacent so the row clear sweeps it.
    const board = makeBoard([
      ["red", "red", "red", { color: "blue", special: "striped-v" }],
      ["green", "yellow", "green", "yellow"],
    ]);

    const result = resolveBoard(board, 4, makeSequentialRng(), [
      { origin: { row: 0, col: 0 }, special: "striped-h", otherColor: null },
    ]);

    // The seeded row blast clears row 0 including the striped-v, which
    // chain-activates and must be reported for VFX.
    const kinds = result.steps[0].specials.map((sp) => sp.special).sort();
    expect(kinds).toEqual(["striped-h", "striped-v"]);
  });

  it("clears every candy of the swapped color when a color bomb activates", () => {
    const board = makeBoard([
      ["red", { color: null, special: "color-bomb" }, "blue", "red"],
    ]);

    const result = resolveBoard(board, 4, makeSequentialRng(), [
      { origin: { row: 0, col: 1 }, special: "color-bomb", otherColor: "red" },
    ]);

    // origin + both red tiles = 3 cleared; the blue tile is untouched and
    // survives into the final board.
    expect(result.tilesCleared).toBe(3);
    expect(result.board.cells[0][2]?.color).toBe("blue");
  });
});
