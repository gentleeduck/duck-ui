import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, test } from 'vitest'
import { MotionAvatarGroup } from '../motion-avatar'

afterEach(cleanup)

const wait = (ms: number) => act(() => new Promise<void>((resolve) => setTimeout(resolve, ms)))

describe('registry-ui MotionAvatarGroup', () => {
  test('each avatar enters 80ms behind the one before it, and the count last', async () => {
    render(<MotionAvatarGroup imgs={[{ alt: 'Ada' }, { alt: 'Grace' }, { alt: 'Alan' }, { alt: 'Edsger' }]} />)
    const opacity = (node: HTMLElement | null | undefined) => Number(node?.style.opacity)
    const first = screen.getByRole('img', { name: 'Ada' }).closest('[data-slot="avatar"]')?.parentElement

    await wait(100)
    await wait(50)

    expect(opacity(first)).toBeGreaterThan(0)
    expect(opacity(screen.getByText('+1'))).toBe(0)

    for (let step = 0; step < 10; step++) await wait(100)

    expect(opacity(screen.getByText('+1'))).toBe(1)
  })

  test('enters every avatar at once for a reader who asks for reduced motion', async () => {
    const matchMedia = window.matchMedia
    window.matchMedia = (query: string) =>
      ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      }) as unknown as MediaQueryList
    try {
      render(<MotionAvatarGroup imgs={[{ alt: 'Ada' }, { alt: 'Grace' }, { alt: 'Alan' }, { alt: 'Edsger' }]} />)
      const first = screen.getByRole('img', { name: 'Ada' }).closest('[data-slot="avatar"]')?.parentElement

      await waitFor(() => expect(Number(first?.style.opacity)).toBe(1))

      expect(Number(screen.getByText('+1').style.opacity)).toBe(1)
    } finally {
      window.matchMedia = matchMedia
    }
  })
})
