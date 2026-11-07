import { describe, expect, it, mock } from 'bun:test'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import { createPortal } from 'react-dom'
import { freshDom, wait } from '../../__tests__/dom'
import { DirectionProvider } from '../../direction'
import { HoverCard, HoverCardArrow, HoverCardContent, HoverCardPortal, HoverCardTrigger } from '../index'

freshDom()

function renderHoverCard(props: Record<string, unknown> = {}) {
  return render(
    <HoverCard openDelay={0} closeDelay={0} {...props}>
      <HoverCardTrigger href="#">Hover target</HoverCardTrigger>
      <HoverCardContent>Card content</HoverCardContent>
    </HoverCard>,
  )
}

describe('HoverCard', () => {
  it('renders trigger with data-slot="hover-card-trigger"', () => {
    const { container } = renderHoverCard()
    expect(container.querySelector('[data-slot="hover-card-trigger"]')).not.toBeNull()
  })

  it('trigger renders as an anchor element', () => {
    const { container } = renderHoverCard()
    expect(container.querySelector('a[data-slot="hover-card-trigger"]')).not.toBeNull()
  })

  it('trigger has data-state="closed" initially', () => {
    const { container } = renderHoverCard()
    const trigger = container.querySelector('[data-slot="hover-card-trigger"]')!
    expect(trigger.getAttribute('data-state')).toBe('closed')
  })

  it('respects controlled open prop', () => {
    const { container } = renderHoverCard({ open: true })
    const trigger = container.querySelector('[data-slot="hover-card-trigger"]')!
    expect(trigger.getAttribute('data-state')).toBe('open')
  })

  it('forwards ref to trigger', () => {
    const ref = React.createRef<HTMLAnchorElement>()
    render(
      <HoverCard>
        <HoverCardTrigger ref={ref} href="#">
          Link
        </HoverCardTrigger>
      </HoverCard>,
    )
    expect(ref.current).toBeInstanceOf(HTMLAnchorElement)
  })

  it('trigger has href attribute', () => {
    const { container } = renderHoverCard()
    expect(container.querySelector('[data-slot="hover-card-trigger"]')?.getAttribute('href')).toBe('#')
  })

  it('passes className to trigger', () => {
    const { container } = render(
      <HoverCard>
        <HoverCardTrigger href="#" className="hc-trigger">
          Link
        </HoverCardTrigger>
      </HoverCard>,
    )
    expect(container.querySelector('.hc-trigger')).not.toBeNull()
  })

  it('puts a dir given to the root on the content and leaves the trigger to the page', () => {
    renderHoverCard({ dir: 'rtl', open: true })

    expect(screen.getByText('Hover target').hasAttribute('dir')).toBe(false)
    expect(screen.getByText('Card content').getAttribute('dir')).toBe('rtl')
  })

  it('gives the content the direction of <html dir> when nothing else sets one', () => {
    document.documentElement.dir = 'rtl'
    try {
      renderHoverCard({ open: true })

      expect(screen.getByText('Card content').getAttribute('dir')).toBe('rtl')
    } finally {
      document.documentElement.dir = ''
    }
  })

  it('open=false shows data-state closed', () => {
    const { container } = renderHoverCard({ open: false })
    expect(container.querySelector('[data-slot="hover-card-trigger"]')?.getAttribute('data-state')).toBe('closed')
  })

  it('portaled content inherits dir from DirectionProvider', () => {
    const { baseElement, unmount } = render(
      <DirectionProvider dir="rtl">
        <HoverCard open>
          <HoverCardTrigger href="#">Hover target</HoverCardTrigger>
          <HoverCardPortal>
            <HoverCardContent data-testid="dir-content">Card content</HoverCardContent>
          </HoverCardPortal>
        </HoverCard>
      </DirectionProvider>,
    )
    expect(baseElement.querySelector('[data-testid="dir-content"]')?.getAttribute('dir')).toBe('rtl')
    unmount()
  })

  it('an explicit dir on content overrides the inherited one', () => {
    const { baseElement, unmount } = render(
      <HoverCard dir="rtl" open>
        <HoverCardTrigger href="#">Hover target</HoverCardTrigger>
        <HoverCardContent data-testid="dir-content" dir="ltr">
          Card content
        </HoverCardContent>
      </HoverCard>,
    )
    expect(baseElement.querySelector('[data-testid="dir-content"]')?.getAttribute('dir')).toBe('ltr')
    unmount()
  })
})

function renderOpenProfileCard() {
  render(
    <>
      <HoverCard defaultOpen closeDelay={0}>
        <HoverCardTrigger href="#">@duck</HoverCardTrigger>
        <HoverCardContent data-testid="card">
          <p>Quacks for a living</p>
          <a href="#profile">Profile</a>
        </HoverCardContent>
      </HoverCard>
      <button type="button">Outside</button>
    </>,
  )
  return { card: screen.getByTestId('card') }
}

const isOpen = () => screen.queryByTestId('card') !== null

function renderClosedCard(props: Record<string, unknown> = {}) {
  render(
    <HoverCard openDelay={0} closeDelay={0} {...props}>
      <HoverCardTrigger href="#">Hover target</HoverCardTrigger>
      <HoverCardContent data-testid="card">Card content</HoverCardContent>
    </HoverCard>,
  )
  return screen.getByText('Hover target')
}

describe('HoverCard delays', () => {
  it('opens 700ms after the pointer rests on the trigger, and closes 300ms after it leaves, by default', async () => {
    render(
      <HoverCard>
        <HoverCardTrigger href="#">Hover target</HoverCardTrigger>
        <HoverCardContent data-testid="card">Card content</HoverCardContent>
      </HoverCard>,
    )
    const trigger = screen.getByText('Hover target')

    fireEvent.pointerEnter(trigger, { pointerType: 'mouse' })
    await wait(600)
    const beforeOpenDelay = isOpen()
    await wait(150)
    const afterOpenDelay = isOpen()
    fireEvent.pointerLeave(trigger, { pointerType: 'mouse' })
    await wait(200)
    const beforeCloseDelay = isOpen()
    await wait(150)

    expect([beforeOpenDelay, afterOpenDelay, beforeCloseDelay, isOpen()]).toEqual([false, true, true, false])
  })

  it('stays open when the pointer comes back before the close delay ends', async () => {
    const trigger = renderClosedCard({ defaultOpen: true, closeDelay: 30 })

    fireEvent.pointerLeave(trigger, { pointerType: 'mouse' })
    await wait(10)
    fireEvent.pointerEnter(trigger, { pointerType: 'mouse' })
    await wait(40)

    expect(isOpen()).toBe(true)
  })

  it('drops a pending open when it unmounts', async () => {
    const onOpenChange = mock()
    const trigger = renderClosedCard({ open: false, openDelay: 20, onOpenChange })
    fireEvent.pointerEnter(trigger, { pointerType: 'mouse' })

    cleanup()
    await wait(40)

    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('drops a pending close when it unmounts', async () => {
    const onOpenChange = mock()
    const trigger = renderClosedCard({ open: true, closeDelay: 20, onOpenChange })
    fireEvent.pointerLeave(trigger, { pointerType: 'mouse' })

    cleanup()
    await wait(40)

    expect(onOpenChange).not.toHaveBeenCalled()
  })
})

describe('HoverCard disabled', () => {
  it('does not open on hover or focus while disabled', async () => {
    const onOpenChange = mock()
    const trigger = renderClosedCard({ disabled: true, onOpenChange })

    fireEvent.pointerEnter(trigger, { pointerType: 'mouse' })
    act(() => trigger.focus())
    await wait(10)

    expect(onOpenChange).not.toHaveBeenCalled()
    expect(isOpen()).toBe(false)
  })

  it('closes once it is disabled while open', () => {
    const onOpenChange = mock()
    const card = (disabled: boolean) => (
      <HoverCard defaultOpen onOpenChange={onOpenChange} disabled={disabled}>
        <HoverCardTrigger href="#">Hover target</HoverCardTrigger>
        <HoverCardContent data-testid="card">Card content</HoverCardContent>
      </HoverCard>
    )
    const { rerender } = render(card(false))

    rerender(card(true))

    expect(onOpenChange.mock.calls).toEqual([[false]])
    expect(isOpen()).toBe(false)
  })

  it('drops a pending open when it is disabled', async () => {
    const onOpenChange = mock()
    const card = (disabled: boolean) => (
      <HoverCard openDelay={20} onOpenChange={onOpenChange} disabled={disabled}>
        <HoverCardTrigger href="#">Hover target</HoverCardTrigger>
        <HoverCardContent data-testid="card">Card content</HoverCardContent>
      </HoverCard>
    )
    const { rerender } = render(card(false))
    fireEvent.pointerEnter(screen.getByText('Hover target'), { pointerType: 'mouse' })

    rerender(card(true))
    await wait(40)

    expect(onOpenChange).not.toHaveBeenCalled()
    expect(isOpen()).toBe(false)
  })
})

describe('HoverCard focus and touch', () => {
  it('opens when the trigger takes keyboard focus', async () => {
    const trigger = renderClosedCard()

    act(() => trigger.focus())
    await wait(10)

    expect(isOpen()).toBe(true)
  })

  it('closes when the trigger loses focus', async () => {
    const trigger = renderClosedCard({ defaultOpen: true })

    act(() => trigger.focus())
    act(() => trigger.blur())
    await wait(10)

    expect(isOpen()).toBe(false)
  })

  it('opens when a mouse press focuses the trigger', async () => {
    const trigger = renderClosedCard()

    fireEvent.pointerDown(trigger, { pointerType: 'mouse' })
    act(() => trigger.focus())
    await wait(10)

    expect(isOpen()).toBe(true)
  })

  it('does not open for the focus a touch gives the trigger', async () => {
    const trigger = renderClosedCard()

    fireEvent.pointerDown(trigger, { pointerType: 'touch' })
    act(() => trigger.focus())
    await wait(10)

    expect(isOpen()).toBe(false)
  })

  it('opens for the next keyboard focus after a touch', async () => {
    const trigger = renderClosedCard()
    fireEvent.pointerDown(trigger, { pointerType: 'touch' })
    act(() => trigger.focus())
    act(() => trigger.blur())

    act(() => trigger.focus())
    await wait(10)

    expect(isOpen()).toBe(true)
  })

  it('opens for keyboard focus after a touch that scrolled the page instead', async () => {
    const trigger = renderClosedCard()
    fireEvent.pointerDown(trigger, { pointerType: 'touch' })
    fireEvent.pointerCancel(trigger, { pointerType: 'touch' })

    act(() => trigger.focus())
    await wait(10)

    expect(isOpen()).toBe(true)
  })

  it('ignores a touch pointer entering the trigger or leaving the card', async () => {
    const trigger = renderClosedCard()

    fireEvent.pointerEnter(trigger, { pointerType: 'touch' })
    await wait(10)
    const afterTouchEnter = isOpen()
    fireEvent.pointerEnter(trigger, { pointerType: 'mouse' })
    await wait(10)
    fireEvent.pointerLeave(screen.getByTestId('card'), { pointerType: 'touch' })
    fireEvent.pointerLeave(trigger, { pointerType: 'touch' })
    await wait(10)

    expect([afterTouchEnter, isOpen()]).toEqual([false, true])
  })

  it('calls its own pointer enter and focus handlers first, and opens for neither when they prevent the default', async () => {
    const calls: string[] = []
    render(
      <HoverCard closeDelay={0} openDelay={0}>
        <HoverCardTrigger
          href="#"
          onFocus={(event) => {
            calls.push('focus')
            event.preventDefault()
          }}
          onPointerEnter={(event) => {
            calls.push('pointerenter')
            event.preventDefault()
          }}>
          Hover target
        </HoverCardTrigger>
        <HoverCardContent data-testid="card">Card content</HoverCardContent>
      </HoverCard>,
    )
    const trigger = screen.getByText('Hover target')

    fireEvent.pointerEnter(trigger, { pointerType: 'mouse' })
    act(() => trigger.focus())
    await wait(10)

    expect([calls, isOpen()]).toEqual([['pointerenter', 'focus'], false])
  })

  it('leaves a touch start to the browser, so a page still scrolls from the trigger', () => {
    const trigger = renderClosedCard()

    expect(fireEvent.touchStart(trigger)).toBe(true)
  })
})

describe('HoverCard content', () => {
  it("names the popper's measurements under the hover card's own variables, beside the style it was given", () => {
    render(
      <HoverCard open>
        <HoverCardTrigger href="#">Hover target</HoverCardTrigger>
        <HoverCardContent data-testid="card" style={{ color: 'teal' }}>
          Card content
        </HoverCardContent>
      </HoverCard>,
    )

    const { style } = screen.getByTestId('card')
    expect(style.color).toBe('teal')
    expect(
      [
        '--gentleduck-hover-card-content-transform-origin',
        '--gentleduck-hover-card-content-available-width',
        '--gentleduck-hover-card-content-available-height',
        '--gentleduck-hover-card-trigger-width',
        '--gentleduck-hover-card-trigger-height',
      ].map((name) => style.getPropertyValue(name)),
    ).toEqual([
      'var(--gentleduck-popper-transform-origin)',
      'var(--gentleduck-popper-available-width)',
      'var(--gentleduck-popper-available-height)',
      'var(--gentleduck-popper-anchor-width)',
      'var(--gentleduck-popper-anchor-height)',
    ])
  })

  it('takes what is tabbable in it out of the tab order, and nothing else', () => {
    renderOpenProfileCard()

    expect(screen.getByText('Profile').getAttribute('tabindex')).toBe('-1')
    expect(screen.getByText('Quacks for a living').hasAttribute('tabindex')).toBe(false)
  })

  it('takes what is added to it after it opens out of the tab order too', async () => {
    function More() {
      const [shown, setShown] = React.useState(false)
      return shown ? (
        <a href="#more">More</a>
      ) : (
        <button onClick={() => setShown(true)} type="button">
          Show more
        </button>
      )
    }
    render(
      <HoverCard defaultOpen>
        <HoverCardTrigger href="#">@duck</HoverCardTrigger>
        <HoverCardContent>
          <More />
        </HoverCardContent>
      </HoverCard>,
    )

    fireEvent.click(screen.getByText('Show more'))
    await wait(0)

    expect(screen.getByText('More').getAttribute('tabindex')).toBe('-1')
  })

  it('takes an element back out of the tab order when it is given a tab index after it opens', async () => {
    function Toggle() {
      const [tabbable, setTabbable] = React.useState(false)
      return (
        <button onClick={() => setTabbable(true)} tabIndex={tabbable ? 0 : undefined} type="button">
          Toggle
        </button>
      )
    }
    render(
      <HoverCard defaultOpen>
        <HoverCardTrigger href="#">@duck</HoverCardTrigger>
        <HoverCardContent>
          <Toggle />
        </HoverCardContent>
      </HoverCard>,
    )

    fireEvent.click(screen.getByText('Toggle'))
    await wait(0)

    expect(screen.getByText('Toggle').getAttribute('tabindex')).toBe('-1')
  })

  it('leaves the page under it taking the pointer while it is open', () => {
    renderOpenProfileCard()

    expect(document.body.style.pointerEvents).toBe('')
  })

  it('calls its own pointer down and Escape handlers first, and does neither part when they prevent the default', async () => {
    const calls: string[] = []
    render(
      <HoverCard defaultOpen>
        <HoverCardTrigger href="#">@duck</HoverCardTrigger>
        <HoverCardContent
          data-testid="card"
          onEscapeKeyDown={(event) => {
            calls.push('escape')
            event.preventDefault()
          }}
          onPointerDown={(event) => {
            calls.push('pointerdown')
            event.preventDefault()
          }}>
          <p>Quacks for a living</p>
        </HoverCardContent>
      </HoverCard>,
    )
    await wait(0)
    document.body.style.userSelect = 'auto'

    fireEvent.pointerDown(screen.getByText('Quacks for a living'))
    const userSelect = document.body.style.userSelect
    fireEvent.keyDown(document.body, { key: 'Escape' })

    expect([calls, userSelect, isOpen()]).toEqual([['pointerdown', 'escape'], 'auto', true])
    document.body.style.userSelect = ''
  })

  it('marks its arrow with data-slot="hover-card-arrow"', () => {
    render(
      <HoverCard defaultOpen>
        <HoverCardTrigger href="#">@duck</HoverCardTrigger>
        <HoverCardContent>
          <HoverCardArrow />
        </HoverCardContent>
      </HoverCard>,
    )

    expect(document.querySelector('[data-slot="hover-card-arrow"]')).not.toBeNull()
  })

  it('stays open when focus moves outside it', () => {
    renderOpenProfileCard()

    act(() => screen.getByText('Outside').focus())

    expect(isOpen()).toBe(true)
  })
})

describe('HoverCard text selection', () => {
  it('confines text selection to the card while the pointer is down on it', () => {
    const { card } = renderOpenProfileCard()
    document.body.style.userSelect = 'auto'

    fireEvent.pointerDown(screen.getByText('Quacks for a living'))
    expect([document.body.style.userSelect, card.style.userSelect]).toEqual(['none', 'text'])

    fireEvent.pointerUp(document)
    expect([document.body.style.userSelect, card.style.userSelect]).toEqual(['auto', ''])
    document.body.style.userSelect = ''
  })

  it('stays open while the pointer that pressed on it is down', async () => {
    const { card } = renderOpenProfileCard()

    fireEvent.pointerDown(card)
    fireEvent.pointerLeave(card, { pointerType: 'mouse' })
    await wait(10)

    expect(isOpen()).toBe(true)
  })

  it('stays open after the pointer leaves once text inside it is selected', async () => {
    const { card } = renderOpenProfileCard()

    fireEvent.pointerDown(card)
    document.getSelection()?.selectAllChildren(screen.getByText('Quacks for a living'))
    fireEvent.pointerUp(document)
    await wait(0)
    fireEvent.pointerLeave(card, { pointerType: 'mouse' })
    await wait(10)

    expect(isOpen()).toBe(true)
    document.getSelection()?.removeAllRanges()
  })

  it('stays open when the pointer leaves as soon as a press that selected text ends', async () => {
    const { card } = renderOpenProfileCard()

    fireEvent.pointerDown(card)
    document.getSelection()?.selectAllChildren(screen.getByText('Quacks for a living'))
    fireEvent.pointerUp(document)
    fireEvent.pointerLeave(card, { pointerType: 'mouse' })
    await wait(10)

    expect(isOpen()).toBe(true)
    document.getSelection()?.removeAllRanges()
  })

  it('gives the page its text selection back, and closes as the pointer leaves, after a press the browser cancels', async () => {
    const { card } = renderOpenProfileCard()
    document.body.style.userSelect = 'auto'

    fireEvent.pointerDown(screen.getByText('Quacks for a living'))
    fireEvent.pointerCancel(document)
    const userSelect = document.body.style.userSelect
    fireEvent.pointerLeave(card, { pointerType: 'mouse' })
    await wait(10)

    expect([userSelect, isOpen()]).toEqual(['auto', false])
    document.body.style.userSelect = ''
  })

  it('closes as the pointer leaves after a press that clears the text selected in it', async () => {
    const { card } = renderOpenProfileCard()
    fireEvent.pointerDown(card)
    document.getSelection()?.selectAllChildren(screen.getByText('Quacks for a living'))
    fireEvent.pointerUp(document)
    await wait(0)

    document.getSelection()?.removeAllRanges()
    fireEvent.pointerDown(card)
    fireEvent.pointerUp(document)
    await wait(0)
    fireEvent.pointerLeave(card, { pointerType: 'mouse' })
    await wait(10)

    expect(isOpen()).toBe(false)
  })

  it('closes when the pointer leaves after a press that selected nothing', async () => {
    const { card } = renderOpenProfileCard()

    fireEvent.pointerDown(card)
    fireEvent.pointerUp(document)
    await wait(0)
    fireEvent.pointerLeave(card, { pointerType: 'mouse' })
    await wait(10)

    expect(isOpen()).toBe(false)
  })
})

describe('HoverCard opened again', () => {
  function renderCard() {
    render(
      <HoverCard closeDelay={0} defaultOpen openDelay={0}>
        <HoverCardTrigger href="#">@duck</HoverCardTrigger>
        <HoverCardContent data-testid="card">
          <p>Quacks for a living</p>
        </HoverCardContent>
      </HoverCard>,
    )
    return { card: screen.getByTestId('card'), trigger: screen.getByText('@duck') }
  }

  async function reopenAndLeave(trigger: HTMLElement) {
    fireEvent.pointerEnter(trigger, { pointerType: 'mouse' })
    await wait(10)
    const reopened = isOpen()
    fireEvent.pointerLeave(trigger, { pointerType: 'mouse' })
    await wait(10)
    return [reopened, isOpen()]
  }

  it('closes as the pointer leaves, after it closed while the pointer was down on it', async () => {
    const { card, trigger } = renderCard()

    fireEvent.pointerDown(card)
    fireEvent.keyDown(document.body, { key: 'Escape' })
    fireEvent.pointerUp(document)

    expect(await reopenAndLeave(trigger)).toEqual([true, false])
  })

  it('closes as the pointer leaves, after it closed with text in it selected', async () => {
    const { card, trigger } = renderCard()

    fireEvent.pointerDown(card)
    document.getSelection()?.selectAllChildren(screen.getByText('Quacks for a living'))
    fireEvent.pointerUp(document)
    await wait(0)
    fireEvent.keyDown(document.body, { key: 'Escape' })
    document.getSelection()?.removeAllRanges()

    expect(await reopenAndLeave(trigger)).toEqual([true, false])
  })
})

describe('HoverCard text selection beyond the card element', () => {
  it('gives the page its text selection back after a press on content it holds no element of', () => {
    function NoRef({ ref: _ref, ...props }: React.ComponentProps<'div'>) {
      return <div {...props} />
    }
    render(
      <HoverCard defaultOpen>
        <HoverCardTrigger href="#">@duck</HoverCardTrigger>
        <HoverCardContent asChild>
          <NoRef>Quacks for a living</NoRef>
        </HoverCardContent>
      </HoverCard>,
    )
    document.body.style.userSelect = 'auto'

    fireEvent.pointerDown(screen.getByText('Quacks for a living'))
    const whilePressed = document.body.style.userSelect
    fireEvent.pointerUp(document)

    expect([whilePressed, document.body.style.userSelect]).toEqual(['none', 'auto'])
    document.body.style.userSelect = ''
  })

  it('leaves the page selectable for a press in a portal opened from inside the card', () => {
    render(
      <HoverCard defaultOpen>
        <HoverCardTrigger href="#">@duck</HoverCardTrigger>
        <HoverCardContent data-testid="card">
          {createPortal(<button type="button">Portaled</button>, document.body)}
        </HoverCardContent>
      </HoverCard>,
    )
    document.body.style.userSelect = 'auto'

    fireEvent.pointerDown(screen.getByText('Portaled'))

    expect([document.body.style.userSelect, screen.getByTestId('card').style.userSelect, isOpen()]).toEqual([
      'auto',
      '',
      true,
    ])
    document.body.style.userSelect = ''
  })
})

describe('HoverCard in an iframe', () => {
  function inFrame() {
    const frame = document.createElement('iframe')
    document.body.append(frame)
    const frameDocument = frame.contentDocument as Document
    const container = frameDocument.body.appendChild(frameDocument.createElement('div'))
    const { unmount } = render(
      <HoverCard closeDelay={0} defaultOpen>
        <HoverCardTrigger href="#">@duck</HoverCardTrigger>
        <HoverCardPortal container={frameDocument.body}>
          <HoverCardContent data-testid="card">
            <p>Quacks for a living</p>
          </HoverCardContent>
        </HoverCardPortal>
      </HoverCard>,
      { container },
    )
    const card = frameDocument.querySelector('[data-testid="card"]') as HTMLElement
    const text = frameDocument.querySelector('p') as HTMLElement
    const isOpen = () => frameDocument.querySelector('[data-testid="card"]') !== null
    return { card, frame, frameDocument, isOpen, text, unmount }
  }

  it("keeps a press on it from making the frame's page unselectable, and leaves the page outside the frame alone", () => {
    const { frame, frameDocument, text, unmount } = inFrame()
    document.body.style.userSelect = 'auto'
    frameDocument.body.style.userSelect = 'auto'

    fireEvent.pointerDown(text)
    const pressed = [document.body.style.userSelect, frameDocument.body.style.userSelect]
    fireEvent.pointerUp(frameDocument)

    expect([pressed, [document.body.style.userSelect, frameDocument.body.style.userSelect]]).toEqual([
      ['auto', 'none'],
      ['auto', 'auto'],
    ])
    document.body.style.userSelect = ''
    unmount()
    frame.remove()
  })

  it('closes as the pointer leaves after a press on it ends in the frame', async () => {
    const { card, frame, frameDocument, isOpen, text, unmount } = inFrame()

    fireEvent.pointerDown(text)
    fireEvent.pointerUp(frameDocument)
    await wait(0)
    fireEvent.pointerLeave(card, { pointerType: 'mouse' })
    await wait(10)

    expect(isOpen()).toBe(false)
    unmount()
    frame.remove()
  })

  it("stays open after the pointer leaves once text inside it is selected in the frame's document", async () => {
    const { card, frame, frameDocument, isOpen, text, unmount } = inFrame()

    fireEvent.pointerDown(text)
    frameDocument.getSelection()?.selectAllChildren(text)
    fireEvent.pointerUp(frameDocument)
    await wait(0)
    fireEvent.pointerLeave(card, { pointerType: 'mouse' })
    await wait(10)

    expect(isOpen()).toBe(true)
    unmount()
    frame.remove()
  })
})

describe('HoverCard dismissing', () => {
  it('closes on Escape', async () => {
    renderOpenProfileCard()
    await wait(0)

    fireEvent.keyDown(document.body, { key: 'Escape' })

    expect(isOpen()).toBe(false)
  })
})
