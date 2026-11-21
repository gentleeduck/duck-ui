'use client'

import * as ContextMenu from '@gentleduck/primitives/context-menu'
import styles from '../primitives.module.css'

export default function ContextMenuSubmenuExample() {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger className={styles.contextArea}>Right-click a file</ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content className={styles.content}>
          <ContextMenu.Item className={styles.item}>Open</ContextMenu.Item>
          <ContextMenu.Sub>
            <ContextMenu.SubTrigger className={styles.item}>
              Share <span className={styles.shortcut}>{'>'}</span>
            </ContextMenu.SubTrigger>
            <ContextMenu.Portal>
              <ContextMenu.SubContent className={styles.content} sideOffset={4}>
                <ContextMenu.Item className={styles.item}>Email link</ContextMenu.Item>
                <ContextMenu.Item className={styles.item}>Copy link</ContextMenu.Item>
                <ContextMenu.Sub>
                  <ContextMenu.SubTrigger className={styles.item}>
                    More <span className={styles.shortcut}>{'>'}</span>
                  </ContextMenu.SubTrigger>
                  <ContextMenu.Portal>
                    <ContextMenu.SubContent className={styles.content} sideOffset={4}>
                      <ContextMenu.Item className={styles.item}>Embed</ContextMenu.Item>
                    </ContextMenu.SubContent>
                  </ContextMenu.Portal>
                </ContextMenu.Sub>
              </ContextMenu.SubContent>
            </ContextMenu.Portal>
          </ContextMenu.Sub>
          <ContextMenu.Separator className={styles.separator} />
          <ContextMenu.Item className={styles.item}>Delete</ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  )
}
