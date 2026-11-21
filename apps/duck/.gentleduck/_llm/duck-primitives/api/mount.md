```tsx
import { Mount, MountMinimal } from '@gentleduck/primitives/mount'
```

## Examples

### A fixed exit time

```tsx title="components/mount-timed.tsx"
// import from your project: import Demo from '@/components/mount-timed'
'use client'

import { Mount } from '@gentleduck/primitives/mount'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function MountTimedExample() {
  const [open, setOpen] = React.useState(true)

  return (
    <div className={styles.stack}>
      <button className={styles.button} onClick={() => setOpen((value) => !value)} type="button">
        {open ? 'Hide' : 'Show'}
      </button>
      <Mount animationDuration={300} open={open}>
        <div className={`${styles.content} ${styles.panel} ${styles.fade}`} data-state={open ? 'open' : 'closed'}>
          Unmounted 300ms after it closes, long enough for its fade.
        </div>
      </Mount>
    </div>
  )
}
```

### Waiting for a transition

```tsx title="components/mount-minimal.tsx"
// import from your project: import Demo from '@/components/mount-minimal'
'use client'

import { MountMinimal } from '@gentleduck/primitives/mount'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function MountMinimalExample() {
  const [open, setOpen] = React.useState(false)
  const panel = React.useRef<HTMLDivElement>(null)

  return (
    <div className={styles.stack}>
      <button className={styles.button} onClick={() => setOpen((value) => !value)} type="button">
        {open ? 'Collapse' : 'Expand'}
      </button>
      <div className={`${styles.box} ${styles.collapse}`} data-state={open ? 'open' : 'closed'} ref={panel}>
        <div>
          <MountMinimal open={open} ref={panel}>
            <p className={styles.note}>Unmounted once the parent's grid transition ends, however long that is.</p>
          </MountMinimal>
        </div>
      </div>
    </div>
  )
}
```

### Mounted once

```tsx title="components/mount-render-once.tsx"
// import from your project: import Demo from '@/components/mount-render-once'
'use client'

import { MountMinimal } from '@gentleduck/primitives/mount'
import * as React from 'react'
import styles from '../primitives.module.css'

function Expensive() {
  const [mountedAt] = React.useState(() => new Date().toLocaleTimeString())
  return <p className={styles.note}>Mounted at {mountedAt}. It keeps its state while hidden.</p>
}

export default function MountRenderOnceExample() {
  const [open, setOpen] = React.useState(false)

  return (
    <div className={styles.stack}>
      <button className={styles.button} onClick={() => setOpen((value) => !value)} type="button">
        {open ? 'Hide' : 'Show'}
      </button>
      <div hidden={!open}>
        <MountMinimal open={open} renderOnce>
          <Expensive />
        </MountMinimal>
      </div>
    </div>
  )
}
```

***

## `Mount`

Mounts its children in the commit that sets `open`, and unmounts them `animationDuration` after `open` goes false. Opening again before then keeps them.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `open` | `boolean` | - | Whether to show children |
| `animationDuration` | `number` | `400` | Delay before unmounting (ms) |

```tsx
<Mount open={isOpen} animationDuration={300}>
  <div className="fade-out-on-close">Content</div>
</Mount>
```

## `MountMinimal`

Waits until an element's last CSS transition ends before it unmounts its children, rather than a fixed time: each transition's `transition-duration` plus its `transition-delay`, the longest of several. Under `transition-property: none`, as `motion-reduce:transition-none` leaves it, or when the browser starts no transition, as for a height going to `auto` without `interpolate-size`, they unmount at once. The element comes from `ref`, which `MountMinimal` reads and never writes: it does not render a node of its own.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `open` | `boolean` | `false` | Whether to show children |
| `forceMount` | `boolean` | `false` | Keep the children mounted while closed |
| `skipWaiting` | `boolean` | `false` | Unmount immediately without waiting for transitions |
| `renderOnce` | `boolean` | `false` | Keep the children mounted once they have opened |
| `ref` | `React.RefObject<HTMLElement \| null>` | - | A ref object for the element whose transitions the children wait out. Without one, or with a callback ref it cannot read, they unmount as soon as it closes |

```tsx
function Panel({ open }: { open: boolean }) {
  const ref = React.useRef<HTMLDivElement>(null)

  return (
    <div ref={ref} className="transition-[height] duration-200">
      <MountMinimal open={open} ref={ref}>
        <Content />
      </MountMinimal>
    </div>
  )
}
```

}>
  `Presence` waits for a CSS animation on the one child it wraps. Reach for `MountMinimal` when what moves is a transition on another element, such as a parent, and for `Mount` when no style says how long the exit takes.