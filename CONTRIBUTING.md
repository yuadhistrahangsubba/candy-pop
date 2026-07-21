# Contributing to Candy Pop

Thank you for your interest in improving **Candy Pop**. Contributions are welcome —
whether it's a bug fix, a new level, improved accessibility, or a gameplay feature.

## Getting set up

See the [Getting Started](./README.md#getting-started) section of the README for
prerequisites and how to run the project locally. Phase 1 requires no environment
variables.

## Workflow

1. **Fork** the repository and create a feature branch off `main`:
   ```bash
   git checkout -b feat/your-feature
   ```
2. **Make your changes.** Keep code typed and consistent with the surrounding
   conventions (TypeScript strict, Tailwind utility classes, Zustand stores for state,
   existing naming conventions). Keep game-rule logic in the pure `src/game-engine/` —
   no React, DOM, or backend calls belong there.
3. **Verify before you push** — all three must pass:
   ```bash
   pnpm lint      # ESLint
   pnpm build     # must compile cleanly
   pnpm test      # Vitest suite must pass
   ```
   **Any change to game rules must include or adjust the Vitest tests in
   `src/game-engine/__tests__/`.** Match detection, cascades, swap validation, and
   scoring are pure and cheap to test in isolation — a rule change without a test will
   not be merged.
4. **Commit** using clear, descriptive messages. This repo follows a
   [Gitmoji](https://gitmoji.dev)-style convention, e.g.:
   ```
   :sparkles: add wrapped-candy activation
   :bug: fix cascade multiplier off-by-one
   :video_game: add level-021 (Punakha)
   :white_check_mark: add tests for breakIce objective
   ```
5. **Open a Pull Request** against `main`. Describe **what** changed and **why**, and
   include before/after screenshots or a short clip for any UI or animation changes.

## Guidelines

- **Never commit secrets.** `.env*` files are git-ignored; do not hard-code API keys or
  credentials. (Phase 1 has none — future Supabase/Stripe keys must stay out of version
  control.)
- **Keep game rules in the engine.** All match/scoring/cascade logic belongs in the
  pure `src/game-engine/` with Vitest coverage. The UI should call into the engine, not
  reimplement its rules.
- **Discuss big changes first.** For large features or anything breaking, open an issue
  to discuss the approach before writing code.
- **Accessibility & mobile-first matter.** Preserve semantic markup, keyboard/touch
  support, and the mobile-first layout. The game is designed for small screens first.

## Reporting bugs & requesting features

- **Bugs:** open an issue with steps to reproduce, expected vs. actual behaviour, and
  your environment (browser, device).
- **Features:** open an issue describing the problem you're trying to solve, not just
  the proposed solution.

For security issues, **do not open a public issue** — see [SECURITY.md](./SECURITY.md).
