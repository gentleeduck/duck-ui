```tsx
import { Portal } from '@gentleduck/primitives/portal'
```

## Usage

```tsx
<Portal>
  <div className="modal">I'm rendered in document.body</div>
</Portal>

// Custom container
<Portal container={document.getElementById('my-container')}>
  <div>I'm rendered in #my-container</div>
</Portal>

// A ref, even to an element that renders after the portal
const ref = React.useRef<HTMLDivElement>(null)

<Portal container={ref}>
  <div>I'm rendered in the div below</div>
</Portal>
<div ref={ref} />
```

## Examples

### Into the body

```tsx title="components/portal-body.tsx"
// import from your project: import Demo from '@/components/portal-body'
'use client'

import { Portal } from '@gentleduck/primitives/portal'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function PortalBodyExample() {
  const [shown, setShown] = React.useState(false)

  return (
    <div className={styles.box} style={{ overflow: 'hidden', position: 'relative' }}>
      <button className={styles.button} onClick={() => setShown((value) => !value)} type="button">
        {shown ? 'Remove the toast' : 'Show a toast'}
      </button>
      {shown ? (
        <Portal>
          <div
            className={`${styles.content} ${styles.panel}`}
            style={{ bottom: '1rem', insetInlineEnd: '1rem', position: 'fixed' }}>
            Rendered into the body, so this box's overflow does not clip it.
          </div>
        </Portal>
      ) : null}
    </div>
  )
}
```

### Into another element

```tsx title="components/portal-container.tsx"
// import from your project: import Demo from '@/components/portal-container'
'use client'

import { Portal } from '@gentleduck/primitives/portal'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function PortalContainerExample() {
  const target = React.useRef<HTMLDivElement>(null)

  return (
    <div className={styles.row}>
      <div className={styles.box}>
        Source
        <Portal asChild container={target}>
          <span className={styles.note}>Rendered over there</span>
        </Portal>
      </div>
      <div className={styles.box} ref={target}>
        Target:{' '}
      </div>
    </div>
  )
}
```

***

## Props

`Portal` is also exported as `Root`, the name Radix gives it.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `container` | `Element \| DocumentFragment \| RefObject \| null` | `document.body` | Target container. A ref is read when the portal renders, and nothing renders while it holds no element. A form is taken as the element itself, even one holding a control named `current` |
| `asChild` | `boolean` | `false` | Portal the child itself instead of a `<div>`. Only the `<div>` carries `data-slot="portal"`, so the child keeps its own |

}>
  Without a `container`, Portal renders nothing until its first layout effect, so the server render and the first client render match.