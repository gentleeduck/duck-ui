import { afterEach, beforeEach, describe, expect, spyOn, test } from 'bun:test'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { DirectionProvider } from '../../direction'
import { MotionProgress } from '../motion-progress'
import { Progress } from '../progress'

afterEach(cleanup)

describe('registry-ui progress', () => {
  let consoleError: ReturnType<typeof spyOn>

  beforeEach(() => {
    consoleError = spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleError.mockRestore()
  })

  test('fills the share of the bar the value is of max', () => {
    expect(renderToStaticMarkup(<Progress value={30} />)).toContain('width:30%')
    expect(renderToStaticMarkup(<Progress value={50} max={200} />)).toContain('width:25%')
  })

  test('is the primitive progress bar', () => {
    const html = renderToStaticMarkup(<Progress value={30} />)

    expect(html).toContain('role="progressbar"')
    expect(html).toContain('aria-valuenow="30"')
    expect(html).toContain('data-slot="progress-indicator"')
  })

  test('fills and pulses while indeterminate, so the bar shows it is working', () => {
    const html = renderToStaticMarkup(<Progress value={null} />)

    expect(html).toContain('data-state="indeterminate"')
    expect(html).toContain('width:100%')
    expect(html).toContain('animate-pulse')
    expect(renderToStaticMarkup(<Progress value={30} />)).not.toContain('animate-pulse')
  })

  test('fills against the max the primitive falls back to when given one it refuses', () => {
    const html = renderToStaticMarkup(<Progress max={-5} value={30} />)

    expect(html).toContain('aria-valuenow="30"')
    expect(html).toContain('width:30%')
  })

  test('fills from min', () => {
    expect(renderToStaticMarkup(<Progress value={30} min={20} max={70} />)).toContain('width:20%')
  })

  test('fills against the max the primitive falls back to past a min that reaches 100', () => {
    expect(renderToStaticMarkup(<Progress value={100} min={100} />)).toContain('width:0%')
  })

  test('reads a value the progress bar refuses as indeterminate, as the primitive does', () => {
    for (const value of [150, -10, Number.NaN]) {
      const html = renderToStaticMarkup(<Progress value={value} />)

      expect(html).toContain('data-state="indeterminate"')
      expect(html).toContain('animate-pulse')
    }
    expect(renderToStaticMarkup(<Progress value={0} />)).toContain('width:0%')
  })
})

describe('registry-ui motion progress', () => {
  test('fills the primitive indicator, which carries the state', () => {
    const html = renderToStaticMarkup(<MotionProgress value={30} />)

    expect(html).toMatch(/<div[^>]*data-slot="progress-indicator"[^>]*data-state="loading"/)
    expect(html).toContain('aria-valuenow="30"')
  })

  test('fills and pulses while indeterminate, and fills a value against the max the primitive falls back to', async () => {
    const consoleError = spyOn(console, 'error').mockImplementation(() => {})
    render(
      <>
        <MotionProgress aria-label="Waiting" value={null} />
        <MotionProgress aria-label="Copying" max={-5} value={30} />
      </>,
    )
    const bar = (name: string) =>
      screen.getByRole('progressbar', { name }).querySelector<HTMLElement>('[data-slot="progress-indicator"]')

    await waitFor(() => expect(bar('Copying')?.style.transform).toBe('scaleX(0.3)'))
    await waitFor(() => expect(bar('Waiting')?.style.transform).toBe('none'))
    for (let pulse = 0; pulse < 2; pulse++) {
      await waitFor(() => expect(Number(bar('Waiting')?.style.opacity)).toBeGreaterThan(0.95), { timeout: 3000 })
      await waitFor(() => expect(Number(bar('Waiting')?.style.opacity)).toBeLessThan(0.7), { timeout: 3000 })
    }
    consoleError.mockRestore()
  })
})

describe('registry-ui progress direction', () => {
  test('writes no dir of its own, so the bar fills from the side the element around it reads from', () => {
    for (const Bar of [Progress, MotionProgress]) {
      for (const around of ['div', 'provider']) {
        const { unmount } = render(
          around === 'div' ? (
            <div dir="rtl">
              <Bar aria-label="Upload" value={30} />
            </div>
          ) : (
            <DirectionProvider dir="rtl">
              <Bar aria-label="Upload" value={30} />
            </DirectionProvider>
          ),
        )
        const bar = screen.getByRole('progressbar', { name: 'Upload' })

        expect(bar.hasAttribute('dir')).toBe(false)
        expect(bar.closest('[dir]')?.getAttribute('dir')).toBe('rtl')
        unmount()
      }
    }
  })

  test('renders no dir on the server, where it cannot know the direction of the page', () => {
    for (const Bar of [Progress, MotionProgress]) {
      expect(renderToStaticMarkup(<Bar value={30} />).match(/<div[^>]*role="progressbar"[^>]*>/)?.[0]).not.toContain(
        'dir=',
      )
    }
  })

  test('its own dir wins over the provider', () => {
    const html = renderToStaticMarkup(
      <DirectionProvider dir="rtl">
        <Progress dir="ltr" value={30} />
      </DirectionProvider>,
    )

    expect(html.match(/<div[^>]*role="progressbar"[^>]*>/)?.[0]).toContain('dir="ltr"')
  })

  test('grows its bar from the inline start that CSS reads, setting no transform origin of its own', async () => {
    render(<MotionProgress aria-label="Upload" value={30} />)
    const bar = screen.getByRole('progressbar', { name: 'Upload' })
    const fill = bar.querySelector<HTMLElement>('[data-slot="progress-indicator"]')

    await waitFor(() => expect(fill?.style.transform).toBe('scaleX(0.3)'))
    expect(fill?.style.transformOrigin).toBe('')
  })
})
