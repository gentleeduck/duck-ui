'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@gentleduck/registry-ui/input-otp'
import * as React from 'react'

export default function Demo() {
  const [asked, setAsked] = React.useState(false)

  return (
    <div className="flex flex-col items-center gap-3">
      <Button onClick={() => setAsked((value) => !value)} variant="outline">
        {asked ? 'Cancel' : 'Send me a code'}
      </Button>
      {asked ? (
        <InputOTP aria-label="Code" autoFocus defaultValue="4" maxLength={4}>
          <InputOTPGroup>
            <InputOTPSlot />
            <InputOTPSlot />
            <InputOTPSlot />
            <InputOTPSlot />
          </InputOTPGroup>
        </InputOTP>
      ) : null}
      <p className="text-muted-foreground text-sm">
        It starts from defaultValue, and autoFocus puts the caret in the slot typing goes to.
      </p>
    </div>
  )
}
