'use client'

import { InputOTP, InputOTPGroup, InputOTPSlot, REGEXP_ONLY_DIGITS } from '@gentleduck/registry-ui/input-otp'
import { Label } from '@gentleduck/registry-ui/label'
import * as React from 'react'

const MESSAGES = {
  checking: 'Checking...',
  idle: 'Type 1234 to unlock.',
  unlocked: 'Unlocked.',
  wrong: 'Wrong PIN, try again.',
}

export default function Demo() {
  const [pin, setPin] = React.useState('')
  const [status, setStatus] = React.useState<keyof typeof MESSAGES>('idle')

  return (
    <div className="flex flex-col items-center gap-3">
      <Label id="pin-label">PIN</Label>
      <InputOTP
        aria-labelledby="pin-label"
        disabled={status === 'checking'}
        maxLength={4}
        onComplete={(code) => {
          setStatus('checking')
          setTimeout(() => {
            setStatus(code === '1234' ? 'unlocked' : 'wrong')
            if (code !== '1234') setPin('')
          }, 800)
        }}
        onValueChange={setPin}
        pattern={REGEXP_ONLY_DIGITS}
        readOnly={status === 'unlocked'}
        type="password"
        value={pin}>
        <InputOTPGroup>
          <InputOTPSlot />
          <InputOTPSlot />
          <InputOTPSlot />
          <InputOTPSlot />
        </InputOTPGroup>
      </InputOTP>
      <p aria-live="polite" className="text-muted-foreground text-sm">
        {MESSAGES[status]}
      </p>
    </div>
  )
}
