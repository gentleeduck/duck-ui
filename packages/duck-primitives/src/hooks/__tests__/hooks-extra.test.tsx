import { describe, expect, it } from 'bun:test'
import { render } from '@testing-library/react'
import * as React from 'react'
import { FocusGuards, useFocusGuards } from '../use-focus-guard'
import { useLayoutEffect } from '../use-layout-effect'

// --- useLayoutEffect ---

describe('useLayoutEffect', () => {
  it('is a function', () => {
    expect(typeof useLayoutEffect).toBe('function')
  })

  it('runs synchronously during render in jsdom', () => {
    let ran = false
    function Comp() {
      useLayoutEffect(() => {
        ran = true
      }, [])
      return null
    }
    render(<Comp />)
    expect(ran).toBe(true)
  })
})

// --- useFocusGuards ---

describe('useFocusGuards', () => {
  it('inserts focus guard elements into document.body', () => {
    function Comp() {
      useFocusGuards()
      return <div>content</div>
    }
    render(<Comp />)
    const guards = document.querySelectorAll('[data-slot="focus-guard"]')
    expect(guards.length).toBeGreaterThanOrEqual(2)
  })

  it('focus guards are focusable (tabindex=0)', () => {
    function Comp() {
      useFocusGuards()
      return <div>content</div>
    }
    render(<Comp />)
    const guards = document.querySelectorAll('[data-slot="focus-guard"]')
    for (const guard of guards) {
      expect((guard as HTMLElement).tabIndex).toBe(0)
    }
  })

  it('focus guards are visually hidden', () => {
    function Comp() {
      useFocusGuards()
      return <div>content</div>
    }
    render(<Comp />)
    const guard = document.querySelector('[data-slot="focus-guard"]') as HTMLElement
    expect(guard.style.opacity).toBe('0')
    expect(guard.style.position).toBe('fixed')
    expect(guard.style.pointerEvents).toBe('none')
  })

  it('FocusGuards component renders children', () => {
    const { container } = render(
      <FocusGuards>
        <span data-testid="child">wrapped</span>
      </FocusGuards>,
    )
    expect(container.querySelector('[data-testid="child"]')?.textContent).toBe('wrapped')
  })

  // Guard cleanup depends on global ref count across all test files - not reliably testable in isolation
})
