import * as React from 'react'
import { createPortal } from 'react-dom'
import { Frame, ShadowRoot } from '../../__stories__/hosts'
import { FocusScope, FocusScopeBranchProvider, useFocusScopeBranch, useFocusScopeBranchRegistry } from '..'
import styles from './focus-scope.stories.module.css'

export default { title: 'Components/FocusScope' }

type Toggle = readonly [string, boolean, (checked: boolean) => void]

function Toggles({ toggles }: { toggles: readonly Toggle[] }) {
  return toggles.map(([label, checked, set]) => (
    <label key={label}>
      <input checked={checked} onChange={(event) => set(event.target.checked)} type="checkbox" />
      {label}
    </label>
  ))
}

function useEvents() {
  const [events, setEvents] = React.useState<string[]>([])
  const record =
    (name: string, prevent = false) =>
    (event: Event) => {
      setEvents((all) => [...all, name])
      if (prevent) event.preventDefault()
    }
  return [events.join(', '), record] as const
}

function Form({ onClose }: { onClose: () => void }) {
  return (
    <>
      <input aria-label="Name" defaultValue="Ada Lovelace" />
      <button type="button">Save</button>
      <button onClick={onClose} type="button">
        Close
      </button>
    </>
  )
}

export const Basic = () => {
  const [open, setOpen] = React.useState(false)
  const [trapped, setTrapped] = React.useState(true)
  const [loop, setLoop] = React.useState(true)
  const [preventMount, setPreventMount] = React.useState(false)
  const [preventUnmount, setPreventUnmount] = React.useState(false)
  const [lastKey, setLastKey] = React.useState('')
  const [events, record] = useEvents()

  return (
    <div className={styles.page}>
      <Toggles
        toggles={[
          ['Trapped', trapped, setTrapped],
          ['Loop', loop, setLoop],
          ['Prevent focus on mount', preventMount, setPreventMount],
          ['Prevent focus on unmount', preventUnmount, setPreventUnmount],
        ]}
      />
      <button onClick={() => setOpen(true)} type="button">
        Open
      </button>
      {open ? (
        <FocusScope
          aria-label="Scope"
          className={styles.scope}
          loop={loop}
          onKeyDown={(event) => setLastKey(event.key)}
          onMountAutoFocus={record('onMountAutoFocus', preventMount)}
          onUnmountAutoFocus={record('onUnmountAutoFocus', preventUnmount)}
          role="group"
          trapped={trapped}>
          <a href="#help">Help</a>
          <Form onClose={() => setOpen(false)} />
        </FocusScope>
      ) : null}
      <button type="button">Outside</button>
      <button onFocus={(event) => event.stopPropagation()} type="button">
        Widget keeping its focus events
      </button>
      <output aria-label="Events">{events}</output>
      <output aria-label="Last key">{lastKey}</output>
    </div>
  )
}

export const Removal = () => {
  const [shown, setShown] = React.useState(true)

  return (
    <div className={styles.page}>
      <FocusScope aria-label="Scope" className={styles.scope} role="group" trapped>
        <button type="button">Stay</button>
        {shown ? (
          <button onClick={() => setShown(false)} type="button">
            Remove me
          </button>
        ) : null}
      </FocusScope>
      <button type="button">Outside</button>
    </div>
  )
}

function Radio({
  name,
  value,
  checked,
  onCheck,
}: {
  name: string
  value: string
  checked: string
  onCheck: (value: string) => void
}) {
  return (
    <label>
      <input checked={checked === value} name={name} onChange={() => onCheck(value)} type="radio" value={value} />
      {value}
    </label>
  )
}

export const Radios = () => {
  const [size, setSize] = React.useState('')
  const [colour, setColour] = React.useState('')

  return (
    <div className={styles.page}>
      <FocusScope aria-label="Scope" className={styles.scope} loop role="group" trapped>
        {['S', 'M', 'L'].map((value) => (
          <Radio checked={size} key={value} name="size" onCheck={setSize} value={value} />
        ))}
        <button type="button">Middle</button>
        {['Red', 'Green', 'Blue'].map((value) => (
          <Radio checked={colour} key={value} name="colour" onCheck={setColour} value={value} />
        ))}
      </FocusScope>
    </div>
  )
}

export const Skipped = () => (
  <div className={styles.page}>
    <FocusScope aria-label="Scope" className={styles.scope} loop role="group" trapped>
      <button disabled type="button">
        Disabled
      </button>
      <div hidden>
        <button type="button">Hidden</button>
      </div>
      <button type="button">First</button>
      <button type="button">Last</button>
      <button style={{ visibility: 'hidden' }} type="button">
        Invisible
      </button>
      <div style={{ display: 'none' }}>
        <button type="button">Not displayed</button>
      </div>
      <div inert>
        <button type="button">Inert</button>
      </div>
      <fieldset disabled>
        <button type="button">In a disabled fieldset</button>
      </fieldset>
      <input type="hidden" />
      <button tabIndex={-1} type="button">
        Out of the tab order
      </button>
    </FocusScope>
  </div>
)

// Tab from a stop with tabIndex 1 reaches one with tabIndex 2 before the next stop inside the scope.
export const PositiveTabIndex = () => (
  <div className={styles.page}>
    <div tabIndex={-1}>
      <input aria-label="Outside second" tabIndex={2} />
      <input aria-label="Outside first" tabIndex={1} />
    </div>
    <FocusScope aria-label="Scope" className={styles.scope} loop role="group" trapped>
      <input aria-label="Inside first" tabIndex={1} />
      <input aria-label="Inside second" />
    </FocusScope>
  </div>
)

export const Svg = () => (
  <div className={styles.page}>
    <FocusScope aria-label="Scope" className={styles.scope} loop role="group" trapped>
      <button type="button">Before the icon</button>
      <svg aria-label="Icon" className={styles.icon} role="img" tabIndex={0} viewBox="0 0 16 16">
        <circle cx="8" cy="8" r="6" />
      </svg>
    </FocusScope>
  </div>
)

export const Nested = () => {
  const [inner, setInner] = React.useState(false)
  const [section, setSection] = React.useState(false)
  const content = (
    <>
      <button type="button">Inner button</button>
      <label>
        <input checked={section} onChange={(event) => setSection(event.target.checked)} type="checkbox" />
        Replace this element
      </label>
      <button onClick={() => setInner(false)} type="button">
        Close inner
      </button>
    </>
  )

  return (
    <div className={styles.page}>
      <FocusScope aria-label="Outer" className={styles.scope} loop role="group" trapped>
        <button onClick={() => setInner(true)} type="button">
          Open inner
        </button>
        <button type="button">Outer button</button>
      </FocusScope>
      {inner
        ? createPortal(
            <FocusScope asChild loop trapped>
              {section ? (
                <section aria-label="Inner" className={styles.floating}>
                  {content}
                </section>
              ) : (
                <div aria-label="Inner" className={styles.floating} role="group">
                  {content}
                </div>
              )}
            </FocusScope>,
            document.body,
          )
        : null}
      <button type="button">Outside</button>
    </div>
  )
}

function Branch() {
  const [node, setNode] = React.useState<HTMLDivElement | null>(null)
  useFocusScopeBranch(node)
  return createPortal(
    <div aria-label="Branch" className={styles.floating} ref={setNode} role="group">
      <button type="button">Branch button</button>
    </div>,
    document.body,
  )
}

export const Branches = () => {
  const { nodes, registry } = useFocusScopeBranchRegistry()

  return (
    <div className={styles.page}>
      <FocusScopeBranchProvider registry={registry}>
        <FocusScope aria-label="Scope" branches={nodes} className={styles.scope} role="group" trapped>
          <button type="button">Inside</button>
          <Branch />
          {createPortal(
            <div aria-label="Stray" className={styles.stray} role="group">
              <button type="button">Stray button</button>
            </div>,
            document.body,
          )}
        </FocusScope>
      </FocusScopeBranchProvider>
      <button type="button">Outside</button>
    </div>
  )
}

export const ShadowContent = () => (
  <div className={styles.page}>
    <FocusScope aria-label="Scope" className={styles.scope} role="group" trapped>
      <button type="button">Before</button>
      <ShadowRoot>
        <input aria-label="Shadow field" />
      </ShadowRoot>
    </FocusScope>
    <button type="button">Outside</button>
  </div>
)

function Opened() {
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <button onClick={() => setOpen(true)} type="button">
        Open
      </button>
      {open ? (
        <FocusScope aria-label="Scope" loop role="group" trapped>
          <Form onClose={() => setOpen(false)} />
        </FocusScope>
      ) : null}
      <button type="button">Outside</button>
    </>
  )
}

export const InIframe = () => (
  <div className={styles.page}>
    <button type="button">Page button</button>
    <Frame className={styles.frame}>
      <Opened />
    </Frame>
  </div>
)

export const InShadowRoot = () => (
  <div className={styles.page}>
    <button type="button">Page button</button>
    <ShadowRoot>
      <Opened />
    </ShadowRoot>
  </div>
)
