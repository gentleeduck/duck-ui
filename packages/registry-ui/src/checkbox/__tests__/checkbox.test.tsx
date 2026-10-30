import { afterEach, describe, expect, mock, test } from 'bun:test'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Checkbox, CheckboxGroup } from '../checkbox'
import type { CheckedState } from '../checkbox.types'

afterEach(cleanup)

const box = () => document.querySelector('input') as HTMLInputElement
const glyph = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
    <rect x="3" y="7" width="10" height="2" />
  </svg>
)

describe('registry-ui Checkbox', () => {
  test('hands an object ref the input', () => {
    const ref = React.createRef<HTMLInputElement>()
    render(<Checkbox ref={ref} />)

    expect(ref.current).toBe(box())
  })

  test('runs the cleanup a callback ref returns once it unmounts', () => {
    let cleanedUp = false
    const { unmount } = render(
      <Checkbox
        ref={() => () => {
          cleanedUp = true
        }}
      />,
    )

    unmount()

    expect(cleanedUp).toBe(true)
  })

  test('hands a callback ref the input', () => {
    const ref = mock()
    render(<Checkbox ref={ref} defaultChecked="indeterminate" />)

    expect(ref).toHaveBeenCalledWith(box())
    expect(box().indeterminate).toBe(true)
  })

  test('ticks on its own and reports it when given no value', () => {
    const onCheckedChange = mock()
    render(<Checkbox onCheckedChange={onCheckedChange} />)

    fireEvent.click(box())

    expect(box().checked).toBe(true)
    expect(box().dataset.checked).toBe('true')
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  test('asks for the change and stays on its value until it gets one', () => {
    const onCheckedChange = mock()
    render(<Checkbox checked={false} onCheckedChange={onCheckedChange} />)

    fireEvent.click(box())

    expect(onCheckedChange).toHaveBeenCalledWith(true)
    expect(box().checked).toBe(false)
    expect(box().dataset.checked).toBe('false')
  })

  test('follows the value it is given', () => {
    const { rerender } = render(<Checkbox checked={false} />)

    rerender(<Checkbox checked />)

    expect(box().checked).toBe(true)
    expect(box().dataset.checked).toBe('true')
  })

  test('shows the mixed state and leaves it for checked on a click', () => {
    const onCheckedChange = mock()
    render(<Checkbox checked="indeterminate" onCheckedChange={onCheckedChange} />)
    expect(box().indeterminate).toBe(true)

    fireEvent.click(box())

    expect(onCheckedChange).toHaveBeenCalledWith(true)
    expect(box().indeterminate).toBe(true)
    expect(box().checked).toBe(false)
  })

  test('draws its state before it hydrates', () => {
    const ticked = renderToStaticMarkup(<Checkbox defaultChecked />)
    expect(ticked).toContain('data-checked="true"')
    expect(ticked).toContain(' checked=""')
    expect(renderToStaticMarkup(<Checkbox checked="indeterminate" />)).toContain('data-checked="indeterminate"')
    expect(renderToStaticMarkup(<Checkbox />)).toContain('data-checked="false"')
  })

  test('masks the mixed state with an indicator of its own', () => {
    render(<Checkbox indeterminateIndicator={glyph} />)

    expect(box().style.getPropertyValue('--svg-indeterminate')).toStartWith('url("data:image/svg+xml,')
    expect(box().className).toContain('data-[checked="indeterminate"]:after:mask-[var(--svg-indeterminate)]')
  })

  test('keeps its own bar for the mixed state without one', () => {
    render(<Checkbox />)

    expect(box().className).not.toContain('--svg-indeterminate')
    expect(box().className).toContain('data-[checked="indeterminate"]:after:h-0.5')
  })
})

describe('registry-ui Checkbox in a form that is reset', () => {
  test('goes back to the state it started in', () => {
    const onCheckedChange = mock()
    render(
      <form>
        <Checkbox defaultChecked="indeterminate" onCheckedChange={onCheckedChange} />
      </form>,
    )
    fireEvent.click(box())

    act(() => box().form?.reset())

    expect(box().checked).toBe(false)
    expect(box().indeterminate).toBe(true)
    expect(box().dataset.checked).toBe('indeterminate')
    expect(onCheckedChange).toHaveBeenLastCalledWith('indeterminate')
    fireEvent.click(box())
    expect(onCheckedChange).toHaveBeenLastCalledWith(true)
  })

  test('goes back to the latest default it was given', () => {
    const { rerender } = render(
      <form>
        <Checkbox defaultChecked={false} />
      </form>,
    )
    rerender(
      <form>
        <Checkbox defaultChecked />
      </form>,
    )
    fireEvent.click(box())

    act(() => box().form?.reset())

    expect(box().checked).toBe(true)
    expect(box().dataset.checked).toBe('true')
  })

  test('keeps its state through a reset a handler cancels', () => {
    render(
      <form onReset={(event) => event.preventDefault()}>
        <Checkbox />
      </form>,
    )
    fireEvent.click(box())

    act(() => box().form?.reset())

    expect([box().checked, box().dataset.checked]).toEqual([true, 'true'])
  })

  test('follows a reset of the form it names now, not the one it named before', () => {
    const ui = (form: string) => (
      <>
        <form id="checkbox-form-a" />
        <form id="checkbox-form-b" />
        <Checkbox form={form} />
      </>
    )
    const { rerender } = render(ui('checkbox-form-a'))
    rerender(ui('checkbox-form-b'))
    fireEvent.click(box())

    act(() => document.forms.namedItem('checkbox-form-a')?.reset())
    const afterOldForm = [box().checked, box().dataset.checked]
    act(() => document.forms.namedItem('checkbox-form-b')?.reset())

    expect([afterOldForm, [box().checked, box().dataset.checked]]).toEqual([
      [true, 'true'],
      [false, 'false'],
    ])
  })

  test('goes back on a reset of a form it names by id', () => {
    render(
      <>
        <form id="checkbox-reset-form">
          <button type="reset">Reset</button>
        </form>
        <Checkbox defaultChecked form="checkbox-reset-form" />
      </>,
    )
    fireEvent.click(box())

    act(() => fireEvent.click(screen.getByRole('button', { name: 'Reset' })))

    expect(box().checked).toBe(true)
    expect(box().dataset.checked).toBe('true')
  })

  test('asks a controlled checkbox for the value it was first given', () => {
    const onCheckedChange = mock()
    const { rerender } = render(
      <form>
        <Checkbox checked onCheckedChange={onCheckedChange} />
      </form>,
    )
    rerender(
      <form>
        <Checkbox checked={false} onCheckedChange={onCheckedChange} />
      </form>,
    )

    act(() => box().form?.reset())

    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  test('stops listening once it unmounts', () => {
    const onCheckedChange = mock()
    const { container, rerender } = render(
      <form>
        <Checkbox checked onCheckedChange={onCheckedChange} />
      </form>,
    )
    const form = container.querySelector('form')
    rerender(
      <form>
        <Checkbox checked={false} onCheckedChange={onCheckedChange} />
      </form>,
    )
    rerender(<form />)

    act(() => form?.reset())

    expect(onCheckedChange).not.toHaveBeenCalled()
  })
})

const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

describe('registry-ui Checkbox whose owner sets checked', () => {
  const heard = mock()
  const clicked = mock()
  const asked = mock()
  const owned = (checked: CheckedState) => (
    <form onChange={(event) => heard((event.target as HTMLInputElement).checked)}>
      <div onClick={clicked}>
        <Checkbox checked={checked} onCheckedChange={asked} onClick={clicked} />
      </div>
    </form>
  )

  test('tells its form of the change, as a click would, with no click and no question back', () => {
    for (const spy of [heard, clicked, asked]) spy.mockClear()
    const { rerender } = render(owned(false))

    act(() => rerender(owned(true)))
    act(() => rerender(owned('indeterminate')))

    expect([heard.mock.calls, clicked.mock.calls.length, asked.mock.calls.length]).toEqual([[[true], [false]], 0, 0])
    expect([box().checked, box().indeterminate]).toEqual([false, true])
  })

  test('tells its form nothing while the box looks the same', () => {
    for (const spy of [heard, clicked, asked]) spy.mockClear()
    const { rerender } = render(owned(false))

    act(() => rerender(owned('indeterminate')))

    expect(heard).not.toHaveBeenCalled()
  })

  test('stays on its checked when the owner does not follow a reset', async () => {
    const { rerender } = render(owned(false))
    rerender(owned(true))

    await act(async () => {
      box().form?.reset()
      await frame()
    })

    expect(box().checked).toBe(true)
  })

  test('tells its form the value a reset the owner follows puts it on', async () => {
    const onFormChange = mock()
    function Owner() {
      const [checked, setChecked] = React.useState<CheckedState>(false)
      return (
        <form onChange={(event) => onFormChange((event.target as HTMLInputElement).checked)}>
          <Checkbox checked={checked} onCheckedChange={setChecked} />
          <button type="button" onClick={() => setChecked(true)}>
            Tick
          </button>
          <button type="reset">Reset</button>
        </form>
      )
    }
    render(<Owner />)

    act(() => fireEvent.click(screen.getByRole('button', { name: 'Tick' })))
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
      await frame()
    })

    expect([onFormChange.mock.calls, box().checked]).toEqual([[[true], [false]], false])
  })
})

describe('registry-ui CheckboxGroup', () => {
  test('starts a subtask on its value and lets it be unticked', () => {
    render(<CheckboxGroup subtasks={[{ checked: true, id: 'wireframes', title: 'Design wireframes' }]} />)
    expect(box().checked).toBe(true)

    fireEvent.click(box())

    expect(box().checked).toBe(false)
  })
})
