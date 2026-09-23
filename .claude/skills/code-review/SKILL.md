---
name: code-review
description: "Review a diff against a fixed point on two axes - Standards (does it follow what this repo documents?) and Spec (does it do what the ticket asked?) - kept separate so neither masks the other. Carries the Fowler smell baseline plus the findings that have actually recurred in IRYSS audits. Use to review a branch, a PR, work in progress, or \"review since X\"."
---

Two-axis review of the diff between `HEAD` and a fixed point the user supplies:

- **Standards**: does the code conform to what this repo documents?
- **Spec**: does the code faithfully implement the originating ticket?

Run both axes inline by default. **This repo's standing preference is no subagents**, so
fan out to parallel sub-agents only when the user asks for it or the diff is too large to
hold at once; when you do, keep the two briefs separate so they cannot pollute each other.

## Process

### 1. Pin the fixed point

Whatever the user said is the fixed point (a commit SHA, branch name, tag, `main`, `HEAD~5`).
If they didn't specify one, ask.

Capture the diff command once: `git diff <fixed-point>...HEAD` (three-dot, so the comparison
is against the merge-base). Also note the list of commits via
`git log <fixed-point>..HEAD --oneline`.

Confirm the fixed point resolves (`git rev-parse <fixed-point>`) and the diff is non-empty
before going further.

**`main` is routinely the wrong fixed point here.** Branches stack on a feature branch, and
`main` has been 150 commits behind the branch every recent PR targeted. The `pr` skill, step 1,
is how you find the real one: check what merged PRs actually based on, then confirm with a
commit count that matches the work on the branch rather than someone else's history.

### 2. Identify the spec source

The issue tracker is **Linear**, reached through its MCP tools. Look for the spec in this
order:

1. An `IRY-` id in the branch name, the commit messages, or the PR body, read with
   `mcp__linear__get_issue`.
2. A path the user passed as an argument.
3. A plan under `docs/business-architecture/`, which is where a module's intended behaviour
   is written down before it is built.
4. Ask the user. If they say there is no spec, the Spec axis reports "no spec available".

A ticket assigned to someone else is still a valid spec to review against. Check `assignee`
before proposing code, because writing it is that person's job.

### 3. Identify the standards sources

This repo documents its standards in four places, and they are the authority:

| Source | Owns |
|---|---|
| `CLAUDE.md` | toolchain, imports, test placement, gates, env vars, commits, the comment policy |
| `building-a-module` skill | the order the work has to happen in, the schema and IAM rules |
| `docs/business-architecture/modules/01-commerce-api/patterns.md` | the internal shape every module follows |
| `tdd` skill | which layer a test belongs at, the harnesses, the coverage ratchet |
| `pr` skill | base branch, the commit split, commit message rules |

A module's own `README.md` is the local authority for that module.

**Skip anything tooling already enforces.** Biome is the only linter and formatter, and
`check-types` reads the types, so formatting, import order, unused symbols and type errors
are not review findings here. Report what a human has to notice.

On top of the repo's sources, the Standards axis always carries the two baselines below. Both
are labelled heuristics ("possible Feature Envy"), never hard violations, and a documented
repo standard always overrides them.

#### The local baseline: what IRYSS audits keep finding

Each of these was a real defect here more than once. Match them against the diff first,
because they cost more than the generic smells:

- **Fail-open catch**: a `catch` that swallows and continues, so a refusal becomes a pass. A
  fail-closed catch is deliberate and fine; a fail-open one is a security bug.
- **Hand-thrown ORM error**: `.orNull()` plus a hand-thrown error, or catch-and-rethrow,
  instead of the `errors()` rename table that turns a generated code into a module code.
- **Drizzle at a call site**: raw drizzle, or a bespoke wrapper around a table (a status
  setter, a filter-scoped list). Widen the ORM instead, never through the query DTO.
- **A route that grants nobody**: a capability no role holds is a dead route that type-checks
  and whose tests pass. Also check `action` then `resource` come first in the decorator
  object, in single quotes, or the coverage test stops seeing the route at all.
- **`unscoped()` with no reason beside it**: it takes the tenant rail off one call, which is
  a decision that has to be written down.
- **A cast that structural typing would have handled**: prefer the structural type, and keep
  an `as X` only where `check-types` proves it is needed.
- **A destructured parameter on a decorated service method**, which makes `ttsc-nestia` panic
  during `bun run sdk` and names no file when it does.
- **A body DTO that is not an `interface`**: a long `Partial<Pick<...>>` prints truncated
  into invalid SDK code and every e2e suite then fails to collect.
- **A test colocated beside its source** rather than in `__tests__/`, which is silently never
  run.
- **A comment that restates the code**, narrates the change, or banners a section. The
  comment policy in `CLAUDE.md` is that most code gets none.
- **In `admin-portal`**: a filter missing `single: true`, and a mutation with no settle after
  it. Those two were the repeated findings of the portal sweep.

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
`git log -S` or `git blame` on the hunk and read what the commit message claimed. Two
findings from the last audit round turned out to be decisions with a written rationale, and
one of them had a ticket filed against it.

Two things in a diff are the user's and are reported, never edited: a `@ts-expect-error`,
and a failing test that pins a bug the user knowingly left unfixed.

### 6. Aggregate

Present the two reports under `## Standards` and `## Spec`, verbatim or lightly cleaned. Do
**not** merge or rerank findings across axes, because the two are deliberately separate.

End with a one-line summary: total findings per axis, and the worst issue _within each axis_.
Don't pick a single winner across axes: that's the reranking the separation exists to
prevent.

## Why two axes

A change can pass one axis and fail the other:

- Code that follows every standard but implements the wrong thing -> **Standards pass, Spec fail.**
- Code that does exactly what the ticket asked but breaks the project's conventions -> **Spec pass, Standards fail.**

Reporting them separately stops one axis from masking the other.
