import { DirectionProvider } from '@gentleduck/primitives/direction'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test } from 'vitest'
import { AspectRatio } from '../aspect-ratio'
import { MotionAspectRatio } from '../motion-aspect-ratio'

afterEach(cleanup)

const RATIOS = [
  ['AspectRatio', AspectRatio],
  ['MotionAspectRatio', MotionAspectRatio],
] as const

describe('registry-ui AspectRatio', () => {
  test.each(RATIOS)('%s holds its only child to the ratio, keeping the child element', (_, Ratio) => {
    render(
      <Ratio className="rounded-md" ratio="16 / 9" style={{ maxWidth: 320 }}>
        <img alt="A duck on the pond" src="duck.jpg" />
      </Ratio>,
    )

    const image = screen.getByRole('img', { name: 'A duck on the pond' })
    expect(image.getAttribute('data-slot')).toBe('aspect-ratio')
    expect(image.style.aspectRatio).toBe('16 / 9')
    expect(image.style.maxWidth).toBe('320px')
    expect(image.className.split(' ')).toEqual(expect.arrayContaining(['overflow-hidden', 'rounded-md']))
  })

  test('takes its direction from a provider', () => {
    render(
      <DirectionProvider dir="rtl">
        <AspectRatio ratio="1">
          <div>Square</div>
        </AspectRatio>
      </DirectionProvider>,
    )

    expect(screen.getByText('Square').getAttribute('dir')).toBe('rtl')
  })

  test('MotionAspectRatio scales the frame in', () => {
    render(
      <MotionAspectRatio ratio="1">
        <div>Square</div>
      </MotionAspectRatio>,
    )

    const frame = screen.getByText('Square').parentElement as HTMLElement
    expect(frame.style.transform).toContain('scale(')
  })
})
