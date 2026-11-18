'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Progress } from '@gentleduck/registry-ui/progress'
import * as React from 'react'

const STEPS = 5

export default function Demo() {
  const [step, setStep] = React.useState(1)

  return (
    <div className="flex w-[60%] flex-col gap-3">
      <p className="font-medium text-sm">
        Step {step} of {STEPS}
      </p>
      <Progress
        aria-label="Setup"
        getValueLabel={(value, max) => `Step ${value} of ${max}`}
        max={STEPS}
        min={1}
        value={step}
      />
      <div className="flex gap-2">
        <Button disabled={step === 1} onClick={() => setStep((at) => at - 1)} size="sm" variant="outline">
          Back
        </Button>
        <Button disabled={step === STEPS} onClick={() => setStep((at) => at + 1)} size="sm">
          Next
        </Button>
      </div>
    </div>
  )
}
