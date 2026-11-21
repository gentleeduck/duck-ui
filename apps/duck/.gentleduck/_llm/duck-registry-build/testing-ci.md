}>
  Treat generated registry output as production code. The build should be tested at the config layer, the phase layer, and the packed CLI layer.

## Recommended test layers

| Layer | What to test | Why |
| --- | --- | --- |
| Config tests | loading, defaults, merge, `extends`, validation | catches wrong config shape early |
| Extension tests | index-build, components, colors, component-index, adapters | catches deterministic output regressions |
| Change detection tests | cache keys, affected-path matching, incremental rebuild | proves cache correctness |
| Golden tests | full generated fixture tree | protects output contracts |
| Consumer smoke tests | real app/package scripts | proves the actual integration path |
| Pack/install smoke tests | packed CLI works in a temp consumer | proves publish surface |

***

## Good baseline commands

For the package itself:

```bash
bun run check-types
bun run test
bun run build
```

For a real consumer:

```bash
bun run check-types
registry-build build
```

For an installability check:

```bash
npm pack --dry-run
```

***

## Golden output strategy

Golden fixtures are the strongest regression net for this kind of package.

Use them when you need to detect:

* ordering changes
* emitted file name changes
* content rewrite regressions
* stale file cleanup regressions
* extension output drift

The most reliable pattern is:

1. create a small fixture source tree
2. run the full build into a temp output directory
3. compare the generated files with checked-in expected outputs

***

## Consumer CI example

```bash
bun run check-types
bun run build:reg
bun run build
```

This keeps the generated registry path in the same pipeline as the app build that consumes it.

***

## Release checklist

Package checks before publish

Make sure typecheck passes, tests pass, build output is generated cleanly, the packed tarball exposes the expected `bin` and `exports`, and a temp consumer can execute the installed CLI.

Consumer checks before rollout

Make sure the owning app or package can run `registry-build build`, a no-op warm build rewrites nothing, changed-only runs only touch the expected artifacts, and the downstream app build still passes with the generated files.

Debugging checks when something drifts

Compare generated outputs against the last known good tree, inspect the cache manifest under `.registry-build/`, run once with `incremental: false` if you need to rule out cache behavior, and prefer deterministic ordering in custom generators and extensions.

***

## Production standard

}>
  The builder is not really production-ready until both the package and at least one real consumer are part of the same verification story.