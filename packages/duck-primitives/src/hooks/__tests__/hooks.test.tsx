import { describe, expect, it, mock } from 'bun:test'
import { act, fireEvent, render } from '@testing-library/react'
import * as React from 'react'
import { useCallbackRef } from '../use-callback-ref'
import { useControllableState } from '../use-controllable-state'
import { useEscapeKeydown } from '../use-escape-keydown'
import { useId } from '../use-id'
import { usePrevious } from '../use-previous'
import { useStateMachine } from '../use-state-machine'

// --- useCallbackRef ---

describe('useCallbackRef', () => {
  it('returns a stable function reference across renders', () => {
    const refs: Array<(...args: unknown[]) => unknown> = []
    function Comp({ cb }: { cb: () => void }) {
      const stable = useCallbackRef(cb)
      refs.push(stable)
      return null
    }
    const { rerender } = render(<Comp cb={() => 'a'} />)
    rerender(<Comp cb={() => 'b'} />)
    expect(refs[0]).toBe(refs[1])
  })

  it('calls the latest callback', () => {
    let result = ''
    function Comp({ cb }: { cb: () => string }) {
      const stable = useCallbackRef(cb)
      return (
        <button
          onClick={() => {
            result = stable()
          }}
        />
      )
    }
    const { rerender, container } = render(<Comp cb={() => 'first'} />)
    rerender(<Comp cb={() => 'second'} />)
    fireEvent.click(container.querySelector('button')!)
    expect(result).toBe('second')
  })

  it('handles undefined callback without throwing', () => {
    function Comp() {
      const stable = useCallbackRef(undefined)
      return <button onClick={() => stable()} />
    }
    const { container } = render(<Comp />)
    expect(() => fireEvent.click(container.querySelector('button')!)).not.toThrow()
  })
})

// --- usePrevious ---

describe('usePrevious', () => {
  it('returns the previous value after an update', () => {
    const values: Array<number | undefined> = []
    function Comp({ value }: { value: number }) {
      const prev = usePrevious(value)
      values.push(prev)
      return null
    }
    const { rerender } = render(<Comp value={1} />)
    rerender(<Comp value={2} />)
    rerender(<Comp value={3} />)
    expect(values).toEqual([1, 1, 2])
  })
})

// --- useStateMachine ---

describe('useStateMachine', () => {
  const machine = {
    idle: { START: 'running' },
    running: { STOP: 'idle', PAUSE: 'paused' },
    paused: { RESUME: 'running', STOP: 'idle' },
  } as const

  it('starts in the initial state', () => {
    let state: string = ''
    function Comp() {
      const [s] = useStateMachine('idle', machine)
      state = s as string
      return null
    }
    render(<Comp />)
    expect(state).toBe('idle')
  })

  it('transitions on valid events', () => {
    let state: string = ''
    let send: (event: string) => void = () => {}
    function Comp() {
      const [s, d] = useStateMachine('idle', machine)
      state = s as string
      send = d as (event: string) => void
      return null
    }
    render(<Comp />)
    act(() => send('START'))
    expect(state).toBe('running')
    act(() => send('PAUSE'))
    expect(state).toBe('paused')
    act(() => send('RESUME'))
    expect(state).toBe('running')
  })

  it('ignores invalid events', () => {
    let state: string = ''
    let send: (event: string) => void = () => {}
    function Comp() {
      const [s, d] = useStateMachine('idle', machine)
      state = s as string
      send = d as (event: string) => void
      return null
    }
    render(<Comp />)
    act(() => send('PAUSE'))
    expect(state).toBe('idle')
  })
})

// --- useEscapeKeydown ---

describe('useEscapeKeydown', () => {
  it('calls handler on Escape keydown', () => {
    const handler = mock(() => {})
    function Comp() {
      useEscapeKeydown(handler)
      return <div />
    }
    render(<Comp />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('does not call handler on other keys', () => {
    const handler = mock(() => {})
    function Comp() {
      useEscapeKeydown(handler)
      return <div />
    }
    render(<Comp />)
    fireEvent.keyDown(document, { key: 'Enter' })
    expect(handler).toHaveBeenCalledTimes(0)
  })

  it('cleans up listener on unmount', () => {
    const handler = mock(() => {})
    function Comp() {
      useEscapeKeydown(handler)
      return <div />
    }
    const { unmount } = render(<Comp />)
    unmount()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(handler).toHaveBeenCalledTimes(0)
  })
})

// --- useId ---

describe('useId', () => {
  it('returns a deterministic ID when provided', () => {
    let id = ''
    function Comp() {
      id = useId('my-id')
      return null
    }
    render(<Comp />)
    expect(id).toBe('my-id')
  })

  it('generates a prefixed ID when no deterministic ID is given', () => {
    let id = ''
    function Comp() {
      id = useId()
      return null
    }
    render(<Comp />)
    expect(id).toMatch(/^gentleduck-/)
  })

  it('returns stable IDs across renders', () => {
    const ids: string[] = []
    function Comp({ n }: { n: number }) {
      ids.push(useId())
      return <span>{n}</span>
    }
    const { rerender } = render(<Comp n={1} />)
    rerender(<Comp n={2} />)
    expect(ids[0]).toBe(ids[1])
  })
})

// --- useControllableState ---

describe('useControllableState', () => {
  it('uses defaultProp when uncontrolled', () => {
    let value = ''
    function Comp() {
      const [v] = useControllableState({ defaultProp: 'hello' })
      value = v
      return null
    }
    render(<Comp />)
    expect(value).toBe('hello')
  })

  it('uses prop when controlled', () => {
    let value = ''
    function Comp() {
      const [v] = useControllableState({ prop: 'controlled', defaultProp: 'default' })
      value = v
      return null
    }
    render(<Comp />)
    expect(value).toBe('controlled')
  })

  it('calls onChange when uncontrolled value changes', () => {
    const onChange = mock(() => {})
    let setValue: React.Dispatch<React.SetStateAction<string>> = () => {}
    function Comp() {
      const [, set] = useControllableState({ defaultProp: 'a', onChange })
      setValue = set
      return null
    }
    render(<Comp />)
    act(() => setValue('b'))
    expect(onChange).toHaveBeenCalledWith('b')
  })

  it('calls onChange when controlled value differs from prop', () => {
    const onChange = mock(() => {})
    let setValue: React.Dispatch<React.SetStateAction<string>> = () => {}
    function Comp() {
      const [, set] = useControllableState({ prop: 'a', defaultProp: 'a', onChange })
      setValue = set
      return null
    }
    render(<Comp />)
    act(() => setValue('b'))
    expect(onChange).toHaveBeenCalledWith('b')
  })

  it('accepts a function updater', () => {
    const onChange = mock(() => {})
    let setValue: React.Dispatch<React.SetStateAction<number>> = () => {}
    function Comp() {
      const [, set] = useControllableState({ defaultProp: 5, onChange })
      setValue = set
      return null
    }
    render(<Comp />)
    act(() => setValue((prev) => prev + 1))
    expect(onChange).toHaveBeenCalledWith(6)
  })

  it('does not call onChange when setting the same controlled value', () => {
    const onChange = mock(() => {})
    let setValue: React.Dispatch<React.SetStateAction<string>> = () => {}
    function Comp() {
      const [, set] = useControllableState({ prop: 'same', defaultProp: 'same', onChange })
      setValue = set
      return null
    }
    render(<Comp />)
    act(() => setValue('same'))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('works with boolean values', () => {
    let value = false
    function Comp() {
      const [v] = useControllableState({ defaultProp: true })
      value = v
      return null
    }
    render(<Comp />)
    expect(value).toBe(true)
  })

  it('works with numeric values', () => {
    let value = 0
    let setValue: React.Dispatch<React.SetStateAction<number>> = () => {}
    function Comp() {
      const [v, set] = useControllableState({ defaultProp: 42 })
      value = v
      setValue = set
      return null
    }
    render(<Comp />)
    expect(value).toBe(42)
    act(() => setValue(100))
    expect(value).toBe(100)
  })
})

// --- useStateMachine (additional) ---

describe('useStateMachine (edge cases)', () => {
  const machine = {
    idle: { START: 'running' },
    running: { STOP: 'idle' },
  } as const

  it('handles rapid state transitions', () => {
    let state: string = ''
    let send: (event: string) => void = () => {}
    function Comp() {
      const [s, d] = useStateMachine('idle', machine)
      state = s as string
      send = d as (event: string) => void
      return null
    }
    render(<Comp />)
    act(() => send('START'))
    act(() => send('STOP'))
    act(() => send('START'))
    expect(state).toBe('running')
  })
})
