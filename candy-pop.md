# Candy Pop — Project Documentation

## What this is

Candy Pop is a Candy Crush-style match-3 mobile web game, built as a real
product aimed at users and revenue, not a toy project. It's a Next.js (App
Router) mobile-first web app, Bhutan-themed (20 levels named for Bhutanese
places, "Tashi Delek!" as the win banner).

- **Repo**: https://github.com/yuadhistrahangsubba/candy-pop (public)
- **Stack**: Next.js 16 (App Router), React 19, TypeScript strict, Tailwind
  v4, Zustand, Zod, Framer Motion (`motion`), Vitest, pnpm.
- **Planned backend** (not yet built): Supabase (Postgres + Auth + Edge
  Functions) for accounts, persisted progression, and leaderboards.

## Current status: Phase 1 of 4

Phase 1 — the core game loop with no backend — is implemented and verified
end-to-end: map (level select) → play → match/cascade resolution → win/lose →
results. Progress and best scores persist locally (`localStorage`) only.
There is no login, no server, no monetization yet.

Remaining phases (see "Roadmap" below): Supabase wiring (accounts, sync,
leaderboards), real monetization (ads + Stripe IAP), and stretch features
(special-candy combos, daily challenges, more objective/obstacle types).

## Architecture

### Game engine — `src/game-engine/`

Pure TypeScript, zero React/DOM imports, fully unit-tested with Vitest. This
is the single source of truth for game rules; UI code never duplicates
match/scoring logic.

- `types.ts` — core data model: `Board` (grid of `Cell`s plus a parallel
  `ice` layer grid), `Tile` (`color` + optional `special`), `LevelDefinition`,
  `CascadeStep`/`ResolveResult` (animation-ready cascade playback data).
- `board.ts` — board construction/cloning/cell access helpers.
- `match.ts` — finds horizontal/vertical runs of ≥3 same-color tiles and
  merges L/T-shaped overlaps into one `MatchGroup`, deciding whether the
  match creates a special candy.
- `swap.ts` — move validation: a swap is legal only if it produces at least
  one match.
- `resolve.ts` — runs the match → clear → gravity → refill cascade loop
  until the board is stable, producing a `CascadeStep[]` timeline for the UI
  to animate.
- `specials.ts` — special-candy creation and activation: 4-in-a-row makes a
  striped candy (clears a row or column), 5-in-a-row or a T/L shape makes a
  wrapped or color-bomb candy. MVP ships single-special activation only —
  special+special combos are a planned fast-follow, not implemented yet.
- `objectives.ts` — pluggable objective evaluators, currently `scoreTarget`,
  `collectColor`, and `breakIce` (see `evaluators` in `objectives.ts`).
- `scoring.ts` — `SCORE_PER_TILE = 10`, `SPECIAL_ACTIVATION_BONUS = 50`, and
  a cascade multiplier (`1 + cascadeIndex * 0.5`) that rewards longer combo
  chains within a single move.
- `reshuffle.ts` — deadlock detection (`hasValidMove`) and automatic
  reshuffling when no legal move exists.
- `rng.ts` — seeded RNG (`createRng`), so levels can optionally pin
  `rngSeed` for deterministic boards/tests.
- `engine.ts` — the orchestrator the UI calls into:
  - `createGameSession(level)` — builds the initial board (auto-reshuffles
    if it starts deadlocked) and session state (`movesLeft`, `score`,
    `collectedColors`, `iceBroken`).
  - `attemptMove(session, a, b)` — validates and applies a swap, resolves
    cascades, updates objective progress, and reports `won`/`lost`/`stars`
    plus a `timeline` for animation playback. Invalid swaps are a no-op that
    still returns current objective progress.
  - `starsForScore(level, score)` — 0-3 stars from `level.starThresholds`
    (must be strictly increasing, enforced by the level schema).
  - `sugarCrush(session)` — end-of-level bonus: every leftover move
    converts a random non-special candy into a striped candy, then every
    special on the board detonates in one grand cascade. The bonus score
    counts toward the level's star rating.

### Game mechanics

- **Board & tiles**: a grid (`boardWidth` × `boardHeight`, 3-12 per side) of
  colored candies (3-6 colors, from `CANDY_COLORS` = red/blue/green/yellow/
  purple/orange). Cells can be permanently `blocked` (unplayable) or carry
  `ice` layers (jelly-style obstacle: candies on iced cells swap and fall
  normally; matching on an iced cell breaks one ice layer, tracked toward
  `breakIce` objectives).
- **Specials**: striped-h / striped-v (clears a row/column), wrapped
  (clears a surrounding block), color-bomb (clears all tiles of one color).
  Created by 4-/5-tile matches or L/T shapes; activated by swapping/matching
  them into play.
- **Objectives**: each level defines 1+ objectives (`scoreTarget`,
  `collectColor` with a target `color`, `breakIce`), all of which must be
  complete to win before `moveLimit` runs out.
- **Deadlock handling**: if no legal swap exists, the board silently
  reshuffles into a playable arrangement (`reshuffle.ts`), both at level
  start and mid-play.
- **Sugar Crush finale**: when a level is won with moves remaining, leftover
  moves become bonus striped candies that all detonate together before the
  results screen, adding to the final score/star count.
- **Sound**: synthesized via Web Audio in `src/lib/sfx.ts` — no audio asset
  files.

### Levels — `src/levels/`

Static JSON, not a CMS. `level-001.json` … `level-020.json`, each validated
against a Zod schema (`schema.ts`) covering board size, color count,
blocked/ice cell bounds, objective shape (e.g. `collectColor` requires a
`color`; `breakIce`'s target can't exceed the number of ice cells), and
strictly increasing `starThresholds`. `index.ts` imports and re-exports all
levels. **To add a level: drop a new `level-###.json` and import it in
`index.ts` — no other code changes needed.**

### State — `src/stores/`

Two scoped Zustand stores, kept deliberately separate so gameplay re-renders
never touch player/currency UI and vice versa:

- `gameSessionStore` — ephemeral per-run state wrapping the engine (board,
  score, moves, cascade playback staging).
- `playerStore` — persisted to `localStorage`: unlocked levels, best
  scores/stars per level, currency.

### Routes — `src/app/(game)/`

- `map` — level select.
- `play/[levelId]` — gameplay; server component validates the `levelId` and
  loads the level, interactivity lives in the client component
  `PlayClient.tsx`.
- `results/[levelId]` — win/lose screen, reads score/stars from search
  params.

### UI — `src/components/game/`

`Board`/`Tile` render the grid with plain CSS Grid + Framer Motion `layout`
animations — not Canvas. The board is small (~36-64 tiles), so DOM
performance is fine, and this keeps React DevTools/hot-reload/accessibility
for free. Swipe-to-swap plus a tap-tap fallback live in
`src/hooks/useSwipeInput.ts`.

**Animation architecture (hard-won — do not regress):** board tiles are
absolutely positioned and animated with x/y transform springs only — never
CSS grid slots, `AnimatePresence` exit animations, opacity animations, or
transition delays on live tiles. All three caused interrupted-animation
races that stranded invisible tiles ("holes in the board"). Clears are
drawn by short-lived ghost sprites in `BoardOverlay`; move playback is
staged by `gameSessionStore` from the engine's per-cascade `CascadeStep[]`.

## Commands

```
pnpm dev          # start the dev server
pnpm test         # run game-engine unit tests (Vitest)
pnpm test:watch   # watch mode
pnpm lint         # ESLint
pnpm build        # production build
```

## Conventions

- pnpm, App Router, TypeScript strict, Tailwind v4 (zero-JS config in
  `globals.css`), shadcn/ui for chrome UI (shop/profile/leaderboard) when
  needed — the game board itself is hand-built, not shadcn components.
- Game-rule changes belong in `game-engine/` with Vitest coverage there
  (match detection, cascades, swap validation, scoring are pure and cheap
  to test in isolation from rendering).
- No backend calls belong inside `game-engine/` or the Zustand stores.

## Roadmap (planned, not yet built)

1. **Phase 1 — Core loop, no backend.** ✅ Done: engine, DOM renderer, swipe
   input, animations, 20 levels, local-only progress.
2. **Phase 2 — Supabase wiring.** Anonymous auth with later account
   linking, Postgres schema + RLS (`profiles`, `levels`,
   `player_level_progress`, `player_state`, `leaderboard_entries`,
   `purchases`, `sku_catalog`, `ad_events`, `game_events`), progress sync,
   leaderboards, PWA installability/offline sync via Serwist. Client never
   writes scores directly — `startLevelAttempt`/`submitLevelResult` are
   Edge Functions with bounds-checking/rate-limiting anti-cheat.
3. **Phase 3 — Real monetization.** Rewarded-video ad network integration
   (vendor spike needed — most native SDKs aren't web-first), Stripe
   Checkout + webhook-driven entitlements for IAP SKUs (`remove_ads`,
   `lives_refill`, booster packs, a discounted `starter_pack`,
   `hard_currency_bundle`). Lives system: 5 max, -1 per failed attempt, +1
   per 30 min regen, refillable via ad or IAP.
4. **Phase 4 (stretch)** — special+special combo interactions, more
   obstacle/objective types, daily challenges, evaluate a native wrapper
   (Capacitor/TWA) if app-store distribution becomes a goal.

Business model target: guest-first anonymous auth (no signup friction),
monetized via non-intrusive rewarded ads (opt-in, never after a failure,
never in the first 5-10 levels) plus IAP through Stripe (web PWA, not an
app-store binary, so native IAP frameworks don't apply).
