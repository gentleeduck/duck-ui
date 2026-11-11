import * as React from 'react'
import { useId } from '../hooks/use-id'
import { useLayoutEffect } from '../hooks/use-layout-effect'
import { composeEventHandlers } from '../libs/compose-event-handler'
import { useComposedRefs } from '../libs/compose-ref'
import { Primitive } from '../primitive-elements'
import { Collection, CommandItemContextProvider, useCommandContext, useCommandListContext } from './command'
import type { ICommand } from './command.types'

const ITEM_NAME = 'CommandItem'

type CommandItemElement = React.ComponentRef<typeof Primitive.li>

export const CommandItem = React.forwardRef<CommandItemElement, ICommand.IItemProps>(
  (props: ICommand.IScoped<ICommand.IItemProps>, forwardedRef) => {
    const {
      __scopeCommand,
      value = '',
      disabled = false,
      forceMount = false,
      textValue,
      keywords,
      index,
      onSelect,
      children,
      ...itemProps
    } = props
    const context = useCommandContext(ITEM_NAME, __scopeCommand)
    const listContext = useCommandListContext(ITEM_NAME, __scopeCommand)
    const textId = useId()
    const itemId = useId()
    const itemRef = React.useRef<HTMLLIElement | null>(null)
    const textRef = React.useRef<HTMLElement | null>(null)
    const pointerTypeRef = React.useRef<React.PointerEvent['pointerType']>('touch')
    const composedRefs = useComposedRefs(forwardedRef, itemRef)

    const found = React.useRef<string | null>(null)
    const { onItemsChange } = context

    // The list filters again only when what it reads off an item changes, not on every render.
    useLayoutEffect(() => {
      const text = textValue || textRef.current?.textContent || itemRef.current?.textContent
      const next = [value, disabled, forceMount, text, ...(keywords ?? [])].join('\n')
      if (next === found.current) return
      found.current = next
      onItemsChange()
    })
    useLayoutEffect(() => () => onItemsChange(), [onItemsChange])

    const handleSelect = () => {
      if (!disabled) {
        onSelect?.(value)
      }
    }

    const itemContextValue = React.useMemo<ICommand.IItemContext>(
      () => ({
        value,
        disabled,
        textId,
        onItemTextChange: (node) => {
          textRef.current = node
        },
      }),
      [value, disabled, textId],
    )

    return (
      <CommandItemContextProvider scope={__scopeCommand} {...itemContextValue}>
        <Collection.ItemSlot
          scope={__scopeCommand}
          value={value}
          disabled={disabled}
          forceMount={forceMount}
          textValue={textValue}
          textRef={textRef}
          keywords={keywords}
          index={index}>
          <Primitive.li
            id={itemId}
            data-slot="command-item"
            data-value={value}
            role="option"
            aria-selected={false}
            aria-posinset={index === undefined ? undefined : index + 1}
            aria-setsize={listContext.setSize}
            aria-disabled={disabled || undefined}
            data-disabled={disabled ? '' : undefined}
            tabIndex={disabled ? undefined : -1}
            {...itemProps}
            ref={composedRefs}
            onFocus={composeEventHandlers(itemProps.onFocus, (event) => {
              context.highlight(event.currentTarget)
            })}
            onClick={composeEventHandlers(itemProps.onClick, (event) => {
              // A mouse selected on pointer up. A click with a detail of 0 has no pointer behind it: the root's
              // Enter, or a screen reader.
              if (pointerTypeRef.current !== 'mouse' || event.detail === 0) handleSelect()
            })}
            onPointerUp={composeEventHandlers(itemProps.onPointerUp, () => {
              if (pointerTypeRef.current === 'mouse') handleSelect()
            })}
            onPointerMove={composeEventHandlers(itemProps.onPointerMove, (event) => {
              pointerTypeRef.current = event.pointerType
              if (context.disablePointerSelection) return
              if (disabled) {
                listContext.onItemLeave?.()
              } else if (pointerTypeRef.current === 'mouse') {
                context.highlight(event.currentTarget)
              }
            })}
            onPointerLeave={composeEventHandlers(itemProps.onPointerLeave, (event) => {
              if (event.currentTarget === document.activeElement) {
                listContext.onItemLeave?.()
              }
            })}
            onKeyDown={composeEventHandlers(itemProps.onKeyDown, (event) => {
              if (event.key !== ' ' || context.typeaheadSearchRef.current !== '') return
              handleSelect()
              event.preventDefault()
            })}>
            {children}
          </Primitive.li>
        </Collection.ItemSlot>
      </CommandItemContextProvider>
    )
  },
)

CommandItem.displayName = ITEM_NAME
