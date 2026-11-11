import * as React from 'react'
import { useLayoutEffect } from '../hooks/use-layout-effect'
import { useComposedRefs } from '../libs/compose-ref'
import { Primitive } from '../primitive-elements'
import { useCommandContext, useCommandListContext } from './command'
import type { ICommand } from './command.types'

const EMPTY_NAME = 'CommandEmpty'

type CommandEmptyElement = React.ComponentRef<typeof Primitive.div>

export const CommandEmpty = React.forwardRef<CommandEmptyElement, ICommand.IEmptyProps>(
  (props: ICommand.IScoped<ICommand.IEmptyProps>, forwardedRef) => {
    const { __scopeCommand, ...emptyProps } = props
    const { onItemsChange } = useCommandContext(EMPTY_NAME, __scopeCommand)
    const listContext = useCommandListContext(EMPTY_NAME, __scopeCommand)
    const composedRef = useComposedRefs(forwardedRef, listContext.emptyRef)

    // It mounts hidden, and only the list knows whether anything matches.
    useLayoutEffect(() => onItemsChange(), [onItemsChange])

    return (
      <Primitive.div
        data-slot="command-empty"
        role="status"
        aria-live="polite"
        hidden
        {...emptyProps}
        ref={composedRef}
      />
    )
  },
)

CommandEmpty.displayName = EMPTY_NAME
