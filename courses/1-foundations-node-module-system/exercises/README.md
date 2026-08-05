# Exercises — Module 1: Foundations, Node.js Module System

Hands-on exercises, one folder per exercise, named with the lesson prefix that assigned them.

Every exercise is **self-verifying**. No dependencies, no install:

```bash
cd 1.1-a-lexer-legible-shape
node verify.mjs          # or: npm run verify
```

`verify.mjs` prints a PASS/FAIL line per criterion and exits non-zero while anything fails.
It checks the **constraints** as well as the goal — so a solution that reaches the right
behaviour by breaking a rule still fails.

## Status

| Exercise | Lesson | Tests | Status |
|---|---|---|---|
| [1.1-a — make the lexer see it](1.1-a-lexer-legible-shape/) | 1.1 interop | export shape vs runtime identity | **open** |
| [1.1-b — the callable package](1.1-b-callable-package/) | 1.1 interop | callable default + named exports | **open** |
| [1.1-c — observing a live value from CJS](1.1-c-live-value-from-cjs/) | 1.1 semantics | live values across the CJS/ESM boundary | **open** |

Difficulty is roughly a → b → c. Do them in order: b is a is with one extra constraint, and
c depends on understanding what a and b taught you about the lexer.

## Ground rules

- **Read the constraint, not just the goal.** In each case the naive fix reaches the goal and
  violates a rule. `verify.mjs` will catch it; that failure is the lesson.
- **Do not edit `verify.mjs`.** If you think a check is wrong, say so — it might be, and
  arguing it is a better exercise than passing it.
- **No solutions are stored in this repo.** The verifier is the feedback loop. Bring your
  answer for review when it passes, or when you're stuck and want to reason it out.

## Convention

```
exercises/
  <lesson>-<letter>-<slug>/
    README.md      goal, constraints, hints (progressive — no solution)
    package.json   { "type": "module", "scripts": { "verify": "node verify.mjs" } }
    *.cjs / *.mjs  the files to edit; the header comment marks which
    verify.mjs     the acceptance criteria
```

Unlike `demos/`, exercises are **not** pnpm workspaces. They are single throwaway folders
with zero dependencies, because the point is to run one command and get an answer in seconds.
