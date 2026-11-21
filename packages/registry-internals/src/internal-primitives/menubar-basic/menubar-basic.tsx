'use client'

import * as Menubar from '@gentleduck/primitives/menubar'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function MenubarBasicExample() {
  const [wrap, setWrap] = React.useState(true)
  const [theme, setTheme] = React.useState('system')

  return (
    <Menubar.Root className={styles.menubar}>
      <Menubar.Menu value="file">
        <Menubar.Trigger className={styles.menubarTrigger}>File</Menubar.Trigger>
        <Menubar.Portal>
          <Menubar.Content className={styles.content} sideOffset={6}>
            <Menubar.Item className={styles.item}>
              New file <span className={styles.shortcut}>Ctrl N</span>
            </Menubar.Item>
            <Menubar.Sub>
              <Menubar.SubTrigger className={styles.item}>
                Open recent <span className={styles.shortcut}>{'>'}</span>
              </Menubar.SubTrigger>
              <Menubar.Portal>
                <Menubar.SubContent className={styles.content}>
                  <Menubar.Item className={styles.item}>notes.md</Menubar.Item>
                  <Menubar.Item className={styles.item}>budget.csv</Menubar.Item>
                </Menubar.SubContent>
              </Menubar.Portal>
            </Menubar.Sub>
            <Menubar.Separator className={styles.separator} />
            <Menubar.Item className={styles.item} disabled>
              Print
            </Menubar.Item>
          </Menubar.Content>
        </Menubar.Portal>
      </Menubar.Menu>
      <Menubar.Menu value="view">
        <Menubar.Trigger className={styles.menubarTrigger}>View</Menubar.Trigger>
        <Menubar.Portal>
          <Menubar.Content className={styles.content} sideOffset={6}>
            <Menubar.CheckboxItem checked={wrap} className={styles.item} onCheckedChange={setWrap}>
              <span className={styles.itemIndicator}>
                <Menubar.ItemIndicator>x</Menubar.ItemIndicator>
              </span>
              Word wrap
            </Menubar.CheckboxItem>
            <Menubar.Separator className={styles.separator} />
            <Menubar.Label className={styles.groupLabel}>Theme</Menubar.Label>
            <Menubar.RadioGroup onValueChange={setTheme} value={theme}>
              {['light', 'dark', 'system'].map((value) => (
                <Menubar.RadioItem className={styles.item} key={value} value={value}>
                  <span className={styles.itemIndicator}>
                    <Menubar.ItemIndicator>o</Menubar.ItemIndicator>
                  </span>
                  {value}
                </Menubar.RadioItem>
              ))}
            </Menubar.RadioGroup>
          </Menubar.Content>
        </Menubar.Portal>
      </Menubar.Menu>
    </Menubar.Root>
  )
}
