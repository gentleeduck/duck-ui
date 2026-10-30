import * as React from 'react'
import { useInputOTPContext } from './input-otp'
import type { IInputOTP } from './input-otp.types'

const INPUT_OTP_HIDDEN_INPUT_NAME = 'InputOTPHiddenInput'

const InputOTPHiddenInput = React.forwardRef<HTMLInputElement, IInputOTP.IHiddenInputProps>(
  (props: IInputOTP.IScoped<IInputOTP.IHiddenInputProps>, forwardedRef) => {
    const { __scopeInputOTP, ...hiddenInputProps } = props
    const context = useInputOTPContext(INPUT_OTP_HIDDEN_INPUT_NAME, __scopeInputOTP)
    return (
      <input
        name={context.name}
        data-slot="input-otp-hidden-input"
        {...hiddenInputProps}
        ref={forwardedRef}
        type="hidden"
        value={context.value}
      />
    )
  },
)

InputOTPHiddenInput.displayName = INPUT_OTP_HIDDEN_INPUT_NAME

export { INPUT_OTP_HIDDEN_INPUT_NAME, InputOTPHiddenInput }
