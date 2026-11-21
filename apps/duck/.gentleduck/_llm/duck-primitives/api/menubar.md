```tsx
import * as Menubar from '@gentleduck/primitives/menubar'
```

## Anatomy

```tsx
<Menubar.Root>
  <Menubar.Menu>
    <Menubar.Trigger />
    <Menubar.Portal>
      <Menubar.Content>
        <Menubar.Item />
        <Menubar.Separator />
        <Menubar.Sub>
          <Menubar.SubTrigger />
          <Menubar.SubContent>
            <Menubar.Item />
          </Menubar.SubContent>
        </Menubar.Sub>
      </Menubar.Content>
    </Menubar.Portal>
  </Menubar.Menu>
</Menubar.Root>
```

## Usage

```tsx
<Menubar.Root className="flex gap-1 bg-white border rounded-md p-1">
  <Menubar.Menu>
    <Menubar.Trigger className="px-3 py-1 rounded hover:bg-gray-100 text-sm">
      File
    </Menubar.Trigger>
    <Menubar.Portal>
      <Menubar.Content className="bg-white shadow-lg rounded-md p-1 min-w-[160px] border">
        <Menubar.Item className="px-3 py-1.5 text-sm rounded hover:bg-gray-100">New File</Menubar.Item>
        <Menubar.Item className="px-3 py-1.5 text-sm rounded hover:bg-gray-100">Save</Menubar.Item>
        <Menubar.Separator className="h-px bg-gray-200 my-1" />
        <Menubar.Item className="px-3 py-1.5 text-sm rounded hover:bg-gray-100">Exit</Menubar.Item>
      </Menubar.Content>
    </Menubar.Portal>
  </Menubar.Menu>

  <Menubar.Menu>
    <Menubar.Trigger className="px-3 py-1 rounded hover:bg-gray-100 text-sm">
      Edit
    </Menubar.Trigger>
    <Menubar.Portal>
      <Menubar.Content className="bg-white shadow-lg rounded-md p-1 min-w-[160px] border">
        <Menubar.Item className="px-3 py-1.5 text-sm rounded hover:bg-gray-100">Undo</Menubar.Item>
        <Menubar.Item className="px-3 py-1.5 text-sm rounded hover:bg-gray-100">Redo</Menubar.Item>
      </Menubar.Content>
    </Menubar.Portal>
  </Menubar.Menu>
</Menubar.Root>
```

### Vertical

```tsx
<Menubar.Root orientation="vertical" className="flex flex-col gap-1 bg-white border rounded-md p-1">
  {/* the same menus; each opens to the right of its trigger */}
</Menubar.Root>
```

## Examples

### Basic

```tsx title="components/menubar-basic.tsx"
// import from your project: import Demo from '@/components/menubar-basic'
'use client'

import * as Menubar from '@gentleduck/primitives/menubar'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function MenubarBasicExample() {
  const [wrap, setWrap] = React.useState(true)
  const [theme, setTheme] = React.useState('system')

  return (
    <Menubar.Root className={styles.menubar}>
      <Menubar.Menu value="file">
        <Menubar.Trigger className={styles.menubarTrigger}>File</Menubar.Trigger>
        <Menubar.Portal>
          <Menubar.Content className={styles.content} sideOffset={6}>
            <Menubar.Item className={styles.item}>
              New file <span className={styles.shortcut}>Ctrl N</span>
            </Menubar.Item>
            <Menubar.Sub>
              <Menubar.SubTrigger className={styles.item}>
                Open recent <span className={styles.shortcut}>{'>'}</span>
              </Menubar.SubTrigger>
              <Menubar.Portal>
                <Menubar.SubContent className={styles.content}>
                  <Menubar.Item className={styles.item}>notes.md</Menubar.Item>
                  <Menubar.Item className={styles.item}>budget.csv</Menubar.Item>
                </Menubar.SubContent>
              </Menubar.Portal>
            </Menubar.Sub>
            <Menubar.Separator className={styles.separator} />
            <Menubar.Item className={styles.item} disabled>
              Print
            </Menubar.Item>
          </Menubar.Content>
        </Menubar.Portal>
      </Menubar.Menu>
      <Menubar.Menu value="view">
        <Menubar.Trigger className={styles.menubarTrigger}>View</Menubar.Trigger>
        <Menubar.Portal>
          <Menubar.Content className={styles.content} sideOffset={6}>
            <Menubar.CheckboxItem checked={wrap} className={styles.item} onCheckedChange={setWrap}>
              <span className={styles.itemIndicator}>
                <Menubar.ItemIndicator>x</Menubar.ItemIndicator>
              </span>
              Word wrap
            </Menubar.CheckboxItem>
            <Menubar.Separator className={styles.separator} />
            <Menubar.Label className={styles.groupLabel}>Theme</Menubar.Label>
            <Menubar.RadioGroup onValueChange={setTheme} value={theme}>
              {['light', 'dark', 'system'].map((value) => (
                <Menubar.RadioItem className={styles.item} key={value} value={value}>
                  <span className={styles.itemIndicator}>
                    <Menubar.ItemIndicator>o</Menubar.ItemIndicator>
                  </span>
                  {value}
                </Menubar.RadioItem>
              ))}
            </Menubar.RadioGroup>
          </Menubar.Content>
        </Menubar.Portal>
      </Menubar.Menu>
    </Menubar.Root>
  )
}
```

### Vertical

```tsx title="components/menubar-vertical.tsx"
// import from your project: import Demo from '@/components/menubar-vertical'
'use client'

import * as Menubar from '@gentleduck/primitives/menubar'
import styles from '../primitives.module.css'

export default function MenubarVerticalExample() {
  return (
    <Menubar.Root className={styles.menubar} orientation="vertical" style={{ flexDirection: 'column' }}>
      {['Projects', 'Team', 'Settings'].map((menu) => (
        <Menubar.Menu key={menu} value={menu}>
          <Menubar.Trigger className={styles.menubarTrigger}>{menu}</Menubar.Trigger>
          <Menubar.Portal>
            <Menubar.Content className={styles.content} sideOffset={6}>
              <Menubar.Item className={styles.item}>Open {menu.toLowerCase()}</Menubar.Item>
              <Menubar.Item className={styles.item}>Manage</Menubar.Item>
            </Menubar.Content>
          </Menubar.Portal>
        </Menubar.Menu>
      ))}
    </Menubar.Root>
  )
}
```

### Controlled

```tsx title="components/menubar-controlled.tsx"
// import from your project: import Demo from '@/components/menubar-controlled'
'use client'

import * as Menubar from '@gentleduck/primitives/menubar'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function MenubarControlledExample() {
  const [value, setValue] = React.useState('')

  return (
    <div className={styles.stack}>
      <Menubar.Root className={styles.menubar} onValueChange={setValue} value={value}>
        {['Edit', 'Selection', 'Help'].map((menu) => (
          <Menubar.Menu key={menu} value={menu}>
            <Menubar.Trigger className={styles.menubarTrigger}>{menu}</Menubar.Trigger>
            <Menubar.Portal>
              <Menubar.Content className={styles.content} sideOffset={6}>
                <Menubar.Item className={styles.item}>{menu} item</Menubar.Item>
              </Menubar.Content>
            </Menubar.Portal>
          </Menubar.Menu>
        ))}
      </Menubar.Root>
      <div className={styles.row}>
        <button className={styles.button} onClick={() => setValue('Help')} type="button">
          Open Help
        </button>
        <button className={styles.button} onClick={() => setValue('')} type="button">
          Close
        </button>
      </div>
      <p className={styles.note}>
        Open menu: {value || 'none'}. While one is open, the pointer moving across opens the next.
      </p>
    </div>
  )
}
```

### Modal

```tsx title="components/menubar-modal.tsx"
// import from your project: import Demo from '@/components/menubar-modal'
'use client'

import * as Menubar from '@gentleduck/primitives/menubar'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function MenubarModalExample() {
  const [modal, setModal] = React.useState(true)

  return (
    <div className={styles.stack}>
      <label className={styles.choice}>
        <input checked={modal} onChange={(event) => setModal(event.target.checked)} type="checkbox" />
        modal
      </label>
      <Menubar.Root className={styles.menubar} modal={modal}>
        <Menubar.Menu value="file">
          <Menubar.Trigger className={styles.menubarTrigger}>File</Menubar.Trigger>
          <Menubar.Portal>
            <Menubar.Content className={styles.content} sideOffset={6}>
              <Menubar.Item className={styles.item}>Save</Menubar.Item>
            </Menubar.Content>
          </Menubar.Portal>
        </Menubar.Menu>
      </Menubar.Root>
      <p className={styles.note}>
        Modal locks the page's scroll and keeps focus in the open menu. Off, the page stays usable.
      </p>
    </div>
  )
}
```

### Disabled

```tsx title="components/menubar-disabled.tsx"
// import from your project: import Demo from '@/components/menubar-disabled'
'use client'

import * as Menubar from '@gentleduck/primitives/menubar'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function MenubarDisabledExample() {
  const [disabled, setDisabled] = React.useState(true)

  return (
    <div className={styles.stack}>
      <Menubar.Root className={styles.menubar} disabled={disabled}>
        {['File', 'Edit'].map((menu) => (
          <Menubar.Menu key={menu} value={menu}>
            <Menubar.Trigger className={styles.menubarTrigger}>{menu}</Menubar.Trigger>
            <Menubar.Portal>
              <Menubar.Content className={styles.content} sideOffset={6}>
                <Menubar.Item className={styles.item}>{menu} item</Menubar.Item>
              </Menubar.Content>
            </Menubar.Portal>
          </Menubar.Menu>
        ))}
      </Menubar.Root>
      <button className={styles.button} onClick={() => setDisabled((value) => !value)} type="button">
        {disabled ? 'Enable the bar' : 'Disable the bar'}
      </button>
    </div>
  )
}
```

### Right to left

```tsx title="components/menubar-rtl.tsx"
// import from your project: import Demo from '@/components/menubar-rtl'
'use client'

import * as Menubar from '@gentleduck/primitives/menubar'
import styles from '../primitives.module.css'

export default function MenubarRtlExample() {
  return (
    <Menubar.Root className={styles.menubar} dir="rtl">
      {['ملف', 'تحرير', 'عرض'].map((menu) => (
        <Menubar.Menu key={menu} value={menu}>
          <Menubar.Trigger className={styles.menubarTrigger}>{menu}</Menubar.Trigger>
          <Menubar.Portal>
            <Menubar.Content className={styles.content} sideOffset={6}>
              <Menubar.Item className={styles.item}>{menu} جديد</Menubar.Item>
            </Menubar.Content>
          </Menubar.Portal>
        </Menubar.Menu>
      ))}
    </Menubar.Root>
  )
}
```

***

## API

### `Menubar.Root`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | - | Controlled value of the currently open menu |
| `defaultValue` | `string` | - | Initial open menu (uncontrolled) |
| `onValueChange` | `(value: string) => void` | - | Called when the active menu changes |
| `loop` | `boolean` | `true` | Keyboard navigation wraps from last to first |
| `dir` | `'ltr' \| 'rtl'` | - | Reading direction for keyboard navigation, written to the bar as `dir` |
| `modal` | `boolean` | `false` | While a menu is open, lock the page's scroll, keep pointer events for the menu and the bar, keep focus in the menu, and hide the rest of the page from assistive tech |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Which way the bar runs. Sets `aria-orientation` and `data-orientation`, the arrow keys, and the side menus open on |
| `disabled` | `boolean` | `false` | Disables every trigger in the bar |

### `Menubar.Menu`

Groups a trigger and its content into one menu entry.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | - | Unique value identifying this menu |
| `onOpenChange` | `(open: boolean) => void` | - | Called when this menu opens or closes. Useful for integrating with animation libraries like `motion` |

### `Menubar.Trigger`

The button that opens its menu. Renders a `<button>`, and takes every button prop.

The pointer moving onto a trigger focuses it, one with no menu content included, and opens its menu while another is open. A disabled trigger, from its own `disabled` or the root's, is skipped by the arrow keys, and the pointer moving onto it leaves the open menu open. A disabled trigger rendered as a link with `asChild` leaves the tab order, as a disabled button does.

### `Menubar.Portal`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `container` | `Element \| DocumentFragment \| RefObject \| null` | `document.body` | Portal target |
| `forceMount` | `true` | - | Keep the content mounted while closed. A submenu takes it only from its own prop or a portal of its own |

### `Menubar.Content`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `side` | `'top' \| 'right' \| 'bottom' \| 'left'` | `'bottom'`, or `'right'` in a vertical bar | Side of the trigger to open on. `right` and `left` mirror right to left |
| `align` | `'start' \| 'center' \| 'end'` | `'start'` | Alignment relative to the trigger |
| `sideOffset` | `number` | `0` | Distance from the trigger |
| `alignOffset` | `number` | `0` | Cross-axis offset |
| `forceMount` | `true` | - | Force content to stay mounted. Useful for animation libraries |
| `asChild` | `boolean` | `false` | Render as child element instead of wrapper |
| `loop` | `boolean` | `false` | Whether keyboard navigation loops around |
| `onCloseAutoFocus` | `(event: Event) => void` | - | Called when auto-focusing on close |
| `onEscapeKeyDown` | `(event: KeyboardEvent) => void` | - | Called when Escape is pressed |
| `onPointerDownOutside` | `(event: PointerDownOutsideEvent) => void` | - | Called when a pointer down event occurs outside |
| `onFocusOutside` | `(event: FocusOutsideEvent) => void` | - | Called when focus moves outside the content |
| `onInteractOutside` | `(event: PointerDownOutsideEvent \| FocusOutsideEvent) => void` | - | Called on any outside interaction |

It also takes the rest of [Popper](/duck-primitives/api/popper)'s positioning props, with the same defaults: `arrowPadding`, `avoidCollisions`, `collisionBoundary`, `collisionPadding`, `sticky`, `shiftCrossAxis`, `hideWhenDetached`, `updatePositionStrategy` and `updateOnScroll`. It takes no `trapFocus`, `disableOutsidePointerEvents` or `disableOutsideScroll`: the root's `modal` decides all three for every menu.

}>
  The `forceMount`, `asChild`, and `onPointerDownOutside` / `onFocusOutside` props give you full control over the content lifecycle. This is especially useful when integrating with animation libraries like [motion](https://motion.dev): use `forceMount` + `asChild` to keep the content mounted during exit animations, and the outside-interaction handlers to prevent premature dismissal.

***

## Keyboard interactions

| Key | Action |
| --- | --- |
| <Kbd>ArrowRight</Kbd> / <Kbd>ArrowLeft</Kbd> | Horizontal bar: move to the next or previous menu, from a trigger or an open menu. The two swap right to left |
| <Kbd>ArrowDown</Kbd> | Horizontal bar: open the focused menu. In an open menu: highlight the next item |
| <Kbd>ArrowUp</Kbd> | In an open menu: highlight the previous item |
| <Kbd>ArrowDown</Kbd> / <Kbd>ArrowUp</Kbd> on a trigger | Vertical bar: move to the next or previous menu |
| <Kbd>ArrowRight</Kbd> on a trigger | Vertical bar: open the focused menu. <Kbd>ArrowLeft</Kbd> right to left |
| <Kbd>ArrowLeft</Kbd> in an open menu | Vertical bar: close the menu and return to its trigger. <Kbd>ArrowRight</Kbd> right to left |
| <Kbd>Shift</Kbd>+<Kbd>i</Kbd> (`I`) | Open the leftmost menu, or the top one in a vertical bar. With Caps Lock or another modifier the letter goes to typeahead |
| <Kbd>Shift</Kbd>+<Kbd>a</Kbd> (`A`) | Open the rightmost menu, or the bottom one in a vertical bar. With Caps Lock or another modifier the letter goes to typeahead |
| A letter | Highlight the next item whose text starts with it |
| <Kbd>g</Kbd> <Kbd>g</Kbd> / <Kbd>Shift</Kbd>+<Kbd>g</Kbd> (`G`) | Highlight the first or last item in the open menu |
| <Kbd>Enter</Kbd> / <Kbd>Space</Kbd> | Open or close the focused menu, or activate the highlighted item |
| <Kbd>Escape</Kbd> | Close the menu and return to its trigger |

}>
  All menu-level sub-components (Item, CheckboxItem, RadioGroup, RadioItem, Sub, etc.) work identically to [Context Menu](/duck-primitives/api/context-menu), `textValue`, `closeOnSelect` and `closeParentOnEsc` included. `Menubar.Sub` takes `open`, `defaultOpen` and `onOpenChange`. A field inside an item keeps its arrow keys, and <Kbd>ArrowRight</Kbd> on a sub-trigger opens its submenu rather than moving to the next menu.