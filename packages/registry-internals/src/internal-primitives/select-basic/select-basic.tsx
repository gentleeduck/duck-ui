'use client'

import * as Select from '@gentleduck/primitives/select'
import styles from '../primitives.module.css'

export default function SelectBasicExample() {
  return (
    <Select.Root defaultValue="banana">
      <Select.Trigger aria-label="Fruit" className={styles.trigger}>
        <Select.Value placeholder="Pick a fruit" />
        <Select.Icon>v</Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className={styles.content}>
          <Select.ScrollUpButton className={styles.note}>^</Select.ScrollUpButton>
          <Select.Viewport>
            <Select.Group>
              <Select.Label className={styles.groupLabel}>Fruit</Select.Label>
              {['Apple', 'Banana', 'Cherry'].map((fruit) => (
                <Select.Item className={styles.item} key={fruit} value={fruit.toLowerCase()}>
                  <Select.ItemText>{fruit}</Select.ItemText>
                  <Select.ItemIndicator className={styles.shortcut}>x</Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Group>
            <Select.Separator className={styles.separator} />
            <Select.Group>
              <Select.Label className={styles.groupLabel}>Vegetables</Select.Label>
              <Select.Item className={styles.item} value="carrot">
                <Select.ItemText>Carrot</Select.ItemText>
              </Select.Item>
              <Select.Item className={styles.item} disabled value="leek">
                <Select.ItemText>Leek (out of season)</Select.ItemText>
              </Select.Item>
            </Select.Group>
          </Select.Viewport>
          <Select.ScrollDownButton className={styles.note}>v</Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}
