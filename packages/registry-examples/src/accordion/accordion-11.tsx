'use client'

import {
  Accordion,
  MotionAccordionContent,
  MotionAccordionItem,
  MotionAccordionTrigger,
} from '@gentleduck/registry-ui/accordion'

const questions = [
  { answer: 'Within three working days.', question: 'When does it ship?', value: 'ship' },
  { answer: 'Free within thirty days.', question: 'Can I return it?', value: 'return' },
  { answer: 'Two years on every part.', question: 'Is there a warranty?', value: 'warranty' },
]

export default function Demo() {
  return (
    <Accordion className="w-[350px]" collapsible type="single">
      {questions.map((item, place) => (
        <MotionAccordionItem index={questions.length - 1 - place} key={item.value} value={item.value}>
          <MotionAccordionTrigger>{item.question}</MotionAccordionTrigger>
          <MotionAccordionContent>{item.answer}</MotionAccordionContent>
        </MotionAccordionItem>
      ))}
    </Accordion>
  )
}
