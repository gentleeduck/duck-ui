import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, test } from 'vitest'
import { MotionToggleGroup, MotionToggleGroupItem } from '../motion-toggle-group'
import { ToggleGroup, ToggleGroupItem } from '../toggle-group'

afterEach(cleanup)

const INDICATOR = 'absolute inset-0 rounded-[inherit] bg-accent'

describe.each([
  ['ToggleGroup', ToggleGroup, ToggleGroupItem],
  ['MotionToggleGroup', MotionToggleGroup, MotionToggleGroupItem],
] as const)('registry-ui %s', (_, Group, Item) => {
  test('renders what an item function child returns as the value moves', async () => {
    render(
      <Group type="single" defaultValue="left">
        <Item value="left">{(pressed) => (pressed ? 'Left on' : 'Left')}</Item>
        <Item value="right">{(pressed) => (pressed ? 'Right on' : 'Right')}</Item>
      </Group>,
    )
    await act(async () => {})
    expect(screen.getAllByRole('radio').map((item) => item.textContent)).toEqual(['Left on', 'Right'])

    fireEvent.click(screen.getByRole('radio', { name: 'Right' }))

    expect(screen.getAllByRole('radio').map((item) => item.textContent)).toEqual(['Left', 'Right on'])
  })

  test('carries the primitive slots once', async () => {
    render(
      <Group type="multiple">
        <Item value="bold">Bold</Item>
      </Group>,
    )
    await act(async () => {})

    expect(screen.getByRole('toolbar').getAttribute('data-slot')).toBe('toggle-group')
    expect(screen.getByRole('button', { name: 'Bold' }).getAttribute('data-slot')).toBe('toggle-group-item')
  })
})

describe('registry-ui ToggleGroup orientation', () => {
  test('a horizontal group is a row rounded at its start and end, outline items sharing the border between them', () => {
    render(
      <ToggleGroup aria-label="Map" type="single" variant="outline">
        <ToggleGroupItem value="map">Map</ToggleGroupItem>
        <ToggleGroupItem value="satellite">Satellite</ToggleGroupItem>
      </ToggleGroup>,
    )
    const classes = screen.getByRole('radiogroup').className.split(' ')

    expect(classes).toEqual(
      expect.arrayContaining(['*:first:rounded-s-md', '*:last:rounded-e-md', '[&>*:not(:last-child)]:border-e-0']),
    )
    expect(classes).not.toContain('flex-col')
  })

  test('a vertical group is a column rounded at its top and bottom, outline items sharing the border between them', () => {
    render(
      <ToggleGroup aria-label="Map" orientation="vertical" type="single" variant="outline">
        <ToggleGroupItem value="map">Map</ToggleGroupItem>
        <ToggleGroupItem value="satellite">Satellite</ToggleGroupItem>
      </ToggleGroup>,
    )
    const group = screen.getByRole('radiogroup')
    const classes = group.className.split(' ')

    expect(group.getAttribute('aria-orientation')).toBe('vertical')
    expect(classes).toEqual(
      expect.arrayContaining([
        'flex-col',
        '*:first:rounded-t-md',
        '*:last:rounded-b-md',
        '[&>*:not(:last-child)]:border-b-0',
      ]),
    )
    expect(classes).not.toContain('*:first:rounded-s-md')
    expect(classes).not.toContain('[&>*:not(:last-child)]:border-e-0')
  })
})

describe('registry-ui MotionToggleGroupItem', () => {
  test('draws the indicator in the first render, so the server markup has it', () => {
    const html = renderToStaticMarkup(
      <MotionToggleGroup type="single" defaultValue="right">
        <MotionToggleGroupItem value="left">Left</MotionToggleGroupItem>
        <MotionToggleGroupItem value="right">Right</MotionToggleGroupItem>
      </MotionToggleGroup>,
    )

    expect(html.split(INDICATOR)).toHaveLength(2)
    expect(html.indexOf(INDICATOR)).toBeGreaterThan(html.indexOf('Left'))
  })

  test('in a multiple group, each item that is on keeps its own indicator as another turns on', async () => {
    render(
      <MotionToggleGroup defaultValue={['bold', 'italic']} type="multiple">
        <MotionToggleGroupItem value="bold">Bold</MotionToggleGroupItem>
        <MotionToggleGroupItem value="italic">Italic</MotionToggleGroupItem>
        <MotionToggleGroupItem value="underline">Underline</MotionToggleGroupItem>
      </MotionToggleGroup>,
    )
    await act(async () => {})

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Underline' }))
    })
    await act(() => new Promise<void>((resolve) => setTimeout(resolve, 400)))
    const indicators = Array.from(document.querySelectorAll<HTMLElement>('span.absolute.bg-accent'))

    expect(indicators.map((indicator) => indicator.parentElement?.textContent)).toEqual(['Bold', 'Italic', 'Underline'])
    expect(indicators.map((indicator) => indicator.style.opacity)).toEqual(['1', '1', '1'])
  })

  test('moves the one indicator to the item turned on', async () => {
    render(
      <MotionToggleGroup type="single" defaultValue="left">
        <MotionToggleGroupItem value="left">Left</MotionToggleGroupItem>
        <MotionToggleGroupItem value="right">Right</MotionToggleGroupItem>
      </MotionToggleGroup>,
    )
    await act(async () => {})
    const right = screen.getByRole('radio', { name: 'Right' })

    await act(async () => {
      fireEvent.click(right)
    })

    expect(document.querySelectorAll('span.absolute.bg-accent')).toHaveLength(1)
    expect(right.querySelector('span.absolute.bg-accent')).not.toBeNull()
  })
})
