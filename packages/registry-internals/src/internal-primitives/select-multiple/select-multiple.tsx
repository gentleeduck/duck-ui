'use client'

import * as Select from '@gentleduck/primitives/select'
import * as React from 'react'
import styles from '../primitives.module.css'

const TAGS = ['design', 'frontend', 'backend', 'docs', 'testing']

export default function SelectMultipleExample() {
  const [tags, setTags] = React.useState<string[]>(['frontend'])

  return (
    <Select.Root multiple onValueChange={setTags} value={tags}>
      <Select.Trigger aria-label="Tags" className={styles.trigger}>
        <Select.Value placeholder="No tags">{(picked) => `${picked.length} tags: ${picked.join(', ')}`}</Select.Value>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className={styles.content} position="popper" sideOffset={6}>
          <Select.Viewport>
            {TAGS.map((tag) => (
              <Select.Item className={styles.item} key={tag} value={tag}>
                <Select.ItemIndicator>x</Select.ItemIndicator>
                <Select.ItemText>{tag}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}
