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
