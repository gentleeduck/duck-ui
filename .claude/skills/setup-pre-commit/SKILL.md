---
name: setup-pre-commit
description: The commit and push gates in this repo - what husky runs at each hook, why test:coverage and not test, why a push can leave files unstaged, and how to add or change a gate without letting the hook and CI drift apart. Use when a hook fails, when asked to add a check at commit or push time, or when tempted to reach for --no-verify.
---

# The gates

Husky is already wired here. `prepare` is `husky`, so `bun install` installs the hooks, and
three exist.

| Hook | Runs | Blocks |
|---|---|---|
| `commit-msg` | `commitlint --edit` | a message that is not a conventional commit, or carries a non-ASCII codepoint |
| `pre-commit` | `lint`, then `format` | a commit, on the first failure |
| `pre-push` | `lint`, `format`, `fix`, `check`, `check-types`, `test:coverage`, `build` | a push, on the first failure (`set -e` is explicit in the file) |

Every one of those is a root `package.json` script. Read them there rather than trusting this
table: the scripts are the source of truth and this is a summary of them.

## What the design is protecting

- **`biome` is the only linter and formatter.** There is no prettier, no eslint, no
  lint-staged, and nothing stages a subset of files. `lint` is `biome lint .`, `format` is
  `biome format --write .`, `fix` is `biome check --write .`, `check` is `biome check .`.
  Adding prettier would give the repo two formatters that disagree.
- **`format` and `fix` write.** A formatting slip is corrected in place during the push rather
  than refused by `check` two lines later. The corrected file is left **unstaged**, so
  `git status` after a push that took a while is worth reading.
- **`test:coverage`, not `test`.** A threshold is only read when coverage is collected.
  Thresholds live in each package's own `vitest.config.ts`, set at what that package measures
  rather than at an aspiration. They are a ratchet: raise one as coverage rises, and read a
  drop as the thing to fix rather than the number to lower. A package with no tests has no
  threshold, because a gate over nothing measures nothing.
- **Neither infrastructure tier is in a hook.** `test:e2e` wants Docker, a seeded database and
  a build, and every integration file truncates one shared Postgres, so two runs at once fail
  each other. Both run at `--concurrency=1`, from CI or from `bun run verify`.
- **One definition, so the hook and CI cannot drift.** `ci` is
  `check && check-types && test:coverage && build`. `verify` is `ci` plus the two
  infrastructure tiers. The hook runs the same scripts CI does.

## When a gate fails

Read what failed and fix it. The gates have caught real defects, and two failure shapes look
like a broken tree when nothing is wrong:

- **Parallel `check-types --force` runs** read a mid-write `dist` and emit a TS2307 storm.
  One run at a time.
- **Two integration or e2e runs at once** truncate each other's database. That is the
  `--concurrency=1` above, and a second run started by hand defeats it.

An unused import or an argument count that no longer matches is the honest signal that a
refactor is half-finished, not hook noise.

`--no-verify` is for the case where the gate itself is broken, not the code. It needs the
user's explicit say-so in that same message, and whatever it skipped still has to run before
the branch is anyone else's problem.

## Changing a gate

Put the step in the root `ci` or `verify` script first, then reference that script from the
hook. A step written straight into `.husky/pre-push` runs on push and never in CI, which is
the drift the two scripts exist to prevent.

`.husky/pre-push` keeps `set -e` and its current order: the cheap checks come before the
expensive ones, so a formatting mistake fails in seconds rather than after a build.

## Commit messages

`commit-msg` runs commitlint, which enforces:

- **Conventional commits**, `type(scope): subject`.
- **Plain ASCII only**, subject and body. The `ascii-only` rule rejects an em dash, a curly
  quote, an arrow or an ellipsis character, and names the codepoint it found.
- Explain **why**, not what. The diff shows what.

A `Co-Authored-By` trailer is never added. Start a body paragraph with a word rather than a
`word:` token, or commitlint reads the paragraph as a footer and warns.
