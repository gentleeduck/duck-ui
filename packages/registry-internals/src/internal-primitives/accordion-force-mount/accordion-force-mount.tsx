'use client'

import * as Accordion from '@gentleduck/primitives/accordion'
import styles from '../primitives.module.css'

export default function AccordionForceMountExample() {
  return (
    <Accordion.Root className={styles.disclosure} collapsible type="single">
      {['Summary', 'Details'].map((section) => (
        <Accordion.Item className={styles.disclosureItem} key={section} value={section}>
          <Accordion.Header className={styles.disclosureHeader}>
            <Accordion.Trigger className={styles.disclosureTrigger}>{section}</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className={`${styles.disclosureContent} ${styles.collapse}`} forceMount>
            <div>Kept in the page while closed, so its own styles collapse it.</div>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  )
}
