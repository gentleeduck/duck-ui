```tsx
import * as HoverCard from '@gentleduck/primitives/hover-card'
```

## Anatomy

```tsx
<HoverCard.Root>
  <HoverCard.Trigger />
  <HoverCard.Portal>
    <HoverCard.Content>
      <HoverCard.Arrow />
    </HoverCard.Content>
  </HoverCard.Portal>
</HoverCard.Root>
```

## Usage

```tsx
<HoverCard.Root openDelay={200} closeDelay={300}>
  <HoverCard.Trigger asChild>
    <a href="/user/ahmed" className="text-blue-600 underline">@ahmed</a>
  </HoverCard.Trigger>
  <HoverCard.Portal>
    <HoverCard.Content className="bg-white shadow-lg rounded-lg p-4 w-72 border" sideOffset={5}>
      <div className="flex gap-3">
        <div className="w-12 h-12 bg-gray-200 rounded-full" />
        <div>
          <p className="font-semibold">Ahmed</p>
          <p className="text-sm text-gray-500">Software Engineer</p>
        </div>
      </div>
      <HoverCard.Arrow className="fill-white" />
    </HoverCard.Content>
  </HoverCard.Portal>
</HoverCard.Root>
```

## Opening and closing

The card opens `openDelay` after a mouse or pen moves onto the trigger, or after the trigger takes keyboard focus. It closes `closeDelay` after the pointer leaves the trigger and the card, or after the trigger loses focus. A pointer that leaves before the open delay ends opens nothing, and one that comes back before the close delay ends keeps the card open.

A touch never opens the card: neither the press nor the focus a tap gives the link, so a tap follows the link and a page still scrolls from the trigger. The next keyboard focus opens it as usual.

The card stays open while a pointer that pressed on it is down, and after text inside it is selected. While the press lasts, only the card's text can be selected. A press the browser cancels, as when a touch turns into a scroll, ends like a release.

`disabled` keeps the card closed. Setting it while the card is open closes it, and an open still waiting on `openDelay` never happens.

## Focus

The card opens without taking focus, and nothing inside it is in the tab order, since what it shows previews the link the keyboard is already on. That includes what renders into the card after it opens, such as a profile that loads, and an element given a tab index later.

## In an iframe

Give `HoverCard.Portal` a `container` inside an iframe and the card follows presses and selection in the iframe's document.

## Examples

### Profile card

```tsx title="components/hover-card-basic.tsx"
// import from your project: import Demo from '@/components/hover-card-basic'
'use client'

import * as Avatar from '@gentleduck/primitives/avatar'
import * as HoverCard from '@gentleduck/primitives/hover-card'
import styles from '../primitives.module.css'

export default function HoverCardBasicExample() {
  return (
    <HoverCard.Root>
      <HoverCard.Trigger
        className={styles.button}
        href="https://github.com/gentleeduck"
        rel="noreferrer"
        target="_blank">
        @gentleduck
      </HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content className={`${styles.content} ${styles.panel}`} sideOffset={8}>
          <div className={styles.row}>
            <Avatar.Root className={styles.avatar}>
              <Avatar.Image
                alt=""
                className={styles.avatarImage}
                src="https://avatars.githubusercontent.com/u/108896341?v=4"
              />
              <Avatar.Fallback>GD</Avatar.Fallback>
            </Avatar.Root>
            <div className={styles.stack} style={{ gap: '0.15rem' }}>
              <strong>gentleduck</strong>
              <span className={styles.note}>Accessible primitives for React.</span>
            </div>
          </div>
          <HoverCard.Arrow className={styles.arrow} />
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  )
}
```

### Delays

```tsx title="components/hover-card-delays.tsx"
// import from your project: import Demo from '@/components/hover-card-delays'
'use client'

import * as HoverCard from '@gentleduck/primitives/hover-card'
import styles from '../primitives.module.css'

function Card({ label, openDelay, closeDelay }: { label: string; openDelay: number; closeDelay: number }) {
  return (
    <HoverCard.Root closeDelay={closeDelay} openDelay={openDelay}>
      <HoverCard.Trigger className={styles.button} href="#">
        {label}
      </HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content className={`${styles.content} ${styles.panel}`} sideOffset={8}>
          Opens after {openDelay}ms, closes {closeDelay}ms after the pointer leaves.
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  )
}

export default function HoverCardDelaysExample() {
  return (
    <div className={styles.row}>
      <Card closeDelay={100} label="Quick" openDelay={150} />
      <Card closeDelay={300} label="Default" openDelay={700} />
      <Card closeDelay={1000} label="Lingering" openDelay={400} />
    </div>
  )
}
```

### Controlled and disabled

```tsx title="components/hover-card-controlled.tsx"
// import from your project: import Demo from '@/components/hover-card-controlled'
'use client'

import * as HoverCard from '@gentleduck/primitives/hover-card'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function HoverCardControlledExample() {
  const [open, setOpen] = React.useState(false)
  const [disabled, setDisabled] = React.useState(false)

  return (
    <div className={styles.stack}>
      <div className={styles.row}>
        <HoverCard.Root disabled={disabled} onOpenChange={setOpen} open={open}>
          <HoverCard.Trigger className={styles.button} href="#">
            Hover or focus me
          </HoverCard.Trigger>
          <HoverCard.Portal>
            <HoverCard.Content className={`${styles.content} ${styles.panel}`} side="right" sideOffset={8}>
              The page holds this card's state.
            </HoverCard.Content>
          </HoverCard.Portal>
        </HoverCard.Root>
        <button className={styles.button} onClick={() => setDisabled((value) => !value)} type="button">
          {disabled ? 'Enable' : 'Disable'}
        </button>
      </div>
      <p className={styles.note}>{open ? 'Open' : 'Closed'}. Disabled, it stays closed, and closes if it was open.</p>
    </div>
  )
}
```

***

## API

### `HoverCard.Root`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `open` | `boolean` | - | Controlled state |
| `defaultOpen` | `boolean` | `false` | Initial state |
| `onOpenChange` | `(open: boolean) => void` | - | State change callback |
| `openDelay` | `number` | `700` | Delay before opening (ms) |
| `closeDelay` | `number` | `300` | Delay before closing (ms) |
| `disabled` | `boolean` | `false` | Keeps the card closed, and closes it if it is open |
| `dir` | `'ltr' \| 'rtl'` | - | Direction of the content. Falls back to `DirectionProvider`, then `<html dir>`. The trigger keeps the page's |

### `HoverCard.Trigger`

The element that activates the card on hover. Renders an `<a>` by default.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `asChild` | `boolean` | - | Render as child element |

### `HoverCard.Portal`

Portals content to `document.body`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `container` | `Element \| DocumentFragment \| RefObject \| null` | `document.body` | Portal target |
| `forceMount` | `true` | - | Force mount content |

### `HoverCard.Content`

Positioned floating content. Positioned by the Popper engine.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `side` | `'top' \| 'right' \| 'bottom' \| 'left'` | `'bottom'` | Preferred side |
| `sideOffset` | `number` | `0` | Distance from anchor in pixels |
| `align` | `'start' \| 'center' \| 'end'` | `'center'` | Alignment along the side |
| `alignOffset` | `number` | `0` | Alignment offset in pixels |
| `forceMount` | `true` | - | Keep mounted always |
| `onEscapeKeyDown` | `(event) => void` | - | Called on <Kbd>Escape</Kbd> press |
| `onPointerDownOutside` | `(event) => void` | - | Called on outside click |
| `onFocusOutside` | `(event) => void` | - | Called when focus moves outside |
| `onInteractOutside` | `(event) => void` | - | Called for any outside interaction |

}>
  Unlike Tooltip, HoverCard content is **interactive**. Users can move their pointer into the content and click links, buttons, etc.

### `HoverCard.Arrow`

Optional visual arrow pointing toward the trigger.