'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@gentleduck/registry-ui/accordion'
import * as React from 'react'

export default function Demo() {
  const [open, setOpen] = React.useState('shipping')
  return (
    <div className="flex w-87.5 flex-col gap-3">
      <p className="text-muted-foreground text-sm">Open: {open || 'none'}</p>
      <Accordion type="single" collapsible value={open} onValueChange={setOpen}>
        <AccordionItem value="shipping">
          <AccordionTrigger>Shipping</AccordionTrigger>
          <AccordionContent>Three to five working days, tracked from the day it leaves us.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="returns">
          <AccordionTrigger>Returns</AccordionTrigger>
          <AccordionContent>Free within thirty days, in the box it came in.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="gift" disabled>
          <AccordionTrigger>Gift wrapping (sold out)</AccordionTrigger>
          <AccordionContent>Wrapped in recycled paper with a handwritten card.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
