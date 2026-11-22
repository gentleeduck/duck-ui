'use client'

import { cn } from '@gentleduck/libs/cn'
import * as MenubarPrimitive from '@gentleduck/primitives/menubar'
import type { IPortal } from '@gentleduck/primitives/portal'
import { Check, ChevronRight, Circle } from 'lucide-react'
import * as React from 'react'
import { useKeysLabel } from '../_internal/keys-label'
import { ShortcutBinder } from '../_internal/shortcut-binder'
import { menubarContentStyle, menubarSubContentStyle } from './menubar.constants'

const MenubarMenu = MenubarPrimitive.Menu
const MenubarGroup = MenubarPrimitive.Group
const MenubarPortal = MenubarPrimitive.Portal
const MenubarRadioGroup = MenubarPrimitive.RadioGroup
const MenubarSub = MenubarPrimitive.Sub

const Menubar = React.forwardRef<
  React.ComponentRef<typeof MenubarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Root
    ref={ref}
    className={cn(
      'flex h-9 items-center gap-1 rounded-md border bg-background p-1 shadow-sm data-[orientation=vertical]:h-auto data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch',
      className,
    )}
    {...props}
  />
))
Menubar.displayName = MenubarPrimitive.Root.displayName

const MenubarTrigger = React.forwardRef<
  React.ComponentRef<typeof MenubarPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Trigger
    ref={ref}
    className={cn(
      'flex cursor-default select-none items-center rounded-sm px-3 py-1 font-medium text-sm outline-hidden focus:bg-accent focus:text-accent-foreground data-disabled:cursor-not-allowed data-[state=open]:bg-accent data-[state=open]:text-accent-foreground data-disabled:opacity-50',
      className,
    )}
    {...props}
  />
))

MenubarTrigger.displayName = MenubarPrimitive.Trigger.displayName

const MenubarSubTrigger = React.forwardRef<
  React.ComponentRef<typeof MenubarPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubTrigger> & {
    inset?: boolean
  }
>(({ className, inset, children, ...props }, ref) => (
  <MenubarPrimitive.SubTrigger
    ref={ref}
    className={cn(
      'flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
      inset && 'ps-8',
      className,
    )}
    {...props}>
    {children}
    <ChevronRight aria-hidden="true" className="ms-auto size-4 rtl:rotate-180" />
  </MenubarPrimitive.SubTrigger>
))
MenubarSubTrigger.displayName = MenubarPrimitive.SubTrigger.displayName

const MenubarSubContent = React.forwardRef<
  React.ComponentRef<typeof MenubarPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.SubContent
    ref={ref}
    className={cn(
      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=open]:animate-in',
      'animation-duration-200 data-[state=closed]:animation-duration-150 ease-(--gentleduck-motion-ease)',
      menubarSubContentStyle,
      className,
    )}
    {...props}
  />
))
MenubarSubContent.displayName = MenubarPrimitive.SubContent.displayName

export interface IMenubarContentProps extends React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Content> {
  /** Where the content portals to, in place of `document.body`: an element, or a ref to one. */
  container?: IPortal.IProps['container']
}

const MenubarContent = React.forwardRef<React.ComponentRef<typeof MenubarPrimitive.Content>, IMenubarContentProps>(
  ({ className, align = 'start', alignOffset = -4, sideOffset = 8, container, ...props }, ref) => (
    <MenubarPrimitive.Portal container={container} forceMount={props.forceMount}>
      <MenubarPrimitive.Content
        ref={ref}
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        className={cn(
          'data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=open]:animate-in',
          'animation-duration-200 ease-(--gentleduck-motion-ease)',
          menubarContentStyle,
          className,
        )}
        {...props}
      />
    </MenubarPrimitive.Portal>
  ),
)
MenubarContent.displayName = MenubarPrimitive.Content.displayName

const MenubarItem = React.forwardRef<
  React.ComponentRef<typeof MenubarPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Item> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground data-disabled:cursor-not-allowed data-disabled:opacity-50',
      inset && 'ps-8',
      className,
    )}
    {...props}
  />
))
MenubarItem.displayName = MenubarPrimitive.Item.displayName

const MenubarCheckboxItem = React.forwardRef<
  React.ComponentRef<typeof MenubarPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <MenubarPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center rounded-sm py-1.5 ps-8 pe-2 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground data-disabled:cursor-not-allowed data-disabled:opacity-50',
      className,
    )}
    checked={checked}
    {...props}>
    <span className="absolute start-2 flex size-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <Check aria-hidden="true" className="size-4" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.CheckboxItem>
))
MenubarCheckboxItem.displayName = MenubarPrimitive.CheckboxItem.displayName

const MenubarRadioItem = React.forwardRef<
  React.ComponentRef<typeof MenubarPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <MenubarPrimitive.RadioItem
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center rounded-sm py-1.5 ps-8 pe-2 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground data-disabled:cursor-not-allowed data-disabled:opacity-50',
      className,
    )}
    {...props}>
    <span className="absolute start-2 flex size-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <Circle aria-hidden="true" className="size-2 fill-current" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.RadioItem>
))
MenubarRadioItem.displayName = MenubarPrimitive.RadioItem.displayName

const MenubarLabel = React.forwardRef<
  React.ComponentRef<typeof MenubarPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Label> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Label
    ref={ref}
    className={cn('px-2 py-1.5 font-semibold text-sm', inset && 'ps-8', className)}
    {...props}
  />
))
MenubarLabel.displayName = MenubarPrimitive.Label.displayName

const MenubarSeparator = React.forwardRef<
  React.ComponentRef<typeof MenubarPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Separator ref={ref} className={cn('-mx-1 my-1 h-px bg-muted', className)} {...props} />
))
MenubarSeparator.displayName = MenubarPrimitive.Separator.displayName

interface IMenubarShortcutProps extends React.HTMLAttributes<HTMLSpanElement> {
  keys?: string
  onKeysPressed?: () => void
}

const MenubarShortcut = React.forwardRef<HTMLSpanElement, IMenubarShortcutProps>(
  ({ className, keys, onKeysPressed, children, ...props }, ref) => {
    const label = useKeysLabel(keys)
    return (
      <>
        <span
          ref={ref}
          data-slot="menubar-shortcut"
          className={cn('ms-auto text-muted-foreground text-xs tracking-widest', className)}
          {...props}>
          {children ?? label}
        </span>
        {keys && onKeysPressed ? <ShortcutBinder keys={keys} handler={onKeysPressed} /> : null}
      </>
    )
  },
)
MenubarShortcut.displayName = 'MenubarShortcut'

export {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarPortal,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
}
