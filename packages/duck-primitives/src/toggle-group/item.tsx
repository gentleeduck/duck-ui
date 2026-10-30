import * as React from 'react'
import { composeEventHandlers } from '../libs/compose-event-handler'
import { type Primitive, primitiveElement } from '../primitive-elements/primitive-elements'
import { useRovingFocusItem } from '../roving-focus'
import { useRovingFocusGroupScope, useToggleGroupContext } from './toggle-group'
import type { IToggleGroup } from './toggle-group.types'

const ITEM_NAME = 'ToggleGroupItem'

type ToggleGroupItemElement = React.ComponentRef<typeof Primitive.button>

const ToggleGroupItem = React.forwardRef<ToggleGroupItemElement, IToggleGroup.IItemProps>(
  (props: IToggleGroup.IScoped<IToggleGroup.IItemProps>, forwardedRef) => {
    const {
      __scopeToggleGroup,
      value,
      disabled: disabledProp,
      asChild,
      children,
      onMouseDown,
      onFocus,
      onKeyDown,
      ...itemProps
    } = props
    const context = useToggleGroupContext(ITEM_NAME, __scopeToggleGroup)
    const rovingFocusGroupScope = useRovingFocusGroupScope(__scopeToggleGroup)
    const pressed = context.value.includes(value)
    const disabled = context.disabled || disabledProp || false
    const isSingle = context.type === 'single'
    const item = useRovingFocusItem(
      { ...rovingFocusGroupScope, focusable: !disabled, active: pressed, onMouseDown, onFocus, onKeyDown },
      forwardedRef,
      context.rovingFocus,
    )

    const Element = primitiveElement('button', asChild)

    return (
      <Element
        type="button"
        {...(item.attributes ?? { tabIndex: disabled ? -1 : 0 })}
        data-slot="toggle-group-item"
        role={isSingle ? 'radio' : undefined}
        aria-checked={isSingle ? pressed : undefined}
        aria-pressed={isSingle ? undefined : pressed}
        data-state={pressed ? 'on' : 'off'}
        data-disabled={disabled ? '' : undefined}
        disabled={disabled}
        dir={context.dir}
        {...itemProps}
        {...item.handlers}
        onClick={composeEventHandlers(props.onClick, () => {
          if (pressed) {
            if (context.deselectable || context.value.length > 1) context.onItemDeactivate(value)
          } else {
            context.onItemActivate(value)
          }
        })}>
        {typeof children === 'function' ? children(pressed) : children}
      </Element>
    )
  },
)

ToggleGroupItem.displayName = ITEM_NAME

export { ToggleGroupItem }
