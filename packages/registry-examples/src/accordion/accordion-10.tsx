'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@gentleduck/registry-ui/accordion'
import * as React from 'react'

function Report({ name }: { name: string }) {
  const [loadedAt] = React.useState(() => new Date().toLocaleTimeString())
  return (
    <p>
      The {name} report, built at {loadedAt}. It is not built until first opened, and kept after.
    </p>
  )
}

export default function Demo() {
  return (
    <Accordion className="w-[350px]" collapsible renderOnce type="single">
      {['Sales', 'Traffic'].map((name) => (
        <AccordionItem key={name} value={name}>
          <AccordionTrigger>{name}</AccordionTrigger>
          <AccordionContent>
            <Report name={name.toLowerCase()} />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
