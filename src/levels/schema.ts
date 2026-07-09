import { z } from "zod";
import { CANDY_COLORS } from "@/game-engine/types";

const positionSchema = z.object({
  row: z.number().int().min(0),
  col: z.number().int().min(0),
});

const objectiveSchema = z.object({
  type: z.enum(["scoreTarget", "collectColor", "breakIce"]),
  target: z.number().int().positive(),
  color: z.enum(CANDY_COLORS).optional(),
});

export const levelSchema = z
  .object({
    id: z.string(),
    levelNumber: z.number().int().positive(),
    name: z.string(),
    boardWidth: z.number().int().min(3).max(12),
    boardHeight: z.number().int().min(3).max(12),
    colorCount: z.number().int().min(3).max(CANDY_COLORS.length),
    blockedCells: z.array(positionSchema).default([]),
    iceCells: z.array(positionSchema).default([]),
    moveLimit: z.number().int().positive(),
    objectives: z.array(objectiveSchema).min(1),
    starThresholds: z.tuple([z.number().int(), z.number().int(), z.number().int()]),
    rngSeed: z.number().int().optional(),
  })
  .superRefine((level, ctx) => {
    for (const cell of [...level.blockedCells, ...level.iceCells]) {
      if (cell.row >= level.boardHeight || cell.col >= level.boardWidth) {
        ctx.addIssue({
          code: "custom",
          message: `cell (${cell.row},${cell.col}) is outside the ${level.boardWidth}x${level.boardHeight} board`,
        });
      }
    }
    for (const objective of level.objectives) {
      if (objective.type === "collectColor" && !objective.color) {
        ctx.addIssue({ code: "custom", message: "collectColor objectives require a color" });
      }
      if (objective.type === "breakIce" && objective.target > level.iceCells.length) {
        ctx.addIssue({
          code: "custom",
          message: `breakIce target ${objective.target} exceeds the ${level.iceCells.length} ice cells on the board`,
        });
      }
    }
    const [one, two, three] = level.starThresholds;
    if (!(one < two && two < three)) {
      ctx.addIssue({ code: "custom", message: "starThresholds must be strictly increasing" });
    }
  });

export type LevelJson = z.infer<typeof levelSchema>;
