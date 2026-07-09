import { describe, expect, it } from "vitest";
import { levels, getLevelById, getNextLevelId } from "..";

describe("level catalog", () => {
  it("ships 20 valid, sequentially numbered levels", () => {
    expect(levels).toHaveLength(20);
    levels.forEach((level, i) => {
      expect(level.levelNumber).toBe(i + 1);
    });
  });

  it("every breakIce level has enough ice cells for its target", () => {
    for (const level of levels) {
      for (const objective of level.objectives) {
        if (objective.type === "breakIce") {
          expect(level.iceCells.length).toBeGreaterThanOrEqual(objective.target);
        }
      }
    }
  });

  it("navigates between levels by id", () => {
    expect(getLevelById("level-001")?.name).toBe("Thimphu Sweets");
    expect(getNextLevelId("level-001")).toBe("level-002");
    expect(getNextLevelId("level-020")).toBeUndefined();
  });
});
