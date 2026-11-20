import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { Button } from '../button'
import { MotionButton } from '../motion-button'

afterEach(cleanup)

const press = (element: HTMLElement) => {
  const click = new MouseEvent('click', { bubbles: true, cancelable: true })
  fireEvent(element, click)
  return click
}

describe.each([
  ['Button', Button],
  ['MotionButton', MotionButton],
] as const)('registry-ui %s asChild', (_, Component) => {
  test('a disabled link is marked disabled, dims, and neither follows nor reports a click', () => {
    const onClick = vi.fn()
    const onLinkClick = vi.fn()
    render(
      <Component asChild disabled onClick={onClick}>
        <a href="/lakes" onClick={onLinkClick}>
          Lakes
        </a>
      </Component>,
    )
    const lakes = screen.getByRole('link', { name: 'Lakes' })

    expect(press(lakes).defaultPrevented).toBe(true)
    expect(onClick).not.toHaveBeenCalled()
    expect(onLinkClick).not.toHaveBeenCalled()
    expect(lakes.getAttribute('aria-disabled')).toBe('true')
    expect(lakes.className.split(' ')).toContain('aria-disabled:opacity-50')
  })

  test('a loading link is busy and disabled; an enabled one follows and reports its click', () => {
    const onClick = vi.fn()
    render(
      <>
        <Component asChild loading>
          <a href="/ponds">Ponds</a>
        </Component>
        <Component asChild onClick={onClick}>
          <a href="/rivers">Rivers</a>
        </Component>
      </>,
    )
    const ponds = screen.getByRole('link', { name: 'Ponds' })
    const rivers = screen.getByRole('link', { name: 'Rivers' })

    expect(ponds.getAttribute('aria-busy')).toBe('true')
    expect(press(ponds).defaultPrevented).toBe(true)
    expect(press(rivers).defaultPrevented).toBe(false)
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(rivers.hasAttribute('aria-disabled')).toBe(false)
    expect(rivers.hasAttribute('aria-busy')).toBe(false)
  })

  test("a loading link's own capture handler and aria state give way, and an enabled link's capture still runs", () => {
    const onLakesCapture = vi.fn()
    const onRiversCapture = vi.fn()
    render(
      <>
        <Component asChild loading>
          <a aria-busy={false} aria-disabled={false} href="/lakes" onClickCapture={onLakesCapture}>
            Lakes
          </a>
        </Component>
        <Component asChild>
          <a href="/rivers" onClickCapture={onRiversCapture}>
            Rivers
          </a>
        </Component>
      </>,
    )
    const lakes = screen.getByRole('link', { name: 'Lakes' })

    expect(press(lakes).defaultPrevented).toBe(true)
    expect(onLakesCapture).not.toHaveBeenCalled()
    expect([lakes.getAttribute('aria-disabled'), lakes.getAttribute('aria-busy')]).toEqual(['true', 'true'])

    expect(press(screen.getByRole('link', { name: 'Rivers' })).defaultPrevented).toBe(false)
    expect(onRiversCapture).toHaveBeenCalledTimes(1)
  })
})

describe('registry-ui MotionButton asChild', () => {
  test('a disabled link stops a click that lands on the wrapper, where the pointer goes', () => {
    const onClick = vi.fn()
    render(
      <div onClick={onClick}>
        <MotionButton asChild disabled>
          <a href="/lakes">Lakes</a>
        </MotionButton>
      </div>,
    )
    const wrapper = screen.getByRole('link', { name: 'Lakes' }).parentElement as HTMLElement

    expect(press(wrapper).defaultPrevented).toBe(true)
    expect(onClick).not.toHaveBeenCalled()
  })
})
