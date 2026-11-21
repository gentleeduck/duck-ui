'use client'

import * as Accordion from '@gentleduck/primitives/accordion'
import styles from '../primitives.module.css'

const ITEMS = [
  { value: 'a', question: 'هل يدعم إمكانية الوصول؟', answer: 'نعم، يتبع نمط WAI-ARIA.' },
  { value: 'b', question: 'هل يأتي بتنسيق جاهز؟', answer: 'لا، التنسيق متروك لك.' },
]

export default function AccordionRtlExample() {
  return (
    <div className={styles.stack}>
      <Accordion.Root className={styles.disclosure} collapsible dir="rtl" orientation="horizontal" type="single">
        {ITEMS.map((item) => (
          <Accordion.Item className={styles.disclosureItem} key={item.value} value={item.value}>
            <Accordion.Header className={styles.disclosureHeader}>
              <Accordion.Trigger className={styles.disclosureTrigger}>{item.question}</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className={styles.disclosureContent}>
              <div>{item.answer}</div>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
      <p className={styles.note}>ArrowLeft moves to the next item, since the items run right to left.</p>
    </div>
  )
}
