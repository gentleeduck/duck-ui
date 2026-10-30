import { describe, expect, it, mock, spyOn } from 'bun:test'
import { act, fireEvent, render } from '@testing-library/react'
import * as React from 'react'
import { freshDom } from '../../__tests__/dom'
import { useCheckedSync, useSvgIndicator } from '../checkers'

freshDom()

const circle = (r: number) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
    <circle cx="8" cy="8" r={r} />
  </svg>
)

function Box(props: Parameters<typeof useSvgIndicator>[0] & { label?: string }) {
  const { label, ...options } = props
  const { SvgIndicator, inputStyle, ...ready } = useSvgIndicator(options)

  return (
    <>
      <SvgIndicator data-testid="source" />
      <input type="checkbox" style={inputStyle} data-ready={JSON.stringify(ready)} aria-label={label} />
    </>
  )
}

const input = () => document.querySelector('input') as HTMLInputElement
const uri = (name: string) => {
  const value = input().style.getPropertyValue(name)
  return value ? decodeURIComponent(value.slice(5, -2).replace('data:image/svg+xml,', '')) : ''
}
const ready = () => JSON.parse(input().dataset.ready ?? '{}')

describe('useSvgIndicator', () => {
  it('sets each indicator it is given as a variable', () => {
    render(<Box indicator={circle(4)} checkedIndicator={circle(6)} indeterminateIndicator={circle(2)} />)

    expect(uri('--svg-off')).toContain('r="4"')
    expect(uri('--svg-on')).toContain('r="6"')
    expect(uri('--svg-indeterminate')).toContain('r="2"')
    expect(ready()).toEqual({ checkedIndicatorReady: true, indeterminateIndicatorReady: true, indicatorReady: true })
  })

  it('sets nothing for an indicator it is not given', () => {
    render(<Box checkedIndicator={circle(6)} />)

    expect(input().style.getPropertyValue('--svg-off')).toBe('')
    expect(input().style.getPropertyValue('--svg-indeterminate')).toBe('')
    expect(ready()).toEqual({ checkedIndicatorReady: true, indeterminateIndicatorReady: false, indicatorReady: false })
  })

  it('reads an indicator again when it changes', () => {
    const { rerender } = render(<Box checkedIndicator={circle(6)} />)

    rerender(<Box checkedIndicator={circle(3)} />)

    expect(uri('--svg-on')).toContain('r="3"')
  })

  it('drops an indicator that is taken away', () => {
    const { rerender } = render(<Box indicator={circle(4)} checkedIndicator={circle(6)} />)

    rerender(<Box checkedIndicator={circle(6)} />)

    expect(input().style.getPropertyValue('--svg-off')).toBe('')
    expect(ready().indicatorReady).toBe(false)
  })

  it('keeps its hidden markup mounted while the owner renders again', () => {
    const { rerender } = render(<Box checkedIndicator={circle(6)} label="one" />)
    const source = document.querySelector('[data-testid="source"]')

    rerender(<Box checkedIndicator={circle(6)} label="two" />)

    expect(document.querySelector('[data-testid="source"]')).toBe(source)
  })

  it('hides the markup it reads from', () => {
    render(<Box indicator={circle(4)} checkedIndicator={circle(6)} />)
    const sources = [...document.querySelectorAll('[data-testid="source"]')]

    expect(sources.map((source) => [source.hasAttribute('hidden'), source.getAttribute('aria-hidden')])).toEqual([
      [true, 'true'],
      [true, 'true'],
    ])
  })

  it('renders a hidden node only for an indicator it is given', () => {
    render(<Box checkedIndicator={circle(6)} />)

    expect(document.querySelectorAll('[data-testid="source"]')).toHaveLength(1)
  })

  it('reads an indicator with space around its svg as the svg alone', () => {
    render(
      <Box
        checkedIndicator={
          <>
            {' '}
            <svg viewBox="0 0 16 16">
              <path d="M3 8l3 3 7-7" />
            </svg>{' '}
          </>
        }
      />,
    )

    expect(uri('--svg-on')).toBe(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M3 8l3 3 7-7"></path></svg>',
    )
  })

  it('adds the SVG namespace an image needs when the markup leaves it out', () => {
    render(
      <Box
        checkedIndicator={
          <svg viewBox="0 0 16 16">
            <path d="M3 8l3 3 7-7" />
          </svg>
        }
      />,
    )

    expect(uri('--svg-on')).toStartWith('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">')
  })

  it('keeps a namespace the markup already declares', () => {
    render(<Box checkedIndicator={circle(6)} />)

    expect(uri('--svg-on').match(/xmlns=/g)).toHaveLength(1)
  })
})

const HOSTILE_TEXT = '</style><script>alert(1)</script>'
const HOSTILE_ATTR = '"><script>alert(1)</script>'

describe('useSvgIndicator with hostile text in the markup', () => {
  function Hostile() {
    return (
      <Box
        indicator={
          <svg viewBox="0 0 16 16">
            <desc>{HOSTILE_TEXT}</desc>
            <text x="0" y="8">
              {HOSTILE_ATTR}
            </text>
          </svg>
        }
        checkedIndicator={
          <svg viewBox="0 0 16 16">
            <title>{HOSTILE_ATTR}</title>
            <text x="0" y="8" data-note={HOSTILE_ATTR}>
              {HOSTILE_TEXT}
            </text>
          </svg>
        }
      />
    )
  }

  it('stays an SVG image inside one quoted url()', () => {
    render(<Hostile />)

    for (const name of ['--svg-off', '--svg-on']) {
      const value = input().style.getPropertyValue(name)
      expect(value).toStartWith('url("data:image/svg+xml,')
      expect(value.slice(5, -2)).not.toMatch(/["<>\\\n]/)
    }
  })

  it('spawns no live script', () => {
    render(<Hostile />)

    expect(document.querySelector('script')).toBeNull()
    expect(input().getAttribute('style')?.toLowerCase()).not.toContain('javascript:')
  })
})

const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

function Synced(props: Parameters<typeof useCheckedSync>[1]) {
  const ref = React.useRef<HTMLInputElement>(null)
  const sync = useCheckedSync(ref, props)
  return <input type="checkbox" aria-label="synced" ref={ref} checked={props.checked} {...sync} />
}

describe('useCheckedSync', () => {
  it("tells the form of a checked set from outside, and runs none of the input's handlers", () => {
    const heard = mock()
    const handlers = { onChange: mock(), onClick: mock() }
    const clicked = mock()
    const owned = (checked: boolean) => (
      <form onChange={(event) => heard((event.target as HTMLInputElement).checked)}>
        <div onClick={clicked}>
          <Synced checked={checked} {...handlers} />
        </div>
      </form>
    )
    const { rerender } = render(owned(false))

    act(() => rerender(owned(true)))
    act(() => rerender(owned(true)))

    expect(heard.mock.calls).toEqual([[true]])
    expect([handlers.onChange, handlers.onClick, clicked].map((spy) => spy.mock.calls.length)).toEqual([0, 0, 0])
    expect(input().checked).toBe(true)
  })

  it('tells the form of each value set from outside, a change back included', () => {
    const heard = mock()
    const owned = (checked: boolean) => (
      <form onChange={(event) => heard((event.target as HTMLInputElement).checked)}>
        <Synced checked={checked} onChange={() => undefined} />
      </form>
    )
    const { rerender } = render(owned(false))

    act(() => rerender(owned(true)))
    act(() => rerender(owned(false)))

    expect(heard.mock.calls).toEqual([[true], [false]])
  })

  it("hands a click after a value set from outside to the input's handlers", () => {
    const handlers = { onChange: mock(), onClick: mock() }
    const owned = (checked: boolean) => (
      <form>
        <Synced checked={checked} {...handlers} />
      </form>
    )
    const { rerender } = render(owned(false))
    act(() => rerender(owned(true)))

    fireEvent.click(input())

    expect([handlers.onChange.mock.calls.length, handlers.onClick.mock.calls.length]).toEqual([1, 1])
  })

  it('tells the form nothing when the owner stops holding the value', () => {
    const heard = mock()
    const error = spyOn(console, 'error').mockImplementation(() => {})
    const owned = (checked: boolean | undefined) => (
      <form onChange={(event) => heard((event.target as HTMLInputElement).checked)}>
        <Synced checked={checked} onChange={() => undefined} />
      </form>
    )
    const { rerender } = render(owned(true))

    act(() => rerender(owned(undefined)))
    error.mockRestore()

    expect([heard.mock.calls, input().checked]).toEqual([[], true])
  })

  it('sends nothing outside a form', () => {
    const clicked = mock()
    const { container, rerender } = render(<Synced checked={false} />)
    container.addEventListener('click', clicked)

    act(() => rerender(<Synced checked />))

    expect(clicked).not.toHaveBeenCalled()
  })

  it("hands a click and its change to the input's handlers", () => {
    const handlers = { onChange: mock(), onClick: mock() }
    render(<Synced checked={undefined} {...handlers} />)

    fireEvent.click(input())

    expect([handlers.onChange.mock.calls.length, handlers.onClick.mock.calls.length, input().checked]).toEqual([
      1,
      1,
      true,
    ])
  })

  it('tells the form nothing of a value it already heard from a click', () => {
    const heard = mock()
    const owned = (checked: boolean) => (
      <form onChange={(event) => heard((event.target as HTMLInputElement).checked)}>
        <Synced checked={checked} onChange={() => undefined} />
      </form>
    )
    const { rerender } = render(owned(false))

    fireEvent.click(input())
    act(() => rerender(owned(true)))

    expect(heard.mock.calls).toEqual([[true]])
  })

  it("puts the owner's value back after a reset the owner does not follow", async () => {
    const owned = (checked: boolean) => (
      <form>
        <Synced checked={checked} onChange={() => undefined} />
      </form>
    )
    const { rerender } = render(owned(false))
    rerender(owned(true))

    await act(async () => {
      input().form?.reset()
      await frame()
    })

    expect(input().checked).toBe(true)
  })

  it('leaves an input that keeps its own state to the reset', async () => {
    render(
      <form>
        <Synced checked={undefined} />
      </form>,
    )
    fireEvent.click(input())

    await act(async () => {
      input().form?.reset()
      await frame()
    })

    expect(input().checked).toBe(false)
  })

  it('hears an uncancelled reset of the form the input belongs to now', () => {
    const onReset = mock()
    function InForm({ form }: { form: string }) {
      const ref = React.useRef<HTMLInputElement>(null)
      const sync = useCheckedSync(ref, { checked: undefined, onReset })
      return <input type="checkbox" aria-label="synced" form={form} ref={ref} {...sync} />
    }
    const ui = (form: string) => (
      <>
        <form id="sync-cancelled" onReset={(event) => event.preventDefault()} />
        <form id="sync-plain" />
        <InForm form={form} />
      </>
    )
    const { rerender } = render(ui('sync-cancelled'))

    act(() => document.forms.namedItem('sync-cancelled')?.reset())
    rerender(ui('sync-plain'))
    act(() => document.forms.namedItem('sync-plain')?.reset())
    act(() => document.forms.namedItem('sync-cancelled')?.reset())

    expect(onReset.mock.calls.map(([target]) => target === input())).toEqual([true])
  })

  it('puts nothing back once it unmounts', async () => {
    const owned = (checked: boolean | null) => (
      <form>{checked === null ? null : <Synced checked={checked} onChange={() => undefined} />}</form>
    )
    const { container, rerender } = render(owned(false))
    rerender(owned(true))
    const synced = input()
    const form = container.querySelector('form') as HTMLFormElement

    act(() => form.reset())
    act(() => rerender(owned(null)))
    await act(frame)
    const afterPending = synced.checked
    await act(async () => {
      form.reset()
      await frame()
    })

    expect([afterPending, synced.checked]).toEqual([false, false])
  })
})
