'use client'

import { Button } from '@gentleduck/registry-ui/button'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPHiddenInput,
  InputOTPSlot,
  REGEXP_ONLY_DIGITS,
} from '@gentleduck/registry-ui/input-otp'
import { Label } from '@gentleduck/registry-ui/label'
import * as React from 'react'

export default function Demo() {
  const [sent, setSent] = React.useState('')

  return (
    <form
      className="flex flex-col items-center gap-3"
      onReset={() => setSent('')}
      onSubmit={(event) => {
        event.preventDefault()
        setSent(String(new FormData(event.currentTarget).get('code')))
      }}>
      <Label id="verification-code-label">Verification code</Label>
      <InputOTP aria-labelledby="verification-code-label" maxLength={6} name="code" pattern={REGEXP_ONLY_DIGITS}>
        <InputOTPGroup>
          <InputOTPSlot />
          <InputOTPSlot />
          <InputOTPSlot />
          <InputOTPSlot />
          <InputOTPSlot />
          <InputOTPSlot />
        </InputOTPGroup>
        <InputOTPHiddenInput />
      </InputOTP>
      <Button size="sm" type="reset" variant="outline">
        Clear
      </Button>
      <p aria-live="polite" className="text-muted-foreground text-sm">
        {sent ? `Sent ${sent}.` : 'Press Enter to send the code.'}
      </p>
    </form>
  )
}
