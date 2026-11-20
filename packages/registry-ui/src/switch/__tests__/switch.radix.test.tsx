// From Radix UI primitives, packages/react/switch/src/switch.test.tsx. MIT, see
// packages/duck-primitives/src/__tests__/radix/LICENSE. This switch is a native input, so the cases about Radix's
// hidden bubble input and its parts' spreads are left out, and a stopped click still reaches the form as a native
// change.

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Switch } from '../switch'

afterEach(cleanup)

const control = () => screen.getByRole<HTMLInputElement>('switch')
// A form's change event is typed on the form, though it comes from the switch inside it.
const input = (event: React.FormEvent<HTMLFormElement>) => event.target as HTMLInputElement

describe('given a default Switch', () => {
  it('should correctly invoke the cleanup function of a ref callback', () => {
    let cleanedUp = false
    const rendered = render(
      <Switch
        ref={() => () => {
          cleanedUp = true
        }}
      />,
    )

    rendered.unmount()

    expect(cleanedUp).toBe(true)
  })
})

describe('given a Switch in a form', () => {
  describe('uncontrolled', () => {
    it('should restore its `defaultChecked` value when the form is reset', () => {
      render(
        <form>
          <Switch defaultChecked name="notifications" />
          <button type="reset">Reset</button>
        </form>,
      )
      expect(control().checked).toBe(true)

      act(() => fireEvent.click(control()))
      expect(control().checked).toBe(false)

      act(() => fireEvent.click(screen.getByText('Reset')))
      expect(control().checked).toBe(true)
    })
  })

  describe('controlled', () => {
    it('should restore its initial `checked` value when the form is reset', () => {
      function ControlledSwitch() {
        const [checked, setChecked] = React.useState(true)
        return (
          <form>
            <Switch checked={checked} data-state={String(checked)} name="notifications" onCheckedChange={setChecked} />
            <button type="reset">Reset</button>
          </form>
        )
      }
      render(<ControlledSwitch />)
      expect(control().checked).toBe(true)

      act(() => fireEvent.click(control()))
      expect(control().checked).toBe(false)

      act(() => fireEvent.click(screen.getByText('Reset')))
      expect(control().checked).toBe(true)
      expect(control().dataset.state).toBe('true')
    })
  })
})

describe('given a Switch with external form association', () => {
  describe('uncontrolled', () => {
    it('should restore its `defaultChecked` value when the external form is reset', () => {
      render(
        <>
          <form id="switch-reset-form">
            <button type="reset">Reset</button>
          </form>
          <Switch defaultChecked form="switch-reset-form" name="notifications" />
        </>,
      )
      expect(control().checked).toBe(true)

      act(() => fireEvent.click(control()))
      expect(control().checked).toBe(false)

      act(() => fireEvent.click(screen.getByRole('button', { name: 'Reset' })))
      expect(control().checked).toBe(true)
    })
  })

  describe('controlled', () => {
    it('should restore its initial `checked` value when the external form is reset', () => {
      function ControlledSwitch() {
        const [checked, setChecked] = React.useState(true)
        return (
          <>
            <form id="switch-reset-form">
              <button type="reset">Reset</button>
            </form>
            <Switch
              checked={checked}
              data-state={String(checked)}
              form="switch-reset-form"
              name="notifications"
              onCheckedChange={setChecked}
            />
          </>
        )
      }
      render(<ControlledSwitch />)
      expect(control().checked).toBe(true)

      act(() => fireEvent.click(control()))
      expect(control().checked).toBe(false)

      act(() => fireEvent.click(screen.getByRole('button', { name: 'Reset' })))
      expect(control().checked).toBe(true)
      expect(control().dataset.state).toBe('true')
    })
  })
})

describe('given a Switch with a clickable ancestor inside a form', () => {
  function Harness({
    children,
    onClick,
    onFormChange,
  }: React.PropsWithChildren<{ onClick: () => void; onFormChange: (checked: boolean) => void }>) {
    return (
      <form onChange={(event) => onFormChange(input(event).checked)}>
        <div onClick={onClick}>{children}</div>
      </form>
    )
  }

  it('should not trigger the ancestor `onClick` when `checked` is updated programmatically', () => {
    const onClick = vi.fn()
    const app = (checked: boolean) => (
      <Harness onClick={onClick} onFormChange={vi.fn()}>
        <Switch checked={checked} onCheckedChange={() => undefined} />
      </Harness>
    )
    const { rerender } = render(app(false))

    act(() => rerender(app(true)))

    expect(onClick).not.toHaveBeenCalled()
    expect(control().checked).toBe(true)
  })

  it('should trigger the ancestor `onClick` on a real user click', () => {
    const onClick = vi.fn()
    render(
      <Harness onClick={onClick} onFormChange={vi.fn()}>
        <Switch />
      </Harness>,
    )

    act(() => fireEvent.click(control()))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('should not trigger the ancestor `onClick` on a programmatic update after a click that did not change `checked`', () => {
    const onClick = vi.fn()
    const app = (checked: boolean) => (
      <Harness onClick={onClick} onFormChange={vi.fn()}>
        <Switch checked={checked} onCheckedChange={() => undefined} />
      </Harness>
    )
    const { rerender } = render(app(false))

    act(() => fireEvent.click(control()))
    onClick.mockClear()
    act(() => rerender(app(true)))

    expect(onClick).not.toHaveBeenCalled()
  })

  it('should trigger the ancestor `onClick` for a user click that the controlled parent ignores', () => {
    const onClick = vi.fn()
    render(
      <Harness onClick={onClick} onFormChange={vi.fn()}>
        <Switch checked={false} onCheckedChange={() => undefined} />
      </Harness>,
    )

    act(() => fireEvent.click(control()))

    expect(control().checked).toBe(false)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('should trigger the ancestor `onClick` once and notify the form when the controlled parent applies `checked` after a timeout', async () => {
    const onClick = vi.fn()
    const onFormChange = vi.fn()
    function DelayedApp() {
      const [checked, setChecked] = React.useState(false)
      return (
        <Harness onClick={onClick} onFormChange={onFormChange}>
          <Switch checked={checked} onCheckedChange={(next) => setTimeout(() => setChecked(next))} />
        </Harness>
      )
    }
    render(<DelayedApp />)

    act(() => fireEvent.click(control()))
    await act(() => new Promise((resolve) => setTimeout(resolve)))

    expect(control().checked).toBe(true)
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(onFormChange).toHaveBeenCalledTimes(1)
    expect(onFormChange).toHaveBeenCalledWith(true)
  })

  it('should trigger the ancestor `onClick` once and notify the form when the controlled parent applies `checked` in a transition', async () => {
    const onClick = vi.fn()
    const onFormChange = vi.fn()
    function TransitionApp() {
      const [checked, setChecked] = React.useState(false)
      return (
        <Harness onClick={onClick} onFormChange={onFormChange}>
          <Switch checked={checked} onCheckedChange={(next) => React.startTransition(() => setChecked(next))} />
        </Harness>
      )
    }
    render(<TransitionApp />)

    await act(async () => fireEvent.click(control()))

    expect(control().checked).toBe(true)
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(onFormChange).toHaveBeenCalledTimes(1)
    expect(onFormChange).toHaveBeenCalledWith(true)
  })

  it('should not trigger the ancestor `onClick` when propagation is stopped on the trigger and the controlled parent applies `checked` later', async () => {
    const onClick = vi.fn()
    const onFormChange = vi.fn()
    function DelayedApp() {
      const [checked, setChecked] = React.useState(false)
      return (
        <Harness onClick={onClick} onFormChange={onFormChange}>
          <Switch
            checked={checked}
            onCheckedChange={(next) => setTimeout(() => setChecked(next))}
            onClick={(event) => event.stopPropagation()}
          />
        </Harness>
      )
    }
    render(<DelayedApp />)

    act(() => fireEvent.click(control()))
    await act(() => new Promise((resolve) => setTimeout(resolve)))

    expect(control().checked).toBe(true)
    expect(onClick).not.toHaveBeenCalled()
    expect(onFormChange).toHaveBeenCalledTimes(1)
    expect(onFormChange).toHaveBeenCalledWith(true)
  })

  it('should not trigger the ancestor `onClick` when propagation is stopped on the trigger', () => {
    const onClick = vi.fn()
    const onFormChange = vi.fn()
    render(
      <Harness onClick={onClick} onFormChange={onFormChange}>
        <Switch onClick={(event) => event.stopPropagation()} />
      </Harness>,
    )

    act(() => fireEvent.click(control()))

    expect(control().checked).toBe(true)
    expect(onClick).not.toHaveBeenCalled()
    expect(onFormChange).toHaveBeenCalledTimes(1)
    expect(onFormChange).toHaveBeenCalledWith(true)
  })
})
