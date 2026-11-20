import { cleanup, render } from '@testing-library/react'
import * as React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { FocusGuards, useFocusGuards } from '../use-focus-guard'

function Guarded() {
  useFocusGuards()
  return null
}

const guards = () => [...document.querySelectorAll<HTMLElement>('[data-slot="focus-guard"]')]

describe('useFocusGuards', () => {
  afterEach(cleanup)

  it('puts one focusable, invisible guard at each edge of the body', () => {
    render(<Guarded />)

    const [start, end] = guards()
    expect(guards()).toHaveLength(2)
    expect(document.body.firstElementChild).toBe(start)
    expect(document.body.lastElementChild).toBe(end)
    for (const guard of guards()) {
      expect(guard.tabIndex).toBe(0)
      expect(guard.style.opacity).toBe('0')
      expect(guard.style.outline).toBe('none')
      expect(guard.style.position).toBe('fixed')
      expect(guard.style.pointerEvents).toBe('none')
    }
  })

  it('leaves the body alone when another consumer mounts with the guards in place', () => {
    const { rerender } = render(<Guarded />)
    const insert = vi.spyOn(document.body, 'insertAdjacentElement')

    rerender(
      <>
        <Guarded />
        <Guarded />
      </>,
    )

    expect(insert).not.toHaveBeenCalled()
    insert.mockRestore()
  })

  it('moves back only the guard that something was put in front of', () => {
    const { rerender } = render(<Guarded />)
    const [start, end] = guards()
    const banner = document.createElement('div')
    document.body.prepend(banner)
    const insert = vi.spyOn(document.body, 'insertAdjacentElement')

    rerender(
      <>
        <Guarded />
        <Guarded />
      </>,
    )

    expect(insert).toHaveBeenCalledTimes(1)
    expect(document.body.firstElementChild).toBe(start)
    expect(document.body.lastElementChild).toBe(end)
    insert.mockRestore()
    banner.remove()
  })

  it('removes the pair with the last consumer and makes a new one for the next', () => {
    const { rerender } = render(<Guarded />)
    const [start] = guards()

    rerender(<></>)
    expect(guards()).toHaveLength(0)

    rerender(<Guarded />)
    expect(guards()).toHaveLength(2)
    expect(guards()[0]).not.toBe(start)
    expect(document.body.firstElementChild).toBe(guards()[0])
  })

  it('keeps one pair through the double effect of StrictMode', () => {
    const { unmount } = render(
      <React.StrictMode>
        <Guarded />
      </React.StrictMode>,
    )
    expect(guards()).toHaveLength(2)

    unmount()
    expect(guards()).toHaveLength(0)
  })
})

describe('FocusGuards', () => {
  afterEach(cleanup)

  it('renders its children and guards the body while mounted', () => {
    const { getByText, unmount } = render(
      <FocusGuards>
        <span>wrapped</span>
      </FocusGuards>,
    )

    expect(getByText('wrapped')).toBeTruthy()
    expect(guards()).toHaveLength(2)
    unmount()
    expect(guards()).toHaveLength(0)
  })
})
