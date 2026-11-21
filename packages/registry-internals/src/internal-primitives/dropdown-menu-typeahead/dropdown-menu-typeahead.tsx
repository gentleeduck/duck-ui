'use client'

import * as DropdownMenu from '@gentleduck/primitives/dropdown-menu'
import styles from '../primitives.module.css'

const FLAGS = [
  { code: 'DE', name: 'Germany' },
  { code: 'EG', name: 'Egypt' },
  { code: 'FR', name: 'France' },
  { code: 'JP', name: 'Japan' },
]

export default function DropdownMenuTypeaheadExample() {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className={styles.button}>Country</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="start" className={styles.content} sideOffset={6}>
          {FLAGS.map(({ code, name }) => (
            <DropdownMenu.Item className={styles.item} key={code} textValue={name}>
              <span aria-hidden className={styles.shortcut} style={{ marginInlineStart: 0 }}>
                {code}
              </span>
              {name}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
