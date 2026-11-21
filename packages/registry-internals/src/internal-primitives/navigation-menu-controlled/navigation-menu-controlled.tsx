'use client'

import * as NavigationMenu from '@gentleduck/primitives/navigation-menu'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function NavigationMenuControlledExample() {
  const [value, setValue] = React.useState('')

  return (
    <div className={styles.stack}>
      <NavigationMenu.Root className={styles.relative} onValueChange={setValue} value={value}>
        <NavigationMenu.List className={styles.navList}>
          {['Products', 'Pricing'].map((name) => (
            <NavigationMenu.Item key={name} value={name}>
              <NavigationMenu.Trigger className={styles.menubarTrigger}>{name}</NavigationMenu.Trigger>
              <NavigationMenu.Content className={styles.navContent}>
                <NavigationMenu.Link className={styles.navLink} href={`#${name.toLowerCase()}`}>
                  All {name.toLowerCase()}
                </NavigationMenu.Link>
              </NavigationMenu.Content>
            </NavigationMenu.Item>
          ))}
        </NavigationMenu.List>
        <NavigationMenu.Viewport className={styles.viewport} />
      </NavigationMenu.Root>
      <p className={styles.note} style={{ marginTop: '7rem' }}>
        Open item: {value || 'none'}.{' '}
        <button className={styles.button} onClick={() => setValue('Pricing')} type="button">
          Open Pricing
        </button>
      </p>
    </div>
  )
}
