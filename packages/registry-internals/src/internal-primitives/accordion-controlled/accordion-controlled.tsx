'use client'

import * as Accordion from '@gentleduck/primitives/accordion'
import * as React from 'react'
import styles from '../primitives.module.css'

const STEPS = ['Details', 'Address', 'Payment']

export default function AccordionControlledExample() {
  const [value, setValue] = React.useState('Details')
  const [focused, setFocused] = React.useState<string | null>(null)
  const at = STEPS.indexOf(value)

  return (
    <div className={styles.stack}>
      <Accordion.Root
        className={styles.disclosure}
        onFocusChange={setFocused}
        onValueChange={setValue}
        type="single"
        value={value}>
        {STEPS.map((step) => (
          <Accordion.Item className={styles.disclosureItem} key={step} value={step}>
            <Accordion.Header className={styles.disclosureHeader}>
              <Accordion.Trigger className={styles.disclosureTrigger}>{step}</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className={styles.disclosureContent}>
              <div>Fill in your {step.toLowerCase()}.</div>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
      <div className={styles.row}>
        <button
          className={styles.button}
          disabled={at <= 0}
          onClick={() => setValue(STEPS[at - 1] ?? '')}
          type="button">
          Back
        </button>
        <button
          className={`${styles.button} ${styles.primary}`}
          disabled={at >= STEPS.length - 1}
          onClick={() => setValue(STEPS[at + 1] ?? '')}
          type="button">
          Next
        </button>
      </div>
      <p className={styles.note}>
        Open: {value || 'none'}. Focused trigger: {focused ?? 'none'}.
      </p>
    </div>
  )
}
