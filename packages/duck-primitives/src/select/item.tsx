import * as React from 'react'
import { useId } from '../hooks/use-id'
import { composeEventHandlers } from '../libs/compose-event-handler'
import { useComposedRefs } from '../libs/compose-ref'
import { getRootActiveElement } from '../libs/shared-utils'
import { Primitive } from '../primitive-elements'
import {
  Collection,
  SELECTION_KEYS,
  SelectItemContextProvider,
  useSelectContentContext,
  useSelectContext,
} from './select'
import { includesValue } from './select.libs'
import type { ISelect } from './select.types'

const ITEM_NAME = 'SelectItem'

export const SelectItem = React.forwardRef<HTMLDivElement, ISelect.IScoped<ISelect.IItemProps>>(
  (props, forwardedRef) => {
    const { __scopeSelect, value, disabled = false, textValue, ...itemProps } = props
    const context = useSelectContext(ITEM_NAME, __scopeSelect)
    const contentContext = useSelectContentContext(ITEM_NAME, __scopeSelect)
    const isSelected = includesValue(context.value, value)
    const textRef = React.useRef<HTMLSpanElement>(null)
    const [isFocused, setIsFocused] = React.useState(false)
    const { itemRefCallback } = contentContext
    const composedRefs = useComposedRefs(
      forwardedRef,
      React.useCallback(
        (node: HTMLDivElement | null) => itemRefCallback?.(node, value, disabled),
        [itemRefCallback, value, disabled],
      ),
    )
    const textId = useId()
    const pointerTypeRef = React.useRef<React.PointerEvent['pointerType']>('touch')

    const handleSelect = (event: React.SyntheticEvent) => {
      if (!disabled) {
        context.onUserSelect(value, event.isPropagationStopped())
        if (!context.multiple) context.onOpenChange(false)
      }
    }

    const itemContextValue = React.useMemo<ISelect.IItemContext>(
      () => ({
        value,
        disabled,
        textId,
        isSelected,
        textRef,
      }),
      [value, disabled, textId, isSelected],
    )

    return (
      <SelectItemContextProvider scope={__scopeSelect} {...itemContextValue}>
        <Collection.ItemSlot
          scope={__scopeSelect}
          value={value}
          disabled={disabled}
          textValue={textValue}
          textRef={textRef}>
          <Primitive.div
            data-slot="select-item"
            role="option"
            aria-labelledby={textId}
            dir={context.dir}
            data-highlighted={isFocused ? '' : undefined}
            // `isFocused` caveat fixes stuttering in VoiceOver. Every option of a multiple select says whether it is picked.
            aria-selected={context.multiple ? isSelected : isSelected && isFocused}
            data-state={isSelected ? 'checked' : 'unchecked'}
            aria-disabled={disabled || undefined}
            data-disabled={disabled ? '' : undefined}
            tabIndex={disabled ? undefined : -1}
            {...itemProps}
            ref={composedRefs}
            onFocus={composeEventHandlers(itemProps.onFocus, () => setIsFocused(true))}
            onBlur={composeEventHandlers(itemProps.onBlur, () => setIsFocused(false))}
            onClick={composeEventHandlers(itemProps.onClick, (event) => {
              // Open on click when using a touch or pen device
              if (pointerTypeRef.current !== 'mouse') handleSelect(event)
            })}
            onPointerUp={composeEventHandlers(itemProps.onPointerUp, (event) => {
              // Mouse: down -> slide -> up-to-select is the expected UX
              if (pointerTypeRef.current === 'mouse') handleSelect(event)
            })}
            onPointerDown={composeEventHandlers(itemProps.onPointerDown, (event) => {
              pointerTypeRef.current = event.pointerType
            })}
            onPointerMove={composeEventHandlers(itemProps.onPointerMove, (event) => {
              // capture pointer type for slide-into-item case
              pointerTypeRef.current = event.pointerType
              if (disabled) {
                contentContext.onItemLeave?.()
              } else if (pointerTypeRef.current === 'mouse') {
                event.currentTarget.focus({ preventScroll: true })
              }
            })}
            onPointerLeave={composeEventHandlers(itemProps.onPointerLeave, (event) => {
              if (event.currentTarget === getRootActiveElement(event.currentTarget)) {
                contentContext.onItemLeave?.()
              }
            })}
            onKeyDown={composeEventHandlers(itemProps.onKeyDown, (event) => {
              // A focusable descendant portaled out of the item still sends its keys here through React's tree.
              if (event.target !== event.currentTarget) return
              const isTypingAhead = contentContext.searchRef?.current !== ''
              if (isTypingAhead && event.key === ' ') return
              if (SELECTION_KEYS.includes(event.key)) handleSelect(event)
              // suppress page scroll when Space selects
              if (event.key === ' ') event.preventDefault()
            })}
          />
        </Collection.ItemSlot>
      </SelectItemContextProvider>
    )
  },
)

SelectItem.displayName = ITEM_NAME
