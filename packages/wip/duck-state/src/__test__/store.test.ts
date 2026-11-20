import { describe, expect, test, vi } from 'vitest'
import { atom } from '../primitive/atom'
import { createStore } from '../primitive/store'

describe('createStore', () => {
  describe('get and set for primitive atoms', () => {
    test('get returns initial value of a primitive atom', () => {
      const store = createStore()
      const countAtom = atom(0)
      expect(store.get(countAtom)).toBe(0)
    })

    test('get returns string initial value', () => {
      const store = createStore()
      const nameAtom = atom('hello')
      expect(store.get(nameAtom)).toBe('hello')
    })

    test('get returns object initial value', () => {
      const store = createStore()
      const objAtom = atom({ a: 1 })
      expect(store.get(objAtom)).toEqual({ a: 1 })
    })

    test('get returns undefined for atom without initial value', () => {
      const store = createStore()
      const emptyAtom = atom<number>()
      expect(store.get(emptyAtom)).toBeUndefined()
    })

    test('set updates a primitive atom value', () => {
      const store = createStore()
      const countAtom = atom(0)
      store.set(countAtom, 5)
      expect(store.get(countAtom)).toBe(5)
    })

    test('set with updater function', () => {
      const store = createStore()
      const countAtom = atom(10)
      store.set(countAtom, (prev: number) => prev + 5)
      expect(store.get(countAtom)).toBe(15)
    })

    test('multiple sets accumulate', () => {
      const store = createStore()
      const countAtom = atom(0)
      store.set(countAtom, 1)
      store.set(countAtom, (prev: number) => prev + 1)
      store.set(countAtom, (prev: number) => prev * 3)
      expect(store.get(countAtom)).toBe(6)
    })

    test('different atoms are independent', () => {
      const store = createStore()
      const aAtom = atom(1)
      const bAtom = atom(2)
      store.set(aAtom, 10)
      expect(store.get(aAtom)).toBe(10)
      expect(store.get(bAtom)).toBe(2)
    })
  })

  describe('derived atom computation and caching', () => {
    test('derived atom computes value from base atom', () => {
      const store = createStore()
      const baseAtom = atom(5)
      const doubleAtom = atom((get) => get(baseAtom) * 2)
      expect(store.get(doubleAtom)).toBe(10)
    })

    test('derived atom reflects updated base atom', () => {
      const store = createStore()
      const baseAtom = atom(5)
      const doubleAtom = atom((get) => get(baseAtom) * 2)
      expect(store.get(doubleAtom)).toBe(10)
      store.set(baseAtom, 10)
      expect(store.get(doubleAtom)).toBe(20)
    })

    test('derived atom depending on multiple atoms', () => {
      const store = createStore()
      const aAtom = atom(2)
      const bAtom = atom(3)
      const sumAtom = atom((get) => get(aAtom) + get(bAtom))
      expect(store.get(sumAtom)).toBe(5)
      store.set(aAtom, 10)
      expect(store.get(sumAtom)).toBe(13)
      store.set(bAtom, 7)
      expect(store.get(sumAtom)).toBe(17)
    })

    test('chained derived atoms', () => {
      const store = createStore()
      const baseAtom = atom(2)
      const doubleAtom = atom((get) => get(baseAtom) * 2)
      const quadrupleAtom = atom((get) => get(doubleAtom) * 2)
      expect(store.get(quadrupleAtom)).toBe(8)
      store.set(baseAtom, 5)
      expect(store.get(quadrupleAtom)).toBe(20)
    })

    test('derived atom caches result', () => {
      const store = createStore()
      const baseAtom = atom(1)
      let computeCount = 0
      const derivedAtom = atom((get) => {
        computeCount++
        return get(baseAtom) * 2
      })
      store.get(derivedAtom)
      store.get(derivedAtom)
      store.get(derivedAtom)
      // Should compute only once since baseAtom hasn't changed
      expect(computeCount).toBe(1)
    })

    test('derived atom recomputes after dependency changes', () => {
      const store = createStore()
      const baseAtom = atom(1)
      let computeCount = 0
      const derivedAtom = atom((get) => {
        computeCount++
        return get(baseAtom) * 2
      })
      store.get(derivedAtom) // compute #1
      store.set(baseAtom, 2) // invalidate
      store.get(derivedAtom) // compute #2
      expect(computeCount).toBe(2)
      expect(store.get(derivedAtom)).toBe(4)
    })

    test('derived atom with string concatenation', () => {
      const store = createStore()
      const firstName = atom('John')
      const lastName = atom('Doe')
      const fullName = atom((get) => `${get(firstName)} ${get(lastName)}`)
      expect(store.get(fullName)).toBe('John Doe')
      store.set(firstName, 'Jane')
      expect(store.get(fullName)).toBe('Jane Doe')
    })
  })

  describe('dependency tracking and invalidation', () => {
    test('setting base atom invalidates derived atom cache', () => {
      const store = createStore()
      const baseAtom = atom(1)
      let computeCount = 0
      const derivedAtom = atom((get) => {
        computeCount++
        return get(baseAtom) + 100
      })
      expect(store.get(derivedAtom)).toBe(101)
      expect(computeCount).toBe(1)
      store.set(baseAtom, 2)
      expect(store.get(derivedAtom)).toBe(102)
      expect(computeCount).toBe(2)
    })

    test('invalidation propagates through chain', () => {
      const store = createStore()
      const baseAtom = atom(1)
      let midCount = 0
      let endCount = 0
      const midAtom = atom((get) => {
        midCount++
        return get(baseAtom) * 2
      })
      const endAtom = atom((get) => {
        endCount++
        return get(midAtom) + 10
      })
      expect(store.get(endAtom)).toBe(12)
      // midAtom computed once (when endAtom reads it), endAtom computed once
      expect(midCount).toBe(1)
      expect(endCount).toBe(1)

      store.set(baseAtom, 5)
      expect(store.get(endAtom)).toBe(20)
      expect(midCount).toBe(2)
      expect(endCount).toBe(2)
    })

    test('setting base atom notifies derived atom subscribers', () => {
      const store = createStore()
      const baseAtom = atom(1)
      const derivedAtom = atom((get) => get(baseAtom) * 2)

      // Initialize derived atom so dependency tracking is established
      store.get(derivedAtom)

      const listener = vi.fn(() => {})
      store.subscribe(derivedAtom, listener)

      store.set(baseAtom, 5)
      expect(listener).toHaveBeenCalled()
    })

    test('unrelated atom changes do not invalidate derived', () => {
      const store = createStore()
      const aAtom = atom(1)
      const bAtom = atom(2)
      let computeCount = 0
      const derivedAtom = atom((get) => {
        computeCount++
        return get(aAtom) * 10
      })
      store.get(derivedAtom)
      expect(computeCount).toBe(1)

      store.set(bAtom, 99) // unrelated
      store.get(derivedAtom)
      // Should still be cached since bAtom is not a dependency
      expect(computeCount).toBe(1)
    })
  })

  describe('subscribers and unsubscribe', () => {
    test('subscribe is called when atom value changes', () => {
      const store = createStore()
      const countAtom = atom(0)
      const listener = vi.fn(() => {})
      store.subscribe(countAtom, listener)
      store.set(countAtom, 1)
      expect(listener).toHaveBeenCalledTimes(1)
    })

    test('multiple subscribers all get notified', () => {
      const store = createStore()
      const countAtom = atom(0)
      const listener1 = vi.fn(() => {})
      const listener2 = vi.fn(() => {})
      const listener3 = vi.fn(() => {})
      store.subscribe(countAtom, listener1)
      store.subscribe(countAtom, listener2)
      store.subscribe(countAtom, listener3)
      store.set(countAtom, 5)
      expect(listener1).toHaveBeenCalledTimes(1)
      expect(listener2).toHaveBeenCalledTimes(1)
      expect(listener3).toHaveBeenCalledTimes(1)
    })

    test('unsubscribe removes listener', () => {
      const store = createStore()
      const countAtom = atom(0)
      const listener = vi.fn(() => {})
      const unsub = store.subscribe(countAtom, listener)
      store.set(countAtom, 1)
      expect(listener).toHaveBeenCalledTimes(1)

      unsub()
      store.set(countAtom, 2)
      // Should still be 1 since we unsubscribed
      expect(listener).toHaveBeenCalledTimes(1)
    })

    test('unsubscribe only removes the specific listener', () => {
      const store = createStore()
      const countAtom = atom(0)
      const listener1 = vi.fn(() => {})
      const listener2 = vi.fn(() => {})
      const unsub1 = store.subscribe(countAtom, listener1)
      store.subscribe(countAtom, listener2)

      unsub1()
      store.set(countAtom, 5)
      expect(listener1).toHaveBeenCalledTimes(0)
      expect(listener2).toHaveBeenCalledTimes(1)
    })

    test('multiple updates trigger listener each time', () => {
      const store = createStore()
      const countAtom = atom(0)
      const listener = vi.fn(() => {})
      store.subscribe(countAtom, listener)
      store.set(countAtom, 1)
      store.set(countAtom, 2)
      store.set(countAtom, 3)
      expect(listener).toHaveBeenCalledTimes(3)
    })

    test('subscriber can read updated value inside callback', () => {
      const store = createStore()
      const countAtom = atom(0)
      let readValue: number | undefined
      store.subscribe(countAtom, () => {
        readValue = store.get(countAtom)
      })
      store.set(countAtom, 42)
      expect(readValue).toBe(42)
    })
  })

  describe('shallow equality preventing unnecessary notifications', () => {
    test('same primitive value does not trigger listener', () => {
      const store = createStore()
      const countAtom = atom(5)
      const listener = vi.fn(() => {})
      store.subscribe(countAtom, listener)

      store.set(countAtom, 5) // same value
      expect(listener).toHaveBeenCalledTimes(0)
    })

    test('same string value does not trigger listener', () => {
      const store = createStore()
      const nameAtom = atom('hello')
      const listener = vi.fn(() => {})
      store.subscribe(nameAtom, listener)

      store.set(nameAtom, 'hello') // same value
      expect(listener).toHaveBeenCalledTimes(0)
    })

    test('shallow-equal object does not trigger listener', () => {
      const store = createStore()
      const objAtom = atom({ a: 1, b: 2 })
      const listener = vi.fn(() => {})
      store.subscribe(objAtom, listener)

      store.set(objAtom, { a: 1, b: 2 }) // shallow equal
      expect(listener).toHaveBeenCalledTimes(0)
    })

    test('shallow-equal array does not trigger listener', () => {
      const store = createStore()
      const arrAtom = atom([1, 2, 3])
      const listener = vi.fn(() => {})
      store.subscribe(arrAtom, listener)

      store.set(arrAtom, [1, 2, 3]) // shallow equal
      expect(listener).toHaveBeenCalledTimes(0)
    })

    test('different object triggers listener', () => {
      const store = createStore()
      const objAtom = atom({ a: 1, b: 2 })
      const listener = vi.fn(() => {})
      store.subscribe(objAtom, listener)

      store.set(objAtom, { a: 1, b: 3 }) // different
      expect(listener).toHaveBeenCalledTimes(1)
    })

    test('different length array triggers listener', () => {
      const store = createStore()
      const arrAtom = atom([1, 2, 3])
      const listener = vi.fn(() => {})
      store.subscribe(arrAtom, listener)

      store.set(arrAtom, [1, 2])
      expect(listener).toHaveBeenCalledTimes(1)
    })

    test('NaN is equal to NaN (Object.is)', () => {
      const store = createStore()
      const nanAtom = atom(NaN)
      const listener = vi.fn(() => {})
      store.subscribe(nanAtom, listener)

      store.set(nanAtom, NaN)
      expect(listener).toHaveBeenCalledTimes(0)
    })

    test('updater returning same value does not trigger listener', () => {
      const store = createStore()
      const countAtom = atom(5)
      const listener = vi.fn(() => {})
      store.subscribe(countAtom, listener)

      store.set(countAtom, (prev: number) => prev) // returns same value
      expect(listener).toHaveBeenCalledTimes(0)
    })
  })

  describe('writable derived atoms in store', () => {
    test('writable derived atom read and write', () => {
      const store = createStore()
      const celsiusAtom = atom(0)
      const fahrenheitAtom = atom(
        (get) => (get(celsiusAtom) * 9) / 5 + 32,
        (get, set, fahrenheit: number) => {
          set(celsiusAtom, ((fahrenheit - 32) * 5) / 9)
        },
      )
      expect(store.get(fahrenheitAtom)).toBe(32)
      store.set(fahrenheitAtom, 212)
      expect(store.get(celsiusAtom)).toBe(100)
      expect(store.get(fahrenheitAtom)).toBe(212)
    })

    test('writable derived atom notifies subscribers', () => {
      const store = createStore()
      const baseAtom = atom(0)
      const derivedAtom = atom(
        (get) => get(baseAtom) * 2,
        (get, set, val: number) => {
          set(baseAtom, val)
        },
      )

      // Initialize to establish dependencies
      store.get(derivedAtom)

      const baseListener = vi.fn(() => {})
      store.subscribe(baseAtom, baseListener)

      store.set(derivedAtom, 10)
      expect(store.get(baseAtom)).toBe(10)
      expect(baseListener).toHaveBeenCalled()
    })
  })

  describe('store isolation', () => {
    test('different stores are independent', () => {
      const store1 = createStore()
      const store2 = createStore()
      const countAtom = atom(0)

      store1.set(countAtom, 5)
      expect(store1.get(countAtom)).toBe(5)
      expect(store2.get(countAtom)).toBe(0) // unaffected
    })

    test('subscribers on one store do not fire for another', () => {
      const store1 = createStore()
      const store2 = createStore()
      const countAtom = atom(0)

      const listener = vi.fn(() => {})
      store1.subscribe(countAtom, listener)

      store2.set(countAtom, 10)
      expect(listener).toHaveBeenCalledTimes(0) // not notified
    })
  })
})
