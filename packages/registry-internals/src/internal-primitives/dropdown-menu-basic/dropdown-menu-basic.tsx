'use client'

import * as DropdownMenu from '@gentleduck/primitives/dropdown-menu'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function DropdownMenuBasicExample() {
  const [last, setLast] = React.useState('nothing')

  return (
    <div className={styles.stack}>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger className={styles.button}>My account</DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content align="start" className={styles.content} sideOffset={6}>
            <DropdownMenu.Label className={styles.groupLabel}>Signed in as ada@example.com</DropdownMenu.Label>
            <DropdownMenu.Group>
              <DropdownMenu.Item className={styles.item} onSelect={() => setLast('Profile')}>
                Profile <span className={styles.shortcut}>Ctrl P</span>
              </DropdownMenu.Item>
              <DropdownMenu.Item className={styles.item} onSelect={() => setLast('Settings')}>
                Settings <span className={styles.shortcut}>Ctrl ,</span>
              </DropdownMenu.Item>
              <DropdownMenu.Item className={styles.item} disabled>
                Billing (owners only)
              </DropdownMenu.Item>
            </DropdownMenu.Group>
            <DropdownMenu.Separator className={styles.separator} />
            <DropdownMenu.Item className={styles.item} onSelect={() => setLast('Sign out')}>
              Sign out
            </DropdownMenu.Item>
            <DropdownMenu.Arrow className={styles.arrow} />
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
      <p className={styles.note}>Last chosen: {last}. Typing a letter jumps to the item it starts.</p>
    </div>
  )
}
