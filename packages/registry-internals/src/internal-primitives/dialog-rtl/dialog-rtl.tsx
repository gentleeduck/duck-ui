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
