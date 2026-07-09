"use client";

import { useEffect, useRef } from "react";
import { animate } from "motion/react";
import type { Board as BoardData, Position } from "@/game-engine/types";
import { inBounds } from "@/game-engine/board";
import { Tile } from "./Tile";

interface BoardProps {
  board: BoardData;
  selected: Position | null;
  shake: Position[] | null;
  locked: boolean;
  /** Increments on every cascade clear; triggers a tray shake scaled by comboLevel. */
  shakeTick: number;
  comboLevel: number;
  onTap: (pos: Position) => void;
  onSwipe: (from: Position, to: Position) => void;
  children?: React.ReactNode;
}

export function Board({
  board,
  selected,
  shake,
  locked,
  shakeTick,
  comboLevel,
  onTap,
  onSwipe,
  children,
}: BoardProps) {
  const trayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (shakeTick === 0 || !trayRef.current) return;
    const amp = Math.min(2 + comboLevel * 1.5, 8);
    const controls = animate(
      trayRef.current,
      { x: [0, -amp, amp, -amp * 0.6, amp * 0.6, 0], y: [0, amp * 0.4, -amp * 0.4, 0, 0, 0] },
      { duration: 0.32 },
    );
    return () => controls.stop();
  }, [shakeTick, comboLevel]);

  const handleSwipe = (from: Position, to: Position) => {
    if (!inBounds(board, to)) return;
    onSwipe(from, to);
  };

  const isShaking = (row: number, col: number) =>
    shake?.some((p) => p.row === row && p.col === col) ?? false;

  const cellW = 100 / board.width;
  const cellH = 100 / board.height;

  return (
    <div className="relative">
      <div ref={trayRef} className={`candy-tray mx-auto w-full max-w-md rounded-3xl p-2.5 ${locked ? "pointer-events-none" : ""}`}>
        <div
          className="relative w-full overflow-hidden rounded-2xl"
          style={{ aspectRatio: `${board.width} / ${board.height}` }}
        >
          {/* Checkerboard cell backdrop (blocked cells drawn darker) */}
          {board.blocked.flatMap((row, rowIndex) =>
            row.map((isBlocked, colIndex) => (
              <div
                key={`cell-${rowIndex}-${colIndex}`}
                className={
                  isBlocked
                    ? "absolute rounded-[18%] bg-black/20 shadow-inner dark:bg-black/45"
                    : (rowIndex + colIndex) % 2 === 0
                      ? "absolute rounded-[18%] bg-white/45 dark:bg-white/8"
                      : "absolute rounded-[18%] bg-rose-200/25 dark:bg-white/4"
                }
                style={{
                  width: `${cellW - 1}%`,
                  height: `${cellH - 1}%`,
                  left: `${colIndex * cellW + 0.5}%`,
                  top: `${rowIndex * cellH + 0.5}%`,
                }}
              />
            )),
          )}

          {board.cells.flatMap((row, rowIndex) =>
            row.map((cell, colIndex) => {
              if (!cell) return null;
              const pos = { row: rowIndex, col: colIndex };
              const isSelected = selected?.row === rowIndex && selected?.col === colIndex;
              return (
                <Tile
                  key={cell.id}
                  tile={cell}
                  pos={pos}
                  boardWidth={board.width}
                  boardHeight={board.height}
                  selected={isSelected}
                  shaking={isShaking(rowIndex, colIndex)}
                  onTap={onTap}
                  onSwipe={handleSwipe}
                />
              );
            }),
          )}

          {/* Frosted ice overlays sit above the candies; matching on an iced
              cell breaks the ice. Cell-based, so falling candies slide under. */}
          {board.ice.flatMap((row, rowIndex) =>
            row.map((layers, colIndex) =>
              layers > 0 ? (
                <div
                  key={`ice-${rowIndex}-${colIndex}`}
                  className="pointer-events-none absolute z-[5] flex items-center justify-center rounded-[18%] border-2 border-sky-100/90 bg-gradient-to-br from-white/60 to-sky-200/45 text-sky-100 shadow-[inset_0_1px_3px_rgba(255,255,255,0.9)] backdrop-blur-[1.5px]"
                  style={{
                    width: `${cellW - 1}%`,
                    height: `${cellH - 1}%`,
                    left: `${colIndex * cellW + 0.5}%`,
                    top: `${rowIndex * cellH + 0.5}%`,
                    textShadow: "0 1px 2px rgba(30,100,160,0.5)",
                  }}
                >
                  ❄
                </div>
              ) : null,
            ),
          )}

          {children}
        </div>
      </div>
    </div>
  );
}
