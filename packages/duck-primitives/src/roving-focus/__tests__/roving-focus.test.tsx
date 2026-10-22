import { describe, expect, it } from 'bun:test'
import { act, fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import { freshDom, wait } from '../../__tests__/dom'
import { DirectionProvider } from '../../direction'
import { RovingFocusGroup, RovingFocusGroupItem } from '../index'

freshDom()

describe('RovingFocusGroup', () => {
  it('renders children', () => {
    const { container } = render(
      <RovingFocusGroup>
        <RovingFocusGroupItem>
          <button>A</button>
        </RovingFocusGroupItem>
        <RovingFocusGroupItem>
          <button>B</button>
        </RovingFocusGroupItem>
      </RovingFocusGroup>,
    )
    expect(container.querySelectorAll('button').length).toBe(2)
  })

  it('renders group as a div by default', () => {
    const { container } = render(
      <RovingFocusGroup>
        <RovingFocusGroupItem>
          <button>A</button>
        </RovingFocusGroupItem>
      </RovingFocusGroup>,
    )
    expect(container.querySelector('div')).not.toBeNull()
  })

  it('items render with tabindex', () => {
    const { container } = render(
      <RovingFocusGroup>
        <RovingFocusGroupItem>
          <button>A</button>
        </RovingFocusGroupItem>
        <RovingFocusGroupItem>
          <button>B</button>
        </RovingFocusGroupItem>
      </RovingFocusGroup>,
    )
    const items = container.querySelectorAll('span[tabindex]')
    // Items start with tabindex=-1 (roving tabindex pattern)
    expect(items.length).toBeGreaterThan(0)
    const tabindexes = Array.from(items).map((item) => item.getAttribute('tabindex'))
    expect(tabindexes.every((t) => t === '0' || t === '-1')).toBe(true)
  })

  it('forwards ref to group', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(
      <RovingFocusGroup ref={ref}>
        <RovingFocusGroupItem>
          <button>A</button>
        </RovingFocusGroupItem>
      </RovingFocusGroup>,
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('calls a function child with whether its item is the tab stop and whether the group has one', () => {
    const { container } = render(
      <RovingFocusGroup>
        {['A', 'B'].map((name) => (
          <RovingFocusGroupItem key={name} tabStopId={name}>
            {({ isCurrentTabStop, hasTabStop }) => `${name} ${isCurrentTabStop} ${hasTabStop}`}
          </RovingFocusGroupItem>
        ))}
      </RovingFocusGroup>,
    )
    const states = () =>
      [...container.querySelectorAll('[data-slot="roving-focus-item"]')].map((item) => item.textContent)
    expect(states()).toEqual(['A false false', 'B false false'])

    fireEvent.mouseDown(container.querySelectorAll('[data-slot="roving-focus-item"]')[1]!)

    expect(states()).toEqual(['A false true', 'B true true'])
  })

  it('accepts orientation prop', () => {
    expect(() =>
      render(
        <RovingFocusGroup orientation="horizontal">
          <RovingFocusGroupItem>
            <button>A</button>
          </RovingFocusGroupItem>
        </RovingFocusGroup>,
      ),
    ).not.toThrow()
  })
})

function renderGroupWithUnfocusableItem() {
  render(
    <RovingFocusGroup data-testid="group">
      <RovingFocusGroupItem>A</RovingFocusGroupItem>
      <RovingFocusGroupItem focusable={false}>B</RovingFocusGroupItem>
      <RovingFocusGroupItem>C</RovingFocusGroupItem>
    </RovingFocusGroup>,
  )
}

describe('RovingFocusGroup pointer and tabbing', () => {
  it('prevents a mouse down on an item that cannot take focus', () => {
    renderGroupWithUnfocusableItem()

    expect(fireEvent.mouseDown(screen.getByText('B'))).toBe(false)
    expect(fireEvent.mouseDown(screen.getByText('A'))).toBe(true)
  })

  it('makes the item a mouse down lands on the tab stop', () => {
    renderGroupWithUnfocusableItem()

    fireEvent.mouseDown(screen.getByText('C'))

    expect(screen.getByText('C').tabIndex).toBe(0)
    expect(screen.getByText('A').tabIndex).toBe(-1)
  })

  it('takes the group out of the tab order on Shift+Tab before any microtask, which Firefox automation runs after moving focus', async () => {
    renderGroupWithUnfocusableItem()
    const environment = globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
    const actEnvironment = environment.IS_REACT_ACT_ENVIRONMENT
    environment.IS_REACT_ACT_ENVIRONMENT = false

    screen.getByText('A').dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Tab', shiftKey: true }))
    const tabIndex = screen.getByTestId('group').tabIndex
    await wait(0)
    environment.IS_REACT_ACT_ENVIRONMENT = actEnvironment

    expect(tabIndex).toBe(-1)
  })

  it('moves focus to the last focusable item on End', async () => {
    renderGroupWithUnfocusableItem()
    act(() => screen.getByText('A').focus())

    fireEvent.keyDown(screen.getByText('A'), { key: 'End' })
    await wait(0)

    expect(document.activeElement).toBe(screen.getByText('C'))
  })

  it('leaves focus on the group when a click focused it', () => {
    renderGroupWithUnfocusableItem()
    const group = screen.getByTestId('group')

    fireEvent.mouseDown(group)
    act(() => group.focus())

    expect(document.activeElement).toBe(group)
  })
})

describe('RovingFocusGroup keyboard entry', () => {
  it('hands focus to the active item before the first one', () => {
    render(
      <RovingFocusGroup data-testid="group">
        <RovingFocusGroupItem>A</RovingFocusGroupItem>
        <RovingFocusGroupItem active>B</RovingFocusGroupItem>
      </RovingFocusGroup>,
    )

    act(() => screen.getByTestId('group').focus())

    expect(document.activeElement).toBe(screen.getByText('B'))
  })

  it('hands focus to the first focusable item when none is active', () => {
    renderGroupWithUnfocusableItem()

    act(() => screen.getByTestId('group').focus())

    expect(document.activeElement).toBe(screen.getByText('A'))
  })

  it('hands focus on to an item after a mouse down that moved no focus, as on the item that had it', async () => {
    renderGroupWithUnfocusableItem()
    act(() => screen.getByText('A').focus())
    fireEvent.mouseDown(screen.getByText('A'))
    act(() => screen.getByText('A').blur())
    await wait(0)

    act(() => screen.getByTestId('group').focus())

    expect(document.activeElement).toBe(screen.getByText('A'))
  })

  it('leaves focus on the group when a consumer prevents the entry focus', () => {
    render(
      <RovingFocusGroup data-testid="group" onEntryFocus={(event) => event.preventDefault()}>
        <RovingFocusGroupItem>A</RovingFocusGroupItem>
      </RovingFocusGroup>,
    )
    const group = screen.getByTestId('group')

    act(() => group.focus())

    expect(document.activeElement).toBe(group)
  })
})

describe('RovingFocusGroup arrow keys', () => {
  async function press(from: string, key: string) {
    act(() => screen.getByText(from).focus())
    fireEvent.keyDown(screen.getByText(from), { key })
    await wait(0)
  }

  it('counts a press made before the last one has moved focus from where that one is taking it', async () => {
    render(
      <RovingFocusGroup>
        <RovingFocusGroupItem>A</RovingFocusGroupItem>
        <RovingFocusGroupItem>B</RovingFocusGroupItem>
        <RovingFocusGroupItem>C</RovingFocusGroupItem>
        <RovingFocusGroupItem>D</RovingFocusGroupItem>
      </RovingFocusGroup>,
    )
    act(() => screen.getByText('A').focus())

    fireEvent.keyDown(screen.getByText('A'), { key: 'ArrowRight' })
    fireEvent.keyDown(screen.getByText('A'), { key: 'ArrowRight' })
    await wait(0)

    expect(document.activeElement).toBe(screen.getByText('C'))

    fireEvent.keyDown(screen.getByText('C'), { key: 'End' })
    fireEvent.keyDown(screen.getByText('C'), { key: 'ArrowLeft' })
    fireEvent.keyDown(screen.getByText('C'), { key: 'ArrowLeft' })
    await wait(0)

    expect(document.activeElement).toBe(screen.getByText('B'))
  })

  it('counts a press made before the last one has moved focus from where focus landed, past an item that refused it', async () => {
    render(
      <RovingFocusGroup>
        <RovingFocusGroupItem>A</RovingFocusGroupItem>
        <RovingFocusGroupItem asChild>
          <span ref={(node) => node && Object.assign(node, { focus: () => {} })}>B</span>
        </RovingFocusGroupItem>
        <RovingFocusGroupItem>C</RovingFocusGroupItem>
        <RovingFocusGroupItem>D</RovingFocusGroupItem>
      </RovingFocusGroup>,
    )
    act(() => screen.getByText('A').focus())

    fireEvent.keyDown(screen.getByText('A'), { key: 'ArrowRight' })
    fireEvent.keyDown(screen.getByText('A'), { key: 'ArrowRight' })
    await wait(0)

    expect(document.activeElement).toBe(screen.getByText('D'))
  })

  it('counts a press that lands between two moves from the later one', async () => {
    render(
      <RovingFocusGroup>
        <RovingFocusGroupItem>A</RovingFocusGroupItem>
        <RovingFocusGroupItem>B</RovingFocusGroupItem>
        <RovingFocusGroupItem>C</RovingFocusGroupItem>
        <RovingFocusGroupItem>D</RovingFocusGroupItem>
      </RovingFocusGroup>,
    )
    act(() => screen.getByText('A').focus())

    fireEvent.keyDown(screen.getByText('A'), { key: 'ArrowRight' })
    const between = new Promise<void>((resolve) =>
      setTimeout(() => {
        act(() => {
          fireEvent.keyDown(document.activeElement as Element, { key: 'ArrowRight' })
        })
        resolve()
      }),
    )
    fireEvent.keyDown(screen.getByText('A'), { key: 'ArrowRight' })
    await between
    await wait(0)

    expect(document.activeElement).toBe(screen.getByText('D'))
  })

  it('skips an item that cannot take focus moving forward and back', async () => {
    renderGroupWithUnfocusableItem()

    await press('A', 'ArrowRight')
    expect(document.activeElement).toBe(screen.getByText('C'))

    await press('C', 'ArrowLeft')
    expect(document.activeElement).toBe(screen.getByText('A'))
  })

  it('stops at the last item without loop and wraps with it', async () => {
    const { rerender } = render(
      <RovingFocusGroup>
        <RovingFocusGroupItem>A</RovingFocusGroupItem>
        <RovingFocusGroupItem>B</RovingFocusGroupItem>
      </RovingFocusGroup>,
    )

    await press('B', 'ArrowDown')
    expect(document.activeElement).toBe(screen.getByText('B'))

    rerender(
      <RovingFocusGroup loop>
        <RovingFocusGroupItem>A</RovingFocusGroupItem>
        <RovingFocusGroupItem>B</RovingFocusGroupItem>
      </RovingFocusGroup>,
    )
    await press('B', 'ArrowDown')
    expect(document.activeElement).toBe(screen.getByText('A'))
  })

  it('reads ArrowLeft as forward in a right-to-left group', async () => {
    render(
      <RovingFocusGroup dir="rtl">
        <RovingFocusGroupItem>A</RovingFocusGroupItem>
        <RovingFocusGroupItem>B</RovingFocusGroupItem>
      </RovingFocusGroup>,
    )

    await press('A', 'ArrowLeft')
    expect(document.activeElement).toBe(screen.getByText('B'))

    await press('B', 'ArrowRight')
    expect(document.activeElement).toBe(screen.getByText('A'))
  })

  it('lays its items out the way it reads their keys, writing its direction as dir', () => {
    render(
      <>
        <RovingFocusGroup data-testid="own" dir="rtl">
          <RovingFocusGroupItem>A</RovingFocusGroupItem>
        </RovingFocusGroup>
        <DirectionProvider dir="rtl">
          <RovingFocusGroup data-testid="over provider" dir="ltr">
            <RovingFocusGroupItem>B</RovingFocusGroupItem>
          </RovingFocusGroup>
          <RovingFocusGroup data-testid="provided">
            <RovingFocusGroupItem>C</RovingFocusGroupItem>
          </RovingFocusGroup>
        </DirectionProvider>
      </>,
    )

    expect(['own', 'over provider', 'provided'].map((id) => screen.getByTestId(id).getAttribute('dir'))).toEqual([
      'rtl',
      'ltr',
      'rtl',
    ])
  })

  it('moves only along its orientation, leaving the other arrows to the page', async () => {
    const { rerender } = render(
      <RovingFocusGroup orientation="vertical">
        <RovingFocusGroupItem>A</RovingFocusGroupItem>
        <RovingFocusGroupItem>B</RovingFocusGroupItem>
      </RovingFocusGroup>,
    )
    act(() => screen.getByText('A').focus())
    const verticalRight = fireEvent.keyDown(screen.getByText('A'), { key: 'ArrowRight' })
    await wait(0)
    const afterVerticalRight = document.activeElement

    rerender(
      <RovingFocusGroup orientation="horizontal">
        <RovingFocusGroupItem>A</RovingFocusGroupItem>
        <RovingFocusGroupItem>B</RovingFocusGroupItem>
      </RovingFocusGroup>,
    )
    const horizontalDown = fireEvent.keyDown(screen.getByText('A'), { key: 'ArrowDown' })
    await wait(0)

    expect([verticalRight, afterVerticalRight, horizontalDown, document.activeElement]).toEqual([
      true,
      screen.getByText('A'),
      true,
      screen.getByText('A'),
    ])
  })

  it('reads ArrowDown as forward in a right-to-left group too', async () => {
    render(
      <RovingFocusGroup dir="rtl">
        <RovingFocusGroupItem>A</RovingFocusGroupItem>
        <RovingFocusGroupItem>B</RovingFocusGroupItem>
      </RovingFocusGroup>,
    )

    await press('A', 'ArrowDown')

    expect(document.activeElement).toBe(screen.getByText('B'))
  })

  it('moves focus to the first focusable item on Home', async () => {
    renderGroupWithUnfocusableItem()

    await press('C', 'Home')

    expect(document.activeElement).toBe(screen.getByText('A'))
  })

  it('leaves an arrow key held with a modifier, and a key it does not use, to the page', async () => {
    renderGroupWithUnfocusableItem()
    act(() => screen.getByText('A').focus())

    const handled = [
      fireEvent.keyDown(screen.getByText('A'), { key: 'ArrowRight', shiftKey: true }),
      fireEvent.keyDown(screen.getByText('A'), { key: 'ArrowRight', metaKey: true }),
      fireEvent.keyDown(screen.getByText('A'), { key: 'ArrowRight', ctrlKey: true }),
      fireEvent.keyDown(screen.getByText('A'), { key: 'ArrowRight', altKey: true }),
      fireEvent.keyDown(screen.getByText('A'), { key: 'a' }),
    ]
    await wait(0)

    expect([handled, document.activeElement]).toEqual([[true, true, true, true, true], screen.getByText('A')])
  })

  it('leaves an arrow key pressed inside an item to what was pressed', async () => {
    render(
      <RovingFocusGroup>
        <RovingFocusGroupItem>
          <input aria-label="Name" />
        </RovingFocusGroupItem>
        <RovingFocusGroupItem>B</RovingFocusGroupItem>
      </RovingFocusGroup>,
    )
    const input = screen.getByRole('textbox')
    act(() => input.focus())

    const handled = fireEvent.keyDown(input, { key: 'ArrowRight' })
    await wait(0)

    expect(handled).toBe(true)
    expect(document.activeElement).toBe(input)
  })

  it('passes over an item whose element it cannot reach, by arrow and on entry', async () => {
    function NoRef({ ref: _ref, ...props }: React.ComponentProps<'span'>) {
      return <span {...props} />
    }
    render(
      <RovingFocusGroup data-testid="group">
        <RovingFocusGroupItem>A</RovingFocusGroupItem>
        <RovingFocusGroupItem asChild>
          <NoRef>B</NoRef>
        </RovingFocusGroupItem>
        <RovingFocusGroupItem>C</RovingFocusGroupItem>
      </RovingFocusGroup>,
    )

    act(() => screen.getByTestId('group').focus())
    const entered = document.activeElement
    await press('A', 'ArrowRight')
    const afterArrow = document.activeElement
    await press('C', 'Home')

    expect([entered, afterArrow, document.activeElement]).toEqual([
      screen.getByText('A'),
      screen.getByText('C'),
      screen.getByText('A'),
    ])
  })
})

describe('RovingFocusGroup tab order', () => {
  it('leaves the tab order once no item can take focus', () => {
    const { rerender } = render(
      <RovingFocusGroup data-testid="group">
        <RovingFocusGroupItem>A</RovingFocusGroupItem>
      </RovingFocusGroup>,
    )
    const before = screen.getByTestId('group').tabIndex

    rerender(
      <RovingFocusGroup data-testid="group">
        <RovingFocusGroupItem focusable={false}>A</RovingFocusGroupItem>
      </RovingFocusGroup>,
    )

    expect([before, screen.getByTestId('group').tabIndex]).toEqual([0, -1])
  })
})

describe('RovingFocusGroup slotted onto an element of its own', () => {
  it("keeps the element's own tabIndex, and puts one without it in the tab order", () => {
    render(
      <>
        <RovingFocusGroup asChild>
          <div data-testid="kept" tabIndex={-1}>
            <RovingFocusGroupItem>A</RovingFocusGroupItem>
          </div>
        </RovingFocusGroup>
        <RovingFocusGroup asChild>
          <div data-testid="entered">
            <RovingFocusGroupItem>B</RovingFocusGroupItem>
          </div>
        </RovingFocusGroup>
      </>,
    )

    expect([screen.getByTestId('kept').tabIndex, screen.getByTestId('entered').tabIndex]).toEqual([-1, 0])
  })
})

describe('RovingFocusGroup in another root', () => {
  function renderInto(container: HTMLElement) {
    render(
      <RovingFocusGroup>
        <RovingFocusGroupItem>A</RovingFocusGroupItem>
        <RovingFocusGroupItem>B</RovingFocusGroupItem>
        <RovingFocusGroupItem>C</RovingFocusGroupItem>
      </RovingFocusGroup>,
      { container },
    )
    return (name: string) => [...container.querySelectorAll('span')].find((item) => item.textContent === name)!
  }

  async function arrowFrom(item: HTMLElement) {
    act(() => item.focus())
    fireEvent.keyDown(item, { key: 'ArrowRight' })
    await wait(0)
  }

  it('moves one item at a time inside a shadow root', async () => {
    const host = document.body.appendChild(document.createElement('div'))
    const root = host.attachShadow({ mode: 'open' })
    const item = renderInto(root.appendChild(document.createElement('div')))

    await arrowFrom(item('A'))

    expect(root.activeElement).toBe(item('B'))
    host.remove()
  })

  it('moves one item at a time inside an iframe', async () => {
    const frame = document.body.appendChild(document.createElement('iframe'))
    const frameDocument = frame.contentDocument!
    const item = renderInto(frameDocument.body.appendChild(frameDocument.createElement('div')))

    await arrowFrom(item('A'))

    expect(frameDocument.activeElement).toBe(item('B'))
    frame.remove()
  })
})
