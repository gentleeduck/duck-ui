import { act, createEvent, fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { freshDom, wait } from '../../__tests__/dom'
import { DirectionProvider } from '../../direction'
import {
  createRadioGroupScope,
  RadioGroup,
  RadioGroupIndicator,
  RadioGroupItem,
  RadioGroupItemBubbleInput,
  RadioGroupItemProvider,
  RadioGroupItemTrigger,
} from '../index'

freshDom()

// jsdom has no scrollIntoView.
const originalScrollIntoView = Element.prototype.scrollIntoView
beforeAll(() => {
  Element.prototype.scrollIntoView = () => {}
})
afterAll(() => {
  Element.prototype.scrollIntoView = originalScrollIntoView
})

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
    const handler = vi.fn(() => {})
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

  it('marks the indicator of a checked radio that is disabled', () => {
    const { container } = render(
      <RadioGroup defaultValue="a" disabled>
        <RadioGroupItem value="a">
          <RadioGroupIndicator />
        </RadioGroupItem>
      </RadioGroup>,
    )

    expect(container.querySelector('[data-slot="radio-group-indicator"]')?.getAttribute('data-disabled')).toBe('')
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

function renderFruitRadioGroup() {
  render(
    <>
      <RadioGroup data-testid="group">
        <RadioGroupItem value="apple">Apple</RadioGroupItem>
        <RadioGroupItem value="banana">Banana</RadioGroupItem>
        <RadioGroupItem value="cherry">Cherry</RadioGroupItem>
      </RadioGroup>
      <button type="button">Outside</button>
    </>,
  )
}

const checked = () => screen.queryByRole('radio', { checked: true })?.textContent ?? null

describe('RadioGroup keyboard selection', () => {
  it('selects the item a typed letter starts', async () => {
    renderFruitRadioGroup()
    act(() => screen.getByText('Apple').focus())

    fireEvent.keyDown(screen.getByText('Apple'), { key: 'b' })
    await wait(0)

    expect(checked()).toBe('Banana')
  })

  it('selects the last item on G', async () => {
    renderFruitRadioGroup()
    act(() => screen.getByText('Apple').focus())

    fireEvent.keyDown(screen.getByText('Apple'), { key: 'G', shiftKey: true })
    await wait(0)

    expect(document.activeElement).toBe(screen.getByText('Cherry'))
    expect(checked()).toBe('Cherry')
  })

  it('g g still checks the first item when a busy page runs the timers of the press before late', async () => {
    renderFruitRadioGroup()
    act(() => screen.getByText('Apple').focus())

    fireEvent.keyDown(screen.getByText('Apple'), { key: 'G', shiftKey: true })
    await wait(0)
    const busyUntil = performance.now() + 30
    while (performance.now() < busyUntil) {}
    fireEvent.keyDown(screen.getByText('Cherry'), { key: 'g' })
    fireEvent.keyDown(screen.getByText('Cherry'), { key: 'g' })
    await wait(40)

    expect(document.activeElement).toBe(screen.getByText('Apple'))
    expect(checked()).toBe('Apple')
  })
})

describe('RadioGroup losing focus', () => {
  it('drops a pending arrow-key selection when focus leaves the group', async () => {
    renderFruitRadioGroup()
    act(() => screen.getByText('Apple').focus())

    fireEvent.keyDown(screen.getByText('Apple'), { key: 'ArrowDown' })
    act(() => screen.getByText('Outside').focus())
    await wait(0)

    expect(checked()).toBeNull()
  })
})

describe('RadioGroup Enter key', () => {
  it('keeps Enter from clicking the radio, which only Space checks', () => {
    renderFruitRadioGroup()
    const enter = createEvent.keyDown(screen.getByText('Apple'), { key: 'Enter' })

    fireEvent(screen.getByText('Apple'), enter)

    expect(enter.defaultPrevented).toBe(true)
  })
})

describe('RadioGroup readOnly', () => {
  function renderReadOnly() {
    render(
      <RadioGroup readOnly defaultValue="apple" data-testid="group">
        <RadioGroupItem value="apple">Apple</RadioGroupItem>
        <RadioGroupItem value="banana">Banana</RadioGroupItem>
      </RadioGroup>,
    )
  }

  it('announces itself read-only', () => {
    renderReadOnly()

    expect(screen.getByTestId('group').getAttribute('aria-readonly')).toBe('true')
    expect(screen.getByTestId('group').hasAttribute('data-readonly')).toBe(true)
    expect(screen.getByText('Banana').hasAttribute('data-readonly')).toBe(true)
  })

  it('ignores a click', () => {
    renderReadOnly()

    fireEvent.click(screen.getByText('Banana'))

    expect(checked()).toBe('Apple')
  })

  it('moves focus on an arrow key without checking the radio it lands on', async () => {
    renderReadOnly()
    act(() => screen.getByText('Apple').focus())

    fireEvent.keyDown(screen.getByText('Apple'), { key: 'ArrowDown' })
    await nextTick()

    expect(document.activeElement).toBe(screen.getByText('Banana'))
    expect(checked()).toBe('Apple')
  })
})

describe('RadioGroup cleared to null', () => {
  it('leaves an item valued with an empty string unchecked', () => {
    render(
      <RadioGroup value={null}>
        <RadioGroupItem value="">None</RadioGroupItem>
        <RadioGroupItem value="cat">Cat</RadioGroupItem>
      </RadioGroup>,
    )

    expect(checked()).toBeNull()
  })

  it('refuses a submit while required, though an item is valued with an empty string', () => {
    render(
      <form data-testid="form">
        <RadioGroup name="pet" required value={null}>
          <RadioGroupItem value="">None</RadioGroupItem>
          <RadioGroupItem value="cat">Cat</RadioGroupItem>
        </RadioGroup>
      </form>,
    )

    expect((screen.getByTestId('form') as HTMLFormElement).checkValidity()).toBe(false)
  })

  it('hands onValueChange null when a form reset takes it back to no pick', () => {
    const onValueChange = vi.fn()
    render(
      <form>
        <RadioGroup name="pet" onValueChange={onValueChange}>
          <RadioGroupItem value="cat">Cat</RadioGroupItem>
        </RadioGroup>
        <button type="reset">Reset</button>
      </form>,
    )
    act(() => fireEvent.click(screen.getByText('Cat')))

    act(() => fireEvent.click(screen.getByText('Reset')))

    expect(onValueChange.mock.calls).toEqual([['cat'], [null]])
  })
})

describe('RadioGroup in a form', () => {
  function renderPetForm(onChange: () => void) {
    render(
      <form onChange={onChange}>
        <RadioGroup name="pet" defaultValue="cat">
          <RadioGroupItem value="cat">Cat</RadioGroupItem>
          <RadioGroupItem value="dog">Dog</RadioGroupItem>
        </RadioGroup>
        <button type="reset">Reset</button>
      </form>,
    )
  }

  const checkedInput = () => document.querySelector<HTMLInputElement>('input[name="pet"]:checked')?.value ?? null

  it('tells the form once when a radio is picked', () => {
    const onChange = vi.fn()
    renderPetForm(onChange)

    act(() => fireEvent.click(screen.getByText('Dog')))

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(checkedInput()).toBe('dog')
  })

  it('fires no click when it mounts with a radio checked', () => {
    const onClick = vi.fn()

    render(
      <form ref={(form) => form?.addEventListener('click', onClick)}>
        <RadioGroup name="pet" defaultValue="cat">
          <RadioGroupItem value="cat">Cat</RadioGroupItem>
        </RadioGroup>
      </form>,
    )

    expect(onClick).not.toHaveBeenCalled()
  })

  it('keeps the hidden inputs out of the tab order and the pointer path', () => {
    renderPetForm(vi.fn())
    const input = document.querySelector<HTMLInputElement>('input[value="cat"]')!

    expect(input.tabIndex).toBe(-1)
    expect(input.style.pointerEvents).toBe('none')
  })

  it('hands focus given to a hidden input, as by a form refusing a submit, to the radio it stands for', () => {
    renderPetForm(vi.fn())

    act(() => document.querySelector<HTMLInputElement>('input[value="dog"]')?.focus())

    expect(document.activeElement).toBe(screen.getByRole('radio', { name: 'Dog' }))
  })

  it('hands that focus to the trigger of an item composed by hand', () => {
    render(
      <RadioGroup name="pet">
        <RadioGroupItemProvider value="cat">
          <RadioGroupItemTrigger>Cat</RadioGroupItemTrigger>
          <RadioGroupItemBubbleInput />
        </RadioGroupItemProvider>
      </RadioGroup>,
    )

    act(() => document.querySelector<HTMLInputElement>('input[value="cat"]')?.focus())

    expect(document.activeElement).toBe(screen.getByRole('radio', { name: 'Cat' }))
  })

  it('disables the hidden inputs of a disabled group, so the form submits none of them', () => {
    render(
      <form data-testid="form">
        <RadioGroup name="pet" defaultValue="cat" disabled>
          <RadioGroupItem value="cat">Cat</RadioGroupItem>
        </RadioGroup>
      </form>,
    )

    expect(new FormData(screen.getByTestId('form') as HTMLFormElement).get('pet')).toBeNull()
  })

  it('submits with a form outside it named by form', () => {
    render(
      <>
        <form id="pets" data-testid="form" />
        <RadioGroup name="pet" defaultValue="cat" form="pets">
          <RadioGroupItem value="cat">Cat</RadioGroupItem>
        </RadioGroup>
      </>,
    )

    expect(new FormData(screen.getByTestId('form') as HTMLFormElement).get('pet')).toBe('cat')
  })

  it('draws the hidden inputs invisible and out of the flow', () => {
    renderPetForm(vi.fn())
    const input = document.querySelector<HTMLInputElement>('input[value="cat"]')!

    expect([input.style.position, input.style.opacity]).toEqual(['absolute', '0'])
  })

  it('keeps the pick it mounted with as the one its inputs reset to', () => {
    renderPetForm(vi.fn())

    act(() => fireEvent.click(screen.getByText('Dog')))

    expect(
      [...document.querySelectorAll<HTMLInputElement>('input[name="pet"]')].map((input) => input.defaultChecked),
    ).toEqual([true, false])
  })

  it('runs an onFocus given to a hidden input before handing the focus on', () => {
    const onFocus = vi.fn()
    render(
      <RadioGroup name="pet">
        <RadioGroupItemProvider value="cat">
          <RadioGroupItemTrigger>Cat</RadioGroupItemTrigger>
          <RadioGroupItemBubbleInput onFocus={onFocus} />
        </RadioGroupItemProvider>
      </RadioGroup>,
    )

    act(() => document.querySelector<HTMLInputElement>('input[value="cat"]')?.focus())

    expect([onFocus.mock.calls.length, document.activeElement?.textContent]).toEqual([1, 'Cat'])
  })

  it('keeps the focus on a hidden input in a group whose root drops its ref', () => {
    function NoRef({ ref: _ref, ...props }: React.ComponentProps<'div'>) {
      return <div {...props} />
    }
    render(
      <RadioGroup name="pet" asChild>
        <NoRef>
          <RadioGroupItem value="cat">Cat</RadioGroupItem>
        </NoRef>
      </RadioGroup>,
    )
    const input = document.querySelector<HTMLInputElement>('input[value="cat"]')!

    act(() => input.focus())

    expect(document.activeElement).toBe(input)
  })

  it('takes a form reset through a hidden input slotted onto a component that drops its ref', () => {
    function NoRef({ ref: _ref, ...props }: React.ComponentProps<'input'>) {
      return <input {...props} />
    }
    render(
      <form id="pets-unreached">
        <RadioGroup name="pet" defaultValue="cat">
          <RadioGroupItemProvider value="cat">
            <RadioGroupItemTrigger>Cat</RadioGroupItemTrigger>
            <RadioGroupItemBubbleInput asChild>
              <NoRef />
            </RadioGroupItemBubbleInput>
          </RadioGroupItemProvider>
        </RadioGroup>
      </form>,
    )

    expect(() => act(() => document.forms.namedItem('pets-unreached')?.reset())).not.toThrow()
  })

  it('restores its pick on reset when it renders into another document, such as an iframe', () => {
    const iframe = document.body.appendChild(document.createElement('iframe'))
    const frame = iframe.contentDocument!
    const container = frame.body.appendChild(frame.createElement('div'))
    try {
      render(
        <>
          <form id="pets" />
          <RadioGroup name="pet" defaultValue="cat" form="pets">
            <RadioGroupItem value="cat">Cat</RadioGroupItem>
            <RadioGroupItem value="dog">Dog</RadioGroupItem>
          </RadioGroup>
        </>,
        { container },
      )
      act(() => fireEvent.click(container.querySelector('[data-value="dog"]')!))

      act(() => frame.querySelector('form')!.reset())

      expect(container.querySelector('[aria-checked="true"]')?.textContent).toBe('Cat')
    } finally {
      iframe.remove()
    }
  })

  it('restores the inputs on reset without telling the form, as native radios do', () => {
    const onChange = vi.fn()
    renderPetForm(onChange)
    act(() => fireEvent.click(screen.getByText('Dog')))
    onChange.mockClear()

    act(() => fireEvent.click(screen.getByText('Reset')))

    expect(onChange).not.toHaveBeenCalled()
    expect(checked()).toBe('Cat')
    expect(checkedInput()).toBe('cat')
  })
})

describe('RadioGroup reset by its form', () => {
  const checkedInput = () => document.querySelector<HTMLInputElement>('input[name="pet"]:checked')?.value ?? null

  it('restores its pick when the form it names renders after it', () => {
    function LateForm({ withForm }: { withForm: boolean }) {
      return (
        <>
          <RadioGroup name="pet" defaultValue="cat" form="pets">
            <RadioGroupItem value="cat">Cat</RadioGroupItem>
            <RadioGroupItem value="dog">Dog</RadioGroupItem>
          </RadioGroup>
          {withForm ? <form id="pets" data-testid="form" /> : null}
        </>
      )
    }
    const { rerender } = render(<LateForm withForm={false} />)
    act(() => fireEvent.click(screen.getByText('Dog')))
    rerender(<LateForm withForm />)

    act(() => (screen.getByTestId('form') as HTMLFormElement).reset())

    expect([checked(), checkedInput()]).toEqual(['Cat', 'cat'])
  })

  it('keeps its pick when the form cancels the reset', () => {
    render(
      <form onReset={(event) => event.preventDefault()}>
        <RadioGroup name="pet" defaultValue="cat">
          <RadioGroupItem value="cat">Cat</RadioGroupItem>
          <RadioGroupItem value="dog">Dog</RadioGroupItem>
        </RadioGroup>
        <button type="reset">Reset</button>
      </form>,
    )
    act(() => fireEvent.click(screen.getByText('Dog')))

    act(() => fireEvent.click(screen.getByText('Reset')))

    expect([checked(), checkedInput()]).toEqual(['Dog', 'dog'])
  })

  it('keeps its pick when the form around it resets and its form is set empty', () => {
    render(
      <form>
        <RadioGroup name="pet" defaultValue="cat" form="">
          <RadioGroupItem value="cat">Cat</RadioGroupItem>
          <RadioGroupItem value="dog">Dog</RadioGroupItem>
        </RadioGroup>
        <button type="reset">Reset</button>
      </form>,
    )
    act(() => fireEvent.click(screen.getByText('Dog')))

    act(() => fireEvent.click(screen.getByText('Reset')))

    expect(checked()).toBe('Dog')
  })

  it('submits the pick it shows after two resets, once its name came after a change', async () => {
    function LateName() {
      const [named, setNamed] = React.useState(false)
      return (
        <form>
          <RadioGroup name={named ? 'pet' : undefined} defaultValue="cat">
            <RadioGroupItem value="cat">Cat</RadioGroupItem>
            <RadioGroupItem value="dog">Dog</RadioGroupItem>
          </RadioGroup>
          <button type="button" onClick={() => setNamed(true)}>
            Name it
          </button>
          <button type="reset">Reset</button>
        </form>
      )
    }
    render(<LateName />)
    act(() => fireEvent.click(screen.getByText('Dog')))
    act(() => fireEvent.click(screen.getByText('Name it')))

    act(() => fireEvent.click(screen.getByText('Reset')))
    act(() => fireEvent.click(screen.getByText('Reset')))
    await nextTick()

    expect([checked(), checkedInput()]).toEqual(['Cat', 'cat'])
  })

  it('submits the pick it shows when its parent declines the reset', async () => {
    function Declining() {
      const [pet, setPet] = React.useState('cat')
      return (
        <form>
          <RadioGroup name="pet" value={pet}>
            <RadioGroupItem value="cat">Cat</RadioGroupItem>
            <RadioGroupItem value="dog">Dog</RadioGroupItem>
          </RadioGroup>
          <button type="button" onClick={() => setPet('dog')}>
            Choose dog
          </button>
          <button type="reset">Reset</button>
        </form>
      )
    }
    render(<Declining />)
    act(() => fireEvent.click(screen.getByText('Choose dog')))

    act(() => fireEvent.click(screen.getByText('Reset')))
    await nextTick()

    expect([checked(), checkedInput()]).toEqual(['Dog', 'dog'])
  })
})

describe('RadioGroup after a reset', () => {
  function ControlledPetForm({ onChange }: { onChange: () => void }) {
    const [pet, setPet] = React.useState('cat')
    return (
      <form onChange={onChange}>
        <RadioGroup name="pet" value={pet} onValueChange={setPet}>
          <RadioGroupItem value="cat">Cat</RadioGroupItem>
          <RadioGroupItem value="dog">Dog</RadioGroupItem>
        </RadioGroup>
        <button type="reset">Reset</button>
        <button type="button" onClick={() => setPet('dog')}>
          Choose dog
        </button>
      </form>
    )
  }

  it('tells the form about the next change once a reset restored a pick', () => {
    const onChange = vi.fn()
    render(<ControlledPetForm onChange={onChange} />)
    act(() => fireEvent.click(screen.getByText('Dog')))
    act(() => fireEvent.click(screen.getByText('Reset')))
    onChange.mockClear()

    act(() => fireEvent.click(screen.getByText('Choose dog')))

    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('tells the form about the next change after a second reset', () => {
    const onChange = vi.fn()
    render(<ControlledPetForm onChange={onChange} />)
    act(() => fireEvent.click(screen.getByText('Choose dog')))
    act(() => fireEvent.click(screen.getByText('Reset')))
    act(() => fireEvent.click(screen.getByText('Reset')))
    onChange.mockClear()

    act(() => fireEvent.click(screen.getByText('Choose dog')))

    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('tells the form about the next change after a reset with nothing to restore', () => {
    const onChange = vi.fn()
    render(<ControlledPetForm onChange={onChange} />)
    act(() => fireEvent.click(screen.getByText('Reset')))

    act(() => fireEvent.click(screen.getByText('Choose dog')))

    expect(onChange).toHaveBeenCalledTimes(1)
  })
})

describe('RadioGroup typeahead', () => {
  it('matches an item by its textValue rather than what it shows', async () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="small" textValue="Small">
          One
        </RadioGroupItem>
        <RadioGroupItem value="large" textValue="Large">
          Two
        </RadioGroupItem>
      </RadioGroup>,
    )
    act(() => screen.getByText('One').focus())

    fireEvent.keyDown(screen.getByText('One'), { key: 'l' })
    await wait(0)

    expect(checked()).toBe('Two')
  })

  it('skips a disabled item', async () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="apple">Apple</RadioGroupItem>
        <RadioGroupItem value="banana" disabled>
          Banana
        </RadioGroupItem>
        <RadioGroupItem value="blueberry">Blueberry</RadioGroupItem>
      </RadioGroup>,
    )
    act(() => screen.getByText('Apple').focus())

    fireEvent.keyDown(screen.getByText('Apple'), { key: 'b' })
    await wait(0)

    expect(checked()).toBe('Blueberry')
  })
})

describe('RadioGroup typeahead where the browser has checkVisibility', () => {
  beforeAll(() => {
    Object.defineProperty(HTMLElement.prototype, 'checkVisibility', {
      configurable: true,
      value(this: HTMLElement) {
        return !this.hidden
      },
    })
  })
  afterAll(() => {
    Reflect.deleteProperty(HTMLElement.prototype, 'checkVisibility')
  })

  it('skips a hidden item', async () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="apple">Apple</RadioGroupItem>
        <RadioGroupItem value="banana" hidden>
          Banana
        </RadioGroupItem>
        <RadioGroupItem value="blueberry">Blueberry</RadioGroupItem>
      </RadioGroup>,
    )
    act(() => screen.getByText('Apple').focus())

    fireEvent.keyDown(screen.getByText('Apple'), { key: 'b' })
    await wait(0)

    expect(checked()).toBe('Blueberry')
  })
})

describe('RadioGroup typeahead sources', () => {
  it('matches an item by its aria-label when it has no textValue', async () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="small" aria-label="Small">
          One
        </RadioGroupItem>
        <RadioGroupItem value="large" aria-label="Large">
          Two
        </RadioGroupItem>
      </RadioGroup>,
    )
    act(() => screen.getByText('One').focus())

    fireEvent.keyDown(screen.getByText('One'), { key: 'l' })
    await wait(0)

    expect(checked()).toBe('Two')
  })

  it('leaves a letter typed in a group nested inside it to that group', async () => {
    render(
      <RadioGroup defaultValue="apple">
        <RadioGroupItem value="apple">Apple</RadioGroupItem>
        <RadioGroupItem value="berry">Berry</RadioGroupItem>
        <RadioGroup defaultValue="avocado">
          <RadioGroupItem value="avocado">Avocado</RadioGroupItem>
          <RadioGroupItem value="banana">Banana</RadioGroupItem>
        </RadioGroup>
      </RadioGroup>,
    )
    act(() => screen.getByText('Avocado').focus())

    fireEvent.keyDown(screen.getByText('Avocado'), { key: 'b' })
    await wait(20)

    expect([document.activeElement?.textContent, screen.getByText('Apple').getAttribute('aria-checked')]).toEqual([
      'Banana',
      'true',
    ])
  })

  it('stays out of a group nested inside it', async () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="cherry">Cherry</RadioGroupItem>
        <RadioGroup>
          <RadioGroupItem value="avocado">Avocado</RadioGroupItem>
        </RadioGroup>
        <RadioGroupItem value="apple">Apple</RadioGroupItem>
      </RadioGroup>,
    )
    act(() => screen.getByText('Cherry').focus())

    fireEvent.keyDown(screen.getByText('Cherry'), { key: 'a' })
    await wait(0)

    expect(document.activeElement).toBe(screen.getByText('Apple'))
  })
})

describe('RadioGroup arrow keys', () => {
  it('wraps from the last radio to the first by default', async () => {
    renderFruitRadioGroup()
    act(() => screen.getByText('Cherry').focus())

    fireEvent.keyDown(screen.getByText('Cherry'), { key: 'ArrowDown' })
    await nextTick()

    expect(checked()).toBe('Apple')
  })

  it('checks the radio two quick presses land on', async () => {
    renderFruitRadioGroup()
    act(() => screen.getByText('Apple').focus())

    fireEvent.keyDown(screen.getByText('Apple'), { key: 'ArrowDown' })
    fireEvent.keyDown(screen.getByText('Banana'), { key: 'ArrowDown' })
    await nextTick()

    expect([document.activeElement?.textContent, checked()]).toEqual(['Cherry', 'Cherry'])
  })

  it('takes a typed letter without throwing through a root given to a component that drops its ref', () => {
    function NoRef({ ref: _ref, ...props }: React.ComponentProps<'div'>) {
      return <div {...props} />
    }
    render(
      <RadioGroup asChild>
        <NoRef>
          <RadioGroupItem value="apple">Apple</RadioGroupItem>
          <RadioGroupItem value="banana">Banana</RadioGroupItem>
        </NoRef>
      </RadioGroup>,
    )
    act(() => screen.getByText('Apple').focus())

    expect(() => fireEvent.keyDown(screen.getByText('Apple'), { key: 'b' })).not.toThrow()
  })

  it('skips a disabled radio', async () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="apple">Apple</RadioGroupItem>
        <RadioGroupItem value="banana" disabled>
          Banana
        </RadioGroupItem>
        <RadioGroupItem value="cherry">Cherry</RadioGroupItem>
      </RadioGroup>,
    )
    act(() => screen.getByText('Apple').focus())

    fireEvent.keyDown(screen.getByText('Apple'), { key: 'ArrowDown' })
    await nextTick()

    expect(checked()).toBe('Cherry')
  })

  it('hands focus entering the group to the checked radio', () => {
    render(
      <RadioGroup defaultValue="banana">
        <RadioGroupItem value="apple">Apple</RadioGroupItem>
        <RadioGroupItem value="banana">Banana</RadioGroupItem>
      </RadioGroup>,
    )

    act(() => screen.getByRole('radiogroup').focus())

    expect(document.activeElement).toBe(screen.getByText('Banana'))
  })
})

describe('RadioGroup picking the checked radio', () => {
  it('leaves the next change audible when its click stopped propagating', () => {
    const onChange = vi.fn()
    function PetForm() {
      const [pet, setPet] = React.useState('cat')
      return (
        <form onChange={onChange}>
          <RadioGroup name="pet" value={pet} onValueChange={setPet}>
            <RadioGroupItem value="cat" onClick={(event) => event.stopPropagation()}>
              Cat
            </RadioGroupItem>
            <RadioGroupItem value="dog">Dog</RadioGroupItem>
          </RadioGroup>
          <button type="button" onClick={() => setPet('dog')}>
            Choose dog
          </button>
        </form>
      )
    }
    render(<PetForm />)
    act(() => fireEvent.click(screen.getByText('Cat')))

    act(() => fireEvent.click(screen.getByText('Choose dog')))

    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('tells the form about a change its parent makes after declining a pick whose click stopped propagating', () => {
    const onChange = vi.fn()
    function PetForm() {
      const [pet, setPet] = React.useState('cat')
      return (
        <form onChange={onChange}>
          <RadioGroup name="pet" value={pet}>
            <RadioGroupItem value="cat">Cat</RadioGroupItem>
            <RadioGroupItem value="dog" onClick={(event) => event.stopPropagation()}>
              Dog
            </RadioGroupItem>
            <RadioGroupItem value="bird">Bird</RadioGroupItem>
          </RadioGroup>
          <button type="button" onClick={() => setPet('bird')}>
            Choose bird
          </button>
        </form>
      )
    }
    render(<PetForm />)
    act(() => fireEvent.click(screen.getByText('Dog')))

    act(() => fireEvent.click(screen.getByText('Choose bird')))

    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('does not report a change', () => {
    const onValueChange = vi.fn()
    render(
      <RadioGroup value="apple" onValueChange={onValueChange}>
        <RadioGroupItem value="apple">Apple</RadioGroupItem>
      </RadioGroup>,
    )

    fireEvent.click(screen.getByText('Apple'))

    expect(onValueChange).not.toHaveBeenCalled()
  })
})

describe('RadioGroup disabled', () => {
  it('checks no disabled item through a trigger slotted onto an element with no disabled state', () => {
    render(
      <RadioGroup>
        <RadioGroupItemProvider value="dog" disabled>
          <RadioGroupItemTrigger asChild>
            <span>Dog</span>
          </RadioGroupItemTrigger>
        </RadioGroupItemProvider>
      </RadioGroup>,
    )

    fireEvent.click(screen.getByText('Dog'))

    expect(screen.getByText('Dog').getAttribute('aria-checked')).toBe('false')
  })

  it('marks the group for styling', () => {
    render(
      <RadioGroup disabled data-testid="group">
        <RadioGroupItem value="apple">Apple</RadioGroupItem>
      </RadioGroup>,
    )

    expect(screen.getByTestId('group').hasAttribute('data-disabled')).toBe(true)
  })
})

describe('RadioGroup outside a form', () => {
  it('renders no hidden input without a name', () => {
    renderFruitRadioGroup()

    expect(document.querySelector('input[type="radio"]')).toBeNull()
  })
})

describe('RadioGroup typing after other keys', () => {
  async function typeAfter(between: () => Promise<void> | void) {
    renderFruitRadioGroup()
    act(() => screen.getByText('Apple').focus())
    fireEvent.keyDown(screen.getByText('Apple'), { key: 'b' })
    await wait(0)
    await between()

    fireEvent.keyDown(document.activeElement!, { key: 'a' })
    await wait(0)

    return document.activeElement?.textContent
  }

  it('starts a new search after an arrow key', async () => {
    expect(await typeAfter(() => fireEvent.keyDown(screen.getByText('Banana'), { key: 'ArrowDown' }))).toBe('Apple')
  })

  it('starts a new search after G', async () => {
    expect(await typeAfter(() => fireEvent.keyDown(screen.getByText('Banana'), { key: 'G', shiftKey: true }))).toBe(
      'Apple',
    )
  })

  it('starts a new search once focus has left the group and come back', async () => {
    expect(
      await typeAfter(() => {
        act(() => screen.getByText('Outside').focus())
        act(() => screen.getByText('Cherry').focus())
      }),
    ).toBe('Apple')
  })

  it('searches for no letter typed with Control, Alt or Meta', async () => {
    renderFruitRadioGroup()
    const apple = screen.getByText('Apple')
    act(() => apple.focus())
    const focused: (string | null | undefined)[] = []

    for (const modifier of ['ctrlKey', 'altKey', 'metaKey']) {
      fireEvent.keyDown(apple, { key: 'b', [modifier]: true })
      await wait(0)
      focused.push(document.activeElement?.textContent)
    }

    expect(focused).toEqual(['Apple', 'Apple', 'Apple'])
  })

  it('searches for no named key, such as Tab', async () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="siamese">Siamese</RadioGroupItem>
        <RadioGroupItem value="tabby">Tabby</RadioGroupItem>
      </RadioGroup>,
    )
    act(() => screen.getByText('Siamese').focus())

    fireEvent.keyDown(screen.getByText('Siamese'), { key: 'Tab' })
    await wait(0)

    expect(document.activeElement?.textContent).toBe('Siamese')
  })

  it('adds no Space to the search, which checks the radio instead', async () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="apple">Apple</RadioGroupItem>
        <RadioGroupItem value="avocado">Avocado</RadioGroupItem>
        <RadioGroupItem value="mango">A mango</RadioGroupItem>
      </RadioGroup>,
    )
    act(() => screen.getByText('Apple').focus())
    fireEvent.keyDown(screen.getByText('Apple'), { key: 'a' })
    await wait(0)

    fireEvent.keyDown(screen.getByText('Avocado'), { key: ' ' })
    await wait(0)

    expect(document.activeElement?.textContent).toBe('Avocado')
  })
})

describe('RadioGroup keys that check', () => {
  it('checks the radio ArrowUp and Home land on', async () => {
    renderFruitRadioGroup()
    act(() => screen.getByText('Cherry').focus())

    fireEvent.keyDown(screen.getByText('Cherry'), { key: 'ArrowUp' })
    await nextTick()
    const afterArrowUp = checked()
    fireEvent.keyDown(screen.getByText('Banana'), { key: 'Home' })
    await nextTick()

    expect([afterArrowUp, checked()]).toEqual(['Banana', 'Apple'])
  })

  it('checks nothing focus reaches by other means once an arrow key is done', async () => {
    renderFruitRadioGroup()
    act(() => screen.getByText('Apple').focus())
    fireEvent.keyDown(screen.getByText('Apple'), { key: 'ArrowDown' })
    await wait(20)

    act(() => screen.getByText('Cherry').focus())

    expect(checked()).toBe('Banana')
  })

  it('skips a disabled last radio on G', async () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="apple">Apple</RadioGroupItem>
        <RadioGroupItem value="banana">Banana</RadioGroupItem>
        <RadioGroupItem value="cherry" disabled>
          Cherry
        </RadioGroupItem>
      </RadioGroup>,
    )
    act(() => screen.getByText('Apple').focus())

    fireEvent.keyDown(screen.getByText('Apple'), { key: 'G', shiftKey: true })
    await wait(0)

    expect(document.activeElement?.textContent).toBe('Banana')
  })
})

describe('RadioGroup wiring', () => {
  it('is not required by default', () => {
    renderRadioGroup()

    expect(screen.getByRole('radiogroup').getAttribute('aria-required')).toBe('false')
  })

  it('writes no aria-readonly unless read-only', () => {
    renderRadioGroup()

    expect(screen.getByRole('radiogroup').hasAttribute('aria-readonly')).toBe(false)
  })

  it('takes a data-slot passed to the group or an item over its own', () => {
    render(
      <RadioGroup data-slot="choices">
        <RadioGroupItem value="a" data-slot="choice">
          A
        </RadioGroupItem>
      </RadioGroup>,
    )

    expect([screen.getByRole('radiogroup').dataset.slot, screen.getByRole('radio').dataset.slot]).toEqual([
      'choices',
      'choice',
    ])
  })

  it('writes textValue as data-text-value only', () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="a" textValue="Alpha">
          A
        </RadioGroupItem>
      </RadioGroup>,
    )
    const radio = screen.getByRole('radio')

    expect([radio.hasAttribute('textvalue'), radio.dataset.textValue]).toEqual([false, 'Alpha'])
  })

  it('runs the onKeyDown and onBlur given to the group and the onFocus given to an item', () => {
    const onKeyDown = vi.fn()
    const onBlur = vi.fn()
    const onFocus = vi.fn()
    render(
      <>
        <RadioGroup onKeyDown={onKeyDown} onBlur={onBlur}>
          <RadioGroupItem value="a" onFocus={onFocus}>
            A
          </RadioGroupItem>
        </RadioGroup>
        <button type="button">Outside</button>
      </>,
    )

    act(() => screen.getByText('A').focus())
    fireEvent.keyDown(screen.getByText('A'), { key: 'x' })
    act(() => screen.getByText('Outside').focus())

    expect([onFocus, onKeyDown, onBlur].map((handler) => handler.mock.calls.length)).toEqual([1, 1, 1])
  })

  it('hands its parts the scope it is given', () => {
    const useRadioGroupScope = createRadioGroupScope()
    function Scoped() {
      const scope = useRadioGroupScope(undefined)
      return (
        <RadioGroup {...scope} name="pet" defaultValue="cat">
          <RadioGroupItem {...scope} value="cat">
            Cat
            <RadioGroupIndicator {...scope} />
          </RadioGroupItem>
          <RadioGroupItemProvider {...scope} value="dog">
            <RadioGroupItemTrigger {...scope}>Dog</RadioGroupItemTrigger>
            <RadioGroupIndicator {...scope} forceMount />
            <RadioGroupItemBubbleInput {...scope} />
          </RadioGroupItemProvider>
        </RadioGroup>
      )
    }

    render(<Scoped />)

    expect([
      [...document.querySelectorAll('[data-slot="radio-group-indicator"]')].map((node) =>
        node.getAttribute('data-state'),
      ),
      [...document.querySelectorAll<HTMLInputElement>('input[name="pet"]')].map((input) => input.checked),
    ]).toEqual([
      ['checked', 'unchecked'],
      [true, false],
    ])
  })

  it('names each part in React DevTools', () => {
    expect(
      [
        RadioGroup,
        RadioGroupItem,
        RadioGroupItemProvider,
        RadioGroupItemTrigger,
        RadioGroupIndicator,
        RadioGroupItemBubbleInput,
      ].map((part) => part.displayName),
    ).toEqual([
      'RadioGroup',
      'RadioGroupItem',
      'RadioGroupItemProvider',
      'RadioGroupItemTrigger',
      'RadioGroupIndicator',
      'RadioGroupItemBubbleInput',
    ])
  })
})
