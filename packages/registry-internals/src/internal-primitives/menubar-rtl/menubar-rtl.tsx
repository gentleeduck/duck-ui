'use client'

import * as Menubar from '@gentleduck/primitives/menubar'
import styles from '../primitives.module.css'

export default function MenubarRtlExample() {
  return (
    <Menubar.Root className={styles.menubar} dir="rtl">
      {['ملف', 'تحرير', 'عرض'].map((menu) => (
        <Menubar.Menu key={menu} value={menu}>
          <Menubar.Trigger className={styles.menubarTrigger}>{menu}</Menubar.Trigger>
          <Menubar.Portal>
            <Menubar.Content className={styles.content} sideOffset={6}>
              <Menubar.Item className={styles.item}>{menu} جديد</Menubar.Item>
            </Menubar.Content>
          </Menubar.Portal>
        </Menubar.Menu>
      ))}
    </Menubar.Root>
  )
}
