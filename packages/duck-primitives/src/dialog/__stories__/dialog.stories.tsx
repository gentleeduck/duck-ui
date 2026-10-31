// From Radix UI primitives, apps/storybook/stories/dialog.stories.tsx. MIT, see ../../__tests__/radix/LICENSE.

import * as React from 'react'
import { ExternalOverlayTrigger } from '../../__stories__/external-overlay'
import { Dialog, DropdownMenu, Popover } from '../../__stories__/radix-ui'
import styles from './dialog.stories.module.css'

export default {
  title: 'Components/Dialog',
}

const PONDS = Array.from({ length: 30 }, (_, index) => `Pond ${index + 1}`)

export const Basic = () => {
  const [open, setOpen] = React.useState(false)
  const [modal, setModal] = React.useState(true)
  const [lockScroll, setLockScroll] = React.useState(true)
  const [rtl, setRtl] = React.useState(false)
  const [presses, setPresses] = React.useState(0)
  const toggles = [
    ['Modal', modal, setModal],
    ['Lock scroll', lockScroll, setLockScroll],
    ['Right-to-left', rtl, setRtl],
  ] as const

  return (
    <div className={styles.page}>
      {toggles.map(([label, checked, set]) => (
        <label key={label}>
          <input checked={checked} onChange={(event) => set(event.target.checked)} type="checkbox" />
          {label}
        </label>
      ))}
      <Dialog.Root dir={rtl ? 'rtl' : 'ltr'} modal={modal} onOpenChange={setOpen} open={open}>
        <Dialog.Trigger className={styles.trigger}>Pond settings</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className={styles.overlay} data-testid="overlay" lockScroll={lockScroll} />
          <Dialog.Content className={styles.contentDefault}>
            <Dialog.Title>Pond settings</Dialog.Title>
            <Dialog.Description>Pick the ponds the ducks may visit.</Dialog.Description>
            <ul aria-label="Ponds" className={styles.list}>
              {PONDS.map((pond) => (
                <li key={pond}>{pond}</li>
              ))}
            </ul>
            <Popover.Root>
              <Popover.Trigger>Find a duck</Popover.Trigger>
              <Popover.Portal>
                <Popover.Content aria-label="Find a duck" className={styles.popover} sideOffset={4}>
                  <input aria-label="Duck name" />
                  <ul aria-label="Ducks" className={styles.list}>
                    {PONDS.map((pond) => (
                      <li key={pond}>Duck of {pond}</li>
                    ))}
                  </ul>
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
            <Dialog.Close className={styles.close}>Done</Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <button onClick={() => setPresses((count) => count + 1)} type="button">
        Page button
      </button>
      <output aria-label="State">{open ? 'open' : 'closed'}</output>
      <output aria-label="Page presses">{presses}</output>
    </div>
  )
}

export const Cypress = () => {
  const [modal, setModal] = React.useState(true)
  const [animated, setAnimated] = React.useState(false)
  const [count, setCount] = React.useState(0)
  const [hasDestroyButton, setHasDestroyButton] = React.useState(true)

  return (
    <>
      <Dialog.Root modal={modal}>
        <Dialog.Trigger className={styles.trigger}>open</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Content
            className={[styles.contentDefault, animated && styles.animatedContent, animated && styles.duration50]
              .filter(Boolean)
              .join(' ')}>
            <Dialog.Title>title</Dialog.Title>
            <Dialog.Description>description</Dialog.Description>
            <Dialog.Close className={styles.close}>close</Dialog.Close>
            {hasDestroyButton && (
              <div>
                <button type="button" onClick={() => setHasDestroyButton(false)}>
                  destroy me
                </button>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <br />
      <br />

      <label>
        <input type="checkbox" checked={modal} onChange={(event) => setModal(Boolean(event.target.checked))} /> modal
      </label>

      <br />

      <label>
        <input type="checkbox" checked={animated} onChange={(event) => setAnimated(Boolean(event.target.checked))} />{' '}
        animated
      </label>

      <br />

      <label>
        count up{' '}
        <button type="button" onClick={() => setCount((count) => count + 1)}>
          {count}
        </button>
      </label>

      <br />

      <label>
        name: <input type="text" placeholder="name" />
      </label>
    </>
  )
}

export const WithExtensionOverlay = () => {
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger className={styles.trigger}>open</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className={styles.overlay} />
          <Dialog.Content className={styles.contentDefault}>
            <Dialog.Title>title</Dialog.Title>
            <Dialog.Description>Simulates extension UI interacting with a dialog.</Dialog.Description>
            <ExternalOverlayTrigger />
            <Dialog.Close className={styles.close}>close</Dialog.Close>
            <InsideShadowSuggestion />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <div data-testid="dialog-state">{open ? 'open' : 'closed'}</div>
    </>
  )
}

function InsideShadowSuggestion() {
  const hostRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const host = hostRef.current
    if (!host || host.shadowRoot) return

    const shadowRoot = host.attachShadow({ mode: 'open' })
    const button = document.createElement('button')
    button.type = 'button'
    button.textContent = 'inside shadow suggestion'
    button.style.marginTop = '16px'
    shadowRoot.append(button)
  }, [])

  return <div data-testid="inside-shadow-host" ref={hostRef} />
}

export const WithDropdownMenu = () => {
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger className={styles.trigger}>open</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className={styles.overlay} data-testid="overlay" />
          <Dialog.Content className={styles.contentDefault}>
            <Dialog.Title>title</Dialog.Title>
            <Dialog.Description>A dialog containing a dropdown menu.</Dialog.Description>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger className={styles.trigger}>open menu</DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  sideOffset={5}
                  style={{ background: 'white', border: '1px solid black', padding: 8 }}>
                  <DropdownMenu.Item>menu item</DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
            <Dialog.Close className={styles.close}>close</Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <div data-testid="dialog-state">{open ? 'open' : 'closed'}</div>
    </>
  )
}

export const FocusTargets = () => {
  const nameRef = React.useRef<HTMLInputElement>(null)
  const nextRef = React.useRef<HTMLButtonElement>(null)
  const [focusName, setFocusName] = React.useState(true)
  const [focusNext, setFocusNext] = React.useState(true)

  return (
    <>
      <label>
        <input checked={focusName} onChange={(event) => setFocusName(event.target.checked)} type="checkbox" />
        focus the name on open
      </label>
      <label>
        <input checked={focusNext} onChange={(event) => setFocusNext(event.target.checked)} type="checkbox" />
        focus next step on close
      </label>
      <Dialog.Root>
        <Dialog.Trigger className={styles.trigger}>rename</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className={styles.overlay} />
          <Dialog.Content
            className={styles.contentDefault}
            finalFocus={focusNext && nextRef}
            initialFocus={focusName && nameRef}>
            <Dialog.Title>Rename the pond</Dialog.Title>
            <Dialog.Description>Pick a name the ducks will like.</Dialog.Description>
            <Dialog.Close className={styles.close}>cancel</Dialog.Close>
            <label>
              name <input defaultValue="Mill pond" ref={nameRef} />
            </label>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <button ref={nextRef} type="button">
        next step
      </button>
    </>
  )
}

export const GuardedAndNested = () => {
  const [open, setOpen] = React.useState(false)
  const [dirty, setDirty] = React.useState(false)
  const [confirming, setConfirming] = React.useState(false)
  const keepWhileDirty = (event: Event) => {
    if (dirty) event.preventDefault()
  }

  return (
    <>
      <Dialog.Root
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) setDirty(false)
        }}>
        <Dialog.Trigger className={styles.trigger}>edit</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className={styles.overlay} data-testid="overlay" />
          <Dialog.Content
            className={styles.contentDefault}
            onEscapeKeyDown={keepWhileDirty}
            onPointerDownOutside={keepWhileDirty}>
            <Dialog.Title>Edit the pond</Dialog.Title>
            <Dialog.Description>Unsaved notes keep it open until they are discarded.</Dialog.Description>
            <label>
              notes <input onChange={() => setDirty(true)} />
            </label>
            <Dialog.Root open={confirming} onOpenChange={setConfirming}>
              <Dialog.Trigger className={styles.trigger}>discard</Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className={styles.overlay} data-testid="nested-overlay" />
                <Dialog.Content className={styles.contentDefault}>
                  <Dialog.Title>Discard the notes?</Dialog.Title>
                  <Dialog.Description>They are gone once discarded.</Dialog.Description>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirming(false)
                      setOpen(false)
                      setDirty(false)
                    }}>
                    discard notes
                  </button>
                  <Dialog.Close className={styles.close}>keep editing</Dialog.Close>
                  <Dialog.Root>
                    <Dialog.Trigger className={styles.trigger}>why</Dialog.Trigger>
                    <Dialog.Portal>
                      <Dialog.Overlay className={styles.overlay} />
                      <Dialog.Content className={styles.contentDefault}>
                        <Dialog.Title>Why discard?</Dialog.Title>
                        <Dialog.Description>Unsaved notes hold the pond open to every other edit.</Dialog.Description>
                        <Dialog.Close className={styles.close}>got it</Dialog.Close>
                      </Dialog.Content>
                    </Dialog.Portal>
                  </Dialog.Root>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <output aria-label="State">{open ? (dirty ? 'open, unsaved' : 'open') : 'closed'}</output>
    </>
  )
}
