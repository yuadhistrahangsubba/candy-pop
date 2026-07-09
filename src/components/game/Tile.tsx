"use client";

import { motion } from "motion/react";
import type { Position, Tile as TileData } from "@/game-engine/types";
import { useSwipeInput, directionToDelta } from "@/hooks/useSwipeInput";
import { CANDY_STYLE } from "./candyStyles";
import { CandyIcon } from "./CandyIcon";

interface TileProps {
  tile: TileData;
  pos: Position;
  boardWidth: number;
  boardHeight: number;
  selected: boolean;
  shaking: boolean;
  onTap: (pos: Position) => void;
  onSwipe: (from: Position, to: Position) => void;
}

const SPRING = { type: "spring" as const, stiffness: 460, damping: 26 };

/**
 * Tiles are absolutely positioned and moved purely with x/y transforms
 * (percent of their own size = board cells) — never grid slots, exit
 * animations, or clear keyframes. Live tiles only ever animate toward a
 * single spring target, which interrupts cleanly, so no animation race can
 * leave a tile stuck invisible. Clears are drawn by overlay ghosts instead.
 */
export function Tile({
  tile,
  pos,
  boardWidth,
  boardHeight,
  selected,
  shaking,
  onTap,
  onSwipe,
}: TileProps) {
  const { onPointerDown, onPointerUp } = useSwipeInput(pos, onTap, (origin, direction) => {
    const delta = directionToDelta(direction);
    onSwipe(origin, { row: origin.row + delta.row, col: origin.col + delta.col });
  });

  const x = `${pos.col * 100}%`;
  const y = `${pos.row * 100}%`;
  const glow = tile.color ? CANDY_STYLE[tile.color].solid : "#2c1418";

  // No opacity animation and no transition delays on live tiles — both open
  // interruption races under rapid cascade re-renders that can strand a tile
  // invisible. Entrances read as a physical drop from behind the tray edge
  // (the board container clips overflow) instead of a fade.
  let animate;
  let transition;
  if (shaking) {
    animate = {
      x: [x, `${pos.col * 100 - 6}%`, `${pos.col * 100 + 6}%`, `${pos.col * 100 - 4}%`, x],
      y,
      scale: 1,
    };
    transition = { duration: 0.32 };
  } else {
    animate = { x, y, scale: selected ? 1.14 : 1 };
    transition = SPRING;
  }

  return (
    <motion.button
      type="button"
      initial={{ x, y: `${pos.row * 100 - 160}%`, scale: 0.85 }}
      animate={animate}
      transition={transition}
      whileTap={{ scale: 0.9 }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      style={{
        touchAction: "none",
        width: `${100 / boardWidth}%`,
        height: `${100 / boardHeight}%`,
        zIndex: selected ? 10 : 1,
        filter: selected
          ? `drop-shadow(0 0 10px ${glow}) drop-shadow(0 0 3px #fff)`
          : `drop-shadow(0 4px 5px ${glow}66)`,
      }}
      className="absolute left-0 top-0 select-none"
      aria-label={tile.special ? `${tile.special} candy` : `${tile.color} candy`}
    >
      {/* inset % resolves against the button itself, unlike padding % which
          resolves against the board width and shrank candies on big boards */}
      <span className="absolute inset-[5%]">
        {tile.special === "color-bomb" ? (
          <motion.div
            className="h-full w-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <CandyIcon color={tile.color} special={tile.special} />
          </motion.div>
        ) : (
          <CandyIcon color={tile.color} special={tile.special} />
        )}
      </span>
    </motion.button>
  );
}
