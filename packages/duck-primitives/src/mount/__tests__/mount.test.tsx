import { describe, expect, it } from 'bun:test'
import { render } from '@testing-library/react'
import * as React from 'react'
import { MountMinimal } from '../mount-minimal'

describe('MountMinimal', () => {
  it('renders children when open=true', () => {
    const { container } = render(
      <MountMinimal open>
        <div data-testid="content">visible</div>
      </MountMinimal>,
    )
    expect(container.querySelector('[data-testid="content"]')).not.toBeNull()
  })

  it('does not render children when open=false', () => {
    const { container } = render(
      <MountMinimal open={false}>
        <div data-testid="content">hidden</div>
      </MountMinimal>,
    )
    expect(container.querySelector('[data-testid="content"]')).toBeNull()
  })

  it('renders when forceMount=true and open=true', () => {
    const { container } = render(
      <MountMinimal forceMount open>
        <div data-testid="fm">force mounted</div>
      </MountMinimal>,
    )
    expect(container.querySelector('[data-testid="fm"]')).not.toBeNull()
  })

  it('does not render when forceMount=true but open=false', () => {
    const { container } = render(
      <MountMinimal forceMount open={false}>
        <div data-testid="fm">force mounted</div>
      </MountMinimal>,
    )
    expect(container.querySelector('[data-testid="fm"]')).toBeNull()
  })

  it('accepts skipWaiting prop without error', () => {
    expect(() =>
      render(
        <MountMinimal open skipWaiting>
          <div>skip waiting content</div>
        </MountMinimal>,
      ),
    ).not.toThrow()
  })
})
