```tsx
import * as Dialog from '@gentleduck/primitives/dialog'
```

## Anatomy

```tsx
<Dialog.Root>
  <Dialog.Trigger />
  <Dialog.Portal>
    <Dialog.Overlay />
    <Dialog.Content>
      <Dialog.Title />
      <Dialog.Description />
      <Dialog.Close />
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

***

## Usage

```tsx
import * as Dialog from '@gentleduck/primitives/dialog'

function DeleteConfirmation() {
  return (
    <Dialog.Root>
      <Dialog.Trigger className="px-4 py-2 bg-red-500 text-white rounded">
        Delete account
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 animate-fadeIn" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-xl max-w-md w-full animate-scaleIn">
          <Dialog.Title className="text-lg font-semibold">
            Delete your account?
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-gray-600">
            This will permanently delete your account and all associated data.
          </Dialog.Description>
          <div className="mt-4 flex gap-2 justify-end">
            <Dialog.Close className="px-4 py-2 border rounded">
              Cancel
            </Dialog.Close>
            <button className="px-4 py-2 bg-red-500 text-white rounded">
              Delete
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
```

***

## Examples

### Basic

```tsx title="components/dialog-basic.tsx"
// import from your project: import Demo from '@/components/dialog-basic'
'use client'

import * as Dialog from '@gentleduck/primitives/dialog'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function DialogBasicExample() {
  const [name, setName] = React.useState('Ada Lovelace')

  return (
    <Dialog.Root>
      <Dialog.Trigger className={styles.button}>Edit profile</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className={`${styles.overlay} ${styles.fade}`} />
        <Dialog.Content className={`${styles.dialog} ${styles.fade}`}>
          <Dialog.Title className={styles.title}>Edit profile</Dialog.Title>
          <Dialog.Description className={styles.description}>Changes show on your public page.</Dialog.Description>
          <label className={styles.stack}>
            <span className={styles.label}>Name</span>
            <input className={styles.input} onChange={(event) => setName(event.target.value)} value={name} />
          </label>
          <div className={styles.actions}>
            <Dialog.Close className={styles.button}>Cancel</Dialog.Close>
            <Dialog.Close className={`${styles.button} ${styles.primary}`}>Save</Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
```

### Guarded while busy

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

### Non-modal

```tsx title="components/dialog-non-modal.tsx"
// import from your project: import Demo from '@/components/dialog-non-modal'
'use client'

import * as Dialog from '@gentleduck/primitives/dialog'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function DialogNonModalExample() {
  const [notes, setNotes] = React.useState('')

  return (
    <div className={styles.stack}>
      <Dialog.Root modal={false}>
        <Dialog.Trigger className={styles.button}>Open notes</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Content
            aria-describedby={undefined}
            className={styles.dialog}
            onInteractOutside={(event) => event.preventDefault()}
            style={{ top: 'auto', bottom: '1rem', left: 'auto', right: '1rem', transform: 'none' }}>
            <Dialog.Title className={styles.title}>Notes</Dialog.Title>
            <textarea
              className={styles.input}
              onChange={(event) => setNotes(event.target.value)}
              rows={4}
              value={notes}
            />
            <Dialog.Close className={styles.button}>Close</Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <p className={styles.note}>
        modal off traps no focus and locks nothing, so the page stays usable beside it, and a press outside is kept from
        closing it here.
      </p>
    </div>
  )
}
```

### Where focus starts and ends

```tsx title="components/dialog-focus.tsx"
// import from your project: import Demo from '@/components/dialog-focus'
'use client'

import * as Dialog from '@gentleduck/primitives/dialog'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function DialogFocusExample() {
  const email = React.useRef<HTMLInputElement>(null)
  const after = React.useRef<HTMLButtonElement>(null)

  return (
    <div className={styles.row}>
      <Dialog.Root>
        <Dialog.Trigger className={styles.button}>Invite</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className={`${styles.overlay} ${styles.fade}`} />
          <Dialog.Content className={styles.dialog} finalFocus={after} initialFocus={email}>
            <Dialog.Title className={styles.title}>Invite a teammate</Dialog.Title>
            <Dialog.Description className={styles.description}>
              Focus starts in the email field, not on the first field, and lands on "Next step" once closed.
            </Dialog.Description>
            <input className={styles.input} placeholder="Name" />
            <input className={styles.input} placeholder="Email" ref={email} type="email" />
            <div className={styles.actions}>
              <Dialog.Close className={styles.button}>Done</Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <button className={styles.button} ref={after} type="button">
        Next step
      </button>
    </div>
  )
}
```

### Unsaved changes

```tsx title="components/dialog-unsaved-guard.tsx"
// import from your project: import Demo from '@/components/dialog-unsaved-guard'
'use client'

import * as Dialog from '@gentleduck/primitives/dialog'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function DialogUnsavedGuardExample() {
  const [open, setOpen] = React.useState(false)
  const [text, setText] = React.useState('')
  const [warned, setWarned] = React.useState(false)
  const guard = (event: Event) => {
    if (!text) return
    event.preventDefault()
    setWarned(true)
  }

  return (
    <Dialog.Root
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) {
          setText('')
          setWarned(false)
        }
      }}
      open={open}>
      <Dialog.Trigger className={styles.button}>Write a reply</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className={`${styles.overlay} ${styles.fade}`} />
        <Dialog.Content
          aria-describedby={undefined}
          className={styles.dialog}
          onEscapeKeyDown={guard}
          onPointerDownOutside={guard}>
          <Dialog.Title className={styles.title}>Reply</Dialog.Title>
          <textarea className={styles.input} onChange={(event) => setText(event.target.value)} rows={4} value={text} />
          {warned ? <p className={styles.note}>You have unsaved text. Use Discard to close.</p> : null}
          <div className={styles.actions}>
            <Dialog.Close className={styles.button}>Discard</Dialog.Close>
            <Dialog.Close className={`${styles.button} ${styles.primary}`}>Send</Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
```

### Nested dialogs

```tsx title="components/dialog-nested.tsx"
// import from your project: import Demo from '@/components/dialog-nested'
'use client'

import * as Dialog from '@gentleduck/primitives/dialog'
import styles from '../primitives.module.css'

export default function DialogNestedExample() {
  return (
    <Dialog.Root>
      <Dialog.Trigger className={styles.button}>Open settings</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className={`${styles.overlay} ${styles.fade}`} />
        <Dialog.Content
          aria-describedby={undefined}
          className={styles.dialog}
          style={{
            scale: 'calc(1 - 0.05 * var(--gentleduck-dialog-nested-dialogs, 0))',
            transition: 'scale 200ms ease',
          }}>
          <Dialog.Title className={styles.title}>Settings</Dialog.Title>
          <Dialog.Root>
            <Dialog.Trigger className={styles.button}>Change password</Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Content aria-describedby={undefined} className={styles.dialog}>
                <Dialog.Title className={styles.title}>Change password</Dialog.Title>
                <input className={styles.input} placeholder="New password" type="password" />
                <Dialog.Close className={styles.button}>Back</Dialog.Close>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
          <Dialog.Close className={styles.button}>Close</Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
```

### A portal container

```tsx title="components/dialog-container.tsx"
// import from your project: import Demo from '@/components/dialog-container'
'use client'

import * as Dialog from '@gentleduck/primitives/dialog'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function DialogContainerExample() {
  const [box, setBox] = React.useState<HTMLDivElement | null>(null)

  return (
    <div className={styles.stack}>
      <Dialog.Root modal={false}>
        <Dialog.Trigger className={styles.button}>Open in the box</Dialog.Trigger>
        <Dialog.Portal container={box}>
          <Dialog.Content aria-describedby={undefined} className={`${styles.content} ${styles.panel}`}>
            <Dialog.Title className={styles.title}>Rendered in the box below</Dialog.Title>
            <Dialog.Close className={styles.button}>Close</Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <div className={styles.box} ref={setBox} style={{ minHeight: '5rem', minWidth: '16rem' }} />
    </div>
  )
}
```

### Right to left

```tsx title="components/dialog-rtl.tsx"
// import from your project: import Demo from '@/components/dialog-rtl'
'use client'

import * as Dialog from '@gentleduck/primitives/dialog'
import styles from '../primitives.module.css'

export default function DialogRtlExample() {
  return (
    <Dialog.Root dir="rtl">
      <Dialog.Trigger className={styles.button}>تعديل الملف</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className={`${styles.overlay} ${styles.fade}`} />
        <Dialog.Content className={styles.dialog}>
          <Dialog.Title className={styles.title}>تعديل الملف الشخصي</Dialog.Title>
          <Dialog.Description className={styles.description}>تظهر التغييرات في صفحتك العامة.</Dialog.Description>
          <div className={styles.actions}>
            <Dialog.Close className={styles.button}>إغلاق</Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
```

***

## API

### `Dialog.Root`

The root component that manages open/closed state and provides context to all children.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `open` | `boolean` | - | Controlled open state |
| `defaultOpen` | `boolean` | `false` | Initial open state (uncontrolled) |
| `onOpenChange` | `(open: boolean) => void` | - | Called when the open state should change |
| `modal` | `boolean` | `true` | When `true`, enables focus trapping, scroll lock, and hides other content from screen readers |
| `dir` | `'ltr' \| 'rtl'` | - | Direction of the content and the overlay. Falls back to the nearest `DirectionProvider`, then `<html dir>` |

### `Dialog.Trigger`

Button that toggles the dialog. Renders a `<button>` by default.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `asChild` | `boolean` | - | Render as the child element instead of a `<button>` |

Sets `aria-haspopup="dialog"`, `aria-expanded` and `data-state`, and `aria-controls` while the dialog is open, since a closed dialog renders no content to point at. It carries no `dir`, so it keeps the page's direction.

### `Dialog.Portal`

Renders children into `document.body` (or a custom container) via React portal.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `container` | `Element \| DocumentFragment \| RefObject \| null` | `document.body` | Portal target |
| `forceMount` | `true` | - | Force mount content (bypasses Presence) |

### `Dialog.Overlay`

Renders an overlay behind the content. Only renders when `modal` is `true`. Automatically locks body scroll.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `forceMount` | `true` | - | Keep mounted regardless of open state |
| `asChild` | `boolean` | - | Render as child element |
| `lockScroll` | `boolean` | `open` | Override whether body scroll is locked |

Exposes `data-state="open"` / `data-state="closed"` for CSS animation, and `data-nested` on a [nested dialog](#nested-dialogs). A press on the overlay dismisses the dialog even when its own handlers stop propagation.

### `Dialog.Content`

The content area. Handles focus trapping (modal), dismiss-on-click-outside, and escape-to-close.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `forceMount` | `true` | - | Keep mounted regardless of open state |
| `onOpenAutoFocus` | `(event: Event) => void` | - | Called when focus moves into content on open. Call `event.preventDefault()` to prevent auto-focus. |
| `onCloseAutoFocus` | `(event: Event) => void` | - | Called when focus moves back to trigger on close |
| `initialFocus` | `RefObject<HTMLElement \| null> \| false` | - | Focused on open in place of the first tabbable element. `false` leaves focus where it was |
| `finalFocus` | `RefObject<HTMLElement \| null> \| false` | - | Focused on close in place of the trigger. `false` moves focus nowhere |
| `onPointerDownOutside` | `(event) => void` | - | Called for a press outside, once its click lands. Prevent default to block close. |
| `onFocusOutside` | `(event) => void` | - | Called when focus moves outside |
| `onInteractOutside` | `(event) => void` | - | Called for any outside interaction |
| `onEscapeKeyDown` | `(event) => void` | - | Called when <Kbd>Escape</Kbd> is pressed. Prevent default to block close. |
| `trapFocus` | `boolean` | `open` | Modal only. Override whether focus is trapped inside the content |
| `disableOutsidePointerEvents` | `boolean` | `open` | Modal only. Override whether pointer events outside are blocked |

On a modal dialog, `trapFocus` and `disableOutsidePointerEvents` follow the open state, and a non-modal dialog ignores both. The page gets its pointer events and its scroll back once the content has left it or started an exit animation, so content force mounted for a library like [motion](https://motion.dev) gives them back as soon as it closes. Override them when the library needs other timing.

An `onOpenAutoFocus` or `onCloseAutoFocus` handler that prevents the default wins over `initialFocus` and `finalFocus`.

Sets `role="dialog"` and `data-state`, and `data-nested`, `data-nested-dialog-open` and `--gentleduck-dialog-nested-dialogs` for [nested dialogs](#nested-dialogs). Its `aria-labelledby` lists the id of every `Dialog.Title` mounted inside it, and its `aria-describedby` lists an `aria-describedby` you pass, then every `Dialog.Description`. An `aria-labelledby` you pass wins. An `id` you pass reaches the trigger's `aria-controls`.

A primary press outside dismisses the dialog once its click lands, so code that stops the pointerup, mouse, touch or click events after it cancels the dismissal. A right or control press dismisses at once, since macOS sends no click for it. <Kbd>Tab</Kbd> and <Kbd>Escape</Kbd> pressed while an input method is composing text are left to it.

The ids register in a layout effect, so content rendered without a portal has no `aria-labelledby` or `aria-describedby` in the server markup until it hydrates.

### `Dialog.Title`

Accessible title. Renders an `<h2>` by default and must render inside `Dialog.Content`, whose `aria-labelledby` points at its id. It generates the id unless you pass `id`.

}>
  Always include a Title for accessibility. In development, an error is logged when the content mounts with no Title, `aria-label` or `aria-labelledby`.

### `Dialog.Description`

Accessible description. Renders a `<p>` by default and must render inside `Dialog.Content`, whose `aria-describedby` points at its id. It generates the id unless you pass `id`. In development, a warning is logged when the content mounts with no Description and no `aria-describedby`; pass `aria-describedby={undefined}` to the content when it needs none.

### `Dialog.Close`

Button that closes the dialog. Renders a `<button>` by default.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `asChild` | `boolean` | - | Render as child element |

***

## Modal vs non-modal

Modal (default)
Non-modal

When `modal={true}` (default):

* Focus is trapped inside the content.
* Body scroll is locked while a `Dialog.Overlay` is rendered, unless its `lockScroll` is `false`. A dialog in another document, such as an iframe's, locks that document's body.
* Other content is hidden from screen readers via `aria-hidden`, except a layer portalled out of the dialog, such as a popover's content, and a dialog opened from one. A dialog kept mounted with `forceMount` leaves the page to screen readers while it is closed.
* Clicking outside dismisses the dialog.

A layer portalled out of the content, such as a `Popover.Content`, registers with the dialog, so focus can move into it and it scrolls under the dialog's scroll lock. A layer of your own does the same with `useFocusScopeBranch`, documented under [FocusScope](/duck-primitives/api/focus-scope).

Set `modal={false}` for non-modal dialogs (sidebars, panels) that don't block interaction with the rest of the page. Focus is not trapped, the page keeps its scroll and stays in reach of a screen reader, and `Dialog.Overlay` renders nothing. A press outside or focus moving out still closes it, unless `onInteractOutside` prevents that.

```tsx
<Dialog.Root modal={false}>
  ...
</Dialog.Root>
```

***

## Nested dialogs

A dialog, alert dialog or sheet whose root renders inside another dialog's content is nested in it, and its content and overlay carry `data-nested`. While it is open, the content it was opened from carries `data-nested-dialog-open`, and `--gentleduck-dialog-nested-dialogs` counts the open dialogs stacked in front of it, so it can step back:

```css
.dialog-content[data-nested-dialog-open] {
  scale: calc(1 - 0.05 * var(--gentleduck-dialog-nested-dialogs));
}
.dialog-overlay[data-nested] {
  background: transparent;
}
```

A dialog whose root sits outside the other's content, beside its trigger, is not nested.

***

## Animation

Use `data-state` for CSS animations:

```css
.dialog-overlay[data-state="open"] {
  animation: fadeIn 200ms ease;
}
.dialog-overlay[data-state="closed"] {
  animation: fadeOut 200ms ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}
```

}>
  The `Presence` system detects these animations and delays unmounting until they complete.

***

## Keyboard interactions

| Key | Action |
| --- | --- |
| <Kbd>Space</Kbd> / <Kbd>Enter</Kbd> | Opens the dialog (on Trigger) |
| <Kbd>Tab</Kbd> | Cycles through focusable elements inside content |
| <Kbd>Shift+Tab</Kbd> | Cycles backward through focusable elements |
| <Kbd>Escape</Kbd> | Closes the dialog, unless an input method is composing text |