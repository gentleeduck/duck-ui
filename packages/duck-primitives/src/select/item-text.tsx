import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { useLayoutEffect } from '../hooks/use-layout-effect'
import { useComposedRefs } from '../libs/compose-ref'
import { Primitive } from '../primitive-elements'
import {
  useSelectContentContext,
  useSelectContext,
  useSelectItemContext,
  useSelectNativeOptionsContext,
} from './select'
import { shouldShowPlaceholder } from './select.libs'
import type { ISelect } from './select.types'

const ITEM_TEXT_NAME = 'SelectItemText'

export const SelectItemText = React.forwardRef<HTMLSpanElement, ISelect.IScoped<ISelect.IItemTextProps>>(
  (props, forwardedRef) => {
    const { __scopeSelect, ...itemTextProps } = props
    const context = useSelectContext(ITEM_TEXT_NAME, __scopeSelect)
    const contentContext = useSelectContentContext(ITEM_TEXT_NAME, __scopeSelect)
    const itemContext = useSelectItemContext(ITEM_TEXT_NAME, __scopeSelect)
    const nativeOptionsContext = useSelectNativeOptionsContext(ITEM_TEXT_NAME, __scopeSelect)
    const { itemTextRefCallback } = contentContext
    const { value, disabled, textRef } = itemContext
    const composedRefs = useComposedRefs(
      forwardedRef,
      textRef,
      React.useCallback(
        (node: HTMLSpanElement | null) => itemTextRefCallback?.(node, value, disabled),
        [itemTextRefCallback, value, disabled],
      ),
    )

    const { onNativeOptionAdd, onNativeOptionRemove } = nativeOptionsContext
    const { children } = itemTextProps
    // Read after the commit, so the option holds the text the span shows now, with no second render to read it.
    useLayoutEffect(() => {
      const option = (
        <option key={value} value={value} disabled={disabled}>
          {textRef.current?.textContent}
        </option>
      )
      onNativeOptionAdd(option)
      return () => onNativeOptionRemove(option)
    }, [onNativeOptionAdd, onNativeOptionRemove, value, disabled, children])

    return (
      <>
        <Primitive.span
          data-slot="select-item-text"
          id={itemContext.textId}
          dir={context.dir}
          {...itemTextProps}
          ref={composedRefs}
        />

        {itemContext.isSelected &&
        !context.multiple &&
        !shouldShowPlaceholder(context.value) &&
        context.valueNode &&
        !context.valueNodeHasChildren &&
        !context.items
          ? ReactDOM.createPortal(itemTextProps.children, context.valueNode)
          : null}
      </>
    )
  },
)

SelectItemText.displayName = ITEM_TEXT_NAME
