# VisuallyHidden

Hides its content from sight while leaving it to screen readers, clipped to one pixel in the pattern Radix and
Bootstrap use.

| Part | Where |
|---|---|
| Primitive | `@gentleduck/primitives/visibility-hidden` |
| API docs | [`duck-primitives/api/visibility-hidden.mdx`](../../../../apps/duck/content/docs/duck-primitives/api/visibility-hidden.mdx) |
| Used by | `select`'s form control, `tooltip`'s accessible label and `navigation-menu`'s focus proxy |

It has no styled component of its own.

## Tests

The stories cover an icon button named by a hidden label that draws nothing and takes no room in the button; a
button hidden with `asChild`, clipped to one pixel with its own border and padding; and a dialog whose title is
hidden with `asChild`, which still names the dialog and keeps its own `data-slot`. The end-to-end suite runs each
in Chromium, Firefox and WebKit.

Each test was proven by changing the code and watching a test fail.

<!-- tests -->
| Suite | Tests | Files |
|---|--:|---|
| Unit | 12 | `visibility-hidden.test.tsx` 10, `visually-hidden.radix.test.tsx` 2 |
| End to end | 3 | `visibility-hidden.e2e.ts` 3 |
| registry-ui | 0 | - |
<!-- /tests -->

<!-- behaviour -->
<details>
<summary>15 behaviours, one per test</summary>

**Unit, `visibility-hidden.test.tsx`**

- VisuallyHidden
  - renders with data-slot="visually-hidden"
  - leaves the data-slot to the component it slots onto, such as a dialog title it hides
  - takes a data-slot it is given over its own
  - is exported as Root too, and names itself VisuallyHidden
  - renders as a span
  - hides its content with the clipping pattern Radix and Bootstrap use, kept on one line
  - lets a style it is given replace a hidden one, such as fixed in place of absolute
  - renders children as text content
  - forwards ref
  - merges custom styles

**Unit, `visually-hidden.radix.test.tsx`**

- VisuallyHidden.Root
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set

**End to end, `visibility-hidden.e2e.ts`**

- VisuallyHidden
  - names an icon button while drawing nothing and taking no room in it
  - hides a control it slots onto down to one pixel, border and padding included
  - hides a dialog title that still names the dialog and keeps its own data-slot

</details>
<!-- /behaviour -->

## Beyond Radix

Against `@radix-ui/react-visually-hidden` 1.2.11, the version Radix's select, tooltip and navigation menu ship.
The styles are the same.

- It carries `data-slot="visually-hidden"`. With `asChild` it carries none, so the child keeps its own.

## Fixed

- A dialog title hidden with `<VisuallyHidden asChild>`, as the dialog's warning suggests, keeps
  `data-slot="dialog-title"`. The slot's marker replaced it, so a style or query on the title matched nothing.

## Smaller and faster

- The module is 1,549 bytes against Radix's 1,788, each minified and gzipped with everything it imports but React.
