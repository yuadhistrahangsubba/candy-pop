import { describe, expect, it } from "vitest";
import { attemptMove, starsForScore } from "../engine";
import { createRng } from "../rng";
import { makeBoard } from "./test-utils";
import type { GameSession } from "../engine";
import type { LevelDefinition } from "../types";

function makeLevel(overrides: Partial<LevelDefinition> = {}): LevelDefinition {
  return {
    id: "test",
    levelNumber: 1,
    name: "Test Level",
    boardWidth: 4,
    boardHeight: 1,
    colorCount: 3,
    blockedCells: [],
    iceCells: [],
    moveLimit: 5,
    objectives: [{ type: "scoreTarget", target: 20 }],
    starThresholds: [10, 20, 30],
    ...overrides,
  };
}

describe("attemptMove", () => {
  it("leaves the session untouched on an invalid swap", () => {
    const level = makeLevel();
    const session: GameSession = {
      level,
      board: makeBoard([["red", "blue", "green", "yellow"]]),
      movesLeft: 5,
      score: 0,
      collectedColors: {},
      iceBroken: 0,
      rng: createRng(1),
    };

    const outcome = attemptMove(session, { row: 0, col: 0 }, { row: 0, col: 1 });

    expect(outcome.result.valid).toBe(false);
    expect(outcome.session.movesLeft).toBe(5);
    expect(outcome.session.score).toBe(0);
  });

  it("consumes a move and gains score on a valid swap", () => {
    const level = makeLevel();
    const session: GameSession = {
      level,
      // swapping (0,0) and (0,1) produces red,red,red at cols 1-3
      board: makeBoard([["red", "blue", "red", "red"]]),
      movesLeft: 5,
      score: 0,
      collectedColors: {},
      iceBroken: 0,
      rng: createRng(1),
    };

    const outcome = attemptMove(session, { row: 0, col: 0 }, { row: 0, col: 1 });

    expect(outcome.result.valid).toBe(true);
    expect(outcome.session.movesLeft).toBe(4);
    expect(outcome.session.score).toBeGreaterThan(0);
    expect(outcome.objectives[0].current).toBe(outcome.session.score);
  });

  it("reports lost once moves run out without meeting the objective", () => {
    const level = makeLevel({ moveLimit: 1, objectives: [{ type: "scoreTarget", target: 1_000_000 }] });
    const session: GameSession = {
      level,
      board: makeBoard([["red", "blue", "red", "red"]]),
      movesLeft: 1,
      score: 0,
      collectedColors: {},
      iceBroken: 0,
      rng: createRng(1),
    };

    const outcome = attemptMove(session, { row: 0, col: 0 }, { row: 0, col: 1 });

    expect(outcome.session.movesLeft).toBe(0);
    expect(outcome.won).toBe(false);
    expect(outcome.lost).toBe(true);
  });
});

describe("starsForScore", () => {
  it("awards stars based on the level's thresholds", () => {
    const level = makeLevel({ starThresholds: [10, 20, 30] });
    expect(starsForScore(level, 5)).toBe(0);
    expect(starsForScore(level, 10)).toBe(1);
    expect(starsForScore(level, 25)).toBe(2);
    expect(starsForScore(level, 30)).toBe(3);
  });
});
