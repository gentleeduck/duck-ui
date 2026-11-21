'use client'

import { useSvgIndicator } from '@gentleduck/primitives/checkers'
import * as React from 'react'
import styles from '../primitives.module.css'

const ICON = { fill: 'none', stroke: 'black', strokeLinecap: 'round', strokeWidth: 2.5, viewBox: '0 0 16 16' } as const

export default function CheckersSvgIndicatorExample() {
  const all = React.useRef<HTMLInputElement>(null)
  const [picked, setPicked] = React.useState([true, false, true])
  const { SvgIndicator, inputStyle } = useSvgIndicator({
    checkedIndicator: (
      <svg {...ICON}>
        <path d="M3 8.5l3 3 7-7" />
      </svg>
    ),
    indeterminateIndicator: (
      <svg {...ICON}>
        <path d="M3.5 8h9" />
      </svg>
    ),
  })
  const count = picked.filter(Boolean).length

  React.useEffect(() => {
    if (all.current) all.current.indeterminate = count > 0 && count < picked.length
  }, [count, picked.length])

  return (
    <div className={styles.choices}>
      <SvgIndicator />
      <label className={styles.choice}>
        <input
          checked={count === picked.length}
          className={styles.nativeCheck}
          onChange={(event) => setPicked(picked.map(() => event.target.checked))}
          ref={all}
          style={inputStyle}
          type="checkbox"
        />
        Every channel
      </label>
      {['Email', 'Push', 'SMS'].map((channel, index) => (
        <label className={styles.choice} key={channel} style={{ paddingInlineStart: '1.5rem' }}>
          <input
            checked={picked[index]}
            className={styles.nativeCheck}
            onChange={(event) => setPicked(picked.map((value, at) => (at === index ? event.target.checked : value)))}
            style={inputStyle}
            type="checkbox"
          />
          {channel}
        </label>
      ))}
    </div>
  )
}
