import * as React from 'react'
import { composeEventHandlers } from '../libs/compose-event-handler'
import { useComposedRefs } from '../libs/compose-ref'
import { Primitive } from '../primitive-elements'
import { useSliderContext, useSliderThumbContext } from './slider'
import type { ISlider } from './slider.types'

const BUBBLE_INPUT_NAME = 'SliderBubbleInput'

const SliderBubbleInput = React.forwardRef<HTMLInputElement, ISlider.IScoped<ISlider.IBubbleInputProps>>(
  (props, forwardedRef) => {
    const { __scopeSlider, onInput, ...inputProps } = props
    const { index, value, name, form } = useSliderThumbContext(BUBBLE_INPUT_NAME, __scopeSlider)
    const { userRequestedValues } = useSliderContext(BUBBLE_INPUT_NAME, __scopeSlider)
    const ref = React.useRef<HTMLInputElement>(null)
    const composedRefs = useComposedRefs(forwardedRef, ref)
    const shouldStopPropagationRef = React.useRef(false)
    const prevValueRef = React.useRef(value)
    const handledRequestRef = React.useRef(userRequestedValues)
    const prevRequestRef = React.useRef(userRequestedValues)

    // Every change reaches a form's onChange; only one the user asked for also bubbles `input` to ancestors.
    React.useEffect(() => {
      const input = ref.current
      const setNativeValue = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
      const prevValue = prevValueRef.current
      const isRequestFromThisRender = userRequestedValues !== prevRequestRef.current
      prevValueRef.current = value
      prevRequestRef.current = userRequestedValues
      if (!input || !setNativeValue || prevValue === value) return

      const hasUnhandledRequest = userRequestedValues !== handledRequestRef.current
      handledRequestRef.current = userRequestedValues
      const requestedValue = userRequestedValues?.[index]
      // A change in the same render as the request is the user's even when a re-sort or the parent moved it; a later one only if it applies the request.
      const isUserInteraction =
        hasUnhandledRequest && ((isRequestFromThisRender && requestedValue !== prevValue) || requestedValue === value)

      shouldStopPropagationRef.current = !isUserInteraction
      setNativeValue.call(input, value ?? '')
      input.dispatchEvent(new Event('input', { bubbles: true }))
      shouldStopPropagationRef.current = false
    }, [index, value, userRequestedValues])

    return (
      <Primitive.input
        style={{ display: 'none' }}
        name={name}
        form={form}
        {...inputProps}
        ref={composedRefs}
        // A `value` would make React swallow the input event dispatched above.
        defaultValue={value}
        onInput={composeEventHandlers(onInput, (event) => {
          if (shouldStopPropagationRef.current) event.stopPropagation()
        })}
      />
    )
  },
)

SliderBubbleInput.displayName = BUBBLE_INPUT_NAME

export { SliderBubbleInput }
