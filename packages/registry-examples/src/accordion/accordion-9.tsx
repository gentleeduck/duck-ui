'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@gentleduck/registry-ui/accordion'
import * as React from 'react'

const DAYS = ['Monday', 'Tuesday', 'Wednesday']

export default function Demo() {
  const [focused, setFocused] = React.useState<string | null>(null)
  const [log, setLog] = React.useState<string[]>([])

  return (
    <div className="flex flex-col gap-3">
      <Accordion
        className="flex w-[420px]"
        collapsible
        loop={false}
        onFocusChange={setFocused}
        orientation="horizontal"
        type="single">
        {DAYS.map((day) => (
          <AccordionItem
            className="flex-1 border-e last:border-e-0"
            key={day}
            onOpenChange={(open) =>
              setLog((entries) => [`${day} ${open ? 'opened' : 'closed'}`, ...entries].slice(0, 3))
            }
            value={day}>
            <AccordionTrigger className="px-3">{day}</AccordionTrigger>
            <AccordionContent className="px-3">Shifts on {day}.</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <p className="text-muted-foreground text-sm">
        Focused: {focused ?? 'none'}. {log.join(', ') || 'ArrowLeft and ArrowRight move, and stop at either end.'}
      </p>
    </div>
  )
}
