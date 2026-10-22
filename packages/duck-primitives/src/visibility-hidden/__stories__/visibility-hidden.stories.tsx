import * as Dialog from '../../dialog'
import { VisuallyHidden } from '..'
import styles from './visibility-hidden.stories.module.css'

export default {
  title: 'Utilities/VisuallyHidden',
}

export const IconButton = () => (
  <div className={styles.page}>
    <button className={styles.icon} type="button">
      <svg aria-hidden="true" height="16" viewBox="0 0 16 16" width="16">
        <circle cx="8" cy="8" fill="currentColor" r="6" />
      </svg>
      <VisuallyHidden data-label="">Open notifications</VisuallyHidden>
    </button>
    <VisuallyHidden asChild>
      <button type="button">Hidden control</button>
    </VisuallyHidden>
  </div>
)

export const HiddenTitle = () => (
  <Dialog.Root defaultOpen>
    <Dialog.Portal>
      <Dialog.Content aria-describedby={undefined} className={styles.content}>
        <VisuallyHidden asChild>
          <Dialog.Title className={styles.title}>Settings</Dialog.Title>
        </VisuallyHidden>
        <Dialog.Close>Close</Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
)
