import * as React from 'react'
import { Primitive } from '../primitive-elements'
import { useInputOTPContext } from './input-otp'
import type { IInputOTP } from './input-otp.types'

const INPUT_OTP_SLOT_NAME = 'InputOTPSlot'

type InputOTPSlotElement = React.ComponentRef<typeof Primitive.input>

const InputOTPSlot = React.forwardRef<InputOTPSlotElement, IInputOTP.ISlotProps>(
  (props: IInputOTP.IScoped<IInputOTP.ISlotProps>, forwardedRef) => {
    const { __scopeInputOTP, disabled, readOnly, ...slotProps } = props
    const context = useInputOTPContext(INPUT_OTP_SLOT_NAME, __scopeInputOTP)
    return (
      <Primitive.input
        type={context.type}
        inputMode={context.numeric ? 'numeric' : undefined}
        autoComplete="one-time-code"
        data-slot="input-otp-slot"
        {...slotProps}
        ref={forwardedRef}
        disabled={context.disabled || disabled}
        readOnly={context.readOnly || readOnly}
        data-input-otp-slot=""
      />
    )
  },
)

InputOTPSlot.displayName = INPUT_OTP_SLOT_NAME

export { INPUT_OTP_SLOT_NAME, InputOTPSlot }
