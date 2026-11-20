import { act, render, renderHook } from '@testing-library/react'
import React from 'react'
import { describe, expect, test } from 'vitest'
import { atom } from '../primitive/atom'
import { createStore } from '../primitive/store'
import { Provider, useStore } from '../react/provider'
import { useAtom } from '../react/useAtom'
import { useAtomValue } from '../react/useAtomValue'
import { useSetAtom } from '../react/useSetAtom'

describe('Provider', () => {
  test('renders children', () => {
    const { getByText } = render(
      <Provider>
        <span>hello</span>
      </Provider>,
    )
    expect(getByText('hello')).toBeTruthy()
  })

  test('renders nested children', () => {
    const { getByText } = render(
      <Provider>
        <div>
          <span>nested</span>
        </div>
      </Provider>,
    )
    expect(getByText('nested')).toBeTruthy()
  })

  test('accepts an external store', () => {
    const myStore = createStore()
    const countAtom = atom(99)

    function Reader() {
      const value = useAtomValue(countAtom)
      return <span data-testid="val">{value}</span>
    }

    const { getByTestId } = render(
      <Provider store={myStore}>
        <Reader />
      </Provider>,
    )

    expect(getByTestId('val').textContent).toBe('99')
  })
})

describe('useStore', () => {
  test('returns a store instance', () => {
    const { result } = renderHook(() => useStore())
    expect(result.current).toBeTruthy()
    expect(typeof result.current.get).toBe('function')
    expect(typeof result.current.set).toBe('function')
    expect(typeof result.current.subscribe).toBe('function')
  })

  test('returns the context store when inside a Provider', () => {
    const myStore = createStore()

    const { result } = renderHook(() => useStore(), {
      wrapper: ({ children }: { children: React.ReactNode }) => <Provider store={myStore}>{children}</Provider>,
    })

    expect(result.current).toBe(myStore)
  })

  test('returns the options.store when explicitly passed', () => {
    const explicit = createStore()
    const contextStore = createStore()

    const { result } = renderHook(() => useStore({ store: explicit }), {
      wrapper: ({ children }: { children: React.ReactNode }) => <Provider store={contextStore}>{children}</Provider>,
    })

    expect(result.current).toBe(explicit)
  })

  test('returns a default store when no Provider exists', () => {
    const { result: r1 } = renderHook(() => useStore())
    const { result: r2 } = renderHook(() => useStore())
    // Both should get the same default singleton
    expect(r1.current).toBe(r2.current)
  })
})

describe('useAtomValue', () => {
  test('reads primitive atom initial value', () => {
    const countAtom = atom(42)

    function Reader() {
      const value = useAtomValue(countAtom)
      return <span data-testid="val">{value}</span>
    }

    const store = createStore()
    const { getByTestId } = render(
      <Provider store={store}>
        <Reader />
      </Provider>,
    )

    expect(getByTestId('val').textContent).toBe('42')
  })

  test('reads string atom value', () => {
    const nameAtom = atom('hello')

    function Reader() {
      const value = useAtomValue(nameAtom)
      return <span data-testid="val">{value}</span>
    }

    const store = createStore()
    const { getByTestId } = render(
      <Provider store={store}>
        <Reader />
      </Provider>,
    )

    expect(getByTestId('val').textContent).toBe('hello')
  })

  test('reads derived atom value', () => {
    const baseAtom = atom(5)
    const doubleAtom = atom((get) => get(baseAtom) * 2)

    function Reader() {
      const value = useAtomValue(doubleAtom)
      return <span data-testid="val">{value}</span>
    }

    const store = createStore()
    const { getByTestId } = render(
      <Provider store={store}>
        <Reader />
      </Provider>,
    )

    expect(getByTestId('val').textContent).toBe('10')
  })

  test('updates when atom value changes externally', () => {
    const countAtom = atom(0)
    const store = createStore()

    function Reader() {
      const value = useAtomValue(countAtom)
      return <span data-testid="val">{value}</span>
    }

    const { getByTestId } = render(
      <Provider store={store}>
        <Reader />
      </Provider>,
    )

    expect(getByTestId('val').textContent).toBe('0')

    act(() => {
      store.set(countAtom, 10)
    })

    expect(getByTestId('val').textContent).toBe('10')
  })
})

describe('useSetAtom', () => {
  test('returns a setter function', () => {
    const countAtom = atom(0)
    const store = createStore()

    const { result } = renderHook(() => useSetAtom(countAtom), {
      wrapper: ({ children }: { children: React.ReactNode }) => <Provider store={store}>{children}</Provider>,
    })

    expect(typeof result.current).toBe('function')
  })

  test('setter updates atom value', () => {
    const countAtom = atom(0)
    const store = createStore()

    function Writer() {
      const setCount = useSetAtom(countAtom)
      return <button onClick={() => setCount(5)}>set</button>
    }

    function Reader() {
      const value = useAtomValue(countAtom)
      return <span data-testid="val">{value}</span>
    }

    const { getByText, getByTestId } = render(
      <Provider store={store}>
        <Writer />
        <Reader />
      </Provider>,
    )

    expect(getByTestId('val').textContent).toBe('0')

    act(() => {
      getByText('set').click()
    })

    expect(getByTestId('val').textContent).toBe('5')
  })

  test('setter supports updater function', () => {
    const countAtom = atom(10)
    const store = createStore()

    function Writer() {
      const setCount = useSetAtom(countAtom)
      return <button onClick={() => setCount((prev: number) => prev + 1)}>inc</button>
    }

    function Reader() {
      const value = useAtomValue(countAtom)
      return <span data-testid="val">{value}</span>
    }

    const { getByText, getByTestId } = render(
      <Provider store={store}>
        <Writer />
        <Reader />
      </Provider>,
    )

    expect(getByTestId('val').textContent).toBe('10')

    act(() => {
      getByText('inc').click()
    })

    expect(getByTestId('val').textContent).toBe('11')
  })
})

describe('useAtom', () => {
  test('returns [value, setter] tuple', () => {
    const countAtom = atom(0)
    const store = createStore()

    const { result } = renderHook(() => useAtom(countAtom), {
      wrapper: ({ children }: { children: React.ReactNode }) => <Provider store={store}>{children}</Provider>,
    })

    const [value, setter] = result.current
    expect(value).toBe(0)
    expect(typeof setter).toBe('function')
  })

  test('reads and writes through useAtom', () => {
    const countAtom = atom(0)
    const store = createStore()

    function Counter() {
      const [count, setCount] = useAtom(countAtom)
      return (
        <div>
          <span data-testid="val">{count}</span>
          <button onClick={() => setCount(count + 1)}>inc</button>
        </div>
      )
    }

    const { getByText, getByTestId } = render(
      <Provider store={store}>
        <Counter />
      </Provider>,
    )

    expect(getByTestId('val').textContent).toBe('0')

    act(() => {
      getByText('inc').click()
    })

    expect(getByTestId('val').textContent).toBe('1')

    act(() => {
      getByText('inc').click()
    })

    expect(getByTestId('val').textContent).toBe('2')
  })

  test('useAtom with updater function', () => {
    const countAtom = atom(0)
    const store = createStore()

    function Counter() {
      const [count, setCount] = useAtom(countAtom)
      return (
        <div>
          <span data-testid="val">{count}</span>
          <button onClick={() => setCount((prev: number) => prev + 5)}>add5</button>
        </div>
      )
    }

    const { getByText, getByTestId } = render(
      <Provider store={store}>
        <Counter />
      </Provider>,
    )

    expect(getByTestId('val').textContent).toBe('0')

    act(() => {
      getByText('add5').click()
    })

    expect(getByTestId('val').textContent).toBe('5')
  })
})

describe('multiple atoms in same Provider', () => {
  test('independent atoms work correctly together', () => {
    const nameAtom = atom('Alice')
    const ageAtom = atom(30)
    const store = createStore()

    function Display() {
      const name = useAtomValue(nameAtom)
      const age = useAtomValue(ageAtom)
      return (
        <div>
          <span data-testid="name">{name}</span>
          <span data-testid="age">{age}</span>
        </div>
      )
    }

    function Controls() {
      const setName = useSetAtom(nameAtom)
      const setAge = useSetAtom(ageAtom)
      return (
        <div>
          <button onClick={() => setName('Bob')}>rename</button>
          <button onClick={() => setAge(31)}>birthday</button>
        </div>
      )
    }

    const { getByTestId, getByText } = render(
      <Provider store={store}>
        <Display />
        <Controls />
      </Provider>,
    )

    expect(getByTestId('name').textContent).toBe('Alice')
    expect(getByTestId('age').textContent).toBe('30')

    act(() => {
      getByText('rename').click()
    })

    expect(getByTestId('name').textContent).toBe('Bob')
    expect(getByTestId('age').textContent).toBe('30')

    act(() => {
      getByText('birthday').click()
    })

    expect(getByTestId('name').textContent).toBe('Bob')
    expect(getByTestId('age').textContent).toBe('31')
  })
})

describe('derived atoms', () => {
  test('derived atom updates when base atom changes', () => {
    const baseAtom = atom(3)
    const derivedAtom = atom((get) => get(baseAtom) * 10)
    const store = createStore()

    function Reader() {
      const value = useAtomValue(derivedAtom)
      return <span data-testid="val">{value}</span>
    }

    function Writer() {
      const setBase = useSetAtom(baseAtom)
      return <button onClick={() => setBase(7)}>update</button>
    }

    const { getByTestId, getByText } = render(
      <Provider store={store}>
        <Reader />
        <Writer />
      </Provider>,
    )

    expect(getByTestId('val').textContent).toBe('30')

    act(() => {
      getByText('update').click()
    })

    expect(getByTestId('val').textContent).toBe('70')
  })

  test('chained derived atoms update correctly', () => {
    const baseAtom = atom(2)
    const doubleAtom = atom((get) => get(baseAtom) * 2)
    const quadAtom = atom((get) => get(doubleAtom) * 2)
    const store = createStore()

    function Reader() {
      const value = useAtomValue(quadAtom)
      return <span data-testid="val">{value}</span>
    }

    function Writer() {
      const setBase = useSetAtom(baseAtom)
      return <button onClick={() => setBase(5)}>update</button>
    }

    const { getByTestId, getByText } = render(
      <Provider store={store}>
        <Reader />
        <Writer />
      </Provider>,
    )

    expect(getByTestId('val').textContent).toBe('8')

    act(() => {
      getByText('update').click()
    })

    expect(getByTestId('val').textContent).toBe('20')
  })

  test('derived atom depending on multiple atoms updates when any dependency changes', () => {
    const firstAtom = atom(1)
    const secondAtom = atom(2)
    const sumAtom = atom((get) => get(firstAtom) + get(secondAtom))
    const store = createStore()

    function Reader() {
      const value = useAtomValue(sumAtom)
      return <span data-testid="val">{value}</span>
    }

    function Controls() {
      const setFirst = useSetAtom(firstAtom)
      const setSecond = useSetAtom(secondAtom)
      return (
        <div>
          <button onClick={() => setFirst(10)}>first</button>
          <button onClick={() => setSecond(20)}>second</button>
        </div>
      )
    }

    const { getByTestId, getByText } = render(
      <Provider store={store}>
        <Reader />
        <Controls />
      </Provider>,
    )

    expect(getByTestId('val').textContent).toBe('3')

    act(() => {
      getByText('first').click()
    })

    expect(getByTestId('val').textContent).toBe('12')

    act(() => {
      getByText('second').click()
    })

    expect(getByTestId('val').textContent).toBe('30')
  })
})

describe('re-render behavior', () => {
  test('component re-renders when subscribed atom changes', () => {
    const countAtom = atom(0)
    const store = createStore()
    let renderCount = 0

    function Counter() {
      const value = useAtomValue(countAtom)
      renderCount++
      return <span data-testid="val">{value}</span>
    }

    render(
      <Provider store={store}>
        <Counter />
      </Provider>,
    )

    const initialRenderCount = renderCount

    act(() => {
      store.set(countAtom, 1)
    })

    expect(renderCount).toBeGreaterThan(initialRenderCount)
  })

  test('component does not re-render when set to the same value', () => {
    const countAtom = atom(0)
    const store = createStore()
    let renderCount = 0

    function Counter() {
      const value = useAtomValue(countAtom)
      renderCount++
      return <span data-testid="val">{value}</span>
    }

    render(
      <Provider store={store}>
        <Counter />
      </Provider>,
    )

    const afterFirstRender = renderCount

    act(() => {
      store.set(countAtom, 0) // same value
    })

    expect(renderCount).toBe(afterFirstRender)
  })

  test('unrelated atom change does not re-render component', () => {
    const countAtom = atom(0)
    const unrelatedAtom = atom('unrelated')
    const store = createStore()
    let renderCount = 0

    function Counter() {
      const value = useAtomValue(countAtom)
      renderCount++
      return <span data-testid="val">{value}</span>
    }

    render(
      <Provider store={store}>
        <Counter />
      </Provider>,
    )

    const afterFirstRender = renderCount

    act(() => {
      store.set(unrelatedAtom, 'changed')
    })

    expect(renderCount).toBe(afterFirstRender)
  })
})

describe('writable derived atoms', () => {
  test('writable derived atom reads and writes correctly', () => {
    const baseAtom = atom(100)
    const doubleAtom = atom(
      (get) => get(baseAtom) * 2,
      (_get, set, newBase: number) => {
        set(baseAtom, newBase)
      },
    )
    const store = createStore()

    function Display() {
      const [doubled, setBase] = useAtom(doubleAtom)
      return (
        <div>
          <span data-testid="val">{doubled}</span>
          <button onClick={() => setBase(50)}>set</button>
        </div>
      )
    }

    const { getByTestId, getByText } = render(
      <Provider store={store}>
        <Display />
      </Provider>,
    )

    expect(getByTestId('val').textContent).toBe('200')

    act(() => {
      getByText('set').click()
    })

    expect(getByTestId('val').textContent).toBe('100')
  })
})

describe('Provider isolation', () => {
  test('separate Providers have independent stores', () => {
    const countAtom = atom(0)
    const store1 = createStore()
    const store2 = createStore()

    function Reader({ testId }: { testId: string }) {
      const value = useAtomValue(countAtom)
      return <span data-testid={testId}>{value}</span>
    }

    // Set different values in each store
    store1.set(countAtom, 10)
    store2.set(countAtom, 20)

    const { getByTestId } = render(
      <div>
        <Provider store={store1}>
          <Reader testId="val1" />
        </Provider>
        <Provider store={store2}>
          <Reader testId="val2" />
        </Provider>
      </div>,
    )

    expect(getByTestId('val1').textContent).toBe('10')
    expect(getByTestId('val2').textContent).toBe('20')
  })
})
