# Skills

Grouped by purpose. **The directories stay flat.** Claude Code discovers
`.claude/skills/*/SKILL.md` one level deep only. Both ways of making the grouping real were
tested in an isolated headless session and both lose the skill: a group directory
(`.claude/skills/frontend/frontend-design/`) drops out of the listing, and so does a
directory-scoped copy (`frontend/.claude/skills/frontend-design/`). Neither warns. This file
is the grouping; the filesystem is not.

Every skill carries an `agents/openai.yaml` holding its display name and one-line summary.

A skill marked **slash-only** sets `disable-model-invocation: true`, so it runs when you type
`/name` and never on its own initiative.

## Build it here

Repo-specific. These five know IRYSS and are the ones to reach for on this codebase.

| Skill | For |
|---|---|
| `building-a-module` | the order of work for a new module: plan, schema, migration, IAM, code, tests, README |
| `tdd` | the red-green loop, which layer a test belongs at, the harnesses, the coverage ratchet |
| `pr` | the real base branch, the commit split, the body, labels, push |
| `code-review` | two-axis review, standards against spec, with the findings IRYSS audits keep turning up |
| `setup-pre-commit` | what husky runs at each hook and how to change a gate |

## Know the toolchain

Generated from each tool's own docs, so they are current rather than remembered. Matched to
what this repo actually runs: `turbo.json`, 8 `tsdown.config.ts`, 14 vitest configs, and the
one `vite.config.ts` under `admin-portal`.

| Skill | For |
|---|---|
| `turborepo` | task pipelines, `dependsOn`, `--filter`, `--affected`, cache misses |
| `vitest` | config, mocking, coverage, filtering, and type testing for the `.types.ts` files |
| `tsdown` | bundling a package, emitting declarations, plugins and hooks |
| `vite` | `vite.config.ts`, the plugin API, SSR |
| `typescript-advanced-types` | generics, conditional and mapped types, template literals |

## Decide what to build

| Skill | For |
|---|---|
| `grilling` | a relentless interview that stress-tests a plan |
| `grill-me` | slash-only door onto `grilling` |
| `grill-with-docs` | slash-only, `grilling` plus `domain-modeling` so ADRs come out of it |
| `to-spec` | slash-only, turn a conversation into a specification |
| `to-tickets` | slash-only, turn a spec into tickets |
| `to-questionnaire` | slash-only, turn an open question into a questionnaire |
| `domain-modeling` | build the shared vocabulary, write a CONTEXT.md or an ADR |
| `prototype` | throwaway build to answer a design question |
| `research` | investigate against primary sources, capture findings as a repo file |

## Build the portal

`admin-portal` is React plus TanStack Start, so the Next.js half of the Vercel guidance does
not apply. Read them for the React half.

| Skill | For |
|---|---|
| `vercel-react-best-practices` | render cost, memoisation, data fetching, bundle size |
| `vercel-composition-patterns` | compound components, and killing boolean prop proliferation |
| `vercel-react-view-transitions` | route and shared-element animation through the View Transition API |

## Design the frontend

Not IRYSS-aware. `frontend-design` is Anthropic's; the other four come from
`Leonxlnx/taste-skill`.

| Skill | For |
|---|---|
| `frontend-design` | aesthetic direction and typography, so a UI does not read as templated defaults |
| `design-taste-frontend` | landing pages, portfolios and redesigns, audit-first, with a pre-flight check |
| `design-taste-frontend-v1` | the original taste-skill, kept only for exact backward compatibility |
| `imagegen-frontend-web` | one reference image per section of a marketing site, never a composite |
| `imagegen-frontend-mobile` | mobile screen concepts and flows in a phone mockup, images only |
| `web-design-guidelines` | audit an existing UI against the Web Interface Guidelines, accessibility included |

## Shape the code

| Skill | For |
|---|---|
| `codebase-design` | the deep-module vocabulary: interface, depth, seam, adapter, leverage |
| `improve-codebase-architecture` | slash-only, scan for deepening opportunities and grill through one |
| `setup-ts-deep-modules` | slash-only, wire dependency-cruiser so packages are deep modules |
| `migrate-to-shoehorn` | replace `as` assertions in tests with shoehorn |

## Fix what is broken

| Skill | For |
|---|---|
| `diagnosing-bugs` | the diagnosis loop for a hard bug or a performance regression |
| `triage` | slash-only, sort what came in |
| `resolving-merge-conflicts` | work an in-progress merge or rebase to a finish |

## Do the work

| Skill | For |
|---|---|
| `implement` | slash-only router: tdd, then code-review |
| `implement-spec` | slash-only, implement a specification |
| `wizard` | generate a bash wizard for steps only a human can do |

## Run the session

| Skill | For |
|---|---|
| `handoff` | slash-only, compact this conversation into a handoff document |
| `claude-handoff` | slash-only, hand off to a fresh background agent that picks up immediately |
| `loop-me` | slash-only, keep going on a task |
| `retro` | slash-only, look back at how the session went |
| `wayfinder` | slash-only, find your way around an unfamiliar codebase |
| `wait-what` | slash-only, stop and re-pitch a message that did not land |
| `ask-matt` | slash-only, phase boundaries and how to ask |

## Write

| Skill | For |
|---|---|
| `writing-for-agents` | writing a skill, an AGENTS.md or a CLAUDE.md |
| `writing-guidelines` | audit docs and prose against a voice and tone handbook |
| `writing-shape` | slash-only, the shape of a piece of prose |
| `writing-beats` | slash-only, the beats it moves through |
| `writing-fragments` | slash-only, fragments to build from |
| `teach` | slash-only, explain something properly |
| `scaffold-exercises` | exercise directories with problems and solutions |

## Set up tooling

| Skill | For |
|---|---|
| `git-guardrails-claude-code` | hooks that block destructive git commands |
| `setup-matt-pocock-skills` | slash-only, wire a repo for the skills above |

## Known mismatches in this repo

Read these before trusting a skill that touches tooling:

- **Eight skills point at a `CONTEXT.md` that does not exist here**: `ask-matt`,
  `codebase-design`, `diagnosing-bugs`, `domain-modeling`,
  `improve-codebase-architecture`, `setup-matt-pocock-skills`, `triage`, `wait-what`.
  Writing one, which is what `domain-modeling` produces, fixes all eight at once.
- **`migrate-to-shoehorn`** needs `@total-typescript/shoehorn`, which is not installed.
- **`setup-ts-deep-modules`** needs dependency-cruiser, which is not installed.
- **`scaffold-exercises`**, **`prototype`** and **`design-taste-frontend`** drive npm;
  this repo is bun only.
- **`setup-matt-pocock-skills`** rebuilds the symlink farm these skills were unpacked from,
  and still points at `docs/agents/`, which does not exist.
- **`implement`** ends by committing to the current branch, which this repo does not do
  without being told in that same message.
- **`turborepo`** ships a slash command at `turborepo/command/turborepo.md`. Commands load
  from `.claude/commands/`, not from inside a skill, so it is inert where it sits.
