# mastering-ts-monorepo

The working repository of a one-student masterclass: **"Becoming a TypeScript Monorepo Expert"** — an 8-module program taught by a Claude agent (the `ts-monorepo-masterclass` skill), covering the Node module system, workspaces, TypeScript configuration, packaging, task orchestration, versioning, application integration, and CI/CD, capped by six capstone projects.

This repo is the course's growing archive: every delivered lesson, every runnable demo, and all capstone work ends up here. It is **not** a monorepo itself — it _contains_ many small, independent ones.

## Layout

```
references/               The program: curriculum (8-module ToC) + capstone project definitions
courses/                  One dir per module: lesson write-ups + demos/
capstone-projects/        Work on the six capstone projects
past-student-interests/   Background explainers on topics I explored before the course
CLAUDE.md                 Agent instructions: repo identity, conventions, contracts
```

Structural conventions (naming, contracts, what agents may and may not do) live in `CLAUDE.md` — single source of truth, not repeated here.

## Where am I in the course?

- **Lessons delivered so far** = the lesson files present under `courses/*/` (e.g., `courses/3-typescript-configuration/3.4-project-references.md`). A file exists only once its lesson has actually been taught.
- **Capstone progress** lives in `capstone-projects/`.
- The full program to measure against: `references/curriculum.md` and `references/capstone-projects.md`.

## Progress

| Module | Lessons | Status |
|---|---|---|
| 1 — Foundations: Node.js module system | 1.1 – 1.5 | **all five delivered** (2026-11-01); 1.1 completed, exercises for 1.2 – 1.5 open |
| 2 — Workspaces & Package Managers | 2.1 – 2.5 | not started |

A lesson is _completed_ only once its exercises have been done and reviewed; see `courses/*/exercises/README.md` for the per-exercise status.

## Running a demo

Each demo under `courses/<module>/demos/<demo>/` is a self-contained pnpm workspace:

```bash
cd courses/3-typescript-configuration/demos/3.4-project-references-build
pnpm install        # skip if the demo's README says node_modules is fabricated
pnpm lint
pnpm typecheck
pnpm build
```

Then read the demo's README: it says what to observe, and includes a **"break it"** section — a small change to make and the failure to expect. Doing the breakage is the point.

⚠️ Some demos ship a **hand-fabricated `node_modules`** (built by the instructor to demonstrate resolution behavior). For those, don't run `pnpm install` — it would destroy the exhibit. The demo's README always says which case you're in.

## Course sessions

Sessions happen in the Claude project of the same name, where the `ts-monorepo-masterclass` skill acts as instructor. Typical prompts: _"what's next"_, _"let's do lesson 5.2"_, _"another demo for 3.4, focused on declarationMap"_, _"review my Project 1 repo"_, _"quiz me on modules 1–3"_.
