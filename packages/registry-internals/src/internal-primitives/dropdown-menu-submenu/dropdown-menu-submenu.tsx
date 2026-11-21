'use client'

import * as DropdownMenu from '@gentleduck/primitives/dropdown-menu'
import styles from '../primitives.module.css'

export default function DropdownMenuSubmenuExample() {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className={styles.button}>Insert</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="start" className={styles.content} sideOffset={6}>
          <DropdownMenu.Item className={styles.item}>Text</DropdownMenu.Item>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger className={styles.item}>
              Media <span className={styles.shortcut}>{'>'}</span>
            </DropdownMenu.SubTrigger>
            <DropdownMenu.Portal>
              <DropdownMenu.SubContent className={styles.content} sideOffset={4}>
                <DropdownMenu.Item className={styles.item}>Image</DropdownMenu.Item>
                <DropdownMenu.Item className={styles.item}>Video</DropdownMenu.Item>
                <DropdownMenu.Sub>
                  <DropdownMenu.SubTrigger className={styles.item}>
                    Embed <span className={styles.shortcut}>{'>'}</span>
                  </DropdownMenu.SubTrigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.SubContent className={styles.content} sideOffset={4}>
                      <DropdownMenu.Item className={styles.item}>Map</DropdownMenu.Item>
                      <DropdownMenu.Item className={styles.item}>Chart</DropdownMenu.Item>
                    </DropdownMenu.SubContent>
                  </DropdownMenu.Portal>
                </DropdownMenu.Sub>
              </DropdownMenu.SubContent>
            </DropdownMenu.Portal>
          </DropdownMenu.Sub>
          <DropdownMenu.Item className={styles.item}>Table</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
