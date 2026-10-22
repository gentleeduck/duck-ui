# Portal

Renders its content into another part of the document, `document.body` by default, so an overlay escapes a box
that clips or stacks it while staying in its place in the React tree.

| Part | Where |
|---|---|
| Primitive | `@gentleduck/primitives/portal` |
| API docs | [`duck-primitives/api/portal.mdx`](../../../../apps/duck/content/docs/duck-primitives/api/portal.mdx) |
| Used by | `dialog`, `alert-dialog`, `popover`, `tooltip`, `hover-card`, `select`, `sheet` and every `menu` |

It has no styled component of its own. registry-ui reaches it through the `Portal` parts of the components above.

## Tests

The stories cover content rendered into the body out of a box that clips it, and taken out when it goes; content
rendered into the element a ref holds, which renders after it; a field rendered into a form holding a control
named `current`, which shows and is sent with the form; content rendered into a shadow root; and a child portalled
itself with `asChild`, keeping its own `data-slot`. The end-to-end suite runs each in Chromium, Firefox and WebKit.

Each test was proven by changing the code and watching a test fail.

<!-- tests -->
| Suite | Tests | Files |
|---|--:|---|
| Unit | 15 | `portal.radix.test.tsx` 3, `portal.test.tsx` 12 |
| End to end | 5 | `portal.e2e.ts` 5 |
| registry-ui | 0 | - |
<!-- /tests -->

<!-- behaviour -->
<details>
<summary>20 behaviours, one per test</summary>

**Unit, `portal.radix.test.tsx`**

- Portal.Root
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
  - spreads them onto the element it renders inside a given `container`

**Unit, `portal.test.tsx`**

- Portal
  - renders children into document.body by default
  - renders with data-slot="portal"
  - takes a data-slot it is given over its own
  - leaves the data-slot to the component it slots onto
  - renders into a custom container
  - renders into a form holding a control named current, which a browser shows as a property of the form
  - renders into the element a ref holds, when that element renders after it
  - renders its children in the commit it mounts in
  - renders nothing while its ref holds no element
  - renders nothing on the server, where a portal cannot render
  - is also exported as Root, the name Radix gives it, and names itself Portal
  - forwards ref

**End to end, `portal.e2e.ts`**

- Portal
  - renders its content into the body, out of a box that clips, and takes it out when it goes
  - renders into the element a ref holds, when that element renders after it
  - renders into a form holding a control named current, where its field shows and the form sends it
  - renders into a shadow root
  - portals its child itself with asChild, leaving the child its own data-slot

</details>
<!-- /behaviour -->

## Beyond Radix

Against `@radix-ui/react-portal` 1.1.17, the version Radix's dialog, popover, menu, select and tooltip ship.

- `container` takes a ref as well as an element, as Base UI and Ark UI do, so content can portal into an element
  that renders after it without keeping that element in state. Nothing renders while the ref holds no element.
- The `div` it renders carries `data-slot="portal"`. With `asChild` it carries none, so the child keeps its own.

## Fixed

- Content portals into a form holding a control named `current`. A browser shows a form's named controls as its
  properties, so the form passed for a ref and the content went into that control, where it was never drawn.
- `Root` is exported beside `Portal`, as Radix exports it, so `<Portal.Root>` works as it does with Radix.

## Smaller and faster

- The module is 1,525 bytes against Radix's 1,746, each minified and gzipped with everything it imports but React.
- Content renders in the commit the portal mounts in. Radix renders nothing until a layout effect has run and then
  renders again, so every overlay opening through it commits twice. The server and hydration render nothing here
  too, and a ref holding no element is read again once the commit is done.

## Later

- Without a `container`, it renders into the body of the document its script runs in, as Radix and Base UI do. A
  React tree rendered into an iframe's document has to pass that document's body.
