'use client'

import * as NavigationMenu from '@gentleduck/primitives/navigation-menu'
import styles from '../primitives.module.css'

export default function NavigationMenuVerticalExample() {
  return (
    <NavigationMenu.Root className={styles.relative} orientation="vertical" style={{ display: 'flex', gap: '0.5rem' }}>
      <NavigationMenu.List className={styles.navList}>
        {['Overview', 'Reports', 'Settings'].map((name) => (
          <NavigationMenu.Item key={name} value={name}>
            <NavigationMenu.Trigger className={styles.menubarTrigger}>{name}</NavigationMenu.Trigger>
            <NavigationMenu.Content className={`${styles.content} ${styles.navContent}`}>
              <NavigationMenu.Link className={styles.navLink} href={`#${name.toLowerCase()}`}>
                {name} home
              </NavigationMenu.Link>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
        ))}
      </NavigationMenu.List>
    </NavigationMenu.Root>
  )
}
