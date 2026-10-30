import * as React from 'react'
import { useDirection } from '../direction'
import { useCallbackRef } from '../hooks/use-callback-ref'
import { useControllableState } from '../hooks/use-controllable-state'
import { useLayoutEffect } from '../hooks/use-layout-effect'
import { composeEventHandlers } from '../libs/compose-event-handler'
import { useComposedRefs } from '../libs/compose-ref'
import { createContextScope } from '../libs/create-context'
import { Primitive } from '../primitive-elements'
import type { IInputOTP } from './input-otp.types'

const INPUT_OTP_NAME = 'InputOTP'

export const REGEXP_ONLY_DIGITS = /^[0-9]$/
export const REGEXP_ONLY_CHARS = /^[a-zA-Z]$/
export const REGEXP_ONLY_DIGITS_AND_CHARS = /^[a-zA-Z0-9]$/

const [createInputOTPContext, createInputOTPScope] = createContextScope(INPUT_OTP_NAME)

const [InputOTPProvider, useInputOTPContext] = createInputOTPContext<IInputOTP.IContext>(INPUT_OTP_NAME)

type InputOTPElement = React.ComponentRef<typeof Primitive.div>

// What each slot was given here, so an attribute the slot was given itself is left alone.
const written = new WeakMap<HTMLInputElement, Map<string, string>>()

function setUnlessOwn(slot: HTMLInputElement, name: string, value: string) {
  const ours = written.get(slot) ?? new Map<string, string>()
  written.set(slot, ours)
  const own = slot.getAttribute(name)
  if (own !== null && own !== ours.get(name)) return
  slot.setAttribute(name, value)
  ours.set(name, value)
}

const InputOTP = React.forwardRef<InputOTPElement, IInputOTP.IProps>(
  (props: IInputOTP.IScoped<IInputOTP.IProps>, forwardedRef) => {
    const {
      __scopeInputOTP,
      value: valueProp,
      defaultValue,
      onValueChange,
      onComplete,
      autoSubmit = false,
      pattern = REGEXP_ONLY_DIGITS_AND_CHARS,
      dir,
      maxLength,
      disabled,
      readOnly,
      type = 'text',
      name,
      ...inputOTPProps
    } = props
    const direction = useDirection(dir)
    const wrapperRef = React.useRef<HTMLDivElement>(null)
    const composedRef = useComposedRefs(forwardedRef, wrapperRef)
    const submitRef = React.useRef(false)
    const pressedRef = React.useRef<EventTarget | null>(null)
    const [, rerender] = React.useReducer((count: number) => count + 1, 0)
    const [value, setValue] = useControllableState({
      prop: valueProp,
      defaultProp: defaultValue ?? '',
      onChange: onValueChange,
      caller: INPUT_OTP_NAME,
    })

    const getSlots = () => {
      const slots = Array.from(
        wrapperRef.current?.querySelectorAll<HTMLInputElement>('input[data-input-otp-slot]') ?? [],
      )
      return maxLength === undefined ? slots : slots.slice(0, Math.max(0, maxLength))
    }

    const locate = (target: EventTarget) => {
      const slots = getSlots()
      const targets: readonly EventTarget[] = slots
      return { slots, index: targets.indexOf(target) }
    }

    // No dependencies: the slots can change with any render, not only with the value.
    useLayoutEffect(() => {
      const slots = getSlots()
      // One stop for Tab, where typing goes, as in Radix and Zag. The arrow keys move between the slots.
      const stop = Math.min(value.length, slots.length - 1)
      slots.forEach((slot, index) => {
        const char = value[index] ?? ''
        if (slot.value !== char) slot.value = char
        setUnlessOwn(slot, 'aria-label', `Digit ${index + 1}`)
        setUnlessOwn(slot, 'tabindex', index === stop ? '0' : '-1')
      })
      // Here, not in commit, so the hidden input holds the whole code when the form reads it.
      const submit = submitRef.current
      submitRef.current = false
      if (submit && value.length === slots.length) slots[0]?.form?.requestSubmit()
    })

    const reset = useCallbackRef(() => {
      setValue(defaultValue ?? '')
      // The form has emptied the slots, so they are drawn again even when the code is unchanged.
      rerender()
    })

    React.useEffect(() => {
      const form = wrapperRef.current?.querySelector<HTMLInputElement>('input[data-input-otp-slot]')?.form
      if (!form) return
      // A reset listener runs before the form resets its fields, and may be cancelled by one after it.
      const handleReset = (event: Event) =>
        setTimeout(() => {
          if (!event.defaultPrevented) reset()
        })
      form.addEventListener('reset', handleReset)
      return () => form.removeEventListener('reset', handleReset)
    }, [reset])

    const commit = (slots: HTMLInputElement[], next: string) => {
      if (next === value) return
      setValue(next)
      if (next.length !== slots.length) return
      onComplete?.(next)
      submitRef.current = autoSubmit
    }

    const fill = (slots: HTMLInputElement[], index: number, text: string) => {
      const chars = Array.from(text)
        .filter((char) => pattern.test(char))
        .join('')
      if (!chars) return
      const at = Math.min(index, value.length)
      commit(slots, (value.slice(0, at) + chars + value.slice(at + chars.length)).slice(0, slots.length))
      slots[Math.min(at + chars.length, slots.length - 1)]?.focus()
    }

    const remove = (slots: HTMLInputElement[], index: number) => {
      commit(slots, value.slice(0, index) + value.slice(index + 1))
      slots[index]?.focus()
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      const { slots, index } = locate(event.target)
      if (index < 0 || event.metaKey || event.ctrlKey || event.altKey) return
      const { key } = event
      if (key === 'Enter') {
        const form = slots[0]?.form
        if (!form) return
        // The browser submits a form holding more than one field on Enter only by pressing its submit button.
        // form.elements leaves out an image button, which submits all the same.
        const hasSubmitButton =
          Array.from(form.elements).some((element) => 'type' in element && element.type === 'submit') ||
          !!form.querySelector('input[type=image]')
        if (!hasSubmitButton) form.requestSubmit()
      }
      const step = key === 'ArrowRight' ? 1 : key === 'ArrowLeft' ? -1 : 0
      if (step) {
        event.preventDefault()
        slots[index + (direction === 'rtl' ? -step : step)]?.focus()
        return
      }
      if (key !== 'Backspace' && key !== 'Delete' && key.length !== 1) return
      event.preventDefault()
      if (readOnly) return
      if (key === 'Backspace') remove(slots, Math.min(index, value.length - 1))
      else if (key === 'Delete') remove(slots, index)
      else fill(slots, index, key)
    }

    // An on-screen keyboard or an autofilled code arrives here without a key the handler above can read. A slot has no
    // maxLength, which would cut an autofilled code to its first character, so a key typed beside the character a slot
    // holds arrives as both, and only the new one is kept.
    const handleInput = (event: React.FormEvent<HTMLDivElement>) => {
      const { slots, index } = locate(event.target)
      const slot = slots[index]
      if (!slot) return
      const held = value[index] ?? ''
      const text = slot.value
      slot.value = held
      const typed = held && text.length === 2 && text.includes(held) ? text.replace(held, '') : text
      if (typed) fill(slots, index, typed)
      else remove(slots, index)
    }

    const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
      const { slots, index } = locate(event.target)
      if (index < 0) return
      event.preventDefault()
      if (!readOnly) fill(slots, index, event.clipboardData.getData('text'))
    }

    return (
      <InputOTPProvider
        scope={__scopeInputOTP}
        value={value}
        name={name}
        disabled={disabled}
        readOnly={readOnly}
        type={type}
        numeric={pattern === REGEXP_ONLY_DIGITS}>
        <Primitive.div
          role="group"
          dir={direction}
          data-slot="input-otp"
          data-disabled={disabled ? '' : undefined}
          {...inputOTPProps}
          ref={composedRef}
          onKeyDown={composeEventHandlers(props.onKeyDown, handleKeyDown)}
          onInput={composeEventHandlers(props.onInput, handleInput)}
          onPaste={composeEventHandlers(props.onPaste, handlePaste)}
          onPointerDown={composeEventHandlers(props.onPointerDown, (event) => {
            pressedRef.current = event.target
          })}
          onPointerCancel={composeEventHandlers(props.onPointerCancel, () => {
            pressedRef.current = null
          })}
          onFocus={composeEventHandlers(props.onFocus, (event) => {
            const { slots, index } = locate(event.target)
            const pressed = pressedRef.current === event.target
            pressedRef.current = null
            // Only a press is sent back to where typing goes, so an arrow key still reaches every slot.
            if (pressed && index > value.length) slots[value.length]?.focus()
            else slots[index]?.select()
          })}
        />
      </InputOTPProvider>
    )
  },
)

InputOTP.displayName = INPUT_OTP_NAME

export { createInputOTPScope, INPUT_OTP_NAME, InputOTP, InputOTPProvider, useInputOTPContext }
