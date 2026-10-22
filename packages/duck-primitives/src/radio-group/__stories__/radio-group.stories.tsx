import * as React from 'react'
import * as RadioGroup from '..'
import styles from './radio-group.stories.module.css'

export default {
  title: 'Components/RadioGroup',
}

const FRUITS = ['Apple', 'Banana', 'Cherry', 'Durian', 'Elderberry']

export const Basic = () => {
  const [value, setValue] = React.useState('')
  const [rtl, setRtl] = React.useState(false)
  const [horizontal, setHorizontal] = React.useState(false)
  const [loop, setLoop] = React.useState(true)
  const [groupDisabled, setGroupDisabled] = React.useState(false)
  const [bananaDisabled, setBananaDisabled] = React.useState(true)
  const [readOnly, setReadOnly] = React.useState(false)
  const [submitted, setSubmitted] = React.useState('')
  const [changes, setChanges] = React.useState(0)

  const toggles: [string, boolean, (on: boolean) => void][] = [
    ['Right-to-left', rtl, setRtl],
    ['Horizontal', horizontal, setHorizontal],
    ['Loop', loop, setLoop],
    ['Disable the group', groupDisabled, setGroupDisabled],
    ['Disable Banana', bananaDisabled, setBananaDisabled],
    ['Read-only', readOnly, setReadOnly],
  ]

  return (
    <div className={styles.page}>
      <form
        className={styles.page}
        onChange={() => setChanges((count) => count + 1)}
        onSubmit={(event) => {
          event.preventDefault()
          setSubmitted(String(new FormData(event.currentTarget).get('fruit')))
        }}>
        <RadioGroup.Root
          aria-label="Fruit"
          className={styles.group}
          dir={rtl ? 'rtl' : undefined}
          disabled={groupDisabled}
          loop={loop}
          name="fruit"
          onValueChange={setValue}
          orientation={horizontal ? 'horizontal' : undefined}
          readOnly={readOnly}
          required
          value={value}>
          {FRUITS.map((fruit) => (
            <div className={styles.item} key={fruit}>
              <RadioGroup.Item
                className={styles.radio}
                disabled={fruit === 'Banana' && bananaDisabled}
                id={`fruit-${fruit}`}
                textValue={fruit}
                value={fruit}>
                <RadioGroup.Indicator className={styles.indicator} />
              </RadioGroup.Item>
              <label htmlFor={`fruit-${fruit}`}>{fruit}</label>
            </div>
          ))}
        </RadioGroup.Root>
        <div className={styles.controls}>
          <button type="submit">Submit</button>
          <button type="reset">Reset</button>
        </div>
      </form>
      <div className={styles.controls}>
        <button onClick={() => setValue('Durian')} type="button">
          Pick Durian
        </button>
        <output aria-label="Value">{value}</output>
        <output aria-label="Submitted">{submitted}</output>
        <output aria-label="Form changes">{changes}</output>
      </div>
      <div className={styles.controls}>
        {toggles.map(([label, on, set]) => (
          <label key={label}>
            <input checked={on} onChange={(event) => set(event.target.checked)} type="checkbox" />
            {label}
          </label>
        ))}
      </div>
    </div>
  )
}

const PLANS = ['Hobby', 'Pro', 'Team']

export const Composed = () => {
  const [submitted, setSubmitted] = React.useState('')

  return (
    <div className={styles.page}>
      <form
        id="plan-form"
        onSubmit={(event) => {
          event.preventDefault()
          setSubmitted(String(new FormData(event.currentTarget).get('plan')))
        }}>
        <button type="submit">Submit plan</button>
      </form>
      <RadioGroup.Root aria-label="Plan" className={styles.cards} defaultValue="Pro" form="plan-form" name="plan">
        {PLANS.map((plan) => (
          <RadioGroup.ItemProvider disabled={plan === 'Team'} key={plan} value={plan}>
            <RadioGroup.ItemTrigger className={styles.card} textValue={plan}>
              <RadioGroup.Indicator className={styles.indicator} forceMount />
              {plan}
            </RadioGroup.ItemTrigger>
            <RadioGroup.ItemBubbleInput />
          </RadioGroup.ItemProvider>
        ))}
      </RadioGroup.Root>
      <output aria-label="Submitted plan">{submitted}</output>
    </div>
  )
}
