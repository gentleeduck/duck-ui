import { act, fireEvent, render } from '@testing-library/react'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
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

  it("has the latest callback in place before a child's effect calls it in the same commit", () => {
    const seen: number[][] = []
    function Child({ call, n }: { call: () => number; n: number }) {
      React.useEffect(() => {
        seen.push([n, call()])
      }, [call, n])
      return null
    }
    function Parent({ n }: { n: number }) {
      return <Child call={useCallbackRef(() => n)} n={n} />
    }
    const { rerender } = render(<Parent n={1} />)
    rerender(<Parent n={2} />)
    expect(seen).toEqual([
      [1, 1],
      [2, 2],
    ])
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

  it('keeps the previous value through a render with the same value', () => {
    const values: Array<number | undefined> = []
    function Comp({ value }: { value: number; tick: number }) {
      values.push(usePrevious(value))
      return null
    }
    const { rerender } = render(<Comp tick={0} value={1} />)
    rerender(<Comp tick={0} value={2} />)
    rerender(<Comp tick={1} value={2} />)
    rerender(<Comp tick={2} value={2} />)
    expect(values).toEqual([1, 1, 1, 1])
  })

  it('leaves out a value from a render React threw away, as when a transition suspends and another replaces it', async () => {
    const never = new Promise(() => {})
    function Suspends({ when }: { when: boolean }) {
      if (when) throw never
      return null
    }
    let set: (value: string) => void = () => {}
    const committed: string[] = []
    function Comp() {
      const [value, setValue] = React.useState('A')
      set = setValue
      const previous = usePrevious(value)
      React.useEffect(() => {
        committed.push(`${previous} to ${value}`)
      })
      return <Suspends when={value === 'B'} />
    }
    render(
      <React.Suspense fallback="loading">
        <Comp />
      </React.Suspense>,
    )

    await act(async () => React.startTransition(() => set('B')))
    await act(async () => React.startTransition(() => set('C')))

    expect(committed).toEqual(['A to A', 'A to C'])
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

  it('renders nothing for an event its state does not take', () => {
    let renders = 0
    let send: (event: string) => void = () => {}
    function Comp() {
      renders++
      send = useStateMachine('idle', machine)[1] as (event: string) => void
      return null
    }
    render(<Comp />)
    act(() => send('PAUSE'))
    expect(renders).toBe(1)
  })

  it('keeps send the same function through every transition', () => {
    const sends: unknown[] = []
    function Comp() {
      sends.push(useStateMachine('idle', machine)[1])
      return null
    }
    render(<Comp />)
    const send = sends[0] as (event: string) => void
    act(() => send('START'))
    act(() => send('PAUSE'))
    expect([sends.length, new Set(sends).size]).toEqual([3, 1])
  })
})

// --- useEscapeKeydown ---

describe('useEscapeKeydown', () => {
  it('calls handler on Escape keydown', () => {
    const handler = vi.fn(() => {})
    function Comp() {
      useEscapeKeydown(handler)
      return <div />
    }
    render(<Comp />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('does not call handler on other keys', () => {
    const handler = vi.fn(() => {})
    function Comp() {
      useEscapeKeydown(handler)
      return <div />
    }
    render(<Comp />)
    fireEvent.keyDown(document, { key: 'Enter' })
    expect(handler).toHaveBeenCalledTimes(0)
  })

  it('cleans up listener on unmount', () => {
    const handler = vi.fn(() => {})
    function Comp() {
      useEscapeKeydown(handler)
      return <div />
    }
    const { unmount } = render(<Comp />)
    unmount()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(handler).toHaveBeenCalledTimes(0)
  })

  it('listens on the document it is given, as one inside an iframe', () => {
    const frame = document.createElement('iframe')
    document.body.append(frame)
    const other = frame.contentDocument as Document
    const heard: string[] = []
    function Comp() {
      useEscapeKeydown((event) => heard.push(event.target === other ? 'iframe' : 'page'), other)
      return null
    }
    render(<Comp />)

    fireEvent.keyDown(document, { key: 'Escape' })
    fireEvent.keyDown(other, { key: 'Escape' })
    frame.remove()

    expect(heard).toEqual(['iframe'])
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

  it('takes an empty id as none given, as a blank id prop passes it', () => {
    let id = ''
    function Comp() {
      id = useId('')
      return null
    }
    render(<Comp />)
    expect(id).toMatch(/^gentleduck-/)
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
    const onChange = vi.fn(() => {})
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
    const onChange = vi.fn(() => {})
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
    const onChange = vi.fn(() => {})
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
    const onChange = vi.fn(() => {})
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

  it('hands a controlled updater the controlled value, not the default', () => {
    const onChange = vi.fn(() => {})
    let setValue: React.Dispatch<React.SetStateAction<string>> = () => {}
    function Comp() {
      setValue = useControllableState({ prop: 'b', defaultProp: 'a', onChange })[1]
      return null
    }
    render(<Comp />)
    act(() => setValue((value) => `${value}!`))
    expect(onChange.mock.calls).toEqual([['b!']])
  })

  it('reports an uncontrolled change back to the value it started at', () => {
    const onChange = vi.fn(() => {})
    let setValue: React.Dispatch<React.SetStateAction<string>> = () => {}
    function Comp() {
      setValue = useControllableState({ defaultProp: 'a', onChange })[1]
      return null
    }
    render(<Comp />)
    act(() => setValue('b'))
    act(() => setValue('a'))
    expect(onChange.mock.calls).toEqual([['b'], ['a']])
  })

  it('reports an uncontrolled change to the onChange it was given last', () => {
    const first = vi.fn(() => {})
    const last = vi.fn(() => {})
    let setValue: React.Dispatch<React.SetStateAction<string>> = () => {}
    function Comp({ onChange }: { onChange: (value: string) => void }) {
      setValue = useControllableState({ defaultProp: 'a', onChange })[1]
      return null
    }
    const { rerender } = render(<Comp onChange={first} />)
    rerender(<Comp onChange={last} />)
    act(() => setValue('b'))
    expect([first.mock.calls, last.mock.calls]).toEqual([[], [['b']]])
  })

  it('warns each time it switches between controlled and uncontrolled, the switch back included', () => {
    function Probe({ value }: { value?: string }) {
      useControllableState({ prop: value, defaultProp: 'default', caller: 'Probe' })
      return null
    }
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { rerender } = render(<Probe />)
    rerender(<Probe value="controlled" />)
    rerender(<Probe />)
    const starts = warn.mock.calls.map(([message]) => String(message).split('.')[0])
    warn.mockRestore()

    expect(starts).toEqual([
      'Probe is changing from uncontrolled to controlled',
      'Probe is changing from controlled to uncontrolled',
    ])
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

describe('useControllableState in production', () => {
  it('switches from uncontrolled to controlled without the development warning', () => {
    function Probe({ value }: { value?: string }) {
      const [current] = useControllableState({ prop: value, defaultProp: 'default', caller: 'Probe' })
      return <span>{current}</span>
    }
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const nodeEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'

    try {
      const { container, rerender } = render(<Probe />)
      rerender(<Probe value="controlled" />)

      expect([container.textContent, warn.mock.calls.length]).toEqual(['controlled', 0])
    } finally {
      process.env.NODE_ENV = nodeEnv
      warn.mockRestore()
    }
  })
})

describe('useLayoutEffect on the server', () => {
  it("is a no-op rather than React's, which React 18 warns about there", async () => {
    const serverCopy = '../use-layout-effect.tsx?server'
    const page = globalThis.document
    Reflect.deleteProperty(globalThis, 'document')
    const server: typeof import('../use-layout-effect') = await import(serverCopy).finally(() => {
      globalThis.document = page
    })
    const effect = vi.fn()
    function Probe() {
      server.useLayoutEffect(effect)
      return <span>server</span>
    }

    expect([
      renderToString(<Probe />),
      server.useLayoutEffect === React.useLayoutEffect,
      effect.mock.calls.length,
    ]).toEqual(['<span>server</span>', false, 0])
  })
})
