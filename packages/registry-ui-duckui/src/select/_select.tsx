'use client'

import { cn } from '@gentleduck/libs/cn'
import { CheckIcon, ChevronDown, ChevronDownIcon, ChevronUp } from 'lucide-react'
import * as React from 'react'
import { Button, buttonVariants } from '../button'
// import { useHandleKeyDown } from '../command'


function SelectGroup({ children, ...props }: React.HTMLProps<HTMLUListElement>) {
  return (
    <ul {...props}>
      {children}
    </ul>
  )
}

function SelectValue({ className, children, placeholder, ...props }: React.HTMLProps<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'truncate relative select-none flex items-center rounded-xs gap-2 text-sm outline-hidden',
        className,
      )}
      {...props}
      duck-select-value="">
      {placeholder}
    </div>
  )
}

function SelectTrigger({
  children,
  className,
  customIndicator,
  ref,
  ...props
}: React.HTMLProps<HTMLDivElement> & { customIndicator?: React.ReactNode }) {
  return (
    <div
      className={cn(
        buttonVariants({ variant: 'outline', size: 'sm' }),
        'font-normal gap-1 justify-between ltr:pr-2 rtl:pl-2 h-auto data-[open=true]:bg-secondary data-[open=true]:text-accent-foreground',
        className,
      )}
      {...props}
      duck-dropdown-menu-trigger="">
      {children}
      <span className="[&>svg]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0">
        {customIndicator ? customIndicator : <ChevronDownIcon />}
      </span>
    </div>
  )
}


function SelectLabel({ children, className, ref, ...props }: React.HTMLProps<HTMLLabelElement>) {
  return (
    <label
      ref={ref}
      className={cn('text-muted-foreground px-2 py-1.5 text-xs', className)}
      {...props}
    >
      {children}
    </label>
  )
}

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
