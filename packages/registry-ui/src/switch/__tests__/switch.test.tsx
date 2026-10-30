import { afterEach, describe, expect, mock, test } from 'bun:test'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import * as React from 'react'
import { MotionSwitch } from '../motion-switch'
import { Switch } from '../switch'

afterEach(cleanup)

describe('registry-ui Switch', () => {
  test('reports the state a click moves it to', () => {
    const onCheckedChange = mock()
    const onChange = mock()
    render(<Switch onChange={onChange} onCheckedChange={onCheckedChange} />)

    fireEvent.click(screen.getByRole('switch'))

    expect(onCheckedChange).toHaveBeenCalledWith(true)
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  test('leaves its state to the input rather than an aria-checked of its own', () => {
    render(<Switch checked onChange={() => {}} />)

    expect(screen.getByRole('switch').hasAttribute('aria-checked')).toBe(false)
    expect((screen.getByRole('switch') as HTMLInputElement).checked).toBe(true)
  })

  test('hands a ref the input', () => {
    const ref = React.createRef<HTMLInputElement>()
    render(<Switch ref={ref} />)

    expect(ref.current).toBe(screen.getByRole('switch') as HTMLInputElement)
  })
})

describe('registry-ui Switch in a form that is reset', () => {
  test('tells the owner nothing of a reset a handler cancels', () => {
    const onCheckedChange = mock()
    render(
      <form onReset={(event) => event.preventDefault()}>
        <Switch defaultChecked onCheckedChange={onCheckedChange} />
      </form>,
    )
    fireEvent.click(screen.getByRole('switch'))

    act(() => screen.getByRole<HTMLInputElement>('switch').form?.reset())

    expect(onCheckedChange.mock.calls).toEqual([[false]])
  })

  test('tells the owner of an uncontrolled switch the value it goes back to', () => {
    const onCheckedChange = mock()
    const { container } = render(
      <form>
        <Switch defaultChecked onCheckedChange={onCheckedChange} />
      </form>,
    )
    fireEvent.click(screen.getByRole('switch'))

    act(() => container.querySelector('form')?.reset())

    expect(onCheckedChange).toHaveBeenLastCalledWith(true)
  })

  test('asks a controlled switch nothing when it is already on its first value', () => {
    const onCheckedChange = mock()
    const { container } = render(
      <form>
        <Switch checked onCheckedChange={onCheckedChange} />
      </form>,
    )

    act(() => container.querySelector('form')?.reset())

    expect(onCheckedChange).not.toHaveBeenCalled()
  })

  test('stops listening once it unmounts', () => {
    const onCheckedChange = mock()
    const { container, rerender } = render(
      <form>
        <Switch checked onCheckedChange={onCheckedChange} />
      </form>,
    )
    const form = container.querySelector('form')
    rerender(
      <form>
        <Switch checked={false} onCheckedChange={onCheckedChange} />
      </form>,
    )
    rerender(<form />)

    act(() => form?.reset())

    expect(onCheckedChange).not.toHaveBeenCalled()
  })
})

describe('registry-ui MotionSwitch', () => {
  test('moves on a click and leaves its state to the input', () => {
    const onCheckedChange = mock()
    render(<MotionSwitch onCheckedChange={onCheckedChange} />)
    const control = screen.getByRole('switch') as HTMLInputElement

    fireEvent.click(control)

    expect(control.checked).toBe(true)
    expect(control.hasAttribute('aria-checked')).toBe(false)
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  test('hands a ref the input', () => {
    const ref = React.createRef<HTMLInputElement>()
    render(<MotionSwitch ref={ref} />)

    expect(ref.current).toBe(screen.getByRole('switch'))
  })

  test('stretches its thumb while pressed, and lets it go on release', async () => {
    const { container } = render(<MotionSwitch />)
    const track = container.querySelector('[data-slot="switch"]') as HTMLElement
    const thumb = () => (track.querySelector('span') as HTMLElement).style.transform

    fireEvent.pointerDown(track)
    await waitFor(() => expect(thumb()).toBe('scaleX(1.3) scaleY(0.92)'))

    fireEvent.pointerUp(track)
    await waitFor(() => expect(thumb()).toBe('none'))
  })

  test('keeps the thumb still when disabled', async () => {
    const { container } = render(<MotionSwitch disabled />)
    const track = container.querySelector('[data-slot="switch"]') as HTMLElement

    fireEvent.pointerDown(track)
    await new Promise((resolve) => setTimeout(resolve, 200))

    expect((track.querySelector('span') as HTMLElement).style.transform).not.toContain('scaleX(1.3)')
  })
})

describe('registry-ui MotionSwitch in a form that is reset', () => {
  test('keeps its thumb and tells the owner nothing of a reset a handler cancels', () => {
    const onCheckedChange = mock()
    const { container } = render(
      <form onReset={(event) => event.preventDefault()}>
        <MotionSwitch defaultChecked onCheckedChange={onCheckedChange} />
      </form>,
    )
    fireEvent.click(screen.getByRole('switch'))

    act(() => container.querySelector('form')?.reset())

    expect(container.querySelector('[data-slot="switch"]')?.getAttribute('data-state')).toBe('unchecked')
    expect(onCheckedChange.mock.calls).toEqual([[false]])
  })

  test('moves its thumb back and tells the owner', () => {
    const onCheckedChange = mock()
    const { container } = render(
      <form>
        <MotionSwitch defaultChecked onCheckedChange={onCheckedChange} />
      </form>,
    )
    fireEvent.click(screen.getByRole('switch'))

    act(() => container.querySelector('form')?.reset())

    expect(screen.getByRole<HTMLInputElement>('switch').checked).toBe(true)
    expect(container.querySelector('[data-slot="switch"]')?.getAttribute('data-state')).toBe('checked')
    expect(onCheckedChange).toHaveBeenLastCalledWith(true)
  })

  test('asks a controlled switch for the value it was first given', () => {
    const onCheckedChange = mock()
    const { container, rerender } = render(
      <form>
        <MotionSwitch checked onCheckedChange={onCheckedChange} />
      </form>,
    )
    rerender(
      <form>
        <MotionSwitch checked={false} onCheckedChange={onCheckedChange} />
      </form>,
    )

    act(() => container.querySelector('form')?.reset())

    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  test('asks nothing when it is already on its first value', () => {
    const onCheckedChange = mock()
    const { container } = render(
      <form>
        <MotionSwitch defaultChecked onCheckedChange={onCheckedChange} />
      </form>,
    )

    act(() => container.querySelector('form')?.reset())

    expect(onCheckedChange).not.toHaveBeenCalled()
  })

  test('stops listening once it unmounts', () => {
    const onCheckedChange = mock()
    const { container, rerender } = render(
      <form>
        <MotionSwitch checked onCheckedChange={onCheckedChange} />
      </form>,
    )
    const form = container.querySelector('form')
    rerender(
      <form>
        <MotionSwitch checked={false} onCheckedChange={onCheckedChange} />
      </form>,
    )
    rerender(<form />)

    act(() => form?.reset())

    expect(onCheckedChange).not.toHaveBeenCalled()
  })
})

const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
const control = () => screen.getByRole<HTMLInputElement>('switch')

for (const [name, Control] of [
  ['Switch', Switch],
  ['MotionSwitch', MotionSwitch],
] as const) {
  describe(`registry-ui ${name} whose owner sets checked`, () => {
    const heard = mock()
    const clicked = mock()
    const asked = mock()
    const changed = mock()
    const owned = (checked: boolean) => (
      <form onChange={(event) => heard((event.target as HTMLInputElement).checked)}>
        <div onClick={clicked}>
          <Control checked={checked} onChange={changed} onCheckedChange={asked} onClick={clicked} />
        </div>
      </form>
    )

    test('tells its form of the change, as a click would, with no click and no question back', () => {
      for (const spy of [heard, clicked, asked, changed]) spy.mockClear()
      const { rerender } = render(owned(false))

      act(() => rerender(owned(true)))

      expect([heard.mock.calls, clicked.mock.calls.length, asked.mock.calls.length, changed.mock.calls.length]).toEqual(
        [[[true]], 0, 0, 0],
      )
      expect(control().checked).toBe(true)
    })

    test('stays on its checked when the owner does not follow a reset', async () => {
      const { rerender } = render(owned(false))
      rerender(owned(true))

      await act(async () => {
        control().form?.reset()
        await frame()
      })

      expect(control().checked).toBe(true)
    })
  })
}
