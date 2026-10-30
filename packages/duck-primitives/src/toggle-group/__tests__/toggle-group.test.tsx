import { describe, expect, it, mock } from 'bun:test'
import { act, fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import { freshDom } from '../../__tests__/dom'
import { DirectionProvider } from '../../direction'
import { createToggleGroupScope, ToggleGroup, ToggleGroupItem } from '../index'

freshDom()

const nextTick = () => act(() => new Promise<void>((resolve) => setTimeout(resolve, 0)))

describe('ToggleGroup (single)', () => {
  it('renders with data-slot="toggle-group"', () => {
    const { container } = render(
      <ToggleGroup type="single">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>,
    )
    expect(container.querySelector('[data-slot="toggle-group"]')).not.toBeNull()
  })

  it('renders items with data-slot="toggle-group-item"', () => {
    const { container } = render(
      <ToggleGroup type="single">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>,
    )
    expect(container.querySelectorAll('[data-slot="toggle-group-item"]').length).toBe(2)
  })

  it('selects an item on click', () => {
    const { container } = render(
      <ToggleGroup type="single">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>,
    )
    const items = container.querySelectorAll('[data-slot="toggle-group-item"]')
    fireEvent.click(items[0]!)
    expect(items[0]!.getAttribute('data-state')).toBe('on')
    expect(items[1]!.getAttribute('data-state')).toBe('off')
  })

  it('deselects previous when selecting another in single mode', () => {
    const { container } = render(
      <ToggleGroup type="single">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>,
    )
    const items = container.querySelectorAll('[data-slot="toggle-group-item"]')
    fireEvent.click(items[0]!)
    fireEvent.click(items[1]!)
    expect(items[0]!.getAttribute('data-state')).toBe('off')
    expect(items[1]!.getAttribute('data-state')).toBe('on')
  })

  it('calls onValueChange with selected value', () => {
    const handler = mock(() => {})
    const { container } = render(
      <ToggleGroup type="single" onValueChange={handler}>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>,
    )
    fireEvent.click(container.querySelector('[data-slot="toggle-group-item"]')!)
    expect(handler).toHaveBeenCalledWith('a')
  })

  it('supports defaultValue', () => {
    const { container } = render(
      <ToggleGroup type="single" defaultValue="b">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>,
    )
    const items = container.querySelectorAll('[data-slot="toggle-group-item"]')
    expect(items[0]!.getAttribute('data-state')).toBe('off')
    expect(items[1]!.getAttribute('data-state')).toBe('on')
  })

  it('is a radiogroup', () => {
    const { container } = render(
      <ToggleGroup type="single">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>,
    )
    expect(container.querySelector('[data-slot="toggle-group"]')?.getAttribute('role')).toBe('radiogroup')
  })
})

describe('ToggleGroup roles', () => {
  it('makes a multiple group a toolbar', () => {
    const { container } = render(
      <ToggleGroup type="multiple">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>,
    )

    expect(container.querySelector('[data-slot="toggle-group"]')?.getAttribute('role')).toBe('toolbar')
  })

  it('makes a multiple group without roving focus a plain group, since its arrow keys do nothing', () => {
    const { container } = render(
      <ToggleGroup type="multiple" rovingFocus={false} orientation="vertical">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>,
    )
    const root = container.querySelector('[data-slot="toggle-group"]')

    expect(root?.getAttribute('role')).toBe('group')
    expect(root?.hasAttribute('aria-orientation')).toBe(false)
  })

  it('lets a role passed to it win', () => {
    const { container } = render(
      <ToggleGroup type="single" role="group">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>,
    )

    expect(container.querySelector('[data-slot="toggle-group"]')?.getAttribute('role')).toBe('group')
  })

  it('names its orientation when it has one', () => {
    const { container, rerender } = render(
      <ToggleGroup type="multiple" orientation="vertical">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>,
    )
    expect(container.querySelector('[data-slot="toggle-group"]')?.getAttribute('aria-orientation')).toBe('vertical')

    rerender(
      <ToggleGroup type="multiple">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>,
    )
    expect(container.querySelector('[data-slot="toggle-group"]')?.hasAttribute('aria-orientation')).toBe(false)
  })
})

describe('ToggleGroup (multiple)', () => {
  it('allows multiple items to be on', () => {
    const { container } = render(
      <ToggleGroup type="multiple">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>,
    )
    const items = container.querySelectorAll('[data-slot="toggle-group-item"]')
    fireEvent.click(items[0]!)
    fireEvent.click(items[1]!)
    expect(items[0]!.getAttribute('data-state')).toBe('on')
    expect(items[1]!.getAttribute('data-state')).toBe('on')
  })

  it('calls onValueChange with array of values', () => {
    const handler = mock(() => {})
    const { container } = render(
      <ToggleGroup type="multiple" onValueChange={handler}>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>,
    )
    const items = container.querySelectorAll('[data-slot="toggle-group-item"]')
    fireEvent.click(items[0]!)
    expect(handler).toHaveBeenCalledWith(['a'])
    fireEvent.click(items[1]!)
    expect(handler).toHaveBeenCalledWith(['a', 'b'])
  })

  it('toggles item off when clicking again', () => {
    const handler = mock(() => {})
    const { container } = render(
      <ToggleGroup type="multiple" onValueChange={handler}>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>,
    )
    const items = container.querySelectorAll('[data-slot="toggle-group-item"]')
    fireEvent.click(items[0]!)
    fireEvent.click(items[0]!)
    expect(handler).toHaveBeenCalledWith([])
  })

  it('supports defaultValue as array', () => {
    const { container } = render(
      <ToggleGroup type="multiple" defaultValue={['a', 'b']}>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
        <ToggleGroupItem value="c">C</ToggleGroupItem>
      </ToggleGroup>,
    )
    const items = container.querySelectorAll('[data-slot="toggle-group-item"]')
    expect(items[0]!.getAttribute('data-state')).toBe('on')
    expect(items[1]!.getAttribute('data-state')).toBe('on')
    expect(items[2]!.getAttribute('data-state')).toBe('off')
  })
})

describe('ToggleGroup (shared)', () => {
  it('disabled group disables all items', () => {
    const { container } = render(
      <ToggleGroup type="single" disabled>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>,
    )
    const items = container.querySelectorAll('[data-slot="toggle-group-item"]')
    for (const item of items) {
      expect(item.getAttribute('data-disabled')).toBe('')
    }
  })

  it('items have data-state on/off', () => {
    const { container } = render(
      <ToggleGroup type="single" defaultValue="a">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>,
    )
    const items = container.querySelectorAll('[data-slot="toggle-group-item"]')
    expect(items[0]!.getAttribute('data-state')).toBe('on')
    expect(items[1]!.getAttribute('data-state')).toBe('off')
  })

  it('passes className to group', () => {
    const { container } = render(
      <ToggleGroup type="single" className="my-group">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>,
    )
    expect(container.querySelector('.my-group')).not.toBeNull()
  })

  it('sets dir attribute', () => {
    const { container } = render(
      <ToggleGroup type="single" dir="rtl">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>,
    )
    expect(container.querySelector('[data-slot="toggle-group"]')?.getAttribute('dir')).toBe('rtl')
  })

  it('forwards ref', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(
      <ToggleGroup type="single" ref={ref}>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>,
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('flips horizontal arrow keys under a DirectionProvider without a dir prop', async () => {
    const { container } = render(
      <DirectionProvider dir="rtl">
        <ToggleGroup type="single" orientation="horizontal">
          <ToggleGroupItem value="a">A</ToggleGroupItem>
          <ToggleGroupItem value="b">B</ToggleGroupItem>
          <ToggleGroupItem value="c">C</ToggleGroupItem>
        </ToggleGroup>
      </DirectionProvider>,
    )
    expect(container.querySelector('[data-slot="toggle-group"]')?.getAttribute('dir')).toBe('rtl')
    const items = container.querySelectorAll<HTMLButtonElement>('[data-slot="toggle-group-item"]')
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

describe('ToggleGroup without roving focus', () => {
  it('puts every enabled item in the tab order and leaves a disabled one out', () => {
    render(
      <ToggleGroup type="multiple" rovingFocus={false}>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b" disabled>
          B
        </ToggleGroupItem>
        <ToggleGroupItem value="c">C</ToggleGroupItem>
      </ToggleGroup>,
    )

    expect(['A', 'B', 'C'].map((name) => screen.getByText(name).tabIndex)).toEqual([0, -1, 0])
  })
})

describe('ToggleGroup without a type', () => {
  function renderTypelessGroup() {
    render(
      <ToggleGroup>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>,
    )
  }

  it('keeps one item on at a time', () => {
    renderTypelessGroup()

    fireEvent.click(screen.getByText('A'))
    fireEvent.click(screen.getByText('B'))

    expect(['A', 'B'].map((name) => screen.getByText(name).dataset.state)).toEqual(['off', 'on'])
  })

  it('draws its items as radios', () => {
    renderTypelessGroup()

    expect(screen.getByText('A').getAttribute('role')).toBe('radio')
  })
})

describe('ToggleGroup single values', () => {
  const group = (props: React.ComponentProps<typeof ToggleGroup>) => (
    <ToggleGroup {...props}>
      <ToggleGroupItem value="a">A</ToggleGroupItem>
      <ToggleGroupItem value="b">B</ToggleGroupItem>
    </ToggleGroup>
  )

  it('shows one item on once a multiple group becomes single', () => {
    const { rerender } = render(group({ type: 'multiple', defaultValue: ['a', 'b'] }))

    rerender(group({ type: 'single' }))

    expect(screen.getAllByRole('radio').map((radio) => radio.getAttribute('aria-checked'))).toEqual(['true', 'false'])
  })

  it('keeps an item whose value is empty off, as the empty value it reports means', () => {
    render(
      <ToggleGroup type="single">
        <ToggleGroupItem value="">None</ToggleGroupItem>
      </ToggleGroup>,
    )

    fireEvent.click(screen.getByText('None'))

    expect(screen.getByText('None').getAttribute('aria-checked')).toBe('false')
  })
})

describe('ToggleGroup deselectable', () => {
  it('keeps the item of a single group on when it is clicked again', () => {
    const onValueChange = mock()
    render(
      <ToggleGroup type="single" defaultValue="a" deselectable={false} onValueChange={onValueChange}>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>,
    )

    fireEvent.click(screen.getByText('A'))

    expect(screen.getByText('A').dataset.state).toBe('on')
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('still moves a single group to another item', () => {
    render(
      <ToggleGroup type="single" defaultValue="a" deselectable={false}>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>,
    )

    fireEvent.click(screen.getByText('B'))

    expect(['A', 'B'].map((name) => screen.getByText(name).dataset.state)).toEqual(['off', 'on'])
  })

  it('keeps the last item of a multiple group on and lets the others go', () => {
    render(
      <ToggleGroup type="multiple" defaultValue={['a', 'b']} deselectable={false}>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>,
    )

    fireEvent.click(screen.getByText('A'))
    fireEvent.click(screen.getByText('B'))

    expect(['A', 'B'].map((name) => screen.getByText(name).dataset.state)).toEqual(['off', 'on'])
  })
})

describe('ToggleGroup.Item children as a function', () => {
  it('renders what the function returns for each item as the value moves', () => {
    render(
      <ToggleGroup type="single" defaultValue="left">
        <ToggleGroupItem value="left">{(pressed) => (pressed ? 'Left on' : 'Left')}</ToggleGroupItem>
        <ToggleGroupItem value="right">{(pressed) => (pressed ? 'Right on' : 'Right')}</ToggleGroupItem>
      </ToggleGroup>,
    )
    expect(screen.getAllByRole('radio').map((item) => item.textContent)).toEqual(['Left on', 'Right'])

    fireEvent.click(screen.getByText('Right'))

    expect(screen.getAllByRole('radio').map((item) => item.textContent)).toEqual(['Left', 'Right on'])
  })

  it('hands the element it returns to asChild', () => {
    render(
      <ToggleGroup type="multiple" defaultValue={['bold']} rovingFocus={false}>
        <ToggleGroupItem value="bold" asChild>
          {(pressed) => <a href="#bold">{pressed ? 'Bold on' : 'Bold'}</a>}
        </ToggleGroupItem>
      </ToggleGroup>,
    )
    const link = screen.getByText('Bold on')

    expect(link.tagName).toBe('A')
    expect(link.getAttribute('aria-pressed')).toBe('true')
  })
})

describe('ToggleGroup wiring', () => {
  it('forwards its ref as a multiple group too', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(
      <ToggleGroup type="multiple" ref={ref}>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>,
    )

    expect(ref.current?.dataset.slot).toBe('toggle-group')
  })

  it('reads an empty value as nothing on, so an item valued with the empty string starts off', () => {
    render(
      <ToggleGroup type="single">
        <ToggleGroupItem value="">None</ToggleGroupItem>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>,
    )

    expect(screen.getAllByRole('radio').map((item) => item.getAttribute('aria-checked'))).toEqual(['false', 'false'])
  })

  it('follows a controlled multiple value, and reports a press its owner has not taken', () => {
    const onValueChange = mock()
    render(
      <ToggleGroup type="multiple" value={['a']} onValueChange={onValueChange}>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>,
    )

    fireEvent.click(screen.getByText('B'))

    expect(onValueChange).toHaveBeenLastCalledWith(['a', 'b'])
    expect(['A', 'B'].map((name) => screen.getByText(name).getAttribute('aria-pressed'))).toEqual(['true', 'false'])
  })

  it('loops from the last item to the first by default', async () => {
    const { container } = render(
      <ToggleGroup type="single" orientation="horizontal">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
        <ToggleGroupItem value="c">C</ToggleGroupItem>
      </ToggleGroup>,
    )
    const items = container.querySelectorAll<HTMLButtonElement>('[data-slot="toggle-group-item"]')
    const focused: Element[] = []
    for (const item of items) item.addEventListener('focus', () => focused.push(item))
    items[2]!.focus()
    focused.length = 0

    fireEvent.keyDown(items[2]!, { key: 'ArrowRight' })
    await nextTick()

    expect(focused[0]).toBe(items[0]!)
  })

  it('writes its dir without roving focus too', () => {
    const { container } = render(
      <ToggleGroup type="multiple" rovingFocus={false} dir="rtl">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>,
    )

    expect(container.querySelector('[data-slot="toggle-group"]')?.getAttribute('dir')).toBe('rtl')
  })

  it("hands its items its dir, and an item's own dir wins", () => {
    render(
      <ToggleGroup type="single" dir="rtl">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b" dir="ltr">
          B
        </ToggleGroupItem>
      </ToggleGroup>,
    )

    expect(['A', 'B'].map((name) => screen.getByText(name).getAttribute('dir'))).toEqual(['rtl', 'ltr'])
  })

  it('draws its items as buttons that submit no form, with roving focus or without', () => {
    render(
      <>
        <ToggleGroup type="single">
          <ToggleGroupItem value="a">A</ToggleGroupItem>
        </ToggleGroup>
        <ToggleGroup type="multiple" rovingFocus={false}>
          <ToggleGroupItem value="b">B</ToggleGroupItem>
        </ToggleGroup>
      </>,
    )

    expect(['A', 'B'].map((name) => screen.getByText(name).getAttribute('type'))).toEqual(['button', 'button'])
  })

  it('hands its items the scope it is given', () => {
    const useToggleGroupScope = createToggleGroupScope()
    function Scoped() {
      const scope = useToggleGroupScope(undefined)
      return (
        <ToggleGroup {...scope} type="single" defaultValue="a">
          <ToggleGroupItem {...scope} value="a">
            A
          </ToggleGroupItem>
        </ToggleGroup>
      )
    }

    render(<Scoped />)

    expect(screen.getByText('A').getAttribute('data-state')).toBe('on')
  })

  it('names the group and its item in React DevTools', () => {
    expect([ToggleGroup.displayName, ToggleGroupItem.displayName]).toEqual(['ToggleGroup', 'ToggleGroupItem'])
  })
})
