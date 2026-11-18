import { describe, expect, it } from 'bun:test'
import { render } from '@testing-library/react'
import * as React from 'react'
import { Presence } from '../presence'

describe('Presence', () => {
  it('renders children when present=true', () => {
    const { container } = render(
      <Presence present={true}>
        <div data-testid="child">visible</div>
      </Presence>,
    )
    expect(container.querySelector('[data-testid="child"]')).not.toBeNull()
  })

  it('does not render children when present=false', () => {
    const { container } = render(
      <Presence present={false}>
        <div data-testid="child">hidden</div>
      </Presence>,
    )
    expect(container.querySelector('[data-testid="child"]')).toBeNull()
  })

  it('supports render function children', () => {
    const { container } = render(
      <Presence present={true}>{({ present }) => <div data-testid="fn">{present ? 'yes' : 'no'}</div>}</Presence>,
    )
    expect(container.querySelector('[data-testid="fn"]')?.textContent).toBe('yes')
  })

  it('render function receives present=false when not present', () => {
    const { container } = render(
      <Presence present={false}>{({ present }) => <div data-testid="fn">{present ? 'yes' : 'no'}</div>}</Presence>,
    )
    // With render function, the child is always mounted (forceMount behavior)
    expect(container.querySelector('[data-testid="fn"]')?.textContent).toBe('no')
  })

  it('toggles visibility on present change', () => {
    const { container, rerender } = render(
      <Presence present={true}>
        <div data-testid="toggle">content</div>
      </Presence>,
    )
    expect(container.querySelector('[data-testid="toggle"]')).not.toBeNull()
    rerender(
      <Presence present={false}>
        <div data-testid="toggle">content</div>
      </Presence>,
    )
    // In jsdom without animations, unmount is immediate
    expect(container.querySelector('[data-testid="toggle"]')).toBeNull()
  })

  it('preserves child element type', () => {
    const { container } = render(
      <Presence present={true}>
        <button>I am a button</button>
      </Presence>,
    )
    expect(container.querySelector('button')?.textContent).toBe('I am a button')
  })

  it('initial present=false does not mount', () => {
    const { container } = render(
      <Presence present={false}>
        <span>never visible</span>
      </Presence>,
    )
    expect(container.querySelector('span')).toBeNull()
  })

  it('render function always mounts (forceMount behavior)', () => {
    const { container } = render(
      <Presence present={false}>
        {({ present }) => <div data-testid="force">{present ? 'visible' : 'hidden'}</div>}
      </Presence>,
    )
    // render function children are always mounted
    expect(container.querySelector('[data-testid="force"]')).not.toBeNull()
    expect(container.querySelector('[data-testid="force"]')?.textContent).toBe('hidden')
  })
})
