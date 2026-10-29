import { afterEach, beforeEach, describe, expect, it, mock, spyOn } from 'bun:test'
import { act, fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import { createPortal } from 'react-dom'
import { freshDom } from '../../__tests__/dom'
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionIndicator,
  AccordionItem,
  AccordionTrigger,
  createAccordionScope,
} from '../index'

freshDom()

function renderAccordion(props: Record<string, unknown> = {}) {
  return render(
    <Accordion {...props}>
      <AccordionItem value="one">
        <AccordionTrigger>Section 1</AccordionTrigger>
        <AccordionContent>Content 1</AccordionContent>
      </AccordionItem>
      <AccordionItem value="two">
        <AccordionTrigger>Section 2</AccordionTrigger>
        <AccordionContent>Content 2</AccordionContent>
      </AccordionItem>
    </Accordion>,
  )
}

describe('Accordion', () => {
  it('renders root with data-slot="accordion"', () => {
    const { container } = renderAccordion()
    expect(container.querySelector('[data-slot="accordion"]')).not.toBeNull()
  })

  it('renders triggers with data-slot="accordion-trigger"', () => {
    const { container } = renderAccordion()
    expect(container.querySelectorAll('[data-slot="accordion-trigger"]').length).toBe(2)
  })

  it('does not render content when closed by default', () => {
    const { container } = renderAccordion()
    expect(container.querySelector('[data-slot="accordion-content"]')).toBeNull()
  })

  it('renders defaultValue content for single accordions', () => {
    const { container } = renderAccordion({ defaultValue: 'one' })
    const trigger = container.querySelector('[data-slot="accordion-trigger"]')!
    const content = container.querySelector('[data-slot="accordion-content"]')!

    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(trigger.getAttribute('data-state')).toBe('open')
    expect(content.textContent).toBe('Content 1')
    expect(content.getAttribute('role')).toBe('region')
  })

  it('toggles a collapsible single item open and closed on click', () => {
    const { container } = renderAccordion({ collapsible: true })
    const trigger = container.querySelector('[data-slot="accordion-trigger"]')!

    fireEvent.click(trigger)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(container.querySelector('[data-slot="accordion-content"]')?.textContent).toBe('Content 1')

    fireEvent.click(trigger)
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(container.querySelector('[data-slot="accordion-content"]')).toBeNull()
  })

  it('keeps force-mounted content in the DOM while closed', () => {
    const { container } = render(
      <Accordion>
        <AccordionItem value="one">
          <AccordionTrigger>Section 1</AccordionTrigger>
          <AccordionContent forceMount>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>,
    )

    const content = container.querySelector('[data-slot="accordion-content"]')!
    expect(content.getAttribute('data-state')).toBe('closed')
    expect(content.getAttribute('aria-hidden')).toBe('true')
  })

  it('calls onValueChange when a single item opens', () => {
    const onValueChange = mock(() => {})
    const { container } = renderAccordion({ onValueChange })

    fireEvent.click(container.querySelector('[data-slot="accordion-trigger"]')!)
    expect(onValueChange).toHaveBeenCalledWith('one')
  })

  it('forwards refs to the trigger', () => {
    const ref = React.createRef<HTMLButtonElement>()

    render(
      <Accordion>
        <AccordionItem value="one">
          <AccordionTrigger ref={ref}>Section 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>,
    )

    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })
})

describe('Accordion single without collapsible', () => {
  it('keeps the item open when it is pressed twice in one task, before React renders the first press', () => {
    renderAccordion({ type: 'single' })
    const [first] = screen.getAllByRole('button')

    act(() => {
      first.click()
      first.click()
    })

    expect(screen.queryByText('Content 1')).not.toBeNull()
  })
})

describe('Accordion.Item without a value', () => {
  it('opens and closes on its own, apart from its siblings', () => {
    render(
      <Accordion type="multiple">
        <AccordionItem>
          <AccordionTrigger>Section 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem>
          <AccordionTrigger>Section 2</AccordionTrigger>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>,
    )

    fireEvent.click(screen.getByText('Section 1'))

    expect([screen.queryByText('Content 1') !== null, screen.queryByText('Content 2') !== null]).toEqual([true, false])
  })
})

describe('Accordion.Trigger asChild', () => {
  it('stays closed when a disabled item is pressed through an element the browser does not disable', () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="one" disabled>
          <AccordionTrigger asChild>
            <span>Section 1</span>
          </AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>,
    )

    fireEvent.click(screen.getByText('Section 1'))

    expect(screen.queryByText('Content 1')).toBeNull()
  })
})

describe('Accordion.Content asChild', () => {
  it('opens when its child never takes the ref', () => {
    function Plain({ children }: { children?: React.ReactNode }) {
      return <div>{children}</div>
    }
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="one">
          <AccordionTrigger>Section 1</AccordionTrigger>
          <AccordionContent asChild>
            <Plain>Content 1</Plain>
          </AccordionContent>
        </AccordionItem>
      </Accordion>,
    )

    fireEvent.click(screen.getByText('Section 1'))

    expect(screen.queryByText('Content 1')).not.toBeNull()
  })
})

describe('Accordion keyboard', () => {
  it('leaves a key it does not handle to the browser', () => {
    renderAccordion({ type: 'single' })
    const [first] = screen.getAllByRole('button')
    act(() => first.focus())

    expect([fireEvent.keyDown(first, { key: 'a' }), document.activeElement?.textContent]).toEqual([true, 'Section 1'])
  })

  it('leaves an arrow key pressed inside the content to the element there', () => {
    render(
      <Accordion type="single" defaultValue="one">
        <AccordionItem value="one">
          <AccordionTrigger>Section 1</AccordionTrigger>
          <AccordionContent>
            <input aria-label="Field" />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="two">
          <AccordionTrigger>Section 2</AccordionTrigger>
        </AccordionItem>
      </Accordion>,
    )
    const field = screen.getByLabelText('Field')
    act(() => field.focus())

    expect([
      fireEvent.keyDown(field, { key: 'ArrowDown' }),
      document.activeElement?.getAttribute('aria-label'),
    ]).toEqual([true, 'Field'])
  })
})

describe('Accordion.Header', () => {
  it('wraps the trigger in an h3 carrying its item state', () => {
    render(
      <Accordion type="single" defaultValue="one" orientation="horizontal">
        <AccordionItem value="one">
          <AccordionHeader data-testid="open">
            <AccordionTrigger>Section 1</AccordionTrigger>
          </AccordionHeader>
        </AccordionItem>
        <AccordionItem value="two" disabled>
          <AccordionHeader data-testid="disabled">
            <AccordionTrigger>Section 2</AccordionTrigger>
          </AccordionHeader>
        </AccordionItem>
      </Accordion>,
    )

    const open = screen.getByTestId('open')
    const disabled = screen.getByTestId('disabled')
    expect(open.tagName).toBe('H3')
    expect(open.getAttribute('data-state')).toBe('open')
    expect(open.hasAttribute('data-disabled')).toBe(false)
    expect(open.getAttribute('data-orientation')).toBe('horizontal')
    expect(disabled.getAttribute('data-state')).toBe('closed')
    expect(disabled.getAttribute('data-disabled')).toBe('')
    expect(screen.getByRole('heading', { name: 'Section 1' })).toBe(open)
  })
})

describe('Accordion disabled', () => {
  it('disables every item when the root is disabled', () => {
    const onValueChange = mock()
    renderAccordion({ type: 'single', disabled: true, onValueChange })

    const [first, second] = screen.getAllByRole('button')
    fireEvent.click(first)

    expect(onValueChange).not.toHaveBeenCalled()
    expect(first.hasAttribute('disabled')).toBe(true)
    expect(second.hasAttribute('disabled')).toBe(true)
    expect(first.closest('[data-slot="accordion-item"]')?.getAttribute('data-disabled')).toBe('')
    expect(screen.getByText('Section 1').closest('[data-slot="accordion"]')?.getAttribute('data-disabled')).toBe('')
  })
})

describe('Accordion loop', () => {
  it('stops at the ends when loop is off', () => {
    renderAccordion({ type: 'single', loop: false })
    const [first, second] = screen.getAllByRole('button')

    act(() => second.focus())
    fireEvent.keyDown(second, { key: 'ArrowDown' })
    expect(document.activeElement).toBe(second)

    act(() => first.focus())
    fireEvent.keyDown(first, { key: 'ArrowUp' })
    expect(document.activeElement).toBe(first)
  })

  it('wraps at the ends by default', () => {
    renderAccordion({ type: 'single' })
    const [first, second] = screen.getAllByRole('button')

    act(() => second.focus())
    fireEvent.keyDown(second, { key: 'ArrowDown' })

    expect(document.activeElement).toBe(first)
  })
})

describe('Accordion.Indicator', () => {
  it('renders a hidden span carrying its item state', () => {
    render(
      <Accordion type="single" defaultValue="one" disabled>
        <AccordionItem value="one">
          <AccordionTrigger>
            Section 1<AccordionIndicator data-testid="indicator" />
          </AccordionTrigger>
        </AccordionItem>
      </Accordion>,
    )

    const indicator = screen.getByTestId('indicator')
    expect(indicator.tagName).toBe('SPAN')
    expect(indicator.getAttribute('aria-hidden')).toBe('true')
    expect(indicator.getAttribute('data-state')).toBe('open')
    expect(indicator.getAttribute('data-disabled')).toBe('')
    expect(indicator.getAttribute('data-orientation')).toBe('vertical')
    expect(screen.getByRole('button', { name: 'Section 1' })).toBeTruthy()
  })
})

describe('Accordion.Indicator closed', () => {
  it('marks the indicator of a closed, enabled item', () => {
    render(
      <Accordion type="single">
        <AccordionItem value="one">
          <AccordionTrigger>
            Section 1<AccordionIndicator data-testid="indicator" />
          </AccordionTrigger>
        </AccordionItem>
      </Accordion>,
    )
    const indicator = screen.getByTestId('indicator')

    expect([indicator.getAttribute('data-state'), indicator.hasAttribute('data-disabled')]).toEqual(['closed', false])
  })
})

describe('Accordion onFocusChange', () => {
  it('reports the focused item, once per move, and null once focus leaves the triggers', () => {
    const onFocusChange = mock()
    render(
      <>
        <Accordion type="single" onFocusChange={onFocusChange}>
          <AccordionItem value="one">
            <AccordionTrigger>Section 1</AccordionTrigger>
          </AccordionItem>
          <AccordionItem value="two">
            <AccordionTrigger>Section 2</AccordionTrigger>
          </AccordionItem>
        </Accordion>
        <button type="button">outside</button>
      </>,
    )
    const [first] = screen.getAllByRole('button')

    act(() => first.focus())
    fireEvent.keyDown(first, { key: 'ArrowDown' })
    act(() => screen.getByRole('button', { name: 'outside' }).focus())

    expect(onFocusChange.mock.calls).toEqual([['one'], ['two'], [null]])
  })
})

describe('Accordion find-in-page', () => {
  function renderFindable(props: Record<string, unknown> = {}) {
    return render(
      <Accordion {...props}>
        <AccordionItem value="shipping">
          <AccordionTrigger>Shipping</AccordionTrigger>
          <AccordionContent hiddenUntilFound>Parcels leave within two days.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="returns" disabled>
          <AccordionTrigger>Returns</AccordionTrigger>
          <AccordionContent hiddenUntilFound>Returns are free for thirty days.</AccordionContent>
        </AccordionItem>
      </Accordion>,
    )
  }

  const content = (text: string) => screen.getByText(text)
  const trigger = (name: string) => screen.getByRole('button', { name })

  it('keeps a closed item in the page as hidden until found', () => {
    renderFindable()

    expect(content('Parcels leave within two days.').getAttribute('hidden')).toBe('until-found')
    expect(content('Parcels leave within two days.').getAttribute('aria-hidden')).toBe('true')
  })

  it('opens the item when the browser finds a match in its content', () => {
    const onValueChange = mock(() => {})
    renderFindable({ onValueChange })

    fireEvent(content('Parcels leave within two days.'), new Event('beforematch'))

    expect(onValueChange).toHaveBeenCalledWith('shipping')
    expect(trigger('Shipping').getAttribute('aria-expanded')).toBe('true')
    expect(content('Parcels leave within two days.').hasAttribute('hidden')).toBe(false)
  })

  it('hides the content until found again once the item closes', () => {
    renderFindable({ collapsible: true })

    fireEvent.click(trigger('Shipping'))
    fireEvent.click(trigger('Shipping'))

    expect(content('Parcels leave within two days.').getAttribute('hidden')).toBe('until-found')
  })

  it('keeps a disabled item out of find-in-page', () => {
    const onValueChange = mock(() => {})
    renderFindable({ onValueChange })

    fireEvent(content('Returns are free for thirty days.'), new Event('beforematch'))

    expect(content('Returns are free for thirty days.').getAttribute('hidden')).toBe('')
    expect(onValueChange).not.toHaveBeenCalled()
  })
})

describe('Accordion.Item onOpenChange', () => {
  function renderWithSpies(props: Record<string, unknown>) {
    const one = mock((_open: boolean) => {})
    const two = mock((_open: boolean) => {})
    render(
      <Accordion {...props}>
        <AccordionItem value="one" onOpenChange={one}>
          <AccordionTrigger>Section 1</AccordionTrigger>
          <AccordionContent hiddenUntilFound>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="two" onOpenChange={two}>
          <AccordionTrigger>Section 2</AccordionTrigger>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>,
    )
    return { one, two }
  }

  it('tells an item when its trigger opens and closes it', () => {
    const { one } = renderWithSpies({ type: 'single', collapsible: true })

    fireEvent.click(screen.getByText('Section 1'))
    fireEvent.click(screen.getByText('Section 1'))

    expect(one.mock.calls).toEqual([[true], [false]])
  })

  it('tells only the item whose trigger was pressed', () => {
    const { one, two } = renderWithSpies({ type: 'single', defaultValue: 'one' })

    fireEvent.click(screen.getByText('Section 2'))

    expect(two.mock.calls).toEqual([[true]])
    expect(one).not.toHaveBeenCalled()
  })

  it('stays quiet when an open item that cannot collapse is pressed', () => {
    const { one } = renderWithSpies({ type: 'single', defaultValue: 'one' })

    fireEvent.click(screen.getByText('Section 1'))

    expect(one).not.toHaveBeenCalled()
  })

  it('tells an item when find-in-page opens it', () => {
    const { one } = renderWithSpies({ type: 'multiple' })

    fireEvent(screen.getByText('Content 1'), new Event('beforematch'))

    expect(one.mock.calls).toEqual([[true]])
  })
})

describe('Accordion dir', () => {
  it('writes no dir attribute without a dir prop', () => {
    const { container } = renderAccordion({ type: 'single', defaultValue: 'one' })

    expect(container.querySelectorAll('[dir]').length).toBe(0)
  })

  it('puts a dir prop on the root alone and reads it for the arrow keys', () => {
    const { container } = renderAccordion({
      type: 'single',
      dir: 'rtl',
      orientation: 'horizontal',
      defaultValue: 'one',
    })
    const withDir = [...container.querySelectorAll('[dir]')].map((element) => element.getAttribute('data-slot'))

    screen.getByText('Section 1').focus()
    fireEvent.keyDown(screen.getByText('Section 1'), { key: 'ArrowLeft' })

    expect(withDir).toEqual(['accordion'])
    expect(document.activeElement).toBe(screen.getByText('Section 2'))
  })
})

describe('Accordion content animation', () => {
  let animationName = 'none'
  let styleSpy: ReturnType<typeof spyOn>
  let rectSpy: ReturnType<typeof spyOn>
  let animations: Pick<CSSAnimation, 'animationName' | 'finished' | 'pending' | 'playState'>[] = []
  let endAnimation = async () => {}

  beforeEach(() => {
    animationName = 'none'
    styleSpy = spyOn(globalThis, 'getComputedStyle').mockImplementation(
      () =>
        ({
          get animationName() {
            return animationName
          },
        }) as CSSStyleDeclaration,
    )
    rectSpy = spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 300, 120))
    Object.defineProperty(HTMLElement.prototype, 'getAnimations', { configurable: true, value: () => animations })
  })

  afterEach(() => {
    styleSpy.mockRestore()
    rectSpy.mockRestore()
    Reflect.deleteProperty(HTMLElement.prototype, 'getAnimations')
  })

  const content = () => document.querySelector<HTMLElement>('[data-slot="accordion-content"]')
  const nextFrame = () => act(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())))

  function animate(name: string) {
    animationName = name
    const finished = new Promise<Animation>((resolve) => {
      endAnimation = () =>
        act(async () => {
          resolve({} as Animation)
          await new Promise<void>((done) => setTimeout(done, 0))
        })
    })
    animations = [{ animationName: name, finished, pending: true, playState: 'running' }]
  }

  it('exposes the open size as CSS variables for the animation to read', () => {
    renderAccordion({ type: 'single', collapsible: true })

    fireEvent.click(screen.getByText('Section 1'))

    expect(content()?.style.getPropertyValue('--gentleduck-accordion-content-height')).toBe('120px')
    expect(content()?.style.getPropertyValue('--gentleduck-accordion-content-width')).toBe('300px')
  })

  it('keeps a size variable its style sets, measuring only the other', () => {
    render(
      <Accordion type="single" collapsible defaultValue="one">
        <AccordionItem value="one">
          <AccordionTrigger>Section 1</AccordionTrigger>
          <AccordionContent style={{ '--gentleduck-accordion-content-height': '40px' } as React.CSSProperties}>
            Content 1
          </AccordionContent>
        </AccordionItem>
      </Accordion>,
    )

    expect([
      content()?.style.getPropertyValue('--gentleduck-accordion-content-height'),
      content()?.style.getPropertyValue('--gentleduck-accordion-content-width'),
    ]).toEqual(['40px', '300px'])
  })

  it('keeps closing content mounted until its exit animation ends', async () => {
    renderAccordion({ type: 'single', collapsible: true, defaultValue: 'one' })
    await nextFrame()

    animate('accordion-up')
    fireEvent.click(screen.getByText('Section 1'))

    expect(content()?.getAttribute('data-state')).toBe('closed')
    expect(content()?.getAttribute('aria-hidden')).toBe('true')
    expect(content()?.style.getPropertyValue('--gentleduck-accordion-content-height')).toBe('120px')

    await endAnimation()

    expect(content()).toBeNull()
  })

  it('skips the open animation of an item open on mount, and plays every one after', async () => {
    renderAccordion({ type: 'single', collapsible: true, defaultValue: 'one' })
    expect(content()?.style.animationName).toBe('none')
    await nextFrame()

    animate('accordion-up')
    fireEvent.click(screen.getByText('Section 1'))
    expect(content()?.style.animationName).toBe('')
    await endAnimation()

    animationName = 'accordion-down'
    fireEvent.click(screen.getByText('Section 1'))
    expect(content()?.style.animationName).toBe('')
  })

  it('hides findable content until found only once its exit animation ends', async () => {
    render(
      <Accordion type="single" collapsible defaultValue="one">
        <AccordionItem value="one">
          <AccordionTrigger>Section 1</AccordionTrigger>
          <AccordionContent hiddenUntilFound>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>,
    )
    await nextFrame()

    animate('accordion-up')
    fireEvent.click(screen.getByText('Section 1'))
    expect(content()?.hasAttribute('hidden')).toBe(false)

    await endAnimation()

    expect(content()?.getAttribute('hidden')).toBe('until-found')
  })
  it('skips the animation of closed content kept in the page until its item first opens', () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="one">
          <AccordionTrigger>Section 1</AccordionTrigger>
          <AccordionContent forceMount>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="two">
          <AccordionTrigger>Section 2</AccordionTrigger>
          <AccordionContent hiddenUntilFound>Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>,
    )
    const animationNames = () =>
      [...document.querySelectorAll<HTMLElement>('[data-slot="accordion-content"]')].map(
        (node) => node.style.animationName,
      )
    expect(animationNames()).toEqual(['none', 'none'])

    fireEvent.click(screen.getByText('Section 1'))

    expect(animationNames()).toEqual(['', 'none'])
  })

  it('drops a size variable once it measures nothing, so the stylesheet falls back to its own', () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="one">
          <AccordionTrigger>Section 1</AccordionTrigger>
          <AccordionContent forceMount>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>,
    )
    fireEvent.click(screen.getByText('Section 1'))

    rectSpy.mockReturnValue(new DOMRect(0, 0, 0, 0))
    fireEvent.click(screen.getByText('Section 1'))

    expect([
      content()?.style.getPropertyValue('--gentleduck-accordion-content-height'),
      content()?.style.getPropertyValue('--gentleduck-accordion-content-width'),
    ]).toEqual(['', ''])
  })
})

describe('Accordion multiple', () => {
  it('hands its ref to the root element', () => {
    const ref = React.createRef<HTMLDivElement>()

    renderAccordion({ type: 'multiple', ref })

    expect(ref.current?.getAttribute('data-slot')).toBe('accordion')
  })
})

describe('Accordion single value', () => {
  function Faq({ collapsible }: { collapsible: boolean }) {
    return (
      <Accordion type="single" defaultValue="one" collapsible={collapsible}>
        <AccordionItem value="one">
          <AccordionTrigger>Section 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>
    )
  }

  it('lets the open item close once collapsible is switched on', () => {
    const { rerender } = render(<Faq collapsible={false} />)
    rerender(<Faq collapsible />)

    fireEvent.click(screen.getByText('Section 1'))

    expect(screen.queryByText('Content 1')).toBeNull()
  })

  it('reads an empty value as no item open, even beside an item valued with the empty string', () => {
    render(
      <Accordion type="single">
        <AccordionItem value="">
          <AccordionTrigger>Section 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>,
    )

    expect(screen.getByText('Section 1').getAttribute('aria-expanded')).toBe('false')
  })
})

describe('Accordion keys and the page', () => {
  it('keeps the page from scrolling on an arrow key it moves focus with', () => {
    renderAccordion({ type: 'single' })
    const [first] = screen.getAllByRole('button')
    act(() => first.focus())

    expect([fireEvent.keyDown(first, { key: 'ArrowDown' }), document.activeElement?.textContent]).toEqual([
      false,
      'Section 2',
    ])
  })

  it('runs an onKeyDown given to the root first, and moves no focus once it prevents the default', () => {
    const onKeyDown = mock((event: React.KeyboardEvent) => event.preventDefault())
    renderAccordion({ type: 'single', onKeyDown })
    const [first] = screen.getAllByRole('button')
    act(() => first.focus())

    fireEvent.keyDown(first, { key: 'End' })

    expect([onKeyDown.mock.calls.length, document.activeElement?.textContent]).toEqual([1, 'Section 1'])
  })
})

describe('Accordion focus leaving the triggers', () => {
  it('reports null once focus moves from a trigger to a button in the content', () => {
    const onFocusChange = mock()
    render(
      <Accordion type="single" defaultValue="one" onFocusChange={onFocusChange}>
        <AccordionItem value="one">
          <AccordionTrigger>Section 1</AccordionTrigger>
          <AccordionContent>
            <button type="button">Inside</button>
          </AccordionContent>
        </AccordionItem>
      </Accordion>,
    )

    act(() => screen.getByText('Section 1').focus())
    act(() => screen.getByText('Inside').focus())

    expect(onFocusChange.mock.calls).toEqual([['one'], [null]])
  })

  it('reports null once focus moves to a trigger its root does not hold, such as one portalled out', () => {
    const onFocusChange = mock()
    render(
      <Accordion type="single" onFocusChange={onFocusChange}>
        <AccordionItem value="one">
          <AccordionTrigger>Section 1</AccordionTrigger>
        </AccordionItem>
        <AccordionItem value="two">
          {createPortal(<AccordionTrigger>Section 2</AccordionTrigger>, document.body)}
        </AccordionItem>
      </Accordion>,
    )

    act(() => screen.getByText('Section 1').focus())
    act(() => screen.getByText('Section 2').focus())

    expect(onFocusChange.mock.calls).toEqual([['one'], [null], ['two']])
  })
})

describe('Accordion.Trigger wiring', () => {
  it('points the trigger at its own content', () => {
    renderAccordion({ type: 'single', defaultValue: 'one' })
    const controls = screen.getByText('Section 1').getAttribute('aria-controls') ?? ''

    expect(document.getElementById(controls)?.textContent).toBe('Content 1')
  })

  it('disables a trigger given disabled, and keeps its item shut', () => {
    const onValueChange = mock()
    render(
      <Accordion type="single" onValueChange={onValueChange}>
        <AccordionItem value="one">
          <AccordionTrigger disabled>Section 1</AccordionTrigger>
        </AccordionItem>
        <AccordionItem value="two">
          <AccordionTrigger>Section 2</AccordionTrigger>
        </AccordionItem>
      </Accordion>,
    )
    const [shut, open] = screen.getAllByRole('button')

    fireEvent.click(shut)

    expect([
      shut.hasAttribute('disabled'),
      shut.getAttribute('data-disabled'),
      shut.getAttribute('aria-disabled'),
      onValueChange.mock.calls.length,
    ]).toEqual([true, '', 'true', 0])
    expect([open.hasAttribute('data-disabled'), open.hasAttribute('aria-disabled')]).toEqual([false, false])
  })

  it('leaves a form around it unsent when pressed', () => {
    const onSubmit = mock((event: React.FormEvent) => event.preventDefault())
    render(
      <form onSubmit={onSubmit}>
        <Accordion type="single">
          <AccordionItem value="one">
            <AccordionTrigger>Section 1</AccordionTrigger>
          </AccordionItem>
        </Accordion>
      </form>,
    )

    fireEvent.click(screen.getByText('Section 1'))

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('runs an onFocus and an onBlur given to a trigger', () => {
    const onFocus = mock()
    const onBlur = mock()
    render(
      <>
        <Accordion type="single">
          <AccordionItem value="one">
            <AccordionTrigger onFocus={onFocus} onBlur={onBlur}>
              Section 1
            </AccordionTrigger>
          </AccordionItem>
        </Accordion>
        <button type="button">Outside</button>
      </>,
    )

    act(() => screen.getByText('Section 1').focus())
    act(() => screen.getByText('Outside').focus())

    expect([onFocus.mock.calls.length, onBlur.mock.calls.length]).toEqual([1, 1])
  })

  it('lets a data-slot given to the root or a trigger win', () => {
    render(
      <Accordion type="single" data-slot="faq">
        <AccordionItem value="one">
          <AccordionTrigger data-slot="faq-question">Section 1</AccordionTrigger>
        </AccordionItem>
      </Accordion>,
    )

    expect([
      screen.getByText('Section 1').parentElement?.parentElement?.getAttribute('data-slot'),
      screen.getByText('Section 1').getAttribute('data-slot'),
    ]).toEqual(['faq', 'faq-question'])
  })
})

describe('Accordion orientation', () => {
  it('marks every part with its orientation', () => {
    render(
      <Accordion type="single" defaultValue="one" orientation="horizontal">
        <AccordionItem value="one">
          <AccordionHeader>
            <AccordionTrigger>
              Section 1<AccordionIndicator />
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>,
    )

    expect(
      [...document.querySelectorAll('[data-slot^="accordion"]')].map((node) => [
        node.getAttribute('data-slot'),
        node.getAttribute('data-orientation'),
      ]),
    ).toEqual([
      ['accordion', 'horizontal'],
      ['accordion-item', 'horizontal'],
      ['accordion-header', 'horizontal'],
      ['accordion-trigger', 'horizontal'],
      ['accordion-indicator', 'horizontal'],
      ['accordion-content', 'horizontal'],
    ])
  })
})

describe('Accordion scope', () => {
  it('hands its parts the scope it is given', () => {
    const useAccordionScope = createAccordionScope()
    function Scoped() {
      const scope = useAccordionScope(undefined)
      return (
        <Accordion {...scope} type="single" defaultValue="one">
          <AccordionItem {...scope} value="one">
            <AccordionHeader {...scope}>
              <AccordionTrigger {...scope}>
                Section 1<AccordionIndicator {...scope} />
              </AccordionTrigger>
            </AccordionHeader>
            <AccordionContent {...scope}>Content 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      )
    }

    render(<Scoped />)

    expect([...document.querySelectorAll('[data-state]')].map((node) => node.getAttribute('data-state'))).toEqual([
      'open',
      'open',
      'open',
      'open',
      'open',
    ])
  })
})

describe('Accordion find-in-page, again', () => {
  it('opens the item once for each find, with a close between', () => {
    const onOpenChange = mock((_open: boolean) => {})
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="shipping" onOpenChange={onOpenChange}>
          <AccordionTrigger>Shipping</AccordionTrigger>
          <AccordionContent hiddenUntilFound>Parcels leave within two days.</AccordionContent>
        </AccordionItem>
      </Accordion>,
    )
    const find = () => fireEvent(screen.getByText('Parcels leave within two days.'), new Event('beforematch'))

    find()
    fireEvent.click(screen.getByText('Shipping'))
    find()

    expect([
      onOpenChange.mock.calls.map(([open]) => open),
      screen.getByText('Shipping').getAttribute('aria-expanded'),
    ]).toEqual([[true, false, true], 'true'])
  })
})
