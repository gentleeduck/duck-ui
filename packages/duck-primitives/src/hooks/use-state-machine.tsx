import * as React from 'react'

type Machine<S> = { [k: string]: { [k: string]: S } }
type MachineState<T> = keyof T
type MachineEvent<T> = keyof UnionToIntersection<T[keyof T]>
// biome-ignore lint/suspicious/noExplicitAny: `any` is required here for distributive conditional type and contravariant inference to work correctly
type UnionToIntersection<T> = (T extends any ? (x: T) => any : never) extends (x: infer R) => any ? R : never

/** [state, send] over a transition table. An event with no transition from the current state is dropped. */
export function useStateMachine<M>(initialState: MachineState<M>, machine: M & Machine<MachineState<M>>) {
  const [state, setState] = React.useState(initialState)
  const machineRef = React.useRef(machine)
  // The state the sends so far lead to, so a send is read against the one before it rather than the last render.
  // Dropping an unmatched event here, not in a reducer, keeps it from scheduling a render a reducer cannot skip.
  const latestRef = React.useRef(initialState)
  const send = React.useCallback((event: MachineEvent<M>) => {
    const nextState = (machineRef.current[latestRef.current] as Record<string, MachineState<M>>)[event as string]
    if (nextState === undefined) return
    latestRef.current = nextState
    setState(nextState)
  }, [])
  return [state, send] as const
}
