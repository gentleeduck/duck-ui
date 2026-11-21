'use client'

import * as Command from '@gentleduck/primitives/command'
import * as React from 'react'
import styles from '../primitives.module.css'

const FRUITS = ['apple', 'banana', 'cherry', 'grape', 'mango']

export default function CommandControlledExample() {
  const [value, setValue] = React.useState('cherry')

  return (
    <div className={styles.stack}>
      <Command.Root
        className={styles.command}
        disablePointerSelection
        aria-label="Fruit"
        loop
        onValueChange={setValue}
        value={value}>
        <Command.Input className={styles.commandInput} placeholder="Search fruit..." />
        <Command.List className={styles.commandList}>
          {FRUITS.map((fruit) => (
            <Command.Item className={styles.item} key={fruit} value={fruit}>
              {fruit}
            </Command.Item>
          ))}
        </Command.List>
      </Command.Root>
      <p className={styles.note}>
        Highlighted: {value || 'nothing'}. The mouse leaves the highlight alone, and the arrow keys wrap with loop.
      </p>
    </div>
  )
}
