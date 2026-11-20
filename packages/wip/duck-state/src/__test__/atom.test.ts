import { describe, expect, test } from 'vitest'
import type { Getter, IWritableAtom, Setter } from '../primitive/atom'
import { atom } from '../primitive/atom'

describe('atom', () => {
  describe('primitive atoms', () => {
    test('creates a primitive atom with an initial value', () => {
      const countAtom = atom(0)
      expect(countAtom.initValue).toBe(0)
    })

    test('creates a primitive atom with a string initial value', () => {
      const nameAtom = atom('hello')
      expect(nameAtom.initValue).toBe('hello')
    })

    test('creates a primitive atom with an object initial value', () => {
      const objAtom = atom({ x: 1, y: 2 })
      expect(objAtom.initValue).toEqual({ x: 1, y: 2 })
    })

    test('creates a primitive atom with undefined when no initial value is given', () => {
      const emptyAtom = atom<number>()
      expect(emptyAtom.initValue).toBeUndefined()
    })

    test('creates a primitive atom with null initial value', () => {
      const nullAtom = atom<string | null>(null)
      expect(nullAtom.initValue).toBeNull()
    })

    test('primitive atom has a read function', () => {
      const countAtom = atom(0)
      expect(typeof countAtom.read).toBe('function')
    })

    test('primitive atom has a write function', () => {
      const countAtom = atom(0)
      expect(typeof countAtom.write).toBe('function')
    })

    test('toString returns a Symbol', () => {
      const countAtom = atom(0)
      const result = countAtom.toString()
      expect(typeof result).toBe('symbol')
    })

    test('each atom gets a unique key', () => {
      const a = atom(1)
      const b = atom(2)
      // Each should produce a different symbol
      expect(a.toString().description).not.toBe(b.toString().description)
    })

    test('primitive atom read returns its own value via getter', () => {
      const countAtom = atom(42)
      // The read function for primitive atoms calls get(this)
      const mockGet = ((a: any) => {
        if (a === countAtom) return 42
      }) as Getter
      const result = countAtom.read(mockGet, {} as never)
      expect(result).toBe(42)
    })

    test('primitive atom write sets a direct value', () => {
      const countAtom = atom(0)
      let setValue: unknown
      const mockGet = ((a: any) => 0) as Getter
      const mockSet = ((a: any, v: any) => {
        setValue = v
      }) as Setter
      countAtom.write(mockGet, mockSet, 5)
      expect(setValue).toBe(5)
    })

    test('primitive atom write supports updater function', () => {
      const countAtom = atom(10)
      let setValue: unknown
      const mockGet = ((a: any) => 10) as Getter
      const mockSet = ((a: any, v: any) => {
        setValue = v
      }) as Setter
      countAtom.write(mockGet, mockSet, (prev: number) => prev + 1)
      expect(setValue).toBe(11)
    })
  })

  describe('derived read-only atoms', () => {
    test('creates a derived atom with a read function', () => {
      const baseAtom = atom(5)
      const derivedAtom = atom((get) => get(baseAtom) * 2)
      expect(typeof derivedAtom.read).toBe('function')
    })

    test('derived atom does not have initValue', () => {
      const derivedAtom = atom((get) => 42)
      expect('initValue' in derivedAtom).toBe(false)
    })

    test('derived atom read computes value from dependencies', () => {
      const baseAtom = atom(3)
      const derivedAtom = atom((get) => get(baseAtom) + 10)
      const mockGet = ((a: any) => {
        if (a === baseAtom) return 3
      }) as Getter
      const result = derivedAtom.read(mockGet, {} as never)
      expect(result).toBe(13)
    })

    test('derived atom can depend on multiple atoms', () => {
      const aAtom = atom(2)
      const bAtom = atom(3)
      const sumAtom = atom((get) => get(aAtom) + get(bAtom))
      const mockGet = ((a: any) => {
        if (a === aAtom) return 2
        if (a === bAtom) return 3
        return undefined
      }) as Getter
      const result = sumAtom.read(mockGet, {} as never)
      expect(result).toBe(5)
    })

    test('derived atom does not expose a write function at runtime', () => {
      const derivedAtom = atom((get) => 42)
      expect('write' in derivedAtom).toBe(false)
    })
  })

  describe('writable derived atoms', () => {
    test('creates a writable derived atom with read and write', () => {
      const baseAtom = atom(0)
      const writableDerived = atom(
        (get) => get(baseAtom) * 2,
        (get, set, newValue: number) => {
          set(baseAtom, newValue / 2)
        },
      )
      expect(typeof writableDerived.read).toBe('function')
      expect(typeof writableDerived.write).toBe('function')
    })

    test('writable derived atom does not have initValue', () => {
      const baseAtom = atom(0)
      const writableDerived = atom(
        (get) => get(baseAtom),
        (get, set, val: number) => set(baseAtom, val),
      )
      expect('initValue' in writableDerived).toBe(false)
    })

    test('writable derived atom read computes from dependencies', () => {
      const baseAtom = atom(10)
      const writableDerived = atom(
        (get) => get(baseAtom) + 5,
        (get, set, val: number) => set(baseAtom, val),
      )
      const mockGet = ((a: any) => {
        if (a === baseAtom) return 10
      }) as Getter
      expect(writableDerived.read(mockGet, {} as never)).toBe(15)
    })

    test('writable derived atom write calls set on base atom', () => {
      const baseAtom = atom(0)
      let setCalledWith: [any, any] | undefined
      const mockGet = (() => 0) as Getter
      const mockSet = ((a: any, v: any) => {
        setCalledWith = [a, v]
      }) as Setter
      const writableDerived = atom(
        (get) => get(baseAtom),
        (get, set, val: number) => set(baseAtom as any, val),
      )
      writableDerived.write(mockGet, mockSet, 42)
      expect(setCalledWith).toEqual([baseAtom, 42])
    })

    test('write-only derived atom with init value and custom write', () => {
      const baseAtom = atom(0)
      let written = false
      const writeOnly = atom(100, (get, set, val: number) => {
        written = true
        set(baseAtom as any, val)
      })
      expect(writeOnly.initValue).toBe(100)
      const mockGet = (() => 0) as Getter
      const mockSet = (() => {}) as Setter
      writeOnly.write(mockGet, mockSet, 5)
      expect(written).toBe(true)
    })
  })
})
