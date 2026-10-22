# Direction

Sets left to right or right to left once, for every primitive and every style below it.

| Part | Where |
|---|---|
| Primitive | `@gentleduck/primitives/direction` |
| API docs | [`duck-primitives/api/direction.mdx`](../../../../apps/duck/content/docs/duck-primitives/api/direction.mdx) |
| Styled component | [`registry-ui/src/direction`](../../../registry-ui/src/direction) |
| Styled docs | [`duck-ui/components/direction.mdx`](../../../../apps/duck/content/docs/duck-ui/components/direction.mdx) |

## Tests

The stories cover a direction read from `<html dir>` and changed at runtime, a provider, a provider nested in
another, a component's own `dir`, a layout and a `[dir='rtl']` selector following the provider, the provider
staying out of a grid's layout, and a popover portalled out of a provider. The end-to-end suite runs each in
Chromium, Firefox and WebKit.

Each test was proven by changing the code and watching a test fail.

<!-- tests -->
| Suite | Tests | Files |
|---|--:|---|
| Unit | 11 | `direction.test.tsx` 11 |
| End to end | 6 | `direction.e2e.ts` 6 |
| registry-ui | 3 | `direction.test.ts` 3 |
<!-- /tests -->

<!-- behaviour -->
<details>
<summary>17 behaviours, one per test</summary>

**Unit, `direction.test.tsx`**

- IDirection.Kind
  - defaults to ltr when no provider or local dir
  - uses local dir over provider
  - uses provider dir when no local dir
  - DirectionProvider renders a wrapper div with dir attribute
  - names the two directions
  - falls back to the html dir attribute and follows changes
  - re-renders when the html dir attribute changes
  - stops reading the html dir once it unmounts
  - shares one observer of the html dir between every reader
  - follows the dir of an html element that replaced the old one
- useDirection on the server
  - renders ltr, since there is no html dir to read there

**End to end, `direction.e2e.ts`**

- Direction
  - reads &lt;html dir&gt; where no provider is set, and follows a change to it
  - a provider wins over the document, a nested one over its parent, and a local dir over both
- Direction layout
  - lays its subtree out right to left and matches a [dir=rtl] selector, then left to right once switched
  - draws no box of its own, so its children are the grid items
- Direction portalled
  - reaches a popover portalled out of it, which aligns its start to the right
  - mirrors a right side to the left

</details>
<!-- /behaviour -->

## Beyond Radix

- With no `dir` prop and no provider, `useDirection` reads `<html dir>`, where Radix answers `ltr`, and follows
  a change to it at runtime. `RTL` reads as `rtl`, as the browser reports it; anything else, `auto` included,
  reads as `ltr`.
- `DirectionProvider` renders a `div` carrying `dir` and `display: contents`, so the page's CSS follows it as the
  primitives do: logical properties, `[dir='rtl']` selectors and Tailwind's `rtl:`. Radix's provider renders
  only a context, so CSS still saw the document's direction. The `div` draws no box, so a grid or flex parent
  still lays out the provider's children.
- On the server, where there is no document, `useDirection` answers `ltr`. A provider gives the right direction
  on first paint.
- `DIRECTION_DICTIONARY` and `DirectionContext` are exported.

## Smaller and faster

- One `MutationObserver` serves every mounted primitive. One each made unmounting a page of toggles 1.8 times
  slower than Radix.
- The provider's `div` drops its inline `direction` style. Its `dir` attribute already sets the direction, as
  the end-to-end suite shows in all three browsers.

## Breaking changes

- A child selector across a provider, such as `.list > li`, no longer matches, since the provider's `div` sits
  between the two.

## registry-ui

- `toDirection` narrows a value, such as the string a toggle group reports, to `ltr` or `rtl`. It compares values,
  so `toString` and other inherited keys do not pass.

## Later

- `dir="auto"` on `<html>` reads as `ltr`. Resolving it means reading the computed direction, which changes with
  the text and fires no attribute change.
