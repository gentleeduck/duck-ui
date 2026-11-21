'use client'

import * as Command from '@gentleduck/primitives/command'
import styles from '../primitives.module.css'

export default function CommandRtlExample() {
  return (
    <Command.Root className={styles.command} dir="rtl" aria-label="بحث">
      <Command.Input className={styles.commandInput} placeholder="ابحث..." />
      <Command.List className={styles.commandList}>
        <Command.Empty className={styles.commandEmpty}>لا توجد نتائج.</Command.Empty>
        <Command.Group heading="الصفحات">
          <Command.Item className={styles.item} value="home">
            الرئيسية
          </Command.Item>
          <Command.Item className={styles.item} value="settings">
            الإعدادات
          </Command.Item>
        </Command.Group>
      </Command.List>
    </Command.Root>
  )
}
