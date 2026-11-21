'use client'

import * as ContextMenu from '@gentleduck/primitives/context-menu'
import styles from '../primitives.module.css'

export default function ContextMenuRtlExample() {
  return (
    <ContextMenu.Root dir="rtl">
      <ContextMenu.Trigger className={styles.contextArea} dir="rtl">
        انقر بزر الفأرة الأيمن هنا
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content className={styles.content}>
          <ContextMenu.Item className={styles.item}>نسخ</ContextMenu.Item>
          <ContextMenu.Sub>
            <ContextMenu.SubTrigger className={styles.item}>
              مشاركة <span className={styles.shortcut}>{'<'}</span>
            </ContextMenu.SubTrigger>
            <ContextMenu.Portal>
              <ContextMenu.SubContent className={styles.content}>
                <ContextMenu.Item className={styles.item}>رابط</ContextMenu.Item>
              </ContextMenu.SubContent>
            </ContextMenu.Portal>
          </ContextMenu.Sub>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  )
}
