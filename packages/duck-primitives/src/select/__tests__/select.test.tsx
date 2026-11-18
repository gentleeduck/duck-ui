import { describe, expect, it, mock } from 'bun:test'
import { fireEvent, render } from '@testing-library/react'
import * as React from 'react'
import { Select, SelectContent, SelectItem, SelectItemText, SelectPortal, SelectTrigger, SelectValue } from '../index'

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
    const handler = mock(() => {})
    const { container } = renderSelect({ onOpenChange: handler })
    fireEvent.keyDown(container.querySelector('[data-slot="select-trigger"]')!, { key: 'ArrowDown' })
    expect(handler).toHaveBeenCalledWith(true)
  })

  it('opens on Enter key', () => {
    const handler = mock(() => {})
    const { container } = renderSelect({ onOpenChange: handler })
    fireEvent.keyDown(container.querySelector('[data-slot="select-trigger"]')!, { key: 'Enter' })
    expect(handler).toHaveBeenCalledWith(true)
  })

  it('opens on Space key', () => {
    const handler = mock(() => {})
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

  it('trigger has aria-controls attribute', () => {
    const { container } = renderSelect()
    expect(container.querySelector('[data-slot="select-trigger"]')?.getAttribute('aria-controls')).toBeTruthy()
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
})
