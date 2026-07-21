# Candy Pop — Bhutan-themed Match-3

**Candy Pop** is a Candy Crush-style match-3 puzzle game for mobile web — built as a
real product aimed at players and revenue, not a toy project. It pairs a hand-built,
animated game board with a pure-TypeScript rules engine, and is played across 20
handcrafted levels themed around the places of Bhutan.

---

## About the game

Every level in Candy Pop is named for a place in Bhutan, and clearing one greets you
with a **"Tashi Delek!"** win banner — a small nod to the country the game is themed
around. Swap adjacent candies to make runs of three or more, chain cascades for big
combo scores, break through ice, and hit each level's objectives before you run out of
moves. Win with moves to spare and the **Sugar Crush** finale detonates your leftover
moves for bonus points and stars.

---

## Features

### Available now (Phase 1)
- **Level-select map** — pick from 20 Bhutan-themed levels, with unlock progression.
- **Match & cascade engine** — swap-to-match, gravity, refills, and multi-step combo
  cascades, plus striped / wrapped / color-bomb special candies.
- **Objectives** — score targets, collect-a-color, and break-the-ice goals per level.
- **Win / lose / results flow** — full loop from map → play → results with 0-3 stars.
- **Local progression** — unlocked levels, best scores, and stars persist to
  `localStorage`.
- **Mobile-first & animated** — swipe-to-swap with a tap-tap fallback, spring-animated
  tiles, and synthesized Web Audio sound effects.

### Planned / roadmap (not yet built)
- **Accounts & cloud sync** — Supabase auth and persisted, cross-device progression.
- **Leaderboards** — competitive per-level and global rankings.
- **Monetization** — opt-in rewarded ads and Stripe in-app purchases.

> Phase 1 runs entirely in the browser: there is **no login, no server, and no
> monetization yet**. Progress lives only in your browser's `localStorage`.

---

## Tech Stack

| Area          | Technology |
| ------------- | ---------- |
| Framework     | [Next.js 16](https://nextjs.org) (App Router) + [React 19](https://react.dev) |
| Language      | TypeScript (strict) |
| Styling       | [Tailwind CSS v4](https://tailwindcss.com), [shadcn/ui](https://ui.shadcn.com) + [Base UI](https://base-ui.com) |
| Animation     | [Motion](https://motion.dev) (Framer Motion) |
| State         | [Zustand](https://zustand-demo.pmnd.rs) |
| Validation    | [Zod](https://zod.dev) |
| Testing       | [Vitest](https://vitest.dev) |
| Icons         | Lucide |
| Backend       | [Supabase](https://supabase.com) (Postgres + Auth) — *planned, not yet wired* |

---

## Architecture

The heart of the game is the **pure-TypeScript game engine** in `src/game-engine/` —
zero React and zero DOM imports, fully unit-tested with Vitest. It is the **single
source of truth for game rules**: match detection, swap validation, cascade resolution,
special candies, objectives, scoring, deadlock reshuffling, and seeded RNG all live
here. The UI never duplicates match or scoring logic; it calls into the engine and
animates the `CascadeStep[]` timeline the engine returns. Keeping the rules pure and
framework-free is what makes them cheap and reliable to test in isolation from
rendering.

---

## Getting Started

### Prerequisites
- **Node.js** 20+
- **pnpm** (this repo uses a pnpm lockfile)

### 1. Install dependencies

```bash
pnpm install
```

### 2. Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to play.

> **No environment variables are required in Phase 1** — the game is fully client-side
> and stores progress in `localStorage`. Supabase and Stripe keys will only be needed
> once the backend lands in a later phase.

---

## Testing

Game-rule logic is covered by Vitest unit tests that live alongside the engine.

```bash
pnpm test         # run the full test suite once
pnpm test:watch   # re-run tests on change
```

Because the engine is pure TypeScript, tests run fast and don't touch the DOM. Any
change to game rules should be accompanied by tests here.

---

## Scripts

| Command           | Description |
| ----------------- | ----------- |
| `pnpm dev`        | Start the development server |
| `pnpm build`      | Build for production |
| `pnpm start`      | Run the production build |
| `pnpm lint`       | Run ESLint |
| `pnpm test`       | Run the Vitest suite once |
| `pnpm test:watch` | Run Vitest in watch mode |

---

## Project Structure

```
src/
├─ game-engine/     # Pure-TS rules: match, swap, resolve, specials, scoring… (+ __tests__)
├─ stores/          # Zustand stores (ephemeral game session + persisted player state)
├─ levels/          # 20 static level-###.json files, Zod-validated (+ __tests__)
├─ components/      # UI, including the hand-built game board & tiles
├─ hooks/           # Input hooks (swipe-to-swap, tap fallback)
├─ lib/             # Shared utilities (Web Audio sfx, helpers)
└─ app/(game)/      # Routes: map (level select), play/[levelId], results/[levelId]
```

---

## Roadmap

Candy Pop is being built in four phases:

1. **Phase 1 — Core loop, no backend.** *(current)* Engine, DOM renderer, swipe input,
   animations, 20 levels, local-only progress.
2. **Phase 2 — Supabase wiring.** Anonymous auth with account linking, Postgres schema
   with row-level security, cross-device progress sync, and leaderboards.
3. **Phase 3 — Monetization.** Opt-in rewarded ads and Stripe in-app purchases, plus a
   lives system.
4. **Phase 4 (stretch).** Special+special combos, more obstacle/objective types, daily
   challenges, and a possible native wrapper for app-store distribution.

---

## Contributing

Contributions are welcome — bug fixes, new levels, accessibility improvements, or
gameplay features. Please read the **[Contributing Guide](./CONTRIBUTING.md)** for the
workflow, commit conventions, and guidelines before opening a pull request.

## Security

Found a vulnerability? **Do not open a public issue.** Please follow the
responsible-disclosure process in our **[Security Policy](./SECURITY.md)**.

## License

All rights reserved. See the **[LICENSE](./LICENSE)** file — usage is not permitted
without prior written permission except for contributions intended to be merged back
into the project. Contact the repository owner for licensing enquiries.

---

<p align="center"><em>Tashi Delek! — good luck, and happy matching.</em></p>
