# Popper

Places floating content against an anchor: on a side, at an alignment, kept inside its boundary, with an arrow
pointing back at the anchor.

| Part | Where |
|---|---|
| Primitive | `@gentleduck/primitives/popper` |
| API docs | [`duck-primitives/api/popper.mdx`](../../../../apps/duck/content/docs/duck-primitives/api/popper.mdx) |
| Used by | `popover`, `tooltip`, `hover-card`, `select` and every `menu` |

It has no styled component of its own. registry-ui reaches it through the components above.

## Tests

The stories cover content on each side and at each alignment, moved by its offsets, left to right and right to
left; content kept inside a box, flipping, shifting clear of its collision padding, going with an anchor that left
the box unless sticky, and shifting along its own side; an arrow on an anchor too small for its padding and on one
too wide to point at; content following the pointer through a virtual anchor; animated content growing from its
arrow on each side; content fitted to the room below its anchor; content in a scrolling box that hides while its
anchor is scrolled out; and content sized by a custom portal host. The end-to-end suite runs each in Chromium,
Firefox and WebKit.

Each test was proven by changing the code and watching a test fail.

<!-- tests -->
| Suite | Tests | Files |
|---|--:|---|
| Unit | 57 | `popper.radix.test.tsx` 9, `popper.test.tsx` 48 |
| End to end | 22 | `popper.e2e.ts` 20, `popper.radix.e2e.ts` 2 |
| registry-ui | 0 | - |
<!-- /tests -->

<!-- behaviour -->
<details>
<summary>79 behaviours, one per test</summary>

**Unit, `popper.radix.test.tsx`**

- PopperAnchor virtualRef
  - updates the anchor when virtualRef.current is swapped on an unrelated re-render
  - registers a virtualRef whose current is set after mount
- PopperContent ref stability
  - keeps a stable composed ref (no infinite render loop)
- Popper.Anchor
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- Popper.Content
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- Popper.Arrow
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set

**Unit, `popper.test.tsx`**

- Popper
  - renders children
  - renders anchor with data-slot="popper-anchor"
  - renders anchor as a div by default
  - anchor supports asChild
  - an asChild anchor leaves the slot to the component it is given, which names its own
  - anchor forwards ref
  - mirrors left and right sides in RTL
  - takes its direction from its own dir over its DirectionProvider
  - renders nothing for a virtual anchor
  - keeps a popper a component scopes apart from the one around it
  - draws its arrow as a block, keeping the style it was given
- Popper placement on the anchor
  - marks the anchor with the side and align the content was placed at
  - marks the child an asChild anchor renders
  - follows a change of side and clears the marks once the content is gone
  - marks the anchor without rendering the rest of the popper again
- Popper positioning
  - shows an arrow that points at the middle of a small anchor once its padding slid the content over
  - keeps inside its own window's viewport, not the one of an anchor from another document
  - sets its arrow on the side facing the anchor, turned to point at it
  - holds its wrapper off screen until placed, then pins it at least as wide as its content
  - tells its content the anchor's size
  - names the side and alignment it was placed at, after a flip
  - places itself where the host has no ResizeObserver, as a test DOM may not
  - skips a null collision boundary
  - keeps its collision padding when it shifts
  - shifts along its side's own axis rather than flipping, when told to
  - counts an anchor inside its collision padding as out of view when hiding
  - keeps clear of only the edges a collision padding names
  - takes one element as its collision boundary
  - stops shifting at the anchor edge, or keeps shifting when sticky is always
  - hides itself once its anchor leaves the viewport, when asked
  - hides itself once a scroll container clips its anchor, with no boundary given
  - hides itself once a scroll container clips its anchor, with only a null boundary given
  - hides itself once its anchor leaves the collision boundary
  - grows from the arrow on every side
  - reports once it is placed, and holds its animation until then
  - runs an animation given in its style once it is placed
  - aligns and grows the way its DirectionProvider reads when portalled out of it
  - stacks its wrapper at the z-index the content asks for
  - follows a moving anchor every frame only when its update strategy is always
  - places every open content again as the window resizes, and still does once one of them closes
  - flips and shifts away from the edges unless told not to avoid collisions
  - stands off by its side offset and the arrow, and slides by its align offset
  - keeps the arrow its padding from the corner, sliding over so it still points at the anchor
  - hides the arrow once a shift leaves it unable to point at the anchor, growing from its edge instead
  - grows from the edge it is aligned to when it has no arrow, mirrored in RTL above and below
- Popper positioning &gt; as sizes change
  - places itself again for its anchor's new size or its own, and not for a size it was placed at
  - stops watching sizes, scrolls and resizes once it closes
- Popper anchor from another window
  - marks an anchor that lives in an iframe

**End to end, `popper.e2e.ts`**

- Popper placement
  - opens on the top of its anchor, its arrow between them pointing at the anchor
  - opens on the right of its anchor, its arrow between them pointing at the anchor
  - opens on the bottom of its anchor, its arrow between them pointing at the anchor
  - opens on the left of its anchor, its arrow between them pointing at the anchor
  - lines its start or end up with the anchor, moved along by its align offset
  - stands off by its side offset plus the arrow
  - mirrors left and right, and lines its start up with the right edge, right to left
- Popper resizing
  - centres itself on its anchor again when either changes size
- Popper collisions
  - flips to the other side when it does not fit, unless told not to avoid collisions
  - shifts to stay inside the box, keeping its collision padding from the edge
  - goes with an anchor that has left the box, or stays inside when sticky is always
  - shifts along its own side instead of flipping when told to
- Popper arrow
  - slides the content over to keep its padding and still point at the anchor
  - hides once it cannot point at the middle of the anchor
- Popper virtual anchor
  - follows the pointer every frame
- Popper animated
  - runs the animation in its style once placed, growing from the arrow on the top
  - runs the animation in its style once placed, growing from the arrow on the right
  - runs the animation in its style once placed, growing from the arrow on the bottom
  - runs the animation in its style once placed, growing from the arrow on the left
- Popper available size
  - fits the room left below its anchor at the width of the anchor, scrolling the rest

**End to end, `popper.radix.e2e.ts`**

- Popper &gt; given hideWhenDetached and no explicit collisionBoundary
  - hides the content when the anchor is clipped by its scroll container but still within the viewport
- Popper &gt; given content in a transformed, overflow-clipping custom portal host
  - measures available size against the viewport, not the portal host

</details>
<!-- /behaviour -->

## Beyond Radix

Against `@radix-ui/react-popper` 1.3.7, the version `@radix-ui/react-popover` 1.1.23 ships.

- `side="left"` and `side="right"` mirror in right to left, like every other physical side in the library. The
  direction comes from `dir` on the content, then the nearest `DirectionProvider`, then `<html dir>`. Radix reads
  no direction.
- `shiftCrossAxis` lets a shift also move the content along its side's own axis. Radix never shifts along it.
- `anchor` on the root places the content against an element the caller already holds, so a part that has its
  trigger renders no `Popper.Anchor`.
- `updateOnScroll={false}` on the content adds no scroll listeners, for content that closes when its anchor
  scrolls.

## Fixed

- Passes every Radix popper test.
- An `animation` given in the content's `style` runs once the content is placed, as in Radix. It was replaced by
  `undefined`, so only a class could animate the content.
- Content portalled out of a right-to-left `DirectionProvider` lines its `start` up with the anchor's right edge
  and grows from there. The side mirrored by the provider while the alignment read the page's direction, so
  `side="left"` opened on the right but `align="start"` still lined up on the left.
- An arrow that points at the middle of a small anchor, once `arrowPadding` slid the content over, stays visible.
  Floating UI's arithmetic left it a hair off centre, and an arrow not exactly centred was hidden, as Radix's
  still is.
- `virtualRef` takes a ref made with `useRef<IPopper.IMeasurable | null>(null)`, as Radix's does. It needed a cast.
- With a `collisionBoundary`, content stays inside the viewport of its own window. It measured the viewport of
  the anchor's window, as Radix does, which for an anchor in an iframe is the iframe's.

## Smaller and faster

- The anchor carries `data-popper-side` and `data-popper-align` without a render. Radix keeps the placement in
  the root's state to put its `data-radix-popper-side` on the anchor, so every placement renders the whole popper
  again; the content here writes both attributes onto the anchor's element.
- Content is placed once as it opens, where Floating UI placed it three times: its resize observer reports the size
  each element already had, the first time it sees it and again once it watches the content anew, and every report
  placed the content again. The popper watches sizes itself and places again only for a size it was not placed at,
  which takes about 0.3 ms off each open.
- Each scrolling ancestor is listened to once, where Floating UI listened on the window and its visual viewport
  once for the anchor and again for the content.
- Every placed content shares one `resize` listener on the window and on its visual viewport, where each added
  its own and removing it searched a list every other one had grown.
- The content's wrapper stays registered with Floating UI while it unmounts. React 19 handed Floating UI a null
  wrapper, which set the state of a component already going.

## Later

- `Popper.Arrow` is a fixed SVG triangle. Base UI's arrow is an element the content positions for any shape.
