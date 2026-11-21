'use client'

import * as Accordion from '@gentleduck/primitives/accordion'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function AccordionDisabledExample() {
  const [locked, setLocked] = React.useState(false)

  return (
    <div className={styles.stack}>
      <Accordion.Root className={styles.disclosure} collapsible disabled={locked} type="single">
        <Accordion.Item className={styles.disclosureItem} value="plan">
          <Accordion.Header className={styles.disclosureHeader}>
            <Accordion.Trigger className={styles.disclosureTrigger}>Plan</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className={styles.disclosureContent}>
            <div>Free plan, renewed monthly.</div>
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item className={styles.disclosureItem} disabled value="sso">
          <Accordion.Header className={styles.disclosureHeader}>
            <Accordion.Trigger className={styles.disclosureTrigger}>Single sign-on (Enterprise only)</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className={styles.disclosureContent}>
            <div>Connect your identity provider.</div>
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item className={styles.disclosureItem} value="usage">
          <Accordion.Header className={styles.disclosureHeader}>
            <Accordion.Trigger className={styles.disclosureTrigger}>Usage</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className={styles.disclosureContent}>
            <div>1,204 of 5,000 requests this month.</div>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
      <button className={styles.button} onClick={() => setLocked((value) => !value)} type="button">
        {locked ? 'Unlock every item' : 'Disable every item'}
      </button>
      <p className={styles.note}>The arrow keys pass over a disabled trigger.</p>
    </div>
  )
}
