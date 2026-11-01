# Capstone Projects

Six projects designed so that, together, they cover nearly every module of the program. Each one deliberately forces different architectural choices so they can't all be solved the same way. **The only exclusion from the whole capstone track: npm publishing mechanics.** When mentoring a project, hold the student to its constraints — the constraints ARE the lesson.

**Coverage matrix logic:** Projects 1 & 4 oppose each other (project references vs path aliases), Projects 2 & 3 oppose each other (source-first vs bundled/minified), Project 5 combines strategies under production constraints, and Project 6 turns knowledge into diagnostic skill. Numbered order works as a difficulty ramp; alternatively 1→4, then 2→3, then 5→6 is a coherent "learn by contrast" path.

---

## Project 1 — "Strict Foundations": CLI toolbox monorepo

**What the student builds:** A pnpm monorepo with 3 small Node CLI tools (e.g., a file renamer, a JSON formatter, a log analyzer) sharing 2 internal libraries (`@toolbox/core`, `@toolbox/fs-utils`).

**Constraints:**

- pnpm workspaces only, **no task runner** (no Turbo/Nx) — orchestration via plain `tsc -b` and pnpm's `--filter` / `-r` flags
- **TypeScript project references** exclusively: `composite: true`, `declarationMap`, no `paths` aliases anywhere
- Pure **ESM** everywhere (`"type": "module"`, `moduleResolution: "node16"`)
- Internal packages consumed via **built output** (`dist/`), wired through minimal `exports` maps (`.` only)
- pnpm's strict mode must pass: zero phantom dependencies

**Objectives:** Understand what tooling like Turbo actually automates by living without it; master `tsc -b`, incremental builds, and go-to-definition through `declarationMap`; internalize ESM resolution rules with no bundler to paper over mistakes.

**Covers:** Modules 1, 2, 3 (especially 3.4).

---

## Project 2 — "Source-first DX": React app + design system

**What the student builds:** A Vite React app + `@ds/ui` (component library) + `@ds/tokens` (design tokens) + `@ds/hooks`.

**Constraints:**

- **No build step at all for internal packages** — the "internal packages" pattern: `exports` points directly to `.tsx`/`.ts` source files
- **No project references, no path aliases** — resolution flows entirely through `package.json` `exports` with a `"types"` condition pointing at source
- Turborepo for `dev`, `lint`, `typecheck`, `test` pipelines — note that `build` only exists for the app
- Hot reload must propagate: editing a component in `@ds/ui` refreshes the running app instantly
- Shared tsconfig base and shared ESLint flat config, each as their own workspace package

**Objectives:** Master the source-consumption pattern and its tradeoffs (great DX, but typechecking cost falls on consumers); understand how Vite resolves workspace source; learn Turbo pipelines where tasks differ per package.

**Covers:** Modules 2, 4.1, 5.2, 7.

---

## Project 3 — "Library factory": bundled packages with tsup + terser

**What the student builds:** Three standalone libraries (e.g., a validation lib, a date lib, a state machine lib) each producing distributable, minified bundles — consumed by a small demo app in the same repo. (No npm publishing — "distributable" means the `dist/` artifacts are the deliverable.)

**Constraints:**

- **tsup** builds every library: dual **ESM + CJS** output, `.d.ts` and `.d.cts` generation
- **terser** as a post-step (or via tsup's terser option) with a size budget: each lib must ship under a defined minified+gzipped size, enforced by a `size-check` script that fails the build
- Full **`exports` maps with multiple entry points** (e.g., `@lib/validate` and `@lib/validate/async`), correct condition ordering (`types` first)
- Validation gates: **arethetypeswrong** and **publint** must pass with zero errors in CI — even though nothing is published
- Tree-shaking proof: the demo app imports one function from each lib; the student must demonstrate (via bundle analysis) that unused code was eliminated (`sideEffects: false`)

**Objectives:** Master dual-format packaging and its type pitfalls; understand what minification/tree-shaking actually require from the code; treat packaging correctness as a testable property.

**Covers:** Modules 1.3, 4 (entirely), plus minification/bundle analysis.

---

## Project 4 — "The Consistency Enforcer": many-package repo with syncpack + boundaries

**What the student builds:** A deliberately wide monorepo (8–10 tiny packages: several feature packages, several shared utils) where the _content_ is trivial but the _governance_ is the point.

**Constraints:**

- **syncpack** with a config enforcing: identical versions of shared deps everywhere, pinned versions (no `^`), and pnpm **catalogs** as the single source of version truth — CI fails on any mismatch
- **Path aliases** (`paths` in a base tsconfig) as the resolution strategy this time — no project references — so the student experiences the opposite tradeoff from Project 1
- Architectural boundaries enforced by lint rules: feature packages may import utils, never each other; utils may import nothing internal — build fails on violation
- A repo-wide `pnpm audit`-style script: no package may declare a dependency it doesn't import, and vice versa (dependency hygiene check)
- One intentional exercise: a "teammate" introduces a version drift and a forbidden cross-import on a branch; CI must catch both

**Objectives:** Learn monorepo governance at scale: version alignment, dependency hygiene, architectural boundaries; feel the maintenance cost of `paths` aliases (global invisibility of package boundaries) vs their simplicity.

**Covers:** Modules 2.4, 2.5, 3.3, 6.1 (version strategy without publishing), 7.4.

---

## Project 5 — "Production pipeline": full-stack app with CI, caching, and Docker

**What the student builds:** A Next.js frontend + Fastify API + `@app/shared-types` + `@app/db` (Prisma or Drizzle wrapper), deployed as two Docker images.

**Constraints:**

- **Turborepo** with a complete pipeline: `build` depends on `^build`, `test` depends on `build`, correct `inputs`/`outputs` declared for every task
- **Remote caching** in GitHub Actions (Vercel remote cache or a self-hosted alternative) — the student must demonstrate a CI run where unchanged packages are 100% cache hits
- **Affected-only CI**: a PR touching only the API must not build/test the frontend
- Docker images built via **`turbo prune`** — each image contains only the pruned subset of the workspace + a pruned lockfile; final images must be small (multi-stage builds)
- Next.js consumes `@app/shared-types` via `transpilePackages`; the API consumes it as built output — the same package, two consumption modes
- Mixed resolution strategy on purpose: project references for the backend graph, source consumption for the frontend

**Objectives:** Master the production side: caching correctness (deliberately mis-declare an input, watch a stale cache bug appear, then fix it), affected builds, monorepo Docker. Experience mixing resolution strategies in one repo like real large codebases do.

**Covers:** Modules 5, 7.1, 8 (entirely).

---

## Project 6 (stretch) — "The Autopsy": debug a broken monorepo

**What the student builds:** Nothing — they fix. Take any earlier project, then apply a "sabotage list" of ~10 realistic breakages (the instructor provides it) and repair each one, documenting root causes.

**Sample sabotages:**

- Swap a `types` condition after `import` in an `exports` map (types silently break for consumers)
- Add a CJS-only dependency to an ESM package (interop error at runtime)
- Remove an `outputs` declaration in `turbo.json` (stale cache in CI)
- Introduce a phantom dependency that works locally with npm but breaks under pnpm
- Set `moduleResolution: bundler` on a package run directly by Node

**Objectives:** This is where expertise actually forms — pattern-matching failure modes fast. Deliverable: a written "field guide" of symptom → diagnosis → fix for each breakage.

**Covers:** Everything, especially 8.4.
