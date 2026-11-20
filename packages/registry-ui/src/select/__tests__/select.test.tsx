import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'
import { MotionSelect, MotionSelectContent, MotionSelectTrigger } from '../motion-select'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '../select'

// jsdom has no ResizeObserver, which the popper content measures itself with.
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

// An update outside act is one the assertions before it never saw.
let consoleError: ReturnType<typeof vi.spyOn>
beforeEach(() => {
  consoleError = vi.spyOn(console, 'error')
})
afterEach(() => {
  cleanup()
  const outsideAct = consoleError.mock.calls.filter(([message]) => String(message).includes('not wrapped in act'))
  consoleError.mockRestore()
  expect(outsideAct.map(([, name]) => name)).toEqual([])
})

// jsdom has no scrollIntoView, which the content calls when it focuses an item.
Element.prototype.scrollIntoView ??= () => {}

const trigger = (
  <SelectTrigger>
    <SelectValue placeholder="Pick a fruit" />
  </SelectTrigger>
)
const option = (name: string) => screen.getByRole('option', { name })
const highlight = () => document.querySelector<HTMLElement>('[data-slot="select-highlight"]')
// jsdom lays nothing out, so each item is given the box a browser would measure.
const place = (name: string, top: number) =>
  Object.defineProperties(option(name), {
    offsetLeft: { value: 4 },
    offsetTop: { value: top },
    offsetWidth: { value: 120 },
    offsetHeight: { value: 32 },
  })

const items = (
  <>
    <SelectItem value="apple">Apple</SelectItem>
    <SelectItem value="banana">Banana</SelectItem>
    <SelectItem value="cherry">Cherry</SelectItem>
  </>
)

// The open content places itself in a promise, so its first frame is awaited before anything is read.
const placed = () => act(async () => {})

// Strict mode runs each effect twice, which a listener left behind would answer twice.
async function renderOpen(
  select: React.ReactElement = (
    <Select defaultOpen>
      {trigger}
      <SelectContent>{items}</SelectContent>
    </Select>
  ),
) {
  render(<React.StrictMode>{select}</React.StrictMode>)
  place('Apple', 4)
  place('Banana', 36)
  place('Cherry', 68)
  await placed()
}

describe('registry-ui Select highlight', () => {
  test('draws one highlight, hidden from assistive technology, in place on the item the opening content focuses', async () => {
    await renderOpen()

    expect(document.activeElement).toBe(option('Apple'))
    expect(document.querySelectorAll('[data-slot="select-highlight"]')).toHaveLength(1)
    expect(highlight()?.getAttribute('aria-hidden')).toBe('true')
    expect(highlight()?.hasAttribute('data-visible')).toBe(true)
    expect(highlight()?.hasAttribute('data-instant')).toBe(true)
    expect(highlight()?.style.transform).toBe('translate(4px, 4px)')
    expect(highlight()?.style.width).toBe('120px')
    expect(highlight()?.style.height).toBe('32px')
  })

  test('slides from item to item while it is shown', async () => {
    await renderOpen()

    act(() => option('Apple').focus())
    act(() => option('Cherry').focus())

    expect(highlight()?.hasAttribute('data-visible')).toBe(true)
    expect(highlight()?.hasAttribute('data-instant')).toBe(false)
    expect(highlight()?.style.transform).toBe('translate(4px, 68px)')
  })

  test('hides once focus leaves the items, and appears in place again after', async () => {
    await renderOpen()

    act(() => option('Apple').focus())
    act(() => screen.getByRole('listbox').focus())

    expect(highlight()?.hasAttribute('data-visible')).toBe(false)

    act(() => option('Banana').focus())

    expect(highlight()?.hasAttribute('data-instant')).toBe(true)
    expect(highlight()?.style.transform).toBe('translate(4px, 36px)')
  })

  test('slides the same way in MotionSelect', async () => {
    await renderOpen(
      <MotionSelect defaultOpen>
        {trigger}
        <MotionSelectContent>{items}</MotionSelectContent>
      </MotionSelect>,
    )

    act(() => option('Apple').focus())

    expect(highlight()?.hasAttribute('data-instant')).toBe(true)

    act(() => option('Banana').focus())

    expect(highlight()?.hasAttribute('data-instant')).toBe(false)
    expect(highlight()?.style.transform).toBe('translate(4px, 36px)')
  })
})

const wait = (ms: number) => act(() => new Promise<void>((resolve) => setTimeout(resolve, ms)))

const parts: [string, typeof Select, typeof SelectTrigger, typeof SelectContent][] = [
  ['Select', Select, SelectTrigger, SelectContent],
  ['MotionSelect', MotionSelect, MotionSelectTrigger, MotionSelectContent],
]

describe.each(parts)('registry-ui %s', (_, Root, Trigger, Content) => {
  test('a click opens it, and a click on an item picks it and closes it', async () => {
    render(
      <Root>
        <Trigger aria-label="Fruit">
          <SelectValue placeholder="Pick a fruit" />
        </Trigger>
        <Content>{items}</Content>
      </Root>,
    )
    const combobox = screen.getByRole('combobox', { name: 'Fruit' })

    expect(combobox.getAttribute('data-slot')).toBe('select-trigger')
    expect(combobox.hasAttribute('data-placeholder')).toBe(true)
    expect(combobox.textContent).toBe('Pick a fruit')

    fireEvent.click(combobox)
    await placed()
    fireEvent.click(option('Banana'))

    expect(combobox.textContent).toBe('Banana')
    expect(combobox.hasAttribute('data-placeholder')).toBe(false)

    // MotionSelect holds the content for its 180ms exit.
    await wait(250)

    expect(screen.queryByRole('listbox')).toBeNull()
  })

  test('a disabled trigger does not open', () => {
    render(
      <Root disabled>
        <Trigger aria-label="Fruit">
          <SelectValue placeholder="Pick a fruit" />
        </Trigger>
        <Content>{items}</Content>
      </Root>,
    )

    fireEvent.click(screen.getByRole('combobox', { name: 'Fruit' }))

    expect(screen.queryByRole('listbox')).toBeNull()
  })

  test('a label names its group, and a separator between groups is hidden from assistive technology', async () => {
    render(
      <Root defaultOpen>
        <Trigger aria-label="Food">
          <SelectValue placeholder="Pick a food" />
        </Trigger>
        <Content>
          <SelectGroup>
            <SelectLabel>Fruit</SelectLabel>
            {items}
          </SelectGroup>
          <SelectSeparator data-testid="separator" />
          <SelectGroup>
            <SelectLabel>Vegetables</SelectLabel>
            <SelectItem value="leek">Leek</SelectItem>
          </SelectGroup>
        </Content>
      </Root>,
    )
    await placed()

    expect(screen.getByRole('group', { name: 'Fruit' }).contains(option('Cherry'))).toBe(true)
    expect(screen.getByRole('group', { name: 'Vegetables' }).contains(option('Leek'))).toBe(true)
    expect(screen.getByTestId('separator').getAttribute('aria-hidden')).toBe('true')
  })
})
