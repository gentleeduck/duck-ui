'use client'

import * as Menubar from '@gentleduck/primitives/menubar'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function MenubarDisabledExample() {
  const [disabled, setDisabled] = React.useState(true)

  return (
    <div className={styles.stack}>
      <Menubar.Root className={styles.menubar} disabled={disabled}>
        {['File', 'Edit'].map((menu) => (
          <Menubar.Menu key={menu} value={menu}>
            <Menubar.Trigger className={styles.menubarTrigger}>{menu}</Menubar.Trigger>
            <Menubar.Portal>
              <Menubar.Content className={styles.content} sideOffset={6}>
                <Menubar.Item className={styles.item}>{menu} item</Menubar.Item>
              </Menubar.Content>
            </Menubar.Portal>
          </Menubar.Menu>
        ))}
      </Menubar.Root>
      <button className={styles.button} onClick={() => setDisabled((value) => !value)} type="button">
        {disabled ? 'Enable the bar' : 'Disable the bar'}
      </button>
    </div>
  )
}
