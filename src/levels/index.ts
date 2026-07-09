import type { LevelDefinition } from "@/game-engine/types";
import { levelSchema } from "./schema";

import level001 from "./level-001.json";
import level002 from "./level-002.json";
import level003 from "./level-003.json";
import level004 from "./level-004.json";
import level005 from "./level-005.json";
import level006 from "./level-006.json";
import level007 from "./level-007.json";
import level008 from "./level-008.json";
import level009 from "./level-009.json";
import level010 from "./level-010.json";
import level011 from "./level-011.json";
import level012 from "./level-012.json";
import level013 from "./level-013.json";
import level014 from "./level-014.json";
import level015 from "./level-015.json";
import level016 from "./level-016.json";
import level017 from "./level-017.json";
import level018 from "./level-018.json";
import level019 from "./level-019.json";
import level020 from "./level-020.json";

const rawLevels = [
  level001,
  level002,
  level003,
  level004,
  level005,
  level006,
  level007,
  level008,
  level009,
  level010,
  level011,
  level012,
  level013,
  level014,
  level015,
  level016,
  level017,
  level018,
  level019,
  level020,
];

export const levels: LevelDefinition[] = rawLevels
  .map((raw) => levelSchema.parse(raw))
  .sort((a, b) => a.levelNumber - b.levelNumber);

const levelsById = new Map(levels.map((level) => [level.id, level]));

export function getLevelById(id: string): LevelDefinition | undefined {
  return levelsById.get(id);
}

export function getNextLevelId(id: string): string | undefined {
  const index = levels.findIndex((level) => level.id === id);
  if (index === -1) return undefined;
  return levels[index + 1]?.id;
}
