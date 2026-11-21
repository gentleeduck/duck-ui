'use client'

import * as Accordion from '@gentleduck/primitives/accordion'
import styles from '../primitives.module.css'

export default function AccordionHiddenUntilFoundExample() {
  return (
    <div className={styles.stack}>
      <Accordion.Root className={styles.disclosure} collapsible type="single">
        <Accordion.Item className={styles.disclosureItem} value="rivers">
          <Accordion.Header className={styles.disclosureHeader}>
            <Accordion.Trigger className={styles.disclosureTrigger}>Rivers</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className={styles.disclosureContent} hiddenUntilFound>
            <div>An otter can hold its breath for eight minutes.</div>
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item className={styles.disclosureItem} value="forests">
          <Accordion.Header className={styles.disclosureHeader}>
            <Accordion.Trigger className={styles.disclosureTrigger}>Forests</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className={styles.disclosureContent} hiddenUntilFound>
            <div>A red squirrel buries thousands of seeds each autumn.</div>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
      <p className={styles.note}>Search the page for "otter" and the browser opens the item that holds it.</p>
    </div>
  )
}
