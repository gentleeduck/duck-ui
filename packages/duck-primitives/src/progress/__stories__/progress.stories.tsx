import * as React from 'react'
import * as Progress from '..'
import styles from './progress.stories.module.css'

export default {
  title: 'Components/Progress',
}

const SCALES = {
  files: {
    getValueLabel: (value: number, max: number) => `${value} of ${max} files`,
    max: 8,
    min: 0,
    start: 3,
    step: 1,
  },
  'from 20': { getValueLabel: undefined, max: 120, min: 20, start: 70, step: 10 },
  percent: { getValueLabel: undefined, max: 100, min: 0, start: 30, step: 10 },
}

type Scale = keyof typeof SCALES

function percent(value: number | null, min: number, max: number) {
  return value !== null && value >= min && value <= max ? ((value - min) / (max - min)) * 100 : 0
}

export const Basic = () => {
  const [scaleName, setScaleName] = React.useState<Scale>('percent')
  const [value, setValue] = React.useState<number | null>(30)
  const [rtl, setRtl] = React.useState(false)
  const [rtlPage, setRtlPage] = React.useState(false)
  const [labelled, setLabelled] = React.useState(true)
  const scale = SCALES[scaleName]
  const at = value ?? scale.min

  return (
    <div className={styles.page} dir={rtlPage ? 'rtl' : undefined}>
      <Progress.Root
        className={styles.root}
        dir={rtl ? 'rtl' : undefined}
        getValueLabel={scale.getValueLabel}
        max={scale.max}
        min={scale.min}
        value={value}>
        {labelled && <Progress.Label>Upload</Progress.Label>}
        <Progress.Value />
        <div className={styles.track}>
          <Progress.Indicator
            className={styles.indicator}
            style={
              value === null || value < scale.min || value > scale.max
                ? undefined
                : { width: `${percent(value, scale.min, scale.max)}%` }
            }
          />
        </div>
        <Progress.Value>
          {(label, current) => (current === null ? 'Waiting to start' : `Done: ${label}`)}
        </Progress.Value>
      </Progress.Root>
      <div className={styles.controls}>
        <button onClick={() => setValue(Math.min(scale.max, at + scale.step))} type="button">
          Step
        </button>
        <button onClick={() => setValue(Math.max(scale.min, at - scale.step))} type="button">
          Back
        </button>
        <button onClick={() => setValue(scale.max)} type="button">
          Finish
        </button>
        <button onClick={() => setValue(null)} type="button">
          Unknown amount
        </button>
        <button onClick={() => setValue(scale.max + 1)} type="button">
          Overshoot
        </button>
      </div>
      <fieldset className={styles.controls}>
        <legend>Scale</legend>
        {(Object.keys(SCALES) as Scale[]).map((name) => (
          <label key={name}>
            <input
              checked={scaleName === name}
              name="scale"
              onChange={() => {
                setScaleName(name)
                setValue(SCALES[name].start)
              }}
              type="radio"
            />
            {name}
          </label>
        ))}
      </fieldset>
      <div className={styles.controls}>
        <label>
          <input checked={rtl} onChange={(event) => setRtl(event.target.checked)} type="checkbox" />
          Right-to-left
        </label>
        <label>
          <input checked={rtlPage} onChange={(event) => setRtlPage(event.target.checked)} type="checkbox" />
          Right-to-left page
        </label>
        <label>
          <input checked={labelled} onChange={(event) => setLabelled(event.target.checked)} type="checkbox" />
          Show label
        </label>
      </div>
    </div>
  )
}
