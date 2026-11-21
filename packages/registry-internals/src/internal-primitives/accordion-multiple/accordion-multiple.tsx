'use client'

import * as Accordion from '@gentleduck/primitives/accordion'
import styles from '../primitives.module.css'

const SECTIONS = ['Account', 'Billing', 'Notifications']

export default function AccordionMultipleExample() {
  return (
    <Accordion.Root className={styles.disclosure} defaultValue={['Account', 'Notifications']} type="multiple">
      {SECTIONS.map((section) => (
        <Accordion.Item className={styles.disclosureItem} key={section} value={section}>
          <Accordion.Header className={styles.disclosureHeader}>
            <Accordion.Trigger className={styles.disclosureTrigger}>
              {section}
              <Accordion.Indicator className={styles.chevron}>v</Accordion.Indicator>
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className={`${styles.disclosureContent} ${styles.animated}`}>
            <div>Settings for {section.toLowerCase()}, open beside the others.</div>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  )
}
