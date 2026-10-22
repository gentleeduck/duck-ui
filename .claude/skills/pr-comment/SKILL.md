---
name: pr-comment
description: Write and post PR comments the way the user writes them - one inline comment per finding on the line it is about, in one or two short plain paragraphs, then a short summary review; plus the shape of an approval and of a reply on a thread. Use whenever asked to comment on a PR, post a finding, reply on a thread, approve, or turn a review finding into a PR comment.
---

# Commenting on a PR

Posting is outward-facing, so do it only when the user asked for it in this conversation.

## One finding, one inline comment

Post the findings as one review whose comments each sit on the line they are about, so each can
be answered and resolved on its own. Fourteen findings means fourteen comments, never one wall.

```bash
gh pr view <n> --json headRefOid --jq .headRefOid
gh api repos/gentleeduck/duck-ui/pulls/<n>/reviews --input review.json
```

`review.json` holds `commit_id` (that head), `event: "COMMENT"`, the summary as `body`, and a
`comments` array of `{ "path", "line", "side": "RIGHT", "body" }`.

Each comment is one or two short paragraphs:

- What the code does wrong, and what that means for whoever uses it: "a dialog opened from a menu
  hands focus back to the body when it closes", not "focus handling issue".
- The fix, said plainly. A small `diff` block only when the change is easier read than described.
- The rule that makes it wrong, quoted with its `file:line`, when it is written down: `CLAUDE.md`,
  `CONTRIBUTING.md`, a module's `README.md`, the issue.

When the fix is already in the branch, the comment says "now it does X" rather than asking for it.

No headings, emoji, bold labels or TL;DR blocks. No commit hashes and no "Read at" line. Nothing
hedged, and no praise inside a finding; a point in the author's favour goes to the user in chat.

## The summary review

The review's own body, two or three short paragraphs, about 900 characters:

- the author's handle, and the calls that were right, one clause each
- what was pushed, if anything, and that the tests pass
- the follow-ups, one line each
- a line owning any finding of yours that turned out wrong

No tables. Read the handle, never remember it: `gh pr view <n> --json author --jq .author.login`.
A wrong handle notifies nobody, so write a bare `@name` only for a real login.

## Approving

Two short paragraphs, cool and a little nerdy, never stiff:

```
LGTM. <What the PR gets right, in a sentence or two, with some life in it.>

<That the tests pass, in a few words.>
```

The user merges, so an approval asks the author for nothing: no merge order, no retarget, no
rebase. GitHub refuses an author's approval of their own PR, so on the user's own PR post it with
`gh pr review <n> --comment --body-file <file>`.

## Replying on a thread

A reply on an existing inline thread goes through
`gh api repos/gentleeduck/duck-ui/pulls/<n>/comments/<id>/replies -F body=@<file>`, not a new
comment. A bot's thread, CodeRabbit's included, gets one reply each: what was fixed and where, or
why it was declined.

## Before posting

1. Re-read every cited line at the PR's current head. A push since the review moves line numbers.
2. Write each body to a file in the scratchpad and post with `--body-file`, `--input` or
   `-F body=@<file>`, never an inline `--body`, so the shell leaves the backticks alone.
3. Plain ASCII: `LC_ALL=C grep -n '[^ -~]' <file>` must print nothing. Use " - " with spaces, a
   colon or a full stop where a dash would go.
4. Backticks around every identifier, path and prop.
5. Hand the URL back to the user.
