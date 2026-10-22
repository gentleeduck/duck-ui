import * as React from 'react'
import { composeEventHandlers } from '../libs/compose-event-handler'
import { useComposedRefs } from '../libs/compose-ref'
import { Primitive } from '../primitive-elements'
import { useRadioGroupContext, useRadioGroupItemContext } from './radio-group'
import { getEnabledRadios } from './radio-group.libs'
import type { IRadioGroup } from './radio-group.types'

const BUBBLE_INPUT_NAME = 'RadioGroupItemBubbleInput'

const RadioGroupItemBubbleInput = React.forwardRef<
  HTMLInputElement,
  IRadioGroup.IScoped<IRadioGroup.IItemBubbleInputProps>
>((props, forwardedRef) => {
  const { __scopeRadioGroup, ...inputProps } = props
  const { required, name, form, groupRef, silentChangeRef } = useRadioGroupContext(BUBBLE_INPUT_NAME, __scopeRadioGroup)
  const { value, checked, disabled } = useRadioGroupItemContext(BUBBLE_INPUT_NAME, __scopeRadioGroup)
  const ref = React.useRef<HTMLInputElement>(null)
  const composedRefs = useComposedRefs(forwardedRef, ref)
  const [defaultChecked] = React.useState(checked)
  const prevCheckedRef = React.useRef(checked)

  React.useEffect(() => {
    const input = ref.current
    const checkedChanged = prevCheckedRef.current !== checked
    prevCheckedRef.current = checked
    if (!input || !checkedChanged) return
    // A native radio fires nothing when unchecked or reset, and the setter keeps React's value tracker in step.
    if (!checked || silentChangeRef.current) {
      input.checked = checked
      return
    }
    // The prototype setter skips React's value tracker, so React reads this click as a change and calls onChange.
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'checked')?.set?.call(input, true)
    input.dispatchEvent(new Event('click', { bubbles: true }))
  }, [checked, silentChangeRef])

  return (
    <Primitive.input
      type="radio"
      aria-hidden
      defaultChecked={defaultChecked}
      required={required}
      disabled={disabled}
      name={name}
      value={value}
      form={form}
      {...inputProps}
      tabIndex={-1}
      ref={composedRefs}
      // The click above stands for the form's change; a clickable ancestor already had the trigger's click.
      onClick={composeEventHandlers(inputProps.onClick, (event) => event.stopPropagation())}
      // A form refusing a submit focuses this input, where arrow keys would check the hidden radios alone.
      onFocus={composeEventHandlers(inputProps.onFocus, () => {
        const group = groupRef.current
        if (group)
          getEnabledRadios(group)
            .find((radio) => radio.dataset.value === value)
            ?.focus()
      })}
      style={{
        ...inputProps.style,
        position: 'absolute',
        pointerEvents: 'none',
        opacity: 0,
        margin: 0,
        width: 1,
        height: 1,
        overflow: 'hidden',
      }}
    />
  )
})

RadioGroupItemBubbleInput.displayName = BUBBLE_INPUT_NAME

export { RadioGroupItemBubbleInput }
