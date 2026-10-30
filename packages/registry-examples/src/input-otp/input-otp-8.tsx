'use client'

import { InputOTPGroup, InputOTPSeparator, InputOTPSlot, MotionInputOTP } from '@gentleduck/registry-ui/input-otp'

export default function Demo() {
  return (
    <MotionInputOTP aria-label="One-time code" maxLength={6}>
      <InputOTPGroup>
        <InputOTPSlot />
        <InputOTPSlot />
        <InputOTPSlot />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot />
        <InputOTPSlot />
        <InputOTPSlot />
      </InputOTPGroup>
    </MotionInputOTP>
  )
}
