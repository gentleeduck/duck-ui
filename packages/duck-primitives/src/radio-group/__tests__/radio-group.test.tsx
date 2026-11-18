import { describe, expect, it, mock } from 'bun:test'
import { act, fireEvent, render } from '@testing-library/react'
import * as React from 'react'
import { DirectionProvider } from '../../direction'
import { RadioGroup, RadioGroupIndicator, RadioGroupItem } from '../index'

const nextTick = () => act(() => new Promise<void>((resolve) => setTimeout(resolve, 0)))

function renderRadioGroup(props: Record<string, unknown> = {}) {
  return render(
    <RadioGroup {...props}>
      <RadioGroupItem value="a">
        <RadioGroupIndicator />
      </RadioGroupItem>
      <RadioGroupItem value="b">
        <RadioGroupIndicator />
      </RadioGroupItem>
      <RadioGroupItem value="c">
        <RadioGroupIndicator />
      </RadioGroupItem>
    </RadioGroup>,
  )
}

describe('RadioGroup', () => {
  it('renders with data-slot="radio-group"', () => {
    const { container } = renderRadioGroup()
    expect(container.querySelector('[data-slot="radio-group"]')).not.toBeNull()
  })

  it('has role="radiogroup"', () => {
    const { container } = renderRadioGroup()
    expect(container.querySelector('[role="radiogroup"]')).not.toBeNull()
  })

  it('renders items with role="radio"', () => {
    const { container } = renderRadioGroup()
    expect(container.querySelectorAll('[role="radio"]').length).toBe(3)
  })

  it('no item is checked by default', () => {
    const { container } = renderRadioGroup()
    const radios = container.querySelectorAll('[role="radio"]')
    for (const radio of radios) {
      expect(radio.getAttribute('aria-checked')).toBe('false')
    }
  })

  it('selects item on click', () => {
    const { container } = renderRadioGroup()
    const radios = container.querySelectorAll('[role="radio"]')
    fireEvent.click(radios[1]!)
    expect(radios[1]!.getAttribute('aria-checked')).toBe('true')
    expect(radios[0]!.getAttribute('aria-checked')).toBe('false')
    expect(radios[2]!.getAttribute('aria-checked')).toBe('false')
  })

  it('supports defaultValue', () => {
    const { container } = renderRadioGroup({ defaultValue: 'b' })
    const radios = container.querySelectorAll('[role="radio"]')
    expect(radios[0]!.getAttribute('aria-checked')).toBe('false')
    expect(radios[1]!.getAttribute('aria-checked')).toBe('true')
    expect(radios[2]!.getAttribute('aria-checked')).toBe('false')
  })

  it('calls onValueChange on selection', () => {
    const handler = mock(() => {})
    const { container } = renderRadioGroup({ onValueChange: handler })
    fireEvent.click(container.querySelectorAll('[role="radio"]')[0]!)
    expect(handler).toHaveBeenCalledWith('a')
  })

  it('items have data-state on/off', () => {
    const { container } = renderRadioGroup({ defaultValue: 'a' })
    const radios = container.querySelectorAll('[role="radio"]')
    expect(radios[0]!.getAttribute('data-state')).toBe('checked')
    expect(radios[1]!.getAttribute('data-state')).toBe('unchecked')
  })

  it('disabled group disables all items', () => {
    const { container } = renderRadioGroup({ disabled: true })
    const radios = container.querySelectorAll('[role="radio"]')
    for (const radio of radios) {
      expect(radio.getAttribute('data-disabled')).toBe('')
    }
  })

  it('forwards ref', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(
      <RadioGroup ref={ref}>
        <RadioGroupItem value="a">
          <RadioGroupIndicator />
        </RadioGroupItem>
      </RadioGroup>,
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('only one item can be checked at a time', () => {
    const { container } = renderRadioGroup()
    const radios = container.querySelectorAll('[role="radio"]')
    fireEvent.click(radios[0]!)
    fireEvent.click(radios[2]!)
    const checked = Array.from(radios).filter((r) => r.getAttribute('aria-checked') === 'true')
    expect(checked.length).toBe(1)
    expect(radios[2]!.getAttribute('aria-checked')).toBe('true')
  })

  it('clicking same item does not uncheck it', () => {
    const { container } = renderRadioGroup()
    const radios = container.querySelectorAll('[role="radio"]')
    fireEvent.click(radios[0]!)
    fireEvent.click(radios[0]!)
    expect(radios[0]!.getAttribute('aria-checked')).toBe('true')
  })

  it('works as controlled component', () => {
    const { container, rerender } = render(
      <RadioGroup value="a">
        <RadioGroupItem value="a">
          <RadioGroupIndicator />
        </RadioGroupItem>
        <RadioGroupItem value="b">
          <RadioGroupIndicator />
        </RadioGroupItem>
      </RadioGroup>,
    )
    const radios = container.querySelectorAll('[role="radio"]')
    expect(radios[0]!.getAttribute('aria-checked')).toBe('true')
    rerender(
      <RadioGroup value="b">
        <RadioGroupItem value="a">
          <RadioGroupIndicator />
        </RadioGroupItem>
        <RadioGroupItem value="b">
          <RadioGroupIndicator />
        </RadioGroupItem>
      </RadioGroup>,
    )
    expect(radios[0]!.getAttribute('aria-checked')).toBe('false')
    expect(radios[1]!.getAttribute('aria-checked')).toBe('true')
  })

  it('required group sets aria-required', () => {
    const { container } = renderRadioGroup({ required: true })
    expect(container.querySelector('[role="radiogroup"]')?.getAttribute('aria-required')).toBe('true')
  })

  it('passes className', () => {
    const { container } = render(
      <RadioGroup className="custom-radio">
        <RadioGroupItem value="a">
          <RadioGroupIndicator />
        </RadioGroupItem>
      </RadioGroup>,
    )
    expect(container.querySelector('.custom-radio')).not.toBeNull()
  })

  it('sets dir attribute', () => {
    const { container } = renderRadioGroup({ dir: 'rtl' })
    expect(container.querySelector('[role="radiogroup"]')?.getAttribute('dir')).toBe('rtl')
  })

  it('items have type="button"', () => {
    const { container } = renderRadioGroup()
    const radios = container.querySelectorAll('[role="radio"]')
    for (const radio of radios) {
      expect(radio.getAttribute('type')).toBe('button')
    }
  })

  it('items have data-slot="radio-group-item"', () => {
    const { container } = renderRadioGroup()
    expect(container.querySelectorAll('[data-slot="radio-group-item"]').length).toBe(3)
  })

  it('items have data-value attribute', () => {
    const { container } = renderRadioGroup()
    const items = container.querySelectorAll('[data-slot="radio-group-item"]')
    expect(items[0]!.getAttribute('data-value')).toBe('a')
    expect(items[1]!.getAttribute('data-value')).toBe('b')
    expect(items[2]!.getAttribute('data-value')).toBe('c')
  })

  it('renders hidden radio input for form submission when name is set', () => {
    const { container } = render(
      <RadioGroup name="color" defaultValue="red">
        <RadioGroupItem value="red">
          <RadioGroupIndicator />
        </RadioGroupItem>
        <RadioGroupItem value="blue">
          <RadioGroupIndicator />
        </RadioGroupItem>
      </RadioGroup>,
    )
    const hiddenInputs = container.querySelectorAll('input[type="radio"][aria-hidden]')
    expect(hiddenInputs.length).toBe(2)
  })

  it('hidden inputs have correct name and value', () => {
    const { container } = render(
      <RadioGroup name="fruit" defaultValue="apple">
        <RadioGroupItem value="apple">
          <RadioGroupIndicator />
        </RadioGroupItem>
        <RadioGroupItem value="banana">
          <RadioGroupIndicator />
        </RadioGroupItem>
      </RadioGroup>,
    )
    const inputs = container.querySelectorAll('input[type="radio"]')
    expect(inputs[0]!.getAttribute('name')).toBe('fruit')
    expect(inputs[0]!.getAttribute('value')).toBe('apple')
    expect((inputs[0] as HTMLInputElement).checked).toBe(true)
    expect(inputs[1]!.getAttribute('value')).toBe('banana')
    expect((inputs[1] as HTMLInputElement).checked).toBe(false)
  })

  it('disabled item has disabled attribute on button', () => {
    const { container } = render(
      <RadioGroup>
        <RadioGroupItem value="a" disabled>
          <RadioGroupIndicator />
        </RadioGroupItem>
        <RadioGroupItem value="b">
          <RadioGroupIndicator />
        </RadioGroupItem>
      </RadioGroup>,
    )
    const items = container.querySelectorAll('[role="radio"]')
    expect((items[0] as HTMLButtonElement).disabled).toBe(true)
    expect((items[1] as HTMLButtonElement).disabled).toBe(false)
  })

  it('flips horizontal arrow keys under a DirectionProvider without a dir prop', async () => {
    const { container } = render(
      <DirectionProvider dir="rtl">
        <RadioGroup defaultValue="b" orientation="horizontal">
          <RadioGroupItem value="a" />
          <RadioGroupItem value="b" />
          <RadioGroupItem value="c" />
        </RadioGroup>
      </DirectionProvider>,
    )
    expect(container.querySelector('[role="radiogroup"]')?.getAttribute('dir')).toBe('rtl')
    const items = container.querySelectorAll<HTMLButtonElement>('[role="radio"]')
    // Assert the first focus target: focus traps left open by other suites can pull focus away afterwards.
    const focused: Element[] = []
    for (const item of items) item.addEventListener('focus', () => focused.push(item))
    items[1]!.focus()
    focused.length = 0
    fireEvent.keyDown(items[1]!, { key: 'ArrowLeft' })
    await nextTick()
    expect(focused[0]).toBe(items[2]!)
    focused.length = 0
    fireEvent.keyDown(items[2]!, { key: 'ArrowRight' })
    await nextTick()
    expect(focused[0]).toBe(items[1]!)
  })
})
