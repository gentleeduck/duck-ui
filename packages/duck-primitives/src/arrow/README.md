# Arrow

An SVG arrow, pointing down, that floating content draws towards its anchor.

| Part | Where |
|---|---|
| Primitive | `@gentleduck/primitives/arrow` |
| API docs | [`duck-primitives/api/arrow.mdx`](../../../../apps/duck/content/docs/duck-primitives/api/arrow.mdx) |
| Used by | `popper`, and through it `popover`, `tooltip`, `hover-card`, `select` and every `menu` |

It has no styled component of its own. registry-ui draws it through the `Arrow` parts of the components above.

## Tests

The stories cover the rounded arrow at its default size and at a size it is given, stretched over its whole box
and filled from the stylesheet, and a custom shape drawn in the viewBox it is given, once stretched and once
keeping the aspect ratio it is given. The end-to-end suite runs each in Chromium, Firefox and WebKit.

Each test was proven by changing the code and watching a test fail.

<!-- tests -->
| Suite | Tests | Files |
|---|--:|---|
| Unit | 9 | `arrow.radix.test.tsx` 5, `arrow.test.tsx` 4 |
| End to end | 3 | `arrow.e2e.ts` 3 |
| registry-ui | 0 | - |
<!-- /tests -->

<!-- behaviour -->
<details>
<summary>12 behaviours, one per test</summary>

**Unit, `arrow.radix.test.tsx`**

- given a default Arrow
  - should have no accessibility violations
  - should have width attribute
  - should have height attribute
- Arrow.Root
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set

**Unit, `arrow.test.tsx`**

- Arrow
  - draws a rounded arrow stretched over a 30 by 10 box, 10 by 5 unless sized
  - draws its children inside its own svg in place of the rounded arrow when asChild is set
  - is also exported as Root, the name Radix gives it, and names itself Arrow
  - takes a viewBox and an aspect ratio passed to it over its own

**End to end, `arrow.e2e.ts`**

- Arrow
  - draws its rounded arrow 10 by 5 unless sized, stretched over the whole box
  - takes its fill from the stylesheet
  - draws a custom shape in the viewBox it is given, keeping the aspect ratio it is given

</details>
<!-- /behaviour -->

## Beyond Radix

Against `@radix-ui/react-arrow` 1.1.15, the version `@radix-ui/react-popper` 1.3.7 ships.

- A `viewBox` or `preserveAspectRatio` passed in replaces its own, so a custom shape can be drawn in its own
  coordinates and keep its proportions. Radix's own always win.
- `asChild` draws the children inside the arrow's own svg, so a custom shape needs only its path. Radix's slots
  onto the child, which then has to be the whole svg.
- It draws a rounded tip by default, where Radix draws a sharp triangle, and carries `data-slot="arrow"`.

## Fixed

- `Root` is exported beside `Arrow`, as Radix exports it, so `import * as Arrow` and `<Arrow.Root>` work as they
  do with Radix.

## Smaller and faster

- The module is 1,526 bytes against Radix's 1,735, each minified and gzipped with everything it imports but React.
