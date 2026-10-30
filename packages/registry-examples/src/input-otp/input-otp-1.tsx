import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@gentleduck/registry-ui/input-otp'

export default function Demo() {
  return (
    <InputOTP aria-label="One-time code" maxLength={6}>
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
    </InputOTP>
  )
}
