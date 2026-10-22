import { describe, expect, it } from 'bun:test'
import { act, render } from '@testing-library/react'
import * as React from 'react'
import { freshDom } from '../../__tests__/dom'
import { FocusScopeBranchProvider, useFocusScopeBranch, useFocusScopeBranchRegistry } from '../index'

freshDom()

type Host = ReturnType<typeof useFocusScopeBranchRegistry>

function renderHost(children?: React.ReactNode) {
  const host: { current?: Host } = {}
  function Host() {
    host.current = useFocusScopeBranchRegistry()
    return <FocusScopeBranchProvider registry={host.current.registry}>{children}</FocusScopeBranchProvider>
  }
  const rendered = render(<Host />)
  return { host: host as { current: Host }, ...rendered }
}

function Branch({ name }: { name: string }) {
  const [node, setNode] = React.useState<HTMLElement | null>(null)
  useFocusScopeBranch(node)
  return <div ref={setNode} data-branch={name} />
}

describe('useFocusScopeBranchRegistry', () => {
  it('keeps its list when a node is added twice or a stranger is removed', () => {
    const { host } = renderHost()
    const node = document.createElement('div')

    act(() => host.current.registry.add(node))
    const nodes = host.current.nodes
    act(() => host.current.registry.add(node))
    act(() => host.current.registry.remove(document.createElement('div')))

    expect(host.current.nodes).toBe(nodes)
    expect(nodes).toEqual([node])
  })

  it('holds the same registry across renders', () => {
    const { host } = renderHost()
    const { registry, nodes } = host.current

    act(() => registry.add(document.createElement('div')))

    expect(host.current.nodes).not.toBe(nodes)
    expect(host.current.registry).toBe(registry)
  })
})

describe('useFocusScopeBranch', () => {
  it('registers with the nearest host and leaves it on unmount', () => {
    function Tree({ show }: { show: boolean }) {
      return show ? <Branch name="one" /> : null
    }
    const host: { current?: Host } = {}
    function Host({ show }: { show: boolean }) {
      host.current = useFocusScopeBranchRegistry()
      return (
        <FocusScopeBranchProvider registry={host.current.registry}>
          <Tree show={show} />
        </FocusScopeBranchProvider>
      )
    }
    const { rerender } = render(<Host show />)

    expect(host.current?.nodes.map((node) => node.dataset.branch)).toEqual(['one'])

    rerender(<Host show={false} />)

    expect(host.current?.nodes).toEqual([])
  })

  it('passes through a provider without a registry to the host above it', () => {
    const { host } = renderHost(
      <FocusScopeBranchProvider registry={null}>
        <Branch name="inner" />
      </FocusScopeBranchProvider>,
    )

    expect(host.current.nodes.map((node) => node.dataset.branch)).toEqual(['inner'])
  })

  it('does nothing without a host', () => {
    expect(() => render(<Branch name="alone" />)).not.toThrow()
  })
})
