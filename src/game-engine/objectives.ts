import type { CandyColor, Objective, ObjectiveProgress } from "./types";

export interface ObjectiveTally {
  score: number;
  collectedColors: Partial<Record<CandyColor, number>>;
  iceBroken: number;
}

type Evaluator = (objective: Objective, tally: ObjectiveTally) => number;

const evaluators: Record<Objective["type"], Evaluator> = {
  scoreTarget: (_objective, tally) => tally.score,
  collectColor: (objective, tally) =>
    objective.color ? (tally.collectedColors[objective.color] ?? 0) : 0,
  breakIce: (_objective, tally) => tally.iceBroken,
};

export function evaluateObjectives(
  objectives: Objective[],
  tally: ObjectiveTally,
): ObjectiveProgress[] {
  return objectives.map((objective) => {
    const current = evaluators[objective.type](objective, tally);
    return { objective, current, complete: current >= objective.target };
  });
}

export function allObjectivesComplete(progress: ObjectiveProgress[]): boolean {
  return progress.every((p) => p.complete);
}
