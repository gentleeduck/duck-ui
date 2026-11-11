import * as React from 'react'
import { Primitive } from '../primitive-elements'
import { useCommandState } from './command'
import type { ICommand } from './command.types'

type CommandStatusElement = React.ComponentRef<typeof Primitive.div>

export const CommandStatus = React.forwardRef<CommandStatusElement, ICommand.IStatusProps>(
  (props: ICommand.IScoped<ICommand.IStatusProps>, forwardedRef) => {
    const { __scopeCommand, children, ...statusProps } = props
    const count = useCommandState((state) => state.count, __scopeCommand)

    return (
      <Primitive.div
        data-slot="command-status"
        role="status"
        aria-live="polite"
        aria-atomic
        {...statusProps}
        ref={forwardedRef}>
        {typeof children === 'function' ? children(count) : children}
      </Primitive.div>
    )
  },
)

CommandStatus.displayName = 'CommandStatus'
