import * as React from 'react'
import { useLayoutEffect } from '../hooks/use-layout-effect'
import { useComposedRefs } from '../libs/compose-ref'
import { Primitive } from '../primitive-elements'
import { Slottable } from '../slot'
import { useSelectBubbleInputContext, useSelectContext } from './select'
import { shouldShowPlaceholder } from './select.libs'
import type { ISelect } from './select.types'

const VALUE_NAME = 'SelectValue'

export const SelectValue = React.forwardRef<HTMLSpanElement, ISelect.IValueProps>(
  (props: ISelect.IScoped<ISelect.IValueProps>, forwardedRef) => {
    const { __scopeSelect, asChild, children, placeholder = '', style, ...valueProps } = props
    const context = useSelectContext(VALUE_NAME, __scopeSelect)
    const { onValueNodeHasChildrenChange } = context
    const ownChildren =
      asChild && React.isValidElement<{ children?: React.ReactNode }>(children) ? children.props.children : children
    const hasChildren = ownChildren !== undefined
    const composedRefs = useComposedRefs(forwardedRef, context.onValueNodeChange)
    const { value } = context
    // The picked item's text is portalled into this node, where React would write a lone string child over it,
    // so the string needs a text node of its own.
    const label = context.multiple ? (
      <SelectValueLabels __scopeSelect={__scopeSelect} />
    ) : (
      context.items?.find((item) => item.value === value)?.label
    )
    const fill = (own: ISelect.IValueProps['children']) => (
      <>
        {shouldShowPlaceholder(value)
          ? placeholder
          : typeof own === 'function'
            ? own([value ?? []].flat())
            : (own ?? label)}
      </>
    )

    useLayoutEffect(() => {
      onValueNodeHasChildrenChange(hasChildren)
    }, [onValueNodeHasChildrenChange, hasChildren])

    return (
      <Primitive.span
        data-slot="select-value"
        {...valueProps}
        asChild={asChild}
        ref={composedRefs}
        dir={context.dir}
        // Events from the portalled item text must not bubble through the item it came from.
        style={{ ...style, pointerEvents: 'none' }}>
        {asChild ? (
          <Slottable child={typeof children === 'function' ? null : children}>{fill}</Slottable>
        ) : (
          fill(children)
        )}
      </Primitive.span>
    )
  },
)

SelectValue.displayName = VALUE_NAME

// Its own component, so a single select's value does not render again each time an item registers its option.
function SelectValueLabels({ __scopeSelect }: ISelect.IScoped<object>) {
  const { value, items } = useSelectContext(VALUE_NAME, __scopeSelect)
  const { nativeOptions } = useSelectBubbleInputContext(VALUE_NAME, __scopeSelect)
  const labels = new Map<unknown, React.ReactNode>(
    items
      ? items.map((item) => [item.value, item.label])
      : Array.from(nativeOptions, ({ props }) => [props.value, props.children]),
  )
  return [value ?? []]
    .flat()
    .map((picked) => labels.get(picked))
    .filter(Boolean)
    .join(', ')
}
