```tsx
import * as Menu from '@gentleduck/primitives/menu'
```

}>
  Menu is the **base primitive** that Context Menu and Menubar build on top of. It provides the full menu system without a trigger mechanism.

The anatomy and API are identical to Context Menu's content-level components. See [Context Menu](/duck-primitives/api/context-menu) for the full component list.

Menu does not include a trigger mechanism. Context Menu adds right-click triggering; Menubar adds click-on-menu-title triggering. Use Menu directly when building custom trigger mechanisms.

`Menu.Anchor` is the element the content is placed against, and takes `virtualRef`, as [`Popper.Anchor`](/duck-primitives/api/popper) does, to open at a point such as the pointer. `Menu.Portal` takes `container` and `forceMount`.

***

## Examples

### A trigger of your own

```tsx title="components/menu-anchor.tsx"
// import from your project: import Demo from '@/components/menu-anchor'
'use client'

import * as Menu from '@gentleduck/primitives/menu'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function MenuAnchorExample() {
  const [open, setOpen] = React.useState(false)

  return (
    <Menu.Root modal={false} onOpenChange={setOpen} open={open}>
      <Menu.Anchor asChild>
        <button
          aria-expanded={open}
          aria-haspopup="menu"
          className={styles.button}
          onKeyDown={(event) => {
            if (!['Enter', ' ', 'ArrowDown'].includes(event.key)) return
            event.preventDefault()
            setOpen(true)
          }}
          onPointerDown={(event) => {
            if (event.button !== 0 || event.ctrlKey) return
            setOpen(!open)
            if (!open) event.preventDefault()
          }}
          type="button">
          A trigger of your own
        </button>
      </Menu.Anchor>
      <Menu.Portal>
        <Menu.Content align="start" className={styles.content} sideOffset={6}>
          <Menu.Item className={styles.item}>New tab</Menu.Item>
          <Menu.Item className={styles.item}>New window</Menu.Item>
          <Menu.Separator className={styles.separator} />
          <Menu.Item className={styles.item}>Close</Menu.Item>
        </Menu.Content>
      </Menu.Portal>
    </Menu.Root>
  )
}
```

### Opened by a shortcut

```tsx title="components/menu-shortcut-trigger.tsx"
// import from your project: import Demo from '@/components/menu-shortcut-trigger'
'use client'

import * as Menu from '@gentleduck/primitives/menu'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function MenuShortcutTriggerExample() {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === '.' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault()
        setOpen(true)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <Menu.Root onOpenChange={setOpen} open={open}>
      <Menu.Anchor className={styles.box}>Press Ctrl . to open the quick actions here</Menu.Anchor>
      <Menu.Portal>
        <Menu.Content className={styles.content} sideOffset={6}>
          <Menu.Item className={styles.item}>Quick fix</Menu.Item>
          <Menu.Item className={styles.item}>Rename symbol</Menu.Item>
        </Menu.Content>
      </Menu.Portal>
    </Menu.Root>
  )
}
```

***

## API

### `Menu.Root`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `open` | `boolean` | - | Controlled open state |
| `onOpenChange` | `(open: boolean) => void` | - | Called on state change |
| `dir` | `'ltr' \| 'rtl'` | - | Reading direction for keyboard navigation |
| `modal` | `boolean` | `true` | Enable modal behavior |

## Sub-components

`Menu.Anchor`, `Menu.Portal`, `Menu.Content`, `Menu.Group`, `Menu.Label`, `Menu.Item`, `Menu.CheckboxItem`, `Menu.RadioGroup`, `Menu.RadioItem`, `Menu.ItemIndicator`, `Menu.Separator`, `Menu.Arrow`, `Menu.Sub`, `Menu.SubTrigger`, `Menu.SubContent`

}>
  All sub-components also export short aliases: `Root`, `Anchor`, `Portal`, `Content`, etc.