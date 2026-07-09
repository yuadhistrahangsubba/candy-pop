"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import type { LevelDefinition } from "@/game-engine/types";
import { useGameSessionStore } from "@/stores/gameSessionStore";
import { usePlayerStore } from "@/stores/playerStore";
import { Board } from "@/components/game/Board";
import { BoardOverlay } from "@/components/game/BoardOverlay";
import { Hud } from "@/components/game/Hud";
import { DriftingClouds, LevelAtmosphere, PrayerFlags } from "@/components/decor/BhutanAtmosphere";
import { sfx } from "@/lib/sfx";

const RESULTS_DELAY_MS = 1400;

export function PlayClient({ level }: { level: LevelDefinition }) {
  const router = useRouter();
  const recordLevelResult = usePlayerStore((s) => s.recordLevelResult);

  const startLevel = useGameSessionStore((s) => s.startLevel);
  const selectTile = useGameSessionStore((s) => s.selectTile);
  const status = useGameSessionStore((s) => s.status);
  const selected = useGameSessionStore((s) => s.selected);
  const objectives = useGameSessionStore((s) => s.objectives);
  const displayBoard = useGameSessionStore((s) => s.displayBoard);
  const displayScore = useGameSessionStore((s) => s.displayScore);
  const displayMoves = useGameSessionStore((s) => s.displayMoves);
  const isAnimating = useGameSessionStore((s) => s.isAnimating);
  const shake = useGameSessionStore((s) => s.shake);
  const ghosts = useGameSessionStore((s) => s.ghosts);
  const effects = useGameSessionStore((s) => s.effects);
  const scorePops = useGameSessionStore((s) => s.scorePops);
  const comboLevel = useGameSessionStore((s) => s.comboLevel);
  const bursts = useGameSessionStore((s) => s.bursts);
  const shakeTick = useGameSessionStore((s) => s.shakeTick);
  const reshuffleTick = useGameSessionStore((s) => s.reshuffleTick);

  const hasRecorded = useRef(false);
  // null until mounted — avoids a hydration mismatch since mute lives in localStorage.
  const [mutedUi, setMutedUi] = useState<boolean | null>(null);

  useEffect(() => {
    hasRecorded.current = false;
    startLevel(level);
    // Clear the session on the way out so the next play screen can never
    // observe this level's "won"/"lost" status on its first render.
    return () => {
      useGameSessionStore.getState().reset();
    };
  }, [level, startLevel]);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMutedUi(sfx.isMuted()));
    return () => cancelAnimationFrame(id);
  }, []);

  // Deliberately one-shot with minimal deps: reading score/stars imperatively
  // means no dependency churn can run the cleanup and cancel the pending
  // navigation, which would strand the player on the finished board.
  useEffect(() => {
    if (status !== "won" && status !== "lost") return;
    if (hasRecorded.current) return;

    // The store is global, so on first render this effect can see a stale
    // "won" left over from the PREVIOUS level (before startLevel resets it).
    // Trusting it would instantly mark this level complete with 0 points.
    // Only proceed when the live store agrees the finished level is THIS one.
    const state = useGameSessionStore.getState();
    if (state.level?.id !== level.id) return;
    if (state.status !== "won" && state.status !== "lost") return;
    hasRecorded.current = true;

    const { session: finalSession, finalStars: stars } = state;
    const score = finalSession?.score ?? 0;

    const won = state.status === "won";
    recordLevelResult({
      levelId: level.id,
      levelNumber: level.levelNumber,
      score,
      stars,
      won,
    });

    const params = new URLSearchParams({
      score: String(score),
      stars: String(stars),
      won: won ? "1" : "0",
    });

    // Let the win banner and final cascade read as a moment before leaving.
    setTimeout(() => {
      router.push(`/results/${level.id}?${params.toString()}`);
    }, RESULTS_DELAY_MS);
  }, [status, level, recordLevelResult, router]);

  if (!displayBoard) return null;

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative flex flex-1 flex-col justify-center">
        <LevelAtmosphere levelNumber={level.levelNumber} />
        <DriftingClouds />
        <PrayerFlags className="absolute -top-3 left-0 h-10 opacity-80" />
        <div className="mx-auto mb-2 flex w-full max-w-md items-center justify-between">
          <Link
            href="/map"
            className="rounded-full bg-card/80 px-3.5 py-1.5 text-sm font-bold text-muted-foreground shadow-sm backdrop-blur transition active:scale-95"
            aria-label="Back to map"
          >
            ← Map
          </Link>
          <button
            type="button"
            onClick={() => setMutedUi(sfx.toggleMute())}
            className="rounded-full bg-card/80 px-3.5 py-1.5 text-sm shadow-sm backdrop-blur transition active:scale-95"
            aria-label={mutedUi ? "Unmute sounds" : "Mute sounds"}
          >
            {mutedUi === null ? "🔊" : mutedUi ? "🔇" : "🔊"}
          </button>
        </div>
        <Hud levelName={level.name} movesLeft={displayMoves} score={displayScore} objectives={objectives} />
        <Board
          board={displayBoard}
          selected={selected}
          shake={shake}
          locked={isAnimating || status !== "playing"}
          shakeTick={shakeTick}
          comboLevel={comboLevel}
          onTap={selectTile}
          onSwipe={(from, to) => {
            selectTile(from);
            selectTile(to);
          }}
        >
          <BoardOverlay
            scorePops={scorePops}
            comboLevel={comboLevel}
            bursts={bursts}
            ghosts={ghosts}
            effects={effects}
            boardWidth={displayBoard.width}
            boardHeight={displayBoard.height}
          />

          {/* End-of-level banner so completion is unmistakable while the
              results screen loads. */}
          <AnimatePresence>
            {(status === "won" || status === "lost" || status === "bonus") && (
              <motion.div
                key={status}
                initial={{ scale: 0.4, opacity: 0 }}
                animate={
                  status === "bonus"
                    ? { scale: 1, opacity: [0, 1, 1, 0] }
                    : { scale: 1, opacity: 1 }
                }
                transition={
                  status === "bonus"
                    ? { duration: 1.5, times: [0, 0.15, 0.75, 1] }
                    : { type: "spring", stiffness: 300, damping: 16 }
                }
                className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
              >
                <span
                  className={`font-display -rotate-3 text-center font-bold italic tracking-wide ${
                    status === "bonus" ? "text-5xl" : "text-6xl"
                  }`}
                  style={{
                    background:
                      status === "lost"
                        ? "linear-gradient(180deg, #cfd8e6 15%, #93a5c0 60%, #5c7194 90%)"
                        : "linear-gradient(180deg, #ffe08a 15%, #ffb92e 55%, #f07f13 90%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                    WebkitTextStroke: "2px #5c3005",
                    filter: "drop-shadow(0 3px 0 #40230a) drop-shadow(0 6px 12px rgba(0,0,0,0.35))",
                  }}
                >
                  {status === "lost" ? "Out of Moves" : status === "bonus" ? "Festival Celebration!" : "Tashi Delek!"}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Deadlock reshuffle notice — keyed by tick, self-hides via its
              own animation timeline so no state juggling is needed. */}
          {reshuffleTick > 0 && (
            <motion.div
              key={`reshuffle-${reshuffleTick}`}
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: [16, 0, 0, -10], opacity: [0, 1, 1, 0] }}
              transition={{ duration: 2.4, times: [0, 0.08, 0.88, 1] }}
              className="pointer-events-none absolute inset-x-0 top-3 z-20 flex justify-center"
            >
              <span className="font-display rounded-full bg-foreground/85 px-4 py-2 text-sm font-bold text-background shadow-lg backdrop-blur">
                🔀 No moves left — reshuffling!
              </span>
            </motion.div>
          )}
        </Board>
      </div>
    </MotionConfig>
  );
}
