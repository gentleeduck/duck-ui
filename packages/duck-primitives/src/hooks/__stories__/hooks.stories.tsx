import * as React from 'react'
import { useControllableState } from '../use-controllable-state'
import { useEscapeKeydown } from '../use-escape-keydown'
import { FocusGuards } from '../use-focus-guard'
import { useId } from '../use-id'
import { usePrevious } from '../use-previous'
import { useSize } from '../use-size'
import { useStateMachine } from '../use-state-machine'
import styles from './hooks.stories.module.css'

export default {
  title: 'Utilities/Hooks',
}

export const EscapeKeydown = () => {
  const [count, setCount] = React.useState(0)
  useEscapeKeydown(() => setCount((value) => value + 1))
  return (
    <div className={styles.page}>
      <input aria-label="Text" />
      <output aria-label="Escapes">{count}</output>
    </div>
  )
}

export const Guards = () => {
  const [first, setFirst] = React.useState(false)
  const [second, setSecond] = React.useState(false)
  return (
    <div className={styles.page}>
      <label>
        <input checked={first} onChange={(event) => setFirst(event.target.checked)} type="checkbox" /> First
      </label>
      <label>
        <input checked={second} onChange={(event) => setSecond(event.target.checked)} type="checkbox" /> Second
      </label>
      {first && <FocusGuards />}
      {second && <FocusGuards />}
    </div>
  )
}

export const Size = () => {
  const [element, setElement] = React.useState<HTMLDivElement | null>(null)
  const [width, setWidth] = React.useState(100)
  const size = useSize(element)
  return (
    <div className={styles.page}>
      <button onClick={() => setWidth((value) => value + 100)} type="button">
        Wider
      </button>
      <div className={styles.box} ref={setElement} style={{ width, height: size ? size.width / 2.5 : 40 }} />
      <output aria-label="Size">{size ? `${size.width} x ${size.height}` : ''}</output>
    </div>
  )
}

function Switch(props: { checked?: boolean; defaultChecked?: boolean; onCheckedChange?: (checked: boolean) => void }) {
  const [checked, setChecked] = useControllableState({
    prop: props.checked,
    defaultProp: props.defaultChecked ?? false,
    onChange: props.onCheckedChange,
    caller: 'Switch',
  })
  return (
    <button aria-pressed={checked} onClick={() => setChecked((value) => !value)} type="button">
      {props.checked === undefined ? 'Uncontrolled' : 'Controlled'}
    </button>
  )
}

export const ControllableState = () => {
  const [checked, setChecked] = React.useState(false)
  const [log, setLog] = React.useState<string[]>([])
  return (
    <div className={styles.page}>
      <Switch defaultChecked onCheckedChange={(value) => setLog((list) => [...list, `uncontrolled ${value}`])} />
      <Switch
        checked={checked}
        onCheckedChange={(value) => {
          setLog((list) => [...list, `controlled ${value}`])
          setChecked(value)
        }}
      />
      <output aria-label="Changes">{log.join(', ')}</output>
    </div>
  )
}

export const Previous = () => {
  const [count, setCount] = React.useState(0)
  const [, setTick] = React.useState(0)
  const previous = usePrevious(count)
  return (
    <div className={styles.page}>
      <button onClick={() => setCount((value) => value + 1)} type="button">
        Count
      </button>
      <button onClick={() => setTick((value) => value + 1)} type="button">
        Render
      </button>
      <output aria-label="Previous">{`${previous} then ${count}`}</output>
    </div>
  )
}

const PLAYER = {
  stopped: { play: 'playing' },
  playing: { pause: 'paused', stop: 'stopped' },
  paused: { play: 'playing', stop: 'stopped' },
} as const

export const StateMachine = () => {
  const [state, send] = useStateMachine('stopped', PLAYER)
  return (
    <div className={styles.page}>
      {(['play', 'pause', 'stop'] as const).map((event) => (
        <button key={event} onClick={() => send(event)} type="button">
          {event}
        </button>
      ))}
      <button
        onClick={() => {
          send('play')
          send('pause')
        }}
        type="button">
        play then pause
      </button>
      <output aria-label="State">{state}</output>
    </div>
  )
}

function Field({ label }: { label: string }) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id}>{label}</label> <input id={id} />
    </div>
  )
}

export const Id = () => (
  <div className={styles.page}>
    <Field label="First" />
    <Field label="Second" />
  </div>
)
