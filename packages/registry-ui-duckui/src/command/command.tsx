import { cn } from '@gentleduck/libs/cn'
import { Search } from 'lucide-react'
import React from 'react'
import { Dialog, DialogContent, DialogProps } from '../dialog'
import { ScrollArea } from '../scroll-area'
import {
  useCommandContext,
  useCommandElements,
  useCommandRefsContext,
  useCommandSearch,
  useHandleKeyDown,
} from './command.hooks'
import { CommandBadgeProps, CommandContextType, CommandGroupProps, CommandRefsContextType } from './command.types'

export const CommandContext: React.Context<CommandContextType | null> = React.createContext<CommandContextType | null>(
  null,
)

export const CommandRefsContext: React.Context<CommandRefsContextType | null> =
  React.createContext<CommandRefsContextType | null>(null)

function CommandRefs({ children }: { children: React.ReactNode }): React.JSX.Element {
  const commandRef = React.useRef<HTMLDivElement | null>(null)
  const listRef = React.useRef<HTMLUListElement | null>(null)
  const emptyRef = React.useRef<HTMLHeadingElement | null>(null)
  const inputRef = React.useRef<HTMLInputElement | null>(null)

  const [selectedItem, setSelectedItem] = React.useState<HTMLLIElement | null>(null)
  const { items, groups, filteredItems } = useCommandElements(commandRef, setSelectedItem)

  return (
    <CommandRefsContext.Provider
      value={{
        commandRef,
        listRef,
        emptyRef,
        inputRef,
        items,
        filteredItems,
        groups,
        selectedItem,
        setSelectedItem,
      }}>
      {children}
    </CommandRefsContext.Provider>
  )
}

function CommandWrapper({ className, ref, ...props }: React.HTMLProps<HTMLDivElement>): React.JSX.Element {
  const [search, setSearch] = React.useState<string>('')
  const { filteredItems, items, setSelectedItem, commandRef, groups, emptyRef } = useCommandRefsContext()

  useCommandSearch(items, search, setSelectedItem, emptyRef, commandRef, groups, filteredItems)
  useHandleKeyDown(
    filteredItems,
    (item) => {
      setSelectedItem(item)
    },
    items,
    commandRef as React.RefObject<HTMLButtonElement | null>,
    commandRef,
  )

  return (
    <CommandContext.Provider
      value={{
        search,
        setSearch,
      }}>
      <div
        ref={commandRef}
        duck-command-wrapper=""
        className={cn(
          'flex h-full w-full max-w-96 border shadow-sm flex-col overflow-hidden rounded-md bg-popover text-popover-foreground p-2',
          className,
        )}
        {...props}
      />
    </CommandContext.Provider>
  )
}

/**
 * The Command component is a wrapper for the CommandInput and CommandList components.
 * It provides the context for the CommandInput and CommandList components.
 *
 * @param {React.ReactNode} children - The children of the Command component.
 * @returns {React.JSX.Element} The rendered Command component.
 */
function Command({ children, ...props }: React.ComponentPropsWithRef<typeof CommandWrapper>): React.JSX.Element {
  return (
    <CommandRefs>
      <CommandWrapper {...props}>{children}</CommandWrapper>
    </CommandRefs>
  )
}

/**
 * @description Component to handle the refs of the command
 * @function CommandInput
 * @param {string} [props.className] - The props of the CommandInput component.
 * @param {React.Ref<HTMLInputElement>} [prop.ref] - The ref of the CommandInput component.
 * @param {React.HTMLAttributes<HTMLInputElement>} [...props] - The props of the CommandInput component.
 * @returns {React.JSX.Element} The rendered CommandInput component.
 */
function CommandInput({ className, onChange, ...props }: React.HTMLProps<HTMLInputElement>): React.JSX.Element {
  const { setSearch } = useCommandContext()
  const context = useCommandRefsContext()

  return (
    <div className="flex items-center border-b px-3 gap-2" cmdk-input-wrapper="">
      <Search className="size-[20px] shrink-0 opacity-50" />
      <input
        ref={context.inputRef}
        onChange={(e) => {
          setSearch(() => e.target.value)
          onChange?.(e)
        }}
        className={cn(
          'flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        tabIndex={0}
        {...props}
      />
    </div>
  )
}

/**
 * @description Component to handle the refs of the command
 * @function CommandEmpty
 * @param {string} [props.className] - The props of the CommandEmpty component.
 * @param {React.HTMLAttributes<HTMLHeadingElement>} [...props] - The props of the CommandEmpty component.
 * @returns {React.JSX.Element} The rendered CommandEmpty component.
 *
 */
function CommandEmpty({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>): React.JSX.Element {
  const context = useCommandRefsContext()
  return <h6 ref={context.emptyRef} className="py-6 text-center text-sm hidden" {...props} duck-command-empty="" />
}

/**
 * @description Component to handle the refs of the command
 * @function CommandList
 * @param {string} [props.className] - The props of the CommandList component.
 * @param {React.HTMLAttributes<HTMLUListElement>} [...props] - The props of the CommandList component.
 * @returns {React.JSX.Element} The rendered CommandList component.
 */
function CommandList({ className, ...props }: React.HTMLAttributes<HTMLUListElement>): React.JSX.Element {
  const context = useCommandRefsContext()
  return (
    <ScrollArea>
      <ul ref={context.listRef} className={cn('max-h-[300px] focus:outline-none', className)} {...props} />
    </ScrollArea>
  )
}

/**
 * @description Component to handle the refs of the command
 * @function CommandGroup
 * @param {string} [props.className] - The props of the CommandGroup component.
 * @param {string} [props.heading] - The heading of the CommandGroup component.
 * @param {React.ReactNode} [props.children] - The children of the CommandGroup component.
 * @param {React.Ref<HTMLDivElement>} [props.ref] - The ref of the CommandGroup component.
 * @param {React.HTMLAttributes<HTMLDivElement>} [...props] - The props of the CommandGroup component.
 * @returns {React.JSX.Element} The rendered CommandGroup component.
 */
function CommandGroup({ className, children, heading, ref, ...props }: CommandGroupProps): React.JSX.Element {
  return (
    <div
      ref={ref}
      className={cn(
        'overflow-hidden p-2 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground',
        className,
      )}
      {...props}
      duck-command-group="">
      <h3 className="text-xs text-muted-foreground pb-1 pl-1">{heading}</h3>
      {children}
    </div>
  )
}

/**
 * @description Component to handle the refs of the command
 * @function CommandItem
 * @param {string} [props.className] - The props of the CommandItem component.
 * @param {React.ReactNode} [props.children] - The children of the CommandItem component.
 * @param {React.Ref<HTMLDivElement>} [props.ref] - The ref of the CommandItem component.
 * @param {React.HTMLAttributes<HTMLDivElement>} [...props] - The props of the CommandItem component.
 * @returns {React.JSX.Element} The rendered CommandItem component.
 */
function CommandItem({ className, ref, ...props }: React.HTMLProps<HTMLLIElement>): React.JSX.Element {
  return (
    <li
      ref={ref}
      duck-command-item=""
      className={cn(
        "relative flex cursor-default select-none items-center rounded-xs px-2 py-1.5 text-sm outline-hidden data-[disabled=true]:pointer-events-none data-[selected='true']:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:size-4 flex gap-2 hover:bg-muted cursor-pointer transition-color duration-300 will-change-300 hover:text-accent-foreground [&[aria-selected]]:bg-secondary ",
        className,
      )}
      {...props}
    />
  )
}

/**
 * @description Component to handle the refs of the command
 * @function CommandShortcut
 * @param {string} [props.className] - The props of the CommandShortcut component.
 * @param {string} [props.keys] - The keys of the CommandShortcut component.
 * @param {React.Ref<HTMLDivElement>} [props.ref] - The ref of the CommandShortcut component.
 * @param {React.HTMLAttributes<HTMLDivElement>} [...props] - The props of the CommandShortcut component.
 * @returns {React.JSX.Element} The rendered CommandShortcut component.
 */
import { useKeyCommands } from '@gentleduck/vim/react'

function CommandShortcut({ className, keys, onKeysPressed, ref, ...props }: CommandBadgeProps): React.JSX.Element {
  useKeyCommands({
    [keys]: {
      name: keys,
      description: keys,
      execute: () => onKeysPressed(),
    },
  })

  return (
    <kbd
      className={cn(
        'inline-flex items-center gap-[2px] transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring focus:offset-2 text-[.7rem] py-[.12rem] px-2 rounded-[4px] text-secondary-foreground [&_svg]:!size-3 !font-sans cursor-none pointer-events-none select-none ltr:ml-auto rtl:mr-auto text-xs tracking-widest text-muted-foreground',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
}

/**
 * @description Component to handle the refs of the command
 * @function CommandSeparator
 * @param {string} [props.className] - The props of the CommandSeparator component.
 * @param {React.Ref<HTMLDivElement>} [props.ref] - The ref of the CommandSeparator component.
 * @param {React.HTMLAttributes<HTMLDivElement>} [...props] - The props of the CommandSeparator component.
 * @returns {React.JSX.Element} The rendered CommandSeparator component.
 */
function CommandSeparator({ className, ref, ...props }: React.HTMLProps<HTMLDivElement>): React.JSX.Element {
  return <div ref={ref} className={cn('-mx-1 h-px bg-border mx-2', className)} {...props} duck-command-separator="" />
}

/**
 * @description Component to handle the refs of the command
 * @function CommandDialog
 * @param {string} [props.className] - The props of the CommandDialog component.
 * @param {React.Ref<HTMLDivElement>} [props.ref] - The ref of the CommandDialog component.
 * @param {React.HTMLAttributes<HTMLDivElement>} [...props] - The props of the CommandDialog component.
 * @returns {React.JSX.Element} The rendered CommandDialog component.
 */
function CommandDialog({ children, ...props }: DialogProps): React.JSX.Element {
  return (
    <Dialog {...props}>
      <DialogContent className="[&>.content-wrapper]:p-0 open:backdrop:bg-black/80 [&>div>div]:max-w-full">
        <Command>{children}</Command>
      </DialogContent>
    </Dialog>
  )
}

export {
  Command,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
  CommandEmpty,
  CommandShortcut,
  CommandSeparator,
  CommandDialog,
}
