import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, test } from 'vitest'
import { MotionButton } from '../motion-button'

afterEach(cleanup)

describe('registry-ui MotionButton', () => {
  test('scales in as a native button, of type button unless told otherwise', () => {
    render(
      <>
        <MotionButton>Save</MotionButton>
        <MotionButton type="submit">Send</MotionButton>
      </>,
    )

    const save = screen.getByRole('button', { name: 'Save' })
    expect(save.getAttribute('type')).toBe('button')
    expect(save.getAttribute('data-slot')).toBe('button')
    expect(save.style.transform).toBe('scaleX(0.95) scaleY(0.95)')
    expect(save.hasAttribute('aria-busy')).toBe(false)
    expect(screen.getByRole('button', { name: 'Send' }).getAttribute('type')).toBe('submit')
  })

  test('swaps its icon for a spinner while loading, and takes no clicks', () => {
    render(
      <MotionButton icon={<svg data-testid="icon" />} loading>
        Save
      </MotionButton>,
    )

    const button = screen.getByRole('button', { name: 'Save' })
    expect(button.getAttribute('aria-busy')).toBe('true')
    expect(button.getAttribute('aria-disabled')).toBe('true')
    expect((button as HTMLButtonElement).disabled).toBe(true)
    expect(button.className.split(' ')).toContain('cursor-not-allowed')
    expect(screen.queryByTestId('icon')).toBeNull()
    expect(button.querySelector('.animate-spin')).not.toBeNull()
  })

  test('shows its icon, and only the icon once collapsed', () => {
    const { rerender } = render(
      <MotionButton aria-label="Share" icon={<svg data-testid="icon" />} secondIcon={<svg data-testid="after" />}>
        Share
      </MotionButton>,
    )

    const button = screen.getByRole('button', { name: 'Share' })
    expect(screen.getByTestId('icon')).toBeTruthy()
    expect(screen.getByTestId('after')).toBeTruthy()
    expect(button.textContent).toBe('Share')

    rerender(
      <MotionButton
        aria-label="Share"
        icon={<svg data-testid="icon" />}
        isCollapsed
        secondIcon={<svg data-testid="after" />}>
        Share
      </MotionButton>,
    )

    expect(screen.getByTestId('icon')).toBeTruthy()
    expect(screen.queryByTestId('after')).toBeNull()
    expect(button.textContent).toBe('')
    expect(button.className.split(' ')).toContain('size-9')
  })

  test('draws on the element it is given, marking it disabled where a link cannot be', async () => {
    render(
      <>
        <MotionButton asChild variant="outline">
          <a href="/ponds">Ponds</a>
        </MotionButton>
        <MotionButton asChild disabled>
          <a href="/lakes">Lakes</a>
        </MotionButton>
      </>,
    )

    const ponds = screen.getByRole('link', { name: 'Ponds' })
    expect(ponds.className.split(' ')).toContain('border')
    expect(ponds.hasAttribute('aria-disabled')).toBe(false)
    const wrapper = ponds.parentElement as HTMLElement
    expect(wrapper.getAttribute('data-slot')).toBe('button')
    expect(wrapper.style.transform).toBe('scaleX(0.95) scaleY(0.95)')

    const lakes = screen.getByRole('link', { name: 'Lakes' })
    expect(lakes.getAttribute('aria-disabled')).toBe('true')
    expect((lakes.parentElement as HTMLElement).className.split(' ')).toContain('cursor-not-allowed')

    await waitFor(() => expect((lakes.parentElement as HTMLElement).style.opacity).toBe('1'))
  })
})
