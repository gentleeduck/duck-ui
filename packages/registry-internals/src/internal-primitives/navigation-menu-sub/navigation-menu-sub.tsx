'use client'

import * as NavigationMenu from '@gentleduck/primitives/navigation-menu'
import styles from '../primitives.module.css'

export default function NavigationMenuSubExample() {
  return (
    <NavigationMenu.Root className={styles.relative}>
      <NavigationMenu.List className={styles.navList}>
        <NavigationMenu.Item value="guides">
          <NavigationMenu.Trigger className={styles.menubarTrigger}>Guides</NavigationMenu.Trigger>
          <NavigationMenu.Content className={styles.navContent}>
            <NavigationMenu.Sub defaultValue="react" disableToggle={false}>
              <NavigationMenu.List className={styles.navList}>
                {['react', 'vue'].map((framework) => (
                  <NavigationMenu.Item key={framework} value={framework}>
                    <NavigationMenu.Trigger className={styles.menubarTrigger}>{framework}</NavigationMenu.Trigger>
                    <NavigationMenu.Content className={styles.navContent}>
                      <NavigationMenu.Link className={styles.navLink} href={`#${framework}-setup`}>
                        Set up {framework}
                      </NavigationMenu.Link>
                    </NavigationMenu.Content>
                  </NavigationMenu.Item>
                ))}
              </NavigationMenu.List>
            </NavigationMenu.Sub>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
      </NavigationMenu.List>
      <NavigationMenu.Viewport className={styles.viewport} />
    </NavigationMenu.Root>
  )
}
