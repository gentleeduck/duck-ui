// From Radix UI primitives, apps/storybook/stories/toggle-group.stories.tsx. MIT, see ../../__tests__/radix/LICENSE.

import * as React from 'react'
import { Dialog, ToggleGroup } from '../../__stories__/radix-ui'
import styles from './toggle-group.stories.module.css'

export default {
  title: 'Components/ToggleGroup',
}

export const Cypress = () => (
  <Dialog.Root>
    <Dialog.Trigger>open</Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Overlay style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)' }} />
      <Dialog.Content
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'white',
          padding: 20,
          borderRadius: 8,
        }}>
        <Dialog.Title>title</Dialog.Title>
        <ToggleGroup.Root type="single" className={styles.root} aria-label="Options">
          <ToggleGroup.Item value="1" className={styles.item}>
            Option 1
          </ToggleGroup.Item>
          <ToggleGroup.Item value="2" className={styles.item}>
            Option 2
          </ToggleGroup.Item>
          <ToggleGroup.Item value="3" className={styles.item}>
            Option 3
          </ToggleGroup.Item>
        </ToggleGroup.Root>
        <Dialog.Close>close</Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
)

function Toggles({ toggles }: { toggles: readonly (readonly [string, boolean, (checked: boolean) => void])[] }) {
  return toggles.map(([label, checked, set]) => (
    <label key={label}>
      <input checked={checked} onChange={(event) => set(event.target.checked)} type="checkbox" />
      {label}
    </label>
  ))
}

export const Single = () => {
  const [value, setValue] = React.useState('center')
  const [rtl, setRtl] = React.useState(false)
  const [vertical, setVertical] = React.useState(false)
  const [noLoop, setNoLoop] = React.useState(false)
  const [kept, setKept] = React.useState(false)
  const [disabled, setDisabled] = React.useState(false)

  return (
    <div className={styles.page}>
      <button type="button">Before</button>
      <ToggleGroup.Root
        aria-label="Alignment"
        className={styles.group}
        defaultValue="center"
        deselectable={!kept}
        dir={rtl ? 'rtl' : undefined}
        disabled={disabled}
        loop={!noLoop}
        onValueChange={setValue}
        orientation={vertical ? 'vertical' : undefined}
        type="single">
        <ToggleGroup.Item className={styles.item} value="left">
          Left
        </ToggleGroup.Item>
        <ToggleGroup.Item className={styles.item} value="center">
          Center
        </ToggleGroup.Item>
        <ToggleGroup.Item className={styles.item} disabled value="justify">
          Justify
        </ToggleGroup.Item>
        <ToggleGroup.Item className={styles.item} value="right">
          {(pressed) => (pressed ? 'Right (on)' : 'Right')}
        </ToggleGroup.Item>
      </ToggleGroup.Root>
      <button type="button">After</button>
      <output aria-label="Value">{value}</output>
      <Toggles
        toggles={[
          ['Right-to-left', rtl, setRtl],
          ['Vertical', vertical, setVertical],
          ['No loop', noLoop, setNoLoop],
          ['Keep one on', kept, setKept],
          ['Disabled', disabled, setDisabled],
        ]}
      />
    </div>
  )
}

export const Multiple = () => {
  const [value, setValue] = React.useState(['bold'])
  const [flat, setFlat] = React.useState(false)
  const [kept, setKept] = React.useState(false)

  return (
    <div className={styles.page}>
      <button type="button">Before</button>
      <ToggleGroup.Root
        aria-label="Formatting"
        className={styles.group}
        defaultValue={['bold']}
        deselectable={!kept}
        onValueChange={setValue}
        rovingFocus={!flat}
        type="multiple">
        <ToggleGroup.Item className={styles.item} value="bold">
          Bold
        </ToggleGroup.Item>
        <ToggleGroup.Item className={styles.item} value="italic">
          Italic
        </ToggleGroup.Item>
        <ToggleGroup.Item className={styles.item} disabled value="strike">
          Strike
        </ToggleGroup.Item>
        <ToggleGroup.Item className={styles.item} value="underline">
          Underline
        </ToggleGroup.Item>
      </ToggleGroup.Root>
      <button type="button">After</button>
      <output aria-label="Value">{value.join(', ')}</output>
      <Toggles
        toggles={[
          ['Roving focus off', flat, setFlat],
          ['Keep one on', kept, setKept],
        ]}
      />
    </div>
  )
}

export const Controlled = () => {
  const [value, setValue] = React.useState('day')
  const [locked, setLocked] = React.useState(false)
  const [asked, setAsked] = React.useState<string[]>([])

  return (
    <div className={styles.page}>
      <ToggleGroup.Root
        aria-label="Range"
        className={styles.group}
        onValueChange={(next) => {
          setAsked((list) => [...list, next || '(none)'])
          if (!locked) setValue(next)
        }}
        type="single"
        value={value}>
        <ToggleGroup.Item className={styles.item} value="day">
          Day
        </ToggleGroup.Item>
        <ToggleGroup.Item className={styles.item} value="week">
          Week
        </ToggleGroup.Item>
        <ToggleGroup.Item className={styles.item} value="month">
          Month
        </ToggleGroup.Item>
      </ToggleGroup.Root>
      <output aria-label="Asked">{asked.join(', ')}</output>
      <button onClick={() => setValue('month')} type="button">
        Month from outside
      </button>
      <Toggles toggles={[['Locked', locked, setLocked]]} />
    </div>
  )
}
