import { describe, expect, it } from "vitest";
import { applyGravity, createInitialBoard, refillBoard } from "../board";
import { findMatches } from "../match";
import { createRng } from "../rng";
import { makeBoard } from "./test-utils";

describe("createInitialBoard", () => {
  it("never spawns with an immediate match", () => {
    for (let seed = 0; seed < 20; seed += 1) {
      const rng = createRng(seed);
      const board = createInitialBoard(8, 8, 5, [], rng);
      expect(findMatches(board)).toHaveLength(0);
    }
  });

  it("leaves blocked cells empty", () => {
    const rng = createRng(1);
    const board = createInitialBoard(4, 4, 5, [{ row: 1, col: 1 }], rng);
    expect(board.cells[1][1]).toBeNull();
    expect(board.blocked[1][1]).toBe(true);
  });
});

describe("applyGravity", () => {
  it("compacts a column downward, leaving gaps at the top", () => {
    const board = makeBoard([
      ["red", null, null],
      [null, "blue", null],
      ["green", null, "yellow"],
    ]);

    const result = applyGravity(board);

    expect(result.cells[2][0]?.color).toBe("green");
    expect(result.cells[1][0]?.color).toBe("red");
    expect(result.cells[0][0]).toBeNull();

    expect(result.cells[2][1]?.color).toBe("blue");
    expect(result.cells[1][1]).toBeNull();
    expect(result.cells[0][1]).toBeNull();
  });

  it("does not move tiles into or out of blocked cells", () => {
    const board = makeBoard(
      [
        ["red", null],
        [null, null],
      ],
      [[1, 0]],
    );
    const result = applyGravity(board);
    expect(result.cells[1][0]).toBeNull();
    expect(result.cells[0][0]?.color).toBe("red");
  });
});

describe("refillBoard", () => {
  it("fills every empty non-blocked cell and leaves blocked cells empty", () => {
    const board = makeBoard(
      [
        [null, null],
        [null, null],
      ],
      [[0, 0]],
    );
    const rng = createRng(42);
    const result = refillBoard(board, 6, rng);

    expect(result.cells[0][0]).toBeNull();
    expect(result.cells[0][1]).not.toBeNull();
    expect(result.cells[1][0]).not.toBeNull();
    expect(result.cells[1][1]).not.toBeNull();
  });
});
