import { describe, expect, it } from 'bun:test'
import { render } from '@testing-library/react'
import * as React from 'react'
import { Portal } from '../portal'

describe('Portal', () => {
  it('renders children into document.body by default', () => {
    render(
      <Portal>
        <span data-testid="portaled">hello</span>
      </Portal>,
    )
    const el = document.body.querySelector('[data-testid="portaled"]')
    expect(el).not.toBeNull()
    expect(el?.textContent).toBe('hello')
  })

  it('renders with data-slot="portal"', () => {
    render(
      <Portal>
        <span>content</span>
      </Portal>,
    )
    expect(document.body.querySelector('[data-slot="portal"]')).not.toBeNull()
  })

  it('renders into a custom container', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    render(
      <Portal container={container}>
        <span data-testid="custom">in container</span>
      </Portal>,
    )
    expect(container.querySelector('[data-testid="custom"]')).not.toBeNull()
    document.body.removeChild(container)
  })

  it('forwards ref', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(
      <Portal ref={ref}>
        <span>ref test</span>
      </Portal>,
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})
