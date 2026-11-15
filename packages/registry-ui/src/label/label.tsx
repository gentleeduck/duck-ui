'use client'

import { cn } from '@gentleduck/libs/cn'
import { useDirection } from '@gentleduck/primitives/direction'
import * as React from 'react'
import { toDirection } from '../direction/direction.libs'

export interface ILabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const Label = React.forwardRef<HTMLLabelElement, ILabelProps>(
  ({ className, htmlFor, dir, onMouseDown, ...props }, ref) => {
    const direction = useDirection(toDirection(dir))

    return (
      // biome-ignore lint/a11y/noLabelWithoutControl: label is composed with form controls externally via htmlFor
      <label
        className={cn(
          'text-balance font-medium text-sm leading-none has-disabled:cursor-not-allowed has-disabled:opacity-70 [:where(.peer):disabled+&]:cursor-not-allowed [:where(.peer):disabled+&]:opacity-70',
          className,
        )}
        data-slot="label"
        dir={direction}
        htmlFor={htmlFor}
        onMouseDown={(event) => {
          onMouseDown?.(event)
          // A double click toggles the control twice and should not also select the label's text. A control inside
          // the label keeps its own double click.
          const inControl = (event.target as HTMLElement).closest('button, input, select, textarea')
          if (!event.defaultPrevented && event.detail > 1 && !inControl) event.preventDefault()
        }}
        ref={ref}
        {...props}
      />
    )
  },
)
Label.displayName = 'Label'

export { Label }
