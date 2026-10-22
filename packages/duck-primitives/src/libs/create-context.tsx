import * as React from 'react'

function createContext<ContextValueType extends object | null>(
  rootComponentName: string,
  defaultContext?: ContextValueType,
) {
  const Context = React.createContext<ContextValueType | undefined>(defaultContext)

  const Provider: React.FC<ContextValueType & { children: React.ReactNode }> = (props) => {
    const { children, ...context } = props
    // biome-ignore lint/correctness/useExhaustiveDependencies: context object values are used as individual deps to avoid unnecessary re-renders
    const value = React.useMemo(() => context, Object.values(context)) as ContextValueType
    return <Context.Provider value={value}>{children}</Context.Provider>
  }

  Provider.displayName = `${rootComponentName}Provider`

  function useContext(consumerName: string) {
    const context = React.useContext(Context)
    if (context) return context
    if (defaultContext !== undefined) return defaultContext
    throw new Error(`\`${consumerName}\` must be used within \`${rootComponentName}\``)
  }

  return [Provider, useContext] as const
}

// biome-ignore lint/suspicious/noExplicitAny: Scope requires `any` default for Context covariance across component boundaries
type Scope<C = any> = { [scopeName: string]: React.Context<C>[] } | undefined
type ScopeHook = (scope: Scope) => { [__scopeProp: string]: Scope }
interface ICreateScope {
  scopeName: string
  (): ScopeHook
}

function createContextScope(scopeName: string, createContextScopeDeps: ICreateScope[] = []) {
  let defaultContexts: unknown[] = []

  function createContext<ContextValueType extends object | null>(
    rootComponentName: string,
    defaultContext?: ContextValueType,
  ) {
    const BaseContext = React.createContext<ContextValueType | undefined>(defaultContext)
    const index = defaultContexts.length
    defaultContexts = [...defaultContexts, defaultContext]

    const Provider: React.FC<ContextValueType & { scope: Scope<ContextValueType>; children: React.ReactNode }> = (
      props,
    ) => {
      const { scope, children, ...context } = props
      const Context = scope?.[scopeName]?.[index] || BaseContext
      // biome-ignore lint/correctness/useExhaustiveDependencies: context object values are used as individual deps to avoid unnecessary re-renders
      const value = React.useMemo(() => context, Object.values(context)) as ContextValueType
      return <Context.Provider value={value}>{children}</Context.Provider>
    }

    Provider.displayName = `${rootComponentName}Provider`

    function useContext(consumerName: string, scope: Scope<ContextValueType | undefined>) {
      const Context = scope?.[scopeName]?.[index] || BaseContext
      const context = React.useContext(Context)
      if (context) return context
      if (defaultContext !== undefined) return defaultContext
      throw new Error(`\`${consumerName}\` must be used within \`${rootComponentName}\``)
    }

    return [Provider, useContext] as const
  }

  const createScope: ICreateScope = () => {
    const scopeContexts = defaultContexts.map((defaultContext) => {
      return React.createContext(defaultContext)
    })
    return function useScope(scope: Scope) {
      const contexts = scope?.[scopeName] || scopeContexts
      return React.useMemo(() => ({ [`__scope${scopeName}`]: { ...scope, [scopeName]: contexts } }), [scope, contexts])
    }
  }

  createScope.scopeName = scopeName
  return [createContext, composeContextScopes(createScope, ...createContextScopeDeps)] as const
}

function composeContextScopes(...scopes: [ICreateScope, ...ICreateScope[]]): ICreateScope {
  const baseScope = scopes[0]
  if (scopes.length === 1) return baseScope

  const createScope: ICreateScope = () => {
    const scopeHooks = scopes.map((createScope) => ({
      useScope: createScope(),
      scopeName: createScope.scopeName,
    }))

    return function useComposedScopes(overrideScopes) {
      // biome-ignore lint/suspicious/noExplicitAny: scope values are heterogeneous Context arrays requiring `any`
      const nextScopes: Record<string, any> = {}
      for (const { useScope, scopeName } of scopeHooks) {
        // biome-ignore lint/correctness/useHookAtTopLevel: scopeHooks is static  -  the number of hooks called is always the same across renders
        const scopeProps = useScope(overrideScopes)
        const currentScope = scopeProps[`__scope${scopeName}`]
        Object.assign(nextScopes, currentScope)
      }

      return { [`__scope${baseScope.scopeName}`]: nextScopes }
    }
  }

  createScope.scopeName = baseScope.scopeName
  return createScope
}

export type { ICreateScope, Scope }
export { createContext, createContextScope }
