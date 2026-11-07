import * as React from 'react'
import * as Dialog from '../../dialog'
import * as Toggle from '../../toggle'
import * as Tooltip from '..'
import styles from './tooltip.stories.module.css'

export default { title: 'Components/Tooltip' }

function Toggles({ toggles }: { toggles: readonly (readonly [string, boolean, (checked: boolean) => void])[] }) {
  return toggles.map(([label, checked, set]) => (
    <label key={label}>
      <input checked={checked} onChange={(event) => set(event.target.checked)} type="checkbox" />
      {label}
    </label>
  ))
}

export const Basic = () => {
  const [changes, setChanges] = React.useState<string[]>([])
  const [disabled, setDisabled] = React.useState(false)
  const [notHoverable, setNotHoverable] = React.useState(false)
  const [lingers, setLingers] = React.useState(false)
  const [keepOnClick, setKeepOnClick] = React.useState(false)

  return (
    <div className={styles.page}>
      <Tooltip.Provider delayDuration={300} skipDelayDuration={500}>
        <div className={styles.row}>
          <button type="button">Before</button>
          <Tooltip.Root
            closeDelay={lingers ? 600 : undefined}
            disableHoverableContent={notHoverable}
            disabled={disabled}
            onOpenChange={(open) => setChanges((list) => [...list, String(open)])}>
            <Tooltip.Trigger disableCloseOnClick={keepOnClick}>Bold</Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content className={styles.content} side="bottom" sideOffset={8}>
                Makes the text bold
                <Tooltip.Arrow className={styles.arrow} />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
          <Tooltip.Root>
            <Tooltip.Trigger>Italic</Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content className={styles.content} side="bottom" sideOffset={8}>
                Slants the text
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </div>
      </Tooltip.Provider>
      <output aria-label="Changes">{changes.join(', ')}</output>
      <Toggles
        toggles={[
          ['Disabled', disabled, setDisabled],
          ['Content not hoverable', notHoverable, setNotHoverable],
          ['Close delay', lingers, setLingers],
          ['Stay open on click', keepOnClick, setKeepOnClick],
        ]}
      />
    </div>
  )
}

export const Controlled = () => {
  const [open, setOpen] = React.useState(false)
  const [locked, setLocked] = React.useState(false)
  const [asked, setAsked] = React.useState<string[]>([])

  return (
    <div className={styles.page}>
      <Tooltip.Provider delayDuration={0}>
        <Tooltip.Root
          onOpenChange={(next) => {
            setAsked((list) => [...list, String(next)])
            if (!locked) setOpen(next)
          }}
          open={open}>
          <Tooltip.Trigger>Help</Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content aria-label="Opens the guide" className={styles.content} side="right">
              Opens the guide (F1)
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>
      <output aria-label="Asked">{asked.join(', ')}</output>
      <button onClick={() => setOpen((value) => !value)} type="button">
        Toggle from outside
      </button>
      <Toggles toggles={[['Locked', locked, setLocked]]} />
    </div>
  )
}

export const ToggleTrigger = () => (
  <div className={styles.page}>
    <Tooltip.Provider delayDuration={0}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild disableCloseOnClick>
          <Toggle.Root aria-label="Underline">U</Toggle.Root>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content className={styles.content} side="bottom">
            Underlines the text
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  </div>
)

export const OnDialogTrigger = () => (
  <div className={styles.page}>
    <Tooltip.Provider delayDuration={0}>
      <Dialog.Root>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <Dialog.Trigger>Share</Dialog.Trigger>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content className={styles.content} side="bottom">
              Shares the file
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
        <Dialog.Portal>
          <Dialog.Content className={styles.dialog}>
            <Dialog.Title>Share the file</Dialog.Title>
            <Dialog.Description>Anyone with the link can view it.</Dialog.Description>
            <input aria-label="Link" readOnly value="https://example.com/files/report" />
            <Dialog.Close>Done</Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </Tooltip.Provider>
  </div>
)
