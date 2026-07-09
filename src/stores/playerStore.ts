import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface LevelResult {
  stars: number;
  bestScore: number;
}

interface PlayerState {
  unlockedLevelNumber: number;
  bestResults: Record<string, LevelResult>;
  softCurrency: number;
  isLevelUnlocked: (levelNumber: number) => boolean;
  recordLevelResult: (params: {
    levelId: string;
    levelNumber: number;
    score: number;
    stars: number;
    won: boolean;
  }) => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      unlockedLevelNumber: 1,
      bestResults: {},
      softCurrency: 0,

      isLevelUnlocked: (levelNumber) => levelNumber <= get().unlockedLevelNumber,

      recordLevelResult: ({ levelId, levelNumber, score, stars, won }) => {
        set((state) => {
          const previous = state.bestResults[levelId];
          const bestResults = {
            ...state.bestResults,
            [levelId]: {
              stars: Math.max(previous?.stars ?? 0, stars),
              bestScore: Math.max(previous?.bestScore ?? 0, score),
            },
          };

          const unlockedLevelNumber = won
            ? Math.max(state.unlockedLevelNumber, levelNumber + 1)
            : state.unlockedLevelNumber;

          const softCurrency = won ? state.softCurrency + score / 10 : state.softCurrency;

          return { bestResults, unlockedLevelNumber, softCurrency };
        });
      },
    }),
    { name: "candy-pop-player" },
  ),
);
