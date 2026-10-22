# Slot

Renders its one child element in place of an element of its own, merging its props onto that child. It is what
`asChild` does everywhere in the library.

| Part | Where |
|---|---|
| Primitive | `@gentleduck/primitives/slot` |
| API docs | [`duck-primitives/api/slot.mdx`](../../../../apps/duck/content/docs/duck-primitives/api/slot.mdx) |
| Used by | every part that takes `asChild`, through `Primitive` |

It has no styled component of its own. registry-ui's `Button`, `Badge`, `Breadcrumb`, `Item`, `Sidebar` and the
other parts that take `asChild` render it directly.

## Tests

The stories cover a link given a button's props through `asChild`, which runs its own click handler before the
button's, by pointer and by Enter, joins the classes with the button's first, keeps its own style over the
button's, is described by its own note and the button's hint, and reaches both refs; a field whose icons sit
around a `Slottable` and keep what was typed as one comes and goes; a render prop `Slottable` wrapping the
element's children; a lazy component; text, several elements and a `Slottable` around text, each throwing an
error that names its owner; a ref that sets state, attached no more as the slot renders again; and raw HTML a
child sets, which is not rendered. The end-to-end suite runs each in Chromium, Firefox and WebKit.

Each test was proven by changing the code and watching a test fail.

`slot.radix.test.tsx` holds Radix's slot tests, with the input tests Radix skips.

<!-- tests -->
| Suite | Tests | Files |
|---|--:|---|
| Unit | 64 | `slot.radix.test.tsx` 37, `slot.test.tsx` 27 |
| End to end | 10 | `slot.e2e.ts` 10 |
| registry-ui | 0 | - |
<!-- /tests -->

<!-- behaviour -->
<details>
<summary>74 behaviours, one per test</summary>

**Unit, `slot.radix.test.tsx`**

- given a slotted Trigger &gt; with onClick on itself
  - should call the onClick passed to the Trigger
- given a slotted Trigger &gt; with onClick on the child
  - should call the child's onClick
- given a slotted Trigger &gt; with onClick on itself AND the child
  - should call the Trigger's onClick
  - should call the child's onClick
- given a slotted Trigger &gt; with onClick on itself AND undefined onClick on the child
  - should call the Trigger's onClick
- given a slotted Trigger &gt; with undefined onClick on itself AND onClick on the child
  - should call the child's onClick
- given a Button with Slottable &gt; without asChild
  - should render a button with icon on the left/right
- given a Button with Slottable &gt; with asChild
  - should render a link with icon on the left/right
- given a Button with Slottable nesting &gt; without asChild
  - should render a button with a span around its children
  - should render a button with icon on the left/right and a span around its children
- given a Button with Slottable nesting &gt; with asChild
  - should render a link with a span around its children
  - should render a link with icon on the left/right and a span around its children
- given an Input &gt; without asChild
  - should only call function refs once
- given an Input &gt; with asChild
  - should only call function refs once
- given a Slot with React lazy components &gt; with a lazy component as child
  - should render the lazy component correctly
- given a Slot with React lazy components &gt; with a lazy component in Button with Slottable
  - should render a lazy link with icon on the left/right
- given a Slot with React Flight lazy references
  - should unwrap a lazy reference that resolves to an element
  - should unwrap a lazy reference that resolves to another lazy reference
  - should unwrap a nested lazy reference reached through Slottable
- Slot prop and ref merging (single element child)
  - merges className, forwards unknown props, and composes onClick (child first, then slot)
  - merges, normalizes, and deduplicates aria-describedby with the child ids first
  - composes the Slot ref and the child ref onto the same node
- Slot with non-mergeable children
  - renders nothing and does not throw for null children
  - renders nothing and does not throw for undefined children
  - renders nothing and does not throw for false (e.g. a falsy `&amp;&amp;` expression) children
  - renders an empty Slot without throwing
  - throws a descriptive error when given multiple element children
  - throws a descriptive error for a single non-element child
  - throws a Slottable error when a Slottable wraps multiple elements
  - throws a Slottable error when a render-prop Slottable `child` is not an element
  - throws a Slottable error when a Slottable wraps a non-element child
- Slottable identifier interoperability (Symbol.for)
  - recognizes a foreign Slottable marked with the shared symbol
- Slottable (siblings) merges Slot props onto the slotted element
  - merges className/handlers onto the slotted element while keeping siblings
- nested (render-prop) Slottable
  - merges Slot props onto the rendered child and wraps the original children
  - works under Suspense when the child element is lazy
- Slot.Root &gt; ref stability
  - does not cause an infinite render loop when attaching the ref triggers a render
  - passes a single stable composed ref to the child across re-renders

**Unit, `slot.test.tsx`**

- Slot
  - renders children directly when no asChild
  - names itself after its owner, for React DevTools
  - keeps a class set on the child alone as it is
  - hands the child its own ref when it has none of its own, so the child can read the ref object
  - leaves a prop that only starts with on, such as onlyIcon, to the child
  - hands back what the child handler returns
  - merges className from slot and child
  - joins conflicting classes as written, slot first, leaving the merge to the styled layer
  - composes event handlers from slot and child
  - merges style objects
  - forwards ref to the child element
- Slottable
  - keeps the state inside its element when a child before it comes and goes
  - lands on the first of two Slottables, rendering the second as it stands
  - leaves a component marked with another library symbol where it stands
  - renders Slottable children through the Slot
- Slot (edge cases)
  - passes data-* attributes to child
  - leaves out an aria-describedby the child sets to false
  - passes aria-* attributes to child
  - child style takes precedence over slot style for same properties
  - child event handlers run before slot handlers
  - handles single text child
- Slot (children it cannot slot onto)
  - throws for a 0 child, which a falsy count before `&amp;&amp;` leaves behind
  - unwraps a lazy node only when its payload is a promise, so use is never handed anything else
  - leaves an object that only carries a promise as its payload to React, which refuses it
  - hands a Fragment child no ref, which React refuses on a Fragment
- Slot (security)
  - drops dangerouslySetInnerHTML supplied by a Slot child
  - still merges legitimate onClick and className when child is sanitized

**End to end, `slot.e2e.ts`**

- Slot
  - lands on the link, runs its click handler before the slot one, by pointer and by Enter
  - joins the classes, slot first, and lets the child style win
  - describes the link by its note and the slot hint, and by the hint alone once the note is false
  - hands the link to both its own ref and the slot ref
  - puts its other children inside the Slottable element, which keeps what was typed as they change
  - wraps the element children with a render prop Slottable
  - lands on a lazy component once it loads
  - throws an error naming its owner for text, several elements and a Slottable around text
  - attaches a ref that renders no more however often the slot renders again
  - renders no raw HTML a child sets

</details>
<!-- /behaviour -->

## Beyond Radix

Against `@radix-ui/react-slot` 1.3.3, the version Radix's dialog, popover, menu, select and tooltip ship. 1.5.0,
the latest, also joins `aria-describedby` and unwraps a lazy reference that resolves to another.

- `aria-describedby` on the slot joins the child's, the child's ids first, with blanks and repeats dropped, as in
  1.5.0. In 1.3.3 the child's replaces the slot's.
- A lazy server component reference is unwrapped until it reaches an element, including one inside a
  `Slottable`, as in 1.5.0. 1.3.3 unwraps one.
- `dangerouslySetInnerHTML` never reaches the element, from the slot or from the child, so `asChild` cannot
  write raw HTML into it. Radix passes it on.
- Given two `Slottable`s, the slot lands on the element of the first and renders the second as it stands. Radix
  lands on the last and drops the element of the first, keeping only its children.

## Fixed

- The element inside a `Slottable` keeps its state, and a field inside it what was typed, when a child before the
  `Slottable` comes or goes. The slot numbered its children without the gaps a `false` child leaves, so React
  took the element's own children for new ones and mounted them again. Radix's keeps them.
- An `aria-describedby` the child sets to `false`, as a condition leaves it, is left out of the joined ids, as
  Radix 1.5.0 leaves it out. It went in as an id named `false`. A `Tooltip.Trigger` and `Dialog.Content` join
  their ids the same way and leave it out too.

## Smaller and faster

- `Slot` is 1,178 bytes against Radix 1.3.3's 1,326 and 1.5.0's 1,457, each minified and gzipped with everything it imports but React.

## Breaking changes

- A single text or number child, `0` included, and a `Slottable` around anything but one element throw an error
  naming the owner, as in Radix 1.5.0. They rendered nothing. Several children threw before, and now throw the
  same error.
- The slot's `className` and the child's are joined as written, the slot's first, as in Radix. They went through
  tailwind-merge, so a child's Tailwind class overrode a conflicting one on the `asChild` component. Put the
  override on the component, whose own `cn` merges it.
- `ISlot.ICloneProps` is gone.

## Later

- Base UI's `render` prop also takes a function, called with the props and the part's state, so the consumer
  decides where each prop goes. The slot only merges onto an element.
