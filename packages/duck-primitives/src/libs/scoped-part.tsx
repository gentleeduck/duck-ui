import * as React from 'react'
import type { Scope } from './create-context'

// A part of a component built on another that only hands its own scope on, as the other's scope, to the part it renders.
function createScopedPart<TScopeProp extends string>(
  scopeProp: TScopeProp,
  useInnerScope: (scope: Scope) => { [scopeProp: string]: Scope },
) {
  return <TElement, TProps>(Part: React.ComponentType<TProps & React.RefAttributes<TElement>>, displayName: string) => {
    const ScopedPart = React.forwardRef<TElement, TProps>((props, ref) => {
      const { [scopeProp]: scope, ...partProps } = props as typeof props & { [K in TScopeProp]?: Scope }
      return <Part {...useInnerScope(scope)} {...(partProps as TProps)} ref={ref} />
    })
    ScopedPart.displayName = displayName
    return ScopedPart
  }
}

export { createScopedPart }
