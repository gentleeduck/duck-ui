'use client'

import { cn } from '@gentleduck/libs/cn'
import * as CommandPrimitive from '@gentleduck/primitives/command'
import { useKeyCommands } from '@gentleduck/vim/react'
import { Search } from 'lucide-react'
import * as React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../dialog'
import { ScrollArea } from '../scroll-area'
import type { ICommandBadgeProps } from './command.types'

const Command = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Root
    ref={ref}
    data-slot="command"
    className={cn(
      'flex h-full w-full max-w-162.5 flex-col overflow-hidden rounded-md bg-popover p-2 text-popover-foreground shadow-sm',
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
  <div className={cn('mb-2 flex items-center gap-2 border-b px-1', wrapperClassName)} data-slot="command-input">
    <Search aria-hidden="true" className="size-5 shrink-0 opacity-50" />
    <CommandPrimitive.Input
      ref={ref}
      autoFocus={autoFocus}
      placeholder={placeholder}
      className={cn(
        'flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
    {children}
  </div>
))
CommandInput.displayName = CommandPrimitive.Input.displayName

const CommandList = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List> & {
    scrollRef?: React.Ref<HTMLDivElement>
  }
>(({ className, scrollRef, ...props }, ref) => (
  <ScrollArea
    className="overflow-y-auto overflow-x-hidden"
    data-slot="command-list"
    viewportClassName="overflow-x-hidden"
    viewportRef={scrollRef}>
    <CommandPrimitive.List ref={ref} className={cn('max-h-75 focus:outline-none', className)} {...props} />
  </ScrollArea>
))
CommandList.displayName = CommandPrimitive.List.displayName

const CommandEmpty = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    data-slot="command-empty"
    className={cn('py-6 text-center text-sm', className)}
    {...props}
  />
))
CommandEmpty.displayName = CommandPrimitive.Empty.displayName

const CommandGroup = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    data-slot="command-group"
    className={cn(
      'overflow-hidden text-foreground *:data-[slot="command-group-heading"]:px-2 *:data-[slot="command-group-heading"]:py-1.5 *:data-[slot="command-group-heading"]:font-medium *:data-[slot="command-group-heading"]:text-muted-foreground *:data-[slot="command-group-heading"]:text-sm',
      className,
    )}
    {...props}
  />
))
CommandGroup.displayName = CommandPrimitive.Group.displayName

export const COMMAND_ITEM_CLASSNAME =
  'relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden transition-color duration-300 hover:bg-muted hover:text-accent-foreground data-disabled:cursor-not-allowed data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:opacity-50 [&_svg:not([class*=size-])]:size-4'

const CommandItem = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    data-slot="command-item"
    className={cn(COMMAND_ITEM_CLASSNAME, className)}
    {...props}
  />
))
CommandItem.displayName = CommandPrimitive.Item.displayName

const CommandSeparator = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    data-slot="command-separator"
    className={cn('-mx-1 my-2 h-px bg-secondary', className)}
    {...props}
  />
))
CommandSeparator.displayName = CommandPrimitive.Separator.displayName

const CommandShortcut = React.forwardRef<HTMLElement, ICommandBadgeProps>(
  ({ className, keys, onKeysPressed, variant = 'default', ...props }, ref) => {
    const commands = React.useMemo(
      () =>
        keys && onKeysPressed
          ? {
              [keys]: {
                description: keys,
                execute: () => {
                  onKeysPressed()
                },
                name: keys,
              },
            }
          : {},
      [keys, onKeysPressed],
    )

    useKeyCommands(commands, { preventDefault: true })

    return (
      <kbd
        className={cn(
          'focus:offset-2 pointer-events-none ms-auto inline-flex cursor-none select-none items-center gap-0.5 rounded-sm px-2 py-[.12rem] font-sans text-secondary-foreground text-sm tracking-widest transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring [&_svg:not([class*=size-])]:size-3',
          variant === 'secondary' && 'bg-secondary',
          className,
        )}
        data-slot="command-badge"
        ref={ref}
        {...props}
      />
    )
  },
)
CommandShortcut.displayName = 'CommandShortcut'

function CommandDialog({
  children,
  shouldFilter,
  contentClassName,
  ...props
}: React.ComponentPropsWithoutRef<typeof Dialog> & { shouldFilter?: boolean; contentClassName?: string }) {
  return (
    <Dialog {...props}>
      <DialogContent
        className={cn('h-125 max-w-full p-0 transition-all duration-200 lg:w-175', contentClassName)}
        hideClose>
        <DialogTitle className="sr-only">Command palette</DialogTitle>
        <DialogDescription className="sr-only">Search for commands and navigation items</DialogDescription>
        <Command className="max-w-full" shouldFilter={shouldFilter}>
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  )
}
CommandDialog.displayName = 'CommandDialog'

function useCommandListContext(__scopeCommand: Parameters<typeof CommandPrimitive.useCommandContext>[1]) {
  return CommandPrimitive.useCommandContext('Command', __scopeCommand)
}

export {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
  useCommandListContext,
}
