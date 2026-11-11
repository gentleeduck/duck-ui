import { afterAll, afterEach, beforeAll, describe, expect, mock, test } from 'bun:test'
import { DirectionProvider } from '@gentleduck/primitives/direction'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import { Combobox, ComboboxGroup, ComboboxItem } from '../combobox'
import { MotionCombobox, MotionComboboxItem } from '../motion-combobox'

// jsdom has no ResizeObserver, which the popover's arrow and the command list measure themselves with.
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

const ponds = [
  { label: 'Mill pond', value: 'mill' },
  { label: 'Lake', value: 'lake' },
  { label: 'Marsh', value: 'marsh' },
] as const

const trigger = () => document.querySelector('[data-slot="popover-trigger"]') as HTMLButtonElement

async function open() {
  await act(async () => {
    fireEvent.click(trigger())
  })
}

async function pick(label: string) {
  await act(async () => {
    fireEvent.click(screen.getByRole('option', { name: label }))
  })
}

function checked(label: string) {
  return (screen.getByRole('option', { name: label }).querySelector('input[type="checkbox"]') as HTMLInputElement)
    .checked
}

describe.each([
  ['Combobox', Combobox, ComboboxItem],
  ['MotionCombobox', MotionCombobox, MotionComboboxItem],
] as const)('registry-ui %s', (_, Root, Item) => {
  test('picks one pond, names it by its label, closes, and clears when picked again', async () => {
    const onValueChange = mock()
    render(
      <Root commandTriggerPlaceholder="Pick a pond" defaultValue="lake" items={ponds} onValueChange={onValueChange}>
        {(items) => items.map((pond) => <Item item={pond} key={pond.value} />)}
      </Root>,
    )

    expect(trigger().textContent).toBe('Lake')
    await open()
    expect(checked('Lake')).toBe(true)
    expect(checked('Marsh')).toBe(false)

    await pick('Marsh')
    expect(onValueChange).toHaveBeenLastCalledWith('marsh')
    expect(trigger().textContent).toBe('Marsh')
    expect(trigger().getAttribute('aria-expanded')).toBe('false')

    await open()
    await pick('Marsh')
    expect(onValueChange).toHaveBeenLastCalledWith('')
    expect(trigger().textContent).toBe('Pick a pond')
  })

  test('picks several ponds, staying open, and folds them into a count past two', async () => {
    const onValueChange = mock()
    render(
      <Root defaultValue={['mill']} items={ponds} onValueChange={onValueChange} type="multiple">
        {(items) => items.map((pond) => <Item item={pond} key={pond.value} />)}
      </Root>,
    )

    expect(trigger().textContent).toBe('Mill pond')
    await open()
    await pick('Lake')
    expect(onValueChange).toHaveBeenLastCalledWith(['mill', 'lake'])
    expect(trigger().getAttribute('aria-expanded')).toBe('true')
    expect(trigger().textContent).toBe('Mill pondLake')

    await pick('Marsh')
    expect(trigger().textContent).toBe('+3 Selected')
    expect(['Mill pond', 'Lake', 'Marsh'].map(checked)).toEqual([true, true, true])

    await pick('Mill pond')
    expect(onValueChange).toHaveBeenLastCalledWith(['lake', 'marsh'])
    expect(checked('Mill pond')).toBe(false)
  })

  test('leaves a controlled value to its owner', async () => {
    const onValueChange = mock()
    render(
      <Root items={ponds} onValueChange={onValueChange} value="mill">
        {(items) => items.map((pond) => <Item item={pond} key={pond.value} />)}
      </Root>,
    )

    await open()
    await pick('Lake')
    expect(onValueChange).toHaveBeenLastCalledWith('lake')
    expect(trigger().textContent).toBe('Mill pond')
  })

  test('starts empty in either mode, and shows only its own trigger content when told to', async () => {
    const { unmount } = render(
      <Root items={ponds} type="multiple">
        {(items) => items.map((pond) => <Item item={pond} key={pond.value} />)}
      </Root>,
    )
    expect(trigger().textContent).toBe('Select item...')
    unmount()

    render(
      <Root
        defaultValue="lake"
        items={ponds}
        popoverTrigger={{ children: 'Pond', variant: 'outline' }}
        showSelected={false}>
        {(items) => items.map((pond) => <Item item={pond} key={pond.value} />)}
      </Root>,
    )
    expect(trigger().textContent).toBe('Pond')
    expect(trigger().className.split(' ')).not.toContain('border-dashed')
  })

  test('passes its parts their props, and says when a search finds nothing', async () => {
    render(
      <DirectionProvider dir="rtl">
        <Root
          commandEmpty="No pond."
          commandInput={{ className: 'tall', placeholder: 'Search ponds' }}
          items={ponds}
          popoverContent={{ className: 'wide' }}>
          {(items) => (
            <ComboboxGroup heading="Ponds">
              {items.map((pond) => (
                <Item item={pond} key={pond.value} />
              ))}
            </ComboboxGroup>
          )}
        </Root>
      </DirectionProvider>,
    )

    expect(trigger().className.split(' ')).toContain('border-dashed')
    await open()
    const search = screen.getByPlaceholderText('Search ponds')
    expect(search.className.split(' ')).toContain('tall')
    expect(search.className.split(' ')).not.toContain('placeholder')
    expect(screen.getByText('Ponds')).toBeTruthy()
    const content = document.querySelector('[data-slot="popover-content"]') as HTMLElement
    expect(content.className.split(' ')).toContain('wide')
    expect(content.getAttribute('dir')).toBe('rtl')

    await act(async () => {
      fireEvent.change(search, { target: { value: 'zzz' } })
    })
    expect(screen.getByText('No pond.')).toBeTruthy()
  })

  test('opens from its popover props, and tells them when a single pick closes it', async () => {
    const onOpenChange = mock()
    render(
      <Root items={ponds} popover={{ defaultOpen: true, onOpenChange }}>
        {(items) => items.map((pond) => <Item item={pond} key={pond.value} />)}
      </Root>,
    )

    expect(trigger().getAttribute('aria-expanded')).toBe('true')
    await pick('Lake')
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
    expect(trigger().getAttribute('aria-expanded')).toBe('false')
  })

  test('leaves the search out when told to', async () => {
    render(
      <Root items={ponds} withSearch={false}>
        {(items) => items.map((pond) => <Item item={pond} key={pond.value} />)}
      </Root>,
    )

    await open()
    expect(screen.queryByRole('combobox')).toBeNull()
    expect(screen.getAllByRole('option')).toHaveLength(3)
  })

  test('works as a plain item outside a combobox, from its own checked and onSelect', async () => {
    const onSelect = mock()
    const { Command, CommandList } = await import('../../command')
    render(
      <Command>
        <CommandList>
          <Item checked item={ponds[0]} onSelect={onSelect} />
          <Item item={ponds[1]} />
        </CommandList>
      </Command>,
    )

    expect(checked('Mill pond')).toBe(true)
    expect(checked('Lake')).toBe(false)
    await pick('Mill pond')
    expect(onSelect).toHaveBeenCalledWith('mill')
    expect(screen.getByRole('option', { name: 'Lake' }).getAttribute('data-value')).toBe('lake')
  })
})
