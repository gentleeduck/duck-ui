```tsx
import * as Popper from '@gentleduck/primitives/popper'
```

## Anatomy

```tsx
<Popper.Root>
  <Popper.Anchor />
  <Popper.Content side="bottom" sideOffset={5} align="center">
    <Popper.Arrow />
  </Popper.Content>
</Popper.Root>
```

## Usage

Content that follows the pointer, measured from a virtual anchor that `updatePositionStrategy="always"` reads every frame:

```tsx
import * as Popper from '@gentleduck/primitives/popper'
import type { IPopper } from '@gentleduck/primitives/popper'

const pointer = React.useRef({ x: 0, y: 0 })
const anchor = React.useRef<IPopper.IMeasurable>({
  getBoundingClientRect: () => DOMRect.fromRect(pointer.current),
})

<div onPointerMove={(event) => (pointer.current = { x: event.clientX, y: event.clientY })}>
  <Popper.Root>
    <Popper.Anchor virtualRef={anchor} />
    <Popper.Content side="right" sideOffset={8} updatePositionStrategy="always">
      Here
    </Popper.Content>
  </Popper.Root>
</div>
```

## Examples

### Sides

```tsx title="components/popper-basic.tsx"
// import from your project: import Demo from '@/components/popper-basic'
'use client'

import * as Popper from '@gentleduck/primitives/popper'
import * as React from 'react'
import styles from '../primitives.module.css'

const SIDES = ['top', 'right', 'bottom', 'left'] as const

export default function PopperBasicExample() {
  const [side, setSide] = React.useState<(typeof SIDES)[number]>('top')

  return (
    <div className={styles.stack}>
      <div className={styles.row}>
        {SIDES.map((value) => (
          <button className={styles.button} key={value} onClick={() => setSide(value)} type="button">
            {value === side ? `[${value}]` : value}
          </button>
        ))}
      </div>
      <div style={{ padding: '3rem 6rem' }}>
        <Popper.Root>
          <Popper.Anchor className={styles.box}>Anchor</Popper.Anchor>
          <Popper.Content
            className={`${styles.content} ${styles.panel}`}
            side={side}
            sideOffset={6}
            style={{ minWidth: 0 }}>
            {side}
            <Popper.Arrow className={styles.arrow} />
          </Popper.Content>
        </Popper.Root>
      </div>
    </div>
  )
}
```

### A virtual anchor

```tsx title="components/popper-virtual.tsx"
// import from your project: import Demo from '@/components/popper-virtual'
'use client'

import * as Popper from '@gentleduck/primitives/popper'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function PopperVirtualExample() {
  const point = React.useRef({ getBoundingClientRect: () => new DOMRect(0, 0, 0, 0) })
  const [, rerender] = React.useState(0)

  return (
    <Popper.Root>
      <Popper.Anchor virtualRef={point} />
      <div
        className={styles.contextArea}
        onPointerMove={(event) => {
          point.current = { getBoundingClientRect: () => new DOMRect(event.clientX, event.clientY, 0, 0) }
          rerender((count) => count + 1)
        }}>
        Move the pointer here
      </div>
      <Popper.Content
        className={`${styles.content} ${styles.panel}`}
        side="right"
        sideOffset={12}
        style={{ minWidth: 0 }}>
        Following a virtual anchor
      </Popper.Content>
    </Popper.Root>
  )
}
```

### Collisions in a scrolling box

```tsx title="components/popper-collisions.tsx"
// import from your project: import Demo from '@/components/popper-collisions'
'use client'

import * as Popper from '@gentleduck/primitives/popper'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function PopperCollisionsExample() {
  const [box, setBox] = React.useState<HTMLDivElement | null>(null)

  return (
    <div
      className={styles.box}
      ref={setBox}
      style={{ height: '12rem', overflow: 'auto', position: 'relative', width: '20rem' }}>
      <div style={{ height: '30rem', paddingTop: '9rem', paddingInlineStart: '1rem' }}>
        <Popper.Root>
          <Popper.Anchor className={styles.button}>Scroll the box</Popper.Anchor>
          <Popper.Content
            className={`${styles.content} ${styles.panel}`}
            collisionBoundary={box}
            collisionPadding={8}
            hideWhenDetached
            side="bottom"
            sticky="always"
            style={{ minWidth: 0 }}>
            Flips to stay in the box, and hides once its anchor scrolls out.
          </Popper.Content>
        </Popper.Root>
      </div>
    </div>
  )
}
```

### Available size

```tsx title="components/popper-available-size.tsx"
// import from your project: import Demo from '@/components/popper-available-size'
'use client'

import * as Popper from '@gentleduck/primitives/popper'
import styles from '../primitives.module.css'

const OPTIONS = Array.from({ length: 40 }, (_, index) => `Option ${index + 1}`)

export default function PopperAvailableSizeExample() {
  return (
    <Popper.Root>
      <Popper.Anchor className={styles.button}>A long list below</Popper.Anchor>
      <Popper.Content
        className={styles.content}
        collisionPadding={16}
        sideOffset={6}
        style={{
          maxHeight: 'var(--gentleduck-popper-available-height)',
          minWidth: 'var(--gentleduck-popper-anchor-width)',
          overflowY: 'auto',
        }}>
        {OPTIONS.map((option) => (
          <div className={styles.item} key={option}>
            {option}
          </div>
        ))}
      </Popper.Content>
    </Popper.Root>
  )
}
```

***

## API

### `Popper.Root`

Connects an anchor to its content. It renders nothing of its own.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `anchor` | `IPopper.IMeasurable \| null` | - | The element to place the content against, for a component that already holds it, in place of a `Popper.Anchor` |

### `Popper.Anchor`

The reference element that content is positioned relative to.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `virtualRef` | `React.RefObject<IPopper.IMeasurable \| null>` | - | Position relative to a virtual element instead of a DOM node: anything with `getBoundingClientRect()`. The anchor then renders nothing |

While the content is mounted, the anchor element carries `data-popper-side` and `data-popper-align`: where the content was placed, after any flip. The trigger of a Popover, Select, Tooltip, Hover Card or menu is its anchor, so it can point a chevron at its content with `data-[popper-side=top]:rotate-180`. A virtual anchor gets neither. The content itself carries `data-side` and `data-align`.

### `Popper.Content`

The floating content. Positioned relative to the anchor, inside a wrapper with `data-slot="popper-content-wrapper"` that is `position: fixed` and takes the content's `z-index`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `side` | `'top' \| 'right' \| 'bottom' \| 'left'` | `'bottom'` | Preferred side relative to anchor |
| `sideOffset` | `number` | `0` | Gap between content and anchor (px) |
| `align` | `'start' \| 'center' \| 'end'` | `'center'` | Alignment along the side |
| `alignOffset` | `number` | `0` | Alignment offset (px) |
| `arrowPadding` | `number` | `0` | Space kept between the arrow and the content's edges (px). Against an anchor too small for it, the content slides over so the arrow still points at the anchor's middle |
| `avoidCollisions` | `boolean` | `true` | Flip and shift to stay inside the boundary |
| `collisionBoundary` | `Element \| null \| Array<Element \| null>` | `[]` | Elements to stay inside, besides the viewport. A `null` is skipped |
| `collisionPadding` | `number \| Partial<Record<Side, number>>` | `0` | Space kept from the boundary's edges (px), on every side or per side |
| `sticky` | `'partial' \| 'always'` | `'partial'` | `'partial'` stops shifting once the content would leave its anchor; `'always'` keeps it in the boundary regardless |
| `shiftCrossAxis` | `boolean` | `false` | Also shift along the side's own axis, such as vertically for a top or bottom placement |
| `hideWhenDetached` | `boolean` | `false` | Hide content once the anchor is out of view: scrolled out of a scrolling box or the viewport, or out of `collisionBoundary` when set |
| `updatePositionStrategy` | `'optimized' \| 'always'` | `'optimized'` | `'optimized'` measures again on scroll, resize and layout changes; `'always'` on every animation frame, for an anchor that moves by itself |
| `updateOnScroll` | `boolean` | `true` | Measure again when a box around the anchor scrolls. Off for content that closes when its anchor scrolls, such as a tooltip, which has no scroll to follow |
| `onPlaced` | `() => void` | - | Called once the content has been positioned |

`side="left"` and `side="right"` mirror in right to left. The direction comes from `dir` on the content, then the nearest `DirectionProvider`, then `<html dir>`, and the wrapper carries the provider's, so content portalled out of a `DirectionProvider` still aligns its `start` the way the provider reads.

Until the content is positioned, the wrapper sits off screen and the content's `animation` is `none`, so an entry animation starts from where it opens. An `animation` in its `style` runs once it is placed.

The wrapper sets these variables for the content to read:

| Variable | Value |
| --- | --- |
| `--gentleduck-popper-transform-origin` | The point the content grows from: the arrow's tip, or the anchor's edge when there is no arrow |
| `--gentleduck-popper-available-width` | Room left inside the boundary along the width |
| `--gentleduck-popper-available-height` | Room left inside the boundary along the height |
| `--gentleduck-popper-anchor-width` | The anchor's width |
| `--gentleduck-popper-anchor-height` | The anchor's height |

### `Popper.Arrow`

An SVG arrow pointing at the anchor, on the side of the content facing it. It hides when it cannot point at the anchor's center without leaving the content.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `width` | `number` | `10` | Width (px) |
| `height` | `number` | `5` | Height (px), added to `sideOffset` |
| `asChild` | `boolean` | `false` | Draw your own SVG children instead of the default path |

## How it works

}>
  Popper measures the anchor element's rect, calculates the content position based on `side` and `align`, and adjusts if the content would overflow the viewport (when `avoidCollisions` is true).

}>
  You rarely use Popper directly. Popover, Tooltip, Hover Card, and Menu use it internally for positioning.