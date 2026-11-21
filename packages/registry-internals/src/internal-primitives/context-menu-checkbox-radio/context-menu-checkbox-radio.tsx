'use client'

import * as ContextMenu from '@gentleduck/primitives/context-menu'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function ContextMenuCheckboxRadioExample() {
  const [grid, setGrid] = React.useState(true)
  const [rulers, setRulers] = React.useState(false)
  const [zoom, setZoom] = React.useState('100')

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger className={styles.contextArea}>
        Grid {grid ? 'on' : 'off'}, rulers {rulers ? 'on' : 'off'}, {zoom}%
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content className={styles.content}>
          <ContextMenu.CheckboxItem
            checked={grid}
            className={styles.item}
            closeOnSelect={false}
            onCheckedChange={setGrid}>
            <span className={styles.itemIndicator}>
              <ContextMenu.ItemIndicator>x</ContextMenu.ItemIndicator>
            </span>
            Show grid
          </ContextMenu.CheckboxItem>
          <ContextMenu.CheckboxItem
            checked={rulers}
            className={styles.item}
            closeOnSelect={false}
            onCheckedChange={setRulers}>
            <span className={styles.itemIndicator}>
              <ContextMenu.ItemIndicator>x</ContextMenu.ItemIndicator>
            </span>
            Show rulers
          </ContextMenu.CheckboxItem>
          <ContextMenu.Separator className={styles.separator} />
          <ContextMenu.Label className={styles.groupLabel}>Zoom</ContextMenu.Label>
          <ContextMenu.RadioGroup onValueChange={setZoom} value={zoom}>
            {['50', '100', '200'].map((level) => (
              <ContextMenu.RadioItem className={styles.item} key={level} value={level}>
                <span className={styles.itemIndicator}>
                  <ContextMenu.ItemIndicator>o</ContextMenu.ItemIndicator>
                </span>
                {level}%
              </ContextMenu.RadioItem>
            ))}
          </ContextMenu.RadioGroup>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  )
}
