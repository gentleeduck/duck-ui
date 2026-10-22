import * as React from 'react'
import { composeEventHandlers } from '../libs/compose-event-handler'
import type { Scope } from '../libs/create-context'
import { type Primitive, primitiveElement } from '../primitive-elements/primitive-elements'
import { useRovingFocusItem } from '../roving-focus'
import { RadioGroupItemBubbleInput } from './item-bubble-input'
import {
  RadioGroupItemContextProvider,
  useRadioGroupContext,
  useRadioGroupItemContext,
  useRovingFocusGroupScope,
} from './radio-group'
import type { IRadioGroup } from './radio-group.types'

const ITEM_NAME = 'RadioGroupItem'
const ITEM_PROVIDER_NAME = 'RadioGroupItemProvider'
const ITEM_TRIGGER_NAME = 'RadioGroupItemTrigger'

type RadioGroupItemElement = React.ComponentRef<typeof Primitive.button>

function getItemState(
  context: IRadioGroup.IContext,
  value: string,
  disabled: boolean | undefined,
): IRadioGroup.IItemContext {
  return { value, checked: context.value === value, disabled: context.disabled || !!disabled }
}

function RadioGroupItemProvider(props: IRadioGroup.IScoped<IRadioGroup.IItemProviderProps>) {
  const { __scopeRadioGroup, value, disabled, children } = props
  const context = useRadioGroupContext(ITEM_PROVIDER_NAME, __scopeRadioGroup)
  return (
    <RadioGroupItemContextProvider scope={__scopeRadioGroup} {...getItemState(context, value, disabled)}>
      {children}
    </RadioGroupItemContextProvider>
  )
}

RadioGroupItemProvider.displayName = ITEM_PROVIDER_NAME

// Item calls this instead of rendering ItemTrigger, which would cost a fiber per radio.
function useRadioGroupItemTrigger(
  __scopeRadioGroup: Scope,
  { value, checked, disabled }: IRadioGroup.IItemContext,
  { textValue, asChild, onMouseDown, onFocus, onKeyDown, ...triggerProps }: IRadioGroup.IItemTriggerProps,
  forwardedRef: React.ForwardedRef<RadioGroupItemElement>,
) {
  const context = useRadioGroupContext(ITEM_TRIGGER_NAME, __scopeRadioGroup)
  const rovingFocusGroupScope = useRovingFocusGroupScope(__scopeRadioGroup)
  const item = useRovingFocusItem(
    {
      ...rovingFocusGroupScope,
      focusable: !disabled,
      active: checked,
      onMouseDown,
      onKeyDown: composeEventHandlers(onKeyDown, (event) => {
        // A radio checks on Space; a button would also click on Enter.
        if (event.key === 'Enter') event.preventDefault()
      }),
      onFocus: composeEventHandlers(onFocus, (event) => {
        // An arrow key checks the radio it lands on with a click, as on a native radio.
        if (context.isNavigationKeyPressedRef.current) event.currentTarget.click()
      }),
    },
    forwardedRef,
  )
  const Element = primitiveElement('button', asChild)

  return (
    <Element
      type="button"
      {...item.attributes}
      role="radio"
      data-slot="radio-group-item"
      aria-checked={checked}
      data-state={checked ? 'checked' : 'unchecked'}
      data-disabled={disabled ? '' : undefined}
      data-readonly={context.readOnly ? '' : undefined}
      disabled={disabled}
      data-text-value={textValue}
      data-value={value}
      {...triggerProps}
      {...item.handlers}
      onClick={composeEventHandlers(triggerProps.onClick, (event) => {
        if (!checked && !disabled && !context.readOnly) {
          context.silentValueRef.current = event.isPropagationStopped() ? value : undefined
          context.onValueChange(value)
        }
      })}
    />
  )
}

const RadioGroupItemTrigger = React.forwardRef<RadioGroupItemElement, IRadioGroup.IItemTriggerProps>(
  (props: IRadioGroup.IScoped<IRadioGroup.IItemTriggerProps>, forwardedRef) => {
    const { __scopeRadioGroup, ...triggerProps } = props
    const item = useRadioGroupItemContext(ITEM_TRIGGER_NAME, __scopeRadioGroup)
    return useRadioGroupItemTrigger(__scopeRadioGroup, item, triggerProps, forwardedRef)
  },
)

RadioGroupItemTrigger.displayName = ITEM_TRIGGER_NAME

const RadioGroupItem = React.forwardRef<RadioGroupItemElement, IRadioGroup.IItemProps>(
  (props: IRadioGroup.IScoped<IRadioGroup.IItemProps>, forwardedRef) => {
    const { __scopeRadioGroup, value, disabled, ...triggerProps } = props
    const context = useRadioGroupContext(ITEM_NAME, __scopeRadioGroup)
    const item = getItemState(context, value, disabled)
    const trigger = useRadioGroupItemTrigger(__scopeRadioGroup, item, triggerProps, forwardedRef)

    return (
      <RadioGroupItemContextProvider scope={__scopeRadioGroup} {...item}>
        {trigger}
        {context.name ? <RadioGroupItemBubbleInput __scopeRadioGroup={__scopeRadioGroup} /> : null}
      </RadioGroupItemContextProvider>
    )
  },
)

RadioGroupItem.displayName = ITEM_NAME

export { RadioGroupItem, RadioGroupItemProvider, RadioGroupItemTrigger }
