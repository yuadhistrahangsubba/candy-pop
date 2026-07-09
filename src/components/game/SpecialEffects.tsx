"use client";

import type { CSSProperties } from "react";
import { motion } from "motion/react";
import type { SpecialEffectData } from "@/stores/gameSessionStore";
import { CANDY_STYLE } from "./candyStyles";

/**
 * Cinematic special-candy activation VFX, layered over the board. Every
 * element is a short-lived overlay animating transform/opacity only —
 * mounted fresh per activation and hard-removed at settle, exactly like
 * ghosts, so live-tile animations can never be disturbed.
 */

interface Ctx {
  boardWidth: number;
  boardHeight: number;
}

const WHITE_CORE = "linear-gradient(90deg, transparent, rgba(255,255,255,0.95) 12%, rgba(255,255,255,0.95) 88%, transparent)";

function colorOf(effect: SpecialEffectData): string {
  return effect.color ? CANDY_STYLE[effect.color].solid : "#8a6cff";
}

/** Horizontal (or vertical) laser: colored energy layer + white core, growing outward from the origin cell, plus flying sparks. */
function Beam({ effect, boardWidth, boardHeight }: { effect: SpecialEffectData } & Ctx) {
  const horizontal = effect.kind === "beam-h";
  const color = colorOf(effect);

  // The beam container spans past the board edges; transform-origin sits at
  // the activating candy so the laser visibly travels outward from it.
  const originPct = horizontal
    ? (((effect.col + 0.5) / boardWidth) * 100 + 8) / 1.16
    : (((effect.row + 0.5) / boardHeight) * 100 + 8) / 1.16;

  const container: CSSProperties = horizontal
    ? { top: `${(effect.row / boardHeight) * 100}%`, height: `${100 / boardHeight}%`, left: "-8%", width: "116%" }
    : { left: `${(effect.col / boardWidth) * 100}%`, width: `${100 / boardWidth}%`, top: "-8%", height: "116%" };

  const grow = horizontal ? { scaleX: [0, 1] } : { scaleY: [0, 1] };
  const origin = horizontal ? `${originPct}% 50%` : `50% ${originPct}%`;

  const sparkCount = 5;

  return (
    <div className="absolute" style={container}>
      {/* outer colored glow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ ...grow, opacity: [0.9, 0.9, 0] }}
        transition={{ duration: 0.5, times: [0, 0.55, 1], ease: "circOut" }}
        className="absolute"
        style={{
          ...(horizontal ? { inset: "12% 0" } : { inset: "0 12%" }),
          transformOrigin: origin,
          background: color,
          borderRadius: 999,
          filter: "blur(4px)",
        }}
      />
      {/* white-hot core */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ ...grow, opacity: [1, 1, 0] }}
        transition={{ duration: 0.42, times: [0, 0.5, 1], ease: "circOut" }}
        className="absolute"
        style={{
          ...(horizontal ? { inset: "34% 0" } : { inset: "0 34%" }),
          transformOrigin: origin,
          background: horizontal ? WHITE_CORE : "linear-gradient(180deg, transparent, rgba(255,255,255,0.95) 12%, rgba(255,255,255,0.95) 88%, transparent)",
          borderRadius: 999,
        }}
      />
      {/* sparks racing outward */}
      {Array.from({ length: sparkCount }, (_, i) => {
        const dir = i % 2 === 0 ? 1 : -1;
        const travel = 30 + ((effect.id * 17 + i * 29) % 45);
        const offset = { [horizontal ? "left" : "top"]: `${originPct}%` } as CSSProperties;
        return (
          <motion.span
            key={i}
            initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
            animate={
              horizontal
                ? { x: `${dir * travel}vw`, scale: 0, opacity: [1, 1, 0] }
                : { y: `${dir * travel}vh`, scale: 0, opacity: [1, 1, 0] }
            }
            transition={{ duration: 0.45, delay: i * 0.02, ease: "easeOut" }}
            className="absolute size-1.5 rounded-full"
            style={{ ...offset, [horizontal ? "top" : "left"]: "46%", background: "#fff", boxShadow: `0 0 6px ${color}` }}
          />
        );
      })}
    </div>
  );
}

/** Wrapped candy: flash + two expanding shockwave rings, the second delayed. */
function WrappedBlast({ effect, boardWidth, boardHeight }: { effect: SpecialEffectData } & Ctx) {
  const color = colorOf(effect);
  const cx = `${((effect.col + 0.5) / boardWidth) * 100}%`;
  const cy = `${((effect.row + 0.5) / boardHeight) * 100}%`;

  return (
    <div className="absolute" style={{ left: cx, top: cy }}>
      <motion.span
        initial={{ scale: 0.3, opacity: 0.9 }}
        animate={{ scale: 2.6, opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="absolute size-16 rounded-full"
        style={{
          marginLeft: -32,
          marginTop: -32,
          background: `radial-gradient(circle, rgba(255,255,255,0.9), ${color}88 45%, transparent 70%)`,
        }}
      />
      {[0, 0.12].map((delay, i) => (
        <motion.span
          key={i}
          initial={{ scale: 0.4, opacity: 0.95 }}
          animate={{ scale: 3.4 + i, opacity: 0 }}
          transition={{ duration: 0.55, delay, ease: "easeOut" }}
          className="absolute size-14 rounded-full border-[3px]"
          style={{ marginLeft: -28, marginTop: -28, borderColor: i === 0 ? "#fff" : color }}
        />
      ))}
    </div>
  );
}

/** Deterministic jagged lightning path between two cell centers, in board-percentage space. */
function lightningPoints(effect: SpecialEffectData, target: { row: number; col: number }, i: number, w: number, h: number): string {
  const x1 = ((effect.col + 0.5) / w) * 100;
  const y1 = ((effect.row + 0.5) / h) * 100;
  const x2 = ((target.col + 0.5) / w) * 100;
  const y2 = ((target.row + 0.5) / h) * 100;
  const jitter = (seed: number) => (((effect.id * 31 + i * 47 + seed * 71) % 13) - 6) * 0.6;
  const midX = (x1 + x2) / 2 + jitter(1);
  const midY = (y1 + y2) / 2 + jitter(2);
  const qX = x1 + (x2 - x1) * 0.25 + jitter(3);
  const qY = y1 + (y2 - y1) * 0.25 + jitter(4);
  return `${x1},${y1} ${qX},${qY} ${midX},${midY} ${x2},${y2}`;
}

/** Thunder Dragon Orb: the board darkens, lightning arcs leap to every target, then a flash. */
function BombStrike({ effect, boardWidth, boardHeight }: { effect: SpecialEffectData } & Ctx) {
  const color = colorOf(effect);
  const targets = effect.targets ?? [];

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.38, 0.38, 0] }}
        transition={{ duration: 0.6, times: [0, 0.2, 0.7, 1] }}
        className="absolute inset-0 rounded-2xl bg-slate-950"
      />
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
        {targets.map((target, i) => (
          <g key={i}>
            <motion.polyline
              points={lightningPoints(effect, target, i, boardWidth, boardHeight)}
              fill="none"
              stroke={color}
              strokeWidth="1.6"
              strokeLinejoin="round"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.4, 1, 0] }}
              transition={{ duration: 0.45, delay: 0.06 + i * 0.03 }}
              style={{ vectorEffect: "non-scaling-stroke" as never }}
            />
            <motion.polyline
              points={lightningPoints(effect, target, i, boardWidth, boardHeight)}
              fill="none"
              stroke="#fff"
              strokeWidth="0.6"
              strokeLinejoin="round"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.5, 1, 0] }}
              transition={{ duration: 0.45, delay: 0.06 + i * 0.03 }}
            />
          </g>
        ))}
      </svg>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.55, 0] }}
        transition={{ duration: 0.3, delay: 0.32 }}
        className="absolute inset-0 rounded-2xl bg-white"
      />
    </>
  );
}

export function SpecialEffects({ effects, boardWidth, boardHeight }: { effects: SpecialEffectData[] } & Ctx) {
  return (
    <>
      {effects.map((effect) => {
        if (effect.kind === "beam-h" || effect.kind === "beam-v") {
          return <Beam key={effect.id} effect={effect} boardWidth={boardWidth} boardHeight={boardHeight} />;
        }
        if (effect.kind === "wrapped") {
          return <WrappedBlast key={effect.id} effect={effect} boardWidth={boardWidth} boardHeight={boardHeight} />;
        }
        return <BombStrike key={effect.id} effect={effect} boardWidth={boardWidth} boardHeight={boardHeight} />;
      })}
    </>
  );
}
