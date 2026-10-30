import * as React from 'react'
import { useControllableState } from '../hooks/use-controllable-state'
import { composeEventHandlers } from '../libs/compose-event-handler'
import { Primitive } from '../primitive-elements'
import type { IToggle } from './toggle.types'

const TOGGLE_NAME = 'Toggle'

type ToggleElement = React.ComponentRef<typeof Primitive.button>

const Toggle = React.forwardRef<ToggleElement, IToggle.IProps>((props, forwardedRef) => {
  const {
    pressed: pressedProp,
    defaultPressed = false,
    onPressedChange,
    disabled = false,
    children,
    ...toggleProps
  } = props

  const [pressed, setPressed] = useControllableState({
    prop: pressedProp,
    onChange: onPressedChange,
    defaultProp: defaultPressed,
    caller: TOGGLE_NAME,
  })

  return (
    <Primitive.button
      type="button"
      data-slot="toggle"
      aria-pressed={pressed}
      data-state={pressed ? 'on' : 'off'}
      data-disabled={disabled ? '' : undefined}
      disabled={disabled}
      {...toggleProps}
      ref={forwardedRef}
      onClick={composeEventHandlers(props.onClick, () => {
        if (!disabled) {
          setPressed(!pressed)
        }
      })}>
      {typeof children === 'function' ? children(pressed) : children}
    </Primitive.button>
  )
})

Toggle.displayName = TOGGLE_NAME

export { Toggle }
