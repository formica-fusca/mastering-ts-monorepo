# Program Curriculum: "Becoming a TypeScript Monorepo Expert"

This is the authoritative curriculum of the program. Follow it as the backbone. When the student asks "what's next" or "where are we", locate their position in this ToC.

## Module 1 — Foundations: Node.js Module System

1.1 CommonJS vs ESM: history, syntax, interop rules
1.2 The `node_modules` resolution algorithm
1.3 `package.json` anatomy: `main`, `exports`, `types`, `files`, conditional exports
1.4 Hoisting, phantom dependencies, and why they cause bugs
1.5 Lockfiles and deterministic installs

## Module 2 — Workspaces & Package Managers

2.1 npm / yarn / pnpm workspaces compared
2.2 pnpm deep dive: content-addressable store, symlinked strictness
2.3 The `workspace:*` protocol and internal linking
2.4 Managing shared and peer dependencies across packages
2.5 Keeping versions aligned (syncpack, catalogs in pnpm)

## Module 3 — TypeScript Configuration Mastery

3.1 `tsconfig.json` essentials: `strict`, `target`, `module`, `lib`
3.2 Module resolution modes: `node16`, `nodenext`, `bundler`
3.3 `paths` aliases vs project references: tradeoffs
3.4 Project references: `composite`, `incremental`, `declarationMap`, build mode (`tsc -b`)
3.5 Shared base tsconfigs as workspace packages

## Module 4 — Building & Publishing Packages

4.1 Compiled packages vs "internal packages" (consuming source directly)
4.2 Bundling libraries: tsup, unbuild, plain tsc
4.3 Dual ESM/CJS publishing and the `exports` map
4.4 Validating your package: arethetypeswrong, publint
4.5 Type declaration pitfalls (declaration merging, `.d.ts` resolution)

## Module 5 — Task Orchestration & Caching

5.1 The task graph mental model: inputs, outputs, hashing
5.2 Turborepo: pipelines, `dependsOn`, filters, pruning
5.3 Nx: project graph, executors, affected commands, module boundaries
5.4 Local vs remote caching; cache invalidation pitfalls
5.5 When to consider Bazel/moonrepo (scaling context)

## Module 6 — Versioning & Releases

6.1 SemVer in a monorepo: fixed vs independent versioning
6.2 Changesets: workflow, changelogs, automation
6.3 Publishing to npm and private registries
6.4 Pre-releases, snapshots, canary versions

## Module 7 — Application Integration & DX

7.1 Consuming workspace packages in Next.js (`transpilePackages`), Vite, Node
7.2 Watch mode and hot reload across package boundaries
7.3 Shared ESLint (flat config), Prettier, and test configs
7.4 Enforcing architectural boundaries between packages

## Module 8 — CI/CD & Production

8.1 Affected-only builds and tests in CI
8.2 Remote caching in GitHub Actions / GitLab CI
8.3 Docker builds from a monorepo (`turbo prune`, pruned lockfiles)
8.4 Debugging classic failure modes: ESM/CJS interop errors, broken type resolution, stale caches

## Capstone Projects

The single capstone was replaced by six capstone projects (student's request). See `references/capstone-projects.md` for the full definitions. Note: npm publishing mechanics are explicitly excluded from the capstones.

---

## Appendix — Official References

There are essentially no books dedicated to TS monorepos — the ecosystem moves too fast, so official docs are the canonical sources. Point the student to the relevant reference at the end of each lesson.

**Core docs (must-read)**

- TypeScript Handbook & reference — typescriptlang.org/docs (especially the _Project References_ and _Modules Reference_ sections)
- TSConfig reference — typescriptlang.org/tsconfig
- Node.js docs: _Modules: Packages_ (the `exports` field spec) and _ECMAScript modules_ — nodejs.org/api/packages.html
- pnpm docs: _Workspaces_, _Catalogs_, _Settings_ — pnpm.io
- Turborepo docs & handbook — turborepo.com/docs (the "Crafting your repository" guide is excellent)
- Nx docs — nx.dev (concepts section: project graph, caching, affected)
- Changesets docs — github.com/changesets/changesets

**Secondary but highly authoritative**

- npm docs: workspaces, `package.json` spec — docs.npmjs.com
- "Are the Types Wrong" docs & FAQ — arethetypeswrong.github.io (explains dual-publishing type pitfalls better than anything else)
- publint — publint.dev (rules explain packaging best practices)
- Total TypeScript's free articles/book by Matt Pocock — totaltypescript.com (not "official," but the closest thing to a canonical modern TS learning resource; his _TS config cheat sheet_ and module/`exports` guides are widely cited)
- Vite and Next.js docs on monorepo/library mode — vitejs.dev, nextjs.org

**Books worth knowing (adjacent, not monorepo-specific)**

- _Effective TypeScript_ (Dan Vanderkam, O'Reilly) — the best TS book, includes items on module design and declarations
- _Programming TypeScript_ (Boris Cherny, O'Reilly) — solid foundations
