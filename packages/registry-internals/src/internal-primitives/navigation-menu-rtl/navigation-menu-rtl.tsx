'use client'

import * as NavigationMenu from '@gentleduck/primitives/navigation-menu'
import styles from '../primitives.module.css'

export default function NavigationMenuRtlExample() {
  return (
    <NavigationMenu.Root className={styles.relative} dir="rtl">
      <NavigationMenu.List className={styles.navList}>
        {['المنتجات', 'الأسعار', 'المدونة'].map((name) => (
          <NavigationMenu.Item key={name} value={name}>
            <NavigationMenu.Trigger className={styles.menubarTrigger}>{name}</NavigationMenu.Trigger>
            <NavigationMenu.Content className={styles.navContent}>
              <NavigationMenu.Link className={styles.navLink} href="#">
                كل {name}
              </NavigationMenu.Link>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
        ))}
      </NavigationMenu.List>
      <NavigationMenu.Viewport className={styles.viewport} />
    </NavigationMenu.Root>
  )
}
