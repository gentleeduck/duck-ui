```tsx
import { Presence } from '@gentleduck/primitives/presence'
```

## Usage

```tsx
<Presence present={isOpen}>
  <div className="my-animated-element">Content</div>
</Presence>
```

}>
  When `present` changes from `true` to `false`, Presence waits for the CSS animations the child runs as it closes to end before unmounting. No JavaScript animation library needed.

## Examples

### An exit animation

```tsx title="components/presence-exit-animation.tsx"
// import from your project: import Demo from '@/components/presence-exit-animation'
'use client'

import { Presence } from '@gentleduck/primitives/presence'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function PresenceExitAnimationExample() {
  const [open, setOpen] = React.useState(true)

  return (
    <div className={styles.stack}>
      <button className={styles.button} onClick={() => setOpen((value) => !value)} type="button">
        {open ? 'Hide' : 'Show'}
      </button>
      <Presence present={open}>
        <div className={`${styles.content} ${styles.panel} ${styles.fade}`} data-state={open ? 'open' : 'closed'}>
          Stays in the page until its fade out ends.
        </div>
      </Presence>
    </div>
  )
}
```

### A render function

```tsx title="components/presence-render-function.tsx"
// import from your project: import Demo from '@/components/presence-render-function'
'use client'

import { Presence } from '@gentleduck/primitives/presence'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function PresenceRenderFunctionExample() {
  const [open, setOpen] = React.useState(true)

  return (
    <div className={styles.stack}>
      <button className={styles.button} onClick={() => setOpen((value) => !value)} type="button">
        {open ? 'Hide' : 'Show'}
      </button>
      <Presence present={open}>
        {({ present }) => (
          <div className={`${styles.content} ${styles.panel} ${styles.fade}`} data-state={present ? 'open' : 'closed'}>
            The child reads present itself while it animates out.
          </div>
        )}
      </Presence>
    </div>
  )
}
```

***

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `present` | `boolean` | - | Whether the child should be mounted |
| `children` | `ReactElement \| ((props: { present: boolean }) => ReactElement)` | - | Child element or render function |

## Exit animations

Presence reads the child's computed `animation-name` as it closes. When it differs from the one the child opened with, Presence waits on the `finished` promise of every CSS animation `element.getAnimations()` lists on the child itself:

* Several exit animations hold the content until the last of them ends.
* An animation that is cancelled, whether by a style change or by the content being hidden or removed, counts as ended, even when it is cancelled in the frame it starts and the browser sends no `animationcancel`.
* A paused animation holds the content until it plays again and ends. One that repeats forever holds it for good.
* A name with no `@keyframes`, content hidden with `display: none`, and the animation it opened with still set on close all leave nothing to wait for, so the content unmounts at once.
* CSS transitions, animations made with `element.animate()` and animations on the child's descendants are not waited for.

Where the browser has no `element.getAnimations()`, as in jsdom, the content unmounts at once. A test that plays an exit stubs `getAnimations` with an animation whose `finished` promise it settles.

## The child's ref

Presence puts its own ref on the child beside the child's, through one ref that keeps its identity for as long as the node lives. React calls the child's ref once when the node mounts and once when it goes, however often the child renders with a new ref, so an inline callback ref that sets state on attach does not loop. A ref the child takes on after mounting is the one told when the node goes, and a cleanup a callback ref returns runs then.

## Render function form

For more control, use a render function:

```tsx
<Presence present={isOpen}>
  {({ present }) => (
    <div className={present ? 'fade-in' : 'fade-out'}>
      Content
    </div>
  )}
</Presence>
```

## State machine

}>
  Presence uses three states: `mounted` (in the page), `exiting` (playing its exit animation) and `unmounted` (removed). Content mounts in the same render that sets `present`, and Presence reads the child's styles only when it closes, to tell an exit animation from the one that ran while it was open.