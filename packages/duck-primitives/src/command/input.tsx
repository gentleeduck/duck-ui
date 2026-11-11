import * as React from 'react'
import { useLayoutEffect } from '../hooks/use-layout-effect'
import { composeEventHandlers } from '../libs/compose-event-handler'
import { useComposedRefs } from '../libs/compose-ref'
import { Primitive } from '../primitive-elements'
import { useCommandContext } from './command'
import type { ICommand } from './command.types'

const INPUT_NAME = 'CommandInput'

type CommandInputElement = React.ComponentRef<typeof Primitive.input>

export const CommandInput = React.forwardRef<CommandInputElement, ICommand.IInputProps>(
  (props: ICommand.IScoped<ICommand.IInputProps>, forwardedRef) => {
    const { __scopeCommand, ...inputProps } = props
    const context = useCommandContext(INPUT_NAME, __scopeCommand)
    const composedRef = useComposedRefs(forwardedRef, context.inputRef)
    const { value } = inputProps
    const { onSearchChange, highlightedRef, inputRef } = context

    // A controlled value can change with no change event, as when the consumer clears it, and an uncontrolled input
    // mounts with whatever text its defaultValue gave it.
    React.useEffect(() => {
      onSearchChange(value === undefined ? (inputRef.current?.value ?? '') : String(value))
    }, [value, onSearchChange, inputRef])

    // The list highlights its first item in a layout effect, which runs before this one when the input comes after it.
    useLayoutEffect(() => {
      const id = highlightedRef.current?.id
      if (id) inputRef.current?.setAttribute('aria-activedescendant', id)
    }, [highlightedRef, inputRef])

    return (
      <Primitive.input
        data-slot="command-input"
        role="combobox"
        aria-expanded="true"
        aria-controls={context.listId}
        aria-autocomplete="list"
        {...inputProps}
        ref={composedRef}
        onChange={composeEventHandlers(inputProps.onChange, (e: React.ChangeEvent<HTMLInputElement>) => {
          context.onSearchChange(e.target.value)
        })}
      />
    )
  },
)

CommandInput.displayName = INPUT_NAME
