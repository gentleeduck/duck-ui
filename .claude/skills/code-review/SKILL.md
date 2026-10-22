---
name: code-review
description: "Review a diff against a fixed point on two axes - Standards (does it follow what this repo documents?) and Spec (does it do what the issue asked?) - kept separate so neither masks the other. Carries the Fowler smell baseline plus the defects duck-ui's own work has turned up. Use to review a branch, a PR, work in progress, or \"review since X\"."
---

Two-axis review of the diff between `HEAD` and a fixed point the user supplies:

- **Standards**: does the code conform to what this repo documents?
- **Spec**: does the code faithfully implement what was asked?

Run both axes inline by default. Fan out to parallel sub-agents only when the user asks for it
or the diff is too large to hold at once; when you do, keep the two briefs separate so they
cannot pollute each other.

## Process

### 1. Pin the fixed point

Whatever the user said is the fixed point (a commit SHA, branch name, tag, `master`, `HEAD~5`).
If they didn't specify one, use the PR's base, and `master` when there is no PR.

Capture the diff command once: `git diff <fixed-point>...HEAD` (three-dot, so the comparison
is against the merge-base). Also note the list of commits via
`git log <fixed-point>..HEAD --oneline`.

Confirm the fixed point resolves (`git rev-parse <fixed-point>`) and the diff is non-empty
before going further.

**In a stack the base is the PR before, not `master`.** Diffing a stacked branch against
`master` reviews every PR under it again. Read the base off `gh pr view <n> --json baseRefName`.

### 2. Identify the spec source

Look for the spec in this order:

1. An issue the branch name, a commit message or the PR body names, read with
   `gh issue view <n>`, comments included.
2. A path the user passed as an argument.
3. A plan under `.github/plans/`.
4. The PR body itself, which states what the PR claims to do.
5. Ask the user. If they say there is no spec, the Spec axis reports "no spec available".

**Read the PR body against the branch.** It goes stale with every push. Check each claim it
makes: what a component now does, which export moved, which PR has to merge first.

### 3. Identify the standards sources

| Source | Owns |
|---|---|
| `CLAUDE.md` | the package map, the build and test commands, the component conventions: `cn()`, `cva()`, `displayName`, `data-slot`, import order |
| `CONTRIBUTING.md` | the comment rule, commit subjects, the PR checklist, plain ASCII in prose |
| a module's `README.md` | what that module promises, its tests, and where it departs from Radix ("Beyond Radix", "Fixed") |
| `tdd` skill | where a test goes, which runner it is under, the coverage floor |
| `pr` skill | the base branch, the commit split, commit messages, the changeset |

**Skip anything tooling already enforces.** Biome is the only linter and formatter, and
`check-types` reads the types, so formatting, import order, unused symbols and type errors
are not review findings here. Report what a human has to notice.

On top of the repo's sources, the Standards axis always carries the two baselines below. Both
are labelled heuristics ("possible Feature Envy"), never hard violations, and a documented
repo standard always overrides them.

#### The local baseline: what duck-ui's own work has turned up

Each of these was a real defect here. Match them against the diff first, because they cost
more than the generic smells:

- **An export dropped without a breaking marker**: `@gentleduck/primitives` exports every
  module's `index` and every file under `hooks/`, so a removed or renamed export is a public
  removal. It needs the `!` in the commit, the `breaking` label, and a `major` changeset.
- **A behaviour that changed with no line in the module's README**: a primitive that now differs
  from Radix says so under "Beyond Radix", and a bug it no longer has goes under "Fixed". A
  change missing from both reads to the next reviewer as a regression.
- **A condition's `false` reaching an attribute**: an id list built as `cond && id` and joined
  without filtering wrote `aria-describedby="false"`. Read every value that lands in an `aria-*`
  or `id` attribute for a branch that leaves `false`, `undefined` or an empty string.
- **A browser spec named `*.e2e.test.ts`**: bun 1.3.10 ignores `test.pathIgnorePatterns`, so
  `bun test` runs it too and fails without a browser. Playwright matches
  `**/__tests__/*.e2e.ts`.
- **A test file that leaves its roots mounted**: the next file in the same run finds focus
  trapped or a portal still open. A file that asserts on focus starts from `freshDom()` in
  `src/__tests__/dom.ts`.
- **A test that cannot fail**: every module README claims each test was proven by changing the
  code and watching it fail. Mutate the line the test is about and run it; green means unproven.
- **A tsconfig `paths` entry pointing into another package's `src`**: under TypeScript 7 the
  declaration build writes `.d.ts` files into that package's source tree.
- **A stale count in a module README**: the `<!-- tests -->` and `<!-- behaviour -->` blocks list
  each test file and its tests, so a test added, renamed or removed leaves them wrong. Recount from
  the runner at the head; never trust the README's number.
- **A byte count in a changeset that is not from the latest benchmark run**: a rebuild moves a
  module's size by a few bytes, so compare it against `results.json`.
- **A cast that structural typing would have handled**: prefer the structural type, and keep
  an `as X` only where `check-types` proves it is needed.
- **A comment that restates the code** or narrates the change. `CONTRIBUTING.md`: comments
  explain why, not what.
- **A non-ASCII character in prose or a commit**: an em dash, a curly quote, an arrow, an
  ellipsis. `CONTRIBUTING.md`, "PR checklist".

#### The generic baseline: Fowler's smells

From _Refactoring_ ch.3, for anything the local baseline does not cover. Each reads *what it
is* -> *how to fix*:

- **Mysterious Name**: a function, variable, or type whose name doesn't reveal what it does or holds. -> rename it; if no honest name comes, the design's murky.
- **Duplicated Code**: the same logic shape appears in more than one hunk or file in the change. -> extract the shared shape, call it from both.
- **Feature Envy**: a method that reaches into another object's data more than its own. -> move the method onto the data it envies.
- **Data Clumps**: the same few fields or params keep travelling together (a type wanting to be born). -> bundle them into one type, pass that.
- **Primitive Obsession**: a primitive or string standing in for a domain concept that deserves its own type. -> give the concept its own small type.
- **Repeated Switches**: the same `switch`/`if`-cascade on the same type recurs across the change. -> replace with polymorphism, or one map both sites share.
- **Shotgun Surgery**: one logical change forces scattered edits across many files in the diff. -> gather what changes together into one module.
- **Divergent Change**: one file or module is edited for several unrelated reasons. -> split so each module changes for one reason.
- **Speculative Generality**: abstraction, parameters, or hooks added for needs the spec doesn't have. -> delete it; inline back until a real need shows.
- **Message Chains**: long `a.b().c().d()` navigation the caller shouldn't depend on. -> hide the walk behind one method on the first object.
- **Middle Man**: a class or function that mostly just delegates onward. -> cut it, call the real target direct.
- **Refused Bequest**: a subclass or implementer that ignores or overrides most of what it inherits. -> drop the inheritance, use composition.

### 4. Run the two axes

**Standards brief**: report, per file or hunk, (a) every place the diff breaks something the
sources in step 3 document, citing the file and the rule; and (b) any baseline finding, named
and quoted. Distinguish a documented breach, which can be hard, from a baseline finding,
which is always a judgement call. Under 400 words.

**Spec brief**: report (a) requirements the spec asked for that are missing or partial;
(b) behaviour in the diff nobody asked for; (c) requirements that look implemented but look
wrong. Quote the spec line for each finding. Under 400 words.

If there is no spec, skip the Spec axis and say so.

### 5. Check a finding before reporting it

A deliberate decision looks identical to a defect in a diff. Before reporting, run
`git log -S` or `git blame` on the hunk and read what the commit message claimed, and read the
module README's "Beyond Radix" and "Fixed", where a departure from Radix is written down.

Two things in a diff are the user's and are reported, never edited: a `@ts-expect-error`,
and a failing test that pins a bug the user knowingly left unfixed.

### 6. Aggregate

Present the two reports under `## Standards` and `## Spec`, verbatim or lightly cleaned. Do
**not** merge or rerank findings across axes, because the two are deliberately separate.

End with a one-line summary: total findings per axis, and the worst issue _within each axis_.
Don't pick a single winner across axes: that's the reranking the separation exists to
prevent.

Posting the findings on the PR is the `pr-comment` skill's job, and only on the user's word.

## Why two axes

A change can pass one axis and fail the other:

- Code that follows every standard but implements the wrong thing -> **Standards pass, Spec fail.**
- Code that does exactly what the issue asked but breaks the project's conventions -> **Spec pass, Standards fail.**

Reporting them separately stops one axis from masking the other.
