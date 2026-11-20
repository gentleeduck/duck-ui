// From Headless UI, packages/@headlessui-react/src/components/popover/popover.test.tsx. MIT, see
// src/__tests__/headless/LICENSE. Left out: Popover.Group, the panel's `focus` prop, the warnings about more than one
// button, render props, `as`, `static` and `unmount`, the `anchor` prop and Transition, which have no counterpart
// here; Shift+Tab from inside the panel landing on the button, and Tab out of the panel closing it, where Radix loops
// Tab inside the content; and focus on open landing on the first link, which Radix passes over.

import { act, fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import { describe, expect, it } from 'vitest'
import { clickOutside, freshDom, wait } from '../../__tests__/dom'
import { Popover, PopoverClose, PopoverContent, PopoverPortal, PopoverTrigger } from '../index'

freshDom()

function Example({ name = 'Trigger', disabled }: { name?: string; disabled?: boolean }) {
  return (
    <Popover>
      <PopoverTrigger disabled={disabled}>{name}</PopoverTrigger>
      <PopoverPortal>
        <PopoverContent aria-label={`${name} panel`}>
          <a href="#one">Link {name}</a>
          <PopoverClose>Close {name}</PopoverClose>
        </PopoverContent>
      </PopoverPortal>
    </Popover>
  )
}

const panel = (name = 'Trigger') => screen.queryByRole('dialog', { name: `${name} panel` })

async function key(target: Element, key: string) {
  act(() => (target as HTMLElement).focus())
  fireEvent.keyDown(target, { key })
  fireEvent.keyUp(target, { key })
  if (key === 'Enter' || key === ' ') fireEvent.click(target)
  await wait(0)
}

describe('Headless UI popover safe guards', () => {
  it('renders closed without crashing', () => {
    render(<Example />)

    expect([screen.getByText('Trigger').getAttribute('aria-expanded'), panel()]).toEqual(['false', null])
  })
})

describe('Headless UI popover keys', () => {
  for (const [name, pressed] of [
    ['Enter', 'Enter'],
    ['Space', ' '],
  ]) {
    it(`opens on ${name}, moving focus to its first element that is not a link, and closes on ${name} on its trigger`, async () => {
      render(<Example />)

      await key(screen.getByText('Trigger'), pressed)
      const opened = [panel() !== null, document.activeElement?.textContent]
      await key(screen.getByText('Trigger'), pressed)

      expect([opened, panel()]).toEqual([[true, 'Close Trigger'], null])
    })

    it(`stays closed on ${name} while its trigger is disabled`, async () => {
      render(<Example disabled />)

      await key(screen.getByText('Trigger'), pressed)

      expect(panel()).toBeNull()
    })

    it(`closes another popover as ${name} opens this one`, async () => {
      render(
        <>
          <Example name="A" />
          <Example name="B" />
        </>,
      )
      await key(screen.getByText('A'), pressed)

      await key(screen.getByText('B'), pressed)

      expect([panel('A'), panel('B') !== null]).toEqual([null, true])
    })

    it(`closes on ${name} on a close button inside it, giving focus back to its trigger`, async () => {
      render(<Example />)
      await key(screen.getByText('Trigger'), pressed)

      await key(screen.getByText('Close Trigger'), pressed)

      expect([panel(), document.activeElement?.textContent]).toEqual([null, 'Trigger'])
    })
  }

  it('closes on Escape inside it, giving focus back to its trigger', async () => {
    render(<Example />)
    await key(screen.getByText('Trigger'), 'Enter')

    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' })
    await wait(0)

    expect([panel(), document.activeElement?.textContent]).toEqual([null, 'Trigger'])
  })
})

describe('Headless UI popover with the mouse', () => {
  it('opens on a click, and closes on the next', async () => {
    render(<Example />)

    fireEvent.click(screen.getByText('Trigger'))
    const opened = panel() !== null
    fireEvent.click(screen.getByText('Trigger'))

    expect([opened, panel()]).toEqual([true, null])
  })

  it('stays closed on a click while its trigger is disabled', () => {
    render(<Example disabled />)

    fireEvent.click(screen.getByText('Trigger'))

    expect(panel()).toBeNull()
  })

  it('closes on a press on the page, giving focus back to its trigger', async () => {
    render(<Example />)
    fireEvent.click(screen.getByText('Trigger'))
    await wait(0)

    await clickOutside(document.body)

    expect([panel(), document.activeElement?.textContent]).toEqual([null, 'Trigger'])
  })

  it('closes on a press of another focusable element, leaving focus there', async () => {
    render(
      <>
        <Example />
        <button type="button">Elsewhere</button>
      </>,
    )
    fireEvent.click(screen.getByText('Trigger'))
    await wait(0)

    await clickOutside(screen.getByText('Elsewhere'), { focus: true })

    expect([panel(), document.activeElement?.textContent]).toEqual([null, 'Elsewhere'])
  })

  it('closes on a click of a close button inside it', async () => {
    render(<Example />)
    fireEvent.click(screen.getByText('Trigger'))
    await wait(0)

    fireEvent.click(screen.getByText('Close Trigger'))

    expect(panel()).toBeNull()
  })

  it('stays open on a press of an element inside it', async () => {
    render(<Example />)
    fireEvent.click(screen.getByText('Trigger'))
    await wait(0)

    await clickOutside(screen.getByText('Link Trigger'))

    expect(panel()).not.toBeNull()
  })
})

describe('Headless UI nested popovers', () => {
  it('opens and closes a popover inside another on its own', async () => {
    render(
      <Popover>
        <PopoverTrigger>Outer</PopoverTrigger>
        <PopoverPortal>
          <PopoverContent aria-label="Outer panel">
            <Popover>
              <PopoverTrigger>Inner</PopoverTrigger>
              <PopoverPortal>
                <PopoverContent aria-label="Inner panel">
                  <PopoverClose>Close inner</PopoverClose>
                </PopoverContent>
              </PopoverPortal>
            </Popover>
          </PopoverContent>
        </PopoverPortal>
      </Popover>,
    )
    fireEvent.click(screen.getByText('Outer'))
    await wait(0)

    fireEvent.click(screen.getByText('Inner'))
    await wait(0)
    const both = [panel('Outer') !== null, panel('Inner') !== null]
    fireEvent.click(screen.getByText('Close inner'))
    await wait(0)

    expect([both, panel('Outer') !== null, panel('Inner')]).toEqual([[true, true], true, null])
  })
})
