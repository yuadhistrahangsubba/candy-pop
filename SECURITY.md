# Security Policy

We take the security of Candy Pop and its players seriously.

## Supported Versions

Candy Pop is developed as a single, continuously maintained application. Only the latest
version on the `main` branch (and the current production deployment) receives security
updates.

| Version            | Supported          |
| ------------------ | ------------------ |
| `main` / latest    | :white_check_mark: |
| older commits/tags | :x:                |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, report them privately using **GitHub's private vulnerability reporting** on
this repository (Security → *Report a vulnerability*), or send a private message to the
repository owner, **[@yuadhistrahangsubba](https://github.com/yuadhistrahangsubba)**.
Please include:

- A description of the vulnerability and its potential impact
- Steps to reproduce (or a proof-of-concept)
- Any relevant logs, screenshots, or affected areas

**What to expect:**

- An acknowledgement within a few business days.
- An assessment of the report and, if accepted, a fix timeline.
- Please give reasonable time to investigate and release a fix before any public
  disclosure. You'll be credited once the issue is resolved, if you'd like.

## Good Practices

- Candy Pop is currently **Phase 1**: it runs entirely in the browser with **no backend
  and no secrets** — progress is stored only in the browser's `localStorage`.
- Once the backend lands, keep all **Supabase and Stripe keys out of version control**
  (provide them via environment variables), and rotate any secret immediately if it is
  ever exposed.
- Keep dependencies up to date and review Dependabot / advisory alerts promptly.
