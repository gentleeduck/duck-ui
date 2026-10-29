import { afterEach, describe, expect, test } from 'bun:test'
import { act, cleanup, render, screen } from '@testing-library/react'
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
})
