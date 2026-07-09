"use client";

import { motion } from "motion/react";
import type { ObjectiveProgress } from "@/game-engine/types";
import { CANDY_STYLE } from "./candyStyles";

interface HudProps {
  levelName: string;
  movesLeft: number;
  score: number;
  objectives: ObjectiveProgress[];
}

function objectiveLabel(progress: ObjectiveProgress): string {
  const { objective } = progress;
  if (objective.type === "scoreTarget") return `${progress.current}/${objective.target} pts`;
  if (objective.type === "breakIce") return `❄ ${progress.current}/${objective.target}`;
  return `${progress.current}/${objective.target}`;
}

export function Hud({ levelName, movesLeft, score, objectives }: HudProps) {
  const lowMoves = movesLeft <= 5;

  return (
    <div className="mx-auto mb-4 w-full max-w-md">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="font-display text-xl font-semibold">{levelName}</h1>
        <motion.div
          animate={lowMoves ? { scale: [1, 1.08, 1] } : { scale: 1 }}
          transition={lowMoves ? { duration: 0.9, repeat: Infinity } : {}}
          className={`font-display flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-bold shadow-sm ${
            lowMoves
              ? "bg-primary text-primary-foreground shadow-primary/40"
              : "bg-card/80 text-foreground backdrop-blur"
          }`}
        >
          <span className={lowMoves ? "" : "opacity-70"}>MOVES</span>
          <span className="text-base tabular-nums">{movesLeft}</span>
        </motion.div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <motion.div
          key={score}
          initial={{ scale: 1.18 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 22 }}
          className="font-display rounded-full bg-card/80 px-4 py-1.5 text-sm font-bold tabular-nums shadow-sm backdrop-blur"
        >
          {score.toLocaleString()}
        </motion.div>

        <div className="flex flex-wrap justify-end gap-2">
          {objectives.map((progress, i) => {
            const color =
              progress.objective.type === "collectColor" && progress.objective.color
                ? CANDY_STYLE[progress.objective.color].solid
                : null;
            return (
              <motion.span
                key={i}
                animate={progress.complete ? { scale: [1, 1.15, 1] } : {}}
                transition={{ duration: 0.4 }}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold shadow-sm backdrop-blur ${
                  progress.complete
                    ? "bg-accent text-accent-foreground"
                    : "bg-card/80 text-foreground"
                }`}
              >
                {color && (
                  <span
                    className="inline-block size-3 rounded-full"
                    style={{ background: color, boxShadow: `0 1px 3px ${color}88` }}
                  />
                )}
                {progress.complete ? "✓ " : ""}
                {objectiveLabel(progress)}
              </motion.span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
