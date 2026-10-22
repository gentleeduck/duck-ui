import * as React from 'react'
import { createPortal } from 'react-dom'
import { Frame, ShadowRoot } from '../../__stories__/hosts'
import { DismissableLayer, DismissableLayerBranch, useDismissableLayerSurface } from '..'
import styles from './dismissable-layer.stories.module.css'

export default { title: 'Components/DismissableLayer' }

type Toggle = readonly [string, boolean, (checked: boolean) => void]

function Toggles({ toggles }: { toggles: readonly Toggle[] }) {
  return toggles.map(([label, checked, set]) => (
    <label key={label}>
      <input checked={checked} onChange={(event) => set(event.target.checked)} type="checkbox" />
      {label}
    </label>
  ))
}

// Opens on the press, as a menu trigger does, so that press reaches the document after the layer mounts. It keeps
// focus off itself, which would otherwise be focus outside the layer it just opened.
function Opener({ children, onOpen }: { children: React.ReactNode; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      onPointerDown={(event) => {
        event.preventDefault()
        onOpen()
      }}
      type="button">
      {children}
    </button>
  )
}

function Counter({ label, onPress }: { label: string; onPress?: (event: React.MouseEvent) => void }) {
  const [count, setCount] = React.useState(0)
  return (
    <span className={styles.row}>
      <button
        onClick={(event) => {
          onPress?.(event)
          setCount((current) => current + 1)
        }}
        type="button">
        {label}
      </button>
      <output aria-label={`${label} presses`}>{count}</output>
    </span>
  )
}

function useEvents() {
  const [events, setEvents] = React.useState<string[]>([])
  const record =
    (name: string, prevent = false) =>
    (event?: Event) => {
      setEvents((all) => [...all, name])
      if (prevent) event?.preventDefault()
    }
  return [events.join(', '), record] as const
}

export const Basic = () => {
  const [open, setOpen] = React.useState(false)
  const [preventEscape, setPreventEscape] = React.useState(false)
  const [preventPress, setPreventPress] = React.useState(false)
  const [preventFocus, setPreventFocus] = React.useState(false)
  const [blockPage, setBlockPage] = React.useState(false)
  const [events, record] = useEvents()

  return (
    <div className={styles.page}>
      <Toggles
        toggles={[
          ['Prevent Escape', preventEscape, setPreventEscape],
          ['Prevent press outside', preventPress, setPreventPress],
          ['Prevent focus outside', preventFocus, setPreventFocus],
        ]}
      />
      <Opener onOpen={() => setOpen(true)}>Open</Opener>
      {open ? (
        <DismissableLayer
          aria-label="Layer"
          className={styles.layer}
          disableOutsidePointerEvents={blockPage}
          onDismiss={() => {
            record('onDismiss')()
            setOpen(false)
          }}
          onEscapeKeyDown={record('onEscapeKeyDown', preventEscape)}
          onFocusOutside={record('onFocusOutside', preventFocus)}
          onInteractOutside={record('onInteractOutside')}
          onPointerDownOutside={record('onPointerDownOutside', preventPress)}
          role="group">
          <button type="button">Inside</button>
          <input aria-label="Inside field" />
          <label>
            <input checked={blockPage} onChange={(event) => setBlockPage(event.target.checked)} type="checkbox" />
            Block the page
          </label>
        </DismissableLayer>
      ) : null}
      <Counter label="Outside" />
      <input aria-label="Outside field" />
      <p>Outside text</p>
      <output aria-label="Events">{events}</output>
    </div>
  )
}

export const Nested = () => {
  const [parentOpen, setParentOpen] = React.useState(false)
  const [childOpen, setChildOpen] = React.useState(false)
  const [modalParent, setModalParent] = React.useState(false)
  const [modalChild, setModalChild] = React.useState(false)

  return (
    <div className={styles.page}>
      <Toggles
        toggles={[
          ['Parent blocks the page', modalParent, setModalParent],
          ['Child blocks the page', modalChild, setModalChild],
        ]}
      />
      <Opener onOpen={() => setParentOpen(true)}>Open parent</Opener>
      {parentOpen ? (
        <DismissableLayer
          aria-label="Parent"
          className={styles.layer}
          disableOutsidePointerEvents={modalParent}
          onDismiss={() => {
            setParentOpen(false)
            setChildOpen(false)
          }}
          role="group">
          <Opener onOpen={() => setChildOpen(true)}>Open child</Opener>
          <button type="button">Parent button</button>
          {childOpen
            ? createPortal(
                <DismissableLayer
                  aria-label="Child"
                  className={styles.floating}
                  disableOutsidePointerEvents={modalChild}
                  onDismiss={() => setChildOpen(false)}
                  role="group">
                  <button type="button">Child button</button>
                </DismissableLayer>,
                document.body,
              )
            : null}
        </DismissableLayer>
      ) : null}
      <Counter label="Outside" />
      <p>Outside text</p>
    </div>
  )
}

export const Branch = () => {
  const [open, setOpen] = React.useState(false)

  return (
    <div className={styles.page}>
      <Opener onOpen={() => setOpen(true)}>Open</Opener>
      {open ? (
        <DismissableLayer aria-label="Layer" className={styles.layer} onDismiss={() => setOpen(false)} role="group">
          <button type="button">Inside</button>
        </DismissableLayer>
      ) : null}
      <DismissableLayerBranch aria-label="Branch" className={styles.row} role="region">
        <button type="button">Branch button</button>
        <input aria-label="Branch field" />
      </DismissableLayerBranch>
      <Counter label="Outside" />
      <input aria-label="Outside field" />
    </div>
  )
}

function Surface() {
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: a backdrop for the pointer, as a dialog's overlay is
    // biome-ignore lint/a11y/useKeyWithClickEvents: a backdrop for the pointer, as a dialog's overlay is
    <div
      className={styles.surface}
      data-testid="surface"
      onClick={(event) => event.stopPropagation()}
      ref={useDismissableLayerSurface()}
    />
  )
}

export const DeferredPress = () => {
  const [open, setOpen] = React.useState(false)
  const [defer, setDefer] = React.useState(true)
  const [events, record] = useEvents()

  return (
    <div className={styles.page}>
      <Toggles toggles={[['Defer press outside', defer, setDefer]]} />
      <Opener onOpen={() => setOpen(true)}>Open</Opener>
      {open ? (
        <DismissableLayer
          aria-label="Layer"
          className={styles.layer}
          deferPointerDownOutside={defer}
          onDismiss={() => {
            record('onDismiss')()
            setOpen(false)
          }}
          onPointerDownOutside={record('onPointerDownOutside')}
          role="group">
          <button type="button">Inside</button>
        </DismissableLayer>
      ) : null}
      <Counter label="Outside" />
      <Counter label="Stops its click" onPress={(event) => event.stopPropagation()} />
      <div className={styles.behind}>
        <Counter label="Behind" />
        {open ? <Surface /> : null}
      </div>
      <output aria-label="Events">{events}</output>
    </div>
  )
}

function ScrollBox({ dir, styled }: { dir: 'ltr' | 'rtl'; styled: boolean }) {
  return (
    <div
      aria-label={`Scroll box ${dir}`}
      className={styled ? styles.styledScroller : styles.scroller}
      dir={dir}
      role="region"
      // biome-ignore lint/a11y/noNoninteractiveTabindex: the box holds nothing focusable, so without Tab a keyboard cannot scroll it
      tabIndex={0}>
      <div />
    </div>
  )
}

// Styled scrollbars take room in the box, where the overlay scrollbars a headless browser draws take none.
const PAGE_SCROLLBAR =
  'html::-webkit-scrollbar { width: 12px; height: 12px } html::-webkit-scrollbar-thumb { background: #888 }'

function ScrollbarsPage({ styled }: { styled: boolean }) {
  const [open, setOpen] = React.useState(false)
  const [events, record] = useEvents()

  return (
    <div className={styles.page}>
      {styled ? <style>{PAGE_SCROLLBAR}</style> : null}
      <Opener onOpen={() => setOpen(true)}>Open</Opener>
      {open ? (
        <DismissableLayer
          aria-label="Layer"
          className={styles.layer}
          onDismiss={() => setOpen(false)}
          onFocusOutside={record('onFocusOutside')}
          onPointerDownOutside={record('onPointerDownOutside')}
          role="group">
          <button type="button">Inside</button>
        </DismissableLayer>
      ) : null}
      <output aria-label="Events">{events}</output>
      <ScrollBox dir="ltr" styled={styled} />
      <ScrollBox dir="rtl" styled={styled} />
      <div className={styles.tall} />
    </div>
  )
}

export const Scrollbars = () => <ScrollbarsPage styled />

// The scrollbars the system draws, which macOS draws over the box and the page, taking no room.
export const SystemScrollbars = () => <ScrollbarsPage styled={false} />

export const InIframe = () => {
  const [open, setOpen] = React.useState(false)
  const [blockFrame, setBlockFrame] = React.useState(true)

  return (
    <div className={styles.page}>
      <Toggles toggles={[['Block the frame', blockFrame, setBlockFrame]]} />
      <Counter label="Page button" />
      <Frame className={styles.frame}>
        <Opener onOpen={() => setOpen(true)}>Open</Opener>
        {open ? (
          <DismissableLayer
            aria-label="Layer"
            disableOutsidePointerEvents={blockFrame}
            onDismiss={() => setOpen(false)}
            role="group">
            <button type="button">Inside</button>
          </DismissableLayer>
        ) : null}
        <Counter label="Frame button" />
      </Frame>
    </div>
  )
}

export const InShadowRoot = () => {
  const [open, setOpen] = React.useState(false)
  const [defer, setDefer] = React.useState(false)
  const [pressed, setPressed] = React.useState('')
  const [events, record] = useEvents()

  return (
    <div className={styles.page}>
      <Toggles toggles={[['Defer press outside', defer, setDefer]]} />
      <ShadowRoot>
        <Opener onOpen={() => setOpen(true)}>Open</Opener>
        {open ? (
          <DismissableLayer
            aria-label="Layer"
            className={styles.layer}
            deferPointerDownOutside={defer}
            onDismiss={() => setOpen(false)}
            onFocusOutside={record('onFocusOutside')}
            onPointerDownOutside={(event) => {
              record('onPointerDownOutside')()
              setPressed(event.target instanceof Element ? (event.target.textContent ?? '') : '')
            }}
            role="group">
            <button type="button">Inside</button>
          </DismissableLayer>
        ) : null}
        <output aria-label="Events">{events}</output>
        <output aria-label="Pressed">{pressed}</output>
        <DismissableLayerBranch aria-label="Branch" role="region">
          <button type="button">Branch button</button>
          <input aria-label="Branch field" />
        </DismissableLayerBranch>
        <Counter label="Outside" />
        <ScrollBox dir="ltr" styled />
      </ShadowRoot>
    </div>
  )
}
