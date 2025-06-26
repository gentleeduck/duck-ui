'use client'

import { useDialogContext } from '@gentleduck/aria-feather/dialog'
import { cn } from '@gentleduck/libs/cn'
import { CheckIcon, ChevronDown, ChevronDownIcon, ChevronUp } from 'lucide-react'
import * as React from 'react'
import { Button, buttonVariants } from '../button'
import { useHandleKeyDown } from '../command'
import { DropdownMenuContent, DropdownMenuTrigger } from '../dropdown-menu'
import { Popover } from '../popover'
// import { useHandleKeyDown } from '../command'
import { useSelectInit, useSelectScroll } from './select.hooks'

export interface SelectContextType {
  open: boolean
  onOpenChange: (open: boolean) => void
  wrapperRef: React.RefObject<HTMLDivElement | null>
  triggerRef: React.RefObject<HTMLDivElement | null>
  contentRef: React.RefObject<HTMLDivElement | null>
  groupsRef: React.RefObject<HTMLUListElement[] | null>
  itemsRef: React.RefObject<HTMLLIElement[] | null>
  selectedItem: HTMLLIElement | null
}

export const SelectContext = React.createContext<SelectContextType | null>(null)
export function useSelectContext() {
  const context = React.useContext(SelectContext)
  if (context === null) {
    throw new Error('useSelectContext must be used within a SelectProvider')
  }
  return context
}

function SelectWrapper({
  children,
  open,
  onOpenChange,
  ...props
}: React.HTMLProps<HTMLDivElement> & {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const { itemsRef, selectedItemRef, contentRef, triggerRef, groupsRef, wrapperRef, selectedItem } = useSelectInit(
    open ?? false,
    onOpenChange,
  )
  const { open: _open, onOpenChange: _onOpenChange } = useDialogContext()

  useSelectScroll(itemsRef, selectedItemRef, contentRef)

  // TODO: FIX: keyboard command crash's the app
  useHandleKeyDown(
    itemsRef,
    (item) => {
      selectedItemRef.current = item
    },
    itemsRef,
    triggerRef as React.RefObject<HTMLButtonElement | null>,
    contentRef,
    onOpenChange,
  )

  return (
    <SelectContext.Provider
      value={{
        wrapperRef,
        selectedItem,
        itemsRef,
        contentRef,
        groupsRef,
        open: open!, //?? _open!,
        onOpenChange: () => {
          // if (onOpenChange) onOpenChange(true)
          // _onOpenChange?.(true)
        },
        triggerRef,
      }}>
      <div ref={wrapperRef} {...props} duck-select="">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

function Select({ children, ...props }: React.HTMLProps<HTMLDivElement>) {
  return (
    <Popover>
      <SelectWrapper {...props}>{children}</SelectWrapper>
    </Popover>
  )
}

function SelectGroup({ children, ...props }: React.HTMLProps<HTMLUListElement>) {
  return (
    <ul {...props} duck-select-group="">
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

function SelectTrigger({
  children,
  className,
  customIndicator,
  ref,
  ...props
}: React.HTMLProps<HTMLDivElement> & { customIndicator?: React.ReactNode }) {
  const { triggerRef } = useSelectContext()
  return (
    <DropdownMenuTrigger ref={triggerRef} {...props} duck-dropdown-menu-trigger="">
      {children}
      <span className="[&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:opacity-50">
        {customIndicator ? customIndicator : <ChevronDownIcon />}
      </span>
    </DropdownMenuTrigger>

    // <div
    //   className={cn(
    //     buttonVariants({ variant: 'outline', size: 'sm' }),
    //     'h-auto justify-between gap-1 font-normal data-[open=true]:bg-secondary data-[open=true]:text-accent-foreground ltr:pr-2 rtl:pl-2',
    //     className,
    //   )}>
    // </div>
  )
}

function SelectContent({
  children,
  className,
  position = 'popper',
  ref,
  ...props
}: React.HTMLProps<HTMLDivElement> & {
  position?: 'popper'
}) {
  const { contentRef } = useSelectContext()
  return (
    <DropdownMenuContent>
      <div
        ref={contentRef}
        className={cn(
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative relative z-50 mt-1 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-y-auto overflow-x-hidden rounded-md bg-popover text-popover-foreground shadow-md data-[state=closed]:animate-out data-[state=open]:animate-in',
          position === 'popper' &&
            'data-[side=left]:-translate-x-1 data-[side=top]:-translate-y-1 data-[side=right]:translate-x-1 data-[side=bottom]:translate-y-1',
          // 'h-fit',

          className,
        )}
        {...props}
        data-position={position}
        duck-select-content="">
        {
          // <SelectScrollUpButton />
          // <SelectScrollDownButton />
        }
        <div className="max-h-[400px] overflow-scroll" duck-select-content-scrollable="">
          {children}
        </div>
      </div>
    </DropdownMenuContent>
  )
}

function SelectLabel({ children, className, ref, ...props }: React.HTMLProps<HTMLLabelElement>) {
  return (
    <label
      ref={ref}
      className={cn('px-2 py-1.5 text-muted-foreground text-xs', className)}
      {...props}
      duck-select-label="">
      {children}
    </label>
  )
}

function SelectItem({ children, ref, className, ...props }: React.HTMLProps<HTMLLIElement>) {
  const { selectedItem } = useSelectContext()
  const id = React.useId()
  return (
    <li
      ref={ref}
      id={id}
      {...props}
      duck-select-item=""
      className="relative flex flex cursor-default cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden transition-color duration-300 will-change-300 hover:bg-muted hover:text-accent-foreground data-[disabled=true]:pointer-events-none data-[selected='true']:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&[aria-selected]>#select-indicator]:bg-secondary [&[aria-selected]]:bg-secondary">
      <div
        className={cn(
          'relative flex select-none items-center gap-2 truncate rounded-xs text-sm outline-hidden',
          className,
        )}>
        {children}
      </div>
      {selectedItem?.id === id && (
        <span
          className="absolute flex items-center justify-center ltr:right-2 ltr:pl-2 rtl:left-2 rtl:pr-2"
          id="select-indicator">
          <CheckIcon className="!size-3.5 shrink-0" />
        </span>
      )}
    </li>
  )
}

function SelectSeparator({ children, className, ref, ...props }: React.HTMLProps<HTMLDivElement>) {
  return <div ref={ref} className={cn('-mx-1 my-1 h-px bg-muted', className)} {...props} duck-select-separator="" />
}

function SelectScrollButton({
  children,
  className,
  scrollDown,
  ...props
}: React.ComponentPropsWithRef<typeof Button> & { scrollDown?: boolean }) {
  return (
    <Button
      variant="nothing"
      size="xs"
      className={cn(
        'sticky z-50 w-full cursor-default cursor-pointer justify-center rounded-none bg-background p-0',
        scrollDown ? 'bottom-0' : 'top-0',
        className,
      )}
      {...props}
      duck-select-scroll-up-button="">
      {scrollDown ? <ChevronDown className="shrink-0" /> : <ChevronUp className="shrink-0" />}
    </Button>
  )
}

function SelectScrollUpButton(props: React.ComponentPropsWithRef<typeof Button>) {
  return <SelectScrollButton {...props} duck-select-scroll-up-button="" scrollDown={false} />
}

function SelectScrollDownButton(props: React.ComponentPropsWithRef<typeof Button>) {
  return <SelectScrollButton {...props} duck-select-scroll-down-button="" scrollDown={true} />
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
