import { describe, expect, it } from "vitest";
import { sugarCrush, type GameSession } from "../engine";
import { createRng } from "../rng";
import { makeBoard } from "./test-utils";
import type { LevelDefinition } from "../types";

function makeLevel(overrides: Partial<LevelDefinition> = {}): LevelDefinition {
  return {
    id: "test",
    levelNumber: 1,
    name: "Test Level",
    boardWidth: 4,
    boardHeight: 4,
    colorCount: 4,
    blockedCells: [],
    iceCells: [],
    moveLimit: 10,
    objectives: [{ type: "scoreTarget", target: 20 }],
    starThresholds: [100, 500, 900],
    ...overrides,
  };
}

function makeSession(movesLeft: number): GameSession {
  return {
    level: makeLevel(),
    board: makeBoard([
      ["red", "blue", "green", "yellow"],
      ["blue", "green", "yellow", "red"],
      ["green", "yellow", "red", "blue"],
      ["yellow", "red", "blue", "green"],
    ]),
    movesLeft,
    score: 200,
    collectedColors: {},
    iceBroken: 0,
    rng: createRng(3),
  };
}

describe("sugarCrush", () => {
  it("converts one candy per leftover move into a striped candy", () => {
    const result = sugarCrush(makeSession(3));

    expect(result.converted).toHaveLength(3);
    for (const pos of result.converted) {
      const cell = result.convertedBoard.cells[pos.row][pos.col];
      expect(["striped-h", "striped-v"]).toContain(cell?.special);
    }
  });

  it("detonates the specials, adding bonus score and consuming all moves", () => {
    const result = sugarCrush(makeSession(3));

    expect(result.scoreGained).toBeGreaterThan(0);
    expect(result.session.score).toBe(200 + result.scoreGained);
    expect(result.session.movesLeft).toBe(0);
    expect(result.steps.length).toBeGreaterThan(0);

    // Board ends full again after the blast.
    for (const row of result.session.board.cells) {
      for (const cell of row) {
        expect(cell).not.toBeNull();
      }
    }
  });

  it("caps conversions at the number of normal candies available", () => {
    const result = sugarCrush(makeSession(99));
    expect(result.converted.length).toBeLessThanOrEqual(16);
    expect(result.converted.length).toBeGreaterThan(0);
  });
});
