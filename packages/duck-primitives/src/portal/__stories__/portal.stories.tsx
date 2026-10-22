import * as React from 'react'
import { Portal } from '..'
import styles from './portal.stories.module.css'

export default {
  title: 'Utilities/Portal',
}

export const ClippingBox = () => {
  const [shown, setShown] = React.useState(true)
  return (
    <div className={styles.page}>
      <label>
        <input checked={shown} onChange={(event) => setShown(event.target.checked)} type="checkbox" /> Shown
      </label>
      <div className={styles.clip} data-clip="">
        {shown && (
          <Portal data-portaled="">
            <p style={{ position: 'absolute', top: 120, left: 24, margin: 0 }}>Out of the box</p>
          </Portal>
        )}
      </div>
    </div>
  )
}

export const IntoRef = () => {
  const ref = React.useRef<HTMLElement>(null)
  return (
    <div className={styles.page}>
      <Portal container={ref}>
        <p>Rendered before its container</p>
      </Portal>
      <section aria-label="Target" className={styles.box} ref={ref} />
    </div>
  )
}

export const IntoForm = () => {
  const [form, setForm] = React.useState<HTMLFormElement | null>(null)
  const [sent, setSent] = React.useState('')
  return (
    <div className={styles.page}>
      <form
        className={styles.box}
        onSubmit={(event) => {
          event.preventDefault()
          setSent(
            new URLSearchParams([...new FormData(event.currentTarget)].map(([k, v]) => [k, String(v)])).toString(),
          )
        }}
        ref={setForm}>
        <input aria-label="Current" defaultValue="1" name="current" />
        <button type="submit">Send</button>
      </form>
      <Portal container={form}>
        <input aria-label="Note" defaultValue="hi" name="note" />
      </Portal>
      <output aria-label="Sent">{sent}</output>
    </div>
  )
}

export const IntoShadowRoot = () => {
  const [root, setRoot] = React.useState<ShadowRoot | null>(null)
  return (
    <div className={styles.page}>
      <div
        data-host=""
        ref={(host) => {
          if (host) setRoot(host.shadowRoot ?? host.attachShadow({ mode: 'open' }))
        }}
      />
      <Portal container={root}>
        <p>In the shadow</p>
      </Portal>
    </div>
  )
}

const Card = (props: React.ComponentProps<'aside'>) => <aside data-slot="card" {...props} />

export const AsChild = () => (
  <div className={styles.page}>
    <Portal asChild>
      <Card aria-label="Card">Slotted</Card>
    </Portal>
  </div>
)
