---
name: pr
description: Open a PR in this repo end to end - base it on master, commit the tree one feature per commit, read the issues it closes, add the changeset a published package needs, write a short body a reviewer takes in at a glance, and confirm the base, assignee and labels landed. Use whenever asked to make, open or push a PR, or to commit a working tree "by feature" so a PR can follow.
metadata:
  credits:
    skill: show-me
    author: Dex Horthy
    organisation: Humanlayer
    url: "https://github.com/humanlayer/skills/blob/main/plugins/show-me/skills/show-me/SKILL.md"
---

# Opening a PR in duck-ui

Each step is here because skipping it produces a wrong PR: the wrong base, a commit that mixes
three changes, a made-up label, a body nobody reads to the end.

## 1. Base it on `master`

`master` is the branch that releases. `dev` is stale, and CI runs only for PRs into `master`.
Confirm the count is this branch's own work and nobody else's:

```bash
git fetch origin master --quiet
git log --oneline origin/master..HEAD | wc -l
```

A PR in a stack bases on the PR before it until that one merges. CI does not run on it there, so
run the gates at its tip yourself (section 7).

## 2. One commit per feature

A PR title makes one claim, and a tree of tangled fixes cannot back it.

1. Map every changed file to its feature with `git status --porcelain=v1` and `git diff`.
2. Stage one feature, check `git diff --cached --stat`, run `bun run check-types` and the tests of
   the package it touches so the commit stands on its own, and commit. Repeat.
3. When one file interleaves two features' hunks (there is no `git add -p` here), write feature A's
   version of it, verify, commit, then put B's hunks back on top.
4. A shared index file (a package's `stories.ts`, a register) is split by hunk the same way, so
   each commit lists only what it adds.

Messages are conventional commits, checked by commitlint (`commitlint.config.cjs`):

- types `feat`, `fix`, `docs`, `chore`, `refactor`, `perf`, `test`, `build`, `ci`, `style`, `revert`
- a header of at most 100 characters, whose subject is not start case, pascal case or upper case
- body lines of at most 200 characters
- a `!` after the scope for a breaking change: `perf(primitives)!: ...`
- plain ASCII, no em dashes, curly quotes, arrows or ellipsis characters
- the why, not the what. The diff shows what. A claim that something "fails without" the change
  has to be true at the commit's parent.
- no `Co-Authored-By` trailer

A body paragraph starts with a word, not a `word:` token, or commitlint reads it as a footer.

If the tree holds more than the one thing you were told about, say so and propose the split.

## 3. Read the issues

Read every issue the work closes or touches, not just its number: `gh issue view <n>`. "Fixes #N"
in the body closes it when the PR merges into `master`.

## 4. The changeset

A change to a published package needs a `.changeset/*.md`: `"@gentleduck/<pkg>": patch`, `minor`
or `major`, then a prose paragraph, which becomes the CHANGELOG line. `bun changeset` writes one.
The docs app, `@gentleduck/ui-docs`, is ignored.

Merging the PR publishes nothing. The Release workflow then opens `chore: version packages`, and
merging that one publishes to npm behind the `npm` environment's approval. A stack that ships as
one release carries its changeset in its last PR only.

A byte count quoted in a changeset comes from the latest benchmark run's `results.json`, since a
rebuild moves a module's size by a few bytes.

## 5. Write the body

A reviewer should take it in at a glance: what changed, what to look at, what cannot be undone,
and the proof. Each commit message already carries its own why, so the body does not repeat it.
`.github/PULL_REQUEST_TEMPLATE.md` lays out the same shape.

```markdown
<What this does and for whom, in one or two plain sentences, issue linked. Why it lands now, if
that is not obvious.>

- <one line per distinct piece of work, only when there are two or more>

Worth a look:

- <a decision or trade-off a reviewer should check, one line each>

Merge danger:

- <something reverting the PR does not undo, or a merge order, one line each>

For later:

- [ ] <what is left out on purpose, one line each>

<The proof in one line: which tests ran and passed, and the test that pins a fix.>
```

Drop a section with nothing to say. Aim under 1,500 characters for one feature and 3,000 for the
largest PR, and cut prose to get there, never the proof.

Leave out:

- the commit list, which GitHub's Commits tab already shows
- commit hashes, and test counts. "All tests pass" says it.
- a preamble, a `## Summary` heading, or praise
- the gate's steps spelled out
- how the branch got here, or what was re-run after which commit. The body describes the head.
- a line saying a risk is small. No merge danger means no section.
- a mechanism explained in prose. That belongs to the commit message.

At most one visual, and only when it says the change faster than a sentence: a component's tree
before and after, or a module's file layout.

The proof names what ran, since each proves something different: `bun run test` runs each
package's unit suite, and in `@gentleduck/primitives` also the ported Radix suites and the
coverage floor. `bun run test:e2e` in `packages/duck-primitives` drives the stories in real
browsers. A test that pins a fix is named, with the fact that it failed before. For a visual
change, a screenshot beats both.

Merge danger is for what reverting the PR does not undo:

- a version a changeset publishes, since npm keeps it
- an export removed or renamed. `@gentleduck/primitives` exports every module's `index` and every
  file under `hooks/`, so an export dropped from one of them is gone for every consumer.
- a prop, default or `data-*` attribute that changed meaning, which consumer code and CSS keep
  compiling against
- a dependency bump consumers feel: a peer range, React, Next, TypeScript
- a stack: which PR merges first

Write "PR #N" or "issue #N", never a bare `#N`, since the two share one counter. Plain ASCII.

## 6. Assignee and labels come from the repo

```bash
gh api user --jq .login   # for --assignee
gh label list             # the real taxonomy; never invent a label
```

One type label for the dominant change (`fix`, `feature`, `perf`, `refactor`, `docs`, `test`,
`chore`, `build`, `ci`), one `pkg: *` per package meaningfully touched, `breaking` for a breaking
change, and `dependencies` for a bump. `security` only when a fix earns it.

## 7. Push, create, confirm

```bash
git push -u origin <branch>
gh pr create --base master --head <branch> --title "<type>(<scope>): <summary>" \
  --body-file <path> --assignee <login> --label "<type>" --label "pkg: <name>"
gh pr view <number> --json title,assignees,labels,baseRefName,headRefName,url
```

Let `pre-push` run (the `setup-pre-commit` skill says what it runs). `--no-verify` needs the
user's say-so, and whatever it skipped is still owed. `bun run fix` writes, so read `git status`
after a long push.

The final `gh pr view` is not optional: confirm the base, assignee and labels before calling the
PR done.

A later push can make the body wrong: a renamed export, a "merge PR #N first" that has merged.
Rewrite the body for the new head in the same sitting (`gh pr edit <n> --body-file`), rather
than appending what changed.
