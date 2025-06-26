'use client'

import { cn } from '@gentleduck/libs/cn'
import { CheckIcon, ChevronDown, ChevronDownIcon, ChevronUp } from 'lucide-react'
import type * as React from 'react'
// import { useHandleKeyDown } from '../command'

import { useStableId } from '@gentleduck/hooks'
import type { AnimPopoverVariants } from '@gentleduck/motion/anim'
import type { VariantProps } from '@gentleduck/variants'
import type { Button } from '../button'
import type { DialogContentProps } from '../dialog'
import { Popover, PopoverContent, PopoverTrigger } from '../popover/_popover'
import { Separator } from '../separator'
import {
  DropdownMenuContent,
  DropdownMenuItemPrimitive,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '../dropdown-menu/dropdown-menu'

const Select = Popover

const SelectTrigger = DropdownMenuTrigger

const SelectContent = DropdownMenuContent

function SelectGroup({ children, ...props }: React.HTMLProps<HTMLUListElement>) {
  return (
    <ul role="listbox" {...props}>
      {children}
    </ul>
  )
}

function SelectValue({ className, children, placeholder, ...props }: React.HTMLProps<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'relative flex select-none items-center gap-2 truncate rounded-xs text-sm outline-hidden',
        className,
      )}
      {...props}
      duck-select-value="">
      {placeholder}
    </div>
  )
}

const SelectLabel = DropdownMenuLabel

const SelectSeparator = Separator

function SelectItem({ children, ...props }: React.HTMLProps<HTMLDivElement>) {
  return (
    <DropdownMenuItemPrimitive duck-select-item="" {...props}>
      {children}
    </DropdownMenuItemPrimitive>
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
  // SelectScrollUpButton,
  // SelectScrollDownButton,
}
