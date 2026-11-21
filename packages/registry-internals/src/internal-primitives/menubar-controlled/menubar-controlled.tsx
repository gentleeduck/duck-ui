'use client'

import * as Menubar from '@gentleduck/primitives/menubar'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function MenubarControlledExample() {
  const [value, setValue] = React.useState('')

  return (
    <div className={styles.stack}>
      <Menubar.Root className={styles.menubar} onValueChange={setValue} value={value}>
        {['Edit', 'Selection', 'Help'].map((menu) => (
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
      <div className={styles.row}>
        <button className={styles.button} onClick={() => setValue('Help')} type="button">
          Open Help
        </button>
        <button className={styles.button} onClick={() => setValue('')} type="button">
          Close
        </button>
      </div>
      <p className={styles.note}>
        Open menu: {value || 'none'}. While one is open, the pointer moving across opens the next.
      </p>
    </div>
  )
}
