'use client'

import * as NavigationMenu from '@gentleduck/primitives/navigation-menu'
import styles from '../primitives.module.css'

export default function NavigationMenuDelaysExample() {
  return (
    <NavigationMenu.Root className={styles.relative} closeDelay={600} delayDuration={500} skipDelayDuration={1000}>
      <NavigationMenu.List className={styles.navList}>
        {['Slow', 'To', 'Open'].map((name) => (
          <NavigationMenu.Item key={name} value={name}>
            <NavigationMenu.Trigger className={styles.menubarTrigger}>{name}</NavigationMenu.Trigger>
            <NavigationMenu.Content className={styles.navContent}>
              <NavigationMenu.Link className={styles.navLink} href="#">
                Rest 500ms to open, then the next opens at once for a second.
              </NavigationMenu.Link>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
        ))}
      </NavigationMenu.List>
      <NavigationMenu.Viewport className={styles.viewport} />
    </NavigationMenu.Root>
  )
}
