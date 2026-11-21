'use client'

import * as Accordion from '@gentleduck/primitives/accordion'
import styles from '../primitives.module.css'

const PANELS = ['Mon', 'Tue', 'Wed', 'Thu']

export default function AccordionHorizontalExample() {
  return (
    <div className={styles.stack}>
      <Accordion.Root
        className={styles.disclosure}
        defaultValue="Tue"
        loop={false}
        orientation="horizontal"
        type="single">
        {PANELS.map((day) => (
          <Accordion.Item className={styles.disclosureItem} key={day} value={day}>
            <Accordion.Header className={styles.disclosureHeader}>
              <Accordion.Trigger className={styles.disclosureTrigger}>{day}</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className={styles.disclosureContent}>
              <div>Shifts on {day}</div>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
      <p className={styles.note}>ArrowLeft and ArrowRight move between days, and stop at either end with loop off.</p>
    </div>
  )
}
