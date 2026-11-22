```tsx title="components/menubar-1.tsx"
// import from your project: import Demo from '@/components/menubar-1'
'use client'

import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from '@gentleduck/registry-ui/menubar'
import * as React from 'react'

export default function Demo() {
  const [showBookmarks, setShowBookmarks] = React.useState(false)
  const [showFullUrls, setShowFullUrls] = React.useState(true)
  const [profile, setProfile] = React.useState('benoit')

  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            New Tab
            <MenubarShortcut>⌘T</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            New Window
            <MenubarShortcut>⌘N</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled>New Incognito Window</MenubarItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>Share</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>Email link</MenubarItem>
              <MenubarItem>Messages</MenubarItem>
              <MenubarItem>Notes</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem>
            Print... <MenubarShortcut>⌘P</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            Undo <MenubarShortcut>⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>Find</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>Search the web</MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Find...</MenubarItem>
              <MenubarItem>Find Next</MenubarItem>
              <MenubarItem>Find Previous</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem>Cut</MenubarItem>
          <MenubarItem>Copy</MenubarItem>
          <MenubarItem>Paste</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarCheckboxItem checked={showBookmarks} onCheckedChange={setShowBookmarks}>
            Always Show Bookmarks Bar
          </MenubarCheckboxItem>
          <MenubarCheckboxItem checked={showFullUrls} onCheckedChange={setShowFullUrls}>
            Always Show Full URLs
          </MenubarCheckboxItem>
          <MenubarSeparator />
          <MenubarItem inset>
            Reload <MenubarShortcut>⌘R</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled inset>
            Force Reload <MenubarShortcut>⇧⌘R</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem inset>Toggle Fullscreen</MenubarItem>
          <MenubarSeparator />
          <MenubarItem inset>Hide Sidebar</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Profiles</MenubarTrigger>
        <MenubarContent>
          <MenubarRadioGroup value={profile} onValueChange={setProfile}>
            <MenubarRadioItem value="andy">Andy</MenubarRadioItem>
            <MenubarRadioItem value="benoit">Benoit</MenubarRadioItem>
            <MenubarRadioItem value="Luis">Luis</MenubarRadioItem>
          </MenubarRadioGroup>
          <MenubarSeparator />
          <MenubarItem inset>Edit...</MenubarItem>
          <MenubarSeparator />
          <MenubarItem inset>Add Profile...</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  )
}
```

## Philosophy

Menubars bring desktop-application navigation patterns to the web. The keyboard model (arrow keys between menus, type-ahead navigation, submenu traversal) follows established platform conventions and is powered by `@gentleduck/primitives/menubar`.

## Installation

CLI
Manual

```bash
npx @gentleduck/cli add menubar
```

Install the following dependencies:

```bash
npm install @gentleduck/libs @gentleduck/motion @gentleduck/primitives lucide-react
```

Copy and paste the following code into your project.

Update the import paths to match your project setup.

## Usage

```tsx showLineNumbers
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar"
```

```tsx showLineNumbers
<Menubar>
  <MenubarMenu>
    <MenubarTrigger>File</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>
        New Tab <MenubarShortcut>⌘T</MenubarShortcut>
      </MenubarItem>
      <MenubarItem>New Window</MenubarItem>
      <MenubarSeparator />
      <MenubarItem>Share</MenubarItem>
      <MenubarSeparator />
      <MenubarItem>Print</MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</Menubar>
```

## Examples

### Shortcuts and a controlled bar

`MenubarShortcut` with `keys` spells the keys out for the platform, and with `onKeysPressed` runs it on them while its menu is open, with no `KeyProvider` needed. `value` and `onValueChange` hold which menu is open, so an item can open another menu. `closeOnSelect={false}` keeps a menu open after an item.

```tsx title="components/menubar-5.tsx"
// import from your project: import Demo from '@/components/menubar-5'
'use client'

import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from '@gentleduck/registry-ui/menubar'
import * as React from 'react'

export default function Demo() {
  const [menu, setMenu] = React.useState('')
  const [wrap, setWrap] = React.useState(true)
  const [last, setLast] = React.useState('nothing yet')

  return (
    <div className="flex flex-col items-center gap-3">
      <Menubar onValueChange={setMenu} value={menu}>
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onSelect={() => setLast('save')}>
              Save
              <MenubarShortcut keys="mod+s" onKeysPressed={() => setLast('save, from its keys')} />
            </MenubarItem>
            <MenubarItem onSelect={() => setLast('export')}>
              Export
              <MenubarShortcut keys="mod+shift+e" onKeysPressed={() => setLast('export, from its keys')} />
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu value="view">
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarContent>
            <MenubarCheckboxItem checked={wrap} closeOnSelect={false} onCheckedChange={setWrap}>
              Word wrap
            </MenubarCheckboxItem>
            <MenubarSeparator />
            <MenubarItem onSelect={() => setMenu('file')}>Go to the File menu</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
      <p className="text-muted-foreground text-sm">
        Open: {menu || 'none'}, wrap {wrap ? 'on' : 'off'}, last: {last}
      </p>
    </div>
  )
}
```

### Modal and disabled

`modal` keeps a click outside an open menu from reaching the page, `disabled` on the bar shuts every menu, and `disabled` on one trigger shuts that menu alone. Arrow keys and the pointer pass over a disabled trigger, so an open menu stays open while the pointer crosses it.

```tsx title="components/menubar-6.tsx"
// import from your project: import Demo from '@/components/menubar-6'
'use client'

import { Label } from '@gentleduck/registry-ui/label'
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from '@gentleduck/registry-ui/menubar'
import { Switch } from '@gentleduck/registry-ui/switch'
import * as React from 'react'

export default function Demo() {
  const [modal, setModal] = React.useState(false)
  const [locked, setLocked] = React.useState(false)

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-6">
        <div className="flex items-center gap-2">
          <Switch checked={modal} id="menubar-modal" onCheckedChange={setModal} />
          <Label htmlFor="menubar-modal">Modal</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={locked} id="menubar-locked" onCheckedChange={setLocked} />
          <Label htmlFor="menubar-locked">Lock the bar</Label>
        </div>
      </div>
      <Menubar disabled={locked} modal={modal}>
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>New Tab</MenubarItem>
            <MenubarItem>New Window</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu value="edit">
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Undo</MenubarItem>
            <MenubarItem>Redo</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu value="help">
          <MenubarTrigger disabled>Help</MenubarTrigger>
        </MenubarMenu>
      </Menubar>
      <p className="max-w-64 text-center text-muted-foreground text-sm">
        {modal
          ? 'A click outside closes the menu and goes no further.'
          : 'The page still takes clicks while a menu is open.'}
      </p>
    </div>
  )
}
```

### Groups, no looping and open events

```tsx title="components/menubar-7.tsx"
// import from your project: import Demo from '@/components/menubar-7'
'use client'

import {
  Menubar,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from '@gentleduck/registry-ui/menubar'
import * as React from 'react'

export default function Demo() {
  const [log, setLog] = React.useState<string[]>([])
  const record = (menu: string) => (open: boolean) =>
    setLog((entries) => [`${menu} ${open ? 'opened' : 'closed'}`, ...entries].slice(0, 3))

  return (
    <div className="flex flex-col items-center gap-3">
      <Menubar defaultValue="" loop={false}>
        <MenubarMenu onOpenChange={record('File')} value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarGroup>
              <MenubarLabel>Recent</MenubarLabel>
              <MenubarItem>notes.md</MenubarItem>
              <MenubarItem>todo.md</MenubarItem>
            </MenubarGroup>
            <MenubarSeparator />
            <MenubarItem>Close window</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu onOpenChange={record('Help')} value="help">
          <MenubarTrigger>Help</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Documentation</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
      <p className="text-muted-foreground text-sm">
        {log.join(', ') || 'loop off stops the arrow keys at either end of the bar.'}
      </p>
    </div>
  )
}
```

### Content and submenu offsets

```tsx title="components/menubar-8.tsx"
// import from your project: import Demo from '@/components/menubar-8'
'use client'

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from '@gentleduck/registry-ui/menubar'

export default function Demo() {
  return (
    <Menubar>
      <MenubarMenu value="view">
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent align="center" alignOffset={0} side="bottom" sideOffset={12}>
          <MenubarItem>Centered under its trigger, 12px down</MenubarItem>
          <MenubarSub>
            <MenubarSubTrigger>Panels</MenubarSubTrigger>
            <MenubarSubContent alignOffset={-4} sideOffset={6}>
              <MenubarItem>Explorer</MenubarItem>
              <MenubarItem>Terminal</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  )
}
```

### Kept mounted

```tsx title="components/menubar-9.tsx"
// import from your project: import Demo from '@/components/menubar-9'
'use client'

import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from '@gentleduck/registry-ui/menubar'

export default function Demo() {
  return (
    <Menubar>
      <MenubarMenu value="edit">
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent className="data-[state=closed]:hidden" forceMount>
          <MenubarItem>Undo</MenubarItem>
          <MenubarItem>Redo</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  )
}
```

### Into an element of your own

```tsx title="components/menubar-10.tsx"
// import from your project: import Demo from '@/components/menubar-10'
'use client'

import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from '@gentleduck/registry-ui/menubar'
import * as React from 'react'

export default function Demo() {
  const panel = React.useRef<HTMLDivElement>(null)

  return (
    <div
      className="dark flex flex-col items-center gap-4 rounded-md border bg-background p-4 text-foreground"
      ref={panel}>
      <Menubar>
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent container={panel}>
            <MenubarItem>New tab</MenubarItem>
            <MenubarItem>New window</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
      <p className="text-muted-foreground text-sm">The menu portals into this dark panel.</p>
    </div>
  )
}
```

## Component Composition

## RTL Support

Set the direction once with `DirectionProvider` (or `<html dir="rtl">`) and the menubar follows. Menus align to the right edge of their triggers, sub-menus open to the left, and `ArrowLeft`/`ArrowRight` move between menus in visual order.

```tsx title="components/menubar-2.tsx"
// import from your project: import Demo from '@/components/menubar-2'
'use client'

import { DirectionProvider } from '@gentleduck/registry-ui/direction'
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from '@gentleduck/registry-ui/menubar'
import * as React from 'react'

export default function Demo() {
  const [showBookmarks, setShowBookmarks] = React.useState(false)
  const [showFullUrls, setShowFullUrls] = React.useState(true)
  const [profile, setProfile] = React.useState('ahmad')

  return (
    <DirectionProvider dir="rtl">
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>ملف</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>
              علامة تبويب جديدة
              <MenubarShortcut>⌘T</MenubarShortcut>
            </MenubarItem>
            <MenubarItem>
              نافذة جديدة
              <MenubarShortcut>⌘N</MenubarShortcut>
            </MenubarItem>
            <MenubarItem disabled>نافذة جديدة للتصفح المتخفي</MenubarItem>
            <MenubarSeparator />
            <MenubarSub>
              <MenubarSubTrigger>مشاركة</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem>رابط عبر البريد الإلكتروني</MenubarItem>
                <MenubarItem>الرسائل</MenubarItem>
                <MenubarItem>الملاحظات</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
            <MenubarSeparator />
            <MenubarItem>
              طباعة... <MenubarShortcut>⌘P</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>تحرير</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>
              تراجع <MenubarShortcut>⌘Z</MenubarShortcut>
            </MenubarItem>
            <MenubarItem>
              إعادة <MenubarShortcut>⇧⌘Z</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarSub>
              <MenubarSubTrigger>بحث</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem>البحث في الويب</MenubarItem>
                <MenubarSeparator />
                <MenubarItem>بحث...</MenubarItem>
                <MenubarItem>البحث عن التالي</MenubarItem>
                <MenubarItem>البحث عن السابق</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
            <MenubarSeparator />
            <MenubarItem>قص</MenubarItem>
            <MenubarItem>نسخ</MenubarItem>
            <MenubarItem>لصق</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>عرض</MenubarTrigger>
          <MenubarContent>
            <MenubarCheckboxItem checked={showBookmarks} onCheckedChange={setShowBookmarks}>
              إظهار شريط الإشارات دائمًا
            </MenubarCheckboxItem>
            <MenubarCheckboxItem checked={showFullUrls} onCheckedChange={setShowFullUrls}>
              إظهار الروابط كاملة دائمًا
            </MenubarCheckboxItem>
            <MenubarSeparator />
            <MenubarItem inset>
              إعادة التحميل <MenubarShortcut>⌘R</MenubarShortcut>
            </MenubarItem>
            <MenubarItem disabled inset>
              فرض إعادة التحميل <MenubarShortcut>⇧⌘R</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem inset>تبديل وضع ملء الشاشة</MenubarItem>
            <MenubarSeparator />
            <MenubarItem inset>إخفاء الشريط الجانبي</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>الملفات الشخصية</MenubarTrigger>
          <MenubarContent>
            <MenubarRadioGroup value={profile} onValueChange={setProfile}>
              <MenubarRadioItem value="ali">علي</MenubarRadioItem>
              <MenubarRadioItem value="ahmad">أحمد</MenubarRadioItem>
              <MenubarRadioItem value="omar">عمر</MenubarRadioItem>
            </MenubarRadioGroup>
            <MenubarSeparator />
            <MenubarItem inset>تعديل...</MenubarItem>
            <MenubarSeparator />
            <MenubarItem inset>إضافة ملف شخصي...</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </DirectionProvider>
  )
}
```

## Vertical

Set `orientation="vertical"` and the bar stacks its menus. `ArrowUp` and `ArrowDown` move between them, `ArrowRight` opens one beside the bar, and `ArrowLeft` closes it again. Right to left, the menus open on the left and the two side arrows swap.

```tsx title="components/menubar-4.tsx"
// import from your project: import Demo from '@/components/menubar-4'
'use client'

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from '@gentleduck/registry-ui/menubar'

export default function Demo() {
  return (
    <Menubar orientation="vertical" className="w-40">
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            New Tab <MenubarShortcut>⌘T</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>New Window</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Print</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            Undo <MenubarShortcut>⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Reload</MenubarItem>
          <MenubarItem>Toggle Fullscreen</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  )
}
```

## Motion

} title="Alpha: Motion Compositions" tone="warning">
  Motion components work standalone, but some compositions may behave unexpectedly: this is still under active development. If you find a broken composition, please [file an issue](https://github.com/gentleeduck/gentleduck/issues).

Use `MotionMenubarContent` for a `scaleIn` enter animation (fade, scale, and blur) with a bouncy spring transition, powered by [motion](https://motion.dev). A menu closes at once, so moving along the bar never shows two menus at the same time.

```tsx title="components/menubar-3.tsx"
// import from your project: import Demo from '@/components/menubar-3'
'use client'

import {
  Menubar,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
  MotionMenubarContent,
} from '@gentleduck/registry-ui/menubar'

export default function Demo() {
  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MotionMenubarContent>
          <MenubarItem>
            New Tab <MenubarShortcut>⌘T</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            New Window <MenubarShortcut>⌘N</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled>New Incognito Window</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
            Print <MenubarShortcut>⌘P</MenubarShortcut>
          </MenubarItem>
        </MotionMenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Edit</MenubarTrigger>
        <MotionMenubarContent>
          <MenubarItem>
            Undo <MenubarShortcut>⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
            Cut <MenubarShortcut>⌘X</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Copy <MenubarShortcut>⌘C</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Paste <MenubarShortcut>⌘V</MenubarShortcut>
          </MenubarItem>
        </MotionMenubarContent>
      </MenubarMenu>
    </Menubar>
  )
}
```

}>
  Requires the `motion` package. Use `MotionMenubarContent` instead of `MenubarContent`. All other sub-components stay the same.

## API Reference

Components in this file wrap `@gentleduck/primitives/menubar`.

### Menubar

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | `''` | Controlled currently-open menu value |
| `defaultValue` | `string` | `''` | Initial open menu value for uncontrolled usage |
| `onValueChange` | `(value: string) => void` | - | Callback when open menu value changes |
| `loop` | `boolean` | `true` | Loops roving focus across triggers |
| `dir` | `'ltr' \| 'rtl'` | - | Text direction. Resolved by primitives `useDirection` (`dir` prop -> `DirectionProvider` -> `<html dir>`). |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Which way the bar runs. A vertical bar is a column and opens its menus to the side |
| `disabled` | `boolean` | `false` | Disables every trigger in the bar |
| `modal` | `boolean` | `false` | While a menu is open, locks the page's scroll and leaves pointer events to the menu and the bar |
| `className` | `string` | - | Additional CSS classes |
| `...props` | `React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Root>` | - | Additional props inherited from `MenubarPrimitive.Root` |

### MenubarMenu

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | auto-generated | Unique identifier for this menu |
| `onOpenChange` | `(open: boolean) => void` | - | Callback when the menu opens or closes |
| `children` | `React.ReactNode` | - | Trigger and content elements for this menu |
| `...props` | `React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Menu>` | - | Additional props inherited from `MenubarPrimitive.Menu` |

### MenubarTrigger

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional CSS classes |
| `children` | `React.ReactNode` | - | Trigger label/content |
| `...props` | `React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Trigger>` | - | Additional props inherited from `MenubarPrimitive.Trigger` |

### MenubarPortal

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `container` | `Element \| DocumentFragment \| RefObject \| null` | `document.body` | Optional portal container |
| `...props` | `React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Portal>` | - | Additional props inherited from `MenubarPrimitive.Portal` |

`MenubarContent` renders a portal of its own, so pass `container` to `MenubarContent` to place it; `MenubarPortal` is for a content built from the primitive.

### MenubarContent

Scrolls when taller than the space it has.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `container` | `Element \| DocumentFragment \| RefObject \| null` | `document.body` | Where the content portals to, such as an element carrying another theme |
| `className` | `string` | - | Additional CSS classes |
| `forceMount` | `true` | - | Keeps the content in the page while closed, as `data-state="closed"`, for an exit animation to run on |
| `side` | `'top' \| 'right' \| 'bottom' \| 'left'` | `'bottom'`, or `'right'` in a vertical bar | Preferred side relative to the trigger. `right` and `left` mirror right to left |
| `align` | `'start' \| 'center' \| 'end'` | `'start'` | Alignment on the chosen side |
| `sideOffset` | `number` | `8` | Main-axis offset from trigger |
| `alignOffset` | `number` | `-4` | Cross-axis offset from trigger |
| `...props` | `React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Content>` | - | Additional props inherited from `MenubarPrimitive.Content` |

### MenubarItem

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `inset` | `boolean` | `false` | Adds start padding for alignment with indicators/icons |
| `disabled` | `boolean` | - | Prevents interaction, and the arrow keys pass over the item |
| `onSelect` | `(event: Event) => void` | - | Called when the item is selected by click or keyboard |
| `closeOnSelect` | `boolean` | `true` | Closes the menu once the item is selected. `MenubarCheckboxItem` and `MenubarRadioItem` take it too |
| `className` | `string` | - | Additional CSS classes |
| `...props` | `React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Item>` | - | Additional props inherited from `MenubarPrimitive.Item` |

### MenubarCheckboxItem

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `checked` | `boolean` | - | Controlled checked state |
| `onCheckedChange` | `(checked: boolean) => void` | - | Callback when checked state changes |
| `...props` | `React.ComponentPropsWithoutRef<typeof MenubarPrimitive.CheckboxItem>` | - | Additional props inherited from `MenubarPrimitive.CheckboxItem` |

### MenubarRadioGroup

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | - | Controlled selected value |
| `onValueChange` | `(value: string) => void` | - | Callback when selected value changes |
| `...props` | `React.ComponentPropsWithoutRef<typeof MenubarPrimitive.RadioGroup>` | - | Additional props inherited from `MenubarPrimitive.RadioGroup` |

### MenubarRadioItem

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | (required) | Value represented by this radio item |
| `...props` | `React.ComponentPropsWithoutRef<typeof MenubarPrimitive.RadioItem>` | - | Additional props inherited from `MenubarPrimitive.RadioItem` |

### MenubarLabel

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `inset` | `boolean` | `false` | Adds start padding for alignment |
| `className` | `string` | - | Additional CSS classes |
| `...props` | `React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Label>` | - | Additional props inherited from `MenubarPrimitive.Label` |

### MenubarSeparator

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional CSS classes |
| `...props` | `React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Separator>` | - | Additional props inherited from `MenubarPrimitive.Separator` |

### MenubarShortcut

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `keys` | `string` | - | Keyboard shortcut (for example, `"mod+s"`, Cmd on a Mac and Ctrl elsewhere). Shown for the platform when there are no `children` |
| `onKeysPressed` | `() => void` | - | Runs on `keys` while the shortcut is mounted, that is while its menu is open |
| `className` | `string` | - | Additional CSS classes |
| `children` | `React.ReactNode` | - | Shortcut hint content (for example, `⌘S`), shown in place of `keys` |
| `...props` | `React.HTMLAttributes<HTMLSpanElement>` | - | Additional props to spread to the shortcut `<span>` |

### MenubarGroup

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `...props` | `React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Group>` | - | Additional props inherited from `MenubarPrimitive.Group` |

### MenubarSub

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | - | Sub-trigger and sub-content elements |
| `...props` | `React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Sub>` | - | Additional props inherited from `MenubarPrimitive.Sub` |

### MenubarSubTrigger

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `inset` | `boolean` | `false` | Adds start padding for alignment |
| `className` | `string` | - | Additional CSS classes |
| `...props` | `React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubTrigger>` | - | Additional props inherited from `MenubarPrimitive.SubTrigger` |

### MenubarSubContent

Positioned to the side of the sub-trigger, and scrolls when taller than the space it has.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional CSS classes |
| `sideOffset` | `number` | - | Main-axis offset from sub-trigger |
| `alignOffset` | `number` | - | Cross-axis offset from sub-trigger |
| `...props` | `React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubContent>` | - | Additional props inherited from `MenubarPrimitive.SubContent` |

### MotionMenubarContent

Same props as `MenubarContent`. Adds a `scaleIn` enter animation (fade, scale, and blur) with a bouncy spring transition via motion, growing from its trigger whichever way the menu flips to fit. Requires the `motion` package.