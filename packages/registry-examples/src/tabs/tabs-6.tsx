'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@gentleduck/registry-ui/tabs'
import * as React from 'react'

const STEPS = [
  { body: 'Where should we send the order?', label: 'Shipping', value: 'shipping' },
  { body: 'Pay by card, or on delivery.', label: 'Payment', value: 'payment' },
  { body: 'Check the order before you place it.', label: 'Review', value: 'review' },
]

export default function Demo() {
  const [step, setStep] = React.useState('shipping')
  const index = STEPS.findIndex((item) => item.value === step)

  return (
    <Tabs className="w-full max-w-sm" onValueChange={setStep} value={step}>
      <TabsList className="grid w-full grid-cols-3">
        {STEPS.map((item) => (
          <TabsTrigger key={item.value} value={item.value}>
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {STEPS.map((item) => (
        <TabsContent className="rounded-lg border p-4 text-sm" key={item.value} value={item.value}>
          {item.body}
        </TabsContent>
      ))}
      <div className="mt-4 flex items-center justify-between">
        <p aria-live="polite" className="text-muted-foreground text-sm">
          Step {index + 1} of {STEPS.length}
        </p>
        <div className="flex gap-2">
          <Button
            disabled={index === 0}
            onClick={() => setStep(STEPS[index - 1]?.value ?? step)}
            size="sm"
            variant="outline">
            Back
          </Button>
          <Button
            disabled={index === STEPS.length - 1}
            onClick={() => setStep(STEPS[index + 1]?.value ?? step)}
            size="sm">
            Next
          </Button>
        </div>
      </div>
    </Tabs>
  )
}
