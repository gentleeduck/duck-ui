'use client'

import * as NavigationMenu from '@gentleduck/primitives/navigation-menu'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function NavigationMenuLinksExample() {
  const [page, setPage] = React.useState('#overview')
  const [filters, setFilters] = React.useState(0)

  return (
    <NavigationMenu.Root className={styles.relative}>
      <NavigationMenu.List className={styles.navList}>
        <NavigationMenu.Item value="pages">
          <NavigationMenu.Trigger className={styles.menubarTrigger}>Pages</NavigationMenu.Trigger>
          <NavigationMenu.Content className={styles.navContent}>
            {['#overview', '#activity', '#billing'].map((href) => (
              <NavigationMenu.Link
                active={href === page}
                className={styles.navLink}
                href={href}
                key={href}
                onSelect={(event) => {
                  event.preventDefault()
                  setPage(href)
                }}>
                {href.slice(1)}
              </NavigationMenu.Link>
            ))}
            <NavigationMenu.Link
              className={styles.navLink}
              closeOnSelect={false}
              href="#"
              onSelect={(event) => {
                event.preventDefault()
                setFilters((count) => count + 1)
              }}>
              Add a filter ({filters}), keeps the menu open
            </NavigationMenu.Link>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
      </NavigationMenu.List>
      <NavigationMenu.Viewport className={styles.viewport} />
    </NavigationMenu.Root>
  )
}
