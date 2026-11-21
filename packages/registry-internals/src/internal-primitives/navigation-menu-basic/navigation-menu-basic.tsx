'use client'

import * as NavigationMenu from '@gentleduck/primitives/navigation-menu'
import styles from '../primitives.module.css'

export default function NavigationMenuBasicExample() {
  return (
    <NavigationMenu.Root className={styles.relative}>
      <NavigationMenu.List className={styles.navList}>
        <NavigationMenu.Item value="learn">
          <NavigationMenu.Trigger className={styles.menubarTrigger}>Learn</NavigationMenu.Trigger>
          <NavigationMenu.Content className={styles.navContent}>
            <NavigationMenu.Link className={styles.navLink} href="#introduction">
              Introduction
            </NavigationMenu.Link>
            <NavigationMenu.Link className={styles.navLink} href="#styling">
              Styling
            </NavigationMenu.Link>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
        <NavigationMenu.Item value="components">
          <NavigationMenu.Trigger className={styles.menubarTrigger}>Components</NavigationMenu.Trigger>
          <NavigationMenu.Content className={styles.navContent}>
            {['Accordion', 'Dialog', 'Popover', 'Tooltip'].map((name) => (
              <NavigationMenu.Link className={styles.navLink} href={`#${name.toLowerCase()}`} key={name}>
                {name}
              </NavigationMenu.Link>
            ))}
          </NavigationMenu.Content>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link className={styles.menubarTrigger} href="#github">
            GitHub
          </NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu.List>
      <NavigationMenu.Viewport className={styles.viewport} />
    </NavigationMenu.Root>
  )
}
