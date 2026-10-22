import * as React from 'react'
import type { IFocusScope } from './focus-scope.types'

const FocusScopeBranchContext = React.createContext<IFocusScope.IBranchRegistry | null>(null)

/** Hosts the branches of a trapped scope. Without a registry it passes its children through to the next host up. */
function FocusScopeBranchProvider(props: {
  registry: IFocusScope.IBranchRegistry | null | undefined
  children?: React.ReactNode
}) {
  const { registry, children } = props
  return registry ? (
    <FocusScopeBranchContext.Provider value={registry}>{children}</FocusScopeBranchContext.Provider>
  ) : (
    children
  )
}

const NO_BRANCHES: readonly HTMLElement[] = []

function useFocusScopeBranchRegistry() {
  const [nodes, setNodes] = React.useState(NO_BRANCHES)
  const registry = React.useMemo<IFocusScope.IBranchRegistry>(
    () => ({
      add: (node) => setNodes((prev) => (prev.includes(node) ? prev : [...prev, node])),
      remove: (node) => setNodes((prev) => (prev.includes(node) ? prev.filter((other) => other !== node) : prev)),
    }),
    [],
  )
  return { nodes, registry } as const
}

/** Registers `node` with the nearest host, so its trapped scope lets focus into it. */
function useFocusScopeBranch(node: HTMLElement | null) {
  const registry = React.useContext(FocusScopeBranchContext)
  React.useEffect(() => {
    if (!node || !registry) return
    registry.add(node)
    return () => registry.remove(node)
  }, [node, registry])
}

export { FocusScopeBranchProvider, useFocusScopeBranch, useFocusScopeBranchRegistry }
