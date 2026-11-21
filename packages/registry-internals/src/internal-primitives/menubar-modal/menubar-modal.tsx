'use client'

import * as Menubar from '@gentleduck/primitives/menubar'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function MenubarModalExample() {
  const [modal, setModal] = React.useState(true)

  return (
    <div className={styles.stack}>
      <label className={styles.choice}>
        <input checked={modal} onChange={(event) => setModal(event.target.checked)} type="checkbox" />
        modal
      </label>
      <Menubar.Root className={styles.menubar} modal={modal}>
        <Menubar.Menu value="file">
          <Menubar.Trigger className={styles.menubarTrigger}>File</Menubar.Trigger>
          <Menubar.Portal>
            <Menubar.Content className={styles.content} sideOffset={6}>
              <Menubar.Item className={styles.item}>Save</Menubar.Item>
            </Menubar.Content>
          </Menubar.Portal>
        </Menubar.Menu>
      </Menubar.Root>
      <p className={styles.note}>
        Modal locks the page's scroll and keeps focus in the open menu. Off, the page stays usable.
      </p>
    </div>
  )
}
