# Project structure — mastering-ts-monorepo

This file maps the knowledge base of this project. The teaching behavior itself is defined by the `ts-monorepo-masterclass` skill; this document only describes where things live and the conventions for each location.

```
./README.md                  # Project overview (todo)
./references/                # Course backbone
./courses/                   # One dir per module: delivered lessons + demo monorepos
./projects/                  # Capstone project materials
./past-student-interests/    # Agent-written explainers on the student's past curiosities
```

## `./README.md`

Project overview. **Status: todo** — to be written once the structure stabilizes.

## `./references/`

The authoritative course program:

- `curriculum.md` — the 8-module Table of Contents of "Becoming a TypeScript Monorepo Expert", plus the official references appendix.
- `capstone-projects.md` — the six capstone projects with constraints, objectives, and coverage matrix.

These are the source of truth for the program. Lessons and projects are always situated relative to them.

## `./courses/`

One directory per curriculum module, containing that module's delivered lessons and its demo monorepos.

```
courses/
  3-typescript-configuration/
    3.1-tsconfig-essentials.md
    3.4-project-references.md
    demos/
      3.4-project-references-build/
        README.md
        package.json
        pnpm-workspace.yaml
        packages/...
```

Conventions:

- **Module dirs** are prefixed with the module number: `1-foundations-node-module-system/`, `5-task-orchestration-caching/`, etc.
- **Lesson files** sit at the module dir root (no deeper nesting) and keep their full ToC prefix — `3.4-project-references.md` — so a file is self-locating even out of context. A lesson file exists only once that lesson has actually been delivered in a session; presence means _presented_, not necessarily _mastered_. Content: concept, mechanism, examples, the exercise assigned, key takeaways.
- **`demos/`** inside each module dir holds small runnable monorepos demonstrating that module's concepts. Named with the lesson prefix when tied to one lesson (`3.4-project-references-build/`), or a concept slug when spanning the module (`esm-cjs-interop/`).
- **No demo quota, no demo cap.** A lesson may have zero demos (purely conceptual items need none) or several — `3.4-project-references-build/`, `3.4-declaration-maps-navigation/`, `3.4-composite-cycle-error/` can coexist, notably when the student asks for another angle on the same lesson. The descriptive slug after the prefix is what disambiguates them: each demo's slug must state the specific facet it exhibits.

### The demo contract

Every demo is a minimal pnpm monorepo honoring four rules:

1. **Runnable in under a minute** — `pnpm install`, then root scripts `lint`, `typecheck`, `build`.
2. **Stable interface, module-specific internals** — the root scripts are always the same, but what orchestrates them underneath is the module's lesson: plain `tsc -b` and `pnpm --filter` in early modules, Turbo pipelines once Module 5 is reached.
3. **Minimal** — 2–4 tiny packages, just enough to exhibit the concept, nothing decorative.
4. **README with a "break it" section** — each README states which lesson(s) the demo demonstrates, what to observe when the tasks run, and one small change to make that breaks it, with the failure to expect. A demo you can't break isn't teaching much.

## `./projects/`

Materials for the capstone projects: per-project notes, plans, reviews, and (for Project 6) the sabotage list and the resulting field guide. Refer to `./references/capstone-projects.md` for each project's constraints — the constraints are binding.

## `./past-student-interests/`

Markdown explainers written by _another agent_ on topics the student was once curious about. **Not** the student's own notes: treat them as an interest map and calibration signal, never as evidence of mastery. See the skill for how to use them pedagogically.
