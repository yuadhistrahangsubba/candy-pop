"use client";

import { AnimatePresence, motion } from "motion/react";
import type { Burst, Ghost, ScorePop, SpecialEffectData } from "@/stores/gameSessionStore";
import { CANDY_STYLE } from "./candyStyles";
import { CandyIcon } from "./CandyIcon";
import { SpecialEffects } from "./SpecialEffects";

const COMBO_WORDS = ["", "", "Tashi Delek!", "Kuzuzangpo!", "Druk Power!", "Druk Power!"];

function comboWord(cascade: number): string {
  return COMBO_WORDS[Math.min(cascade, COMBO_WORDS.length - 1)];
}

const PARTICLES_PER_BURST = 6;

/** Deterministic per-particle trajectory so renders are stable. */
function particleVector(burstId: number, i: number) {
  const angle = ((i * 360) / PARTICLES_PER_BURST + ((burstId * 47) % 60)) * (Math.PI / 180);
  const distance = 26 + ((burstId * 31 + i * 17) % 18);
  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance,
    size: 5 + ((burstId + i * 13) % 5),
  };
}

function BurstEffect({ burst, boardWidth, boardHeight }: { burst: Burst; boardWidth: number; boardHeight: number }) {
  const left = `${((burst.col + 0.5) / boardWidth) * 100}%`;
  const top = `${((burst.row + 0.5) / boardHeight) * 100}%`;
  const color = burst.color ? CANDY_STYLE[burst.color].solid : "#5b3138";

  return (
    <div className="absolute" style={{ left, top }}>
      {Array.from({ length: PARTICLES_PER_BURST }, (_, i) => {
        const v = particleVector(burst.id, i);
        return (
          <motion.span
            key={i}
            initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
            animate={{ x: v.x, y: v.y, scale: 0, opacity: [1, 1, 0] }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="absolute rounded-full"
            style={{
              width: v.size,
              height: v.size,
              marginLeft: -v.size / 2,
              marginTop: -v.size / 2,
              background: color,
              boxShadow: `0 0 6px ${color}`,
            }}
          />
        );
      })}
      <motion.span
        initial={{ scale: 0.4, opacity: 0.9 }}
        animate={{ scale: 2.2, opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="absolute size-8 rounded-full border-2"
        style={{ marginLeft: -16, marginTop: -16, borderColor: color }}
      />
    </div>
  );
}

interface BoardOverlayProps {
  scorePops: ScorePop[];
  comboLevel: number;
  bursts: Burst[];
  ghosts: Ghost[];
  effects: SpecialEffectData[];
  boardWidth: number;
  boardHeight: number;
}

/** Ghost sprites, special-activation VFX, particle bursts, floating "+N" pops, and the combo banner layered over the board. */
export function BoardOverlay({ scorePops, comboLevel, bursts, ghosts, effects, boardWidth, boardHeight }: BoardOverlayProps) {
  return (
    <div className="pointer-events-none absolute inset-0">
      <SpecialEffects effects={effects} boardWidth={boardWidth} boardHeight={boardHeight} />
      {/* Deep cascades bathe the board in a golden festival glow */}
      {comboLevel >= 4 && (
        <motion.div
          key={`glow-${comboLevel}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 0.9, times: [0, 0.3, 1] }}
          className="absolute inset-0 rounded-2xl"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(255,190,60,0.55), rgba(255,150,30,0.15) 60%, transparent 80%)",
          }}
        />
      )}
      {/* Cleared tiles shrink away as overlay sprites — mounted fresh each
          clear, hard-removed at settle, so they can never corrupt live tiles. */}
      {ghosts.map((ghost) => (
        <motion.div
          key={ghost.id}
          initial={{ scale: 1.15, opacity: 1, rotate: 0 }}
          animate={{ scale: 0, opacity: 0, rotate: 14 }}
          transition={{ duration: 0.24, ease: "easeIn" }}
          className="absolute"
          style={{
            width: `${100 / boardWidth}%`,
            height: `${100 / boardHeight}%`,
            left: `${(ghost.col * 100) / boardWidth}%`,
            top: `${(ghost.row * 100) / boardHeight}%`,
          }}
        >
          <span className="absolute inset-[5%]">
            <CandyIcon color={ghost.color} special={null} />
          </span>
        </motion.div>
      ))}

      {bursts.map((burst) => (
        <BurstEffect key={burst.id} burst={burst} boardWidth={boardWidth} boardHeight={boardHeight} />
      ))}

      <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden">
        {scorePops.map((pop) => (
          <motion.span
            key={pop.id}
            initial={{ y: 24, scale: 0.6, opacity: 0 }}
            animate={{ y: -46, scale: 1, opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.1, times: [0, 0.15, 0.7, 1], ease: "easeOut" }}
            className="font-display absolute text-3xl font-bold text-white"
            style={{ textShadow: "0 2px 8px rgba(224,35,78,0.75), 0 0 2px rgba(0,0,0,0.4)" }}
          >
            +{pop.amount}
          </motion.span>
        ))}

        <AnimatePresence>
          {comboLevel >= 2 && (
            <motion.span
              key={`combo-${comboLevel}`}
              initial={{ scale: 0, rotate: -10, opacity: 0 }}
              animate={{ scale: 1, rotate: -3, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 340, damping: 13 }}
              className="font-display absolute text-6xl font-bold italic tracking-wide"
              style={{
                background: "linear-gradient(180deg, #ffe08a 15%, #ffb92e 55%, #f07f13 90%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                WebkitTextStroke: "2px #7a4312",
                filter:
                  "drop-shadow(0 3px 0 #5c3005) drop-shadow(0 6px 10px rgba(0,0,0,0.35))",
              }}
            >
              {comboWord(comboLevel)}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
