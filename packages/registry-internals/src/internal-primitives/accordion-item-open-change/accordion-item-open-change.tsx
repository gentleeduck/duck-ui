'use client'

import * as Accordion from '@gentleduck/primitives/accordion'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function AccordionItemOpenChangeExample() {
  const [log, setLog] = React.useState<string[]>([])
  const record = (section: string) => (open: boolean) =>
    setLog((entries) => [`${section} ${open ? 'opened' : 'closed'}`, ...entries].slice(0, 4))

  return (
    <div className={styles.stack}>
      <Accordion.Root className={styles.disclosure} collapsible type="single">
        {['Orders', 'Invoices'].map((section) => (
          <Accordion.Item
            className={styles.disclosureItem}
            key={section}
            onOpenChange={record(section)}
            value={section}>
            <Accordion.Header className={styles.disclosureHeader}>
              <Accordion.Trigger className={styles.disclosureTrigger}>{section}</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className={styles.disclosureContent}>
              <div>Recent {section.toLowerCase()}.</div>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
      <p className={styles.note}>{log.length ? log.join(', ') : 'Open an item to see its own onOpenChange.'}</p>
    </div>
  )
}
