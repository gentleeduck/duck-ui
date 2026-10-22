import * as React from 'react'
import { createSlot, Slot, Slottable } from '..'
import styles from './slot.stories.module.css'

export default {
  title: 'Utilities/Slot',
}

const Button = React.forwardRef<HTMLButtonElement, React.ComponentProps<'button'> & { asChild?: boolean }>(
  ({ asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return <Comp {...props} ref={ref} />
  },
)

export const AsChild = () => {
  const [calls, setCalls] = React.useState<string[]>([])
  const [note, setNote] = React.useState(true)
  const [refs, setRefs] = React.useState('')
  const buttonRef = React.useRef<HTMLButtonElement>(null)
  const linkRef = React.useRef<HTMLAnchorElement>(null)

  return (
    <div className={styles.page}>
      <Button
        aria-describedby="hint"
        asChild
        className={styles.button}
        onClick={(event) => {
          event.preventDefault()
          setCalls((all) => [...all, 'button'])
        }}
        ref={buttonRef}
        style={{ color: 'black', padding: '8px 16px' }}>
        <a
          aria-describedby={(note && 'note') as string}
          className={styles.link}
          href="#docs"
          onClick={() => setCalls((all) => [...all, 'link'])}
          ref={linkRef}
          style={{ color: 'royalblue' }}>
          Docs
        </a>
      </Button>
      <p id="note">Opens the guide.</p>
      <p id="hint">Press Enter or click.</p>
      <label>
        <input checked={note} onChange={(event) => setNote(event.target.checked)} type="checkbox" />
        Note
      </label>
      <button onClick={() => setRefs([buttonRef.current?.tagName, linkRef.current?.tagName].join(' '))} type="button">
        Read refs
      </button>
      <output aria-label="Calls">{calls.join(', ')}</output>
      <output aria-label="Refs">{refs}</output>
    </div>
  )
}

export const Icons = () => {
  const [icon, setIcon] = React.useState(true)

  return (
    <div className={styles.page}>
      <Slot className={styles.field} data-field="">
        {icon && <span aria-hidden="true">@</span>}
        <Slottable>
          <label>
            Email <input name="email" />
          </label>
        </Slottable>
        <span aria-hidden="true">.com</span>
      </Slot>
      <label>
        <input checked={icon} onChange={(event) => setIcon(event.target.checked)} type="checkbox" />
        Icon
      </label>
    </div>
  )
}

export const RenderProp = () => (
  <div className={styles.page}>
    <Slot className={styles.button}>
      <Slottable child={<a href="#tags">Tags</a>}>{(label) => <span className={styles.label}>{label}</span>}</Slottable>
      <span aria-hidden="true">-&gt;</span>
    </Slot>
  </div>
)

const LazyLink = React.lazy(
  () =>
    new Promise<{ default: React.ComponentType<React.ComponentProps<'a'>> }>((resolve) =>
      setTimeout(() => resolve({ default: (props) => <a {...props} /> }), 300),
    ),
)

export const Lazy = () => (
  <div className={styles.page}>
    <React.Suspense fallback={<p>Loading</p>}>
      <Slot className={styles.button}>
        <LazyLink href="#lazy">Lazy docs</LazyLink>
      </Slot>
    </React.Suspense>
  </div>
)

const ToolbarSlot = createSlot('Toolbar.Button')

class Boundary extends React.Component<{ children: React.ReactNode }, { message: string }> {
  override state = { message: '' }
  static getDerivedStateFromError(error: Error) {
    return { message: error.message }
  }
  override render() {
    return this.state.message ? <p role="alert">{this.state.message}</p> : this.props.children
  }
}

const UNSLOTTABLE = {
  elements: [
    <a href="#one" key="one">
      One
    </a>,
    <a href="#two" key="two">
      Two
    </a>,
  ],
  slottable: <Slottable>Text</Slottable>,
  text: 'Text',
}

export const Unslottable = () => {
  const [child, setChild] = React.useState<keyof typeof UNSLOTTABLE>('text')

  return (
    <div className={styles.page}>
      <div className={styles.controls}>
        {(Object.keys(UNSLOTTABLE) as (keyof typeof UNSLOTTABLE)[]).map((name) => (
          <label key={name}>
            <input checked={child === name} name="child" onChange={() => setChild(name)} type="radio" />
            {name}
          </label>
        ))}
      </div>
      <Boundary key={child}>
        <ToolbarSlot>{UNSLOTTABLE[child]}</ToolbarSlot>
      </Boundary>
    </div>
  )
}

export const RefThatRenders = () => {
  const [attached, setAttached] = React.useState(0)
  const [, render] = React.useReducer((count: number) => count + 1, 0)
  const ref = React.useCallback((node: HTMLElement | null) => {
    if (node) setAttached((count) => count + 1)
  }, [])

  return (
    <div className={styles.page}>
      <Slot ref={ref}>
        <button onClick={render} type="button">
          Render again
        </button>
      </Slot>
      <output aria-label="Attached">{attached}</output>
    </div>
  )
}

export const RawHtml = () => (
  <div className={styles.page}>
    <Slot className={styles.field} data-raw="">
      <span dangerouslySetInnerHTML={{ __html: '<b id="injected">raw</b>' }} />
    </Slot>
  </div>
)
