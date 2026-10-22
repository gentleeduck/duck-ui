# Mount

Keeps children mounted after they close until their exit is done: `Mount` for a fixed time, `MountMinimal` until
the CSS transitions of an element it is handed end. Neither renders an element of its own.

| Part | Where |
|---|---|
| Primitive | `@gentleduck/primitives/mount` |
| API docs | [`duck-primitives/api/mount.mdx`](../../../../apps/duck/content/docs/duck-primitives/api/mount.mdx) |
| Used by | registry-ui's `collapsible`, whose content waits out its height transition with `MountMinimal` |

## Tests

The stories cover `Mount` fading its children out over its fixed time, and `MountMinimal` waiting out one
transition, a delayed one, several with their own durations and delays, none under reduced motion, and a height
to `auto` that cannot run, with no element to wait for, and with `forceMount`, `renderOnce` and `skipWaiting`. The end-to-end suite runs each in
Chromium, Firefox and WebKit, and times the unmount from the click inside the page.

Each test was proven by changing the code and watching a test fail. One change has no test to fail: either
component starting closed when it mounts open. The render that sees it open sets it open again before React
commits, so the children show in the first commit either way, and starting from `open` only saves that render.

<!-- tests -->
| Suite | Tests | Files |
|---|--:|---|
| Unit | 36 | `mount.test.tsx` 36 |
| End to end | 10 | `mount.e2e.ts` 10 |
| registry-ui | 0 | - |
<!-- /tests -->

<!-- behaviour -->
<details>
<summary>46 behaviours, one per test</summary>

**Unit, `mount.test.tsx`**

- MountMinimal
  - renders children when open=true
  - does not render children when open=false
  - renders when forceMount=true and open=true
  - renders while closed when forceMount=true
  - renders nothing when open is left out
  - opens in one commit
- Mount
  - keeps its children for the exit animation, then drops them
  - renders nothing while closed
  - keeps its children 400ms after it closes by default
  - sets no exit timer while it starts closed
  - shows its children in the commit that opens it
  - waits out the exit animation after opening from closed
  - drops the exit timer when it opens again during the exit animation
  - stops the exit timer when it unmounts mid-animation
- MountMinimal exit
  - keeps its children through the exit transition, then drops them
  - waits out the transition after opening from closed
  - drops its children at once when given a callback ref, which it cannot read
  - drops its children on the next tick when the element has no transition
  - drops its children at once when its transition never starts, as a height going to auto does
  - waits out a transition the browser started
  - waits for no animation other than a transition
  - drops its children at once when it has no element to wait for
  - drops its children at once when told not to wait
  - drops the exit timer when it opens again during the exit transition
  - reads no style while it starts closed
  - renders nothing before the first open when renderOnce is set
  - keeps its children after closing once renderOnce has shown them
  - stays mounted after closing once forceMount has mounted it
  - waits out the delay before the transition as well as the transition
  - waits out the longest of several transitions
  - pairs each delay with the transition it delays
  - repeats a shorter list of durations or delays across the transitions
  - reads only as many durations as there are transitions
  - waits for nothing while no property transitions
  - counts a negative delay as time the transition has already run
  - waits out the transition of the element its ref is attached to, as collapsible passes it

**End to end, `mount.e2e.ts`**

- Mount
  - keeps its children for its fixed duration after it closes, then drops them
- MountMinimal
  - keeps its children until the panel's transition ends: opacity 300ms
  - keeps its children until the panel's transition ends: opacity 300ms after 300ms
  - keeps its children until the panel's transition ends: opacity 200ms, then translate 300ms after 300ms
  - drops its children as soon as it closes when no property transitions
  - drops its children as soon as it closes when its transition cannot run
  - drops its children as soon as it closes with skipWaiting
  - drops its children as soon as it closes with no element to wait for
  - keeps its children mounted before the first open and after it closes with forceMount
  - mounts its children on the first open and keeps them after with renderOnce

</details>
<!-- /behaviour -->

## Beyond Radix

Radix ships neither. Its nearest, `Presence`, waits for a CSS animation on the one child it clones a ref onto.

- `MountMinimal` waits for transitions, on an element it does not render, so the element that moves can be a parent
  such as a collapsible's content, and a transition needs no keyframes.
- `Mount` waits a fixed time, for an exit no style declares.

## Fixed

- `MountMinimal` waits until the element's last transition ends: each transition's duration plus its delay, the
  longest of several, with a shorter list of durations or delays repeated across them as the browser does. It read
  the first duration alone, so a delayed transition, or a list whose first was not the longest, lost its children
  part way through.
- `MountMinimal` drops the children at once when the browser starts no transition on the element, such as a
  height going to `auto` without `interpolate-size`. It held them for the duration in the style, so a collapsible
  jumped shut and its content stayed in the page for that long. A transition still in its delay when the element
  closes again has not moved anything, so it starts none either.
- Under `transition-property: none`, as Tailwind's `motion-reduce:transition-none` leaves it, `MountMinimal` drops
  the children at once, where it held them for a duration nothing used.
- `MountMinimal` takes the element as a ref object and forwards it, so it reaches the component on React 18, where
  a `ref` prop never did and closed children stayed mounted for good.
- Children with no element to wait for unmount as soon as `MountMinimal` closes.
- `forceMount` keeps the children mounted while closed, before the first open too, as the docs said. It waited for
  the first open and then did what `renderOnce` does.
- `Mount` shows its children in the commit that opens it, where they appeared a commit later.

## Smaller and faster

- Opening takes one commit where it took two.
- `MountMinimal` starting closed reads no style, where it read its element's computed style on mount, a style
  recalculation for every closed collapsible on the page.

<!-- benchmarks -->
No other library ships one to compare with. The module is 561 bytes gzipped.

Keeps children mounted through an exit, for a fixed time or an element's transitions. Radix's nearest, `Presence`, waits for an animation on the one child it wraps.
<!-- /benchmarks -->

## Breaking changes

- `MountMinimal`'s `ref` takes a ref object, not an element.
- `forceMount` mounts the children before the first open.
- `Mount`'s `renderOnce` is gone, since it changed nothing.
- `IMount.IMinimalProps` no longer declares `ref`.
