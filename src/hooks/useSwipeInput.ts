import { useRef } from "react";
import type { Position } from "@/game-engine/types";

type Direction = "up" | "down" | "left" | "right";

const SWIPE_THRESHOLD_PX = 18;

export function directionToDelta(direction: Direction): Position {
  switch (direction) {
    case "up":
      return { row: -1, col: 0 };
    case "down":
      return { row: 1, col: 0 };
    case "left":
      return { row: 0, col: -1 };
    case "right":
      return { row: 0, col: 1 };
  }
}

/**
 * Distinguishes a tap (select this tile) from a swipe (swap with the
 * adjacent tile in that direction) on a single tile element, so touch users
 * get a natural drag-to-swap gesture while a tap-tap fallback keeps the
 * board usable without precise dragging.
 */
export function useSwipeInput(pos: Position, onTap: (pos: Position) => void, onSwipe: (pos: Position, direction: Direction) => void) {
  const start = useRef<{ x: number; y: number } | null>(null);

  function onPointerDown(e: React.PointerEvent) {
    start.current = { x: e.clientX, y: e.clientY };
  }

  function onPointerUp(e: React.PointerEvent) {
    const origin = start.current;
    start.current = null;
    if (!origin) return;

    const dx = e.clientX - origin.x;
    const dy = e.clientY - origin.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (Math.max(absX, absY) < SWIPE_THRESHOLD_PX) {
      onTap(pos);
      return;
    }

    const direction: Direction = absX > absY ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up";
    onSwipe(pos, direction);
  }

  return { onPointerDown, onPointerUp };
}
