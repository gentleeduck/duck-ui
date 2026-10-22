<!--
Open with what this does and for whom, in one or two plain sentences, the way you would tell a teammate.
Write "PR #N" or "issue #N", never a bare #N, except in "Fixes #N", which closes that issue when this PR merges.

Plain short sentences in plain ASCII. No headings, no commit list, no hashes, no test counts.
Delete every section below that has nothing to say, and these comments with it.
-->

<!-- One line per distinct piece of work, only when there are two or more. -->

-

Worth a look:

<!-- A decision or trade-off the reviewer should check, one line each. -->

-

Merge danger:

<!--
What reverting this PR does not undo, one line each: a version a changeset publishes, an export removed from a
published package, a prop or default that changed meaning, a dependency consumers now need, a merge order in a stack.
A breaking change also takes the `breaking` label, and its changeset is a `major`.
-->

-

For later:

<!-- What is left out on purpose, one line each. -->

- [ ]

<!--
End with the proof in one line: which tests ran and passed (unit, the Radix ports, e2e against the story server), and
the test that pins a fix. A screenshot says more for a visual change.
Before opening: a change to a published package has its changeset, a user-facing change has its docs page, and
`bun run check`, `bun run check-types` and `bun run test` pass.
-->
