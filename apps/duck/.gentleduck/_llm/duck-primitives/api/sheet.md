```tsx
import * as Sheet from '@gentleduck/primitives/sheet'
```

## Anatomy

```tsx
<Sheet.Root>
  <Sheet.Trigger />
  <Sheet.Portal>
    <Sheet.Overlay />
    <Sheet.Content>
      <Sheet.Title />
      <Sheet.Description />
      <Sheet.Close />
    </Sheet.Content>
  </Sheet.Portal>
</Sheet.Root>
```

***

## Usage

```tsx
import * as Sheet from '@gentleduck/primitives/sheet'

function SettingsSheet() {
  return (
    <Sheet.Root>
      <Sheet.Trigger className="px-3 py-2 rounded border">Open settings</Sheet.Trigger>
      <Sheet.Portal>
        <Sheet.Overlay className="fixed inset-0 bg-black/50" />
        <Sheet.Content className="fixed end-0 top-0 h-full w-[400px] bg-white p-6 shadow-xl">
          <Sheet.Title className="text-lg font-semibold">Settings</Sheet.Title>
          <Sheet.Description className="mt-2 text-sm text-gray-500">
            Configure your account and interface preferences.
          </Sheet.Description>
          <Sheet.Close className="mt-6 px-3 py-2 rounded border">Close</Sheet.Close>
        </Sheet.Content>
      </Sheet.Portal>
    </Sheet.Root>
  )
}
```

***

## Examples

### From the side

```tsx title="components/sheet-side.tsx"
// import from your project: import Demo from '@/components/sheet-side'
'use client'

import * as Sheet from '@gentleduck/primitives/sheet'
import styles from '../primitives.module.css'

export default function SheetSideExample() {
  return (
    <Sheet.Root>
      <Sheet.Trigger className={styles.button}>Open filters</Sheet.Trigger>
      <Sheet.Portal>
        <Sheet.Overlay className={`${styles.overlay} ${styles.fade}`} />
        <Sheet.Content className={styles.sheet}>
          <Sheet.Title className={styles.title}>Filters</Sheet.Title>
          <Sheet.Description className={styles.description}>Narrow the results.</Sheet.Description>
          <label className={styles.choice}>
            <input type="checkbox" /> In stock only
          </label>
          <Sheet.Close className={styles.button}>Apply</Sheet.Close>
        </Sheet.Content>
      </Sheet.Portal>
    </Sheet.Root>
  )
}
```

### From the bottom

```tsx title="components/sheet-bottom.tsx"
// import from your project: import Demo from '@/components/sheet-bottom'
'use client'

import * as Sheet from '@gentleduck/primitives/sheet'
import styles from '../primitives.module.css'

export default function SheetBottomExample() {
  return (
    <Sheet.Root>
      <Sheet.Trigger className={styles.button}>Share</Sheet.Trigger>
      <Sheet.Portal>
        <Sheet.Overlay className={`${styles.overlay} ${styles.fade}`} />
        <Sheet.Content
          aria-describedby={undefined}
          className={styles.sheet}
          style={{
            borderInlineStart: 0,
            borderTop: '1px solid var(--border)',
            insetBlock: 'auto 0',
            insetInline: 0,
            width: 'auto',
          }}>
          <Sheet.Title className={styles.title}>Share to</Sheet.Title>
          <div className={styles.row}>
            {['Mail', 'Messages', 'Copy link'].map((target) => (
              <Sheet.Close className={styles.button} key={target}>
                {target}
              </Sheet.Close>
            ))}
          </div>
        </Sheet.Content>
      </Sheet.Portal>
    </Sheet.Root>
  )
}
```

### Controlled

```tsx title="components/sheet-controlled.tsx"
// import from your project: import Demo from '@/components/sheet-controlled'
'use client'

import * as Sheet from '@gentleduck/primitives/sheet'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function SheetControlledExample() {
  const [open, setOpen] = React.useState(false)
  const [items, setItems] = React.useState(2)

  return (
    <Sheet.Root onOpenChange={setOpen} open={open}>
      <button className={styles.button} onClick={() => setItems((count) => count + 1)} type="button">
        Add to cart ({items})
      </button>
      <Sheet.Trigger className={styles.button}>View cart</Sheet.Trigger>
      <Sheet.Portal>
        <Sheet.Overlay className={`${styles.overlay} ${styles.fade}`} />
        <Sheet.Content aria-describedby={undefined} className={styles.sheet}>
          <Sheet.Title className={styles.title}>Cart, {items} items</Sheet.Title>
          <button
            className={`${styles.button} ${styles.primary}`}
            onClick={() => {
              setItems(0)
              setOpen(false)
            }}
            type="button">
            Check out
          </button>
        </Sheet.Content>
      </Sheet.Portal>
    </Sheet.Root>
  )
}
```

### Right to left

```tsx title="components/sheet-rtl.tsx"
// import from your project: import Demo from '@/components/sheet-rtl'
'use client'

import * as Sheet from '@gentleduck/primitives/sheet'
import styles from '../primitives.module.css'

export default function SheetRtlExample() {
  return (
    <Sheet.Root dir="rtl">
      <Sheet.Trigger className={styles.button}>القائمة</Sheet.Trigger>
      <Sheet.Portal>
        <Sheet.Overlay className={`${styles.overlay} ${styles.fade}`} />
        <Sheet.Content aria-describedby={undefined} className={styles.sheet}>
          <Sheet.Title className={styles.title}>القائمة</Sheet.Title>
          <Sheet.Close className={styles.button}>إغلاق</Sheet.Close>
        </Sheet.Content>
      </Sheet.Portal>
    </Sheet.Root>
  )
}
```

***

## API notes

`@gentleduck/primitives/sheet` is an alias layer over `@gentleduck/primitives/dialog`.

* behavior, accessibility, and focus management are the same as Dialog
* `Sheet.*` and `Dialog.*` map to the same underlying primitives
* the content writes `dir`, from the root's `dir`, then a `DirectionProvider`, then `<html dir>`, so a panel placed with `start-0` or `end-0` mirrors in right to left, even when portalled out of the provider
* a sheet opened from a dialog's content, or a dialog from a sheet's, is a [nested dialog](/duck-primitives/api/dialog#nested-dialogs)
* `Sheet.Content` takes `initialFocus`, `finalFocus` and `forceMount`, and `Sheet.Portal` takes a ref as its `container`, as Dialog's parts do

## API Mapping

| Sheet export | Backed by |
| --- | --- |
| `Sheet` / `Root` | `Dialog` |
| `Trigger` | `DialogTrigger` |
| `Portal` | `DialogPortal` |
| `Overlay` | `DialogOverlay` |
| `Content` | `DialogContent` |
| `Title` | `DialogTitle` |
| `Description` | `DialogDescription` |
| `Close` | `DialogClose` |

Each part is also exported under its sheet name, such as `SheetContent` for `Content`.

Additional exports:

* `createSheetScope` (alias of `createDialogScope`)
* the `ISheet` namespace of prop types, such as `ISheet.IContentProps`, each the matching `IDialog` type

***

## Keyboard interactions

Same behavior as Dialog:

| Key | Action |
| --- | --- |
| <Kbd>Space</Kbd> / <Kbd>Enter</Kbd> | Opens sheet (on Trigger) |
| <Kbd>Tab</Kbd> | Cycles focus inside sheet content |
| <Kbd>Shift+Tab</Kbd> | Reverse focus cycle |
| <Kbd>Escape</Kbd> | Closes sheet |

For full prop-level details, see [Dialog API](/duck-primitives/api/dialog).