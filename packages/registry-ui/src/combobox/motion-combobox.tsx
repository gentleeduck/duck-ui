'use client'

import { cn } from '@gentleduck/libs/cn'
import React from 'react'
import { MotionBadge } from '../badge'
import { MotionButton } from '../button'
import { MotionCheckbox } from '../checkbox'
import { Command, CommandEmpty, CommandInput, CommandList, MotionCommandItem } from '../command'
import { MotionPopover, MotionPopoverContent, PopoverTrigger } from '../popover'
import { MotionSeparator } from '../separator'
import { COMBOBOX_MAX_SELECTION_BADGES } from './combobox.constants'
import { ComboboxContext, useCombobox, useComboboxItem } from './combobox.hooks'
import type { IComboboxItemProps, IComboboxItemType, IComboboxProps } from './combobox.types'

const MotionCombobox = React.forwardRef<HTMLButtonElement, IComboboxProps>((props, ref) => {
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
      <MotionPopover {...props.popover} dir={direction} onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <MotionButton ref={ref} {...popoverTrigger} variant={popoverTrigger?.variant ?? 'dashed'}>
            {popoverTrigger?.children}
            {showSelected &&
              (labels.length === 0 ? (
                commandTriggerPlaceholder
              ) : multiple ? (
                <>
                  <MotionSeparator orientation="vertical" />
                  <div className="flex gap-1">
                    {labels.length > COMBOBOX_MAX_SELECTION_BADGES ? (
                      <MotionBadge className="rounded-sm px-2 py-0.75 font-normal" variant={'secondary'}>
                        +{labels.length} Selected
                      </MotionBadge>
                    ) : (
                      labels.map((label) => (
                        <MotionBadge className="rounded-[3px] px-2 py-0.5" key={label} variant={'secondary'}>
                          {label}
                        </MotionBadge>
                      ))
                    )}
                  </div>
                </>
              ) : (
                labels[0]
              ))}
          </MotionButton>
        </PopoverTrigger>
        <MotionPopoverContent
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
        </MotionPopoverContent>
      </MotionPopover>
    </ComboboxContext.Provider>
  )
})
MotionCombobox.displayName = 'MotionCombobox'

const MotionComboboxItem = React.forwardRef<
  React.ComponentRef<typeof MotionCommandItem>,
  IComboboxItemProps<IComboboxItemType> & { index?: number }
>(({ item, onSelect, checked, index = 0, ...props }, ref) => {
  const state = useComboboxItem({ checked, item, onSelect })
  return (
    <MotionCommandItem ref={ref} index={index} value={item.value} {...props} onSelect={state.select}>
      <MotionCheckbox
        aria-hidden="true"
        checked={state.checked}
        className="pointer-events-none border-foreground/50"
        tabIndex={-1}
      />
      {item.label}
    </MotionCommandItem>
  )
})
MotionComboboxItem.displayName = 'MotionComboboxItem'

export { MotionCombobox, MotionComboboxItem }
