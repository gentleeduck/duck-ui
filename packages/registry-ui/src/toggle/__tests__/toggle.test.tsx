import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import { afterEach, describe, expect, test } from 'vitest'
import { MotionToggle } from '../motion-toggle'
import { Toggle } from '../toggle'

afterEach(cleanup)

describe.each([
  ['Toggle', Toggle],
  ['MotionToggle', MotionToggle],
] as const)('registry-ui %s', (_, Component) => {
  test('renders what a function child returns for the pressed state', async () => {
    render(<Component aria-label="Mute">{(pressed) => (pressed ? 'Muted' : 'Sound on')}</Component>)
    await act(async () => {})
    const toggle = screen.getByRole('button', { name: 'Mute' })
    expect(toggle.textContent).toBe('Sound on')

    fireEvent.click(toggle)

    expect(toggle.textContent).toBe('Muted')
  })

  test('is one button carrying the primitive state and its variant classes', async () => {
    render(
      <Component defaultPressed variant="outline">
        Bold
      </Component>,
    )
    await act(async () => {})
    const toggle = screen.getByRole('button', { name: 'Bold' })

    expect(screen.getAllByRole('button')).toHaveLength(1)
    expect(toggle.getAttribute('data-slot')).toBe('toggle')
    expect(toggle.getAttribute('data-state')).toBe('on')
    expect(toggle.className).toContain('border-input')
  })
})

describe('registry-ui MotionToggle', () => {
  test('each child enters 50ms behind the one before it', async () => {
    render(
      <MotionToggle aria-label="Format">
        {['B', 'I', 'U', 'S', 'X', 'Z'].map((letter) => (
          <span key={letter}>{letter}</span>
        ))}
      </MotionToggle>,
    )
    const opacity = (letter: string) => Number(screen.getByText(letter).parentElement?.style.opacity)

    await act(() => new Promise<void>((resolve) => setTimeout(resolve, 100)))
    await act(() => new Promise<void>((resolve) => setTimeout(resolve, 50)))

    expect(opacity('B')).toBeGreaterThan(0)
    expect(opacity('Z')).toBe(0)
  })

  test('a press releases as fast as it went in, with no spring past full size', async () => {
    render(<MotionToggle aria-label="Bold">B</MotionToggle>)
    const toggle = screen.getByRole('button', { name: 'Bold' })
    const wait = (ms: number) => act(() => new Promise<void>((resolve) => setTimeout(resolve, ms)))
    const mouse = { button: 0, isPrimary: true, pointerType: 'mouse' }
    // LazyMotion loads the press gesture after the first render.
    await wait(100)

    fireEvent.pointerDown(toggle, mouse)
    await wait(60)

    expect(toggle.style.transform).toBe('scale(0.97)')

    fireEvent.pointerUp(window, mouse)
    await wait(60)

    expect(toggle.style.transform).toBe('none')
  })
})
