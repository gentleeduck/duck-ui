'use client'

import { useSvgIndicator } from '@gentleduck/primitives/checkers'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function CheckersSwitchIndicatorExample() {
  const [on, setOn] = React.useState(true)
  const { SvgIndicator, inputStyle } = useSvgIndicator({
    checkedIndicator: (
      <svg viewBox="0 0 32 16">
        <circle cx="24" cy="8" r="6" />
      </svg>
    ),
    indicator: (
      <svg viewBox="0 0 32 16">
        <circle cx="8" cy="8" r="6" />
      </svg>
    ),
  })

  return (
    <label className={styles.choice}>
      <SvgIndicator />
      <input
        aria-checked={on}
        checked={on}
        className={styles.nativeSwitch}
        onChange={(event) => setOn(event.target.checked)}
        role="switch"
        style={inputStyle}
        type="checkbox"
      />
      Wi-Fi
    </label>
  )
}
