// From Headless UI, packages/@headlessui-react/src/components/radio-group/radio-group.test.tsx. MIT, see
// src/__tests__/headless/LICENSE. Headless UI submits the form on Enter in a group; this one keeps Radix's behavior,
// where only Space checks a radio, and takes string values only, so its object-equality cases do not apply.

import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { freshDom } from '../../__tests__/dom'
import { RadioGroup, RadioGroupItem } from '../index'

freshDom()

const nextTick = () => act(() => new Promise<void>((resolve) => setTimeout(resolve, 0)))
const focused = () => document.activeElement?.textContent

function Delivery({ value, onValueChange }: { value?: string; onValueChange?: (value: string) => void }) {
  return (
    <>
      <button type="button">Before</button>
      <RadioGroup value={value} onValueChange={onValueChange} aria-label="Pizza Delivery">
        <RadioGroupItem value="pickup">Pickup</RadioGroupItem>
        <RadioGroupItem value="home-delivery">Home delivery</RadioGroupItem>
        <RadioGroupItem value="dine-in">Dine in</RadioGroupItem>
      </RadioGroup>
      <button type="button">After</button>
    </>
  )
}

describe('Headless UI radio group rendering', () => {
  it('renders without any item, and without crashing', () => {
    render(<RadioGroup aria-label="Empty" />)

    expect(screen.getByRole('radiogroup')).not.toBeNull()
  })

  it('keeps the order of its items after one unmounts and mounts again', async () => {
    const user = userEvent.setup()
    function Example() {
      const [showFirst, setShowFirst] = React.useState(false)
      return (
        <>
          <button type="button" onClick={() => setShowFirst((shown) => !shown)}>
            Toggle
          </button>
          <RadioGroup aria-label="Pizza Delivery">
            {showFirst ? <RadioGroupItem value="pickup">Pickup</RadioGroupItem> : null}
            <RadioGroupItem value="home-delivery">Home delivery</RadioGroupItem>
            <RadioGroupItem value="dine-in">Dine in</RadioGroupItem>
          </RadioGroup>
        </>
      )
    }
    render(<Example />)
    await user.click(screen.getByText('Toggle'))

    await user.tab()
    const first = focused()
    await user.keyboard('{ArrowUp}')
    await nextTick()
    const looped = focused()
    await user.keyboard('{ArrowUp}')
    await nextTick()

    expect([first, looped, focused()]).toEqual(['Pickup', 'Dine in', 'Home delivery'])
  })

  it('keeps the order of its items after one is taken out and put back while it has focus', async () => {
    const user = userEvent.setup()
    const example = (hide: boolean) => (
      <RadioGroup aria-label="Options">
        <RadioGroupItem value="a">Option 1</RadioGroupItem>
        {hide ? null : <RadioGroupItem value="b">Option 2</RadioGroupItem>}
        <RadioGroupItem value="c">Option 3</RadioGroupItem>
      </RadioGroup>
    )
    const { rerender } = render(example(false))
    await user.tab()
    rerender(example(true))
    rerender(example(false))
    const first = focused()

    await user.keyboard('{ArrowDown}')
    await nextTick()
    const second = focused()
    await user.keyboard('{ArrowDown}')
    await nextTick()

    expect([first, second, focused()]).toEqual(['Option 1', 'Option 2', 'Option 3'])
  })
})

describe('Headless UI radio group Tab and Shift+Tab', () => {
  it('tabs to the first radio with none checked, and checks nothing by focusing it', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<Delivery onValueChange={onValueChange} />)

    await user.tab()
    await user.tab()

    expect([focused(), onValueChange.mock.calls]).toEqual(['Pickup', []])
  })

  it('tabs to the checked radio, and leaves it as it was', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<Delivery value="home-delivery" onValueChange={onValueChange} />)

    await user.tab()
    await user.tab()

    expect([focused(), onValueChange.mock.calls]).toEqual(['Home delivery', []])
  })

  it('tabs out of the group with none checked', async () => {
    const user = userEvent.setup()
    render(<Delivery />)

    const stops: Array<string | undefined> = []
    for (let step = 0; step < 3; step++) {
      await user.tab()
      stops.push(focused())
    }

    expect(stops).toEqual(['Before', 'Pickup', 'After'])
  })

  it('tabs out of the group from the checked radio', async () => {
    const user = userEvent.setup()
    render(<Delivery value="home-delivery" />)

    const stops: Array<string | undefined> = []
    for (let step = 0; step < 3; step++) {
      await user.tab()
      stops.push(focused())
    }

    expect(stops).toEqual(['Before', 'Home delivery', 'After'])
  })

  it('reaches the first radio on Shift+Tab with none checked, and tabs back out of the group', async () => {
    const user = userEvent.setup()
    render(<Delivery />)
    act(() => screen.getByText('After').focus())

    const stops: Array<string | undefined> = []
    for (let step = 0; step < 2; step++) {
      await user.tab({ shift: true })
      stops.push(focused())
    }

    expect(stops).toEqual(['Pickup', 'Before'])
  })

  it('reaches the checked radio on Shift+Tab, and tabs back out of the group', async () => {
    const user = userEvent.setup()
    render(<Delivery value="home-delivery" />)
    act(() => screen.getByText('After').focus())

    const stops: Array<string | undefined> = []
    for (let step = 0; step < 2; step++) {
      await user.tab({ shift: true })
      stops.push(focused())
    }

    expect(stops).toEqual(['Home delivery', 'Before'])
  })
})

describe('Headless UI radio group keys', () => {
  it('checks the radio Space is pressed on, once however often it is pressed', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    function Example() {
      const [value, setValue] = React.useState<string>()
      return (
        <Delivery
          value={value}
          onValueChange={(next) => {
            setValue(next)
            onValueChange(next)
          }}
        />
      )
    }
    render(<Example />)
    await user.tab()
    await user.tab()

    await user.keyboard('     ')

    expect([focused(), onValueChange.mock.calls]).toEqual(['Pickup', [['pickup']]])
  })

  it('checks the radio before on ArrowLeft and ArrowUp, and the one after on ArrowRight and ArrowDown', async () => {
    const onValueChange = vi.fn()
    render(<Delivery value="home-delivery" onValueChange={onValueChange} />)
    const radio = (name: string) => screen.getByText(name)

    for (const [from, key] of [
      ['Home delivery', 'ArrowLeft'],
      ['Home delivery', 'ArrowUp'],
      ['Home delivery', 'ArrowRight'],
      ['Home delivery', 'ArrowDown'],
    ]) {
      act(() => radio(from).focus())
      fireEvent.keyDown(radio(from), { key })
      await nextTick()
    }

    expect(onValueChange.mock.calls).toEqual([['pickup'], ['pickup'], ['dine-in'], ['dine-in']])
  })
})

describe('Headless UI radio group with the mouse', () => {
  it('checks the radio clicked, and does nothing on a click on the checked one', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    function Example() {
      const [value, setValue] = React.useState<string>()
      return (
        <Delivery
          value={value}
          onValueChange={(next) => {
            setValue(next)
            onValueChange(next)
          }}
        />
      )
    }
    render(<Example />)

    await user.click(screen.getByText('Home delivery'))
    await user.click(screen.getByText('Home delivery'))

    expect(onValueChange.mock.calls).toEqual([['home-delivery']])
  })
})

describe('Headless UI radio group in a form', () => {
  it('submits the value it holds', () => {
    const submits: Array<string | null> = []
    render(
      <form
        onSubmit={(event) => {
          event.preventDefault()
          submits.push(new FormData(event.currentTarget).get('delivery') as string | null)
        }}>
        <RadioGroup name="delivery" defaultValue="pickup" aria-label="Pizza Delivery">
          <RadioGroupItem value="pickup">Pickup</RadioGroupItem>
          <RadioGroupItem value="home-delivery">Home delivery</RadioGroupItem>
        </RadioGroup>
        <button type="submit">Submit</button>
      </form>,
    )

    fireEvent.click(screen.getByText('Submit'))
    fireEvent.click(screen.getByText('Home delivery'))
    fireEvent.click(screen.getByText('Submit'))

    expect(submits).toEqual(['pickup', 'home-delivery'])
  })

  it('submits nothing while disabled', () => {
    const submits: Array<string | null> = []
    render(
      <form
        onSubmit={(event) => {
          event.preventDefault()
          submits.push(new FormData(event.currentTarget).get('delivery') as string | null)
        }}>
        <RadioGroup name="delivery" defaultValue="pickup" disabled aria-label="Pizza Delivery">
          <RadioGroupItem value="pickup">Pickup</RadioGroupItem>
        </RadioGroup>
        <button type="submit">Submit</button>
      </form>,
    )

    fireEvent.click(screen.getByText('Submit'))

    expect(submits).toEqual([null])
  })

  it('hands its hidden inputs the form it names', () => {
    render(
      <>
        <form id="outside" />
        <RadioGroup name="delivery" form="outside" aria-label="Pizza Delivery">
          <RadioGroupItem value="pickup">Pickup</RadioGroupItem>
        </RadioGroup>
      </>,
    )

    expect(document.querySelector<HTMLInputElement>('input[name="delivery"]')?.form?.id).toBe('outside')
  })
})
