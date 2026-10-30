// From Radix UI primitives, packages/react/checkbox/src/checkbox.test.tsx. MIT, see
// packages/duck-primitives/src/__tests__/radix/LICENSE. This checkbox is a native input, so the cases about Radix's
// hidden bubble input and its parts' spreads are left out, a stopped click still reaches the form as a native
// change, and the Legacy cases repeating these are not repeated.

import { afterEach, describe, expect, it, mock } from 'bun:test'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import axe from 'axe-core'
import * as React from 'react'
import { Checkbox } from '../checkbox'
import type { CheckedState } from '../checkbox.types'

afterEach(cleanup)

const box = () => screen.getByRole<HTMLInputElement>('checkbox')
const violations = async (container: HTMLElement) => (await axe.run(container)).violations.map(({ id }) => id)
// A form's change event is typed on the form, though it comes from the checkbox inside it.
const input = (event: React.FormEvent<HTMLFormElement>) => event.target as HTMLInputElement

describe('Checkbox', () => {
  describe('given a default Checkbox', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Checkbox aria-label="basic checkbox" />)

      expect(await violations(container)).toEqual([])
    })

    it('should toggle the indicator when clicked', () => {
      render(<Checkbox aria-label="basic checkbox" />)

      fireEvent.click(box())
      expect(box().checked).toBe(true)
      expect(box().dataset.checked).toBe('true')

      fireEvent.click(box())
      expect(box().checked).toBe(false)
      expect(box().dataset.checked).toBe('false')
    })
  })

  describe('given a disabled Checkbox', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Checkbox aria-label="basic checkbox" disabled />)

      expect(await violations(container)).toEqual([])
    })

    it('should not toggle the indicator when clicked', () => {
      render(<Checkbox aria-label="basic checkbox" disabled />)

      // jsdom toggles a disabled input on a dispatched click event. Its own `click()` refuses, as a browser does.
      act(() => box().click())
      expect(box().checked).toBe(false)

      act(() => box().click())
      expect(box().checked).toBe(false)
    })
  })

  describe('given an uncontrolled `checked` Checkbox', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Checkbox aria-label="basic checkbox" defaultChecked />)

      expect(await violations(container)).toEqual([])
    })

    it('should render a visible indicator', () => {
      render(<Checkbox aria-label="basic checkbox" defaultChecked />)

      expect(box().checked).toBe(true)
      expect(box().dataset.checked).toBe('true')
    })

    it('should toggle the indicator when clicked', () => {
      render(<Checkbox aria-label="basic checkbox" defaultChecked />)

      fireEvent.click(box())
      expect(box().checked).toBe(false)

      fireEvent.click(box())
      expect(box().checked).toBe(true)
    })

    it('should call `onCheckedChange` prop', () => {
      const onCheckedChange = mock()
      render(<Checkbox aria-label="basic checkbox" defaultChecked onCheckedChange={onCheckedChange} />)

      fireEvent.click(box())

      expect(onCheckedChange).toHaveBeenCalledWith(false)
    })
  })

  describe('given a controlled Checkbox', () => {
    function ControlledCheckbox({ onCheckedChange }: { onCheckedChange: (checked: CheckedState) => void }) {
      const [checked, setChecked] = React.useState<CheckedState>(false)
      const [blockToggle, setBlockToggle] = React.useState(false)

      return (
        <div>
          <Checkbox
            aria-label="basic checkbox"
            checked={checked}
            onCheckedChange={(next) => {
              onCheckedChange(next)
              if (!blockToggle) setChecked(next)
            }}
          />
          <button onClick={() => setChecked((previous) => !previous)} type="button">
            Toggle checkbox
          </button>
          <button onClick={() => setBlockToggle((previous) => !previous)} type="button">
            {blockToggle ? 'Unblock' : 'Block'} checkbox
          </button>
        </div>
      )
    }

    it('should have no accessibility violations', async () => {
      const { container } = render(<ControlledCheckbox onCheckedChange={mock()} />)

      expect(await violations(container)).toEqual([])
    })

    it('should toggle the indicator', () => {
      render(<ControlledCheckbox onCheckedChange={mock()} />)

      fireEvent.click(box())

      expect(box().checked).toBe(true)
    })

    it('should call `onCheckedChange` prop', () => {
      const onCheckedChange = mock()
      render(<ControlledCheckbox onCheckedChange={onCheckedChange} />)

      fireEvent.click(box())

      expect(onCheckedChange).toHaveBeenCalledWith(true)
    })

    it('should not toggle unless state is updated', () => {
      render(<ControlledCheckbox onCheckedChange={mock()} />)

      fireEvent.click(screen.getByText('Block checkbox'))
      fireEvent.click(box())

      expect(box().checked).toBe(false)
      expect(box().dataset.checked).toBe('false')
    })
  })

  describe('given an uncontrolled Checkbox in a form', () => {
    it('should receive change event with next state', () => {
      const onChange = mock()
      render(
        <form onChange={(event) => onChange(input(event).checked)}>
          <Checkbox aria-label="basic checkbox" />
        </form>,
      )

      fireEvent.click(box())

      expect(onChange).toHaveBeenCalledWith(true)
    })

    it('should receive change event with next state when `defaultChecked` is true', () => {
      const onChange = mock()
      render(
        <form onChange={(event) => onChange(input(event).checked)}>
          <Checkbox aria-label="basic checkbox" defaultChecked />
        </form>,
      )

      fireEvent.click(box())

      expect(onChange).toHaveBeenCalledWith(false)
    })
  })

  describe('given a controlled Checkbox in a form', () => {
    it('should receive change event with controlled state when clicked', () => {
      const onChange = mock()
      function ControlledCheckbox() {
        const [checked, setChecked] = React.useState<CheckedState>(false)
        return <Checkbox aria-label="basic checkbox" checked={checked} onCheckedChange={setChecked} />
      }
      render(
        <form onChange={(event) => onChange(input(event).checked)}>
          <ControlledCheckbox />
        </form>,
      )

      fireEvent.click(box())
      expect(onChange).toHaveBeenLastCalledWith(true)

      fireEvent.click(box())
      expect(onChange).toHaveBeenLastCalledWith(false)
    })
  })

  describe('given a Checkbox with a clickable ancestor inside a form', () => {
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
      const onClick = mock()
      const app = (checked: boolean) => (
        <Harness onClick={onClick} onFormChange={mock()}>
          <Checkbox aria-label="basic checkbox" checked={checked} />
        </Harness>
      )
      const { rerender } = render(app(false))

      act(() => rerender(app(true)))

      expect(onClick).not.toHaveBeenCalled()
      expect(box().checked).toBe(true)
    })

    it('should trigger the ancestor `onClick` on a real user click', () => {
      const onClick = mock()
      render(
        <Harness onClick={onClick} onFormChange={mock()}>
          <Checkbox aria-label="basic checkbox" />
        </Harness>,
      )

      fireEvent.click(box())

      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('should not trigger the ancestor `onClick` on a programmatic update after a click that did not change `checked`', () => {
      const onClick = mock()
      const app = (checked: boolean) => (
        <Harness onClick={onClick} onFormChange={mock()}>
          <Checkbox aria-label="basic checkbox" checked={checked} onCheckedChange={() => undefined} />
        </Harness>
      )
      const { rerender } = render(app(false))

      fireEvent.click(box())
      onClick.mockClear()
      act(() => rerender(app(true)))

      expect(onClick).not.toHaveBeenCalled()
    })

    it('should trigger the ancestor `onClick` for a user click that the controlled parent ignores', () => {
      const onClick = mock()
      render(
        <Harness onClick={onClick} onFormChange={mock()}>
          <Checkbox aria-label="basic checkbox" checked={false} onCheckedChange={() => undefined} />
        </Harness>,
      )

      fireEvent.click(box())

      expect(box().checked).toBe(false)
      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('should trigger the ancestor `onClick` once and notify the form when the controlled parent applies `checked` after a timeout', async () => {
      const onClick = mock()
      const onFormChange = mock()
      function DelayedApp() {
        const [checked, setChecked] = React.useState<CheckedState>(false)
        return (
          <Harness onClick={onClick} onFormChange={onFormChange}>
            <Checkbox
              aria-label="basic checkbox"
              checked={checked}
              onCheckedChange={(next) => setTimeout(() => setChecked(next === true))}
            />
          </Harness>
        )
      }
      render(<DelayedApp />)

      fireEvent.click(box())
      await act(() => new Promise((resolve) => setTimeout(resolve)))

      expect(box().checked).toBe(true)
      expect(onClick).toHaveBeenCalledTimes(1)
      expect(onFormChange).toHaveBeenCalledTimes(1)
      expect(onFormChange).toHaveBeenCalledWith(true)
    })

    it('should trigger the ancestor `onClick` once and notify the form when the controlled parent applies `checked` in a transition', async () => {
      const onClick = mock()
      const onFormChange = mock()
      function TransitionApp() {
        const [checked, setChecked] = React.useState<CheckedState>(false)
        return (
          <Harness onClick={onClick} onFormChange={onFormChange}>
            <Checkbox
              aria-label="basic checkbox"
              checked={checked}
              onCheckedChange={(next) => React.startTransition(() => setChecked(next === true))}
            />
          </Harness>
        )
      }
      render(<TransitionApp />)

      await act(async () => fireEvent.click(box()))

      expect(box().checked).toBe(true)
      expect(onClick).toHaveBeenCalledTimes(1)
      expect(onFormChange).toHaveBeenCalledTimes(1)
      expect(onFormChange).toHaveBeenCalledWith(true)
    })

    it('should trigger the ancestor `onClick` once and notify the form when the controlled parent applies a different `checked` state than requested', () => {
      const onClick = mock()
      const onFormChange = mock()
      function CoercingApp() {
        const [checked, setChecked] = React.useState<CheckedState>(true)
        return (
          <Harness onClick={onClick} onFormChange={onFormChange}>
            <Checkbox
              aria-label="basic checkbox"
              checked={checked}
              onCheckedChange={(next) => setChecked(next === false ? 'indeterminate' : next)}
            />
          </Harness>
        )
      }
      render(<CoercingApp />)

      fireEvent.click(box())

      expect(box().indeterminate).toBe(true)
      expect(box().dataset.checked).toBe('indeterminate')
      expect(onClick).toHaveBeenCalledTimes(1)
      expect(onFormChange).toHaveBeenCalledTimes(1)
      expect(onFormChange).toHaveBeenCalledWith(false)
    })

    it('should not trigger the ancestor `onClick` when propagation is stopped on the trigger and the controlled parent applies `checked` later', async () => {
      const onClick = mock()
      const onFormChange = mock()
      function DelayedApp() {
        const [checked, setChecked] = React.useState<CheckedState>(false)
        return (
          <Harness onClick={onClick} onFormChange={onFormChange}>
            <Checkbox
              aria-label="basic checkbox"
              checked={checked}
              onCheckedChange={(next) => setTimeout(() => setChecked(next === true))}
              onClick={(event) => event.stopPropagation()}
            />
          </Harness>
        )
      }
      render(<DelayedApp />)

      fireEvent.click(box())
      await act(() => new Promise((resolve) => setTimeout(resolve)))

      expect(box().checked).toBe(true)
      expect(onClick).not.toHaveBeenCalled()
      expect(onFormChange).toHaveBeenCalledTimes(1)
      expect(onFormChange).toHaveBeenCalledWith(true)
    })

    it('should not trigger the ancestor `onClick` when propagation is stopped on the trigger', () => {
      const onClick = mock()
      const onFormChange = mock()
      render(
        <Harness onClick={onClick} onFormChange={onFormChange}>
          <Checkbox aria-label="basic checkbox" onClick={(event) => event.stopPropagation()} />
        </Harness>,
      )

      fireEvent.click(box())

      expect(box().checked).toBe(true)
      expect(onClick).not.toHaveBeenCalled()
      expect(onFormChange).toHaveBeenCalledTimes(1)
      expect(onFormChange).toHaveBeenCalledWith(true)
    })
  })
})

describe('Legacy Checkbox', () => {
  describe('given an uncontrolled Checkbox in a form', () => {
    it('should receive change event with target `defaultChecked` same as the `defaultChecked` prop of Checkbox', () => {
      const defaults: boolean[] = []
      const app = (defaultChecked: boolean) => (
        <form onChange={(event) => defaults.push(input(event).defaultChecked)}>
          <Checkbox aria-label="basic checkbox" defaultChecked={defaultChecked} />
        </form>
      )
      const { rerender } = render(app(true))

      fireEvent.click(box())
      rerender(app(false))
      fireEvent.click(box())

      expect(defaults).toEqual([true, false])
    })
  })

  describe('given a controlled Checkbox in a form', () => {
    it('should receive change event with target `defaultChecked` same as initial value of `checked` of Checkbox', () => {
      const defaults: boolean[] = []
      const app = (checked: boolean) => (
        <form onChange={(event) => defaults.push(input(event).defaultChecked)}>
          <Checkbox aria-label="basic checkbox" checked={checked} />
        </form>
      )
      const { rerender } = render(app(true))

      fireEvent.click(box())
      rerender(app(false))
      fireEvent.click(box())

      expect(defaults).toEqual([true, true])
    })
  })
})
