import * as React from 'react'
import { Primitive } from '../primitive-elements'
import type { IInputOTP } from './input-otp.types'

const INPUT_OTP_SEPARATOR_NAME = 'InputOTPSeparator'

type InputOTPSeparatorElement = React.ComponentRef<typeof Primitive.div>

const InputOTPSeparator = React.forwardRef<InputOTPSeparatorElement, IInputOTP.ISeparatorProps>(
  (props, forwardedRef) => {
    return (
      <Primitive.div
        {...props}
        ref={forwardedRef}
        role="presentation"
        aria-hidden="true"
        data-slot="input-otp-separator"
      />
    )
  },
)

InputOTPSeparator.displayName = INPUT_OTP_SEPARATOR_NAME

export { INPUT_OTP_SEPARATOR_NAME, InputOTPSeparator }
