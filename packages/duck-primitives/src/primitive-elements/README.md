# Primitive

One component per HTML element the library renders, each taking `asChild` to render its child in its place. Every
part in the library renders through one.

| Part | Where |
|---|---|
| Primitive | `@gentleduck/primitives/primitive-elements` |
| API docs | [`duck-primitives/api/primitive-elements.mdx`](../../../../apps/duck/content/docs/duck-primitives/api/primitive-elements.mdx) |
| Used by | every part of every component |

It has no styled component of its own.

## Tests

The stories cover a form built of primitives, whose text field and `select` it sends, and a link rendered through
`Primitive.button` with `asChild`, which runs the button's click handler after its own and leaves no button on the
page. The end-to-end suite runs each in Chromium, Firefox and WebKit.

Each test was proven by changing the code and watching a test fail.

`primitive.radix.test.tsx` holds Radix's primitive tests.

<!-- tests -->
| Suite | Tests | Files |
|---|--:|---|
| Unit | 25 | `primitive-elements.test.tsx` 13, `primitive.radix.test.tsx` 12 |
| End to end | 2 | `primitive-elements.e2e.ts` 2 |
| registry-ui | 0 | - |
<!-- /tests -->

<!-- behaviour -->
<details>
<summary>27 behaviours, one per test</summary>

**Unit, `primitive-elements.test.tsx`**

- Primitive
  - renders a div
  - renders a button
  - renders a span
  - forwards ref
  - supports asChild to render a different element
  - keeps asChild to itself, so a primitive it slots onto renders its own element
  - passes props through
  - renders every element Radix renders, select included, each named for React DevTools
  - names its element in the error a child it cannot slot onto throws
  - is exported as Root too, as Radix exports it
  - renders nav element
- Primitive on the page and the server
  - marks the window it loads in
  - loads and renders where there is no window

**Unit, `primitive.radix.test.tsx`**

- Primitive.div
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- Primitive.span
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- Primitive.button
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- Primitive.a
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- Primitive.input
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- Primitive.svg
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set

**End to end, `primitive-elements.e2e.ts`**

- Primitive
  - a form built of primitives sends its text field and its select
  - renders the element it is given with asChild, running its handler after the element's own

</details>
<!-- /behaviour -->

## Beyond Radix

Against `@radix-ui/react-primitive` 2.1.10, the version Radix's components ship. 2.2.0, the latest, renders the
same elements.

- The window is marked once, as the module loads, with `Symbol.for('gentleduck-ui')`. Radix marks it with
  `Symbol.for('radix-ui')` on every render of every primitive.

## Fixed

- `Primitive.select` renders a `select`, as Radix's does. It was missing, so a part written against Radix's
  `Primitive.select` rendered nothing and threw.
- `Root` is exported beside `Primitive`, as Radix exports it.
- The API docs no longer offer `dispatchDiscreteCustomEvent`, which the module stopped exporting in February. The
  import they showed failed. Call `flushSync(() => target.dispatchEvent(event))` from `react-dom` in its place.

## Smaller and faster

- The module is 1,358 bytes against Radix 2.1.10's 1,584 and 2.2.0's 1,714, each minified and gzipped with everything it imports but React.
