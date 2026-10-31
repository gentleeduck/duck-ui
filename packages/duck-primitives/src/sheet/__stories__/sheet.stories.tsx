import * as React from 'react'
import * as Sheet from '..'
import styles from './sheet.stories.module.css'

export default { title: 'Components/Sheet' }

const OPTIONS = Array.from({ length: 40 }, (_, index) => `Option ${index + 1}`)

export const Basic = () => {
  const [open, setOpen] = React.useState(false)
  const [rtl, setRtl] = React.useState(false)
  const [start, setStart] = React.useState(false)
  const [nonModal, setNonModal] = React.useState(false)
  const [clicks, setClicks] = React.useState(0)
  const toggles = [
    ['Right-to-left', rtl, setRtl],
    ['Start side', start, setStart],
    ['Non-modal', nonModal, setNonModal],
  ] as const

  return (
    <div className={styles.page}>
      <button type="button" onClick={() => setClicks((count) => count + 1)}>
        Outside
      </button>
      <output aria-label="Outside clicks">{clicks}</output>
      <Sheet.Root dir={rtl ? 'rtl' : undefined} modal={!nonModal} onOpenChange={setOpen} open={open}>
        <Sheet.Trigger>Settings</Sheet.Trigger>
        <Sheet.Portal>
          <Sheet.Overlay className={styles.overlay} />
          <Sheet.Content className={styles.panel} data-side={start ? 'start' : 'end'}>
            <Sheet.Title>Settings</Sheet.Title>
            <Sheet.Description>Changes save when the panel closes.</Sheet.Description>
            <div aria-label="Options" className={styles.body} role="group">
              {OPTIONS.map((option) => (
                <label key={option}>
                  <input type="checkbox" /> {option}
                </label>
              ))}
            </div>
            <Sheet.Close>Done</Sheet.Close>
          </Sheet.Content>
        </Sheet.Portal>
      </Sheet.Root>
      <output aria-label="State">{open ? 'open' : 'closed'}</output>
      {toggles.map(([label, checked, set]) => (
        <label key={label}>
          <input type="checkbox" checked={checked} onChange={(event) => set(event.target.checked)} />
          {label}
        </label>
      ))}
    </div>
  )
}
