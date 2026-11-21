```tsx
import * as DropdownMenu from '@gentleduck/primitives/dropdown-menu'
```

## Anatomy

```tsx
<DropdownMenu.Root>
  <DropdownMenu.Trigger />
  <DropdownMenu.Portal>
    <DropdownMenu.Content>
      <DropdownMenu.Label />
      <DropdownMenu.Item />
      <DropdownMenu.Group>
        <DropdownMenu.Item />
      </DropdownMenu.Group>
      <DropdownMenu.CheckboxItem>
        <DropdownMenu.ItemIndicator />
      </DropdownMenu.CheckboxItem>
      <DropdownMenu.RadioGroup>
        <DropdownMenu.RadioItem>
          <DropdownMenu.ItemIndicator />
        </DropdownMenu.RadioItem>
      </DropdownMenu.RadioGroup>
      <DropdownMenu.Separator />
      <DropdownMenu.Sub>
        <DropdownMenu.SubTrigger />
        <DropdownMenu.SubContent />
      </DropdownMenu.Sub>
      <DropdownMenu.Arrow />
    </DropdownMenu.Content>
  </DropdownMenu.Portal>
</DropdownMenu.Root>
```

***

## Usage

```tsx
import * as DropdownMenu from '@gentleduck/primitives/dropdown-menu'

function ActionsMenu() {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="px-3 py-2 border rounded">
        Actions
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content className="bg-white shadow-lg rounded-md p-1 min-w-[180px] border" sideOffset={4}>
          <DropdownMenu.Item className="px-3 py-1.5 rounded hover:bg-gray-100 cursor-pointer">
            Edit
          </DropdownMenu.Item>
          <DropdownMenu.Item className="px-3 py-1.5 rounded hover:bg-gray-100 cursor-pointer">
            Duplicate
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger className="px-3 py-1.5 rounded hover:bg-gray-100 cursor-pointer flex justify-between">
              Share <span>></span>
            </DropdownMenu.SubTrigger>
            <DropdownMenu.SubContent className="bg-white shadow-lg rounded-md p-1 min-w-[140px] border">
              <DropdownMenu.Item className="px-3 py-1.5 rounded hover:bg-gray-100 cursor-pointer">
                Copy Link
              </DropdownMenu.Item>
              <DropdownMenu.Item className="px-3 py-1.5 rounded hover:bg-gray-100 cursor-pointer">
                Email
              </DropdownMenu.Item>
            </DropdownMenu.SubContent>
          </DropdownMenu.Sub>
          <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />
          <DropdownMenu.Item className="px-3 py-1.5 rounded hover:bg-gray-100 cursor-pointer text-red-600">
            Delete
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
```

### An item that opens a dialog

The menu closes when the item is selected, so the dialog has no trigger to give focus back to. Pass the menu's trigger as the dialog's `finalFocus`:

```tsx
const actionsRef = React.useRef<HTMLButtonElement>(null)
const [open, setOpen] = React.useState(false)

<DropdownMenu.Root>
  <DropdownMenu.Trigger ref={actionsRef}>Actions</DropdownMenu.Trigger>
  <DropdownMenu.Portal>
    <DropdownMenu.Content>
      <DropdownMenu.Item onSelect={() => setOpen(true)}>Delete</DropdownMenu.Item>
    </DropdownMenu.Content>
  </DropdownMenu.Portal>
</DropdownMenu.Root>

<Dialog.Root open={open} onOpenChange={setOpen}>
  <Dialog.Portal>
    <Dialog.Content finalFocus={actionsRef}>...</Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

***

## Examples

### Basic

```tsx title="components/dropdown-menu-basic.tsx"
// import from your project: import Demo from '@/components/dropdown-menu-basic'
'use client'

import * as DropdownMenu from '@gentleduck/primitives/dropdown-menu'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function DropdownMenuBasicExample() {
  const [last, setLast] = React.useState('nothing')

  return (
    <div className={styles.stack}>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger className={styles.button}>My account</DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content align="start" className={styles.content} sideOffset={6}>
            <DropdownMenu.Label className={styles.groupLabel}>Signed in as ada@example.com</DropdownMenu.Label>
            <DropdownMenu.Group>
              <DropdownMenu.Item className={styles.item} onSelect={() => setLast('Profile')}>
                Profile <span className={styles.shortcut}>Ctrl P</span>
              </DropdownMenu.Item>
              <DropdownMenu.Item className={styles.item} onSelect={() => setLast('Settings')}>
                Settings <span className={styles.shortcut}>Ctrl ,</span>
              </DropdownMenu.Item>
              <DropdownMenu.Item className={styles.item} disabled>
                Billing (owners only)
              </DropdownMenu.Item>
            </DropdownMenu.Group>
            <DropdownMenu.Separator className={styles.separator} />
            <DropdownMenu.Item className={styles.item} onSelect={() => setLast('Sign out')}>
              Sign out
            </DropdownMenu.Item>
            <DropdownMenu.Arrow className={styles.arrow} />
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
      <p className={styles.note}>Last chosen: {last}. Typing a letter jumps to the item it starts.</p>
    </div>
  )
}
```

### Checkbox and radio items

```tsx title="components/dropdown-menu-selection.tsx"
// import from your project: import Demo from '@/components/dropdown-menu-selection'
'use client'

import * as DropdownMenu from '@gentleduck/primitives/dropdown-menu'
import * as React from 'react'
import styles from './styles.module.css'

export default function DropdownMenuSelectionInternalExample() {
  const [showDeleted, setShowDeleted] = React.useState(false)
  const [view, setView] = React.useState<'grid' | 'list'>('grid')

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className={styles.trigger}>View mode</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className={styles.content} sideOffset={8}>
          <DropdownMenu.Label className={styles.menuLabel}>Display</DropdownMenu.Label>
          <DropdownMenu.RadioGroup onValueChange={(v) => setView(v as 'grid' | 'list')} value={view}>
            <DropdownMenu.RadioItem className={styles.item} value="grid">
              Grid
            </DropdownMenu.RadioItem>
            <DropdownMenu.RadioItem className={styles.item} value="list">
              List
            </DropdownMenu.RadioItem>
          </DropdownMenu.RadioGroup>
          <DropdownMenu.Separator className={styles.separator} />
          <DropdownMenu.CheckboxItem
            checked={showDeleted}
            className={styles.item}
            onCheckedChange={(checked) => setShowDeleted(checked === true)}>
            Show deleted
          </DropdownMenu.CheckboxItem>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
```

### Submenus

```tsx title="components/dropdown-menu-submenu.tsx"
// import from your project: import Demo from '@/components/dropdown-menu-submenu'
'use client'

import * as DropdownMenu from '@gentleduck/primitives/dropdown-menu'
import styles from '../primitives.module.css'

export default function DropdownMenuSubmenuExample() {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className={styles.button}>Insert</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="start" className={styles.content} sideOffset={6}>
          <DropdownMenu.Item className={styles.item}>Text</DropdownMenu.Item>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger className={styles.item}>
              Media <span className={styles.shortcut}>{'>'}</span>
            </DropdownMenu.SubTrigger>
            <DropdownMenu.Portal>
              <DropdownMenu.SubContent className={styles.content} sideOffset={4}>
                <DropdownMenu.Item className={styles.item}>Image</DropdownMenu.Item>
                <DropdownMenu.Item className={styles.item}>Video</DropdownMenu.Item>
                <DropdownMenu.Sub>
                  <DropdownMenu.SubTrigger className={styles.item}>
                    Embed <span className={styles.shortcut}>{'>'}</span>
                  </DropdownMenu.SubTrigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.SubContent className={styles.content} sideOffset={4}>
                      <DropdownMenu.Item className={styles.item}>Map</DropdownMenu.Item>
                      <DropdownMenu.Item className={styles.item}>Chart</DropdownMenu.Item>
                    </DropdownMenu.SubContent>
                  </DropdownMenu.Portal>
                </DropdownMenu.Sub>
              </DropdownMenu.SubContent>
            </DropdownMenu.Portal>
          </DropdownMenu.Sub>
          <DropdownMenu.Item className={styles.item}>Table</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
```

### Side and alignment

```tsx title="components/dropdown-menu-positioning.tsx"
// import from your project: import Demo from '@/components/dropdown-menu-positioning'
'use client'

import * as DropdownMenu from '@gentleduck/primitives/dropdown-menu'
import * as React from 'react'
import styles from '../primitives.module.css'

const SIDES = ['top', 'right', 'bottom', 'left'] as const
const ALIGNS = ['start', 'center', 'end'] as const

export default function DropdownMenuPositioningExample() {
  const [side, setSide] = React.useState<(typeof SIDES)[number]>('bottom')
  const [align, setAlign] = React.useState<(typeof ALIGNS)[number]>('center')

  return (
    <div className={styles.stack}>
      <div className={styles.row}>
        {SIDES.map((value) => (
          <button className={styles.button} key={value} onClick={() => setSide(value)} type="button">
            {value === side ? `[${value}]` : value}
          </button>
        ))}
      </div>
      <div className={styles.row}>
        {ALIGNS.map((value) => (
          <button className={styles.button} key={value} onClick={() => setAlign(value)} type="button">
            {value === align ? `[${value}]` : value}
          </button>
        ))}
      </div>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger className={styles.button}>
          Open {side} {align}
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align={align}
            className={styles.content}
            collisionPadding={8}
            side={side}
            sideOffset={8}>
            <DropdownMenu.Item className={styles.item}>One</DropdownMenu.Item>
            <DropdownMenu.Item className={styles.item}>Two</DropdownMenu.Item>
            <DropdownMenu.Arrow className={styles.arrow} />
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  )
}
```

### Non-modal

```tsx title="components/dropdown-menu-non-modal.tsx"
// import from your project: import Demo from '@/components/dropdown-menu-non-modal'
'use client'

import * as DropdownMenu from '@gentleduck/primitives/dropdown-menu'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function DropdownMenuNonModalExample() {
  const [text, setText] = React.useState('')

  return (
    <div className={styles.stack}>
      <DropdownMenu.Root modal={false}>
        <DropdownMenu.Trigger className={styles.button}>Formatting</DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content align="start" className={styles.content} sideOffset={6}>
            <DropdownMenu.Item className={styles.item}>Bold</DropdownMenu.Item>
            <DropdownMenu.Item className={styles.item}>Italic</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
      <input
        className={styles.input}
        onChange={(event) => setText(event.target.value)}
        placeholder="Still clickable with the menu open"
        value={text}
      />
      <p className={styles.note}>
        modal off leaves the page scrollable and the field clickable while the menu is open.
      </p>
    </div>
  )
}
```

### An item that opens a dialog

```tsx title="components/dropdown-menu-open-dialog.tsx"
// import from your project: import Demo from '@/components/dropdown-menu-open-dialog'
'use client'

import * as Dialog from '@gentleduck/primitives/dialog'
import * as DropdownMenu from '@gentleduck/primitives/dropdown-menu'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function DropdownMenuOpenDialogExample() {
  const trigger = React.useRef<HTMLButtonElement>(null)
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger className={styles.button} ref={trigger}>
          Actions
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content align="start" className={styles.content} sideOffset={6}>
            <DropdownMenu.Item className={styles.item}>Rename</DropdownMenu.Item>
            <DropdownMenu.Item className={styles.item} onSelect={() => setOpen(true)}>
              Delete...
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
      <Dialog.Root onOpenChange={setOpen} open={open}>
        <Dialog.Portal>
          <Dialog.Overlay className={`${styles.overlay} ${styles.fade}`} />
          <Dialog.Content className={styles.dialog} finalFocus={trigger}>
            <Dialog.Title className={styles.title}>Delete the file?</Dialog.Title>
            <Dialog.Description className={styles.description}>
              On close, focus goes back to the Actions button.
            </Dialog.Description>
            <div className={styles.actions}>
              <Dialog.Close className={styles.button}>Cancel</Dialog.Close>
              <Dialog.Close className={`${styles.button} ${styles.danger}`}>Delete</Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}
```

### Items that keep it open

```tsx title="components/dropdown-menu-keep-open.tsx"
// import from your project: import Demo from '@/components/dropdown-menu-keep-open'
'use client'

import * as DropdownMenu from '@gentleduck/primitives/dropdown-menu'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function DropdownMenuKeepOpenExample() {
  const [zoom, setZoom] = React.useState(100)

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className={styles.button}>Zoom {zoom}%</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="start" className={styles.content} sideOffset={6}>
          <DropdownMenu.Item
            className={styles.item}
            closeOnSelect={false}
            onSelect={() => setZoom((value) => value + 10)}>
            Zoom in <span className={styles.shortcut}>{zoom + 10}%</span>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className={styles.item}
            closeOnSelect={false}
            onSelect={() => setZoom((value) => Math.max(10, value - 10))}>
            Zoom out <span className={styles.shortcut}>{Math.max(10, zoom - 10)}%</span>
          </DropdownMenu.Item>
          <DropdownMenu.Separator className={styles.separator} />
          <DropdownMenu.Item className={styles.item} onSelect={() => setZoom(100)}>
            Reset and close
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
```

### Typeahead text

```tsx title="components/dropdown-menu-typeahead.tsx"
// import from your project: import Demo from '@/components/dropdown-menu-typeahead'
'use client'

import * as DropdownMenu from '@gentleduck/primitives/dropdown-menu'
import styles from '../primitives.module.css'

const FLAGS = [
  { code: 'DE', name: 'Germany' },
  { code: 'EG', name: 'Egypt' },
  { code: 'FR', name: 'France' },
  { code: 'JP', name: 'Japan' },
]

export default function DropdownMenuTypeaheadExample() {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className={styles.button}>Country</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="start" className={styles.content} sideOffset={6}>
          {FLAGS.map(({ code, name }) => (
            <DropdownMenu.Item className={styles.item} key={code} textValue={name}>
              <span aria-hidden className={styles.shortcut} style={{ marginInlineStart: 0 }}>
                {code}
              </span>
              {name}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
```

### Controlled

```tsx title="components/dropdown-menu-controlled.tsx"
// import from your project: import Demo from '@/components/dropdown-menu-controlled'
'use client'

import * as DropdownMenu from '@gentleduck/primitives/dropdown-menu'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function DropdownMenuControlledExample() {
  const [open, setOpen] = React.useState(false)
  const [opens, setOpens] = React.useState(0)

  return (
    <div className={styles.stack}>
      <DropdownMenu.Root
        onOpenChange={(next) => {
          setOpen(next)
          if (next) setOpens((count) => count + 1)
        }}
        open={open}>
        <DropdownMenu.Trigger className={styles.button}>Options</DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content align="start" className={styles.content} sideOffset={6}>
            <DropdownMenu.Item className={styles.item}>Duplicate</DropdownMenu.Item>
            <DropdownMenu.Item className={styles.item}>Archive</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
      <p className={styles.note}>
        {open ? 'Open' : 'Closed'}, opened {opens} times. onOpenChange hears every way it opens and closes.
      </p>
    </div>
  )
}
```

### Right to left

```tsx title="components/dropdown-menu-rtl.tsx"
// import from your project: import Demo from '@/components/dropdown-menu-rtl'
'use client'

import * as DropdownMenu from '@gentleduck/primitives/dropdown-menu'
import styles from '../primitives.module.css'

export default function DropdownMenuRtlExample() {
  return (
    <DropdownMenu.Root dir="rtl">
      <DropdownMenu.Trigger className={styles.button}>الخيارات</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="start" className={styles.content} sideOffset={6}>
          <DropdownMenu.Item className={styles.item}>تعديل</DropdownMenu.Item>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger className={styles.item}>
              مشاركة <span className={styles.shortcut}>{'<'}</span>
            </DropdownMenu.SubTrigger>
            <DropdownMenu.Portal>
              <DropdownMenu.SubContent className={styles.content}>
                <DropdownMenu.Item className={styles.item}>بريد</DropdownMenu.Item>
              </DropdownMenu.SubContent>
            </DropdownMenu.Portal>
          </DropdownMenu.Sub>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
```

***

## API

### `DropdownMenu.Root`

The root component that manages open/closed state and provides context. Wraps the base Menu primitive internally. The menu closes, with any open submenu, when the window loses focus.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `open` | `boolean` | - | Controlled open state |
| `defaultOpen` | `boolean` | `false` | Initial open state (uncontrolled) |
| `onOpenChange` | `(open: boolean) => void` | - | Called when the open state should change |
| `dir` | `'ltr' \| 'rtl'` | - | Direction of the menu and its submenus. Falls back to `DirectionProvider`, then `<html dir>`. The trigger keeps the page's |
| `modal` | `boolean` | `true` | When true, interaction with outside elements is disabled and only menu content is visible to screen readers |

### `DropdownMenu.Trigger`

Button that toggles the dropdown menu. Renders a `<button>` with `aria-haspopup="menu"`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `asChild` | `boolean` | - | Render as the child element instead of a `<button>` |
| `disabled` | `boolean` | `false` | Disables the trigger |

Sets `aria-expanded`, `aria-controls`, and `data-state` automatically.

### `DropdownMenu.Portal`

Renders the dropdown content into a portal.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `container` | `Element \| DocumentFragment \| RefObject \| null` | `document.body` | Portal target |

### `DropdownMenu.Content`

The dropdown content. Handles focus management, keyboard navigation, and dismiss behavior.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `side` | `'top' \| 'right' \| 'bottom' \| 'left'` | `'bottom'` | Preferred side relative to the trigger |
| `sideOffset` | `number` | - | Main-axis offset from trigger |
| `align` | `'start' \| 'center' \| 'end'` | - | Cross-axis alignment |
| `alignOffset` | `number` | - | Cross-axis offset |
| `avoidCollisions` | `boolean` | `true` | Flip to avoid viewport overflow |
| `collisionPadding` | `number` | - | Padding from viewport edges |
| `onCloseAutoFocus` | `(event: Event) => void` | - | Called when focus returns to trigger on close |
| `onEscapeKeyDown` | `(event: KeyboardEvent) => void` | - | Called when Escape is pressed |
| `onPointerDownOutside` | `(event) => void` | - | Called when clicking outside |
| `onInteractOutside` | `(event) => void` | - | Called on any interaction outside |
| `trapFocus` | `boolean` | `open` | Modal only. Override whether focus is trapped inside the content |
| `disableOutsidePointerEvents` | `boolean` | `open` | Modal only. Override whether pointer events outside are blocked |
| `disableOutsideScroll` | `boolean` | `true` | Modal only. Override whether body scroll is locked while open |

On a modal menu, `trapFocus` and `disableOutsidePointerEvents` follow the open state and `disableOutsideScroll` is on. Override them when integrating with animation libraries like [motion](https://motion.dev) that need custom lifecycle control during exit animations. A non-modal menu never traps focus, blocks outside pointer events or locks scroll, and ignores all three.

Exposes `data-state="open"` / `data-state="closed"` and `data-side` for CSS animation.

CSS custom properties available:

* `--gentleduck-dropdown-menu-content-transform-origin`
* `--gentleduck-dropdown-menu-content-available-width`
* `--gentleduck-dropdown-menu-content-available-height`
* `--gentleduck-dropdown-menu-trigger-width`
* `--gentleduck-dropdown-menu-trigger-height`

### `DropdownMenu.Group`

Groups related items. Renders a `<div>` with `role="group"`.

### `DropdownMenu.Label`

Non-interactive label for a group.

### `DropdownMenu.Item`

An interactive menu item. Fires `onSelect` when activated.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `disabled` | `boolean` | `false` | Disable the item |
| `onSelect` | `(event: Event) => void` | - | Called when item is selected |
| `closeOnSelect` | `boolean` | `true` | Close the menu once the item is selected. A checkbox or radio item takes it too |
| `textValue` | `string` | - | Text override for typeahead search |

Exposes `data-highlighted` when focused and `data-disabled` when disabled. A key typed into a focusable element inside the item, even one portalled out of it, is left to that element. A disabled item rendered as a link with `asChild` does not follow the link.

### `DropdownMenu.CheckboxItem`

A toggleable menu item with checked state.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `checked` | `boolean \| 'indeterminate'` | - | Checked state |
| `onCheckedChange` | `(checked: boolean) => void` | - | Called on toggle |
| `disabled` | `boolean` | `false` | Disable the item |

### `DropdownMenu.RadioGroup` / `DropdownMenu.RadioItem`

Mutually exclusive menu items.

| Prop (RadioGroup) | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | - | Currently selected value |
| `onValueChange` | `(value: string) => void` | - | Called when selection changes |

| Prop (RadioItem) | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | - | Value for this item |
| `disabled` | `boolean` | `false` | Disable the item |

### `DropdownMenu.ItemIndicator`

Renders only when the parent item is checked. Use for check marks or radio dots.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `forceMount` | `boolean` | - | Keep mounted for animation control |

### `DropdownMenu.Sub` / `DropdownMenu.SubTrigger` / `DropdownMenu.SubContent`

Nested submenus. The sub-trigger points `aria-controls` at its submenu only while the submenu is open, since the id names nothing while it is closed.

| Prop (Sub) | Type | Default | Description |
| --- | --- | --- | --- |
| `open` | `boolean` | - | Controlled open state |
| `defaultOpen` | `boolean` | `false` | Initial open state. It holds only in a menu that leaves focus alone on open, as in Radix: a menu focusing its content closes the submenu |
| `onOpenChange` | `(open: boolean) => void` | - | Called when open state changes |
| `closeParentOnEsc` | `boolean` | `true` | Whether Escape inside the submenu closes the whole menu, or only the submenu, focusing its sub-trigger |

`SubContent` exposes the same `--gentleduck-dropdown-menu-*` CSS custom properties as `Content`.

### `DropdownMenu.Separator`

Visual separator between groups. Renders a `<div>` with `aria-hidden`.

### `DropdownMenu.Arrow`

Arrow pointing to the trigger.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `width` | `number` | `10` | Arrow width in pixels |
| `height` | `number` | `5` | Arrow height in pixels |

***

## Keyboard interactions

| Key | Action |
| --- | --- |
| <Kbd>Space</Kbd> / <Kbd>Enter</Kbd> | Opens menu (on trigger) or activates highlighted item |
| <Kbd>ArrowDown</Kbd> | Opens menu or highlights next item |
| <Kbd>ArrowUp</Kbd> | Highlights previous item |
| A letter | Highlights the next item whose text starts with it |
| <Kbd>ArrowRight</Kbd> | Opens submenu (on SubTrigger) |
| <Kbd>ArrowLeft</Kbd> | Closes submenu |
| <Kbd>Escape</Kbd> | Closes the menu, or only a submenu given `closeParentOnEsc={false}` |