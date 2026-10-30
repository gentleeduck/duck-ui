import * as React from 'react'
import * as Slider from '..'
import styles from './slider.stories.module.css'

export default { title: 'Components/Slider' }

function Toggles({ toggles }: { toggles: readonly (readonly [string, boolean, (checked: boolean) => void])[] }) {
  return toggles.map(([label, checked, set]) => (
    <label key={label}>
      <input type="checkbox" checked={checked} onChange={(event) => set(event.target.checked)} />
      {label}
    </label>
  ))
}

export const Basic = () => {
  const [value, setValue] = React.useState([30])
  const [committed, setCommitted] = React.useState([30])
  const [rtl, setRtl] = React.useState(false)
  const [vertical, setVertical] = React.useState(false)
  const [inverted, setInverted] = React.useState(false)
  const [disabled, setDisabled] = React.useState(false)

  return (
    <div className={styles.page}>
      <Slider.Root
        className={styles.root}
        dir={rtl ? 'rtl' : undefined}
        disabled={disabled}
        inverted={inverted}
        largeStep={20}
        onValueChange={setValue}
        onValueCommit={setCommitted}
        orientation={vertical ? 'vertical' : 'horizontal'}
        step={5}
        value={value}>
        <Slider.Track className={styles.track}>
          <Slider.Range className={styles.range} />
        </Slider.Track>
        <Slider.Thumb aria-label="Volume" className={styles.thumb} />
      </Slider.Root>
      <output aria-label="Value">{value.join(', ')}</output>
      <output aria-label="Committed">{committed.join(', ')}</output>
      <Toggles
        toggles={[
          ['Right-to-left', rtl, setRtl],
          ['Vertical', vertical, setVertical],
          ['Inverted', inverted, setInverted],
          ['Disabled', disabled, setDisabled],
        ]}
      />
    </div>
  )
}

export const Range = () => {
  const [keepOrder, setKeepOrder] = React.useState(false)
  const [value, setValue] = React.useState([20, 80])
  const [commits, setCommits] = React.useState(0)

  return (
    <div className={styles.page}>
      <Slider.Root
        className={styles.root}
        defaultValue={[20, 80]}
        key={String(keepOrder)}
        minStepsBetweenThumbs={10}
        onValueChange={setValue}
        onValueCommit={() => setCommits((count) => count + 1)}
        preserveThumbOrder={keepOrder}>
        <Slider.Track className={styles.track}>
          <Slider.Range className={styles.range} />
        </Slider.Track>
        <Slider.Thumb className={styles.thumb}>
          <span className={styles.grip} />
        </Slider.Thumb>
        <Slider.Thumb className={styles.thumb}>
          <span className={styles.grip} />
        </Slider.Thumb>
        <Slider.Value>{(values) => `${values[0]} to ${values[1]}`}</Slider.Value>
      </Slider.Root>
      <output aria-label="Value">{value.join(', ')}</output>
      <output aria-label="Commits">{commits}</output>
      <Toggles toggles={[['Keep order', keepOrder, setKeepOrder]]} />
    </div>
  )
}

export const InForm = () => {
  const [submitted, setSubmitted] = React.useState('')
  const [changed, setChanged] = React.useState('')
  const [ratingChanges, setRatingChanges] = React.useState(0)

  return (
    <div className={styles.page}>
      <form
        id="filters"
        onChange={(event) => {
          const input = event.nativeEvent.target
          if (input instanceof HTMLInputElement) setChanged(`${input.name}=${input.value}`)
        }}
        onSubmit={(event) => {
          event.preventDefault()
          const entries = Array.from(new FormData(event.currentTarget), ([name, value]) => `${name}=${value}`)
          setSubmitted(entries.join('&'))
        }}>
        <Slider.Root className={styles.root} defaultValue={[20, 60]} name="price">
          <Slider.Track className={styles.track}>
            <Slider.Range className={styles.range} />
          </Slider.Track>
          <Slider.Thumb className={styles.thumb} />
          <Slider.Thumb className={styles.thumb} />
        </Slider.Root>
        <button type="submit">Apply</button>
        <button type="reset">Reset</button>
      </form>
      <Slider.Root
        className={styles.root}
        defaultValue={[3]}
        form="filters"
        max={5}
        min={1}
        name="rating"
        onValueChange={() => setRatingChanges((count) => count + 1)}>
        <Slider.Track className={styles.track}>
          <Slider.Range className={styles.range} />
        </Slider.Track>
        <Slider.Thumb aria-label="Rating" className={styles.thumb} />
      </Slider.Root>
      <output aria-label="Changed">{changed}</output>
      <output aria-label="Rating changes">{ratingChanges}</output>
      <output aria-label="Submitted">{submitted}</output>
    </div>
  )
}

export const Composed = () => {
  const [changed, setChanged] = React.useState('')

  return (
    <div className={styles.page}>
      <Slider.Root
        className={styles.root}
        defaultValue={[40]}
        name="volume"
        onChange={(event) => {
          const input = event.nativeEvent.target
          if (input instanceof HTMLInputElement) setChanged(`${input.name}=${input.value}`)
        }}>
        <Slider.Track className={styles.track}>
          <Slider.Range className={styles.range} />
        </Slider.Track>
        <Slider.ThumbProvider>
          <Slider.ThumbTrigger aria-label="Volume" className={styles.thumb} />
          <Slider.BubbleInput aria-label="Volume input" />
        </Slider.ThumbProvider>
      </Slider.Root>
      <output aria-label="Changed">{changed}</output>
    </div>
  )
}
