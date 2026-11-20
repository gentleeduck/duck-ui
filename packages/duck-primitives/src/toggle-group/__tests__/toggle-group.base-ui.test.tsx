// From Base UI, packages/react/src/toggle-group/ToggleGroup.test.tsx. MIT, see src/__tests__/base-ui/LICENSE.
// A single toggle group here is a radio group, as in Radix, so Base UI's aria-pressed on its items is aria-checked.
// Left out: the warning about items with no value, `data-multiple`, a group switching between single and multiple,
// which Base UI runs only in a browser, and an event it lets a handler cancel.

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { describe, expect, it } from 'vitest'
import { freshDom } from '../../__tests__/dom'
import { DirectionProvider } from '../../direction'
import { ToggleGroup, ToggleGroupItem } from '../index'

freshDom()

function Group(props: Partial<React.ComponentProps<typeof ToggleGroup>>) {
  return (
    <ToggleGroup type="multiple" aria-label="Group" {...(props as object)}>
      <ToggleGroupItem value="one">One</ToggleGroupItem>
      <ToggleGroupItem value="two">Two</ToggleGroupItem>
      <ToggleGroupItem value="three">Three</ToggleGroupItem>
    </ToggleGroup>
  )
}

const item = (name: string) => screen.getByText(name)

describe('Base UI toggle group', () => {
  // Roving focus makes a multiple group a toolbar here, which takes aria-orientation; without it, it is a group.
  it('renders a group, with no aria-orientation on it, once roving focus is off', () => {
    render(<Group orientation="horizontal" rovingFocus={false} />)

    expect(screen.getByRole('group').hasAttribute('aria-orientation')).toBe(false)
  })

  for (const [dir, orientation, next, previous] of [
    ['ltr', 'horizontal', 'ArrowRight', 'ArrowLeft'],
    ['rtl', 'horizontal', 'ArrowLeft', 'ArrowRight'],
    ['ltr', 'vertical', 'ArrowDown', 'ArrowUp'],
    ['rtl', 'vertical', 'ArrowDown', 'ArrowUp'],
  ] as const) {
    it(`moves focus with ${next} and ${previous} in ${dir} ${orientation}`, async () => {
      const user = userEvent.setup()
      render(
        <DirectionProvider dir={dir}>
          <Group orientation={orientation} />
        </DirectionProvider>,
      )
      await user.click(item('One'))

      await user.keyboard(`{${next}}`)
      const forward = document.activeElement
      await user.keyboard(`{${previous}}`)

      expect([forward, document.activeElement]).toEqual([item('Two'), item('One')])
    })
  }

  it('moves focus to the first item on Home and the last on End', async () => {
    const user = userEvent.setup()
    render(<Group />)
    await user.click(item('Two'))

    await user.keyboard('{End}')
    const end = document.activeElement
    await user.keyboard('{Home}')

    expect([end, document.activeElement]).toEqual([item('Three'), item('One')])
  })

  for (const [name, key] of [
    ['Enter', '{Enter}'],
    ['Space', ' '],
  ]) {
    it(`presses and releases an item on ${name}`, async () => {
      const user = userEvent.setup()
      render(<Group />)
      await user.click(item('One'))

      await user.keyboard(key)
      const released = item('One').getAttribute('aria-pressed')
      await user.keyboard(key)

      expect([released, item('One').getAttribute('aria-pressed')]).toEqual(['false', 'true'])
    })
  }

  it('presses one item at a time when single, checking it as a radio', async () => {
    const user = userEvent.setup()
    render(<Group type="single" />)

    await user.click(item('One'))
    await user.click(item('Two'))

    expect(screen.getAllByRole('radio').map((radio) => radio.getAttribute('aria-checked'))).toEqual([
      'false',
      'true',
      'false',
    ])
  })

  it('disables the whole group, or one item', async () => {
    const user = userEvent.setup()
    render(
      <ToggleGroup type="multiple" aria-label="Group">
        <ToggleGroupItem value="one">One</ToggleGroupItem>
        <ToggleGroupItem value="two" disabled>
          Two
        </ToggleGroupItem>
      </ToggleGroup>,
    )

    await user.click(item('Two'))

    expect([item('Two').getAttribute('aria-pressed'), (item('Two') as HTMLButtonElement).disabled]).toEqual([
      'false',
      true,
    ])
  })
})
