import { describe, expect, it } from "vitest";
import { resolveBoard } from "../resolve";
import { evaluateObjectives } from "../objectives";
import { makeBoard, makeSequentialRng } from "./test-utils";

describe("ice breaking", () => {
  it("breaks one ice layer when a match clears on an iced cell", () => {
    const board = makeBoard(
      [["red", "red", "red", "blue"]],
      [],
      [[0, 1]],
    );

    const result = resolveBoard(board, 3, makeSequentialRng());

    expect(result.iceBroken).toBe(1);
    expect(result.board.ice[0][1]).toBe(0);
    expect(result.steps[0].iceBroken).toEqual([{ row: 0, col: 1 }]);
  });

  it("leaves ice intact on cells outside the match", () => {
    const board = makeBoard(
      [["red", "red", "red", "blue"]],
      [],
      [[0, 3]],
    );

    const result = resolveBoard(board, 3, makeSequentialRng());

    expect(result.iceBroken).toBe(0);
    expect(result.board.ice[0][3]).toBe(1);
  });

  it("ice state carries through cascade snapshots", () => {
    const board = makeBoard(
      [["red", "red", "red", "blue"]],
      [],
      [[0, 0]],
    );

    const result = resolveBoard(board, 3, makeSequentialRng());

    expect(result.steps[0].cleared.ice[0][0]).toBe(0);
    expect(result.steps[0].settled.ice[0][0]).toBe(0);
  });
});

describe("breakIce objective", () => {
  it("tracks broken ice against the target", () => {
    const progress = evaluateObjectives([{ type: "breakIce", target: 4 }], {
      score: 0,
      collectedColors: {},
      iceBroken: 3,
    });
    expect(progress[0].current).toBe(3);
    expect(progress[0].complete).toBe(false);
  });

  it("completes once enough ice is broken", () => {
    const progress = evaluateObjectives([{ type: "breakIce", target: 4 }], {
      score: 0,
      collectedColors: {},
      iceBroken: 4,
    });
    expect(progress[0].complete).toBe(true);
  });
});
