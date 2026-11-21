```tsx
import { DismissableLayer, DismissableLayerBranch, useDismissableLayerSurface } from '@gentleduck/primitives/dismissable-layer'
```

## Examples

### Why it closed

```tsx title="components/dismissable-layer-basic.tsx"
// import from your project: import Demo from '@/components/dismissable-layer-basic'
'use client'

import { DismissableLayer } from '@gentleduck/primitives/dismissable-layer'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function DismissableLayerBasicExample() {
  const [open, setOpen] = React.useState(false)
  const [reason, setReason] = React.useState('none yet')

  return (
    <div className={styles.stack}>
      <button className={styles.button} onClick={() => setOpen(true)} type="button">
        Show panel
      </button>
      {open ? (
        <DismissableLayer
          className={`${styles.content} ${styles.panel}`}
          onDismiss={() => setOpen(false)}
          onEscapeKeyDown={() => setReason('Escape')}
          onFocusOutside={() => setReason('focus moved out')}
          onPointerDownOutside={() => setReason('press outside')}>
          Press Escape, click outside, or Tab away.
          <button className={styles.button} type="button">
            A button inside
          </button>
        </DismissableLayer>
      ) : null}
      <p className={styles.note}>Last dismissed by: {reason}.</p>
    </div>
  )
}
```

### Stacked layers

```tsx title="components/dismissable-layer-stacked.tsx"
// import from your project: import Demo from '@/components/dismissable-layer-stacked'
'use client'

import { DismissableLayer } from '@gentleduck/primitives/dismissable-layer'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function DismissableLayerStackedExample() {
  const [outer, setOuter] = React.useState(false)
  const [inner, setInner] = React.useState(false)

  return (
    <div className={styles.stack}>
      <button className={styles.button} onClick={() => setOuter(true)} type="button">
        Open the first layer
      </button>
      {outer ? (
        <DismissableLayer
          className={`${styles.content} ${styles.panel} ${styles.stack}`}
          onDismiss={() => setOuter(false)}>
          First layer
          <button className={styles.button} onClick={() => setInner(true)} type="button">
            Open a second layer
          </button>
          {inner ? (
            <DismissableLayer className={`${styles.content} ${styles.panel}`} onDismiss={() => setInner(false)}>
              Second layer: Escape closes this one first.
            </DismissableLayer>
          ) : null}
        </DismissableLayer>
      ) : null}
    </div>
  )
}
```

### A branch

```tsx title="components/dismissable-layer-branch.tsx"
// import from your project: import Demo from '@/components/dismissable-layer-branch'
'use client'

import { DismissableLayer, DismissableLayerBranch } from '@gentleduck/primitives/dismissable-layer'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function DismissableLayerBranchExample() {
  const [open, setOpen] = React.useState(true)
  const [saved, setSaved] = React.useState(0)

  return (
    <div className={styles.stack}>
      <button className={styles.button} onClick={() => setOpen(true)} type="button">
        Open editor
      </button>
      {open ? (
        <DismissableLayer className={`${styles.content} ${styles.panel}`} onDismiss={() => setOpen(false)}>
          An open editor
        </DismissableLayer>
      ) : null}
      <DismissableLayerBranch className={styles.box}>
        <button className={styles.button} onClick={() => setSaved((count) => count + 1)} type="button">
          Save from the toolbar ({saved})
        </button>
        <p className={styles.note}>A press in this branch leaves the editor open; one anywhere else closes it.</p>
      </DismissableLayerBranch>
    </div>
  )
}
```

### A surface

```tsx title="components/dismissable-layer-surface.tsx"
// import from your project: import Demo from '@/components/dismissable-layer-surface'
'use client'

import { DismissableLayer, useDismissableLayerSurface } from '@gentleduck/primitives/dismissable-layer'
import * as React from 'react'
import styles from '../primitives.module.css'

function Backdrop() {
  const ref = useDismissableLayerSurface()
  return (
    <div
      className={styles.overlay}
      onPointerDown={(event) => event.stopPropagation()}
      ref={ref}
      style={{ background: 'color-mix(in oklab, black 20%, transparent)' }}
    />
  )
}

export default function DismissableLayerSurfaceExample() {
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <button className={styles.button} onClick={() => setOpen(true)} type="button">
        Open over a backdrop
      </button>
      {open ? (
        <>
          <Backdrop />
          <DismissableLayer className={styles.dialog} onDismiss={() => setOpen(false)}>
            The backdrop stops every press it gets, and a press on it still closes this layer.
          </DismissableLayer>
        </>
      ) : null}
    </>
  )
}
```

### Blocking the page

```tsx title="components/dismissable-layer-block-outside.tsx"
// import from your project: import Demo from '@/components/dismissable-layer-block-outside'
'use client'

import { DismissableLayer } from '@gentleduck/primitives/dismissable-layer'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function DismissableLayerBlockOutsideExample() {
  const [open, setOpen] = React.useState(false)
  const [clicks, setClicks] = React.useState(0)

  return (
    <div className={styles.stack}>
      <div className={styles.row}>
        <button className={styles.button} onClick={() => setOpen(true)} type="button">
          Open a blocking layer
        </button>
        <button className={styles.button} onClick={() => setClicks((count) => count + 1)} type="button">
          Counter {clicks}
        </button>
      </div>
      {open ? (
        <DismissableLayer
          className={`${styles.content} ${styles.panel}`}
          disableOutsidePointerEvents
          onDismiss={() => setOpen(false)}>
          While this is open the counter cannot be pressed: the first press outside only closes it.
        </DismissableLayer>
      ) : null}
    </div>
  )
}
```

***

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `onPointerDownOutside` | `(event) => void` | - | Fired on a press outside. Call `event.preventDefault()` to prevent dismiss. |
| `onFocusOutside` | `(event) => void` | - | Fired when focus moves outside |
| `onInteractOutside` | `(event) => void` | - | Fired for any outside interaction |
| `onEscapeKeyDown` | `(event) => void` | - | Fired on <Kbd>Escape</Kbd> press, except while an input method is composing text |
| `onDismiss` | `() => void` | - | Called when the layer should be dismissed |
| `disableOutsidePointerEvents` | `boolean` | `false` | Block pointer events on elements outside this layer |
| `deferPointerDownOutside` | `boolean` | `false` | Wait for the click after a primary press outside, so code that stops the pointerup, mouse, touch or click events after it cancels the dismissal |

A touch always waits for its click, so that click does not land on what the closing layer uncovered. A right or control press never waits, since macOS sends no click for it. A press that waits and gets no click, such as a touch that turns into a scroll, is let go when the mouse lifts or the touch is cancelled, so focus leaving the layer dismisses it again and a later click does not.

The press that opened the layer reaches the document after the layer mounts and does not dismiss it. Any press made after the mount does, even one the browser runs before its timers on a busy page.

A press on a scrollbar outside the layer scrolls without dismissing it, whether the scrollbar belongs to a box on the page or to the page itself, and so does the focus that press gives a focusable box. So does a press on a scrollbar macOS draws over the edge of a box or the page, taking no room. Nothing on the event tells it from a press on the content under it, so a primary press within 17 pixels of that edge waits for its click, which only a press on the content sends, and `onPointerDownOutside` is called once that click lands.

Inside a shadow root the layer reads each event's target from its composed path and also listens for focus on the shadow root, since focus moving between two of its elements never reaches the document. A branch, a surface or a scroll box in the same shadow root counts as it does in the document, focus moving to another element of the shadow root dismisses the layer, and `onPointerDownOutside` and `onFocusOutside` receive the element pressed or focused rather than the shadow host.

The layer works from its element. With `asChild`, a child that never takes the ref leaves the layer out of the stack, so nothing dismisses it.

## useDismissableLayerSurface

Returns a ref callback for a node, such as a dialog's overlay, that dismisses the layer even when its own handlers stop propagation. Like branches, surfaces count for every layer on the page:

```tsx
const ref = useDismissableLayerSurface()
return <div ref={ref} className="fixed inset-0" />
```

## DismissableLayerBranch

}>
  Marks a DOM subtree as "part of" the dismissable layer. Clicks inside a branch won't trigger dismissal. Useful for toasts or notifications that relate to the overlay but render outside it.

}>
  Used internally by the content of Dialog, Popover, Tooltip, Hover Card, Select, Navigation Menu and every menu. Dialog and Popover defer their outside press, and `Dialog.Overlay` is a surface.