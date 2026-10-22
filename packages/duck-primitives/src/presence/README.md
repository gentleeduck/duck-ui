# Presence

Keeps its child mounted after `present` turns false until every CSS animation the child runs as it closes has ended
or been cancelled, and unmounts it at once when there is none. It renders no element of its own.

| Part | Where |
|---|---|
| Primitive | `@gentleduck/primitives/presence` |
| API docs | [`duck-primitives/api/presence.mdx`](../../../../apps/duck/content/docs/duck-primitives/api/presence.mdx) |
| Used by | `accordion`, `dialog`, `hover-card`, `menu`, `navigation-menu`, `popover`, `radio-group`, `select` and `tooltip` |

It has no styled component of its own. registry-ui reaches it through the components above.

## Tests

The stories cover content with no exit animation, one exit animation, two of different lengths, an exit that
interrupts an opening animation whose name it contains, an exit animation with no keyframes, the animation it
opened with still set on close, content hidden on close, reopening during the exit, and a render function child.
The end-to-end suite runs each in Chromium, Firefox and WebKit, times the unmount from the click inside the page,
and also cancels an exit in the frame it starts.

Each test was proven by changing the code and watching a test fail. Each engine was also asked which events and
promises a cancelled exit sends. Chromium and Firefox send no `animationcancel` for an animation cancelled in the
frame it was created, while its `finished` promise is rejected in all three, and removing the element rejects it too.

<!-- tests -->
| Suite | Tests | Files |
|---|--:|---|
| Unit | 36 | `presence.radix.test.tsx` 8, `presence.test.tsx` 28 |
| End to end | 10 | `presence.e2e.ts` 10 |
| registry-ui | 0 | - |
<!-- /tests -->

<!-- behaviour -->
<details>
<summary>46 behaviours, one per test</summary>

**Unit, `presence.test.tsx`**

- Presence
  - renders children when present=true
  - does not render children when present=false
  - supports render function children
  - render function receives present=false when not present
  - toggles visibility on present change
  - preserves child element type
  - initial present=false does not mount
  - render function always mounts (forceMount behavior)
- Presence with a CSS exit animation
  - stays mounted until the exit animation ends
  - waits for every exit animation to end, not the first
  - ends the exit when its animation is cancelled
  - keeps exiting when the opening animation it interrupted is cancelled, though the exit name contains its name
  - drops the content at once when none of its exit animations runs, as for a name with no keyframes
  - waits for a paused exit animation, which ends once it plays again
  - waits for CSS animations only, not a transition or a script animation running beside them
  - unmounts at once when the animation running on close is the one that ran while open
  - learns the open animation inside a shadow root, which an animation event does not leave
  - learns the open animation from the content, not from a child animating inside it
  - stops learning from an element its child no longer gives it
  - holds the last frame with a forwards fill until React has unmounted, then puts the fill mode back
  - keeps a fill mode set while the unmount waits a frame
  - finishes the exit of content in a document without a window, and gives back its fill mode
  - holds its content open for the render that closes it, until the exit starts
  - keeps the content when it reopens during the exit animation, which the reopening cancels
  - forgets the animation it opened with once it reopens, so an exit by that name runs after an opening without one
- Presence and the child ref
  - attaches the child ref once, however often the child renders with a new one
  - gives the node to a ref object on the child and takes it back on unmount
  - runs the cleanup a child callback ref returns

**Unit, `presence.radix.test.tsx`**

- ref stability
  - does not loop when the child has a stable ref
  - does not loop when the child has an unstable callback ref that triggers a render on attach
  - forwards the node to the child ref
- mount/unmount behavior
  - renders the child when present is true
  - removes the child when present is false and no exit animation
  - keeps the child mounted when toggling present back to true
- render function children
  - always renders the child when using a render function
  - passes present=true to the render function when present prop is true

**End to end, `presence.e2e.ts`**

- Presence
  - drops content with no exit animation as soon as it closes
  - keeps content until its exit animation ends
  - keeps content until the last of its exit animations ends
  - runs the whole exit when it interrupts an opening animation whose name the exit contains
  - drops content at once when its exit animation is cancelled
  - drops content at once when its exit animation has no keyframes
  - drops content at once when the animation on close is the one it opened with
  - drops content at once when it is hidden on close
  - keeps the same element when it reopens during the exit
  - keeps a render function content once the exit ends, telling it it is not present

</details>
<!-- /behaviour -->

## Fixed

Against `@radix-ui/react-presence` 1.1.10, the version `@radix-ui/react-dialog` 1.1.23 ships. Presence now waits on
the `finished` promise of each CSS animation the content runs when it closes, read from `element.getAnimations()`,
where it waited for `animationend` and `animationcancel` events whose name the computed `animation-name` contained.

- An exit with several animations waits for the last of them. It ended when the first did, as Radix's and Ark's
  still do.
- An exit that interrupts an opening animation runs to its end when its name contains the opening one's, as
  `fade-out` contains `fade`. Firefox sends the opening animation's `animationcancel` after the exit has begun, and
  its name matched the exit by substring, so the content left at once, as it still does in Radix.
- An exit animation with no `@keyframes` unmounts the content at once. It waited for an `animationend` that never
  came, as Radix's still does, so the content stayed in the page.
- An exit animation cancelled in the frame it starts, as when the content is hidden as it closes, ends the exit.
  Chromium and Firefox send no `animationcancel` then, so the content stayed in the page, as it does in Radix and
  Ark.

## Smaller and faster

- Content shows in the render that sets `present`. Radix renders nothing in that pass and shows it on the next,
  from a layout effect.
- The child's computed style is read only when it closes or an animation on it starts. Radix reads it after every
  mount as well.

## Breaking changes

- Where the browser has no `element.getAnimations()`, as in jsdom, content leaves at once. It waited for an
  `animationend` event, so a test ending an exit that way has to stub `getAnimations` instead.

## Later

- An exit animation that repeats forever keeps the content mounted, as in Radix and Ark.
- Ark's `lazyMount`, `unmountOnExit`, `skipAnimationOnMount` and `onExitComplete`. Base UI's
  `onOpenChangeComplete` covers the last.
- CSS transitions are not waited for. `MountMinimal` waits for them.
