import { describe, expect, it } from "vitest";
import { allObjectivesComplete, evaluateObjectives } from "../objectives";

describe("evaluateObjectives", () => {
  it("marks a scoreTarget objective complete once the score is reached", () => {
    const progress = evaluateObjectives([{ type: "scoreTarget", target: 100 }], {
      score: 120,
      collectedColors: {},
      iceBroken: 0,
    });
    expect(progress[0].complete).toBe(true);
    expect(progress[0].current).toBe(120);
  });

  it("tracks collectColor progress against the collected tally", () => {
    const progress = evaluateObjectives(
      [{ type: "collectColor", target: 10, color: "red" }],
      { score: 0, collectedColors: { red: 4, blue: 9 }, iceBroken: 0 },
    );
    expect(progress[0].current).toBe(4);
    expect(progress[0].complete).toBe(false);
  });

  it("allObjectivesComplete requires every objective to be met", () => {
    const progress = evaluateObjectives(
      [
        { type: "scoreTarget", target: 10 },
        { type: "collectColor", target: 10, color: "blue" },
      ],
      { score: 50, collectedColors: { blue: 2 }, iceBroken: 0 },
    );
    expect(allObjectivesComplete(progress)).toBe(false);
  });
});
