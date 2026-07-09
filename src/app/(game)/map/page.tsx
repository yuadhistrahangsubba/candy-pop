"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { levels } from "@/levels";
import { usePlayerStore } from "@/stores/playerStore";
import { CANDY_STYLE } from "@/components/game/candyStyles";
import { DriftingClouds, FallingPetals, PrayerFlags } from "@/components/decor/BhutanAtmosphere";
import type { CandyColor } from "@/game-engine/types";

const NODE_COLORS: CandyColor[] = ["red", "blue", "green", "yellow", "purple", "orange"];

const DECOR = [
  { emoji: "🐉", className: "left-1 top-24", delay: "0s", duration: "5s" },
  { emoji: "🍭", className: "right-2 top-48", delay: "1.2s", duration: "6s" },
  { emoji: "⛰️", className: "left-2 top-96", delay: "0.6s", duration: "5.5s" },
  { emoji: "🍬", className: "right-1 top-[550px]", delay: "1.8s", duration: "6.5s" },
  { emoji: "🏔️", className: "left-1 top-[800px]", delay: "0.9s", duration: "5.8s" },
  { emoji: "🧁", className: "right-2 top-[1050px]", delay: "0.3s", duration: "6.2s" },
  { emoji: "❄️", className: "left-2 top-[1300px]", delay: "1.5s", duration: "5.4s" },
  { emoji: "🎏", className: "right-1 bottom-40", delay: "0.7s", duration: "6.8s" },
];

export default function MapPage() {
  const unlockedLevelNumber = usePlayerStore((s) => s.unlockedLevelNumber);
  const bestResults = usePlayerStore((s) => s.bestResults);

  return (
    <div className="relative flex flex-1 flex-col">
      <DriftingClouds />
      <FallingPetals />
      <PrayerFlags className="absolute -top-4 left-0 h-12" />
      {DECOR.map((d) => (
        <span
          key={d.emoji}
          aria-hidden
          className={`pointer-events-none absolute text-3xl opacity-60 ${d.className}`}
          style={{ animation: `candy-float ${d.duration} ease-in-out ${d.delay} infinite` }}
        >
          {d.emoji}
        </span>
      ))}

      <motion.header
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className="mb-10 mt-2 text-center"
      >
        <h1 className="font-display text-candy text-5xl font-bold tracking-tight">🐉 Candy Pop</h1>
        <p className="mt-1.5 text-sm font-semibold text-muted-foreground">
          A sweet journey through the Dragon Kingdom
        </p>
      </motion.header>

      <div className="relative mx-auto w-full max-w-xs pb-10">
        {/* Dashed trail behind the nodes */}
        <div
          aria-hidden
          className="absolute inset-y-4 left-1/2 w-1 -translate-x-1/2 rounded-full opacity-30"
          style={{
            backgroundImage: "linear-gradient(to bottom, var(--primary) 55%, transparent 55%)",
            backgroundSize: "4px 18px",
          }}
        />

        <ol className="relative flex flex-col gap-7">
          {levels.map((level, index) => {
            const unlocked = level.levelNumber <= unlockedLevelNumber;
            const isCurrent = level.levelNumber === unlockedLevelNumber;
            const result = bestResults[level.id];
            const candy = CANDY_STYLE[NODE_COLORS[index % NODE_COLORS.length]];
            const offset = index % 2 === 0 ? "-translate-x-14" : "translate-x-14";

            const node = (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 320, damping: 20, delay: 0.08 * index }}
                whileTap={unlocked ? { scale: 0.92 } : undefined}
                className={`flex flex-col items-center gap-1.5 ${offset}`}
              >
                <div
                  className={`font-display relative flex size-16 items-center justify-center rounded-full text-2xl font-bold text-white ${
                    isCurrent ? "" : ""
                  }`}
                  style={{
                    background: unlocked ? candy.gradient : "linear-gradient(155deg, #b8b0b4, #8d848a)",
                    boxShadow: unlocked
                      ? candy.shadow
                      : "0 4px 10px -3px rgba(0,0,0,0.3), inset 0 -3px 6px rgba(0,0,0,0.15)",
                    animation: isCurrent ? "candy-pulse 1.8s ease-out infinite" : undefined,
                  }}
                >
                  {unlocked ? level.levelNumber : "🔒"}
                  {isCurrent && (
                    <span className="font-display absolute -bottom-2 rounded-full bg-primary px-2 py-px text-[10px] font-bold tracking-wide text-primary-foreground shadow-md">
                      PLAY
                    </span>
                  )}
                </div>
                <div className="text-center">
                  <div className={`font-display text-xs font-semibold ${unlocked ? "" : "text-muted-foreground"}`}>
                    {level.name}
                  </div>
                  <div className="mt-0.5 text-sm tracking-tight">
                    {unlocked && (
                      <>
                        <span className="text-amber-400">{"★".repeat(result?.stars ?? 0)}</span>
                        <span className="text-foreground/20">{"★".repeat(3 - (result?.stars ?? 0))}</span>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            );

            return (
              <li key={level.id} className="flex justify-center">
                {unlocked ? (
                  <Link href={`/play/${level.id}`} aria-label={`Play level ${level.levelNumber}: ${level.name}`}>
                    {node}
                  </Link>
                ) : (
                  node
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
