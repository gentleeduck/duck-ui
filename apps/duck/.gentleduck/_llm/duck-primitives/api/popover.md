```tsx
import * as Popover from '@gentleduck/primitives/popover'
```

## Anatomy

```tsx
<Popover.Root>
  <Popover.Trigger />
  <Popover.Anchor />      {/* Optional custom anchor point */}
  <Popover.Portal>
    <Popover.Content>
      <Popover.Title />        {/* Optional */}
      <Popover.Description />  {/* Optional */}
      <Popover.Arrow />        {/* Optional */}
      <Popover.Close />        {/* Optional */}
    </Popover.Content>
  </Popover.Portal>
</Popover.Root>
```

***

## Usage

```tsx
import * as Popover from '@gentleduck/primitives/popover'

function UserMenu() {
  return (
    <Popover.Root>
      <Popover.Trigger className="px-3 py-1 border rounded">
        Settings
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="bg-white shadow-lg rounded-lg p-4 w-64 border"
          sideOffset={5}
        >
          <Popover.Title className="font-medium mb-2">User settings</Popover.Title>
          <input placeholder="Display name" className="w-full border rounded px-2 py-1 mb-2" />
          <Popover.Close className="text-sm text-blue-600">Done</Popover.Close>
          <Popover.Arrow className="fill-white" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
```

***

## Examples

### Basic

```tsx title="components/popover-basic.tsx"
// import from your project: import Demo from '@/components/popover-basic'
'use client'

import * as Popover from '@gentleduck/primitives/popover'
import styles from '../primitives.module.css'

export default function PopoverBasicExample() {
  return (
    <Popover.Root>
      <Popover.Trigger className={styles.button}>Dimensions</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className={`${styles.content} ${styles.panel} ${styles.stack}`} sideOffset={8}>
          <Popover.Title className={styles.title}>Dimensions</Popover.Title>
          <Popover.Description className={styles.description}>Set the layer's size.</Popover.Description>
          <label className={styles.row}>
            <span className={styles.label}>Width</span>
            <input className={styles.input} defaultValue="100%" />
          </label>
          <Popover.Close className={styles.button}>Done</Popover.Close>
          <Popover.Arrow className={styles.arrow} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
```

### Side and collisions

```tsx title="components/popover-side-aware.tsx"
// import from your project: import Demo from '@/components/popover-side-aware'
'use client'

import * as Popover from '@gentleduck/primitives/popover'
import styles from './styles.module.css'

export default function PopoverSideAwareInternalExample() {
  return (
    <Popover.Root>
      <Popover.Trigger className={styles.trigger}>Open filters</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content align="start" className={styles.content} collisionPadding={10} side="bottom" sideOffset={10}>
          <h4 className={styles.title}>Quick filters</h4>
          <p className={styles.description}>Uses side, align, offset, and collision padding.</p>
          <div className={styles.chips}>
            <span>Recent</span>
            <span>Assigned</span>
            <span>Open</span>
          </div>
          <Popover.Arrow className={styles.arrow} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
```

### Modal

```tsx title="components/popover-modal.tsx"
// import from your project: import Demo from '@/components/popover-modal'
'use client'

import * as Popover from '@gentleduck/primitives/popover'
import styles from '../primitives.module.css'

export default function PopoverModalExample() {
  return (
    <Popover.Root modal>
      <Popover.Trigger className={styles.button}>Share</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className={`${styles.content} ${styles.panel} ${styles.stack}`} sideOffset={8}>
          <Popover.Title className={styles.title}>Share link</Popover.Title>
          <input className={styles.input} readOnly value="https://gentleduck.org/s/x7f" />
          <Popover.Close className={styles.button}>Close</Popover.Close>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
```

### A separate anchor

```tsx title="components/popover-anchor.tsx"
// import from your project: import Demo from '@/components/popover-anchor'
'use client'

import * as Popover from '@gentleduck/primitives/popover'
import styles from '../primitives.module.css'

export default function PopoverAnchorExample() {
  return (
    <Popover.Root>
      <Popover.Anchor className={`${styles.box} ${styles.row}`}>
        <input className={styles.input} placeholder="Search..." />
        <Popover.Trigger className={styles.button}>Filters</Popover.Trigger>
      </Popover.Anchor>
      <Popover.Portal>
        <Popover.Content align="start" className={`${styles.content} ${styles.panel}`} sideOffset={6}>
          Placed against the whole bar, not the Filters button.
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
```

### Where focus starts

```tsx title="components/popover-focus.tsx"
// import from your project: import Demo from '@/components/popover-focus'
'use client'

import * as Popover from '@gentleduck/primitives/popover'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function PopoverFocusExample() {
  const comment = React.useRef<HTMLTextAreaElement>(null)

  return (
    <Popover.Root>
      <Popover.Trigger className={styles.button}>Comment</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className={`${styles.content} ${styles.panel} ${styles.stack}`}
          initialFocus={comment}
          sideOffset={8}>
          <button className={styles.button} type="button">
            Attach
          </button>
          <textarea className={styles.input} placeholder="Focus starts here" ref={comment} rows={3} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
```

### Controlled

```tsx title="components/popover-controlled.tsx"
// import from your project: import Demo from '@/components/popover-controlled'
'use client'

import * as Popover from '@gentleduck/primitives/popover'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function PopoverControlledExample() {
  const [open, setOpen] = React.useState(false)
  const [color, setColor] = React.useState('blue')

  return (
    <Popover.Root onOpenChange={setOpen} open={open}>
      <Popover.Trigger className={styles.button}>Color: {color}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className={`${styles.content} ${styles.panel} ${styles.row}`} sideOffset={8}>
          {['blue', 'green', 'orange'].map((value) => (
            <button
              className={styles.button}
              key={value}
              onClick={() => {
                setColor(value)
                setOpen(false)
              }}
              type="button">
              {value}
            </button>
          ))}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
```

### Right to left

```tsx title="components/popover-rtl.tsx"
// import from your project: import Demo from '@/components/popover-rtl'
'use client'

import * as Popover from '@gentleduck/primitives/popover'
import styles from '../primitives.module.css'

export default function PopoverRtlExample() {
  return (
    <Popover.Root dir="rtl">
      <Popover.Trigger className={styles.button}>تفاصيل</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className={`${styles.content} ${styles.panel}`} side="right" sideOffset={8}>
          side right opens to the left here, the way right to left text reads.
          <Popover.Arrow className={styles.arrow} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
```

***

## API

### `Popover.Root`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `open` | `boolean` | - | Controlled open state |
| `defaultOpen` | `boolean` | `false` | Initial open state |
| `onOpenChange` | `(open: boolean) => void` | - | Called on state change |
| `modal` | `boolean` | `false` | Enable modal behavior (focus trap, scroll lock) |
| `dir` | `'ltr' \| 'rtl'` | - | Direction of the content, which also decides where `side="left"` and `side="right"` open. Falls back to the nearest `DirectionProvider`, then `<html dir>` |

### `Popover.Trigger`

Toggles the popover. Sets `aria-expanded`, and `aria-controls` while the popover is open, since a closed popover renders no content to point at. It carries no `dir`, so it keeps the page's direction.

### `Popover.Anchor`

}>
  Optional custom anchor point. By default, content is positioned relative to the Trigger. Use Anchor to position relative to a different element.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `virtualRef` | `React.RefObject<IPopper.IMeasurable \| null>` | - | Position against anything with `getBoundingClientRect()`, such as a text selection, instead of a DOM node. The anchor then renders nothing |

### `Popover.Portal`

Portals content to `document.body`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `container` | `Element \| DocumentFragment \| RefObject \| null` | `document.body` | Element to portal into |
| `forceMount` | `true` | - | Keep mounted while closed, for a JavaScript animation library to drive |

### `Popover.Content`

The floating content, with `role="dialog"`. Positioned by the Popper engine relative to the trigger. While a `Popover.Title` or `Popover.Description` is mounted inside it, its `aria-labelledby` or `aria-describedby` points at that part's id; one passed to the content wins.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `side` | `'top' \| 'right' \| 'bottom' \| 'left'` | `'bottom'` | Preferred side |
| `sideOffset` | `number` | `0` | Distance from anchor in pixels |
| `align` | `'start' \| 'center' \| 'end'` | `'center'` | Alignment along the side |
| `alignOffset` | `number` | `0` | Alignment offset in pixels |
| `forceMount` | `true` | - | Keep mounted always |
| `onOpenAutoFocus` | `(event) => void` | - | Intercept auto-focus |
| `onCloseAutoFocus` | `(event) => void` | - | Intercept focus restoration |
| `initialFocus` | `RefObject<HTMLElement \| null> \| false` | - | Focused on open in place of the first tabbable element. `false` leaves focus on the trigger |
| `finalFocus` | `RefObject<HTMLElement \| null> \| false` | - | Focused on close in place of the trigger. `false` moves focus nowhere |
| `onPointerDownOutside` | `(event) => void` | - | Called for a press outside, once its click lands. Prevent default to block close. |
| `onFocusOutside` | `(event) => void` | - | Called when focus moves outside |
| `onInteractOutside` | `(event) => void` | - | Called for any outside interaction |
| `onEscapeKeyDown` | `(event) => void` | - | Called on <Kbd>Escape</Kbd> press |
| `trapFocus` | `boolean` | `open` | Modal only. Override whether focus is trapped inside the content |
| `disableOutsidePointerEvents` | `boolean` | `open` | Modal only. Override whether pointer events outside are blocked |
| `lockScroll` | `boolean` | `open` | Modal only. Override whether body scroll is locked |

It also takes the rest of [Popper](/duck-primitives/api/popper)'s positioning props, with the same defaults: `arrowPadding`, `avoidCollisions`, `collisionBoundary`, `collisionPadding`, `sticky`, `shiftCrossAxis`, `hideWhenDetached`, `updatePositionStrategy` and `updateOnScroll`.

On a modal popover, `trapFocus`, `disableOutsidePointerEvents` and `lockScroll` follow the open state. Override them when integrating with animation libraries like [motion](https://motion.dev) that need custom lifecycle control during exit animations. A non-modal popover never traps focus, blocks outside pointer events or locks scroll, and ignores all three.

An `onOpenAutoFocus` or `onCloseAutoFocus` handler that prevents the default wins over `initialFocus` and `finalFocus`.

A primary press outside dismisses the popover once its click lands, so code that stops the pointerup, mouse, touch or click events after it cancels the dismissal. A right or control press dismisses at once, and a modal popover then leaves focus where it is rather than move it to the trigger, which would close the menu the press opened. A right press that `onPointerDownOutside` or `onInteractOutside` kept from closing it changes nothing about the next close.

A modal popover hides the rest of the page from screen readers while it is open. Kept mounted with `forceMount`, it gives the page back once it closes.

A non-modal popover closes when focus moves outside it. Each opening starts afresh, so a kept-mounted popover that a press outside closed still closes this way after it reopens.

Inside a modal `Dialog` but portalled out of it, the content registers with the dialog, so focus can move into it and it scrolls under the dialog's scroll lock. A modal popover does the same for a layer portalled out of it, such as a select's content.

### `Popover.Title`

An `h2` that names the content. While it is mounted, the content's `aria-labelledby` points at its id, which it generates unless you pass `id`. Use `asChild` for another heading level.

### `Popover.Description`

A `p` that describes the content. While it is mounted, the content's `aria-describedby` points at its id, which it generates unless you pass `id`.

### `Popover.Arrow`

Optional visual arrow pointing toward the anchor.

### `Popover.Close`

Button that closes the popover.

***

## Keyboard interactions

| Key | Action |
| --- | --- |
| <Kbd>Space</Kbd> / <Kbd>Enter</Kbd> | Toggle popover (on Trigger) |
| <Kbd>Escape</Kbd> | Close popover, unless an input method is composing text |
| <Kbd>Tab</Kbd> | Move focus within content, then out (non-modal) or wrap (modal) |