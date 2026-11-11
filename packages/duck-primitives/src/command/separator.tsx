import * as React from 'react'
import { Primitive } from '../primitive-elements'
import type { ICommand } from './command.types'

const SEPARATOR_NAME = 'CommandSeparator'

type CommandSeparatorElement = React.ComponentRef<typeof Primitive.div>

export const CommandSeparator = React.forwardRef<CommandSeparatorElement, ICommand.ISeparatorProps>(
  (props: ICommand.IScoped<ICommand.ISeparatorProps>, forwardedRef) => {
    const { __scopeCommand, ...separatorProps } = props

    return (
      <Primitive.div
        data-slot="command-separator"
        role="separator"
        aria-hidden
        {...separatorProps}
        ref={forwardedRef}
      />
    )
  },
)

CommandSeparator.displayName = SEPARATOR_NAME
