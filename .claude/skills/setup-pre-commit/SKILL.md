---
name: setup-pre-commit
description: The commit and push gates in this repo - what husky runs at each hook, what CI runs that the hooks do not, why a push can leave files unstaged, why biome can check nothing in some checkouts, and how to add or change a gate without the hook and CI drifting apart. Use when a hook fails, when asked to add a check at commit or push time, or when tempted to reach for --no-verify.
---

# The gates

Husky is already wired here. `prepare` is `husky`, so `bun install` installs the hooks, and
three exist. Husky runs each with `sh -e`, so a hook stops at its first failing line.

| Hook | Runs | Blocks |
|---|---|---|
| `pre-commit` | `bunx biome check --write .` | a commit biome cannot fix |
| `commit-msg` | `commitlint --edit` | a message that is not a conventional commit |
| `pre-push` | `bun run fix`, `bun run check`, `bun run test` | a push, on the first failure |

CI runs on every pull request into `master`, and on every push to it (`.github/workflows/main.yml`):

| Job | Runs |
|---|---|
| `lint` | `bun run check` |
| `build` | `bun run build`, then `bun run check-types` |
| `test` | `bun run test` |

`pr-title.yml` checks the PR title is a conventional commit too.
Read the root `package.json` scripts and the workflow files rather than trusting these tables:
they are the source of truth and this is a summary of them.

## What the design is protecting

- **`biome` is the only linter and formatter.** There is no prettier and no eslint. `check` is
  `biome check .`, `fix` is `biome check --write .`, `lint` is `biome lint .`, `format` is
  `biome format --write .`. Adding prettier would give the repo two formatters that disagree.
- **`fix` writes.** A formatting slip is corrected in place during the push rather than refused
  by `check` on the next line. The corrected file is left **unstaged**, so `git status` after a
  push that took a while is worth reading.
- **The push runs no types and no build.** `check-types` and `build` run only in CI. A branch
  that pushes cleanly can still fail CI, so run both before asking for review.
- **`test` reads the primitives coverage floor.** `bun run test` in
  `packages/duck-primitives` runs `vitest run --coverage`, which fails the push when the suite
  falls below the thresholds in its `vitest.config.ts`.
- **One definition for the full gate.** The root `ci` script is `check`, `lint:ws` (sherif),
  `check-types`, `test` and `build`, the same steps CI runs plus the workspace lint. `release`
  runs `ci` before it publishes.

## When a gate fails

Read what failed and fix it. An unused import or an argument count that no longer matches is the
honest signal that a refactor is half-finished, not hook noise.

Two failures look like a broken tree when nothing is wrong:

- **biome checks no files.** biome 2.5.14 matches `files.includes` against the checkout's
  absolute path, so a checkout under a dot folder (`.claude/worktrees/...`) or a `tmp` directory
  processes nothing and the hooks fail. Commit and push from a checkout at a plain path.
- **bun cannot resolve `catalog:`.** bun 1.4 fails on `catalog:` inside the `file:` dependencies
  of `@gentleduck/primitives`. Install with the version CI pins, `bunx bun@1.3.10 install`.

`--no-verify` is for the case where the gate itself is broken, not the code. It needs the
user's explicit say-so in that same message, and whatever it skipped still has to run before
the branch is anyone else's problem.

## Changing a gate

Put the step in a root `package.json` script first, then call that script from the hook and from
the workflow. A step written straight into `.husky/pre-push` runs on push and never in CI, which
is the drift the scripts exist to prevent.

Keep `pre-push` ordered cheap to expensive, so a formatting mistake fails in seconds rather than
after the tests.

## Commit messages

`commit-msg` runs commitlint with `commitlint.config.cjs`, which enforces:

- **Conventional commits**, `type(scope): subject`, with the types `feat`, `fix`, `docs`,
  `chore`, `refactor`, `perf`, `test`, `build`, `ci`, `style` and `revert`.
- A header of at most 100 characters, whose subject is not start case, pascal case or upper case.
- Body lines of at most 200 characters.

Write them in plain ASCII and explain **why**, not what. A `Co-Authored-By` trailer is never
added. Start a body paragraph with a word rather than a `word:` token, or commitlint reads the
paragraph as a footer and warns.
