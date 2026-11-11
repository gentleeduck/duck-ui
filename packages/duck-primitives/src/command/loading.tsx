import * as React from 'react'
import { Primitive } from '../primitive-elements'
import type { ICommand } from './command.types'

type CommandLoadingElement = React.ComponentRef<typeof Primitive.div>

export const CommandLoading = React.forwardRef<CommandLoadingElement, ICommand.ILoadingProps>(
  (props: ICommand.IScoped<ICommand.ILoadingProps>, forwardedRef) => {
    const { __scopeCommand, progress, ...loadingProps } = props
    // A progress bar's children are presentational, so its name comes from aria-label alone.
    return (
      <Primitive.div
        data-slot="command-loading"
        role="progressbar"
        aria-label="Loading"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        {...loadingProps}
        ref={forwardedRef}
      />
    )
  },
)

CommandLoading.displayName = 'CommandLoading'
