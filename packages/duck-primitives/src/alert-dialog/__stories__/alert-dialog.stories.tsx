import * as React from 'react'
import { DirectionProvider } from '../../direction'
import * as AlertDialog from '..'
import styles from './alert-dialog.stories.module.css'

export default {
  title: 'Components/AlertDialog',
}

function Confirm({
  onAction,
  initialFocus,
  title = 'Delete the project?',
  description = 'Its files go with it, and this cannot be undone.',
  cancel = 'Cancel',
  action = 'Delete',
}: {
  onAction?: (event: React.MouseEvent<HTMLButtonElement>) => void
  initialFocus?: React.RefObject<HTMLButtonElement | null>
  title?: string
  description?: string
  cancel?: string
  action?: string
}) {
  return (
    <AlertDialog.Portal>
      <AlertDialog.Overlay className={styles.overlay} />
      <AlertDialog.Content className={styles.content} initialFocus={initialFocus}>
        <AlertDialog.Title>{title}</AlertDialog.Title>
        <AlertDialog.Description>{description}</AlertDialog.Description>
        <div className={styles.actions}>
          <AlertDialog.Cancel>{cancel}</AlertDialog.Cancel>
          <AlertDialog.Action ref={initialFocus} onClick={onAction}>
            {action}
          </AlertDialog.Action>
        </div>
      </AlertDialog.Content>
    </AlertDialog.Portal>
  )
}

export const Basic = () => {
  const [deleted, setDeleted] = React.useState(0)
  return (
    <>
      <AlertDialog.Root>
        <AlertDialog.Trigger>Delete project</AlertDialog.Trigger>
        <Confirm onAction={() => setDeleted((count) => count + 1)} />
      </AlertDialog.Root>
      <p>Deleted {deleted}</p>
      <button type="button">Outside</button>
    </>
  )
}

export const InitialFocus = () => {
  const actionRef = React.useRef<HTMLButtonElement>(null)
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger>Publish</AlertDialog.Trigger>
      <Confirm
        initialFocus={actionRef}
        title="Publish the post?"
        description="It goes out to every subscriber."
        action="Publish"
      />
    </AlertDialog.Root>
  )
}

// The action prevents its own close and closes once the work is done.
export const AsyncAction = () => {
  const [open, setOpen] = React.useState(false)
  const [working, setWorking] = React.useState(false)
  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Trigger>Delete project</AlertDialog.Trigger>
      <Confirm
        action={working ? 'Deleting...' : 'Delete'}
        onAction={(event) => {
          event.preventDefault()
          setWorking(true)
          setTimeout(() => {
            setWorking(false)
            setOpen(false)
          }, 300)
        }}
      />
    </AlertDialog.Root>
  )
}

export const Rtl = () => (
  <DirectionProvider dir="rtl">
    <AlertDialog.Root>
      <AlertDialog.Trigger>حذف المشروع</AlertDialog.Trigger>
      <Confirm title="حذف المشروع؟" description="لا يمكن التراجع عن ذلك." cancel="إلغاء" action="حذف" />
    </AlertDialog.Root>
  </DirectionProvider>
)
