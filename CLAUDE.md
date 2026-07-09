@AGENTS.md

# Candy Pop

A Candy Crush-style match-3 mobile web game (Next.js App Router + Supabase), built as a real product aimed at users/revenue — not a toy project. See `/Users/yuadhistra/.claude/plans/synchronous-brewing-sprout.md` for the full architecture plan and phased milestones.

## Architecture

- **Game engine** (`src/game-engine/`) — pure TypeScript, zero React/DOM imports, unit-tested with Vitest. `match.ts` finds/merges matches into special-candy-creating groups, `resolve.ts` runs the match → clear → gravity → refill cascade loop, `engine.ts` (`attemptMove`, `createGameSession`) is the orchestrator the UI calls into. This module is the source of truth for game rules — never duplicate match/scoring logic in components.
- **Levels** (`src/levels/`) — static JSON validated by a Zod schema (`schema.ts`). Add a level by dropping a new `level-###.json` and importing it in `index.ts`; no code changes needed elsewhere.
- **State** (`src/stores/`) — two scoped Zustand stores: `gameSessionStore` (ephemeral per-run board/score/moves, wraps the engine) and `playerStore` (persisted to localStorage: unlocked levels, best scores/stars, currency). Keep them separate — gameplay re-renders shouldn't touch player/currency UI and vice versa.
- **Routes** (`src/app/(game)/`) — `map` (level select), `play/[levelId]` (gameplay), `results/[levelId]` (win/lose, reads score/stars from search params). `play`/`results` pages are server components that validate the levelId and pass data down; interactivity lives in client components (`PlayClient.tsx`).
- **UI** (`src/components/game/`) — `Board`/`Tile` render the grid with plain CSS Grid + `motion` (Framer Motion) `layout` animations, not Canvas — the board is small (~36-64 tiles) so DOM performance is fine, and this keeps React DevTools/hot-reload/accessibility for free. Swipe-to-swap plus tap-tap fallback live in `src/hooks/useSwipeInput.ts`.

## Current status: Phase 1 (core loop, no backend)

Gameplay, levels, and local-only progress are implemented and verified end-to-end (map → play → match/cascade → win/lose → results). The game is Bhutan-themed throughout: pieces are "Festival Treasures" (coral bead, turquoise, prayer leaf, butter lamp, lotus, temple bell, Thunder Dragon Orb — see `CandyIcon.tsx`), combo words ladder Tashi Delek! → Kuzuzangpo! → Druk Power!, the end-of-level bonus is "Festival Celebration!", 20 levels are named for Bhutanese places with per-region atmosphere tints (dawn/frost/festival/dusk via `decor/BhutanAtmosphere.tsx`), and ambient prayer flags/clouds/petals animate via pure CSS (composite-only, never Motion). Mechanics beyond basic match-3: ice cells (jelly-style, broken by matching on them, `breakIce` objective), special candies (striped/wrapped/color-bomb), deadlock detection + auto-reshuffle (`game-engine/reshuffle.ts`), and a sugar-crush finale (`sugarCrush` in `engine.ts` — leftover moves become striped candies that auto-detonate; bonus score counts toward stars). Sound effects are synthesized via Web Audio in `src/lib/sfx.ts` (no audio assets).

**Animation architecture (hard-won, do not regress):** board tiles are absolutely positioned and animated with x/y transform springs only — never CSS grid slots, never AnimatePresence exit animations, never opacity animations or transition delays on live tiles. All three caused interrupted-animation races that stranded tiles invisible ("holes in the board"). Clears are drawn by short-lived ghost sprites in `BoardOverlay`, and move playback is staged by `gameSessionStore` (swap → per-cascade clear/settle snapshots from the engine's `CascadeStep[]`).

No Supabase, auth, leaderboards, or monetization yet — those are Phase 2/3 per the architecture plan. Do not add backend calls into `game-engine/` or the Zustand stores without checking the plan's API-surface split (direct Supabase client for reads, Edge Functions for anything that mutates lives/currency/progress/entitlements).

## Commands

- `pnpm dev` — start the dev server
- `pnpm test` — run the game-engine unit tests (Vitest)
- `pnpm lint` — ESLint

## Conventions

- pnpm, App Router, TypeScript strict, Tailwind v4 (zero-JS config in `globals.css`), shadcn/ui when a UI kit is needed for chrome (shop/profile/leaderboard) — the game board itself is hand-built, not shadcn components.
- Game logic changes belong in `game-engine/` and must have Vitest coverage there (match detection, cascades, swap validation, scoring are all pure and cheap to test in isolation from rendering).
