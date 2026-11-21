```tsx
import * as ContextMenu from '@gentleduck/primitives/context-menu'
```

## Anatomy

```tsx
<ContextMenu.Root>
  <ContextMenu.Trigger />
  <ContextMenu.Portal>
    <ContextMenu.Content>
      <ContextMenu.Label />
      <ContextMenu.Item />
      <ContextMenu.Group>
        <ContextMenu.Item />
      </ContextMenu.Group>
      <ContextMenu.CheckboxItem>
        <ContextMenu.ItemIndicator />
      </ContextMenu.CheckboxItem>
      <ContextMenu.RadioGroup>
        <ContextMenu.RadioItem>
          <ContextMenu.ItemIndicator />
        </ContextMenu.RadioItem>
      </ContextMenu.RadioGroup>
      <ContextMenu.Separator />
      <ContextMenu.Sub>
        <ContextMenu.SubTrigger />
        <ContextMenu.SubContent />
      </ContextMenu.Sub>
      <ContextMenu.Arrow />
    </ContextMenu.Content>
  </ContextMenu.Portal>
</ContextMenu.Root>
```

***

## Usage

```tsx
import * as ContextMenu from '@gentleduck/primitives/context-menu'

function FileExplorer() {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger className="w-64 h-64 border-2 border-dashed rounded flex items-center justify-center">
        Right-click here
      </ContextMenu.Trigger>

      <ContextMenu.Portal>
        <ContextMenu.Content className="bg-white shadow-lg rounded-md p-1 min-w-[180px] border">
          <ContextMenu.Item className="px-3 py-1.5 rounded hover:bg-gray-100 cursor-pointer">
            New File
          </ContextMenu.Item>
          <ContextMenu.Item className="px-3 py-1.5 rounded hover:bg-gray-100 cursor-pointer">
            New Folder
          </ContextMenu.Item>
          <ContextMenu.Separator className="h-px bg-gray-200 my-1" />
          <ContextMenu.Sub>
            <ContextMenu.SubTrigger className="px-3 py-1.5 rounded hover:bg-gray-100 cursor-pointer flex justify-between">
              Sort by <span>></span>
            </ContextMenu.SubTrigger>
            <ContextMenu.SubContent className="bg-white shadow-lg rounded-md p-1 min-w-[140px] border">
              <ContextMenu.Item className="px-3 py-1.5 rounded hover:bg-gray-100 cursor-pointer">
                Name
              </ContextMenu.Item>
              <ContextMenu.Item className="px-3 py-1.5 rounded hover:bg-gray-100 cursor-pointer">
                Date
              </ContextMenu.Item>
            </ContextMenu.SubContent>
          </ContextMenu.Sub>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  )
}
```

***

## Examples

### Basic

```tsx title="components/context-menu-basic.tsx"
// import from your project: import Demo from '@/components/context-menu-basic'
'use client'

import * as ContextMenu from '@gentleduck/primitives/context-menu'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function ContextMenuBasicExample() {
  const [last, setLast] = React.useState('nothing')

  return (
    <div className={styles.stack}>
      <ContextMenu.Root>
        <ContextMenu.Trigger className={styles.contextArea}>Right-click or long-press here</ContextMenu.Trigger>
        <ContextMenu.Portal>
          <ContextMenu.Content className={styles.content}>
            <ContextMenu.Label className={styles.groupLabel}>Edit</ContextMenu.Label>
            <ContextMenu.Item className={styles.item} onSelect={() => setLast('Back')}>
              Back <span className={styles.shortcut}>Alt Left</span>
            </ContextMenu.Item>
            <ContextMenu.Item className={styles.item} disabled>
              Forward <span className={styles.shortcut}>Alt Right</span>
            </ContextMenu.Item>
            <ContextMenu.Item className={styles.item} onSelect={() => setLast('Reload')}>
              Reload <span className={styles.shortcut}>Ctrl R</span>
            </ContextMenu.Item>
            <ContextMenu.Separator className={styles.separator} />
            <ContextMenu.Item className={styles.item} onSelect={() => setLast('Inspect')}>
              Inspect
            </ContextMenu.Item>
          </ContextMenu.Content>
        </ContextMenu.Portal>
      </ContextMenu.Root>
      <p className={styles.note}>Last chosen: {last}.</p>
    </div>
  )
}
```

### Checkbox and radio items

```tsx title="components/context-menu-checkbox-radio.tsx"
// import from your project: import Demo from '@/components/context-menu-checkbox-radio'
'use client'

import * as ContextMenu from '@gentleduck/primitives/context-menu'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function ContextMenuCheckboxRadioExample() {
  const [grid, setGrid] = React.useState(true)
  const [rulers, setRulers] = React.useState(false)
  const [zoom, setZoom] = React.useState('100')

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger className={styles.contextArea}>
        Grid {grid ? 'on' : 'off'}, rulers {rulers ? 'on' : 'off'}, {zoom}%
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content className={styles.content}>
          <ContextMenu.CheckboxItem
            checked={grid}
            className={styles.item}
            closeOnSelect={false}
            onCheckedChange={setGrid}>
            <span className={styles.itemIndicator}>
              <ContextMenu.ItemIndicator>x</ContextMenu.ItemIndicator>
            </span>
            Show grid
          </ContextMenu.CheckboxItem>
          <ContextMenu.CheckboxItem
            checked={rulers}
            className={styles.item}
            closeOnSelect={false}
            onCheckedChange={setRulers}>
            <span className={styles.itemIndicator}>
              <ContextMenu.ItemIndicator>x</ContextMenu.ItemIndicator>
            </span>
            Show rulers
          </ContextMenu.CheckboxItem>
          <ContextMenu.Separator className={styles.separator} />
          <ContextMenu.Label className={styles.groupLabel}>Zoom</ContextMenu.Label>
          <ContextMenu.RadioGroup onValueChange={setZoom} value={zoom}>
            {['50', '100', '200'].map((level) => (
              <ContextMenu.RadioItem className={styles.item} key={level} value={level}>
                <span className={styles.itemIndicator}>
                  <ContextMenu.ItemIndicator>o</ContextMenu.ItemIndicator>
                </span>
                {level}%
              </ContextMenu.RadioItem>
            ))}
          </ContextMenu.RadioGroup>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  )
}
```

### Submenus

```tsx title="components/context-menu-submenu.tsx"
// import from your project: import Demo from '@/components/context-menu-submenu'
'use client'

import * as ContextMenu from '@gentleduck/primitives/context-menu'
import styles from '../primitives.module.css'

export default function ContextMenuSubmenuExample() {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger className={styles.contextArea}>Right-click a file</ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content className={styles.content}>
          <ContextMenu.Item className={styles.item}>Open</ContextMenu.Item>
          <ContextMenu.Sub>
            <ContextMenu.SubTrigger className={styles.item}>
              Share <span className={styles.shortcut}>{'>'}</span>
            </ContextMenu.SubTrigger>
            <ContextMenu.Portal>
              <ContextMenu.SubContent className={styles.content} sideOffset={4}>
                <ContextMenu.Item className={styles.item}>Email link</ContextMenu.Item>
                <ContextMenu.Item className={styles.item}>Copy link</ContextMenu.Item>
                <ContextMenu.Sub>
                  <ContextMenu.SubTrigger className={styles.item}>
                    More <span className={styles.shortcut}>{'>'}</span>
                  </ContextMenu.SubTrigger>
                  <ContextMenu.Portal>
                    <ContextMenu.SubContent className={styles.content} sideOffset={4}>
                      <ContextMenu.Item className={styles.item}>Embed</ContextMenu.Item>
                    </ContextMenu.SubContent>
                  </ContextMenu.Portal>
                </ContextMenu.Sub>
              </ContextMenu.SubContent>
            </ContextMenu.Portal>
          </ContextMenu.Sub>
          <ContextMenu.Separator className={styles.separator} />
          <ContextMenu.Item className={styles.item}>Delete</ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  )
}
```

### Non-modal

```tsx title="components/context-menu-non-modal.tsx"
// import from your project: import Demo from '@/components/context-menu-non-modal'
'use client'

import * as ContextMenu from '@gentleduck/primitives/context-menu'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function ContextMenuNonModalExample() {
  const [clicks, setClicks] = React.useState(0)

  return (
    <div className={styles.stack}>
      <ContextMenu.Root modal={false}>
        <ContextMenu.Trigger className={styles.contextArea}>Right-click, then use the button</ContextMenu.Trigger>
        <ContextMenu.Portal>
          <ContextMenu.Content className={styles.content}>
            <ContextMenu.Item className={styles.item}>Copy</ContextMenu.Item>
            <ContextMenu.Item className={styles.item}>Paste</ContextMenu.Item>
          </ContextMenu.Content>
        </ContextMenu.Portal>
      </ContextMenu.Root>
      <button className={styles.button} onClick={() => setClicks((count) => count + 1)} type="button">
        Clicked {clicks} times
      </button>
      <p className={styles.note}>modal off leaves the page scrollable and clickable while the menu is open.</p>
    </div>
  )
}
```

### Disabled trigger

```tsx title="components/context-menu-disabled.tsx"
// import from your project: import Demo from '@/components/context-menu-disabled'
'use client'

import * as ContextMenu from '@gentleduck/primitives/context-menu'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function ContextMenuDisabledExample() {
  const [disabled, setDisabled] = React.useState(true)

  return (
    <div className={styles.stack}>
      <ContextMenu.Root>
        <ContextMenu.Trigger className={styles.contextArea} disabled={disabled}>
          {disabled ? 'The browser menu shows here' : 'The custom menu shows here'}
        </ContextMenu.Trigger>
        <ContextMenu.Portal>
          <ContextMenu.Content className={styles.content}>
            <ContextMenu.Item className={styles.item}>Rename</ContextMenu.Item>
            <ContextMenu.Item className={styles.item}>Duplicate</ContextMenu.Item>
          </ContextMenu.Content>
        </ContextMenu.Portal>
      </ContextMenu.Root>
      <button className={styles.button} onClick={() => setDisabled((value) => !value)} type="button">
        {disabled ? 'Use the custom menu' : 'Use the browser menu'}
      </button>
    </div>
  )
}
```

### Right to left

```tsx title="components/context-menu-rtl.tsx"
// import from your project: import Demo from '@/components/context-menu-rtl'
'use client'

import * as ContextMenu from '@gentleduck/primitives/context-menu'
import styles from '../primitives.module.css'

export default function ContextMenuRtlExample() {
  return (
    <ContextMenu.Root dir="rtl">
      <ContextMenu.Trigger className={styles.contextArea} dir="rtl">
        انقر بزر الفأرة الأيمن هنا
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content className={styles.content}>
          <ContextMenu.Item className={styles.item}>نسخ</ContextMenu.Item>
          <ContextMenu.Sub>
            <ContextMenu.SubTrigger className={styles.item}>
              مشاركة <span className={styles.shortcut}>{'<'}</span>
            </ContextMenu.SubTrigger>
            <ContextMenu.Portal>
              <ContextMenu.SubContent className={styles.content}>
                <ContextMenu.Item className={styles.item}>رابط</ContextMenu.Item>
              </ContextMenu.SubContent>
            </ContextMenu.Portal>
          </ContextMenu.Sub>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  )
}
```

***

## Key components

### `ContextMenu.Root`

State manager. Opens on right-click on the trigger area.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `open` | `boolean` | - | Controlled open state. Close the menu by setting it to `false` |
| `onOpenChange` | `(open: boolean) => void` | - | Called when open state changes |
| `dir` | `'ltr' \| 'rtl'` | - | Reading direction of the menu. The trigger keeps the page's |
| `modal` | `boolean` | `true` | Enable modal behavior |

A context menu opens where the pointer is, so setting `open` to `true` before the trigger is right-clicked opens it at the top-left corner of the viewport, and warns once in development. Open it from `onOpenChange` and use `open` to close it or keep it closed.

### `ContextMenu.Trigger`

The area that responds to right-click. Renders a `<span>` by default.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `disabled` | `boolean` | `false` | Ignore right-clicks and long presses, so the browser's own menu shows |

A touch or pen press held for 700ms opens the menu too, unless it moves more than 10px first. With triggers nested inside each other, only the innermost one opens. A right-click or control-click while the menu is open closes it rather than opening it again where the pointer is.

### `ContextMenu.Content`

The menu content. Positioned at the cursor location.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `forceMount` | `true` | - | Keep mounted regardless of open state |
| `trapFocus` | `boolean` | `open` | Modal only. Override whether focus is trapped inside the content |
| `disableOutsidePointerEvents` | `boolean` | `open` | Modal only. Override whether pointer events outside are blocked |
| `disableOutsideScroll` | `boolean` | `true` | Modal only. Override whether body scroll is locked while open |
| `onPointerDownOutside` | `(event) => void` | - | Called when clicking outside |
| `onFocusOutside` | `(event) => void` | - | Called when focus moves outside |
| `onEscapeKeyDown` | `(event) => void` | - | Called when Escape is pressed |

On a modal menu, `trapFocus` and `disableOutsidePointerEvents` follow the open state and `disableOutsideScroll` is on. Override them when integrating with animation libraries like [motion](https://motion.dev) that need custom lifecycle control during exit animations. A non-modal menu never traps focus, blocks outside pointer events or locks scroll, and ignores all three.

### `ContextMenu.Item`

A menu item. Fires `onSelect` when activated.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `disabled` | `boolean` | `false` | Disable the item |
| `onSelect` | `(event) => void` | - | Called when item is selected |
| `closeOnSelect` | `boolean` | `true` | Close the menu once the item is selected. A checkbox or radio item takes it too |

### `ContextMenu.CheckboxItem`

A toggleable menu item with checked state.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `checked` | `boolean \| 'indeterminate'` | - | Checked state |
| `onCheckedChange` | `(checked: boolean) => void` | - | Called on toggle |

### `ContextMenu.RadioGroup` / `ContextMenu.RadioItem`

Mutually exclusive menu items.

### `ContextMenu.Sub` / `ContextMenu.SubTrigger` / `ContextMenu.SubContent`

Nested submenus. The sub-trigger points `aria-controls` at its submenu only while the submenu is open, since the id names nothing while it is closed.

`ContextMenu.Sub` takes `open`, `defaultOpen`, `onOpenChange` and `closeParentOnEsc`, as `DropdownMenu.Sub` does. With `closeParentOnEsc={false}`, Escape inside the submenu closes only the submenu and focuses its sub-trigger.

### `ContextMenu.Separator`

Visual separator between groups.

### `ContextMenu.Label`

Non-interactive label for a group.

***

## Keyboard interactions

| Key | Action |
| --- | --- |
| <Kbd>ArrowDown</Kbd> | Highlight next item |
| <Kbd>ArrowUp</Kbd> | Highlight previous item |
| A letter | Highlight the next item whose text starts with it |
| <Kbd>ArrowRight</Kbd> | Open submenu (on SubTrigger) |
| <Kbd>ArrowLeft</Kbd> | Close submenu |
| <Kbd>Enter</Kbd> / <Kbd>Space</Kbd> | Activate highlighted item |
| <Kbd>Escape</Kbd> | Close the menu, or only a submenu given `closeParentOnEsc={false}` |