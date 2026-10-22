import * as React from 'react'
import { Mount, MountMinimal } from '..'
import styles from './mount.stories.module.css'

export default {
  title: 'Utilities/Mount',
}

export const FixedDuration = () => {
  const [open, setOpen] = React.useState(false)

  return (
    <div className={styles.page}>
      <button onClick={() => setOpen(!open)} type="button">
        {open ? 'Hide' : 'Show'}
      </button>
      <Mount animationDuration={300} open={open}>
        <p className={styles.notice} data-state={open ? 'open' : 'closed'} id="content">
          Saved. This stays 300ms after it hides, while it fades out.
        </p>
      </Mount>
    </div>
  )
}

const TRANSITIONS = {
  auto: 'height 300ms to auto, which cannot run',
  delayed: 'opacity 300ms after 300ms',
  none: 'none, under reduced motion',
  one: 'opacity 300ms',
  several: 'opacity 200ms, then translate 300ms after 300ms',
}

type Transition = keyof typeof TRANSITIONS

export const Minimal = () => {
  const [open, setOpen] = React.useState(false)
  const [transition, setTransition] = React.useState<Transition>('one')
  const [waits, setWaits] = React.useState(true)
  const [forceMount, setForceMount] = React.useState(false)
  const [renderOnce, setRenderOnce] = React.useState(false)
  const [skipWaiting, setSkipWaiting] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  return (
    <div className={styles.page}>
      <button onClick={() => setOpen(!open)} type="button">
        {open ? 'Close' : 'Open'}
      </button>
      <div className={styles.panel} data-state={open ? 'open' : 'closed'} data-transition={transition} ref={ref}>
        <MountMinimal
          forceMount={forceMount}
          open={open}
          ref={waits ? ref : undefined}
          renderOnce={renderOnce}
          skipWaiting={skipWaiting}>
          <label id="content">
            Note <input />
          </label>
        </MountMinimal>
      </div>
      <fieldset className={styles.controls}>
        <legend>Transition</legend>
        {(Object.keys(TRANSITIONS) as Transition[]).map((name) => (
          <label key={name}>
            <input checked={transition === name} name="transition" onChange={() => setTransition(name)} type="radio" />
            {TRANSITIONS[name]}
          </label>
        ))}
      </fieldset>
      <div className={styles.controls}>
        <label>
          <input checked={waits} onChange={(event) => setWaits(event.target.checked)} type="checkbox" />
          Wait for the panel
        </label>
        <label>
          <input checked={forceMount} onChange={(event) => setForceMount(event.target.checked)} type="checkbox" />
          forceMount
        </label>
        <label>
          <input checked={renderOnce} onChange={(event) => setRenderOnce(event.target.checked)} type="checkbox" />
          renderOnce
        </label>
        <label>
          <input checked={skipWaiting} onChange={(event) => setSkipWaiting(event.target.checked)} type="checkbox" />
          skipWaiting
        </label>
      </div>
    </div>
  )
}
