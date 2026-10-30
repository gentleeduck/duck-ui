import * as React from 'react'
import { useCheckedSync, useSvgIndicator } from '..'
import styles from './checkers.stories.module.css'

export default {
  title: 'Components/Checkers',
}

export const Checkbox = () => {
  const { SvgIndicator, inputStyle } = useSvgIndicator({
    indicator: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
        <circle cx="8" cy="8" r="2" />
      </svg>
    ),
    checkedIndicator: (
      <svg viewBox="0 0 16 16">
        <path d="M3 8l3 3 7-7" fill="none" stroke="black" strokeWidth="2" />
      </svg>
    ),
    indeterminateIndicator: (
      <svg viewBox="0 0 16 16">
        <rect x="3" y="7" width="10" height="2" />
      </svg>
    ),
  })
  const ref = React.useRef<HTMLInputElement>(null)

  return (
    <>
      <SvgIndicator />
      <input aria-label="Accept" className={styles.box} ref={ref} style={inputStyle} type="checkbox" />
      <button type="button" onClick={() => ref.current && (ref.current.indeterminate = true)}>
        Mixed
      </button>
    </>
  )
}

export const Switch = () => {
  const { SvgIndicator, inputStyle } = useSvgIndicator({
    indicator: (
      <svg viewBox="0 0 40 20">
        <circle cx="10" cy="10" r="7" />
      </svg>
    ),
    checkedIndicator: (
      <svg viewBox="0 0 40 20">
        <circle cx="30" cy="10" r="7" />
      </svg>
    ),
  })

  return (
    <>
      <SvgIndicator />
      <input aria-label="Wi-Fi" className={styles.switch} role="switch" style={inputStyle} type="checkbox" />
    </>
  )
}

const check = (
  <svg viewBox="0 0 16 16">
    <path d="M3 8l3 3 7-7" fill="none" stroke="black" strokeWidth="2" />
  </svg>
)
const cross = (
  <svg viewBox="0 0 16 16">
    <path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="black" strokeWidth="2" />
  </svg>
)

export const ChangingIndicator = () => {
  const [crossed, setCrossed] = React.useState(false)
  const { SvgIndicator, inputStyle } = useSvgIndicator({ checkedIndicator: crossed ? cross : check })

  return (
    <>
      <SvgIndicator />
      <input aria-label="Done" className={styles.box} defaultChecked style={inputStyle} type="checkbox" />
      <button type="button" onClick={() => setCrossed((value) => !value)}>
        Swap mark
      </button>
    </>
  )
}

export const HeldByItsOwner = () => {
  const [checked, setChecked] = React.useState(false)
  const [heard, setHeard] = React.useState(0)
  const ref = React.useRef<HTMLInputElement>(null)
  const sync = useCheckedSync(ref, { checked, onChange: (event) => setChecked(event.target.checked) })

  return (
    <form onChange={() => setHeard((count) => count + 1)}>
      <input aria-label="Subscribe" checked={checked} ref={ref} type="checkbox" {...sync} />
      <button type="button" onClick={() => setChecked((value) => !value)}>
        Toggle from outside
      </button>
      <button type="reset">Reset</button>
      <output aria-label="Form heard">{heard}</output>
      <output aria-label="Owner holds">{String(checked)}</output>
    </form>
  )
}

export const LeftToItself = () => {
  const [clicks, setClicks] = React.useState(0)
  const ref = React.useRef<HTMLInputElement>(null)
  const sync = useCheckedSync(ref, { checked: undefined, onClick: () => setClicks((count) => count + 1) })

  return (
    <form>
      <input aria-label="Newsletter" defaultChecked ref={ref} type="checkbox" {...sync} />
      <button type="reset">Reset</button>
      <output aria-label="Clicks">{clicks}</output>
    </form>
  )
}

export const HeldWithoutForm = () => {
  const [checked, setChecked] = React.useState(false)
  const ref = React.useRef<HTMLInputElement>(null)
  const sync = useCheckedSync(ref, { checked, onChange: (event) => setChecked(event.target.checked) })

  return (
    <>
      <input aria-label="Remember me" checked={checked} ref={ref} type="checkbox" {...sync} />
      <button type="button" onClick={() => setChecked((value) => !value)}>
        Toggle from outside
      </button>
    </>
  )
}
