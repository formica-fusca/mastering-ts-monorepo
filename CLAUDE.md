# CLAUDE.md — mastering-ts-monorepo

## What this repo is

The knowledge repository of a one-student masterclass, **"Becoming a TypeScript Monorepo Expert"**, taught by the `ts-monorepo-masterclass` skill. It archives delivered lessons, runnable demo monorepos, and capstone project work. The program itself (8-module curriculum + six capstone definitions) lives in `references/` and is the source of truth for course content.

## What this repo is NOT — read before acting

- **It is not a monorepo.** There is no root `package.json`, no root lockfile, no root tasks — _by design_. Never add them, and don't treat their absence as something to fix.
- **Demos are independent.** Each directory under `courses/*/demos/*` is a self-contained pnpm workspace. Always `cd` into a demo to install or run anything; nothing is orchestrated across demos.
- **Some `node_modules` are exhibits.** Certain demos ship a hand-fabricated `node_modules` committed on purpose (to demonstrate resolution behavior, phantom dependencies, store layouts...). **Never delete, gitignore, "clean up", or `pnpm install` over a fabricated `node_modules`** — that destroys the lesson. Every demo README declares whether its `node_modules` is fabricated (do not touch) or installable (run `pnpm install`).
- **Scan with pruning.** Repo-wide `find`/`grep` must exclude `node_modules` (e.g., `find . -name node_modules -prune -o -print`); the nested demos make an unpruned scan enormous.

## Structure

```
./README.md                  # Human-facing overview: what this is, how to run demos
./references/                # curriculum.md (8-module ToC + official refs) and capstone-projects.md
./courses/                   # One dir per module: delivered lessons + demos/
./capstone-projects/         # Capstone project materials
./past-student-interests/    # Agent-written explainers on the student's past curiosities
```

## `references/`

The authoritative program. Lessons, demos, and capstone work are always situated relative to `curriculum.md` (Table of Contents + official references appendix) and `capstone-projects.md` (six projects; their constraints are binding; npm publishing is out of scope for the whole capstone track).

## `courses/`

One directory per curriculum module, prefixed with the module number: `1-foundations-node-module-system/`, `3-typescript-configuration/`, `5-task-orchestration-caching/`...

**Lesson files** sit at the module dir root (no deeper nesting) and keep their full ToC prefix — `3.4-project-references.md` — so a file is self-locating even out of context. A lesson file exists only once that lesson has actually been delivered in a session; presence means _presented_, not necessarily _mastered_. Content: concept, mechanism, examples, the exercise assigned, key takeaways. The set of lesson files present is the record of course progress.

**`demos/`** inside each module dir holds small runnable monorepos demonstrating that module's concepts. Naming: lesson prefix + a slug stating the specific facet exhibited (`3.4-project-references-build/`, `3.4-composite-cycle-error/`), or a concept slug when spanning the module (`esm-cjs-interop/`). **No quota, no cap**: a lesson may have zero demos or several — additional angles on an already-covered lesson are legitimate, notably at the student's request; slugs disambiguate.

### The demo contract

Every demo honors five rules:

1. **Runnable in under a minute** — `pnpm install` (unless `node_modules` is fabricated), then root scripts `lint`, `typecheck`, `build`.
2. **Stable interface, module-specific internals** — the three root scripts are always the same, but what orchestrates them underneath is the module's lesson: plain `tsc -b` and `pnpm --filter` in early modules, Turbo pipelines from Module 5 on.
3. **Minimal** — 2–4 tiny packages, just enough to exhibit the concept, nothing decorative.
4. **README required**, declaring: the lesson(s) demonstrated; how to run it; whether `node_modules` is fabricated (do not touch) or installable; what to observe; and a **"break it" section** — one small change to make and the failure to expect. A demo you can't break isn't teaching much.
5. **Verified before shipping** — the author (instructor agent) must have installed it, run the three tasks, and triggered the documented breakage.

### The exercise contract

<!-- Reconstructed from the course methodology — if a refined version of this
     contract existed in the previous CLAUDE.md, restore that wording here. -->

Every delivered lesson ends with a hands-on exercise the student performs in a scratch repo, favoring break-and-observe over build-from-scratch. The exercise statement is recorded in the lesson file, and the instructor offers to review the result in a later session; a lesson counts as _completed_ (vs merely _presented_) only once its exercise has been done and reviewed.

## `capstone-projects/`

Materials for the six capstone projects defined in `references/capstone-projects.md`: per-project plans, work, reviews, and (for Project 6) the sabotage list and the resulting field guide. One subdirectory per project, named after it. Hold all work to each project's stated constraints — the constraints are the pedagogy.

## `past-student-interests/`

Markdown explainers written by _another agent_ on topics the student was once curious about — **not** the student's own notes. Treat them as an interest map and calibration signal, never as evidence of mastery: never skip curriculum material because a file already covers it; do use them as hooks, check-in questions, and level calibration (the `ts-monorepo-masterclass` skill details the pedagogy).
