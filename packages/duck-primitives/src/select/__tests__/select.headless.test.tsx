// From Headless UI, packages/@headlessui-react/src/components/listbox/listbox.test.tsx. MIT, see
// src/__tests__/headless/LICENSE. Its Listbox is a select here. Left out, as Radix behaves otherwise: Tab leaving the
// open list, which Radix keeps in it; ArrowLeft and ArrowRight moving the highlight, where Radix's list is vertical;
// Enter on the closed trigger submitting the form, where it opens the list; and a disabled option taking the focus
// code gives it. Its render props, `as`, `static`, `unmount`, Transition, null and object values, and the equality
// options have no counterpart here.

import { act, fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { clickOutside, freshDom, wait } from '../../__tests__/dom'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemText,
  SelectPortal,
  SelectTrigger,
  SelectValue,
  SelectViewport,
} from '../index'

freshDom()

if (!Element.prototype.scrollIntoView) Element.prototype.scrollIntoView = () => {}
Element.prototype.hasPointerCapture ??= () => false
Element.prototype.releasePointerCapture ??= () => {}

type Option = string | { label: string; disabled: true }
const off = (label: string) => ({ label, disabled: true }) as const

function Listbox({
  options = ['Option A', 'Option B', 'Option C'],
  disabled,
  ...props
}: { options?: Option[] } & Omit<React.ComponentProps<typeof Select>, 'children'>) {
  return (
    <Select disabled={disabled} {...(props as object)}>
      <SelectTrigger aria-label="Trigger">
        <SelectValue placeholder="Pick" />
      </SelectTrigger>
      <SelectPortal>
        <SelectContent>
          <SelectViewport>
            {options.map((option) => {
              const label = typeof option === 'string' ? option : option.label
              return (
                <SelectItem key={label} value={label} disabled={typeof option !== 'string'}>
                  <SelectItemText>{label}</SelectItemText>
                </SelectItem>
              )
            })}
          </SelectViewport>
        </SelectContent>
      </SelectPortal>
    </Select>
  )
}

const trigger = () => screen.getByRole('combobox', { name: 'Trigger' })
const isOpen = () => screen.queryByRole('listbox') !== null
const active = () =>
  document.activeElement?.getAttribute('role') === 'option' ? document.activeElement.textContent : null
const option = (label: string) => screen.getByRole('option', { name: label })

async function openWith(key: string) {
  act(() => trigger().focus())
  fireEvent.keyDown(trigger(), { key })
  await wait(0)
}

async function press(key: string) {
  fireEvent.keyDown(document.activeElement ?? document.body, { key })
  await wait(0)
}

describe('Headless UI listbox safe guards', () => {
  it('renders closed without crashing', () => {
    render(<Listbox />)

    expect([trigger().getAttribute('aria-expanded'), isOpen()]).toEqual(['false', false])
  })

  it('renders in multiple mode without crashing', () => {
    render(<Listbox multiple />)

    expect(trigger().getAttribute('aria-expanded')).toBe('false')
  })
})

describe('Headless UI listbox uncontrolled', () => {
  it('starts on its default value and tells onValueChange each new pick', async () => {
    const onValueChange = vi.fn()
    render(<Listbox defaultValue="Option B" onValueChange={onValueChange} />)
    const start = trigger().textContent

    await openWith('Enter')
    fireEvent.click(option('Option C'))

    expect([start, trigger().textContent, onValueChange.mock.calls]).toEqual(['Option B', 'Option C', [['Option C']]])
  })
})

describe('Headless UI listbox opening from the keyboard', () => {
  for (const [name, key] of [
    ['Enter', 'Enter'],
    ['Space', ' '],
    ['ArrowDown', 'ArrowDown'],
    ['ArrowUp', 'ArrowUp'],
  ]) {
    it(`opens on ${name} with its first option active`, async () => {
      render(<Listbox />)

      await openWith(key)

      expect([isOpen(), active()]).toEqual([true, 'Option A'])
    })

    it(`opens on ${name} on its picked option`, async () => {
      render(<Listbox defaultValue="Option B" />)

      await openWith(key)

      expect(active()).toBe('Option B')
    })

    it(`stays closed on ${name} while disabled`, async () => {
      render(<Listbox disabled />)

      await openWith(key)

      expect(isOpen()).toBe(false)
    })

    it(`opens on ${name} with no option active when it has none`, async () => {
      render(<Listbox options={[]} />)

      await openWith(key)

      expect(active()).toBeNull()
    })

    it(`opens on ${name} on its first option that is not disabled, past several that are`, async () => {
      render(<Listbox options={[off('Option A'), off('Option B'), 'Option C']} />)

      await openWith(key)

      expect(active()).toBe('Option C')
    })
  }
})

describe('Headless UI listbox keys while open', () => {
  for (const [name, key] of [
    ['Enter', 'Enter'],
    ['Space', ' '],
  ]) {
    it(`picks the active option on ${name} and closes, giving focus back to its trigger`, async () => {
      const onValueChange = vi.fn()
      render(<Listbox onValueChange={onValueChange} />)
      await openWith('Enter')
      await press('ArrowDown')

      await press(key)

      expect([onValueChange.mock.calls, isOpen(), document.activeElement]).toEqual([[['Option B']], false, trigger()])
    })
  }

  it('closes on Escape, giving focus back to its trigger', async () => {
    render(<Listbox />)
    await openWith('Enter')

    await press('Escape')

    expect([isOpen(), document.activeElement]).toEqual([false, trigger()])
  })

  it('moves down on ArrowDown and up on ArrowUp, past disabled options', async () => {
    render(<Listbox options={['Option A', off('Option B'), 'Option C', 'Option D']} />)
    await openWith('Enter')

    const seen: Array<string | null> = []
    for (const key of ['ArrowDown', 'ArrowDown', 'ArrowUp', 'ArrowUp']) {
      await press(key)
      seen.push(active())
    }

    expect(seen).toEqual(['Option C', 'Option D', 'Option C', 'Option A'])
  })

  it('stays on its one option that is not disabled on ArrowUp and ArrowDown', async () => {
    render(<Listbox options={[off('Option A'), 'Option B', off('Option C')]} />)
    await openWith('Enter')

    const seen: Array<string | null> = []
    for (const key of ['ArrowDown', 'ArrowUp']) {
      await press(key)
      seen.push(active())
    }

    expect(seen).toEqual(['Option B', 'Option B'])
  })

  for (const [keys, edge] of [
    [['End', 'PageDown'], 'last'],
    [['Home', 'PageUp'], 'first'],
  ] as const) {
    for (const key of keys) {
      it(`moves to the ${edge} option on ${key}, past disabled options`, async () => {
        const options =
          edge === 'last'
            ? ['Option A', 'Option B', 'Option C', off('Option D')]
            : [off('Option A'), 'Option B', 'Option C']
        render(<Listbox options={options} defaultValue={edge === 'first' ? 'Option C' : undefined} />)
        await openWith('Enter')

        await press(key)

        expect(active()).toBe(edge === 'last' ? 'Option C' : 'Option B')
      })
    }
  }
})

describe('Headless UI listbox typeahead', () => {
  const people = ['Alice', 'Bob', 'Charlie', 'Bob Dylan']

  async function type(text: string) {
    for (const key of text) fireEvent.keyDown(document.activeElement ?? document.body, { key })
    await wait(0)
  }

  it('moves to the option a whole word names', async () => {
    render(<Listbox options={people} />)
    await openWith('Enter')

    await type('charlie')

    expect(active()).toBe('Charlie')
  })

  it('moves to the option the start of a word names, whatever the case', async () => {
    render(<Listbox options={people} />)
    await openWith('Enter')

    await type('CH')

    expect(active()).toBe('Charlie')
  })

  it('takes a search with a space in it', async () => {
    render(<Listbox options={people} />)
    await openWith('Enter')

    await type('bob d')

    expect(active()).toBe('Bob Dylan')
  })

  it('passes over a disabled option', async () => {
    render(<Listbox options={['Alice', off('Bob'), 'Charlie']} />)
    await openWith('Enter')

    await type('b')

    expect(active()).toBe('Alice')
  })

  it('stays on its option while the letters typed still match it', async () => {
    render(<Listbox options={people} />)
    await openWith('Enter')

    const seen: Array<string | null> = []
    for (const key of 'bob') {
      await type(key)
      seen.push(active())
    }

    expect(seen).toEqual(['Bob', 'Bob', 'Bob'])
  })
})

describe('Headless UI listbox with the mouse', () => {
  const pressDown = (target: Element, init: { button?: number } = {}) =>
    fireEvent.pointerDown(target, { button: 0, ctrlKey: false, pointerType: 'mouse', ...init })

  it('focuses its trigger on a click of the label naming it', () => {
    render(
      <>
        <label htmlFor="pick">Label</label>
        <Select>
          <SelectTrigger id="pick">
            <SelectValue placeholder="Pick" />
          </SelectTrigger>
        </Select>
      </>,
    )

    fireEvent.click(screen.getByText('Label'))

    expect(document.activeElement?.id).toBe('pick')
  })

  it('opens on a press of its trigger on its picked option', async () => {
    render(<Listbox defaultValue="Option B" />)

    pressDown(trigger())
    await wait(0)

    expect([isOpen(), active()]).toEqual([true, 'Option B'])
  })

  it('stays closed on a right press, and on a press while disabled', () => {
    const { unmount } = render(<Listbox />)
    pressDown(trigger(), { button: 2 })
    const right = isOpen()
    unmount()
    render(<Listbox disabled />)

    pressDown(trigger())

    expect([right, isOpen()]).toEqual([false, false])
  })

  it('opens on a programmatic click of its trigger', async () => {
    render(<Listbox />)

    act(() => trigger().click())
    await wait(0)

    expect(isOpen()).toBe(true)
  })

  it('closes on a press outside it', async () => {
    render(
      <>
        <button type="button">Outside</button>
        <Listbox />
      </>,
    )
    pressDown(trigger())
    await wait(0)

    await clickOutside(screen.getByText('Outside'))

    expect(isOpen()).toBe(false)
  })

  it('makes the option the pointer moves over active, and none once it leaves, passing over a disabled option', async () => {
    render(<Listbox options={['Option A', off('Option B'), 'Option C']} />)
    pressDown(trigger())
    await wait(0)

    fireEvent.pointerMove(option('Option C'), { pointerType: 'mouse' })
    const hovered = active()
    fireEvent.pointerMove(option('Option B'), { pointerType: 'mouse' })
    const overDisabled = active()
    fireEvent.pointerLeave(option('Option C'), { pointerType: 'mouse' })

    expect([hovered, overDisabled, active()]).toEqual(['Option C', null, null])
  })

  it('picks an option clicked and closes, and does nothing on a click of a disabled option', async () => {
    const onValueChange = vi.fn()
    render(<Listbox options={['Option A', off('Option B')]} onValueChange={onValueChange} />)
    pressDown(trigger())
    await wait(0)

    fireEvent.click(option('Option B'))
    const afterDisabled = isOpen()
    fireEvent.click(option('Option A'))

    expect([afterDisabled, onValueChange.mock.calls, isOpen()]).toEqual([true, [['Option A']], false])
  })

  it('makes an option active when it takes focus', async () => {
    render(<Listbox />)
    pressDown(trigger())
    await wait(0)

    act(() => option('Option C').focus())

    expect(active()).toBe('Option C')
  })
})

describe('Headless UI listbox picking many', () => {
  it('opens on its first picked option, stays open as the keyboard picks, and toggles an option clicked', async () => {
    const onValueChange = vi.fn()
    render(<Listbox multiple defaultValue={['Option B', 'Option C']} onValueChange={onValueChange} />)
    await openWith('Enter')
    const opened = active()

    await press('ArrowUp')
    await press('Enter')
    const open = isOpen()
    fireEvent.click(option('Option B'))

    expect([opened, open, onValueChange.mock.calls]).toEqual([
      'Option B',
      true,
      [[['Option B', 'Option C', 'Option A']], [['Option C', 'Option A']]],
    ])
  })
})

describe('Headless UI listbox in a form', () => {
  function Form({ disabled, onSubmit }: { disabled?: boolean; onSubmit: (value: FormDataEntryValue | null) => void }) {
    return (
      <form
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit(new FormData(event.currentTarget).get('delivery'))
        }}>
        <Listbox name="delivery" defaultValue="Option B" disabled={disabled} />
        <button type="submit">Submit</button>
      </form>
    )
  }

  it('submits the value it holds', () => {
    const onSubmit = vi.fn()
    render(<Form onSubmit={onSubmit} />)

    fireEvent.click(screen.getByText('Submit'))

    expect(onSubmit.mock.calls).toEqual([['Option B']])
  })

  it('submits nothing while disabled', () => {
    const onSubmit = vi.fn()
    render(<Form disabled onSubmit={onSubmit} />)

    fireEvent.click(screen.getByText('Submit'))

    expect(onSubmit.mock.calls).toEqual([[null]])
  })

  it('hands its native select the form it names', () => {
    render(
      <>
        <form id="outside" />
        <Listbox name="delivery" form="outside" />
      </>,
    )

    expect(document.querySelector<HTMLSelectElement>('select[name="delivery"]')?.form?.id).toBe('outside')
  })
})
