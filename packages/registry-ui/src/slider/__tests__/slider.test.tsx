import { act, cleanup, render, screen } from '@testing-library/react'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest'
import { MotionSlider } from '../motion-slider'
import { Slider } from '../slider'

// jsdom has no ResizeObserver, which each thumb measures itself with.
beforeAll(() => {
  Object.assign(globalThis, {
    ResizeObserver: class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  })
})
afterAll(() => {
  Reflect.deleteProperty(globalThis, 'ResizeObserver')
})
afterEach(cleanup)

function thumbCount(html: string) {
  return html.split('role="slider"').length - 1
}

describe.each([
  ['Slider', Slider],
  ['MotionSlider', MotionSlider],
] as const)('registry-ui %s', (_, Component) => {
  test('renders one thumb per value', () => {
    expect(thumbCount(renderToStaticMarkup(<Component defaultValue={[20, 80]} />))).toBe(2)
    expect(thumbCount(renderToStaticMarkup(<Component value={[10, 40, 70]} />))).toBe(3)
  })

  test('renders each thumb where its value puts it on the server, before it can find its place', () => {
    const html = renderToStaticMarkup(<Component defaultValue={[20, 80]} />)
    const thumbs = Array.from(html.matchAll(/<span[^>]*role="slider"[^>]*>/g), ([thumb]) => [
      /aria-valuenow="([^"]*)"/.exec(thumb)?.[1],
      thumb.includes('display:none'),
    ])

    expect(thumbs).toEqual([
      ['20', false],
      ['80', false],
    ])
  })

  test('renders one thumb without a value, as the primitive starts with one', () => {
    expect(thumbCount(renderToStaticMarkup(<Component />))).toBe(1)
  })

  test('keeps the slots and orientation the primitive sets', () => {
    const html = renderToStaticMarkup(<Component orientation="vertical" defaultValue={[20]} />)

    for (const slot of ['slider', 'slider-track', 'slider-range', 'slider-thumb']) {
      expect(html).toContain(`data-slot="${slot}"`)
    }
    expect(html.split('data-orientation="vertical"').length - 1).toBe(4)
  })

  test('names its one thumb, where the slider role is, with the label it is given', async () => {
    render(<Component aria-label="Volume" defaultValue={[50]} />)
    await act(async () => {})

    expect(screen.getByRole('slider', { name: 'Volume' })).toBeDefined()
    expect(screen.queryByRole('group')).toBeNull()
  })

  test('names its one thumb by the element aria-labelledby points at', async () => {
    render(
      <>
        <span id="volume-label">Volume</span>
        <Component aria-labelledby="volume-label" defaultValue={[50]} />
      </>,
    )
    await act(async () => {})

    expect(screen.getByRole('slider', { name: 'Volume' })).toBeDefined()
  })

  test('fades a disabled slider once, at its root, so its thumb is as faint as its track', async () => {
    render(<Component aria-label="Volume" defaultValue={[50]} disabled />)
    await act(async () => {})
    const thumb = screen.getByRole('slider')

    expect([
      thumb.closest('[data-slot="slider"]')?.className.includes('data-disabled:opacity-50'),
      thumb.className.includes('opacity'),
    ]).toEqual([true, false])
  })

  test('names a group of thumbs with the label, each thumb keeping its own', async () => {
    render(<Component aria-label="Price" defaultValue={[20, 80]} />)
    await act(async () => {})

    expect(screen.getByRole('group', { name: 'Price' })).toBeDefined()
    expect(screen.getAllByRole('slider').map((thumb) => thumb.getAttribute('aria-label'))).toEqual([
      'Minimum',
      'Maximum',
    ])
  })
})
