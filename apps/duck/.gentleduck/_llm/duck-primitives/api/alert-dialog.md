```tsx
import * as AlertDialog from '@gentleduck/primitives/alert-dialog'
```

## Anatomy

```tsx
<AlertDialog.Root>
  <AlertDialog.Trigger />
  <AlertDialog.Portal>
    <AlertDialog.Overlay />
    <AlertDialog.Content>
      <AlertDialog.Title />
      <AlertDialog.Description />
      <AlertDialog.Cancel />
      <AlertDialog.Action />
    </AlertDialog.Content>
  </AlertDialog.Portal>
</AlertDialog.Root>
```

***

## How it differs from Dialog

}>
  Alert Dialog wraps Dialog with `modal` forced to `true`. It replaces `Dialog.Close` with two explicit actions: **Cancel** (dismiss without action) and **Action** (confirm and proceed).

The key difference: Alert Dialog requires explicit user choice. Clicking the overlay does **NOT** dismiss it (unlike Dialog). The user must press Cancel or Action.

Opened from a dialog's content, it is a [nested dialog](/duck-primitives/api/dialog#nested-dialogs) like any other.

***

## Usage

```tsx
import * as AlertDialog from '@gentleduck/primitives/alert-dialog'

function DeleteButton() {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger className="px-4 py-2 bg-red-500 text-white rounded">
        Delete
      </AlertDialog.Trigger>

      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black/50" />
        <AlertDialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg max-w-md">
          <AlertDialog.Title>Delete this item?</AlertDialog.Title>
          <AlertDialog.Description>This cannot be undone.</AlertDialog.Description>
          <div className="flex gap-2 justify-end mt-4">
            <AlertDialog.Cancel className="px-4 py-2 border rounded">
              Cancel
            </AlertDialog.Cancel>
            <AlertDialog.Action
              className="px-4 py-2 bg-red-500 text-white rounded"
              onClick={() => deleteItem()}
            >
              Delete
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
```

***

## Examples

### Confirm a destructive action

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

### Wait for the action

```tsx title="components/alert-dialog-async-action.tsx"
// import from your project: import Demo from '@/components/alert-dialog-async-action'
'use client'

import * as AlertDialog from '@gentleduck/primitives/alert-dialog'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function AlertDialogAsyncActionExample() {
  const [open, setOpen] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  const [archived, setArchived] = React.useState(0)

  async function archive(event: React.MouseEvent) {
    event.preventDefault()
    setBusy(true)
    await new Promise((resolve) => setTimeout(resolve, 900))
    setBusy(false)
    setArchived((count) => count + 1)
    setOpen(false)
  }

  return (
    <div className={styles.stack}>
      <AlertDialog.Root onOpenChange={(next) => busy || setOpen(next)} open={open}>
        <AlertDialog.Trigger className={styles.button}>Archive workspace</AlertDialog.Trigger>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className={`${styles.overlay} ${styles.fade}`} />
          <AlertDialog.Content className={styles.dialog}>
            <AlertDialog.Title className={styles.title}>Archive this workspace?</AlertDialog.Title>
            <AlertDialog.Description className={styles.description}>
              Members lose access until an owner restores it.
            </AlertDialog.Description>
            <div className={styles.actions}>
              <AlertDialog.Cancel className={styles.button} disabled={busy}>
                Cancel
              </AlertDialog.Cancel>
              <AlertDialog.Action className={`${styles.button} ${styles.danger}`} disabled={busy} onClick={archive}>
                {busy ? 'Archiving...' : 'Archive'}
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
      <p className={styles.note}>
        The action prevents the close, waits for its work, then closes itself. Archived {archived} times.
      </p>
    </div>
  )
}
```

### Start focus elsewhere

```tsx title="components/alert-dialog-initial-focus.tsx"
// import from your project: import Demo from '@/components/alert-dialog-initial-focus'
'use client'

import * as AlertDialog from '@gentleduck/primitives/alert-dialog'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function AlertDialogInitialFocusExample() {
  const confirm = React.useRef<HTMLButtonElement>(null)

  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger className={styles.button}>Discard draft</AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className={`${styles.overlay} ${styles.fade}`} />
        <AlertDialog.Content className={styles.dialog} initialFocus={confirm}>
          <AlertDialog.Title className={styles.title}>Discard this draft?</AlertDialog.Title>
          <AlertDialog.Description className={styles.description}>
            Focus starts on Discard here, where it would start on Cancel.
          </AlertDialog.Description>
          <div className={styles.actions}>
            <AlertDialog.Cancel className={styles.button}>Keep editing</AlertDialog.Cancel>
            <AlertDialog.Action className={`${styles.button} ${styles.primary}`} ref={confirm}>
              Discard
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
```

### Right to left

```tsx title="components/alert-dialog-rtl.tsx"
// import from your project: import Demo from '@/components/alert-dialog-rtl'
'use client'

import * as AlertDialog from '@gentleduck/primitives/alert-dialog'
import styles from '../primitives.module.css'

export default function AlertDialogRtlExample() {
  return (
    <AlertDialog.Root dir="rtl">
      <AlertDialog.Trigger className={styles.button}>حذف الحساب</AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className={`${styles.overlay} ${styles.fade}`} />
        <AlertDialog.Content className={styles.dialog}>
          <AlertDialog.Title className={styles.title}>هل تريد حذف حسابك؟</AlertDialog.Title>
          <AlertDialog.Description className={styles.description}>
            لا يمكن التراجع عن هذا الإجراء.
          </AlertDialog.Description>
          <div className={styles.actions}>
            <AlertDialog.Cancel className={styles.button}>إلغاء</AlertDialog.Cancel>
            <AlertDialog.Action className={`${styles.button} ${styles.danger}`}>حذف</AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
```

***

## API

### `AlertDialog.Root`

Same as `Dialog.Root` but `modal` is always `true`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `open` | `boolean` | - | Controlled open state |
| `defaultOpen` | `boolean` | `false` | Initial open state |
| `onOpenChange` | `(open: boolean) => void` | - | Called when open state changes |
| `dir` | `'ltr' \| 'rtl'` | - | Direction of the content and the overlay. Falls back to the nearest `DirectionProvider`, then `<html dir>` |

### `AlertDialog.Trigger`

Same as `Dialog.Trigger`.

### `AlertDialog.Portal`

Same as `Dialog.Portal`.

### `AlertDialog.Overlay`

Same as `Dialog.Overlay`.

### `AlertDialog.Content`

Same as `Dialog.Content`, with `role="alertdialog"`, but a press outside does not dismiss, and it focuses `AlertDialog.Cancel` on open. `initialFocus` names another element to focus in its place, or `false` to leave focus on the trigger, and `finalFocus` the element to focus on close in place of the trigger, or `false` to move focus nowhere. Inside a dialog's content it is a [nested dialog](/duck-primitives/api/dialog#nested-dialogs), with `data-nested`. In development, an error is logged when it mounts with no `AlertDialog.Title`, and a warning when it has no `AlertDialog.Description` or `aria-describedby`.

### `AlertDialog.Title`

Same as `Dialog.Title`, and must render inside `AlertDialog.Content`.

### `AlertDialog.Description`

Same as `Dialog.Description`, and must render inside `AlertDialog.Content`.

### `AlertDialog.Cancel`

Closes the dialog without taking action. Focus returns to the trigger.

### `AlertDialog.Action`

Closes the dialog and confirms the action. Attach your `onClick` to execute the destructive operation.

***

## Accessibility

} className="[&_ul]:my-0">
  * Uses `role="alertdialog"` which tells screen readers this requires attention.
  * Focus is trapped and clicking outside does **not** dismiss.
  * `Cancel` should always be present to provide an escape path.