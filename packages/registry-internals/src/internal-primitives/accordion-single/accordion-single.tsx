'use client'

import * as Accordion from '@gentleduck/primitives/accordion'
import styles from '../primitives.module.css'

const FAQ = [
  {
    value: 'shipping',
    question: 'How long does shipping take?',
    answer: 'Three to five working days in most regions.',
  },
  { value: 'returns', question: 'Can I return an order?', answer: 'Yes, within 30 days, in its original packaging.' },
  { value: 'warranty', question: 'Is there a warranty?', answer: 'Every product carries a two-year warranty.' },
]

export default function AccordionSingleExample() {
  return (
    <Accordion.Root className={styles.disclosure} collapsible defaultValue="shipping" type="single">
      {FAQ.map((item) => (
        <Accordion.Item className={styles.disclosureItem} key={item.value} value={item.value}>
          <Accordion.Header className={styles.disclosureHeader}>
            <Accordion.Trigger className={styles.disclosureTrigger}>
              {item.question}
              <Accordion.Indicator className={styles.chevron}>v</Accordion.Indicator>
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className={`${styles.disclosureContent} ${styles.animated}`}>
            <div>{item.answer}</div>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  )
}
