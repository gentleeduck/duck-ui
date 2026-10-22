import { describe, expect, it, spyOn } from 'bun:test'
import { render, screen } from '@testing-library/react'
import * as React from 'react'
import { freshDom } from '../../__tests__/dom'
import { createContext, createContextScope, type Scope } from '../create-context'

freshDom()

describe('createContext', () => {
  it('hands back a null default outside its provider rather than throwing', () => {
    const [, useValue] = createContext<{ name: string } | null>('Root', null)
    function Reader() {
      return <span>{String(useValue('Reader'))}</span>
    }

    render(<Reader />)

    expect(screen.getByText('null')).toBeTruthy()
  })
})

describe('createContext Provider', () => {
  it('is named after its root, scoped or not', () => {
    const [Provider] = createContext<{ name: string }>('Root')
    const [ScopedProvider] = createContextScope('Scope')[0]<{ name: string }>('Part')

    expect([Provider.displayName, ScopedProvider.displayName]).toEqual(['RootProvider', 'PartProvider'])
  })

  it('hands its readers one value while its props stay the same, and a new one once they change', () => {
    const [Provider, useValue] = createContext<{ name: string }>('Root')
    const seen: { name: string }[] = []
    function Reader() {
      seen.push(useValue('Reader'))
      return null
    }
    const { rerender } = render(
      <Provider name="a">
        <Reader />
      </Provider>,
    )

    rerender(
      <Provider name="a">
        <Reader />
      </Provider>,
    )
    rerender(
      <Provider name="b">
        <Reader />
      </Provider>,
    )

    expect(seen.map(({ name }) => name)).toEqual(['a', 'a', 'b'])
    expect(new Set(seen).size).toBe(2)
  })
})

describe('createContext without a default', () => {
  it('throws naming the part and the root it must be used within', () => {
    const [, useValue] = createContext<{ name: string }>('Root')
    function Reader() {
      useValue('Reader')
      return null
    }
    const error = spyOn(console, 'error').mockImplementation(() => {})

    try {
      expect(() => render(<Reader />)).toThrow('`Reader` must be used within `Root`')
    } finally {
      error.mockRestore()
    }
  })
})

describe('createContextScope', () => {
  it('hands back a null default outside its provider rather than throwing', () => {
    const [createScopedContext] = createContextScope('Root')
    const [, useValue] = createScopedContext<{ name: string } | null>('Root', null)
    function Reader() {
      return <span>{String(useValue('Reader', undefined))}</span>
    }

    render(<Reader />)

    expect(screen.getByText('null')).toBeTruthy()
  })
})

describe('createContextScope scopes', () => {
  const [createThingContext, createThingScope] = createContextScope('Thing')
  const [ThingProvider, useThing] = createThingContext<{ name: string }>('Thing')
  const useThingScope = createThingScope()
  function Reader({ scope }: { scope: Scope }) {
    return <i>{useThing('Reader', scope).name}</i>
  }

  it('hands a provider and its readers given a scope contexts of their own, apart from those of the same root', () => {
    function Scoped() {
      const { __scopeThing: scope } = useThingScope(undefined)
      return (
        <ThingProvider name="scoped" scope={scope}>
          <Reader scope={scope} />
          <Reader scope={undefined} />
        </ThingProvider>
      )
    }

    const { container } = render(
      <ThingProvider name="plain" scope={undefined}>
        <Scoped />
      </ThingProvider>,
    )

    expect([...container.querySelectorAll('i')].map((node) => node.textContent)).toEqual(['scoped', 'plain'])
  })

  it('keeps each context of a scope apart, and hands its readers one value while its props stay the same', () => {
    const [LabelProvider, useLabel] = createThingContext<{ label: string }>('Label')
    const seen: { label: string }[] = []
    function Both({ scope }: { scope: Scope }) {
      const label = useLabel('Both', scope)
      seen.push(label)
      return (
        <i>
          {useThing('Both', scope).name} {label.label}
        </i>
      )
    }
    function Scoped({ label }: { label: string }) {
      const { __scopeThing: scope } = useThingScope(undefined)
      return (
        <ThingProvider name="thing" scope={scope}>
          <LabelProvider label={label} scope={scope}>
            <Both scope={scope} />
          </LabelProvider>
        </ThingProvider>
      )
    }
    const { container, rerender } = render(<Scoped label="a" />)

    rerender(<Scoped label="a" />)
    rerender(<Scoped label="b" />)

    expect(container.textContent).toBe('thing b')
    expect(new Set(seen).size).toBe(2)
  })

  it('passes the contexts of a scope it is handed down, so a part reads what its root provided', () => {
    const usePartScope = createThingScope()
    function Part({ __scopeThing }: { __scopeThing: Scope }) {
      const { __scopeThing: scope } = usePartScope(__scopeThing)
      return <Reader scope={scope} />
    }
    function Root() {
      const { __scopeThing: scope } = useThingScope(undefined)
      return (
        <ThingProvider name="root" scope={scope}>
          <Part __scopeThing={scope} />
        </ThingProvider>
      )
    }

    const { container } = render(<Root />)

    expect(container.textContent).toBe('root')
  })

  it('composes the scopes it depends on into its own, so its root can provide theirs to its parts', () => {
    const [createOuterContext, createOuterScope] = createContextScope('Outer', [createThingScope])
    const [OuterProvider, useOuter] = createOuterContext<{ name: string }>('Outer')
    const useOuterScope = createOuterScope()
    function Both({ scope }: { scope: Scope }) {
      return (
        <i>
          {useOuter('Both', scope).name} {useThing('Both', scope).name}
        </i>
      )
    }
    function Outer() {
      const { __scopeOuter: scope } = useOuterScope(undefined)
      return (
        <OuterProvider name="outer" scope={scope}>
          <ThingProvider name="thing" scope={scope}>
            <Both scope={scope} />
            <Reader scope={undefined} />
          </ThingProvider>
        </OuterProvider>
      )
    }

    const { container } = render(
      <ThingProvider name="plain" scope={undefined}>
        <Outer />
      </ThingProvider>,
    )

    expect(createOuterScope.scopeName).toBe('Outer')
    expect([...container.querySelectorAll('i')].map((node) => node.textContent)).toEqual(['outer thing', 'plain'])
  })
})
