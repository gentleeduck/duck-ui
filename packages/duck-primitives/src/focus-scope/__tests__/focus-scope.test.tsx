import { act, fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { freshDom, wait } from '../../__tests__/dom'
import { FocusScope } from '../focus-scope'

freshDom()

describe('FocusScope', () => {
  it('renders children', () => {
    const { container } = render(
      <FocusScope>
        <button>Inside</button>
      </FocusScope>,
    )
    expect(container.querySelector('button')?.textContent).toBe('Inside')
  })

  it('renders as a div', () => {
    const { container } = render(
      <FocusScope>
        <input type="text" />
      </FocusScope>,
    )
    expect(container.querySelector('div')).not.toBeNull()
  })

  it('forwards ref', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(
      <FocusScope ref={ref}>
        <span>content</span>
      </FocusScope>,
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('passes className through', () => {
    const { container } = render(
      <FocusScope className="scope-class">
        <span>content</span>
      </FocusScope>,
    )
    expect(container.querySelector('.scope-class')).not.toBeNull()
  })
})

describe('FocusScope onKeyDown', () => {
  it('hands each key to its own onKeyDown', () => {
    const onKeyDown = vi.fn((event: React.KeyboardEvent) => event.key)
    render(
      <FocusScope loop onKeyDown={onKeyDown}>
        <button type="button">Only</button>
      </FocusScope>,
    )

    fireEvent.keyDown(screen.getByText('Only'), { key: 'Tab' })

    expect(onKeyDown.mock.results.map((result) => result.value)).toEqual(['Tab'])
  })

  it('loops no Tab its onKeyDown prevented, since that handler runs first', () => {
    render(
      <FocusScope loop onKeyDown={(event) => event.preventDefault()}>
        <button type="button">First</button>
        <button type="button">Last</button>
      </FocusScope>,
    )
    const last = screen.getByText('Last')
    act(() => last.focus())

    fireEvent.keyDown(last, { key: 'Tab' })

    expect(document.activeElement).toBe(last)
  })
})

describe('FocusScope trapped with nothing visible to tab to', () => {
  it('keeps Tab on the container when its only tabbable is hidden', async () => {
    render(
      <FocusScope trapped data-testid="scope">
        <div style={{ display: 'none' }}>
          <button type="button">Hidden</button>
        </div>
      </FocusScope>,
    )
    const scope = screen.getByTestId('scope')
    act(() => scope.focus())

    expect(fireEvent.keyDown(scope, { key: 'Tab' })).toBe(false)
  })
})

describe('FocusScope trapped when the focused element goes', () => {
  it('takes focus back to the container', async () => {
    function Scope({ showButton }: { showButton: boolean }) {
      return (
        <FocusScope trapped data-testid="scope">
          <span>Text</span>
          {showButton ? <button type="button">Go</button> : null}
        </FocusScope>
      )
    }
    const { rerender } = render(<Scope showButton />)
    act(() => screen.getByText('Go').focus())

    rerender(<Scope showButton={false} />)
    await wait(0)

    expect(document.activeElement).toBe(screen.getByTestId('scope'))
  })

  it('leaves focus alone when content is only added while nothing has focus', async () => {
    function Scope({ more }: { more: boolean }) {
      return (
        <FocusScope trapped>
          <button type="button">Go</button>
          {more ? <span>More</span> : null}
        </FocusScope>
      )
    }
    const { rerender } = render(<Scope more={false} />)
    act(() => screen.getByText('Go').blur())

    rerender(<Scope more />)
    await wait(0)

    expect(document.activeElement).toBe(document.body)
  })

  it('leaves focus where it is when another element inside goes', async () => {
    function Scope({ more }: { more: boolean }) {
      return (
        <FocusScope trapped>
          <button type="button">Go</button>
          {more ? <button type="button">More</button> : null}
        </FocusScope>
      )
    }
    const { rerender } = render(<Scope more />)
    act(() => screen.getByText('Go').focus())

    rerender(<Scope more={false} />)
    await wait(0)

    expect(document.activeElement).toBe(screen.getByText('Go'))
  })
})

describe('FocusScope among other trapped scopes', () => {
  it('traps again once a scope opened inside it closes', async () => {
    function Nested({ inner }: { inner: boolean }) {
      return (
        <>
          <FocusScope trapped>
            <button type="button">Outer</button>
            {inner ? (
              <FocusScope trapped>
                <button type="button">Inner</button>
              </FocusScope>
            ) : null}
          </FocusScope>
          <button type="button">Outside</button>
        </>
      )
    }
    const { rerender } = render(<Nested inner={false} />)
    rerender(<Nested inner />)
    rerender(<Nested inner={false} />)
    await wait(0)

    act(() => screen.getByText('Outside').focus())

    expect(document.activeElement).toBe(screen.getByText('Outer'))
  })

  it('leaves focus going outside both to the scope opened inside it, never taking it to its own element', () => {
    const outerFocus = vi.fn()
    function Nested({ inner }: { inner: boolean }) {
      return (
        <>
          <FocusScope trapped>
            <button type="button" onFocus={outerFocus}>
              Outer
            </button>
            {inner ? (
              <FocusScope trapped>
                <button type="button">Inner</button>
              </FocusScope>
            ) : null}
          </FocusScope>
          <button type="button">Outside</button>
        </>
      )
    }
    const { rerender } = render(<Nested inner={false} />)
    rerender(<Nested inner />)
    outerFocus.mockClear()

    act(() => screen.getByText('Outside').focus())

    expect([document.activeElement?.textContent, outerFocus.mock.calls.length]).toEqual(['Inner', 0])
  })

  it('keeps the scope under it paused after it renders another element', async () => {
    function Stacked({ section }: { section: boolean }) {
      const inside = <button type="button">Inner</button>
      return (
        <>
          <FocusScope trapped>
            <button type="button">Outer</button>
          </FocusScope>
          <FocusScope trapped asChild>
            {section ? <section>{inside}</section> : <div>{inside}</div>}
          </FocusScope>
        </>
      )
    }
    const { rerender } = render(<Stacked section={false} />)
    rerender(<Stacked section />)
    await wait(0)

    act(() => screen.getByText('Outer').focus())

    expect(document.activeElement).toBe(screen.getByText('Inner'))
  })

  it('leaves a scope opened after it in charge when it renders another element', async () => {
    function Stacked({ section }: { section: boolean }) {
      const inside = <button type="button">Under</button>
      return (
        <>
          <FocusScope trapped asChild>
            {section ? <section>{inside}</section> : <div>{inside}</div>}
          </FocusScope>
          <FocusScope trapped>
            <button type="button">Over</button>
          </FocusScope>
        </>
      )
    }
    const { rerender } = render(<Stacked section={false} />)
    rerender(<Stacked section />)
    await wait(0)

    act(() => screen.getByText('Under').focus())

    expect(document.activeElement).toBe(screen.getByText('Over'))
  })

  it('keeps trapping after the element it renders is replaced', async () => {
    function Swapping({ section }: { section: boolean }) {
      const inside = <button type="button">Inside</button>
      return (
        <>
          <FocusScope trapped asChild>
            {section ? <section>{inside}</section> : <div>{inside}</div>}
          </FocusScope>
          <button type="button">Outside</button>
        </>
      )
    }
    const { rerender } = render(<Swapping section={false} />)
    rerender(<Swapping section />)
    await wait(0)

    act(() => screen.getByText('Outside').focus())

    expect(document.activeElement).toBe(screen.getByText('Inside'))
  })
})

describe('FocusScope rendering another element', () => {
  it('neither gives focus back nor reports an unmount until it unmounts, then gives it to what had it first', async () => {
    const onUnmountAutoFocus = vi.fn()
    function Opened({ open, section }: { open: boolean; section: boolean }) {
      const inside = <button type="button">Inside</button>
      return (
        <>
          <button type="button">Open</button>
          {open ? (
            <FocusScope asChild onUnmountAutoFocus={onUnmountAutoFocus}>
              {section ? <section>{inside}</section> : <div>{inside}</div>}
            </FocusScope>
          ) : null}
        </>
      )
    }
    const { rerender } = render(<Opened open={false} section={false} />)
    act(() => screen.getByText('Open').focus())
    rerender(<Opened open section={false} />)
    rerender(<Opened open section />)
    await wait(0)

    expect([document.activeElement?.textContent, onUnmountAutoFocus.mock.calls.length]).toEqual(['Inside', 0])

    rerender(<Opened open={false} section />)
    await wait(0)

    expect([document.activeElement?.textContent, onUnmountAutoFocus.mock.calls.length]).toEqual(['Open', 1])
  })
})

describe('FocusScope whose element goes and comes back', () => {
  it('gives focus back on unmount to what had it when the element came back', async () => {
    function Maybe(props: { shown: boolean; ref?: React.Ref<HTMLDivElement> }) {
      return props.shown ? (
        <div ref={props.ref}>
          <button type="button">Inside</button>
        </div>
      ) : null
    }
    function Case({ scope, shown }: { scope: boolean; shown: boolean }) {
      return (
        <>
          <button type="button">Before</button>
          <button type="button">Again</button>
          {scope ? (
            <FocusScope asChild>
              <Maybe shown={shown} />
            </FocusScope>
          ) : null}
        </>
      )
    }
    const { rerender } = render(<Case scope={false} shown />)
    act(() => screen.getByText('Before').focus())
    rerender(<Case scope shown />)
    rerender(<Case scope shown={false} />)
    await wait(0)
    act(() => screen.getByText('Again').focus())
    rerender(<Case scope shown />)

    rerender(<Case scope={false} shown />)
    await wait(0)

    expect(document.activeElement?.textContent).toBe('Again')
  })
})

describe('FocusScope focusing an input', () => {
  it('selects its text on mount and again when focus comes back to it', async () => {
    function Scope({ open }: { open: boolean }) {
      return (
        <>
          <input defaultValue="outside" />
          {open ? (
            <FocusScope trapped>
              <input defaultValue="inside" />
            </FocusScope>
          ) : null}
        </>
      )
    }
    const { rerender } = render(<Scope open={false} />)
    const outside = screen.getByDisplayValue<HTMLInputElement>('outside')
    act(() => outside.focus())
    outside.setSelectionRange(0, 0)

    rerender(<Scope open />)
    const inside = screen.getByDisplayValue<HTMLInputElement>('inside')
    expect([document.activeElement, inside.selectionStart, inside.selectionEnd]).toEqual([inside, 0, 6])

    rerender(<Scope open={false} />)
    await wait(0)
    expect([document.activeElement, outside.selectionStart, outside.selectionEnd]).toEqual([outside, 0, 7])
  })

  it('leaves the caret where it is when a Tab loops back onto the input it is in', () => {
    render(
      <FocusScope loop>
        <input defaultValue="inside" />
      </FocusScope>,
    )
    const input = screen.getByDisplayValue<HTMLInputElement>('inside')
    input.setSelectionRange(2, 2)

    expect(fireEvent.keyDown(input, { key: 'Tab' })).toBe(false)

    expect([document.activeElement, input.selectionStart, input.selectionEnd]).toEqual([input, 2, 2])
  })
})

describe('FocusScope where the browser has checkVisibility', () => {
  // jsdom has no checkVisibility, so this one reads a marker the CSS fallback cannot see.
  const checkVisibility = vi.fn(function (this: Element) {
    return !this.hasAttribute('data-invisible')
  })

  afterEach(() => {
    Reflect.deleteProperty(Element.prototype, 'checkVisibility')
    checkVisibility.mockClear()
  })

  function tabFromLast(scopeProps: Record<string, unknown> = {}) {
    Object.defineProperty(Element.prototype, 'checkVisibility', { configurable: true, value: checkVisibility })
    render(
      <FocusScope trapped loop {...scopeProps}>
        <button type="button" data-invisible>
          Unseen
        </button>
        <button type="button">First</button>
        <button type="button">Last</button>
      </FocusScope>,
    )
    const last = screen.getByText('Last')
    act(() => last.focus())
    fireEvent.keyDown(last, { key: 'Tab' })
    return document.activeElement?.textContent
  }

  it('skips what it reports as invisible, asking for the visibility property under both names', () => {
    expect(tabFromLast()).toBe('First')
    expect(checkVisibility.mock.calls[0]).toEqual([{ checkVisibilityCSS: true, visibilityProperty: true }])
  })

  it('falls back to computed styles while the scope itself is invisible', () => {
    expect(tabFromLast({ 'data-invisible': '' })).toBe('Unseen')
  })
})

function tabFrom(name: string, { shiftKey = false } = {}) {
  const from = screen.getByRole('radio', { name }) as HTMLElement
  act(() => from.focus())
  return fireEvent.keyDown(from, { key: 'Tab', shiftKey })
}

describe('FocusScope looping past native radios', () => {
  it('loops on a Tab from either end of an unchecked group that ends it, since Tab leaves the group from each', () => {
    render(
      <FocusScope loop trapped>
        <button type="button">First</button>
        <input type="radio" name="size" aria-label="Small" />
        <input type="radio" name="size" aria-label="Large" />
      </FocusScope>,
    )

    expect(tabFrom('Small')).toBe(false)

    expect(document.activeElement).toBe(screen.getByText('First'))
  })

  it('loops on a Shift+Tab from either end of an unchecked group that starts it', () => {
    render(
      <FocusScope loop trapped>
        <input type="radio" name="size" aria-label="Small" />
        <input type="radio" name="size" aria-label="Large" />
        <button type="button">Last</button>
      </FocusScope>,
    )

    expect(tabFrom('Large', { shiftKey: true })).toBe(false)

    expect(document.activeElement).toBe(screen.getByText('Last'))
  })

  it('loops onto the checked radio of the group that starts it, as Tab into a group does', () => {
    render(
      <FocusScope loop trapped>
        <input type="radio" name="size" aria-label="Small" />
        <input type="radio" name="size" aria-label="Large" defaultChecked />
        <button type="button">Last</button>
      </FocusScope>,
    )
    const last = screen.getByText('Last')
    act(() => last.focus())

    fireEvent.keyDown(last, { key: 'Tab' })

    expect(document.activeElement).toBe(screen.getByRole('radio', { name: 'Large' }))
  })

  it('loops back onto the checked radio of the group that ends it', () => {
    render(
      <FocusScope loop trapped>
        <button type="button">First</button>
        <input type="radio" name="size" aria-label="Small" defaultChecked />
        <input type="radio" name="size" aria-label="Large" />
      </FocusScope>,
    )
    const first = screen.getByText('First')
    act(() => first.focus())

    fireEvent.keyDown(first, { key: 'Tab', shiftKey: true })

    expect(document.activeElement).toBe(screen.getByRole('radio', { name: 'Small' }))
  })

  it('reaches an element between an unchecked radio and the checked one of its group', () => {
    render(
      <FocusScope loop trapped>
        <input type="radio" name="size" aria-label="Small" />
        <button type="button">Middle</button>
        <input type="radio" name="size" aria-label="Large" defaultChecked />
      </FocusScope>,
    )

    expect(tabFrom('Large')).toBe(false)

    expect(document.activeElement).toBe(screen.getByText('Middle'))
  })

  it('keeps a group in a shadow root apart from radios of the same name outside it', () => {
    const host = document.createElement('div')
    const medium = host.attachShadow({ mode: 'open' }).appendChild(document.createElement('input'))
    Object.assign(medium, { type: 'radio', name: 'size', checked: true })
    render(
      <FocusScope loop trapped>
        <input type="radio" name="size" aria-label="Small" />
        <button type="button">Middle</button>
        <div ref={(node) => node?.append(host)} />
      </FocusScope>,
    )
    act(() => medium.focus())

    expect(fireEvent.keyDown(medium, { key: 'Tab' })).toBe(false)

    expect(document.activeElement).toBe(screen.getByRole('radio', { name: 'Small' }))
  })

  it('leaves the Tab to the browser when the next group is still inside', () => {
    render(
      <FocusScope loop trapped>
        <button type="button">First</button>
        <input type="radio" name="size" aria-label="Small" />
        <input type="radio" name="colour" aria-label="Red" />
      </FocusScope>,
    )

    expect(tabFrom('Small')).toBe(true)
  })

  it('reads checkboxes sharing a name as a stop each', () => {
    render(
      <FocusScope loop trapped>
        <button type="button">First</button>
        <input type="checkbox" name="size" aria-label="Small" />
        <input type="checkbox" name="size" aria-label="Large" />
      </FocusScope>,
    )
    const small = screen.getByRole('checkbox', { name: 'Small' })
    act(() => small.focus())

    expect(fireEvent.keyDown(small, { key: 'Tab' })).toBe(true)
  })

  it('reads each radio without a name as a group of its own', () => {
    render(
      <FocusScope loop trapped>
        <button type="button">First</button>
        <input type="radio" aria-label="Small" />
        <input type="radio" aria-label="Large" />
      </FocusScope>,
    )

    expect(tabFrom('Small')).toBe(true)
  })

  it('reads radios of the same name in two forms as two groups', () => {
    render(
      <FocusScope loop trapped>
        <button type="button">First</button>
        <form>
          <input type="radio" name="size" aria-label="Small" />
        </form>
        <form>
          <input type="radio" name="size" aria-label="Large" />
        </form>
      </FocusScope>,
    )

    expect(tabFrom('Small')).toBe(true)
  })
})

function tabFromLast() {
  const last = screen.getByText('Last')
  act(() => last.focus())
  return fireEvent.keyDown(last, { key: 'Tab' })
}

describe('FocusScope on mount', () => {
  it('moves on to the next element when the first will not take focus', () => {
    const refusesFocus = (node: HTMLButtonElement | null) => {
      if (node) node.focus = () => {}
    }
    render(
      <FocusScope>
        <button type="button" ref={refusesFocus}>
          Refuses
        </button>
        <button type="button">Takes</button>
      </FocusScope>,
    )

    expect(document.activeElement).toBe(screen.getByText('Takes'))
  })

  it('passes over a link to focus the first element after it', () => {
    render(
      <FocusScope>
        <a href="#help">Help</a>
        <button type="button">First</button>
      </FocusScope>,
    )

    expect(document.activeElement?.textContent).toBe('First')
  })

  it('passes over an svg link to focus the first element after it', () => {
    render(
      <FocusScope>
        <svg aria-label="Logo">
          <a href="#home" tabIndex={0}>
            <text>Home</text>
          </a>
        </svg>
        <button type="button">First</button>
      </FocusScope>,
    )

    expect(document.activeElement?.textContent).toBe('First')
  })

  it('focuses its own element when nothing inside takes focus', () => {
    render(
      <FocusScope data-testid="scope">
        <span>Nothing to focus</span>
      </FocusScope>,
    )

    expect(document.activeElement).toBe(screen.getByTestId('scope'))
  })

  it('leaves focus where it is when an element inside already has it', () => {
    const onMountAutoFocus = vi.fn()
    render(
      <FocusScope onMountAutoFocus={onMountAutoFocus}>
        <button type="button">First</button>
        {/* biome-ignore lint/a11y/noAutofocus: the focus the scope finds already inside it */}
        <input aria-label="Focused" autoFocus />
      </FocusScope>,
    )

    expect([document.activeElement?.getAttribute('aria-label'), onMountAutoFocus.mock.calls.length]).toEqual([
      'Focused',
      0,
    ])
  })
})

describe('FocusScope trapped', () => {
  it('lets focus go outside a scope that has never held it, with nothing to send it back to', () => {
    const errors: unknown[] = []
    const record = (event: ErrorEvent) => errors.push(event.error)
    window.addEventListener('error', record)
    render(
      <>
        <FocusScope trapped onMountAutoFocus={(event) => event.preventDefault()}>
          <button type="button">Inside</button>
        </FocusScope>
        <button type="button">Outside</button>
      </>,
    )

    act(() => screen.getByText('Outside').focus())
    window.removeEventListener('error', record)

    expect([document.activeElement?.textContent, errors]).toEqual(['Outside', []])
  })

  it('takes focus to its own element when the element it last held has gone', () => {
    const branch = document.body.appendChild(document.createElement('div'))
    const portalled = branch.appendChild(document.createElement('button'))
    render(
      <>
        <FocusScope branches={[branch]} data-testid="scope" trapped>
          <button type="button">Inside</button>
        </FocusScope>
        <button type="button">Outside</button>
      </>,
    )
    act(() => portalled.focus())
    branch.remove()

    act(() => screen.getByText('Outside').focus())

    expect(document.activeElement).toBe(screen.getByTestId('scope'))
  })

  it('holds Tab on the last element and Shift+Tab on the first without loop', () => {
    render(
      <FocusScope trapped>
        <button type="button">First</button>
        <button type="button">Last</button>
      </FocusScope>,
    )
    const first = screen.getByText('First')
    const last = screen.getByText('Last')

    act(() => last.focus())
    const tab = [fireEvent.keyDown(last, { key: 'Tab' }), document.activeElement?.textContent]
    act(() => first.focus())
    const shiftTab = [fireEvent.keyDown(first, { key: 'Tab', shiftKey: true }), document.activeElement?.textContent]

    expect([tab, shiftTab]).toEqual([
      [false, 'Last'],
      [false, 'First'],
    ])
  })

  it('leaves a Tab to the browser from an element Tab cannot reach when nothing inside can be tabbed to', () => {
    render(
      <FocusScope trapped>
        <div tabIndex={-1}>Programmatic</div>
      </FocusScope>,
    )
    const inner = screen.getByText('Programmatic')
    act(() => inner.focus())

    expect(fireEvent.keyDown(inner, { key: 'Tab' })).toBe(true)
  })
})

describe('FocusScope leaving Tab to the browser', () => {
  it('when it neither loops nor traps', () => {
    render(
      <FocusScope>
        <button type="button">Only</button>
      </FocusScope>,
    )
    const only = screen.getByText('Only')
    act(() => only.focus())

    expect(fireEvent.keyDown(only, { key: 'Tab' })).toBe(true)
  })

  it('with Alt, Ctrl or Meta held, which the browser and the system keep for their own shortcuts', () => {
    render(
      <FocusScope loop trapped>
        <button type="button">First</button>
        <button type="button">Last</button>
      </FocusScope>,
    )
    act(() => screen.getByText('Last').focus())

    const handled = (['altKey', 'ctrlKey', 'metaKey'] as const).map((modifier) =>
      fireEvent.keyDown(screen.getByText('Last'), { key: 'Tab', [modifier]: true }),
    )

    expect([handled, document.activeElement?.textContent]).toEqual([[true, true, true], 'Last'])
  })

  it('while a scope opened after it holds the keyboard', () => {
    render(
      <>
        <FocusScope loop>
          <button type="button">Under</button>
        </FocusScope>
        <FocusScope loop>
          <button type="button">Over</button>
        </FocusScope>
      </>,
    )
    const under = screen.getByText('Under')
    act(() => under.focus())

    expect(fireEvent.keyDown(under, { key: 'Tab' })).toBe(true)
  })
})

describe('FocusScope and a focusable svg', () => {
  it('reads a focusable svg at the end as the last stop', () => {
    render(
      <FocusScope loop>
        <button type="button">First</button>
        <button type="button">Middle</button>
        <svg tabIndex={0} aria-label="Icon" />
      </FocusScope>,
    )
    const middle = screen.getByText('Middle')
    act(() => middle.focus())
    const fromMiddle = fireEvent.keyDown(middle, { key: 'Tab' })
    const icon = screen.getByLabelText('Icon')
    act(() => icon.focus())
    fireEvent.keyDown(icon, { key: 'Tab' })

    expect([fromMiddle, document.activeElement?.textContent]).toEqual([true, 'First'])
  })
})

describe('FocusScope skipping what cannot take focus', () => {
  it('loops past an element at the end hidden by its visibility', () => {
    render(
      <FocusScope loop>
        <button type="button">First</button>
        <button type="button">Middle</button>
        <button type="button" style={{ visibility: 'hidden' }}>
          Hidden
        </button>
      </FocusScope>,
    )
    const middle = screen.getByText('Middle')
    act(() => middle.focus())

    fireEvent.keyDown(middle, { key: 'Tab' })

    expect(document.activeElement).toBe(screen.getByText('First'))
  })

  it('loops past the end when what follows is inert', () => {
    render(
      <FocusScope loop trapped>
        <button type="button">First</button>
        <button type="button">Last</button>
        <div inert>
          <button type="button">Asleep</button>
        </div>
      </FocusScope>,
    )

    expect(tabFromLast()).toBe(false)

    expect(document.activeElement).toBe(screen.getByText('First'))
  })

  it('loops past the end when what follows is a hidden input', () => {
    render(
      <FocusScope loop trapped>
        <button type="button">First</button>
        <button type="button">Last</button>
        <input type="hidden" name="token" />
      </FocusScope>,
    )

    expect(tabFromLast()).toBe(false)

    expect(document.activeElement).toBe(screen.getByText('First'))
  })

  it('loops past the end when what follows is in a disabled fieldset', () => {
    render(
      <FocusScope loop trapped>
        <button type="button">First</button>
        <button type="button">Last</button>
        <fieldset disabled>
          <button type="button">Off</button>
        </fieldset>
      </FocusScope>,
    )

    expect(tabFromLast()).toBe(false)

    expect(document.activeElement).toBe(screen.getByText('First'))
  })

  it('focuses past the content of a hidden element on mount', () => {
    render(
      <FocusScope trapped>
        <div hidden>
          <button type="button">Hidden</button>
        </div>
        <button type="button">Shown</button>
      </FocusScope>,
    )

    expect(document.activeElement).toBe(screen.getByText('Shown'))
  })
})

function Form() {
  return (
    <>
      <FocusScope loop trapped>
        <button type="button">First</button>
        <button type="button">Last</button>
      </FocusScope>
      <button type="button">Outside</button>
    </>
  )
}

describe('FocusScope in an iframe', () => {
  function inFrame() {
    const frame = document.createElement('iframe')
    document.body.append(frame)
    const frameDocument = frame.contentDocument as Document
    const container = frameDocument.body.appendChild(frameDocument.createElement('div'))
    const { unmount } = render(<Form />, { container })
    const button = (name: string) =>
      [...frameDocument.querySelectorAll('button')].find((element) => element.textContent === name) as HTMLElement
    return { button, frame, frameDocument, unmount }
  }

  it('focuses its first element on mount and loops Tab from its last, in the frame document', () => {
    const { button, frame, frameDocument, unmount } = inFrame()

    expect(frameDocument.activeElement).toBe(button('First'))

    act(() => button('Last').focus())
    fireEvent.keyDown(button('Last'), { key: 'Tab' })

    expect(frameDocument.activeElement).toBe(button('First'))
    unmount()
    frame.remove()
  })

  it('focuses its own element when nothing inside takes focus, in the frame document', () => {
    const frame = document.createElement('iframe')
    document.body.append(frame)
    const frameDocument = frame.contentDocument as Document
    const container = frameDocument.body.appendChild(frameDocument.createElement('div'))
    const { unmount } = render(
      <FocusScope data-testid="scope">
        <span>Nothing to focus</span>
      </FocusScope>,
      { container },
    )

    expect(frameDocument.activeElement).toBe(frameDocument.querySelector('[data-testid="scope"]'))
    unmount()
    frame.remove()
  })

  it('takes focus back from outside it, in the frame document', () => {
    const { button, frame, frameDocument, unmount } = inFrame()

    act(() => button('Outside').focus())

    expect(frameDocument.activeElement).toBe(button('First'))
    unmount()
    frame.remove()
  })

  it('takes focus to its own element when the focused element goes, in the frame document', async () => {
    const frame = document.body.appendChild(document.createElement('iframe'))
    const frameDocument = frame.contentDocument as Document
    const container = frameDocument.body.appendChild(frameDocument.createElement('div'))
    function Scope({ shown }: { shown: boolean }) {
      return (
        <FocusScope data-testid="scope" trapped>
          {shown ? <button type="button">Going</button> : null}
        </FocusScope>
      )
    }
    const { rerender, unmount } = render(<Scope shown />, { container })
    rerender(<Scope shown={false} />)
    await wait(0)

    expect(frameDocument.activeElement).toBe(frameDocument.querySelector('[data-testid="scope"]'))
    unmount()
    frame.remove()
  })

  it('gives focus back to what had it in the frame document on unmount', async () => {
    const frame = document.body.appendChild(document.createElement('iframe'))
    const frameDocument = frame.contentDocument as Document
    const container = frameDocument.body.appendChild(frameDocument.createElement('div'))
    function Opened({ open }: { open: boolean }) {
      return (
        <>
          <button type="button">Open</button>
          {open ? (
            <FocusScope>
              <button type="button">Inside</button>
            </FocusScope>
          ) : null}
        </>
      )
    }
    const { rerender, unmount } = render(<Opened open={false} />, { container })
    act(() => (frameDocument.querySelector('button') as HTMLElement).focus())
    rerender(<Opened open />)
    rerender(<Opened open={false} />)
    await wait(0)

    expect(frameDocument.activeElement?.textContent).toBe('Open')
    unmount()
    frame.remove()
  })
})

describe('FocusScope holding a shadow root', () => {
  it('gives focus back to the field inside it, not to its host', () => {
    const host = document.createElement('div')
    const field = host.attachShadow({ mode: 'open' }).appendChild(document.createElement('input'))
    render(
      <>
        <FocusScope trapped>
          <div ref={(node) => node?.append(host)} />
        </FocusScope>
        <button type="button">Outside</button>
      </>,
    )
    act(() => field.focus())

    act(() => screen.getByText('Outside').focus())

    expect(host.shadowRoot?.activeElement).toBe(field)
  })

  it('reads a field inside the shadow root at its end as its last stop', () => {
    const host = document.createElement('div')
    const field = host.attachShadow({ mode: 'open' }).appendChild(document.createElement('input'))
    render(
      <FocusScope loop trapped>
        <button type="button">First</button>
        <div ref={(node) => node?.append(host)} />
      </FocusScope>,
    )
    act(() => field.focus())

    expect(fireEvent.keyDown(field, { key: 'Tab' })).toBe(false)

    expect(document.activeElement).toBe(screen.getByText('First'))
  })

  it('reads an element slotted into the shadow root where its slot is', () => {
    const host = document.createElement('div')
    const shadowRoot = host.attachShadow({ mode: 'open' })
    shadowRoot.append(document.createElement('slot'), document.createElement('input'))
    const slotted = host.appendChild(document.createElement('button'))
    render(
      <FocusScope loop trapped>
        <button type="button">First</button>
        <div ref={(node) => node?.append(host)} />
      </FocusScope>,
    )
    act(() => slotted.focus())

    expect(fireEvent.keyDown(slotted, { key: 'Tab' })).toBe(true)
  })
})

describe('FocusScope in a shadow root', () => {
  function inShadowRoot() {
    const host = document.body.appendChild(document.createElement('div'))
    const shadowRoot = host.attachShadow({ mode: 'open' })
    const container = shadowRoot.appendChild(document.createElement('div'))
    const { unmount } = render(<Form />, { container })
    const button = (name: string) =>
      [...shadowRoot.querySelectorAll('button')].find((element) => element.textContent === name) as HTMLElement
    return { button, host, shadowRoot, unmount }
  }

  it('focuses its first element on mount and loops Tab from its last', () => {
    const { button, host, shadowRoot, unmount } = inShadowRoot()

    expect(shadowRoot.activeElement).toBe(button('First'))

    act(() => button('Last').focus())
    fireEvent.keyDown(button('Last'), { key: 'Tab' })

    expect(shadowRoot.activeElement).toBe(button('First'))
    unmount()
    host.remove()
  })

  it('takes focus back from outside it, and from outside its shadow root', () => {
    const { button, host, shadowRoot, unmount } = inShadowRoot()
    const page = document.body.appendChild(document.createElement('button'))

    act(() => button('Outside').focus())
    const fromOutside = shadowRoot.activeElement
    act(() => page.focus())

    expect([fromOutside, shadowRoot.activeElement]).toEqual([button('First'), button('First')])
    unmount()
    host.remove()
    page.remove()
  })

  it('gives focus back to what had it inside the shadow root on unmount', async () => {
    const host = document.body.appendChild(document.createElement('div'))
    const shadowRoot = host.attachShadow({ mode: 'open' })
    const container = shadowRoot.appendChild(document.createElement('div'))
    function Opened({ open }: { open: boolean }) {
      return (
        <>
          <button type="button">Open</button>
          {open ? (
            <FocusScope>
              <button type="button">Inside</button>
            </FocusScope>
          ) : null}
        </>
      )
    }
    const { rerender, unmount } = render(<Opened open={false} />, { container })
    act(() => (shadowRoot.querySelector('button') as HTMLElement).focus())
    rerender(<Opened open />)
    rerender(<Opened open={false} />)
    await wait(0)

    expect(shadowRoot.activeElement?.textContent).toBe('Open')
    unmount()
    host.remove()
  })
})
