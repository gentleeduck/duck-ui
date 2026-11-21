```tsx title="components/context-menu-1.tsx"
// import from your project: import Demo from '@/components/context-menu-1'
'use client'

import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@gentleduck/registry-ui/context-menu'
import * as React from 'react'

export default function Demo() {
  const [showBookmarks, setShowBookmarks] = React.useState(true)
  const [showFullUrls, setShowFullUrls] = React.useState(false)
  const [person, setPerson] = React.useState('pedro')

  return (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm">
        Right click here
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem inset>
          Back
          <ContextMenuShortcut>⌘[</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem disabled inset>
          Forward
          <ContextMenuShortcut>⌘]</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem inset>
          Reload
          <ContextMenuShortcut>⌘R</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger inset>More Tools</ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuItem>
              Save Page As...
              <ContextMenuShortcut>⇧⌘S</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem>Create Shortcut...</ContextMenuItem>
            <ContextMenuItem>Name Window...</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem>Developer Tools</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuCheckboxItem checked={showBookmarks} onCheckedChange={setShowBookmarks}>
          Show Bookmarks Bar
          <ContextMenuShortcut>⌘⇧B</ContextMenuShortcut>
        </ContextMenuCheckboxItem>
        <ContextMenuCheckboxItem checked={showFullUrls} onCheckedChange={setShowFullUrls}>
          Show Full URLs
        </ContextMenuCheckboxItem>
        <ContextMenuSeparator />
        <ContextMenuRadioGroup value={person} onValueChange={setPerson}>
          <ContextMenuLabel inset>People</ContextMenuLabel>
          <ContextMenuSeparator />
          <ContextMenuRadioItem value="pedro">Pedro Duarte</ContextMenuRadioItem>
          <ContextMenuRadioItem value="colm">Colm Tuite</ContextMenuRadioItem>
        </ContextMenuRadioGroup>
      </ContextMenuContent>
    </ContextMenu>
  )
}
```

## Philosophy

Context menus are power-user shortcuts that surface relevant actions where the user already is. This implementation is built directly on the `@gentleduck/primitives/context-menu` primitives, so right-click behavior, keyboard interactions, and submenu semantics stay consistent.

## How It's Built

## Installation

CLI
Manual

```bash
npx @gentleduck/cli add context-menu
```

Install the following dependencies:

```bash
npm install @gentleduck/libs @gentleduck/primitives lucide-react
```

Copy and paste the following code into your project.

Update the import paths to match your project setup.

## Usage

```tsx showLineNumbers
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
```

```tsx showLineNumbers
<ContextMenu>
  <ContextMenuTrigger>Right click</ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem>Profile</ContextMenuItem>
    <ContextMenuItem>Billing</ContextMenuItem>
    <ContextMenuItem>Team</ContextMenuItem>
    <ContextMenuItem>Subscription</ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>
```

## Examples

### Groups and submenu offsets

```tsx title="components/context-menu-6.tsx"
// import from your project: import Demo from '@/components/context-menu-6'
'use client'

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@gentleduck/registry-ui/context-menu'

export default function Demo() {
  return (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm">
        Right-click a cell
      </ContextMenuTrigger>
      <ContextMenuContent className="w-52">
        <ContextMenuGroup>
          <ContextMenuLabel>Cell</ContextMenuLabel>
          <ContextMenuItem>Copy</ContextMenuItem>
          <ContextMenuItem>Paste</ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuSub>
          <ContextMenuSubTrigger>Insert</ContextMenuSubTrigger>
          <ContextMenuSubContent alignOffset={-4} className="w-44" sideOffset={6}>
            <ContextMenuItem>Row above</ContextMenuItem>
            <ContextMenuItem>Row below</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
      </ContextMenuContent>
    </ContextMenu>
  )
}
```

### Kept mounted

```tsx title="components/context-menu-7.tsx"
// import from your project: import Demo from '@/components/context-menu-7'
'use client'

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@gentleduck/registry-ui/context-menu'

export default function Demo() {
  return (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm">
        Right-click here
      </ContextMenuTrigger>
      <ContextMenuContent className="data-[state=closed]:hidden" forceMount>
        <ContextMenuItem>Kept in the page while closed</ContextMenuItem>
        <ContextMenuItem>for an animation of your own</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
```

## Component Composition

## Behavior

* Right-click the trigger area to open the menu. On touch and pen, hold for 700ms without moving more than 10px.
* Left-click does not open the menu.
* Right-clicking or control-clicking while the menu is open closes it.
* Right-clicking outside closes the menu and allows the native browser menu to appear.
* With trigger areas nested inside each other, only the innermost one opens.

## Shortcuts and a controlled menu

A `ContextMenuShortcut` with `keys` spells them out for the platform, the Command symbol on a Mac and `Ctrl` elsewhere, and with `onKeysPressed` it also runs on them while the menu is open. `closeOnSelect={false}` keeps the menu open after an item is chosen, which suits a setting toggled in place. `open` and `onOpenChange` hand the open state to you.

```tsx title="components/context-menu-4.tsx"
// import from your project: import Demo from '@/components/context-menu-4'
'use client'

import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from '@gentleduck/registry-ui/context-menu'
import * as React from 'react'

export default function Demo() {
  const [open, setOpen] = React.useState(false)
  const [snap, setSnap] = React.useState(true)
  const [last, setLast] = React.useState('nothing yet')

  return (
    <div className="flex flex-col items-center gap-3">
      <ContextMenu onOpenChange={setOpen} open={open}>
        <ContextMenuTrigger className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm">
          Right click the canvas
        </ContextMenuTrigger>
        <ContextMenuContent className="w-60">
          <ContextMenuItem onSelect={() => setLast('duplicate')}>
            Duplicate
            <ContextMenuShortcut keys="mod+shift+d" onKeysPressed={() => setLast('duplicate, from its keys')} />
          </ContextMenuItem>
          <ContextMenuItem onSelect={() => setLast('group')}>
            Group
            <ContextMenuShortcut keys="mod+shift+g" onKeysPressed={() => setLast('group, from its keys')} />
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuCheckboxItem checked={snap} closeOnSelect={false} onCheckedChange={setSnap}>
            Snap to grid
          </ContextMenuCheckboxItem>
        </ContextMenuContent>
      </ContextMenu>
      <p className="text-muted-foreground text-sm">
        Menu {open ? 'open' : 'closed'}, snap {snap ? 'on' : 'off'}, last: {last}
      </p>
    </div>
  )
}
```

## Non-modal and disabled

`modal={false}` leaves the page scrollable and clickable while the menu is open, and a press outside still closes it. A disabled `ContextMenuTrigger` lets the browser's own menu show instead.

```tsx title="components/context-menu-5.tsx"
// import from your project: import Demo from '@/components/context-menu-5'
'use client'

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@gentleduck/registry-ui/context-menu'
import { Label } from '@gentleduck/registry-ui/label'
import { Switch } from '@gentleduck/registry-ui/switch'
import * as React from 'react'

export default function Demo() {
  const [custom, setCustom] = React.useState(true)

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-2">
        <Switch checked={custom} id="custom-menu-switch" onCheckedChange={setCustom} />
        <Label htmlFor="custom-menu-switch">Custom menu: {custom ? 'on' : 'off, the browser menu shows'}</Label>
      </div>
      <ContextMenu modal={false}>
        <ContextMenuTrigger
          className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm data-[disabled]:opacity-60"
          disabled={!custom}>
          Right click here, then scroll the page
        </ContextMenuTrigger>
        <ContextMenuContent className="w-48">
          <ContextMenuItem>Open link</ContextMenuItem>
          <ContextMenuItem>Copy link</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  )
}
```

## RTL Support

Set the direction once with `DirectionProvider` (or `<html dir="rtl">`) and the context menu follows. It opens to the left of the pointer, sub-menus open to the left, and the arrow keys that open and close sub-menus swap.

```tsx title="components/context-menu-2.tsx"
// import from your project: import Demo from '@/components/context-menu-2'
'use client'

import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@gentleduck/registry-ui/context-menu'
import { DirectionProvider } from '@gentleduck/registry-ui/direction'
import * as React from 'react'

export default function Demo() {
  const [showBookmarks, setShowBookmarks] = React.useState(true)
  const [showFullUrls, setShowFullUrls] = React.useState(false)
  const [person, setPerson] = React.useState('ahmad')

  return (
    <DirectionProvider dir="rtl">
      <ContextMenu>
        <ContextMenuTrigger className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm">
          انقر بزر الفأرة الأيمن هنا
        </ContextMenuTrigger>
        <ContextMenuContent className="w-64">
          <ContextMenuItem inset>
            رجوع
            <ContextMenuShortcut>⌘[</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem disabled inset>
            تقدّم
            <ContextMenuShortcut>⌘]</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem inset>
            إعادة التحميل
            <ContextMenuShortcut>⌘R</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuSub>
            <ContextMenuSubTrigger inset>مزيد من الأدوات</ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48">
              <ContextMenuItem>
                حفظ الصفحة باسم...
                <ContextMenuShortcut>⇧⌘S</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem>إنشاء اختصار...</ContextMenuItem>
              <ContextMenuItem>تسمية النافذة...</ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem>أدوات المطوّرين</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuSeparator />
          <ContextMenuCheckboxItem checked={showBookmarks} onCheckedChange={setShowBookmarks}>
            إظهار شريط الإشارات
            <ContextMenuShortcut>⌘⇧B</ContextMenuShortcut>
          </ContextMenuCheckboxItem>
          <ContextMenuCheckboxItem checked={showFullUrls} onCheckedChange={setShowFullUrls}>
            إظهار الروابط كاملة
          </ContextMenuCheckboxItem>
          <ContextMenuSeparator />
          <ContextMenuRadioGroup value={person} onValueChange={setPerson}>
            <ContextMenuLabel inset>الأشخاص</ContextMenuLabel>
            <ContextMenuSeparator />
            <ContextMenuRadioItem value="ahmad">أحمد خالد</ContextMenuRadioItem>
            <ContextMenuRadioItem value="sara">سارة محمد</ContextMenuRadioItem>
          </ContextMenuRadioGroup>
        </ContextMenuContent>
      </ContextMenu>
    </DirectionProvider>
  )
}
```

## Motion

} title="Alpha: Motion Compositions" tone="warning">
  Motion components work standalone, but some compositions may behave unexpectedly: this is still under active development. If you find a broken composition, please [file an issue](https://github.com/gentleeduck/gentleduck/issues).

Use `MotionContextMenu` and `MotionContextMenuContent` for smooth enter/exit animations powered by [motion](https://motion.dev). It grows from the corner at the cursor, whichever way the menu flips to fit. For animated sub-menus, use `MotionContextMenuSub` and `MotionContextMenuSubContent`.

```tsx title="components/context-menu-3.tsx"
// import from your project: import Demo from '@/components/context-menu-3'
'use client'

import {
  ContextMenuCheckboxItem,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
  MotionContextMenu,
  MotionContextMenuContent,
  MotionContextMenuSub,
  MotionContextMenuSubContent,
} from '@gentleduck/registry-ui/context-menu'
import * as React from 'react'

export default function Demo() {
  const [showBookmarks, setShowBookmarks] = React.useState(true)
  const [showFullUrls, setShowFullUrls] = React.useState(false)
  const [person, setPerson] = React.useState('pedro')

  return (
    <MotionContextMenu>
      <ContextMenuTrigger className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm">
        Right click here
      </ContextMenuTrigger>
      <MotionContextMenuContent className="w-64">
        <ContextMenuItem inset>
          Back
          <ContextMenuShortcut>⌘[</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem disabled inset>
          Forward
          <ContextMenuShortcut>⌘]</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem inset>
          Reload
          <ContextMenuShortcut>⌘R</ContextMenuShortcut>
        </ContextMenuItem>
        <MotionContextMenuSub>
          <ContextMenuSubTrigger inset>More Tools</ContextMenuSubTrigger>
          <MotionContextMenuSubContent className="w-48">
            <ContextMenuItem>
              Save Page As...
              <ContextMenuShortcut>⇧⌘S</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem>Create Shortcut...</ContextMenuItem>
            <ContextMenuItem>Name Window...</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem>Developer Tools</ContextMenuItem>
          </MotionContextMenuSubContent>
        </MotionContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuCheckboxItem checked={showBookmarks} onCheckedChange={setShowBookmarks}>
          Show Bookmarks Bar
          <ContextMenuShortcut>⌘⇧B</ContextMenuShortcut>
        </ContextMenuCheckboxItem>
        <ContextMenuCheckboxItem checked={showFullUrls} onCheckedChange={setShowFullUrls}>
          Show Full URLs
        </ContextMenuCheckboxItem>
        <ContextMenuSeparator />
        <ContextMenuRadioGroup value={person} onValueChange={setPerson}>
          <ContextMenuLabel inset>People</ContextMenuLabel>
          <ContextMenuSeparator />
          <ContextMenuRadioItem value="pedro">Pedro Duarte</ContextMenuRadioItem>
          <ContextMenuRadioItem value="colm">Colm Tuite</ContextMenuRadioItem>
        </ContextMenuRadioGroup>
      </MotionContextMenuContent>
    </MotionContextMenu>
  )
}
```

}>
  Requires the `motion` package. Use `MotionContextMenu` instead of `ContextMenu` and `MotionContextMenuContent` instead of `ContextMenuContent`. For sub-menus, use `MotionContextMenuSub` and `MotionContextMenuSubContent`. All other sub-components stay the same.

## API Reference

Components in this file wrap `@gentleduck/primitives/context-menu`.

### ContextMenu

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | - | Context menu content (trigger + menu content) |
| `modal` | `boolean` | `true` | Whether interaction outside the menu is blocked while open |
| `dir` | `'ltr' \| 'rtl'` | - | Text direction of the menu, resolved by primitives `useDirection` (`dir` prop -> `DirectionProvider` -> `<html dir>`). The trigger area keeps the page's. |
| `open` | `boolean` | - | Controlled open state. Open the menu from a right-click and use this to close it: set to `true` first, it opens at the top-left corner of the viewport and warns in development. |
| `onOpenChange` | `(open: boolean) => void` | - | Callback fired when open state changes |
| `...props` | `React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Root>` | - | Additional props inherited from `ContextMenuPrimitive.Root` |

### ContextMenuTrigger

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `disabled` | `boolean` | `false` | Disables custom context-menu behavior and falls back to native behavior |
| `children` | `React.ReactNode` | - | Trigger area content |
| `...props` | `React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Trigger>` | - | Additional props inherited from `ContextMenuPrimitive.Trigger` |

### ContextMenuPortal

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `container` | `Element \| DocumentFragment \| RefObject \| null` | `document.body` | Optional portal container |
| `...props` | `React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Portal>` | - | Additional props inherited from `ContextMenuPrimitive.Portal` |

### ContextMenuContent

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional CSS classes |
| `children` | `React.ReactNode` | - | Menu items and groups |
| `forceMount` | `true` | - | Keeps the content in the page while closed, as `data-state="closed"`, for an exit animation to run on |
| `...props` | `React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Content>` | - | Additional props inherited from `ContextMenuPrimitive.Content` |

`ContextMenuContent` is positioned by the primitive as `side="right"`, `align="start"`, and `sideOffset={2}`. It scrolls when taller than the space it has, and so does `ContextMenuSubContent`.

### ContextMenuItem

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `inset` | `boolean` | `false` | Adds start padding for alignment with items that render indicators/icons |
| `onSelect` | `(event: Event) => void` | - | Called when the item is chosen. `event.preventDefault()` keeps the menu open |
| `closeOnSelect` | `boolean` | `true` | Closes the menu once the item is chosen. Checkbox and radio items take it too |
| `disabled` | `boolean` | `false` | Skipped by the keyboard and ignores clicks |
| `className` | `string` | - | Additional CSS classes |
| `...props` | `React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Item>` | - | Additional props inherited from `ContextMenuPrimitive.Item` |

### ContextMenuCheckboxItem

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `checked` | `boolean` | - | Controlled checked state |
| `onCheckedChange` | `(checked: boolean) => void` | - | Callback when checked state changes |
| `...props` | `React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.CheckboxItem>` | - | Additional props inherited from `ContextMenuPrimitive.CheckboxItem` |

### ContextMenuRadioGroup

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | - | Controlled selected value |
| `onValueChange` | `(value: string) => void` | - | Callback when selected value changes |
| `...props` | `React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.RadioGroup>` | - | Additional props inherited from `ContextMenuPrimitive.RadioGroup` |

### ContextMenuRadioItem

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | (required) | Value represented by this radio item |
| `...props` | `React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.RadioItem>` | - | Additional props inherited from `ContextMenuPrimitive.RadioItem` |

### ContextMenuLabel

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `inset` | `boolean` | `false` | Adds start padding for alignment with items |
| `className` | `string` | - | Additional CSS classes |
| `...props` | `React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Label>` | - | Additional props inherited from `ContextMenuPrimitive.Label` |

### ContextMenuSeparator

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional CSS classes |
| `...props` | `React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Separator>` | - | Additional props inherited from `ContextMenuPrimitive.Separator` |

### ContextMenuShortcut

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `keys` | `string` | - | Keyboard shortcut (for example, `"mod+shift+d"`, Cmd on a Mac and Ctrl elsewhere). Shown for the platform when there are no `children` |
| `onKeysPressed` | `() => void` | - | Runs on `keys` while the shortcut is mounted, that is while the menu is open |
| `className` | `string` | - | Additional CSS classes |
| `children` | `React.ReactNode` | - | Shortcut hint content (for example, `⌘K`), shown in place of `keys` |
| `...props` | `React.HTMLAttributes<HTMLSpanElement>` | - | Additional props to spread to the shortcut `<span>` |

### ContextMenuGroup

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional CSS classes |
| `children` | `React.ReactNode` | - | Group content |
| `...props` | `React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Group>` | - | Additional props inherited from `ContextMenuPrimitive.Group` |

### ContextMenuSub

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | - | Sub-trigger and sub-content elements |
| `...props` | `React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Sub>` | - | Additional props inherited from `ContextMenuPrimitive.Sub` |

### ContextMenuSubTrigger

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `inset` | `boolean` | `false` | Adds start padding for alignment |
| `className` | `string` | - | Additional CSS classes |
| `...props` | `React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubTrigger>` | - | Additional props inherited from `ContextMenuPrimitive.SubTrigger` |

### ContextMenuSubContent

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional CSS classes |
| `sideOffset` | `number` | - | Main-axis offset from sub-trigger |
| `alignOffset` | `number` | - | Cross-axis offset from sub-trigger |
| `...props` | `React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubContent>` | - | Additional props inherited from `ContextMenuPrimitive.SubContent` |

### MotionContextMenu

Same props as `ContextMenu`, a controlled `open` included. Wraps with `useMotionRoot` for exit animation support. Requires the `motion` package.

### MotionContextMenuContent

Same props as `ContextMenuContent`. Adds scale, blur, and opacity enter/exit animation with springBouncy transition, from the corner at the cursor. Requires the `motion` package.

### MotionContextMenuSub

Same props as `ContextMenuSub`. Wraps sub-menu with `useMotionRoot` for exit animation support. Requires the `motion` package.

### MotionContextMenuSubContent

Same props as `ContextMenuSubContent`. Adds scale and blur enter/exit animation in a Portal. Requires the `motion` package.