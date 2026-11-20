import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { freshDom, pageChangesOnClose, wait } from '../../__tests__/dom'
import {
  Select,
  SelectArrow,
  SelectBubbleInput,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectPortal,
  SelectProvider,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectTrigger,
  SelectValue,
  SelectViewport,
} from '../index'

freshDom()

function ControlledSelect({ value, items, children }: { value: string; items: string[]; children?: string }) {
  return (
    <Select value={value}>
      <SelectTrigger>
        <SelectValue placeholder="Choose">{children}</SelectValue>
      </SelectTrigger>
      <SelectPortal>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item} value={item.toLowerCase()}>
              <SelectItemText>{item}</SelectItemText>
            </SelectItem>
          ))}
        </SelectContent>
      </SelectPortal>
    </Select>
  )
}

function renderSelect(props: Record<string, unknown> = {}) {
  return render(
    <Select {...props}>
      <SelectTrigger>
        <SelectValue placeholder="Choose" />
      </SelectTrigger>
      <SelectPortal>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="cherry">Cherry</SelectItem>
        </SelectContent>
      </SelectPortal>
    </Select>,
  )
}

describe('Select', () => {
  it('renders trigger with data-slot="select-trigger"', () => {
    const { container } = renderSelect()
    expect(container.querySelector('[data-slot="select-trigger"]')).not.toBeNull()
  })

  it('trigger has role="combobox"', () => {
    const { container } = renderSelect()
    expect(container.querySelector('[data-slot="select-trigger"]')?.getAttribute('role')).toBe('combobox')
  })

  it('trigger has type="button"', () => {
    const { container } = renderSelect()
    expect(container.querySelector('[data-slot="select-trigger"]')?.getAttribute('type')).toBe('button')
  })

  it('trigger has aria-expanded=false when closed', () => {
    const { container } = renderSelect()
    expect(container.querySelector('[data-slot="select-trigger"]')?.getAttribute('aria-expanded')).toBe('false')
  })

  it('trigger has data-state="closed"', () => {
    const { container } = renderSelect()
    expect(container.querySelector('[data-slot="select-trigger"]')?.getAttribute('data-state')).toBe('closed')
  })

  it('trigger has data-state="open" while open', () => {
    const { container } = renderSelect({ defaultOpen: true })
    expect(container.querySelector('[data-slot="select-trigger"]')?.getAttribute('data-state')).toBe('open')
  })

  it('trigger has aria-autocomplete="none"', () => {
    const { container } = renderSelect()
    expect(container.querySelector('[data-slot="select-trigger"]')?.getAttribute('aria-autocomplete')).toBe('none')
  })

  it('shows placeholder text', () => {
    const { container } = renderSelect()
    expect(container.querySelector('[data-slot="select-value"]')?.textContent).toBe('Choose')
  })

  it('shows data-placeholder when no value selected', () => {
    const { container } = renderSelect()
    expect(container.querySelector('[data-slot="select-trigger"]')?.hasAttribute('data-placeholder')).toBe(true)
  })

  it('disabled trigger has disabled attr', () => {
    const { container } = renderSelect({ disabled: true })
    const trigger = container.querySelector('[data-slot="select-trigger"]') as HTMLButtonElement
    expect(trigger.disabled).toBe(true)
    expect(trigger.getAttribute('data-disabled')).toBe('')
  })

  it('forwards ref to trigger', () => {
    const ref = React.createRef<HTMLButtonElement>()
    render(
      <Select>
        <SelectTrigger ref={ref}>
          <SelectValue />
        </SelectTrigger>
      </Select>,
    )
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  it('calls onOpenChange on trigger keyboard events', () => {
    const handler = vi.fn(() => {})
    const { container } = renderSelect({ onOpenChange: handler })
    fireEvent.keyDown(container.querySelector('[data-slot="select-trigger"]')!, { key: 'ArrowDown' })
    expect(handler).toHaveBeenCalledWith(true)
  })

  it('opens on Enter key', () => {
    const handler = vi.fn(() => {})
    const { container } = renderSelect({ onOpenChange: handler })
    fireEvent.keyDown(container.querySelector('[data-slot="select-trigger"]')!, { key: 'Enter' })
    expect(handler).toHaveBeenCalledWith(true)
  })

  it('opens on Space key', () => {
    const handler = vi.fn(() => {})
    const { container } = renderSelect({ onOpenChange: handler })
    fireEvent.keyDown(container.querySelector('[data-slot="select-trigger"]')!, { key: ' ' })
    expect(handler).toHaveBeenCalledWith(true)
  })

  it('shows selected value instead of placeholder', () => {
    const { container } = renderSelect({ defaultValue: 'banana' })
    expect(container.querySelector('[data-slot="select-trigger"]')?.hasAttribute('data-placeholder')).toBe(false)
  })

  it('value element has data-slot="select-value"', () => {
    const { container } = renderSelect()
    expect(container.querySelector('[data-slot="select-value"]')).not.toBeNull()
  })

  it('value element shows placeholder text', () => {
    const { container } = renderSelect()
    expect(container.querySelector('[data-slot="select-value"]')?.textContent).toBe('Choose')
  })

  it('value element has pointer-events none', () => {
    const { container } = renderSelect()
    const value = container.querySelector('[data-slot="select-value"]') as HTMLElement
    expect(value.style.pointerEvents).toBe('none')
  })

  it('points aria-controls at the content only while it is open', () => {
    const { rerender } = renderSelect()
    const trigger = screen.getByRole('combobox')

    expect(trigger.hasAttribute('aria-controls')).toBe(false)

    rerender(
      <Select open>
        <SelectTrigger>
          <SelectValue placeholder="Choose" />
        </SelectTrigger>
        <SelectPortal>
          <SelectContent>
            <SelectItem value="apple">Apple</SelectItem>
          </SelectContent>
        </SelectPortal>
      </Select>,
    )

    expect(trigger.getAttribute('aria-controls')).toBe(screen.getByRole('listbox', { hidden: true }).id)
  })

  it('passes className to trigger', () => {
    const { container } = render(
      <Select>
        <SelectTrigger className="my-select">
          <SelectValue />
        </SelectTrigger>
      </Select>,
    )
    expect(container.querySelector('.my-select')).not.toBeNull()
  })

  it('sets dir on trigger', () => {
    const { container } = renderSelect({ dir: 'rtl' })
    expect(container.querySelector('[data-slot="select-trigger"]')?.getAttribute('dir')).toBe('rtl')
  })

  it('required select has aria-required', () => {
    const { container } = renderSelect({ required: true })
    expect(container.querySelector('[data-slot="select-trigger"]')?.getAttribute('aria-required')).toBe('true')
  })

  it('shows the placeholder when the value clears', () => {
    const { container, rerender } = render(<ControlledSelect value="apple" items={['Apple', 'Banana']} />)
    const value = container.querySelector('[data-slot="select-value"]')
    expect(value?.textContent).toBe('Apple')

    rerender(<ControlledSelect value="" items={['Apple', 'Banana']} />)

    expect(value?.textContent).toBe('Choose')
  })

  it('shows the placeholder when the picked item leaves in the update that clears the value', () => {
    const { container, rerender } = render(<ControlledSelect value="apple" items={['Apple', 'Banana']} />)
    const value = container.querySelector('[data-slot="select-value"]')
    expect(value?.textContent).toBe('Apple')

    rerender(<ControlledSelect value="" items={['Banana']} />)

    expect(value?.textContent).toBe('Choose')
  })

  it('shows string children given while the picked item text is shown', () => {
    const { container, rerender } = render(<ControlledSelect value="apple" items={['Apple', 'Banana']} />)
    const value = container.querySelector('[data-slot="select-value"]')
    expect(value?.textContent).toBe('Apple')

    rerender(
      <ControlledSelect value="apple" items={['Apple', 'Banana']}>
        Green apple
      </ControlledSelect>,
    )

    expect(value?.textContent).toBe('Green apple')
  })

  it('slots an element child with asChild', () => {
    const { container } = render(
      <Select value="apple">
        <SelectTrigger>
          <SelectValue asChild>
            <b>Green apple</b>
          </SelectValue>
        </SelectTrigger>
      </Select>,
    )

    const value = container.querySelector('[data-slot="select-value"]')
    expect(value?.tagName).toBe('B')
    expect(value?.textContent).toBe('Green apple')
  })

  it('refuses asChild with a render function, which gives it no element to slot onto', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})

    try {
      expect(() =>
        render(
          <Select value="apple">
            <SelectTrigger>
              <SelectValue asChild>{(picks) => picks.join(', ')}</SelectValue>
            </SelectTrigger>
          </Select>,
        ),
      ).toThrow('failed to slot onto its `Slottable`')
    } finally {
      error.mockRestore()
    }
  })
})

const originalScrollIntoView = Element.prototype.scrollIntoView
const originalHasPointerCapture = Element.prototype.hasPointerCapture
const originalReleasePointerCapture = Element.prototype.releasePointerCapture
beforeAll(() => {
  Element.prototype.scrollIntoView = () => {}
  Element.prototype.hasPointerCapture = () => false
  Element.prototype.releasePointerCapture = () => {}
})
afterAll(() => {
  Element.prototype.scrollIntoView = originalScrollIntoView
  Element.prototype.hasPointerCapture = originalHasPointerCapture
  Element.prototype.releasePointerCapture = originalReleasePointerCapture
})

const FRUITS = ['Apple', 'Banana', 'Blackberry', 'Cherry']

function renderFruitSelect(
  props: React.ComponentProps<typeof Select> = {},
  content: React.ReactNode = null,
  container?: HTMLElement,
) {
  render(
    <Select {...props}>
      <SelectTrigger data-testid="trigger">
        <SelectValue data-testid="value" placeholder="Choose" />
      </SelectTrigger>
      <SelectPortal container={container}>
        <SelectContent data-testid="content">
          <SelectScrollUpButton data-testid="scroll-up" />
          <SelectViewport data-testid="viewport">
            {FRUITS.map((fruit) => (
              <SelectItem key={fruit} value={fruit.toLowerCase()} disabled={fruit === 'Blackberry'}>
                <SelectItemText>{fruit}</SelectItemText>
                <SelectItemIndicator data-testid={`${fruit}-indicator`} />
              </SelectItem>
            ))}
          </SelectViewport>
          <SelectScrollDownButton data-testid="scroll-down" />
          {content}
        </SelectContent>
      </SelectPortal>
    </Select>,
    { container },
  )
}

// Keeps the content's exit animation running until the returned function ends it.
function holdExit(content: HTMLElement) {
  let finish = () => {}
  const exit = {
    animationName: 'fade-out',
    finished: new Promise<void>((resolve) => {
      finish = resolve
    }),
    pending: true,
    playState: 'running',
  }
  content.style.animationName = 'fade-out'
  Object.defineProperty(content, 'getAnimations', { value: () => [exit] })
  return () => finish()
}

const option = (name: string) => screen.getByRole('option', { name })
const mouse = { pointerType: 'mouse', pointerId: 1, button: 0, ctrlKey: false }

describe('Select item indicator and arrow', () => {
  it('draws the indicator on the selected item only', () => {
    renderFruitSelect({ defaultValue: 'banana', defaultOpen: true })

    expect(screen.getByTestId('Banana-indicator')).not.toBeNull()
    expect(screen.queryByTestId('Apple-indicator')).toBeNull()
  })

  it('draws no arrow when the content sits over the trigger rather than beside it', () => {
    renderFruitSelect({ defaultValue: 'banana', defaultOpen: true }, <SelectArrow data-testid="arrow" />)

    expect(screen.queryByTestId('arrow')).toBeNull()
  })

  it('draws no arrow while closed, though its content is kept mounted', () => {
    render(
      <Select>
        <SelectTrigger />
        <SelectPortal>
          <SelectContent forceMount position="popper">
            <SelectArrow data-testid="arrow" />
            <SelectViewport />
          </SelectContent>
        </SelectPortal>
      </Select>,
    )

    expect([screen.queryAllByRole('listbox', { hidden: true }).length, screen.queryByTestId('arrow')]).toEqual([
      1,
      null,
    ])
  })
})

describe('Select with the pointer', () => {
  it('opens on a mouse press and claims it', () => {
    renderFruitSelect()

    expect(fireEvent.pointerDown(screen.getByTestId('trigger'), mouse)).toBe(false)
    expect(screen.queryByRole('listbox')).not.toBeNull()
  })

  it('opens nothing on a ctrl press', () => {
    renderFruitSelect()

    fireEvent.pointerDown(screen.getByTestId('trigger'), { ...mouse, ctrlKey: true })

    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('releases the pointer capture the press would otherwise keep on the trigger', () => {
    renderFruitSelect()
    const trigger = screen.getByTestId('trigger')
    const released: number[] = []
    trigger.hasPointerCapture = () => true
    trigger.releasePointerCapture = (id) => released.push(id)

    fireEvent.pointerDown(trigger, { ...mouse, pointerId: 7 })

    expect(released).toEqual([7])
  })

  it('keeps the item under the pointer when the opening press is released without moving', () => {
    const onValueChange = vi.fn()
    renderFruitSelect({ onValueChange })
    fireEvent.pointerDown(screen.getByTestId('trigger'), { ...mouse, clientX: 10, clientY: 10 })
    fireEvent.pointerMove(option('Banana'), mouse)

    fireEvent.pointerUp(option('Banana'), { ...mouse, clientX: 10, clientY: 10 })

    expect(onValueChange).not.toHaveBeenCalled()
    expect(screen.queryByRole('listbox')).not.toBeNull()
  })

  it('selects the item a press is dragged onto and released over', () => {
    const onValueChange = vi.fn()
    renderFruitSelect({ onValueChange })
    fireEvent.pointerDown(screen.getByTestId('trigger'), { ...mouse, clientX: 10, clientY: 10 })

    fireEvent.pointerMove(option('Cherry'), { ...mouse, clientX: 10, clientY: 60 })
    fireEvent.pointerUp(option('Cherry'), { ...mouse, clientX: 10, clientY: 60 })

    expect(onValueChange.mock.calls).toEqual([['cherry']])
  })

  it('closes when a dragged press is released outside the content', () => {
    renderFruitSelect()
    fireEvent.pointerDown(screen.getByTestId('trigger'), { ...mouse, clientX: 10, clientY: 10 })

    fireEvent.pointerMove(document, { ...mouse, clientX: 60, clientY: 10 })
    fireEvent.pointerUp(document.body, { ...mouse, clientX: 60, clientY: 10 })

    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('selects an item on a tap, where a mouse selects on release', () => {
    const onValueChange = vi.fn()
    renderFruitSelect({ defaultOpen: true, onValueChange })

    fireEvent.pointerDown(option('Cherry'), { pointerType: 'touch' })
    fireEvent.pointerUp(option('Cherry'), { pointerType: 'touch' })
    expect(onValueChange).not.toHaveBeenCalled()

    fireEvent.click(option('Cherry'))
    expect(onValueChange.mock.calls).toEqual([['cherry']])
  })

  it('stays shut on a press while disabled', () => {
    renderFruitSelect({ disabled: true })

    fireEvent.pointerDown(screen.getByTestId('trigger'), mouse)

    expect(screen.queryByRole('listbox')).toBeNull()
  })

  const presses: Array<[string, (trigger: HTMLElement) => void]> = [
    ['a mouse press', (trigger) => fireEvent.pointerDown(trigger, mouse)],
    [
      'a tap',
      (trigger) => {
        fireEvent.pointerDown(trigger, { pointerType: 'touch' })
        fireEvent.click(trigger)
      },
    ],
    ['a key', (trigger) => fireEvent.keyDown(trigger, { key: 'Enter' })],
  ]
  for (const [how, press] of presses) {
    it(`stays shut on ${how} inside a disabled fieldset, as a native select does`, () => {
      render(
        <fieldset disabled>
          <Select>
            <SelectTrigger data-testid="trigger">
              <SelectValue placeholder="Choose" />
            </SelectTrigger>
            <SelectPortal>
              <SelectContent>
                <SelectItem value="apple">
                  <SelectItemText>Apple</SelectItemText>
                </SelectItem>
              </SelectContent>
            </SelectPortal>
          </Select>
        </fieldset>,
      )

      press(screen.getByTestId('trigger'))

      expect(screen.queryByRole('listbox')).toBeNull()
    })
  }

  it('takes the click after a mouse press as part of that press, so the next keyboard open selects on release', async () => {
    const onValueChange = vi.fn()
    renderFruitSelect({ onValueChange })
    const trigger = screen.getByTestId('trigger')
    const at = { ...mouse, clientX: 10, clientY: 10 }
    fireEvent.pointerDown(trigger, at)
    fireEvent.pointerUp(trigger, at)
    fireEvent.click(trigger, at)
    fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Escape' })
    fireEvent.keyDown(trigger, { key: 'Enter' })
    await wait(0)

    fireEvent.pointerMove(option('Cherry'), at)
    fireEvent.pointerUp(option('Cherry'), at)

    expect(onValueChange.mock.calls).toEqual([['cherry']])
  })

  it('leaves selecting to the release when a mouse clicks an item', () => {
    const onValueChange = vi.fn()
    renderFruitSelect({ defaultOpen: true, onValueChange })

    fireEvent.pointerDown(option('Cherry'), mouse)
    fireEvent.click(option('Cherry'))

    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('leaves focus alone when a touch moves over an item', async () => {
    renderFruitSelect({ defaultOpen: true })
    await wait(0)

    fireEvent.pointerMove(option('Cherry'), { pointerType: 'touch' })

    expect(document.activeElement?.textContent).toBe('Apple')
  })

  it('keeps focus on an item when the mouse leaves another', () => {
    renderFruitSelect({ defaultOpen: true })
    fireEvent.pointerMove(option('Cherry'), mouse)

    fireEvent.pointerLeave(option('Apple'), mouse)

    expect(document.activeElement).toBe(option('Cherry'))
  })

  it('focuses the item a mouse moves over', () => {
    renderFruitSelect({ defaultOpen: true })

    fireEvent.pointerMove(option('Cherry'), mouse)

    expect(document.activeElement).toBe(option('Cherry'))
  })

  it('hands focus back to the list when the mouse moves onto a disabled item', () => {
    renderFruitSelect({ defaultOpen: true })
    fireEvent.pointerMove(option('Cherry'), mouse)

    fireEvent.pointerMove(option('Blackberry'), mouse)

    expect(document.activeElement).toBe(screen.getByRole('listbox'))
  })

  it('hands focus back to the list when the mouse leaves the focused item', () => {
    renderFruitSelect({ defaultOpen: true })
    fireEvent.pointerMove(option('Cherry'), mouse)

    fireEvent.pointerLeave(option('Cherry'), mouse)

    expect(document.activeElement).toBe(screen.getByRole('listbox'))
  })
})

describe('Select keyboard on the trigger', () => {
  it('picks the next item after the selected one that a typed letter starts', () => {
    const onValueChange = vi.fn()
    render(
      <Select defaultValue="apple" onValueChange={onValueChange}>
        <SelectTrigger data-testid="trigger">
          <SelectValue />
        </SelectTrigger>
        <SelectPortal>
          <SelectContent>
            <SelectViewport>
              {['Apple', 'Avocado', 'Banana'].map((fruit) => (
                <SelectItem key={fruit} value={fruit.toLowerCase()}>
                  <SelectItemText>{fruit}</SelectItemText>
                </SelectItem>
              ))}
            </SelectViewport>
          </SelectContent>
        </SelectPortal>
      </Select>,
    )

    fireEvent.keyDown(screen.getByTestId('trigger'), { key: 'a' })

    expect(onValueChange.mock.calls).toEqual([['avocado']])
  })

  it('steps on from its last match when the owner keeps the value', () => {
    const onValueChange = vi.fn()
    render(
      <Select value="" onValueChange={onValueChange}>
        <SelectTrigger data-testid="trigger">
          <SelectValue />
        </SelectTrigger>
        <SelectPortal>
          <SelectContent>
            <SelectViewport>
              {['Apple', 'Avocado', 'Banana'].map((fruit) => (
                <SelectItem key={fruit} value={fruit.toLowerCase()}>
                  <SelectItemText>{fruit}</SelectItemText>
                </SelectItem>
              ))}
            </SelectViewport>
          </SelectContent>
        </SelectPortal>
      </Select>,
    )

    fireEvent.keyDown(screen.getByTestId('trigger'), { key: 'a' })
    fireEvent.keyDown(screen.getByTestId('trigger'), { key: 'a' })

    expect(onValueChange.mock.calls).toEqual([['apple'], ['avocado']])
  })

  it('takes a space typed as part of a search as part of it, not as a key that opens', () => {
    const onValueChange = vi.fn()
    renderFruitSelect({ onValueChange })
    const trigger = screen.getByTestId('trigger')

    fireEvent.keyDown(trigger, { key: 'b' })
    fireEvent.keyDown(trigger, { key: ' ' })

    expect([onValueChange.mock.calls, screen.queryByRole('listbox')]).toEqual([[['banana']], null])
  })
})

describe('Select keyboard in the list', () => {
  it('focuses the item a typed letter starts', async () => {
    renderFruitSelect({ defaultValue: 'apple', defaultOpen: true })
    await wait(0)

    fireEvent.keyDown(option('Apple'), { key: 'c' })
    await wait(0)

    expect(document.activeElement).toBe(option('Cherry'))
  })

  it('keeps Tab from leaving the list', async () => {
    renderFruitSelect({ defaultOpen: true })
    await wait(0)

    expect(fireEvent.keyDown(option('Apple'), { key: 'Tab' })).toBe(false)
  })

  it('moves to the last item on Shift+G, rather than searching for a G', async () => {
    render(
      <Select defaultOpen>
        <SelectTrigger>
          <SelectValue placeholder="Choose" />
        </SelectTrigger>
        <SelectPortal>
          <SelectContent>
            <SelectViewport>
              {['Apple', 'Grape', 'Cherry'].map((fruit) => (
                <SelectItem key={fruit} value={fruit.toLowerCase()}>
                  <SelectItemText>{fruit}</SelectItemText>
                </SelectItem>
              ))}
            </SelectViewport>
          </SelectContent>
        </SelectPortal>
      </Select>,
    )
    await wait(0)

    fireEvent.keyDown(option('Apple'), { key: 'G', shiftKey: true })
    await wait(0)

    expect(document.activeElement).toBe(option('Cherry'))
  })

  it('selects with Space and keeps the page from scrolling', async () => {
    const onValueChange = vi.fn()
    renderFruitSelect({ defaultOpen: true, onValueChange })
    await wait(0)

    const notPrevented = fireEvent.keyDown(option('Cherry'), { key: ' ' })

    expect([notPrevented, onValueChange.mock.calls]).toEqual([false, [['cherry']]])
  })

  it('takes a space typed as part of a search as part of it, not as a select', async () => {
    const onValueChange = vi.fn()
    renderFruitSelect({ defaultOpen: true, onValueChange })
    await wait(0)

    fireEvent.keyDown(option('Apple'), { key: 'b' })
    await wait(0)
    fireEvent.keyDown(option('Banana'), { key: ' ' })

    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('moves with the arrows past the disabled item, and to the ends with Home and End', async () => {
    renderFruitSelect({ defaultValue: 'apple', defaultOpen: true })
    await wait(0)
    const press = async (key: string) => {
      const prevented = !fireEvent.keyDown(document.activeElement as Element, { key })
      await wait(0)
      return [prevented, document.activeElement?.textContent]
    }

    expect(await press('ArrowDown')).toEqual([true, 'Banana'])
    expect(await press('ArrowDown')).toEqual([true, 'Cherry'])
    expect(await press('ArrowUp')).toEqual([true, 'Banana'])
    expect(await press('End')).toEqual([true, 'Cherry'])
    expect(await press('Home')).toEqual([true, 'Apple'])
  })
})

function Plain({ children }: { children?: React.ReactNode }) {
  return <div>{children}</div>
}

describe('Select items whose element never takes the ref', () => {
  function renderPlainItems(props: React.ComponentProps<typeof Select> = {}) {
    render(
      <Select {...props}>
        <SelectTrigger data-testid="trigger">
          <SelectValue placeholder="Choose" />
        </SelectTrigger>
        <SelectPortal>
          <SelectContent>
            <SelectViewport>
              <SelectItem value="apple">
                <SelectItemText>Apple</SelectItemText>
              </SelectItem>
              <SelectItem asChild value="kiwi">
                <Plain>
                  <SelectItemText>Kiwi</SelectItemText>
                </Plain>
              </SelectItem>
              <SelectItem asChild value="lime">
                <Plain>Lime</Plain>
              </SelectItem>
            </SelectViewport>
          </SelectContent>
        </SelectPortal>
      </Select>,
    )
  }

  it('leave focus where it is when a typed letter matches one', async () => {
    renderPlainItems({ defaultOpen: true })
    await wait(0)

    fireEvent.keyDown(option('Apple'), { key: 'k' })
    await wait(0)

    expect(document.activeElement).toBe(option('Apple'))
  })

  it('are passed over by a search when they show no text the list can read', async () => {
    renderPlainItems({ defaultOpen: true })
    await wait(0)

    fireEvent.keyDown(option('Apple'), { key: 'l' })
    await wait(0)

    expect(document.activeElement).toBe(option('Apple'))
  })

  it('are passed over by a search on the closed trigger when they show no text it can read', () => {
    const onValueChange = vi.fn()
    renderPlainItems({ onValueChange })

    fireEvent.keyDown(screen.getByTestId('trigger'), { key: 'l' })

    expect(onValueChange).not.toHaveBeenCalled()
  })
})

describe('Select typeahead text', () => {
  function renderLabels(second: React.ReactNode) {
    render(
      <Select defaultOpen>
        <SelectTrigger>
          <SelectValue placeholder="Choose" />
        </SelectTrigger>
        <SelectPortal>
          <SelectContent>
            <SelectViewport>
              <SelectItem value="apple">
                <SelectItemText>Apple</SelectItemText>
              </SelectItem>
              {second}
            </SelectViewport>
          </SelectContent>
        </SelectPortal>
      </Select>,
    )
  }

  async function typeFromApple(key: string) {
    await wait(0)
    fireEvent.keyDown(option('Apple'), { key })
    await wait(0)
    return document.activeElement?.getAttribute('data-value') ?? document.activeElement?.textContent
  }

  it('finds an item by the label it shows now, not the one it mounted with', async () => {
    function LateLabel() {
      const [label, setLabel] = React.useState('Banana')
      React.useEffect(() => setLabel('Cherry'), [])
      return (
        <SelectItem value="fruit">
          <SelectItemText>{label}</SelectItemText>
        </SelectItem>
      )
    }
    renderLabels(<LateLabel />)

    expect(await typeFromApple('c')).toBe('Cherry')
  })

  it('finds an item by the textValue it has now, not the one it mounted with', async () => {
    function LateTextValue() {
      const [textValue, setTextValue] = React.useState('Banana')
      React.useEffect(() => setTextValue('Cherry'), [])
      return (
        <SelectItem value="fruit" textValue={textValue}>
          <SelectItemText>Fruit</SelectItemText>
        </SelectItem>
      )
    }
    renderLabels(<LateTextValue />)

    expect(await typeFromApple('c')).toBe('Fruit')
  })

  it('matches the item text rather than the rest of the item', async () => {
    renderLabels(
      <SelectItem value="fruit">
        <span>Sweet</span>
        <SelectItemText>Cherry</SelectItemText>
      </SelectItem>,
    )

    expect(await typeFromApple('c')).toBe('SweetCherry')
  })

  it('reads the whole item when its item text shows nothing', async () => {
    renderLabels(
      <SelectItem value="fruit">
        <SelectItemText />
        Cherry
      </SelectItem>,
    )

    expect(await typeFromApple('c')).toBe('Cherry')
  })
})

function mockRect(element: Element, rect: DOMRect) {
  element.getBoundingClientRect = () => rect
}

describe('Select item-aligned position', () => {
  it('lines the selected item text up under the value from the right, right to left', async () => {
    renderFruitSelect({ defaultValue: 'banana', dir: 'rtl' })
    mockRect(screen.getByTestId('trigger'), new DOMRect(800, 100, 100, 40))
    mockRect(screen.getByTestId('value'), new DOMRect(820, 110, 60, 20))

    fireEvent.keyDown(screen.getByTestId('trigger'), { key: 'Enter' })
    await wait(0)

    const wrapper = screen.getByTestId('content').parentElement?.style
    expect([wrapper?.right, wrapper?.minWidth]).toEqual(['144px', '80px'])
  })
})

const ITEM_HEIGHT = 30
const geometry: Record<string, (element: HTMLElement) => number> = {
  offsetTop: (element) =>
    element.getAttribute('role') === 'option' ? FRUITS.indexOf(element.textContent ?? '') * ITEM_HEIGHT : 0,
  offsetHeight: (element) => (element.getAttribute('role') === 'option' ? ITEM_HEIGHT : 0),
  scrollHeight: (element) => (element.dataset.testid === 'viewport' ? FRUITS.length * ITEM_HEIGHT : 0),
  clientHeight: (element) => (element.dataset.testid === 'viewport' ? 2 * ITEM_HEIGHT : 0),
}

// jsdom reports an unstyled border as `medium`, which parses to NaN, where a browser reports `0px`.
const originalGetComputedStyle = window.getComputedStyle
function getComputedStyleWithZeroBorders(element: Element) {
  const style = originalGetComputedStyle.call(window, element)
  return new Proxy(style, {
    get: (target, name) => {
      const value = Reflect.get(target, name)
      return value === 'medium' ? '0px' : typeof value === 'function' ? value.bind(target) : value
    },
  })
}

describe('Select with a list taller than its viewport', () => {
  // react-remove-scroll's scroll handler reads a global ShadowRoot, which only jsdom's window has unless the radix
  // harness was imported first.
  const hadShadowRoot = 'ShadowRoot' in globalThis
  beforeAll(() => {
    if (!hadShadowRoot) Object.assign(globalThis, { ShadowRoot: window.ShadowRoot })
    window.getComputedStyle = getComputedStyleWithZeroBorders as typeof getComputedStyle
    for (const [name, measure] of Object.entries(geometry)) {
      Object.defineProperty(HTMLElement.prototype, name, {
        configurable: true,
        get() {
          return measure(this)
        },
      })
    }
  })
  afterAll(() => {
    window.getComputedStyle = originalGetComputedStyle
    if (!hadShadowRoot) Reflect.deleteProperty(globalThis, 'ShadowRoot')
    for (const name of Object.keys(geometry)) Reflect.deleteProperty(HTMLElement.prototype, name)
  })

  function openBananaUnder(triggerRect: DOMRect) {
    renderFruitSelect({ defaultValue: 'banana' })
    mockRect(screen.getByTestId('trigger'), triggerRect)
    fireEvent.keyDown(screen.getByTestId('trigger'), { key: 'Enter' })
  }

  const viewport = () => screen.getByTestId('viewport')
  const wrapper = () => screen.getByTestId('content').parentElement as HTMLElement

  it('pins the list to the top and scrolls the selected item level with the trigger when it would overflow the top', async () => {
    openBananaUnder(new DOMRect(0, 0, 100, 40))
    await wait(0)

    expect(wrapper().style.top).toBe('0px')
    expect(viewport().scrollTop).toBe(35)
  })

  it('scrolls down an item at a time while the pointer rests on the scroll-down button', async () => {
    openBananaUnder(new DOMRect(0, 300, 100, 40))
    expect(screen.queryByTestId('scroll-up')).toBeNull()

    fireEvent.pointerMove(screen.getByTestId('scroll-down'), mouse)
    fireEvent.pointerMove(screen.getByTestId('scroll-down'), mouse)
    await wait(75)
    expect(viewport().scrollTop).toBe(ITEM_HEIGHT)

    fireEvent.pointerLeave(screen.getByTestId('scroll-down'), mouse)
    await wait(150)
    expect(viewport().scrollTop).toBe(ITEM_HEIGHT)
  })

  it('shows the scroll-up button once scrolled, and scrolls up while it is pressed', async () => {
    openBananaUnder(new DOMRect(0, 300, 100, 40))
    viewport().scrollTop = 2 * ITEM_HEIGHT
    fireEvent.scroll(viewport())
    expect(screen.queryByTestId('scroll-down')).toBeNull()

    fireEvent.pointerDown(screen.getByTestId('scroll-up'), mouse)
    await wait(75)
    fireEvent.pointerLeave(screen.getByTestId('scroll-up'), mouse)

    expect(viewport().scrollTop).toBe(ITEM_HEIGHT)
  })

  it('grows with what the list is scrolled by, pinned to the bottom, up to the window less its margins', async () => {
    openBananaUnder(new DOMRect(0, 300, 100, 40))
    await wait(50)
    const before = Number.parseFloat(wrapper().style.height)

    viewport().scrollTop = 30
    fireEvent.scroll(viewport())
    expect([Number.parseFloat(wrapper().style.height) - before, viewport().scrollTop]).toEqual([30, 0])
    expect(wrapper().style.justifyContent).toBe('flex-end')

    viewport().scrollTop = 2000
    fireEvent.scroll(viewport())
    expect(wrapper().style.height).toBe(`${window.innerHeight - 20}px`)
    expect(viewport().scrollTop).toBe(before + 30 + 2000 - (window.innerHeight - 20))
  })

  it('stops growing at the window less its margins, leaving any further scroll to the list', async () => {
    openBananaUnder(new DOMRect(0, 300, 100, 40))
    await wait(50)
    viewport().scrollTop = 2000
    fireEvent.scroll(viewport())

    viewport().scrollTop = 2030
    fireEvent.scroll(viewport())

    expect([wrapper().style.height, viewport().scrollTop]).toEqual([`${window.innerHeight - 20}px`, 2030])
  })

  it('keeps its height and its place on a scroll event that scrolled nothing', async () => {
    openBananaUnder(new DOMRect(0, 300, 100, 40))
    await wait(50)
    const before = wrapper().style.height

    fireEvent.scroll(viewport())

    expect([wrapper().style.height, wrapper().style.justifyContent]).toEqual([before, ''])
  })

  it('grows without pinning to the bottom when it opened pinned to the top', async () => {
    openBananaUnder(new DOMRect(0, 0, 100, 40))
    // A browser reports the scroll that placed the selected item, before growing is armed.
    fireEvent.scroll(viewport())
    await wait(50)
    const before = Number.parseFloat(wrapper().style.height)

    viewport().scrollTop = 65
    fireEvent.scroll(viewport())

    expect([Number.parseFloat(wrapper().style.height) > before, wrapper().style.justifyContent]).toEqual([true, ''])
  })

  it('scrolls once per tick while the pointer both rests on and presses the scroll-down button', async () => {
    openBananaUnder(new DOMRect(0, 300, 100, 40))
    const scrollDown = screen.getByTestId('scroll-down')

    fireEvent.pointerMove(scrollDown, mouse)
    fireEvent.pointerDown(scrollDown, mouse)
    await wait(75)
    fireEvent.pointerLeave(scrollDown, mouse)
    await wait(75)

    expect(viewport().scrollTop).toBe(ITEM_HEIGHT)
  })

  it('scrolls nothing either way once the item it scrolls by has left the list', async () => {
    function Fruits({ fruits }: { fruits: string[] }) {
      return (
        <Select defaultValue="banana" defaultOpen>
          <SelectTrigger data-testid="trigger">
            <SelectValue data-testid="value" placeholder="Choose" />
          </SelectTrigger>
          <SelectPortal>
            <SelectContent data-testid="content">
              <SelectScrollUpButton data-testid="scroll-up" />
              <SelectViewport data-testid="viewport">
                {fruits.map((fruit) => (
                  <SelectItem key={fruit} value={fruit.toLowerCase()}>
                    <SelectItemText>{fruit}</SelectItemText>
                  </SelectItem>
                ))}
              </SelectViewport>
              <SelectScrollDownButton data-testid="scroll-down" />
            </SelectContent>
          </SelectPortal>
        </Select>
      )
    }
    const { rerender } = render(<Fruits fruits={FRUITS} />)
    await wait(0)
    rerender(<Fruits fruits={['Apple', 'Cherry']} />)
    viewport().scrollTop = ITEM_HEIGHT
    fireEvent.scroll(viewport())
    const scrolledFrom = viewport().scrollTop

    for (const button of ['scroll-up', 'scroll-down']) {
      fireEvent.pointerMove(screen.getByTestId(button), mouse)
      await wait(75)
      fireEvent.pointerLeave(screen.getByTestId(button), mouse)
    }

    expect([scrolledFrom, viewport().scrollTop]).toEqual([ITEM_HEIGHT, ITEM_HEIGHT])
  })

  for (const where of ['the page', 'a shadow root'] as const) {
    it(`keeps the focused item in view when a scroll button appears, in ${where}`, () => {
      const host = document.body.appendChild(document.createElement('div'))
      const container =
        where === 'a shadow root'
          ? host.attachShadow({ mode: 'open' }).appendChild(document.createElement('div'))
          : host
      renderFruitSelect({ defaultValue: 'banana' }, null, container)
      const scope = within(container)
      mockRect(scope.getByTestId('trigger'), new DOMRect(0, 300, 100, 40))
      // Scrolled before the next frame, which lets a scroll grow the list and take the scroll back.
      fireEvent.keyDown(scope.getByTestId('trigger'), { key: 'Enter' })
      const scrolledIntoView: Array<string | null> = []
      Element.prototype.scrollIntoView = function (this: Element) {
        scrolledIntoView.push(this.textContent)
      }

      scope.getByTestId('viewport').scrollTop = 2 * ITEM_HEIGHT
      fireEvent.scroll(scope.getByTestId('viewport'))

      Element.prototype.scrollIntoView = () => {}
      expect(scrolledIntoView).toEqual(['Banana'])
      host.remove()
    })
  }

  it('focuses the picked item again when its first scroll button appears after it opened', async () => {
    function Fruits({ fruits }: { fruits: string[] }) {
      return (
        <Select defaultValue="banana">
          <SelectTrigger data-testid="trigger">
            <SelectValue placeholder="Choose" />
          </SelectTrigger>
          <SelectPortal>
            <SelectContent data-testid="content">
              <SelectViewport data-testid="viewport">
                {fruits.map((fruit) => (
                  <SelectItem key={fruit} value={fruit.toLowerCase()}>
                    <SelectItemText>{fruit}</SelectItemText>
                  </SelectItem>
                ))}
              </SelectViewport>
              <SelectScrollDownButton data-testid="scroll-down" />
            </SelectContent>
          </SelectPortal>
        </Select>
      )
    }
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
      configurable: true,
      get() {
        return this.dataset.testid === 'viewport' ? this.querySelectorAll('[role="option"]').length * ITEM_HEIGHT : 0
      },
    })
    try {
      const { rerender } = render(<Fruits fruits={['Apple', 'Banana']} />)
      mockRect(screen.getByTestId('trigger'), new DOMRect(0, 300, 100, 40))
      fireEvent.keyDown(screen.getByTestId('trigger'), { key: 'Enter' })
      await wait(0)
      fireEvent.keyDown(document.activeElement ?? document.body, { key: 'ArrowUp' })
      await wait(0)
      const movedTo = document.activeElement?.textContent

      rerender(<Fruits fruits={FRUITS} />)
      fireEvent.scroll(viewport())

      expect([movedTo, screen.queryByTestId('scroll-down') === null, document.activeElement?.textContent]).toEqual([
        'Apple',
        false,
        'Banana',
      ])
    } finally {
      Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
        configurable: true,
        get() {
          return geometry.scrollHeight(this)
        },
      })
    }
  })

  it("keeps the viewport's bottom padding below the last item when it is the one picked", async () => {
    render(
      <Select defaultValue="cherry">
        <SelectTrigger data-testid="trigger">
          <SelectValue data-testid="value" placeholder="Choose" />
        </SelectTrigger>
        <SelectPortal>
          <SelectContent data-testid="content">
            <SelectViewport data-testid="viewport" style={{ paddingBottom: 8 }}>
              {FRUITS.map((fruit) => (
                <SelectItem key={fruit} value={fruit.toLowerCase()}>
                  <SelectItemText>{fruit}</SelectItemText>
                </SelectItem>
              ))}
            </SelectViewport>
          </SelectContent>
        </SelectPortal>
      </Select>,
    )
    mockRect(screen.getByTestId('trigger'), new DOMRect(0, 740, 100, 20))

    fireEvent.keyDown(screen.getByTestId('trigger'), { key: 'Enter' })
    await wait(0)

    expect(wrapper().style.height).toBe('128px')
  })
})

describe('Select closing', () => {
  it('closes when the window loses focus', () => {
    renderFruitSelect({ defaultOpen: true })

    fireEvent(window, new Event('blur'))

    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('closes when the window resizes', () => {
    renderFruitSelect({ defaultOpen: true })

    fireEvent(window, new Event('resize'))

    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('stays open when focus is reported outside it while trapped', () => {
    renderFruitSelect({ defaultOpen: true })
    render(<button type="button">Outside</button>)

    fireEvent.focusOut(screen.getByRole('listbox'))
    fireEvent.focusIn(screen.getByText('Outside'))

    expect(screen.queryByRole('listbox')).not.toBeNull()
  })

  it('closes on Escape', () => {
    renderFruitSelect({ defaultOpen: true })

    fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Escape' })

    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('gives the page back as soon as it starts to animate out: its pointer events, and focus that leaves', async () => {
    renderFruitSelect({ defaultOpen: true })
    render(<button type="button">Outside</button>)
    const listbox = screen.getByRole('listbox')
    const finish = holdExit(listbox)
    const pointerEvents = [document.body.style.pointerEvents]

    fireEvent.keyDown(listbox, { key: 'Escape' })
    pointerEvents.push(document.body.style.pointerEvents)
    screen.getByText('Outside').focus()

    expect([listbox.isConnected, pointerEvents, document.activeElement?.textContent]).toEqual([
      true,
      ['none', ''],
      'Outside',
    ])
    await act(async () => finish())
  })

  it('cancels a right click in the list, so no context menu opens over it', () => {
    renderFruitSelect({ defaultOpen: true })

    expect(fireEvent.contextMenu(screen.getByRole('listbox'))).toBe(false)
  })
})

describe('Select in another root', () => {
  function renderInto(container: HTMLElement, props: React.ComponentProps<typeof Select> = {}) {
    render(
      <Select {...props}>
        <SelectTrigger>
          <SelectValue placeholder="Choose" />
        </SelectTrigger>
        <SelectPortal container={container}>
          <SelectContent>
            <SelectViewport>
              {['Apple', 'Banana', 'Blueberry', 'Cherry'].map((fruit) => (
                <SelectItem key={fruit} value={fruit.toLowerCase()}>
                  <SelectItemText>{fruit}</SelectItemText>
                </SelectItem>
              ))}
            </SelectViewport>
          </SelectContent>
        </SelectPortal>
      </Select>,
      { container },
    )
    const trigger = container.querySelector('button')!
    const listbox = () => container.querySelector<HTMLElement>('[role=listbox]')
    const item = (name: string) =>
      [...container.querySelectorAll<HTMLElement>('[role=option]')].find((node) => node.textContent === name)!
    return { trigger, listbox, item }
  }

  function inShadowRoot() {
    const host = document.body.appendChild(document.createElement('div'))
    const root = host.attachShadow({ mode: 'open' })
    return { root, container: root.appendChild(document.createElement('div')), remove: () => host.remove() }
  }

  function inFrame() {
    const frame = document.body.appendChild(document.createElement('iframe'))
    const root = frame.contentDocument!
    // The iframe's elements are its own window's, which the stubs above do not reach.
    const { prototype } = (frame.contentWindow as unknown as typeof globalThis).Element
    prototype.scrollIntoView = () => {}
    prototype.hasPointerCapture = () => false
    prototype.releasePointerCapture = () => {}
    return { root, frame, container: root.body.appendChild(root.createElement('div')), remove: () => frame.remove() }
  }

  async function openWithKeyboard(trigger: HTMLElement) {
    act(() => trigger.focus())
    fireEvent.keyDown(trigger, { key: 'Enter' })
    await wait(0)
  }

  for (const [where, host] of [
    ['a shadow root', inShadowRoot],
    ['an iframe', inFrame],
  ] as const) {
    it(`opens on the picked item and moves one item at a time inside ${where}`, async () => {
      const { root, container, remove } = host()
      const { trigger, item } = renderInto(container, { defaultValue: 'banana' })
      await openWithKeyboard(trigger)
      const opened = root.activeElement

      fireEvent.keyDown(item('Banana'), { key: 'ArrowDown' })
      await wait(0)

      expect([opened?.textContent, root.activeElement?.textContent]).toEqual(['Banana', 'Blueberry'])
      remove()
    })

    it(`goes on to the next item a typed letter starts inside ${where}`, async () => {
      const { root, container, remove } = host()
      const { trigger, item } = renderInto(container, { defaultValue: 'banana' })
      await openWithKeyboard(trigger)

      fireEvent.keyDown(item('Banana'), { key: 'b' })
      await wait(0)

      expect(root.activeElement?.textContent).toBe('Blueberry')
      remove()
    })

    it(`hands focus back to the list when the mouse leaves the focused item inside ${where}`, async () => {
      const { root, container, remove } = host()
      const { trigger, listbox, item } = renderInto(container, { defaultValue: 'banana' })
      await openWithKeyboard(trigger)
      fireEvent.pointerMove(item('Cherry'), mouse)

      fireEvent.pointerLeave(item('Cherry'), mouse)

      expect(root.activeElement?.getAttribute('role')).toBe('listbox')
      remove()
    })
  }

  it('restores its pick on a reset of a form inside an iframe', async () => {
    const { root, container, remove } = inFrame()
    try {
      root.body.appendChild(root.createElement('form')).id = 'fruits'
      const { trigger, item } = renderInto(container, { name: 'fruit', form: 'fruits', defaultValue: 'apple' })
      await openWithKeyboard(trigger)
      act(() => fireEvent.click(item('Banana')))
      await wait(0)

      act(() => root.querySelector('form')!.reset())

      expect(trigger.textContent).toBe('Apple')
    } finally {
      remove()
    }
  })

  it('keeps the item under the pointer when the opening press is released without moving inside an iframe', () => {
    const { container, remove } = inFrame()
    const onValueChange = vi.fn()
    const { trigger, listbox, item } = renderInto(container, { onValueChange })
    fireEvent.pointerDown(trigger, { ...mouse, clientX: 10, clientY: 10 })
    fireEvent.pointerMove(item('Banana'), mouse)

    fireEvent.pointerUp(item('Banana'), { ...mouse, clientX: 10, clientY: 10 })

    expect([onValueChange.mock.calls, listbox() !== null]).toEqual([[], true])
    remove()
  })

  it('selects the item a press is dragged onto and released over inside an iframe', () => {
    const { container, remove } = inFrame()
    const onValueChange = vi.fn()
    const { trigger, item } = renderInto(container, { onValueChange })
    fireEvent.pointerDown(trigger, { ...mouse, clientX: 10, clientY: 10 })

    fireEvent.pointerMove(item('Cherry'), { ...mouse, clientX: 10, clientY: 60 })
    fireEvent.pointerUp(item('Cherry'), { ...mouse, clientX: 10, clientY: 60 })

    expect(onValueChange.mock.calls).toEqual([['cherry']])
    remove()
  })

  for (const event of ['blur', 'resize'] as const) {
    it(`closes on a ${event} of the window of the iframe it is in`, () => {
      const { frame, container, remove } = inFrame()
      const { listbox } = renderInto(container, { defaultOpen: true })

      fireEvent(frame.contentWindow!, new Event(event))

      expect(listbox()).toBeNull()
      remove()
    })
  }

  it('grows no taller than the window of the iframe it is in, less its margins', async () => {
    const { frame, container, remove } = inFrame()
    Object.defineProperty(frame.contentWindow, 'innerHeight', { value: 200 })
    const { trigger, listbox } = renderInto(container)

    await openWithKeyboard(trigger)

    expect(listbox()?.parentElement?.style.maxHeight).toBe('180px')
    remove()
  })

  it('keeps inside the width of the iframe it is in, less its margins', async () => {
    const { frame, container, remove } = inFrame()
    Object.defineProperty(frame.contentWindow, 'innerWidth', { value: 200 })
    const { trigger, listbox } = renderInto(container, { defaultValue: 'banana' })
    mockRect(trigger, new DOMRect(150, 10, 100, 40))
    mockRect(trigger.querySelector('[data-slot="select-value"]')!, new DOMRect(180, 20, 40, 20))

    await openWithKeyboard(trigger)

    expect(listbox()?.parentElement?.style.left).toBe('120px')
    remove()
  })

  it('keeps inside the width of the iframe it is in, less its margins, right to left', async () => {
    const { frame, container, remove } = inFrame()
    Object.defineProperty(frame.contentWindow, 'innerWidth', { value: 200 })
    const { trigger, listbox } = renderInto(container, { defaultValue: 'banana', dir: 'rtl' })
    mockRect(trigger, new DOMRect(0, 10, 100, 40))
    mockRect(trigger.querySelector('[data-slot="select-value"]')!, new DOMRect(20, 20, 40, 20))

    await openWithKeyboard(trigger)

    expect([listbox()?.parentElement?.style.right, listbox()?.parentElement?.style.minWidth]).toEqual(['130px', '60px'])
    remove()
  })

  it('grows on a scroll no taller than the window of the iframe it is in, less its margins', async () => {
    const { frame, container, remove } = inFrame()
    Object.defineProperty(frame.contentWindow, 'innerHeight', { value: 200 })
    const { trigger, listbox } = renderInto(container, { defaultValue: 'banana' })
    await openWithKeyboard(trigger)
    await wait(50)
    const wrapper = listbox()!.parentElement!
    const viewport = container.querySelector<HTMLElement>('[data-slot="select-viewport"]')!
    Object.assign(wrapper.style, { height: '100px', minHeight: '0px' })

    viewport.scrollTop = 500
    fireEvent.scroll(viewport)

    expect(wrapper.style.height).toBe('180px')
    remove()
  })

  it('lines up and grows by the window it runs in when its document has none of its own', async () => {
    const other = document.implementation.createHTMLDocument('detached')
    const container = other.body.appendChild(other.createElement('div'))
    const { listbox } = renderInto(container, { defaultValue: 'banana', defaultOpen: true })
    await act(() => wait(50))
    const wrapper = listbox()!.parentElement!
    const viewport = container.querySelector<HTMLElement>('[data-slot="select-viewport"]')!
    const placed = wrapper.style.minWidth
    Object.assign(wrapper.style, { height: '100px', minHeight: '0px' })

    viewport.scrollTop = 5000
    act(() => void viewport.dispatchEvent(new Event('scroll')))

    expect([placed !== '', wrapper.style.height]).toEqual([true, `${window.innerHeight - 20}px`])
  })
})

describe('Select opening and closing', () => {
  const Counted = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'> & { renders: string[] }>(
    ({ renders, ...props }, ref) => {
      renders.push(props.id ?? '')
      return <div ref={ref} {...props} />
    },
  )

  function Fruits({
    position,
    renders,
    ...props
  }: React.ComponentProps<typeof Select> & {
    position: 'popper' | 'item-aligned'
    renders: string[]
  }) {
    return (
      <Select {...props} value="banana">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectPortal>
          <SelectContent position={position}>
            <SelectViewport>
              {['apple', 'banana', 'cherry'].map((fruit) => (
                <SelectItem key={fruit} value={fruit} id={fruit} asChild>
                  <Counted renders={renders}>
                    <SelectItemText>{fruit}</SelectItemText>
                  </Counted>
                </SelectItem>
              ))}
            </SelectViewport>
          </SelectContent>
        </SelectPortal>
      </Select>
    )
  }

  for (const position of ['popper', 'item-aligned'] as const) {
    it(`renders each item once as it opens ${position === 'popper' ? 'as a popper' : 'aligned to the item'}, and again only the one it focuses`, async () => {
      const renders: string[] = []
      const { rerender } = render(<Fruits open={false} position={position} renders={renders} />)
      renders.length = 0

      rerender(<Fruits open position={position} renders={renders} />)
      await wait(0)

      expect([document.activeElement?.id, renders.toSorted()]).toEqual([
        'banana',
        ['apple', 'banana', 'banana', 'cherry'],
      ])
    })
  }

  async function close(props: Partial<React.ComponentProps<typeof Fruits>>) {
    const renders: string[] = []
    render(<Fruits defaultOpen position="popper" renders={renders} {...props} />)
    await wait(0)
    renders.length = 0

    fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Escape' })
    await wait(0)

    return [screen.queryByRole('listbox'), renders.toSorted()]
  }

  it('renders no item as it closes when it is given its items', async () => {
    const items = ['apple', 'banana', 'cherry'].map((fruit) => ({ value: fruit, label: fruit }))

    expect(await close({ items })).toEqual([null, []])
  })

  it('renders each item once as it closes, into the hidden copy a closed select reads', async () => {
    expect(await close({})).toEqual([null, ['apple', 'banana', 'cherry']])
  })
})

describe('Select native options', () => {
  it('shows the picked item once in the trigger, and lists each item once, while it animates out and after', async () => {
    const { container } = render(
      <form>
        <Select name="fruit" defaultValue="banana" defaultOpen>
          <SelectTrigger>
            <SelectValue data-testid="value" />
          </SelectTrigger>
          <SelectPortal>
            <SelectContent>
              <SelectViewport>
                {['Apple', 'Banana', 'Cherry'].map((fruit) => (
                  <SelectItem key={fruit} value={fruit.toLowerCase()}>
                    <SelectItemText>{fruit}</SelectItemText>
                  </SelectItem>
                ))}
              </SelectViewport>
            </SelectContent>
          </SelectPortal>
        </Select>
      </form>,
    )
    const listbox = screen.getByRole('listbox')
    const finish = holdExit(listbox)
    const shown = () => [
      screen.getByTestId('value').textContent,
      Array.from(container.querySelectorAll('select option'), (node) => node.getAttribute('value')),
    ]

    fireEvent.keyDown(listbox, { key: 'Escape' })

    expect([listbox.isConnected, listbox.dataset.state, ...shown()]).toEqual([
      true,
      'closed',
      'Banana',
      ['apple', 'banana', 'cherry'],
    ])
    await act(async () => finish())
    expect([listbox.isConnected, ...shown()]).toEqual([false, 'Banana', ['apple', 'banana', 'cherry']])
  })

  it('lists each item once while the content stays mounted after closing', () => {
    const { container } = render(
      <form>
        <Select name="fruit" defaultValue="apple">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectPortal>
            <SelectContent forceMount>
              <SelectViewport>
                <SelectItem value="apple">
                  <SelectItemText>Apple</SelectItemText>
                </SelectItem>
                <SelectItem value="banana">
                  <SelectItemText>Banana</SelectItemText>
                </SelectItem>
              </SelectViewport>
            </SelectContent>
          </SelectPortal>
        </Select>
      </form>,
    )

    const options = Array.from(container.querySelectorAll('select option'), (node) => node.getAttribute('value'))
    expect(options).toEqual(['apple', 'banana'])
  })

  function Fruit({ label = 'Apple', value = 'apple', disabled = false }) {
    return (
      <form>
        <Select name="fruit" defaultValue="apple">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectPortal>
            <SelectContent>
              <SelectViewport>
                <SelectItem value={value} disabled={disabled}>
                  <SelectItemText>{label}</SelectItemText>
                </SelectItem>
              </SelectViewport>
            </SelectContent>
          </SelectPortal>
        </Select>
      </form>
    )
  }

  const listed = (container: HTMLElement) =>
    Array.from(container.querySelectorAll('select option'), (node) => [
      node.getAttribute('value'),
      node.textContent,
      node.hasAttribute('disabled'),
    ])

  it('lists an item by the text it shows now, after that text changes', () => {
    const { container, rerender } = render(<Fruit />)

    rerender(<Fruit label="Green apple" />)

    expect(listed(container)).toEqual([['apple', 'Green apple', false]])
  })

  it('lists an item by the value it holds now, after that value changes', () => {
    const { container, rerender } = render(<Fruit />)

    rerender(<Fruit value="green-apple" />)

    expect(listed(container)).toEqual([['green-apple', 'Apple', false]])
  })

  it('lists an item as disabled once it is disabled', () => {
    const { container, rerender } = render(<Fruit />)

    rerender(<Fruit disabled />)

    expect(listed(container)).toEqual([['apple', 'Apple', true]])
  })
})

describe('Select giving the page back on close', () => {
  it('removes the content before it gives the page back its pointer events', () => {
    renderSelect({ defaultOpen: true })

    const changes = pageChangesOnClose(screen.getByRole('listbox'), () =>
      fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' }),
    )

    expect(changes[0]).toBe('content removed')
    expect(changes).toContain('body style')
  })
})

describe('Select with items', () => {
  const ITEMS = [
    { value: '1', label: 'Apple' },
    { value: '2', label: 'Banana' },
    { value: '3', label: 'Blackberry', disabled: true },
    { value: '4', label: 'Blueberry' },
  ]

  function Shown({ label, onShow }: { label: string; onShow?: () => void }) {
    onShow?.()
    return label
  }

  function renderItemsSelect(
    props: React.ComponentProps<typeof Select> = {},
    { onShow, value, inForm }: { onShow?: () => void; value?: React.ReactNode; inForm?: boolean } = {},
  ) {
    const select = (
      <Select items={ITEMS} {...props}>
        <SelectTrigger data-testid="trigger">
          <SelectValue data-testid="value" placeholder="Choose">
            {value}
          </SelectValue>
        </SelectTrigger>
        <SelectPortal>
          <SelectContent>
            <SelectViewport>
              {ITEMS.map((item) => (
                <SelectItem key={item.value} value={item.value} disabled={item.disabled}>
                  <SelectItemText>
                    <Shown label={item.label} onShow={onShow} />
                  </SelectItemText>
                </SelectItem>
              ))}
            </SelectViewport>
          </SelectContent>
        </SelectPortal>
      </Select>
    )
    return render(inForm ? <form>{select}</form> : select)
  }

  it('renders none of its items while closed', () => {
    const onShow = vi.fn()

    renderItemsSelect({ defaultValue: '1' }, { onShow })

    expect(onShow).not.toHaveBeenCalled()
  })

  it("shows the picked item's label from items", () => {
    renderItemsSelect({ defaultValue: '2' })

    expect(screen.getByTestId('value').textContent).toBe('Banana')
  })

  it('shows the label once while open', () => {
    renderItemsSelect({ defaultValue: '2', defaultOpen: true })

    expect(screen.getByTestId('value').textContent).toBe('Banana')
  })

  it('lists its items in the form', () => {
    const { container } = renderItemsSelect({ name: 'fruit', defaultValue: '2' }, { inForm: true })
    const select = container.querySelector('select')

    expect([
      Array.from(select?.options ?? [], (option) => [option.value, option.text, option.disabled]),
      select?.value,
    ]).toEqual([
      [
        ['1', 'Apple', false],
        ['2', 'Banana', false],
        ['3', 'Blackberry', true],
        ['4', 'Blueberry', false],
      ],
      '2',
    ])
  })

  it('picks the next label a letter typed on the closed trigger starts, passing over a disabled item', () => {
    const onValueChange = vi.fn()
    renderItemsSelect({ defaultValue: '2', onValueChange })

    fireEvent.keyDown(screen.getByTestId('trigger'), { key: 'b' })

    expect(onValueChange.mock.calls).toEqual([['4']])
  })

  it('picks the first label a letter typed on the closed trigger starts while nothing is picked', () => {
    const onValueChange = vi.fn()
    renderItemsSelect({ onValueChange })

    fireEvent.keyDown(screen.getByTestId('trigger'), { key: 'a' })

    expect(onValueChange.mock.calls).toEqual([['1']])
  })

  it('puts the label in the HTML a server renders', () => {
    const host = document.createElement('div')

    host.innerHTML = renderToString(
      <Select items={ITEMS} defaultValue="2">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
      </Select>,
    )

    expect(host.querySelector('[data-slot="select-value"]')?.textContent).toBe('Banana')
  })

  it('shows children given to the value in place of the label', () => {
    renderItemsSelect({ defaultValue: '2' }, { value: 'Picked' })

    expect(screen.getByTestId('value').textContent).toBe('Picked')
  })

  it('shows the label of an item picked from the list', () => {
    renderItemsSelect({ defaultValue: '1', defaultOpen: true })

    fireEvent.click(screen.getByRole('option', { name: 'Blueberry' }))

    expect([screen.queryByRole('listbox'), screen.getByTestId('value').textContent]).toEqual([null, 'Blueberry'])
  })
})

describe('Select with multiple', () => {
  function renderMultiple(
    props: React.ComponentProps<typeof Select>,
    { children, inForm }: { children?: React.ComponentProps<typeof SelectValue>['children']; inForm?: boolean } = {},
  ) {
    const select = (
      <Select {...props}>
        <SelectTrigger data-testid="trigger">
          <SelectValue data-testid="value" placeholder="Choose">
            {children}
          </SelectValue>
        </SelectTrigger>
        <SelectPortal>
          <SelectContent>
            <SelectViewport>
              {FRUITS.map((fruit) => (
                <SelectItem key={fruit} value={fruit.toLowerCase()} disabled={fruit === 'Blackberry'}>
                  <SelectItemText>{fruit}</SelectItemText>
                </SelectItem>
              ))}
            </SelectViewport>
          </SelectContent>
        </SelectPortal>
      </Select>
    )
    return render(inForm ? <form>{select}</form> : select)
  }

  const shown = () => screen.getByTestId('value').textContent

  it('adds a picked item and stays open, and a second pick takes it out', () => {
    const onValueChange = vi.fn()
    renderFruitSelect({ multiple: true, defaultOpen: true, onValueChange })

    fireEvent.click(option('Cherry'))
    fireEvent.click(option('Apple'))
    fireEvent.click(option('Cherry'))

    expect([onValueChange.mock.calls, screen.queryByRole('listbox') !== null]).toEqual([
      [[['cherry']], [['cherry', 'apple']], [['apple']]],
      true,
    ])
  })

  it('adds the first pick of a select made multiple after it mounted with nothing picked', () => {
    const onValueChange = vi.fn()
    const items = (
      <SelectPortal>
        <SelectContent>
          <SelectViewport>
            <SelectItem value="apple">
              <SelectItemText>Apple</SelectItemText>
            </SelectItem>
          </SelectViewport>
        </SelectContent>
      </SelectPortal>
    )
    const { rerender } = render(
      <Select defaultOpen>
        <SelectTrigger>
          <SelectValue placeholder="Choose" />
        </SelectTrigger>
        {items}
      </Select>,
    )
    rerender(
      <Select multiple defaultOpen onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Choose" />
        </SelectTrigger>
        {items}
      </Select>,
    )

    fireEvent.click(option('Apple'))

    expect(onValueChange.mock.calls).toEqual([[['apple']]])
  })

  it('picks the item a press is dragged onto and released over, and stays open', () => {
    const onValueChange = vi.fn()
    renderFruitSelect({ multiple: true, onValueChange })
    fireEvent.pointerDown(screen.getByTestId('trigger'), { ...mouse, clientX: 10, clientY: 10 })

    fireEvent.pointerMove(option('Cherry'), { ...mouse, clientX: 10, clientY: 60 })
    fireEvent.pointerUp(option('Cherry'), { ...mouse, clientX: 10, clientY: 60 })

    expect([onValueChange.mock.calls, screen.queryByRole('listbox') !== null]).toEqual([[[['cherry']]], true])
  })

  it('shows its picks in the order they were made, and its placeholder once none is left', () => {
    renderFruitSelect({ multiple: true, defaultOpen: true })
    const seen: Array<string | null> = []

    fireEvent.click(option('Cherry'))
    seen.push(shown())
    fireEvent.click(option('Apple'))
    seen.push(shown())
    fireEvent.click(option('Cherry'))
    fireEvent.click(option('Apple'))
    seen.push(shown())

    expect([...seen, screen.getByTestId('trigger').dataset.placeholder]).toEqual([
      'Cherry',
      'Cherry, Apple',
      'Choose',
      '',
    ])
  })

  it('shows the labels of a default value while closed', () => {
    renderMultiple({ multiple: true, defaultValue: ['cherry', 'banana'] })

    expect(shown()).toBe('Cherry, Banana')
  })

  it('takes the labels of its picks from items, on the server too', () => {
    const items = FRUITS.map((fruit) => ({ value: fruit.toLowerCase(), label: `${fruit} pie` }))
    const props = { multiple: true, items, defaultValue: ['cherry', 'apple'] } as const

    renderMultiple(props)
    const html = renderToString(
      <Select {...props}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
      </Select>,
    )

    expect([shown(), html.includes('Cherry pie, Apple pie')]).toEqual(['Cherry pie, Apple pie', true])
  })

  it('marks its list multiselectable and says on every option whether it is picked', () => {
    renderFruitSelect({ multiple: true, defaultValue: ['banana', 'cherry'], defaultOpen: true })

    expect([
      screen.getByRole('listbox').getAttribute('aria-multiselectable'),
      FRUITS.map((fruit) => option(fruit).getAttribute('aria-selected')),
    ]).toEqual(['true', ['false', 'true', 'false', 'true']])
  })

  it('leaves a single select out of aria-multiselectable', () => {
    renderFruitSelect({ defaultOpen: true })

    expect(screen.getByRole('listbox').hasAttribute('aria-multiselectable')).toBe(false)
  })

  it('draws the indicator on every pick', () => {
    renderFruitSelect({ multiple: true, defaultValue: ['apple', 'cherry'], defaultOpen: true })

    expect(FRUITS.map((fruit) => screen.queryByTestId(`${fruit}-indicator`) !== null)).toEqual([
      true,
      false,
      false,
      true,
    ])
  })

  it('toggles the focused item with Enter and Space and stays open', async () => {
    const onValueChange = vi.fn()
    renderFruitSelect({ multiple: true, defaultOpen: true, onValueChange })
    await wait(0)

    fireEvent.keyDown(option('Apple'), { key: 'Enter' })
    fireEvent.keyDown(option('Apple'), { key: ' ' })
    fireEvent.keyDown(option('Apple'), { key: ' ' })

    expect([onValueChange.mock.calls, screen.queryByRole('listbox') !== null]).toEqual([
      [[['apple']], [[]], [['apple']]],
      true,
    ])
  })

  it('picks nothing when a letter is typed on its closed trigger', () => {
    const onValueChange = vi.fn()
    renderFruitSelect({ multiple: true, onValueChange })

    fireEvent.keyDown(screen.getByTestId('trigger'), { key: 'c' })

    expect([onValueChange.mock.calls, shown()]).toEqual([[], 'Choose'])
  })

  it('opens on its first pick, and keeps focus where it is when that pick is taken out', async () => {
    renderMultiple({ multiple: true, defaultValue: ['cherry', 'apple'], defaultOpen: true })
    await wait(0)
    const opened = document.activeElement?.textContent
    act(() => option('Banana').focus())

    fireEvent.keyDown(option('Cherry'), { key: 'Enter' })
    await wait(0)

    expect([opened, document.activeElement?.textContent]).toEqual(['Cherry', 'Banana'])
  })

  it('hands a function child its picks, and a single select its one value as a list', () => {
    const many = vi.fn((picked: string[]) => `${picked.length} picked: ${picked.join('+')}`)
    const one = vi.fn((picked: string[]) => picked.join('+'))
    const none = vi.fn(() => 'never')

    renderMultiple({ multiple: true, defaultValue: ['cherry', 'apple'] }, { children: many })
    const first = shown()
    cleanup()
    renderMultiple({ defaultValue: 'banana' }, { children: one })
    const second = shown()
    cleanup()
    renderMultiple({ multiple: true }, { children: none })

    expect([first, second, shown(), none.mock.calls.length]).toEqual(['2 picked: cherry+apple', 'banana', 'Choose', 0])
  })

  // The FormData these tests get leaves a multiple select out, so the e2e suite submits the form.
  it('holds each pick in its native select, and refuses a required submit with none', () => {
    const { container } = renderMultiple(
      { multiple: true, name: 'fruit', defaultValue: ['cherry', 'apple'], required: true },
      { inForm: true },
    )
    const filled = container.querySelector('form')!
    const { container: emptyContainer } = renderMultiple(
      { multiple: true, name: 'fruit', required: true },
      { inForm: true },
    )
    const empty = emptyContainer.querySelector('form')!
    const select = filled.querySelector('select')!

    expect([
      select.multiple,
      Array.from(select.selectedOptions, (selected) => selected.value),
      filled.checkValidity(),
      empty.checkValidity(),
    ]).toEqual([true, ['apple', 'cherry'], true, false])
  })

  it('takes the picks its native select is given, as autofill gives them', () => {
    const onValueChange = vi.fn()
    const { container } = renderMultiple({ multiple: true, onValueChange }, { inForm: true })
    const select = container.querySelector('select')!

    for (const option of select.options) option.selected = ['apple', 'cherry'].includes(option.value)
    fireEvent.change(select)

    expect([onValueChange.mock.calls, shown()]).toEqual([[[['apple', 'cherry']]], 'Apple, Cherry'])
  })

  it('tells the form about each pick once, and calls onValueChange once for it', () => {
    const onValueChange = vi.fn()
    const onChange = vi.fn()
    const { container } = renderMultiple(
      { multiple: true, name: 'fruit', defaultOpen: true, onValueChange },
      { inForm: true },
    )
    container.querySelector('form')?.addEventListener('change', onChange)

    fireEvent.click(option('Cherry'))
    fireEvent.click(option('Apple'))

    expect([onChange.mock.calls.length, onValueChange.mock.calls]).toEqual([2, [[['cherry']], [['cherry', 'apple']]]])
  })

  it('calls onValueChange once for each pick when its parent holds the value', () => {
    const onValueChange = vi.fn()
    function Owner() {
      const [value, setValue] = React.useState<string[]>([])
      return (
        <form>
          <Select
            multiple
            name="fruit"
            defaultOpen
            value={value}
            onValueChange={(next) => {
              onValueChange(next)
              setValue(next)
            }}>
            <SelectTrigger>
              <SelectValue data-testid="value" />
            </SelectTrigger>
            <SelectPortal>
              <SelectContent>
                {FRUITS.map((fruit) => (
                  <SelectItem key={fruit} value={fruit.toLowerCase()}>
                    <SelectItemText>{fruit}</SelectItemText>
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectPortal>
          </Select>
        </form>
      )
    }
    render(<Owner />)

    fireEvent.click(option('Cherry'))
    fireEvent.click(option('Apple'))

    expect([onValueChange.mock.calls, shown()]).toEqual([[[['cherry']], [['cherry', 'apple']]], 'Cherry, Apple'])
  })

  it('sends the form no change when its parent passes an equal array afresh', () => {
    const page = () => (
      <form>
        <Select multiple name="fruit" value={['apple']}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
        </Select>
      </form>
    )
    const { container, rerender } = render(page())
    const onChange = vi.fn()
    container.querySelector('select')?.addEventListener('change', onChange)

    rerender(page())

    expect(onChange).not.toHaveBeenCalled()
  })

  it('gives back the picks it started with on a form reset', () => {
    const { container } = renderMultiple(
      { multiple: true, name: 'fruit', defaultValue: ['apple'], defaultOpen: true },
      { inForm: true },
    )
    fireEvent.click(option('Cherry'))
    const picked = shown()

    act(() => container.querySelector('form')!.reset())

    expect([picked, shown()]).toEqual(['Apple, Cherry', 'Apple'])
  })
})

describe('Select and its native select in a form', () => {
  const PICKS = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry' },
  ]
  function Fruit(props: React.ComponentProps<typeof Select>) {
    return (
      <Select name="fruit" items={PICKS} {...props}>
        <SelectTrigger>
          <SelectValue data-testid="value" placeholder="Choose" />
        </SelectTrigger>
      </Select>
    )
  }
  const shownValue = () => screen.getByTestId('value').textContent
  // What autofill does: the browser picks an option on the native select and tells it so.
  function autofill(select: HTMLSelectElement, value: string) {
    act(() => {
      select.value = value
      fireEvent.change(select)
    })
  }

  it('restores its starting value on a reset of a form named by form that mounts after it', () => {
    function Page({ withForm }: { withForm: boolean }) {
      return (
        <>
          <Fruit form="checkout" defaultValue="apple" />
          {withForm && <form id="checkout" />}
        </>
      )
    }
    const { container, rerender } = render(<Page withForm={false} />)
    rerender(<Page withForm />)
    autofill(container.querySelector('select') as HTMLSelectElement, 'banana')

    act(() => (container.querySelector('#checkout') as HTMLFormElement).reset())

    expect(shownValue()).toBe('Apple')
  })

  it('keeps its value when a handler cancels the reset', () => {
    const { container } = render(
      <form onReset={(event) => event.preventDefault()}>
        <Fruit defaultValue="apple" />
      </form>,
    )
    autofill(container.querySelector('select') as HTMLSelectElement, 'banana')

    act(() => (container.querySelector('form') as HTMLFormElement).reset())

    expect(shownValue()).toBe('Banana')
  })

  it('puts the native select back when a controlled owner refuses an autofilled value', () => {
    const { container } = render(
      <form>
        <Fruit value="apple" onValueChange={() => {}} />
      </form>,
    )
    const select = container.querySelector('select') as HTMLSelectElement

    autofill(select, 'cherry')

    expect([select.value, shownValue()]).toEqual(['apple', 'Apple'])
  })

  it("hands an autofilled value to the select as well as to the native select's own onChange", () => {
    const onChange = vi.fn()
    const onValueChange = vi.fn()
    const { container } = render(
      <form>
        <SelectProvider name="fruit" items={PICKS} defaultValue="apple" onValueChange={onValueChange}>
          <SelectBubbleInput onChange={onChange} />
        </SelectProvider>
      </form>,
    )

    autofill(container.querySelector('select') as HTMLSelectElement, 'banana')

    expect([onChange.mock.calls.length, onValueChange.mock.calls]).toEqual([1, [['banana']]])
  })

  it('resets the native select to its starting value after new options remount it', () => {
    function Growing() {
      const [items, setItems] = React.useState(PICKS)
      return (
        <form>
          <Fruit defaultValue="apple" items={items} />
          <button type="button" onClick={() => setItems([...PICKS, { value: 'date', label: 'Date' }])}>
            Add
          </button>
        </form>
      )
    }
    const { container } = render(<Growing />)
    const native = () => container.querySelector('select') as HTMLSelectElement
    autofill(native(), 'banana')
    fireEvent.click(screen.getByText('Add'))
    autofill(native(), 'apple')

    act(() => (container.querySelector('form') as HTMLFormElement).reset())

    expect([native().value, shownValue()]).toEqual(['apple', 'Apple'])
  })
})
