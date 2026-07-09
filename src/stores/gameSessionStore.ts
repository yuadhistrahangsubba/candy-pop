import { create } from "zustand";
import {
  attemptMove,
  createGameSession,
  reshuffleIfStuck,
  starsForScore,
  sugarCrush,
  type GameSession,
} from "@/game-engine/engine";
import { isAdjacent } from "@/game-engine/board";
import { sfx } from "@/lib/sfx";
import type { Board, CandyColor, CascadeStep, LevelDefinition, ObjectiveProgress, Position } from "@/game-engine/types";

/** "bonus" = the sugar-crush finale is playing before the win is committed. */
export type SessionStatus = "idle" | "playing" | "bonus" | "won" | "lost";

export interface ScorePop {
  id: number;
  amount: number;
  cascade: number;
}

/** A particle explosion at a cleared cell. */
export interface Burst {
  id: number;
  row: number;
  col: number;
  color: CandyColor | null;
}

/**
 * A cleared tile rendered as a short-lived overlay sprite that shrinks away.
 * Real board tiles are removed instantly on clear; ghosts carry the visual,
 * so no animation state on live tiles can ever be corrupted by clears.
 */
export interface Ghost {
  id: number;
  row: number;
  col: number;
  color: CandyColor | null;
}

interface GameSessionState {
  level: LevelDefinition | null;
  session: GameSession | null;
  status: SessionStatus;
  selected: Position | null;
  objectives: ObjectiveProgress[];
  finalStars: number;

  /** Board currently rendered — lags behind session.board while a move plays back. */
  displayBoard: Board | null;
  /** Score currently rendered — counts up step by step during playback. */
  displayScore: number;
  /** Moves-left currently rendered. */
  displayMoves: number;
  isAnimating: boolean;
  /** Two positions briefly wiggled after an invalid swap. */
  shake: Position[] | null;
  ghosts: Ghost[];
  scorePops: ScorePop[];
  /** Cascade depth of the most recent step (2+ shows the combo banner). */
  comboLevel: number;
  bursts: Burst[];
  /** Increments on every clear so the board can trigger a shake. */
  shakeTick: number;
  /** Increments whenever the board deadlocks and gets reshuffled — drives a toast. */
  reshuffleTick: number;

  startLevel: (level: LevelDefinition) => void;
  selectTile: (pos: Position) => void;
  reset: () => void;
}

const SWAP_MS = 220;
const CLEAR_MS = 270;
const SETTLE_MS = 400;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let playbackToken = 0;
let popId = 0;
let burstId = 0;

export const useGameSessionStore = create<GameSessionState>((set, get) => ({
  level: null,
  session: null,
  status: "idle",
  selected: null,
  objectives: [],
  finalStars: 0,

  displayBoard: null,
  displayScore: 0,
  displayMoves: 0,
  isAnimating: false,
  shake: null,
  ghosts: [],
  scorePops: [],
  comboLevel: 0,
  bursts: [],
  shakeTick: 0,
  reshuffleTick: 0,

  startLevel: (level) => {
    playbackToken += 1;
    const session = createGameSession(level);
    set({
      level,
      session,
      status: "playing",
      selected: null,
      objectives: level.objectives.map((objective) => ({ objective, current: 0, complete: false })),
      finalStars: 0,
      displayBoard: session.board,
      displayScore: 0,
      displayMoves: session.movesLeft,
      isAnimating: false,
      shake: null,
      ghosts: [],
      scorePops: [],
      comboLevel: 0,
      bursts: [],
      shakeTick: 0,
    });
  },

  selectTile: (pos) => {
    const { session, status, selected, isAnimating } = get();
    if (!session || status !== "playing" || isAnimating) return;

    if (!selected) {
      sfx.select();
      set({ selected: pos });
      return;
    }

    if (selected.row === pos.row && selected.col === pos.col) {
      set({ selected: null });
      return;
    }

    if (!isAdjacent(selected, pos)) {
      sfx.select();
      set({ selected: pos });
      return;
    }

    const outcome = attemptMove(session, selected, pos);

    if (!outcome.result.valid || !outcome.timeline) {
      // Invalid: wiggle both tiles, keep the turn.
      sfx.invalid();
      const shaken = [selected, pos];
      set({ selected: null, shake: shaken });
      const token = playbackToken;
      void sleep(360).then(() => {
        if (playbackToken === token) set({ shake: null });
      });
      return;
    }

    const { timeline } = outcome;
    const token = playbackToken;
    set({ selected: null, isAnimating: true });

    // Plays a run of cascade steps; returns the running score, or null if
    // this playback was superseded.
    const playSteps = async (steps: CascadeStep[], startScore: number): Promise<number | null> => {
      let runningScore = startScore;
      for (let i = 0; i < steps.length; i += 1) {
        const step = steps[i];

        runningScore += step.scoreGained;
        popId += 1;
        // Cap bursts per step so a color-bomb wipe doesn't spawn 40 explosions.
        const sampled =
          step.clearedTiles.length > 14
            ? step.clearedTiles.filter((_, idx) => idx % Math.ceil(step.clearedTiles.length / 14) === 0)
            : step.clearedTiles;
        const newBursts = sampled.map((t) => {
          burstId += 1;
          return { id: burstId, row: t.pos.row, col: t.pos.col, color: t.color };
        });
        const newGhosts = step.clearedTiles.map((t) => {
          burstId += 1;
          return { id: burstId, row: t.pos.row, col: t.pos.col, color: t.color };
        });
        sfx.pop(i);
        set((state) => ({
          displayBoard: step.cleared,
          ghosts: newGhosts,
          comboLevel: i + 1,
          bursts: newBursts,
          shakeTick: state.shakeTick + 1,
          scorePops: [...state.scorePops.slice(-3), { id: popId, amount: Math.round(step.scoreGained), cascade: i + 1 }],
        }));
        await sleep(CLEAR_MS);
        if (playbackToken !== token) return null;

        set({ displayBoard: step.settled, ghosts: [], displayScore: Math.round(runningScore) });
        await sleep(SETTLE_MS);
        if (playbackToken !== token) return null;
      }
      return runningScore;
    };

    void (async () => {
      // 1. Show the swap (the two tiles glide to each other's cells).
      sfx.swap();
      set({ displayBoard: timeline.swappedBoard });
      await sleep(SWAP_MS);
      if (playbackToken !== token) return;

      // 2. Play each cascade. Cleared tiles vanish from the live board
      // instantly and short-lived overlay ghosts carry the shrink visual —
      // live tiles never animate a clear, so nothing can get stuck.
      const afterMove = await playSteps(timeline.steps, get().displayScore);
      if (afterMove === null) return;

      // 3. Sugar crush: a win with moves to spare turns each leftover move
      // into a striped candy and detonates the whole board. The bonus score
      // counts toward stars.
      if (outcome.won && outcome.session.movesLeft > 0) {
        sfx.win();
        set({
          status: "bonus",
          session: outcome.session,
          displayBoard: outcome.session.board,
          displayScore: outcome.session.score,
          displayMoves: outcome.session.movesLeft,
          objectives: outcome.objectives,
          comboLevel: 0,
          bursts: [],
          ghosts: [],
        });
        await sleep(1000);
        if (playbackToken !== token) return;

        const bonus = sugarCrush(outcome.session);

        // Reveal the bonus striped candies with a little sparkle burst each.
        const conversionBursts = bonus.converted.map((pos) => {
          burstId += 1;
          return { id: burstId, row: pos.row, col: pos.col, color: null };
        });
        sfx.pop(1);
        set({ displayBoard: bonus.convertedBoard, displayMoves: 0, bursts: conversionBursts });
        await sleep(650);
        if (playbackToken !== token) return;

        const afterBonus = await playSteps(bonus.steps, outcome.session.score);
        if (afterBonus === null) return;

        set({
          session: bonus.session,
          displayBoard: bonus.session.board,
          displayScore: bonus.session.score,
          displayMoves: 0,
          finalStars: starsForScore(bonus.session.level, bonus.session.score),
          comboLevel: 0,
          bursts: [],
          ghosts: [],
          isAnimating: false,
          status: "won",
        });
        return;
      }

      // 4. Commit the authoritative session and outcome. If the game
      // continues but the board has no legal swap left, reshuffle it so the
      // player is never stuck.
      if (outcome.won) sfx.win();
      else if (outcome.lost) sfx.lose();
      let finalSession = outcome.session;
      let reshuffled = false;
      if (!outcome.won && !outcome.lost) {
        const check = reshuffleIfStuck(outcome.session);
        finalSession = check.session;
        reshuffled = check.reshuffled;
      }
      set((state) => ({
        reshuffleTick: reshuffled ? state.reshuffleTick + 1 : state.reshuffleTick,
        session: finalSession,
        displayBoard: finalSession.board,
        displayScore: finalSession.score,
        displayMoves: finalSession.movesLeft,
        objectives: outcome.objectives,
        finalStars: outcome.stars,
        comboLevel: 0,
        bursts: [],
        ghosts: [],
        isAnimating: false,
        status: outcome.won ? "won" : outcome.lost ? "lost" : "playing",
      }));
    })();
  },

  reset: () => {
    playbackToken += 1;
    set({
      level: null,
      session: null,
      status: "idle",
      selected: null,
      objectives: [],
      finalStars: 0,
      displayBoard: null,
      displayScore: 0,
      displayMoves: 0,
      isAnimating: false,
      shake: null,
      ghosts: [],
      scorePops: [],
      comboLevel: 0,
      bursts: [],
      shakeTick: 0,
    });
  },
}));
