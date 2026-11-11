import * as React from 'react'
import { useId } from '../hooks/use-id'
import { useLayoutEffect } from '../hooks/use-layout-effect'
import { useComposedRefs } from '../libs/compose-ref'
import { Primitive } from '../primitive-elements'
import { CommandGroupContextProvider, useCommandContext } from './command'
import type { ICommand } from './command.types'

const GROUP_NAME = 'CommandGroup'

type CommandGroupElement = React.ComponentRef<typeof Primitive.div>

export const CommandGroup = React.forwardRef<CommandGroupElement, ICommand.IGroupProps>(
  (props: ICommand.IScoped<ICommand.IGroupProps>, forwardedRef) => {
    const { __scopeCommand, heading, forceMount = false, children, ...groupProps } = props
    const { forcedGroups, onItemsChange } = useCommandContext(GROUP_NAME, __scopeCommand)
    const headingId = useId()
    const groupRef = React.useRef<HTMLDivElement | null>(null)
    const composedRef = useComposedRefs(forwardedRef, groupRef)

    useLayoutEffect(() => {
      const group = groupRef.current
      if (!forceMount || !group) return
      forcedGroups.add(group)
      onItemsChange()
      return () => {
        forcedGroups.delete(group)
        onItemsChange()
      }
    }, [forceMount, forcedGroups, onItemsChange])

    return (
      <CommandGroupContextProvider scope={__scopeCommand} id={headingId}>
        <Primitive.div
          data-slot="command-group"
          role="group"
          aria-labelledby={heading ? headingId : undefined}
          {...groupProps}
          ref={composedRef}>
          {heading && (
            <Primitive.div data-slot="command-group-heading" id={headingId}>
              {heading}
            </Primitive.div>
          )}
          {children}
        </Primitive.div>
      </CommandGroupContextProvider>
    )
  },
)

CommandGroup.displayName = GROUP_NAME
