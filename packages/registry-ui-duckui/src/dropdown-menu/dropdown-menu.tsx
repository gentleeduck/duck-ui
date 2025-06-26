'use client'

import type DialogPrimitive from '@gentleduck/aria-feather/dialog'
import type { Root } from '@gentleduck/aria-feather/popover'
import { useStableId } from '@gentleduck/hooks'
import { cn } from '@gentleduck/libs/cn'
import type { AnimPopoverVariants } from '@gentleduck/motion/anim'
import type { VariantProps } from '@gentleduck/variants'
import { Check, ChevronDownIcon, ChevronRight } from 'lucide-react'
import * as React from 'react'
import type { Button } from '../button'
import type { DialogContentProps } from '../dialog'
// import { useHandleKeyDown } from '../command'
import { Popover, PopoverContent, PopoverTrigger } from '../popover'
// import { useDropdownMenuInit, useDropdownMenuContext } from './dropdown-menu.hooks'
import { RadioGroup, RadioGroupItem } from '../radio-group'
import { Separator } from '../separator'
// import { useKeyCommands } from '@gentleduck/vim/react'
import type { DropdownMenuShortcutProps } from './dropdown-menu.types'

const DropdownMenu = Popover

function DropdownMenuTrigger({
  children,
  className,
  icon,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger> & React.ComponentPropsWithoutRef<typeof Button>) {
  return (
    <PopoverTrigger
      duck-dropdown-menu-trigger=""
      aria-label="toggle options"
      icon={icon ? <ChevronDownIcon className="open:rotate-180" /> : icon}
      className={cn('font-normal data-[open=true]:bg-secondary data-[open=true]:text-accent-foreground', className)}
      {...props}>
      {children}
    </PopoverTrigger>
  )
}

function DropdownMenuContent({
  className,
  children,
  sideOffset = 8,
  ...props
}: DialogContentProps & VariantProps<typeof AnimPopoverVariants>): React.JSX.Element {
  return (
    <PopoverContent
      sideOffset={sideOffset}
      duck-dropdown-menu-content=""
      role="select"
      aria-activedescendant
      className={cn('px-1.5 py-1', className)}
      {...props}>
      {children}
    </PopoverContent>
  )
}

function DropdownMenuLabel({
  children,
  className,
  ref,
  inset,
  ...props
}: React.HTMLProps<HTMLLabelElement> & { inset?: boolean }): React.JSX.Element {
  return (
    <label
      duck-dropdown-menu-label=""
      ref={ref}
      className={cn('px-2 py-1.5 text-muted-foreground text-xs font-semibold', inset && 'pe-8', className)}
      {...props}>
      {children}
    </label>
  )
}

export interface DropdownMenuItemProps extends React.ComponentPropsWithRef<typeof Button> {
  inset?: boolean
}

function DropdownMenuItemPrimitive({
  children,
  ref,
  className,
  inset,
  ...props
}: DropdownMenuItemProps): React.JSX.Element {
  const id = useStableId()
  return (
    <li
      role="option"
      ref={ref}
      id={id}
      {...props}
      className={cn(
        "relative flex items-center gap-2 data-[selected='true']:bg-accent [&[aria-selected]]:bg-secondary [&[aria-selected]>#select-indicator]:bg-secondary hover:bg-muted data-[disabled=true]:opacity-50 px-2 py-1.5 rounded-sm outline-hidden text-sm transition-color duration-300 data-[selected=true]:text-accent-foreground hover:text-accent-foreground cursor-pointer data-[disabled=true]:pointer-events-none select-none",
        // 'h-auto w-full justify-start cursor-default [&>div]:justify-between [&>div]:w-full px-2 [&[aria-selected]]:bg-secondary focus:bg-secondary',
        // 'h-auto w-full justify-start cursor-default [&>div]:justify-between [&>div]:w-full px-2 [&[aria-selected]:focus-visible]:ring-2 [&[aria-selected]:focus-visible]:ring-ring [&[aria-selected]:focus-visible]:ring-offset-2 [&[aria-selected]:focus-visible]:ring-offset-background focus:bg-secondary',
        // inset && 'pe-8',
        className,
      )}>
      {children}
      {/* {selectedItem?.id === id && ( */}
      {/* <span
          className="end-2 block-full absolute flex justify-center items-center ps-2"
          id="select-indicator"
        >
          <CheckIcon className="!size-3.5 shrink-0" />
        </span> */}
      {/* // )} */}
    </li>
  )
}

function DropdownMenuItem({ children, ...props }: React.HTMLProps<HTMLDivElement>) {
  return (
    <DropdownMenuItemPrimitive duck-dropdown-menu-item="" {...props}>
      {children}
    </DropdownMenuItemPrimitive>
  )
}

function DropdownMenuShortcut({
  className,
  keys,
  // onKeysPressed,
  ref,
  colored = false,
  ...props
}: DropdownMenuShortcutProps): React.JSX.Element {
  // useKeyCommands({
  //   [keys]: {
  //     name: keys,
  //     description: keys,
  //     execute: () => onKeysPressed(),
  //   },
  // })

  return (
    <kbd
      className={cn(
        'inline-flex items-center gap-[2px] transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring focus:offset-2 py-[.12rem] px-2 rounded-[4px] text-secondary-foreground [&_svg]:!size-3 !font-sans cursor-none pointer-events-none select-none ms-auto text-xs tracking-widest text-muted-foreground',
        colored && 'bg-muted',
        className,
      )}
      duck-data-dropdown-menu-shortcut=""
      ref={ref}
      {...props}
    />
  )
}

const DropdownMenuSeparator = Separator

function DropdownMenuGroup({ className, ...props }: React.HTMLProps<HTMLDivElement>): React.JSX.Element {
  return <div className={cn(className)} {...props} duck-dropdown-menu-group="" />
}

function DropdownMenuSub({ hoverable = true, ...props }: React.ComponentPropsWithoutRef<typeof Root>) {
  return <Popover {...props} hoverable={hoverable} duck-dropdown-menu-sub="" />
}

function DropdownMenuSubTrigger({ children, className, ...props }: React.HTMLProps<HTMLDivElement>) {
  return (
    <DropdownMenuTrigger variant="nothing" className={cn('w-full', className)} {...props}>
      {children}
    </DropdownMenuTrigger>
  )
}

function DropdownMenuSubContent({ children, side = 'right', ...props }: React.HTMLProps<HTMLDivElement>) {
  return (
    <DropdownMenuContent side={side} duck-dropdown-menu-sub-content="" {...props}>
      {children}
    </DropdownMenuContent>
  )
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ref,
  ...props
}: React.ComponentPropsWithRef<typeof Button> & { checked?: boolean }) {
  return (
    <DropdownMenuItem
      duck-dropdown-menu-checkbox-item=""
      data-checked={checked}
      ref={ref}
      className={cn(className)}
      {...props}>
      <span className="absolute start-2.5 flex items-center">
        <Check className={cn('!size-4 opacity-0', checked && 'opacity-100')} />
      </span>
      <span className="ps-7">{children}</span>
    </DropdownMenuItem>
  )
}

function DropdownMenuRadioGroup({ ...props }: React.ComponentPropsWithRef<typeof RadioGroup>) {
  return <RadioGroup duck-dropdown-menu-radio-group="" duck-dropdown-menu-group="" {...props} />
}

function DropdownMenuRadioItem({ ...props }: React.ComponentPropsWithRef<typeof RadioGroupItem>) {
  const groupItemRef = React.useRef<HTMLLIElement>(null)

  return (
    <DropdownMenuItem
      duck-dropdown-menu-item=""
      duck-dropdown-menu-radio-item=""
      onClick={() => {
        groupItemRef.current?.querySelector('label')?.click()
      }}>
      <RadioGroupItem
        ref={groupItemRef}
        {...props}
        className="ps-[1.25rem]"
        customIndicator={
          <span className="absolute start-1 top-1/2 -translate-y-1/2 size-2 flex bg-foreground rounded-full transition-all duration-150 ease-in-out" />
        }
      />
    </DropdownMenuItem>
  )
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItemPrimitive,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
}
