"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion, useSpring, useTransform } from "motion/react";

const CONFETTI_COLORS = ["#e0234e", "#1f7fe8", "#28b44b", "#f2a01c", "#8a2ee0", "#ef7113"];

/** Deterministic pseudo-random per index so SSR/client render identically. */
function confettiPiece(i: number) {
  const hash = (i * 2654435761) % 1000;
  return {
    left: `${(hash % 100)}%`,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    delay: (hash % 40) / 100,
    duration: 2.4 + (hash % 30) / 20,
    drift: ((hash % 60) - 30) * 2,
    size: 7 + (hash % 6),
    round: hash % 3 === 0,
  };
}

function Confetti() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      {Array.from({ length: 36 }, (_, i) => {
        const p = confettiPiece(i);
        return (
          <motion.span
            key={i}
            initial={{ y: -30, x: 0, rotate: 0, opacity: 1 }}
            animate={{ y: "105vh", x: p.drift, rotate: 540 + p.drift * 3, opacity: [1, 1, 0.9] }}
            transition={{ duration: p.duration, delay: p.delay, ease: [0.2, 0.4, 0.6, 1] }}
            className="absolute top-0"
            style={{
              left: p.left,
              width: p.size,
              height: p.round ? p.size : p.size * 1.6,
              background: p.color,
              borderRadius: p.round ? "50%" : "2px",
            }}
          />
        );
      })}
    </div>
  );
}

function CountUpScore({ target }: { target: number }) {
  const spring = useSpring(0, { stiffness: 60, damping: 20 });
  const rounded = useTransform(spring, (v) => Math.round(v).toLocaleString());

  useEffect(() => {
    spring.set(target);
  }, [spring, target]);

  return <motion.span className="tabular-nums">{rounded}</motion.span>;
}

interface ResultsClientProps {
  levelId: string;
  levelName: string;
  score: number;
  stars: number;
  won: boolean;
  nextLevelId?: string;
}

export function ResultsClient({ levelId, levelName, score, stars, won, nextLevelId }: ResultsClientProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-7 text-center">
      {won && <Confetti />}

      <motion.div
        initial={{ scale: 0, rotate: -12 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 16 }}
        className="text-7xl"
      >
        {won ? "🎉" : "😢"}
      </motion.div>

      <div>
        <motion.h1
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.12 }}
          className={`font-display text-4xl font-bold ${won ? "text-candy" : ""}`}
        >
          {won ? "Tashi Delek!" : "Out of Moves"}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="mt-1.5 font-semibold text-muted-foreground"
        >
          {won ? `${levelName} cleared` : levelName}
        </motion.p>
      </div>

      {won && (
        <div className="flex gap-2 text-6xl">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 340, damping: 13, delay: 0.45 + i * 0.22 }}
              className={i < stars ? "text-amber-400" : "text-foreground/15"}
              style={i < stars ? { filter: "drop-shadow(0 3px 8px rgba(242,160,28,0.6))" } : undefined}
            >
              ★
            </motion.span>
          ))}
        </div>
      )}

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="font-display text-2xl font-bold"
      >
        <CountUpScore target={score} />
        <span className="ml-2 text-base font-semibold text-muted-foreground">pts</span>
      </motion.p>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.65, type: "spring", stiffness: 260, damping: 22 }}
        className="flex w-full max-w-xs flex-col gap-3"
      >
        {won && nextLevelId && (
          <Link
            href={`/play/${nextLevelId}`}
            className="font-display rounded-full bg-primary px-6 py-3.5 text-lg font-bold text-primary-foreground shadow-lg shadow-primary/35 transition active:scale-95"
          >
            Next Level →
          </Link>
        )}
        <Link
          href={`/play/${levelId}`}
          className="font-display rounded-full border-2 border-primary/50 bg-card/60 px-6 py-3 font-bold text-primary backdrop-blur transition active:scale-95"
        >
          {won ? "Replay" : "Try Again"}
        </Link>
        <Link
          href="/map"
          className="rounded-full px-6 py-2.5 font-semibold text-muted-foreground transition hover:bg-foreground/5 active:scale-95"
        >
          Back to Map
        </Link>
      </motion.div>
    </div>
  );
}
