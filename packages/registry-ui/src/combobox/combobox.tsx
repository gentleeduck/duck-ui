'use client'

import { cn } from '@gentleduck/libs/cn'
import React from 'react'
import { Badge } from '../badge'
import { Button } from '../button'
import { Checkbox } from '../checkbox'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../command'
import { Popover, PopoverContent, PopoverTrigger } from '../popover'
import { Separator } from '../separator'
import { COMBOBOX_MAX_SELECTION_BADGES } from './combobox.constants'
import { ComboboxContext, useCombobox, useComboboxItem } from './combobox.hooks'
import type { IComboboxItemProps, IComboboxItemType, IComboboxProps } from './combobox.types'

const Combobox = React.forwardRef<HTMLButtonElement, IComboboxProps>((props, ref) => {
  const {
    items,
    command,
    commandInput,
    commandEmpty = 'Nothing found.',
    commandTriggerPlaceholder = 'Select item...',
    popoverTrigger,
    popoverContent,
    withSearch = true,
    showSelected = true,
    children,
  } = props
  const { context, direction, labels, multiple, open, setOpen } = useCombobox(props)

  return (
    <ComboboxContext.Provider value={context}>
      <Popover {...props.popover} dir={direction} onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <Button ref={ref} {...popoverTrigger} variant={popoverTrigger?.variant ?? 'dashed'}>
            {popoverTrigger?.children}
            {showSelected &&
              (labels.length === 0 ? (
                commandTriggerPlaceholder
              ) : multiple ? (
                <>
                  <Separator orientation="vertical" />
                  <div className="flex gap-1">
                    {labels.length > COMBOBOX_MAX_SELECTION_BADGES ? (
                      <Badge className="rounded-sm px-2 py-0.75 font-normal" variant={'secondary'}>
                        +{labels.length} Selected
                      </Badge>
                    ) : (
                      labels.map((label) => (
                        <Badge className="rounded-[3px] px-2 py-0.5" key={label} variant={'secondary'}>
                          {label}
                        </Badge>
                      ))
                    )}
                  </div>
                </>
              ) : (
                labels[0]
              ))}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          {...popoverContent}
          dir={direction}
          className={cn('w-(--gentleduck-popover-trigger-width) p-0', popoverContent?.className)}>
          <Command {...command}>
            {withSearch && (
              <CommandInput
                {...commandInput}
                className={cn('h-8 px-2 [&_svg:not([class*=size-])]:size-4.5', commandInput?.className)}
              />
            )}
            <CommandList>
              {commandEmpty && <CommandEmpty>{commandEmpty}</CommandEmpty>}
              {children(items)}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </ComboboxContext.Provider>
  )
})
Combobox.displayName = 'Combobox'

const ComboboxGroup = React.forwardRef<
  React.ComponentRef<typeof CommandGroup>,
  React.ComponentPropsWithoutRef<typeof CommandGroup>
>((props, ref) => <CommandGroup ref={ref} {...props} />)
ComboboxGroup.displayName = 'ComboboxGroup'

const ComboboxItem = React.forwardRef<React.ComponentRef<typeof CommandItem>, IComboboxItemProps<IComboboxItemType>>(
  ({ item, onSelect, checked, ...props }, ref) => {
    const state = useComboboxItem({ checked, item, onSelect })
    return (
      <CommandItem
        ref={ref}
        value={item.value}
        aria-checked={state.checked === 'indeterminate' ? 'mixed' : state.checked}
        {...props}
        onSelect={state.select}>
        <Checkbox
          aria-hidden="true"
          checked={state.checked}
          className="pointer-events-none border-foreground/50"
          tabIndex={-1}
        />
        {item.label}
      </CommandItem>
    )
  },
)
ComboboxItem.displayName = 'ComboboxItem'

export { Combobox, ComboboxGroup, ComboboxItem }
