```tsx
import * as Tooltip from '@gentleduck/primitives/tooltip'
```

## Anatomy

```tsx
<Tooltip.Provider>
  <Tooltip.Root>
    <Tooltip.Trigger />
    <Tooltip.Portal>
      <Tooltip.Content>
        <Tooltip.Arrow />
      </Tooltip.Content>
    </Tooltip.Portal>
  </Tooltip.Root>
</Tooltip.Provider>
```

***

## Usage

```tsx
import * as Tooltip from '@gentleduck/primitives/tooltip'

function App() {
  return (
    <Tooltip.Provider delayDuration={400}>
      <Tooltip.Root>
        <Tooltip.Trigger className="px-3 py-1 border rounded">
          Hover me
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="bg-gray-900 text-white text-sm px-3 py-1.5 rounded shadow"
            sideOffset={5}
          >
            This is a tooltip
            <Tooltip.Arrow className="fill-gray-900" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}
```

***

## Examples

### Basic

```tsx title="components/tooltip-basic.tsx"
// import from your project: import Demo from '@/components/tooltip-basic'
'use client'

import * as Tooltip from '@gentleduck/primitives/tooltip'
import styles from '../primitives.module.css'

export default function TooltipBasicExample() {
  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger className={styles.button}>Hover or focus</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content className={`${styles.content} ${styles.panel}`} sideOffset={6} style={{ minWidth: 0 }}>
            Add to library
            <Tooltip.Arrow className={styles.arrow} />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}
```

### Delays across tooltips

```tsx title="components/tooltip-delay-provider.tsx"
// import from your project: import Demo from '@/components/tooltip-delay-provider'
'use client'

import * as Tooltip from '@gentleduck/primitives/tooltip'
import styles from './styles.module.css'

export default function TooltipDelayProviderInternalExample() {
  return (
    <Tooltip.TooltipProvider delayDuration={500} skipDelayDuration={280}>
      <Tooltip.Tooltip>
        <Tooltip.TooltipTrigger className={styles.trigger}>Hover trigger</Tooltip.TooltipTrigger>
        <Tooltip.TooltipPortal>
          <Tooltip.TooltipContent className={styles.content} side="top" sideOffset={8}>
            Delayed tooltip with shared provider timings.
          </Tooltip.TooltipContent>
        </Tooltip.TooltipPortal>
      </Tooltip.Tooltip>
    </Tooltip.TooltipProvider>
  )
}
```

### Sides

```tsx title="components/tooltip-sides.tsx"
// import from your project: import Demo from '@/components/tooltip-sides'
'use client'

import * as Tooltip from '@gentleduck/primitives/tooltip'
import styles from '../primitives.module.css'

export default function TooltipSidesExample() {
  return (
    <Tooltip.Provider delayDuration={100}>
      <div className={styles.row}>
        {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
          <Tooltip.Root key={side}>
            <Tooltip.Trigger className={styles.button}>{side}</Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                className={`${styles.content} ${styles.panel}`}
                side={side}
                sideOffset={6}
                style={{ minWidth: 0 }}>
                On the {side}
                <Tooltip.Arrow className={styles.arrow} />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        ))}
      </div>
    </Tooltip.Provider>
  )
}
```

### Controlled and disabled

```tsx title="components/tooltip-controlled.tsx"
// import from your project: import Demo from '@/components/tooltip-controlled'
'use client'

import * as Tooltip from '@gentleduck/primitives/tooltip'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function TooltipControlledExample() {
  const [open, setOpen] = React.useState(false)
  const [disabled, setDisabled] = React.useState(false)

  return (
    <Tooltip.Provider>
      <div className={styles.stack}>
        <div className={styles.row}>
          <Tooltip.Root disabled={disabled} onOpenChange={setOpen} open={open}>
            <Tooltip.Trigger className={styles.button}>Save</Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content className={`${styles.content} ${styles.panel}`} sideOffset={6} style={{ minWidth: 0 }}>
                Ctrl S
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
          <button className={styles.button} onClick={() => setOpen((value) => !value)} type="button">
            {open ? 'Hide the tip' : 'Show the tip'}
          </button>
          <button className={styles.button} onClick={() => setDisabled((value) => !value)} type="button">
            {disabled ? 'Enable' : 'Disable'}
          </button>
        </div>
      </div>
    </Tooltip.Provider>
  )
}
```

### Hoverable content

```tsx title="components/tooltip-hoverable.tsx"
// import from your project: import Demo from '@/components/tooltip-hoverable'
'use client'

import * as Tooltip from '@gentleduck/primitives/tooltip'
import styles from '../primitives.module.css'

function Tip({ label, disableHoverableContent }: { label: string; disableHoverableContent?: boolean }) {
  return (
    <Tooltip.Root disableHoverableContent={disableHoverableContent}>
      <Tooltip.Trigger className={styles.button}>{label}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content className={`${styles.content} ${styles.panel}`} sideOffset={6} style={{ minWidth: 0 }}>
          {disableHoverableContent ? 'Closes as the pointer leaves the trigger.' : 'Move onto me and I stay.'}
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}

export default function TooltipHoverableExample() {
  return (
    <Tooltip.Provider closeDelay={150} delayDuration={200}>
      <div className={styles.row}>
        <Tip label="Hoverable" />
        <Tip disableHoverableContent label="Not hoverable" />
      </div>
    </Tooltip.Provider>
  )
}
```

### Clicks keep it open

```tsx title="components/tooltip-click-stays.tsx"
// import from your project: import Demo from '@/components/tooltip-click-stays'
'use client'

import * as Tooltip from '@gentleduck/primitives/tooltip'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function TooltipClickStaysExample() {
  const [count, setCount] = React.useState(0)

  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger className={styles.button} disableCloseOnClick onClick={() => setCount((value) => value + 1)}>
          Like ({count})
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content className={`${styles.content} ${styles.panel}`} sideOffset={6} style={{ minWidth: 0 }}>
            disableCloseOnClick keeps this open while you click.
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}
```

### Announced as other text

```tsx title="components/tooltip-aria-label.tsx"
// import from your project: import Demo from '@/components/tooltip-aria-label'
'use client'

import * as Tooltip from '@gentleduck/primitives/tooltip'
import styles from '../primitives.module.css'

export default function TooltipAriaLabelExample() {
  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger aria-label="Shortcuts" className={styles.button}>
          ?
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            aria-label="Keyboard shortcuts: Control K opens search"
            className={`${styles.content} ${styles.panel}`}
            sideOffset={6}
            style={{ minWidth: 0 }}>
            <kbd>Ctrl</kbd> + <kbd>K</kbd>
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}
```

***

## API

### `Tooltip.Provider`

Wraps your app (or section) to coordinate tooltip delays. When a user moves from one tooltip trigger to another quickly, the second tooltip opens instantly (skip delay).

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `delayDuration` | `number` | `700` | Delay in ms before tooltip opens |
| `closeDelay` | `number` | `0` | Delay in ms before tooltip closes once the pointer leaves it |
| `skipDelayDuration` | `number` | `300` | Time in ms before delay resets after closing. `0` keeps the delay on every tooltip |
| `disableHoverableContent` | `boolean` | `false` | Close immediately when pointer leaves trigger (can't hover content) |

### `Tooltip.Root`

Manages state for a single tooltip instance.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `open` | `boolean` | - | Controlled open state |
| `defaultOpen` | `boolean` | `false` | Initial open state |
| `onOpenChange` | `(open: boolean) => void` | - | Called on state change |
| `delayDuration` | `number` | - | Override Provider's delay for this tooltip |
| `closeDelay` | `number` | - | Override Provider's close delay for this tooltip |
| `disableHoverableContent` | `boolean` | - | Override Provider's setting |
| `disabled` | `boolean` | `false` | Keeps the tooltip closed, even while a parent holds `open`, closes it if it is open, and drops an open still waiting on its delay |
| `dir` | `'ltr' \| 'rtl'` | - | Direction of the content. Without it the content takes the nearest `DirectionProvider`, then `<html dir>`. The trigger keeps the page's |

### `Tooltip.Trigger`

The element that activates the tooltip on hover/focus. While the tooltip is open, the trigger's `aria-describedby` adds the content's id after any ids it was given.

Focus opens the tooltip only when the last input was not a pointer press and the trigger matches `:focus-visible`. So a trigger that is also a menu or dialog trigger shows no tooltip when an item chosen with the pointer, or a dialog closed with the pointer, gives focus back to it. <Kbd>Tab</Kbd>, <Kbd>Escape</Kbd> handing focus back, and a focus no input led to, such as a screen reader moving it, open it.

A press on the trigger during the open delay drops the open, so the tooltip does not appear after the click. With a trigger nested inside another trigger, the pointer over the inner one opens only its own tooltip.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `disableCloseOnClick` | `boolean` | `false` | When `true`, clicking the trigger does not dismiss the tooltip. Use when wrapping interactive elements like `Toggle` with `asChild`. |

When `disableCloseOnClick` is enabled:

* The tooltip's `data-slot` and `data-state` are not set on the trigger, so the child element's own attributes pass through unchanged
* The tooltip's `onClick` handler is not attached, so the child's `onClick` works without interference
* `onPointerDown` skips tooltip close
* A `data-tooltip-state` attribute is set instead for tooltip-specific styling if needed
* Hover and blur behavior remain unchanged

```tsx
import * as Tooltip from '@gentleduck/primitives/tooltip'
import { Toggle } from '@gentleduck/primitives/toggle'

<Tooltip.Root>
  <Tooltip.Trigger asChild disableCloseOnClick>
    <Toggle>Bold</Toggle>
  </Tooltip.Trigger>
  <Tooltip.Portal>
    <Tooltip.Content>Toggle bold formatting</Tooltip.Content>
  </Tooltip.Portal>
</Tooltip.Root>
```

### `Tooltip.Portal`

Portals content to `document.body`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `container` | `Element \| DocumentFragment \| RefObject \| null` | `document.body` | Portal target |
| `forceMount` | `true` | - | Keep the content mounted while closed |

### `Tooltip.Content`

The floating tooltip content. Positioned by the Popper engine.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `aria-label` | `string` | - | Announced in place of the visible content, from a visually hidden `role="tooltip"` element |
| `id` | `string` | - | The id the trigger's `aria-describedby` points at. Generated when not given |
| `side` | `'top' \| 'right' \| 'bottom' \| 'left'` | `'top'` | Preferred side |
| `sideOffset` | `number` | `0` | Distance from anchor in pixels |
| `align` | `'start' \| 'center' \| 'end'` | `'center'` | Alignment along the side |
| `alignOffset` | `number` | `0` | Alignment offset in pixels |
| `forceMount` | `true` | - | Keep mounted always |
| `onEscapeKeyDown` | `(event) => void` | - | Called on <Kbd>Escape</Kbd> press |
| `onPointerDownOutside` | `(event) => void` | - | Called on outside click |

It also takes the rest of [Popper](/duck-primitives/api/popper)'s positioning props, with the same defaults: `arrowPadding`, `avoidCollisions`, `collisionBoundary`, `collisionPadding`, `sticky`, `shiftCrossAxis`, `hideWhenDetached` and `updatePositionStrategy`. `updateOnScroll` is always off, since a scroll closes the tooltip.

### `Tooltip.Arrow`

Optional visual arrow pointing toward the trigger.

***

## Data attributes

}>
  Content exposes `data-state` with values: `closed`, `delayed-open`, `instant-open`. Use this for different enter animations based on whether the tooltip was delayed or instant.

***

## Accessibility

The content is the `role="tooltip"` element and renders its children once. With an `aria-label`, the label moves to a visually hidden element that takes the role and the id instead. Inside a modal `Dialog` but portalled out of it, the content registers with the dialog, so focus can move into it and it scrolls under the dialog's scroll lock.

***

## Grace area

When the user moves their pointer from the trigger toward the content, a grace area (triangle) keeps the tooltip open during the transition. This prevents the tooltip from closing when the user moves diagonally to interact with the content. The area is checked from the move that leaves the trigger, so a pointer that lands outside it closes the tooltip at once, and one that lands on another trigger in the same provider opens that tooltip on the same move.

Set `disableHoverableContent={true}` to disable this behavior.

With `closeDelay`, a pointer leaving the trigger or straying out of the grace area closes the tooltip only after that many milliseconds, and a pointer coming back to the trigger or onto the content keeps it open. A press, a blur, <Kbd>Escape</Kbd>, a scroll or another tooltip opening still closes it at once.

***

## Keyboard interactions

| Key | Action |
| --- | --- |
| <Kbd>Tab</Kbd> | Focus trigger, opens tooltip |
| <Kbd>Escape</Kbd> | Close tooltip |