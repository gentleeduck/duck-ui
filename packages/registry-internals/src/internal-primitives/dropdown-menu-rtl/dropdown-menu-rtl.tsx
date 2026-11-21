'use client'

import * as DropdownMenu from '@gentleduck/primitives/dropdown-menu'
import styles from '../primitives.module.css'

export default function DropdownMenuRtlExample() {
  return (
    <DropdownMenu.Root dir="rtl">
      <DropdownMenu.Trigger className={styles.button}>الخيارات</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="start" className={styles.content} sideOffset={6}>
          <DropdownMenu.Item className={styles.item}>تعديل</DropdownMenu.Item>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger className={styles.item}>
              مشاركة <span className={styles.shortcut}>{'<'}</span>
            </DropdownMenu.SubTrigger>
            <DropdownMenu.Portal>
              <DropdownMenu.SubContent className={styles.content}>
                <DropdownMenu.Item className={styles.item}>بريد</DropdownMenu.Item>
              </DropdownMenu.SubContent>
            </DropdownMenu.Portal>
          </DropdownMenu.Sub>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
