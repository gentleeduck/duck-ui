'use client'

import * as Select from '@gentleduck/primitives/select'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function SelectFormExample() {
  const [sent, setSent] = React.useState('')

  return (
    <form
      className={styles.stack}
      onSubmit={(event) => {
        event.preventDefault()
        setSent(String(new FormData(event.currentTarget).get('role')))
      }}>
      <Select.Root autoComplete="organization-title" name="role" required>
        <Select.Trigger aria-label="Role" className={styles.trigger}>
          <Select.Value placeholder="Pick a role" />
        </Select.Trigger>
        <Select.Portal>
          <Select.Content className={styles.content}>
            <Select.Viewport>
              {['viewer', 'editor', 'owner'].map((role) => (
                <Select.Item className={styles.item} key={role} value={role}>
                  <Select.ItemText>{role}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
      <div className={styles.row}>
        <button className={`${styles.button} ${styles.primary}`} type="submit">
          Invite
        </button>
        <button className={styles.button} type="reset">
          Reset
        </button>
      </div>
      <p className={styles.note}>
        {sent ? `Submitted role=${sent}` : 'name submits the pick, required refuses an empty one.'}
      </p>
    </form>
  )
}
