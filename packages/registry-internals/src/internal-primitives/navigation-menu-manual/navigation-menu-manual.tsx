'use client'

import * as NavigationMenu from '@gentleduck/primitives/navigation-menu'
import styles from '../primitives.module.css'

export default function NavigationMenuManualExample() {
  return (
    <NavigationMenu.Root activationMode="manual" className={styles.relative}>
      <NavigationMenu.List className={styles.navList}>
        {['Docs', 'Blog', 'Community'].map((name) => (
          <NavigationMenu.Item key={name} value={name}>
            <NavigationMenu.Trigger className={styles.menubarTrigger}>{name}</NavigationMenu.Trigger>
            <NavigationMenu.Content className={styles.navContent}>
              <NavigationMenu.Link className={styles.navLink} href={`#${name.toLowerCase()}`}>
                Latest in {name.toLowerCase()}
              </NavigationMenu.Link>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
        ))}
      </NavigationMenu.List>
      <NavigationMenu.Viewport className={styles.viewport} />
    </NavigationMenu.Root>
  )
}
