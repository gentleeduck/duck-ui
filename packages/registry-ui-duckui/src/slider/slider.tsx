'use client'

import * as React from 'react'
import { cn } from '@gentleduck/libs/cn'

function Slider({
  className,
  value,
  onValueChange,
  min = 0,
  max = 100,
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value'> & {
  value?: number
  onValueChange?: (value: number) => void
}) {
  return (
    <input
      type="range"
      className={cn(
        // remove default appearance
        'w-full appearance-none bg-transparent',

        // track style (webkit)
        '[&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-secondary',

        // track style (firefox)
        '[&::-moz-range-track]:h-2 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-secondary',

        // thumb style (webkit) - centered with negative margin
        '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:mt-[-6px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-background [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:transition-colors [&::-webkit-slider-thumb]:ring-offset-background [&::-webkit-slider-thumb]:focus-visible:outline-none [&::-webkit-slider-thumb]:focus-visible:ring-2 [&::-webkit-slider-thumb]:focus-visible:ring-ring [&::-webkit-slider-thumb]:focus-visible:ring-offset-2',

        // thumb style (firefox)
        '[&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-background [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:transition-colors [&::-moz-range-thumb]:focus-visible:outline-none [&::-moz-range-thumb]:focus-visible:ring-2 [&::-moz-range-thumb]:focus-visible:ring-ring [&::-moz-range-thumb]:focus-visible:ring-offset-2',

        // disabled state
        'disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
      onChange={(e) => onValueChange?.(e.target.valueAsNumber)}
      value={value}
      {...props}
    />
  )
}

export { Slider }
