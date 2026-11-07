// From Radix UI primitives, apps/storybook/stories/popover.stories.tsx. MIT, see ../../__tests__/radix/LICENSE.

import * as React from 'react'
import { ExternalOverlayTrigger } from '../../__stories__/external-overlay'
import { Dialog, Popover } from '../../__stories__/radix-ui'
import styles from './popover.stories.module.css'

export default {
  title: 'Components/Popover',
}

export const WithExtensionOverlay = () => {
  const [open, setOpen] = React.useState(false)

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger className={styles.trigger}>open</Popover.Trigger>
        <Popover.Portal>
          <Popover.Content className={styles.content}>
            <ExternalOverlayTrigger />
            <Popover.Close className={styles.close}>close</Popover.Close>
            <Popover.Arrow className={styles.arrow} width={20} height={10} />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      <div data-testid="popover-state">{open ? 'open' : 'closed'}</div>
    </div>
  )
}

export const DismissesOnlyPopoverInsideDialog = () => {
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [popoverOpen, setPopoverOpen] = React.useState(false)
  const [isModal, setIsModal] = React.useState<boolean | undefined>(undefined)

  if (!dialogOpen && popoverOpen) {
    setPopoverOpen(false)
  }

  return (
    <div style={{ display: 'grid', gap: 16, padding: 40, justifyItems: 'start' }}>
      <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
        <Dialog.Trigger className={styles.trigger}>Open dialog</Dialog.Trigger>
        <label>
          <input
            type="checkbox"
            checked={isModal || false}
            ref={(node) => {
              if (node && isModal === undefined) {
                node.indeterminate = true
              }
            }}
            onChange={(event) => {
              event.target.indeterminate = false
              setIsModal((prev) => !prev)
            }}
          />
          <span>Modal</span>
        </label>
        <Dialog.Portal>
          <Dialog.Overlay
            data-testid="dialog-overlay"
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
          />
          <Dialog.Content
            style={{
              position: 'fixed',
              top: 100,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 320,
              padding: 20,
              backgroundColor: 'white',
              border: '1px solid #ccc',
              borderRadius: 8,
            }}>
            <Dialog.Title>Dialog with nested popover</Dialog.Title>
            <Popover.Root open={popoverOpen} onOpenChange={setPopoverOpen} modal={isModal}>
              <Popover.Trigger className={styles.trigger}>Open popover</Popover.Trigger>
              <Popover.Portal>
                <Popover.Content className={styles.content} sideOffset={5}>
                  <Popover.Close className={styles.close}>Close popover</Popover.Close>
                  <Popover.Arrow className={styles.arrow} width={20} height={10} />
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
            <p style={{ marginTop: 12, marginBottom: 0 }}>
              dialog: {dialogOpen ? 'open' : 'closed'} | popover: {popoverOpen ? 'open' : 'closed'}
            </p>
            <Dialog.Close style={{ marginTop: 12 }}>Close dialog</Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}

export const Basic = () => {
  const [open, setOpen] = React.useState(false)
  const [modal, setModal] = React.useState(false)
  const [rtl, setRtl] = React.useState(false)
  const [anchored, setAnchored] = React.useState(false)
  const [sideRight, setSideRight] = React.useState(false)
  const [focusHeight, setFocusHeight] = React.useState(false)
  const [leaveFocus, setLeaveFocus] = React.useState(false)
  const [keepMounted, setKeepMounted] = React.useState(false)
  const [clicks, setClicks] = React.useState(0)
  const height = React.useRef<HTMLInputElement>(null)
  const toggles = [
    ['Modal', modal, setModal],
    ['Right-to-left', rtl, setRtl],
    ['Custom anchor', anchored, setAnchored],
    ['Side right', sideRight, setSideRight],
    ['Focus height first', focusHeight, setFocusHeight],
    ['Leave focus on close', leaveFocus, setLeaveFocus],
    ['Keep mounted', keepMounted, setKeepMounted],
  ] as const

  return (
    <div className={styles.page}>
      <button type="button" onClick={() => setClicks((count) => count + 1)}>
        Outside
      </button>
      <output aria-label="Outside clicks">{clicks}</output>
      <Popover.Root dir={rtl ? 'rtl' : 'ltr'} modal={modal} onOpenChange={setOpen} open={open}>
        <Popover.Trigger className={styles.trigger}>Dimensions</Popover.Trigger>
        {anchored ? <Popover.Anchor className={styles.anchor}>Anchor</Popover.Anchor> : null}
        <Popover.Portal forceMount={keepMounted || undefined}>
          <Popover.Content
            className={styles.panel}
            finalFocus={leaveFocus ? false : undefined}
            initialFocus={focusHeight ? height : undefined}
            side={sideRight ? 'right' : 'bottom'}
            sideOffset={5}>
            <Popover.Title>Layer size</Popover.Title>
            <Popover.Description>Set the width and height of the layer.</Popover.Description>
            <label>
              Width <input defaultValue="100%" />
            </label>
            <label>
              Height <input defaultValue="25px" ref={height} />
            </label>
            <Popover.Close aria-label="Close">x</Popover.Close>
            <Popover.Arrow className={styles.arrow} width={20} height={10} />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      <output aria-label="State">{open ? 'open' : 'closed'}</output>
      <button type="button" onClick={() => setOpen(true)}>
        Open from outside
      </button>
      {toggles.map(([label, checked, set]) => (
        <label key={label}>
          <input type="checkbox" checked={checked} onChange={(event) => set(event.target.checked)} />
          {label}
        </label>
      ))}
    </div>
  )
}

export const Animated = () => {
  const [keepMounted, setKeepMounted] = React.useState(false)

  return (
    <div className={styles.page}>
      <label>
        <input
          checked={keepMounted}
          onChange={(event) => setKeepMounted(event.currentTarget.checked)}
          type="checkbox"
        />
        Keep mounted
      </label>
      <Popover.Root>
        <Popover.Trigger className={styles.trigger}>Filters</Popover.Trigger>
        <Popover.Portal forceMount={keepMounted || undefined}>
          <Popover.Content aria-label="Filters" className={styles.animated} sideOffset={5}>
            <label>
              <input type="checkbox" /> In stock
            </label>
            <Popover.Close>Done</Popover.Close>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  )
}

const sides = ['top', 'right', 'bottom', 'left'] as const
const aligns = ['start', 'center', 'end'] as const

export const Placement = () => {
  const [side, setSide] = React.useState<(typeof sides)[number]>('bottom')
  const [align, setAlign] = React.useState<(typeof aligns)[number]>('center')
  const [rtl, setRtl] = React.useState(false)

  return (
    <div className={styles.page}>
      <fieldset>
        <legend>Side</legend>
        {sides.map((value) => (
          <label key={value}>
            <input checked={side === value} name="side" onChange={() => setSide(value)} type="radio" />
            {value}
          </label>
        ))}
      </fieldset>
      <fieldset>
        <legend>Align</legend>
        {aligns.map((value) => (
          <label key={value}>
            <input checked={align === value} name="align" onChange={() => setAlign(value)} type="radio" />
            {value}
          </label>
        ))}
      </fieldset>
      <label>
        <input checked={rtl} onChange={(event) => setRtl(event.currentTarget.checked)} type="checkbox" />
        Right to left
      </label>
      <Popover.Root dir={rtl ? 'rtl' : undefined}>
        <Popover.Trigger className={styles.target}>Placed</Popover.Trigger>
        <Popover.Portal>
          <Popover.Content align={align} aria-label="Placement" className={styles.panel} side={side} sideOffset={8}>
            {side}, {align}
            <Popover.Arrow className={styles.arrow} height={6} width={12} />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  )
}

export const Nested = () => {
  const [modal, setModal] = React.useState(false)

  return (
    <div className={styles.page}>
      <label>
        <input checked={modal} onChange={(event) => setModal(event.currentTarget.checked)} type="checkbox" />
        Modal
      </label>
      <Popover.Root modal={modal}>
        <Popover.Trigger className={styles.trigger}>Share</Popover.Trigger>
        <Popover.Portal>
          <Popover.Content aria-label="Share" className={styles.panel} sideOffset={5}>
            <label>
              Link <input defaultValue="https://example.com/report" readOnly />
            </label>
            <Popover.Root modal={modal}>
              <Popover.Trigger>Permissions</Popover.Trigger>
              <Popover.Portal>
                <Popover.Content aria-label="Permissions" className={styles.panel} side="right" sideOffset={5}>
                  <label>
                    <input defaultChecked name="access" type="radio" /> Can view
                  </label>
                  <label>
                    <input name="access" type="radio" /> Can edit
                  </label>
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      <button type="button">Outside</button>
    </div>
  )
}

const ToolbarButton = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<'button'>>((props, ref) => (
  <button type="button" {...props} className={styles.toolbarButton} ref={ref} />
))

export const AsChild = () => (
  <div className={styles.page}>
    <Popover.Root>
      <Popover.Trigger asChild>
        <ToolbarButton aria-label="Text colour">A</ToolbarButton>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content asChild sideOffset={5}>
          <section aria-label="Colours" className={styles.panel}>
            {['Ink', 'Moss', 'Rust'].map((colour) => (
              <Popover.Close key={colour}>{colour}</Popover.Close>
            ))}
          </section>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  </div>
)

export const InScrollBox = () => (
  <div className={styles.page}>
    {/* biome-ignore lint/a11y/noNoninteractiveTabindex: a scrolling region takes focus so a keyboard can scroll it. */}
    <div aria-label="Orders" className={styles.scrollBox} role="region" tabIndex={0}>
      <Popover.Root>
        <Popover.Trigger className={styles.trigger}>Order 1042</Popover.Trigger>
        <Popover.Portal>
          <Popover.Content aria-label="Order details" className={styles.panel} hideWhenDetached sideOffset={5}>
            Shipped in two parcels.
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      <p className={styles.filler}>More orders below.</p>
    </div>
  </div>
)
