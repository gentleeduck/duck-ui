'use client'

import { cn } from '@gentleduck/libs/cn'
import * as CommandPrimitive from '@gentleduck/primitives/command'
import { Search } from 'lucide-react'
import * as React from 'react'
import { useKeysLabel } from '../_internal/keys-label'
import { ShortcutBinder } from '../_internal/shortcut-binder'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../dialog'
import { ScrollArea } from '../scroll-area'
import type { ICommandBadgeProps, ICommandDialogProps } from './command.types'

const Command = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Root
    ref={ref}
    className={cn(
      'flex size-full max-w-162.5 flex-col overflow-hidden rounded-md bg-popover p-2 text-popover-foreground shadow-sm',
      className,
    )}
    {...props}
  />
))
Command.displayName = CommandPrimitive.Root.displayName

const CommandInput = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input> & {
    wrapperClassName?: string
    children?: React.ReactNode
  }
>(({ className, wrapperClassName, placeholder = 'Search...', autoFocus = false, children, ...props }, ref) => (
  <div className={cn('mb-2 flex items-center gap-2 border-b px-1', wrapperClassName)} data-slot="command-input-wrapper">
    <Search aria-hidden="true" className="size-5 shrink-0 opacity-50" />
    <CommandPrimitive.Input
      ref={ref}
      autoFocus={autoFocus}
      placeholder={placeholder}
      className={cn(
        'flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
    {children}
  </div>
))
CommandInput.displayName = CommandPrimitive.Input.displayName

// A modal's scroll lock cancels wheel and touchmove on document, and a popover's list is portalled outside it.
const stopScrollPropagation = (event: React.SyntheticEvent) => {
  event.stopPropagation()
}

const CommandList = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List> & {
    scrollRef?: React.Ref<HTMLDivElement>
  }
>(({ className, scrollRef, ...props }, ref) => (
  // The cap is on the viewport, the box that scrolls; on the list its items spill past it.
  <ScrollArea
    className="overflow-x-hidden"
    onTouchMove={stopScrollPropagation}
    onWheel={stopScrollPropagation}
    viewportClassName={cn('max-h-75 overflow-x-hidden', className)}
    viewportRef={scrollRef}>
    <CommandPrimitive.List ref={ref} className="focus:outline-hidden" {...props} />
  </ScrollArea>
))
CommandList.displayName = CommandPrimitive.List.displayName

const CommandEmpty = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Empty ref={ref} className={cn('py-6 text-center text-sm', className)} {...props} />
))
CommandEmpty.displayName = CommandPrimitive.Empty.displayName

const CommandLoading = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Loading>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Loading>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Loading
    ref={ref}
    className={cn('py-6 text-center text-muted-foreground text-sm', className)}
    {...props}
  />
))
CommandLoading.displayName = CommandPrimitive.Loading.displayName

// The count is for a screen reader. A class such as not-sr-only shows it.
const CommandStatus = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Status>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Status>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Status ref={ref} className={cn('sr-only', className)} {...props} />
))
CommandStatus.displayName = CommandPrimitive.Status.displayName

const CommandGroup = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      'overflow-hidden text-foreground *:data-[slot="command-group-heading"]:px-2 *:data-[slot="command-group-heading"]:py-1.5 *:data-[slot="command-group-heading"]:font-medium *:data-[slot="command-group-heading"]:text-muted-foreground *:data-[slot="command-group-heading"]:text-sm',
      className,
    )}
    {...props}
  />
))
CommandGroup.displayName = CommandPrimitive.Group.displayName

export const COMMAND_ITEM_CLASSNAME =
  'relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden transition-colors hover:bg-muted hover:text-accent-foreground data-disabled:cursor-not-allowed data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:opacity-50 [&_svg:not([class*=size-])]:size-4'

const CommandItem = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item ref={ref} className={cn(COMMAND_ITEM_CLASSNAME, className)} {...props} />
))
CommandItem.displayName = CommandPrimitive.Item.displayName

const CommandSeparator = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator ref={ref} className={cn('-mx-1 my-2 h-px bg-secondary', className)} {...props} />
))
CommandSeparator.displayName = CommandPrimitive.Separator.displayName

const CommandShortcut = React.forwardRef<HTMLElement, ICommandBadgeProps>(
  ({ className, keys, onKeysPressed, variant = 'default', children, ...props }, ref) => {
    const label = useKeysLabel(keys)
    return (
      <kbd
        className={cn(
          'pointer-events-none ms-auto inline-flex select-none items-center gap-0.5 rounded-sm px-2 py-[.12rem] font-sans text-secondary-foreground text-sm tracking-widest [&_svg:not([class*=size-])]:size-3',
          variant === 'secondary' && 'bg-secondary',
          className,
        )}
        data-slot="command-badge"
        ref={ref}
        {...props}>
        {children ?? label}
        {keys && onKeysPressed && <ShortcutBinder handler={onKeysPressed} keys={keys} />}
      </kbd>
    )
  },
)
CommandShortcut.displayName = 'CommandShortcut'

function CommandDialog({
  children,
  shouldFilter,
  loop,
  filter,
  vimBindings,
  disablePointerSelection,
  limit,
  value,
  defaultValue,
  onValueChange,
  contentClassName,
  title = 'Command palette',
  description = 'Search for commands and navigation items',
  ...props
}: React.ComponentPropsWithoutRef<typeof Dialog> & ICommandDialogProps) {
  return (
    <Dialog {...props}>
      <DialogContent className={cn('h-125 max-w-full p-0 lg:w-175', contentClassName)} hideClose>
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">{description}</DialogDescription>
        <Command
          className="max-w-full"
          shouldFilter={shouldFilter}
          loop={loop}
          filter={filter}
          vimBindings={vimBindings}
          disablePointerSelection={disablePointerSelection}
          limit={limit}
          value={value}
          defaultValue={defaultValue}
          onValueChange={onValueChange}>
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  )
}
CommandDialog.displayName = 'CommandDialog'

export {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
  CommandSeparator,
  CommandShortcut,
  CommandStatus,
}
