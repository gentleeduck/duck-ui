'use client'

import * as Menubar from '@gentleduck/primitives/menubar'
import styles from '../primitives.module.css'

export default function MenubarVerticalExample() {
  return (
    <Menubar.Root className={styles.menubar} orientation="vertical" style={{ flexDirection: 'column' }}>
      {['Projects', 'Team', 'Settings'].map((menu) => (
        <Menubar.Menu key={menu} value={menu}>
          <Menubar.Trigger className={styles.menubarTrigger}>{menu}</Menubar.Trigger>
          <Menubar.Portal>
            <Menubar.Content className={styles.content} sideOffset={6}>
              <Menubar.Item className={styles.item}>Open {menu.toLowerCase()}</Menubar.Item>
              <Menubar.Item className={styles.item}>Manage</Menubar.Item>
            </Menubar.Content>
          </Menubar.Portal>
        </Menubar.Menu>
      ))}
    </Menubar.Root>
  )
}
