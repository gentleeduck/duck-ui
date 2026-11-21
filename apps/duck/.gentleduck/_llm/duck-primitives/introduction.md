}>
  **gentleduck/primitives** ships interaction behavior with no visual opinions. You own design tokens and styling; the primitives own accessibility, focus, dismissal, and interaction semantics.

## What this package is

gentleduck/primitives is a set of low-level React building blocks for teams that need:

* Correct keyboard and screen reader behavior.
* Composition via `asChild`, slotting, and scoped contexts.
* Controlled and uncontrolled state.
* Animation-aware mount/unmount.
* A path from raw primitive to polished design-system component.

This is not a CSS framework. It is an interaction and accessibility layer.

***

## When to use primitives

Use primitives for:

* A reusable design system across apps.
* Complex overlays (dialogs, popovers, menus).
* UI with strict accessibility requirements.
* Heavy visual customization where pre-styled libraries get in the way.

For quick, fixed styling with minimal customization, use pre-styled components instead.

***

## Capability model

| Layer | Responsibility | Typical primitives |
| --- | --- | --- |
| Foundation | Rendering abstraction and composition | [Primitive Elements](/duck-primitives/api/primitive-elements), [Slot](/duck-primitives/api/slot), [Direction](/duck-primitives/api/direction) |
| Interaction infra | Focus, dismissal, mounting, positioning | [Focus Scope](/duck-primitives/api/focus-scope), [Dismissable Layer](/duck-primitives/api/dismissable-layer), [Presence](/duck-primitives/api/presence), [Portal](/duck-primitives/api/portal), [Popper](/duck-primitives/api/popper) |
| Product patterns | Overlays, menus, inputs, selection | [Dialog](/duck-primitives/api/dialog), [Popover](/duck-primitives/api/popover), [Menu](/duck-primitives/api/menu), [Select](/duck-primitives/api/select), [Slider](/duck-primitives/api/slider) |

This layering is why primitives scale in large codebases.

***

## How teams usually adopt

1. Start with one high-value wrapper (`Dialog`, `Popover`, `Menu`).
2. Standardize wrapper rules: `forwardRef`, `className` merge, defaults, no hidden primitive props.
3. Add design tokens and motion classes via `data-state`.
4. Document wrapper contracts in your design-system package.
5. Add more primitives once keyboard and screen reader tests pass.

}>
  Build wrappers once; consume wrappers everywhere. Avoid copying examples ad hoc into apps.

***

## Bundle size

Every gentleduck primitive but Dialog and Alert Dialog is smaller than its Radix equivalent, by 1% to 64% gzipped; those two are 1% and 2% larger. Measured sizes: Toggle Group 4.8 KB vs 8.2 KB, Accordion 4.7 KB vs 8.6 KB, Dialog 13.5 KB vs 13.4 KB, Popover 23.6 KB vs 23.8 KB.

See [benchmark results](/duck-primitives/benchmarks) for per-component numbers and methodology.

***

## Architecture snapshot

Higher-level components compose lower-level ones. Drop one level lower when you need custom behavior.

***

## Production checklist

Before shipping primitive-based wrappers:

* Verify title/description semantics for dialogs.
* Verify keyboard loops and escape behavior.
* Verify focus restoration after close.
* Verify click-outside handling for nested overlays.
* Verify reduced-motion behavior.
* Verify RTL behavior if your app supports Arabic/Hebrew/Persian.

***

## Internal examples

Production patterns from the internal registry.

### 1) Guarded async dialog

```tsx title="components/dialog-guarded-async.tsx"
// import from your project: import Demo from '@/components/dialog-guarded-async'
'use client'

import * as Dialog from '@gentleduck/primitives/dialog'
import * as React from 'react'
import styles from './styles.module.css'

export default function DialogGuardedAsyncInternalExample() {
  const [open, setOpen] = React.useState(false)
  const [busy, setBusy] = React.useState(false)

  async function onConfirm() {
    try {
      setBusy(true)
      await new Promise((resolve) => setTimeout(resolve, 800))
      setOpen(false)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger className={styles.trigger}>Delete project</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content
          className={styles.content}
          onEscapeKeyDown={(event) => {
            if (busy) event.preventDefault()
          }}
          onInteractOutside={(event) => {
            if (busy) event.preventDefault()
          }}>
          <Dialog.Title className={styles.title}>Delete project?</Dialog.Title>
          <Dialog.Description className={styles.description}>This action cannot be undone.</Dialog.Description>
          <div className={styles.actions}>
            <Dialog.Close asChild>
              <button className={styles.secondary} disabled={busy} type="button">
                Cancel
              </button>
            </Dialog.Close>
            <button className={styles.danger} disabled={busy} onClick={onConfirm} type="button">
              {busy ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
```

### 2) Side-aware popover

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

### 3) Dropdown menu selection semantics

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

### 4) Tooltip delay behavior

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

### 5) Controlled select

```tsx title="components/select-controlled.tsx"
// import from your project: import Demo from '@/components/select-controlled'
'use client'

import * as Select from '@gentleduck/primitives/select'
import * as React from 'react'
import styles from './styles.module.css'

export default function SelectControlledInternalExample() {
  const [value, setValue] = React.useState('apple')

  return (
    <Select.Select value={value} onValueChange={setValue}>
      <Select.SelectTrigger className={styles.trigger}>
        <Select.SelectValue placeholder="Choose fruit" />
      </Select.SelectTrigger>
      <Select.SelectPortal>
        <Select.SelectContent className={styles.content} sideOffset={8}>
          <Select.SelectViewport>
            <Select.SelectItem className={styles.item} value="apple">
              <Select.SelectItemText>Apple</Select.SelectItemText>
            </Select.SelectItem>
            <Select.SelectItem className={styles.item} value="banana">
              <Select.SelectItemText>Banana</Select.SelectItemText>
            </Select.SelectItem>
            <Select.SelectItem className={styles.item} value="orange">
              <Select.SelectItemText>Orange</Select.SelectItemText>
            </Select.SelectItem>
          </Select.SelectViewport>
        </Select.SelectContent>
      </Select.SelectPortal>
    </Select.Select>
  )
}
```

### 6) Alert dialog confirmation

```tsx title="components/alert-dialog-confirm.tsx"
// import from your project: import Demo from '@/components/alert-dialog-confirm'
'use client'

import * as AlertDialog from '@gentleduck/primitives/alert-dialog'
import styles from './styles.module.css'

export default function AlertDialogConfirmInternalExample() {
  return (
    <div className={styles.frame}>
      <p className={styles.label}>Destructive confirmation</p>
      <AlertDialog.AlertDialog>
        <AlertDialog.AlertDialogTrigger className={styles.trigger}>Open confirm</AlertDialog.AlertDialogTrigger>
        <AlertDialog.AlertDialogPortal>
          <AlertDialog.AlertDialogOverlay className={styles.overlay} />
          <AlertDialog.AlertDialogContent className={styles.content}>
            <AlertDialog.AlertDialogTitle className={styles.title}>Delete resource?</AlertDialog.AlertDialogTitle>
            <AlertDialog.AlertDialogDescription className={styles.description}>
              This action is permanent and cannot be undone.
            </AlertDialog.AlertDialogDescription>
            <div className={styles.actions}>
              <AlertDialog.AlertDialogCancel className={styles.secondary}>Cancel</AlertDialog.AlertDialogCancel>
              <AlertDialog.AlertDialogAction className={styles.danger}>Delete</AlertDialog.AlertDialogAction>
            </div>
          </AlertDialog.AlertDialogContent>
        </AlertDialog.AlertDialogPortal>
      </AlertDialog.AlertDialog>
    </div>
  )
}
```

***

## Learn next

} className="[&_ul]:my-0">
  * [Getting Started](/duck-primitives/getting-started) - Set up a baseline.
  * [Core Concepts](/duck-primitives/concepts) - Internals and composition patterns.
  * [API Reference](/duck-primitives/api) - Props and events for every primitive.
  * [Course](/duck-primitives/course) - From fundamentals to system-level patterns.