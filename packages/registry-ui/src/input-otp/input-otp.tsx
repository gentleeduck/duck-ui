'use client'

import { cn } from '@gentleduck/libs/cn'
import * as InputOTPPrimitive from '@gentleduck/primitives/input-otp'
import { Dot } from 'lucide-react'
import * as React from 'react'

const InputOTP = React.forwardRef<
  React.ComponentRef<typeof InputOTPPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof InputOTPPrimitive.Root>
>(({ className, ...props }, ref) => (
  <InputOTPPrimitive.Root
    ref={ref}
    className={cn('flex items-center gap-2 has-disabled:cursor-not-allowed has-disabled:opacity-50', className)}
    {...props}
  />
))
InputOTP.displayName = 'InputOTP'

const InputOTPGroup = React.forwardRef<
  React.ComponentRef<typeof InputOTPPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof InputOTPPrimitive.Group>
>(({ className, ...props }, ref) => (
  <InputOTPPrimitive.Group ref={ref} className={cn('flex items-center', className)} {...props} />
))
InputOTPGroup.displayName = 'InputOTPGroup'

const InputOTPSlot = React.forwardRef<
  React.ComponentRef<typeof InputOTPPrimitive.Slot>,
  React.ComponentPropsWithoutRef<typeof InputOTPPrimitive.Slot>
>(({ className, ...props }, ref) => (
  <InputOTPPrimitive.Slot
    ref={ref}
    className={cn(
      'relative -ms-px size-10 rounded-none border border-input text-center text-sm transition-[color,background-color,border-color,box-shadow] first:ms-0 first:rounded-s-md last:rounded-e-md focus:z-10 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring',
      className,
    )}
    {...props}
  />
))
InputOTPSlot.displayName = 'InputOTPSlot'

const InputOTPSeparator = React.forwardRef<
  React.ComponentRef<typeof InputOTPPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof InputOTPPrimitive.Separator>
>(({ children, ...props }, ref) => (
  <InputOTPPrimitive.Separator ref={ref} {...props}>
    {children ?? <Dot />}
  </InputOTPPrimitive.Separator>
))
InputOTPSeparator.displayName = 'InputOTPSeparator'

const InputOTPHiddenInput = InputOTPPrimitive.HiddenInput

const REGEXP_ONLY_DIGITS_AND_CHARS = InputOTPPrimitive.REGEXP_ONLY_DIGITS_AND_CHARS
const REGEXP_ONLY_DIGITS = InputOTPPrimitive.REGEXP_ONLY_DIGITS
const REGEXP_ONLY_CHARS = InputOTPPrimitive.REGEXP_ONLY_CHARS

export {
  InputOTP,
  InputOTPGroup,
  InputOTPHiddenInput,
  InputOTPSeparator,
  InputOTPSlot,
  REGEXP_ONLY_CHARS,
  REGEXP_ONLY_DIGITS,
  REGEXP_ONLY_DIGITS_AND_CHARS,
}
