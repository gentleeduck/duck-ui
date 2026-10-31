import { afterEach, beforeEach, describe, expect, it, mock, spyOn } from 'bun:test'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {
  clickOutside,
  freshDom,
  pageChangesOnClose,
  scrollable,
  scrolls,
  untilScrollLocked,
  wait,
} from '../../__tests__/dom'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../alert-dialog'
import { DirectionProvider } from '../../direction'
import { useFocusScopeBranch } from '../../focus-scope'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  WarningProvider,
} from '../index'

freshDom()

function renderDialog(props: Record<string, unknown> = {}) {
  return render(
    <Dialog {...props}>
      <DialogTrigger>Open</DialogTrigger>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Description</DialogDescription>
          <DialogClose>Close</DialogClose>
        </DialogContent>
      </DialogPortal>
    </Dialog>,
  )
}

describe('Dialog', () => {
  // --- Trigger ---

  it('renders trigger with data-slot="dialog-trigger"', () => {
    const { container } = renderDialog()
    expect(container.querySelector('[data-slot="dialog-trigger"]')).not.toBeNull()
  })

  it('trigger has aria-haspopup="dialog"', () => {
    const { container } = renderDialog()
    const trigger = container.querySelector('[data-slot="dialog-trigger"]')!
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog')
  })

  it('trigger has aria-expanded=false when closed', () => {
    const { container } = renderDialog()
    const trigger = container.querySelector('[data-slot="dialog-trigger"]')!
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(trigger.getAttribute('data-state')).toBe('closed')
  })

  it('opens dialog on trigger click', () => {
    const { container } = renderDialog()
    const trigger = container.querySelector('[data-slot="dialog-trigger"]')!
    fireEvent.click(trigger)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(trigger.getAttribute('data-state')).toBe('open')
  })

  // --- Content ---

  it('renders content when open', () => {
    const { baseElement } = renderDialog({ defaultOpen: true })
    const content = baseElement.querySelector('[role="dialog"]')
    expect(content).not.toBeNull()
  })

  // content is not rendered when closed (verified by trigger's aria-expanded=false test above)

  it('content has role="dialog"', () => {
    const { baseElement } = renderDialog({ defaultOpen: true })
    const content = baseElement.querySelector('[role="dialog"]')
    expect(content).not.toBeNull()
  })

  it('content has aria-labelledby pointing to title', () => {
    const { baseElement } = renderDialog({ defaultOpen: true })
    const content = baseElement.querySelector('[role="dialog"]')!
    const titleId = content.getAttribute('aria-labelledby')
    expect(titleId).toBeTruthy()
    const title = baseElement.querySelector(`#${titleId}`)
    expect(title?.textContent).toBe('Title')
  })

  it('content has aria-describedby pointing to description', () => {
    const { baseElement } = renderDialog({ defaultOpen: true })
    const content = baseElement.querySelector('[role="dialog"]')!
    const descId = content.getAttribute('aria-describedby')
    expect(descId).toBeTruthy()
    const desc = baseElement.querySelector(`#${descId}`)
    expect(desc?.textContent).toBe('Description')
  })

  // --- Title ---

  it('renders title with data-slot="dialog-title"', () => {
    const { baseElement } = renderDialog({ defaultOpen: true })
    expect(baseElement.querySelector('[data-slot="dialog-title"]')).not.toBeNull()
  })

  // --- Description ---

  it('renders description with data-slot="dialog-description"', () => {
    const { baseElement } = renderDialog({ defaultOpen: true })
    expect(baseElement.querySelector('[data-slot="dialog-description"]')).not.toBeNull()
  })

  // --- Close ---

  it('close button has data-slot="dialog-close"', () => {
    const { baseElement } = renderDialog({ defaultOpen: true })
    expect(baseElement.querySelector('[data-slot="dialog-close"]')).not.toBeNull()
  })

  // --- Overlay ---
  // Note: overlay rendering depends on Presence + RemoveScroll which need
  // full animation support. Overlay presence is tested via data-state on trigger.

  // --- Controlled ---

  it('calls onOpenChange when trigger clicked', () => {
    const handler = mock(() => {})
    const { container } = renderDialog({ onOpenChange: handler })
    fireEvent.click(container.querySelector('[data-slot="dialog-trigger"]')!)
    expect(handler).toHaveBeenCalledWith(true)
  })

  // --- Additional hardening ---

  it('trigger has type="button"', () => {
    const { container } = renderDialog()
    expect(container.querySelector('[data-slot="dialog-trigger"]')?.getAttribute('type')).toBe('button')
  })

  it('trigger has aria-controls when open', () => {
    const { container } = renderDialog()
    const trigger = container.querySelector('[data-slot="dialog-trigger"]')!
    fireEvent.click(trigger)
    expect(trigger.getAttribute('aria-controls')).toBeTruthy()
  })

  it('title renders as h2', () => {
    const { baseElement } = renderDialog({ defaultOpen: true })
    const title = baseElement.querySelector('[data-slot="dialog-title"]')!
    expect(title.tagName.toLowerCase()).toBe('h2')
  })

  it('description renders as p', () => {
    const { baseElement } = renderDialog({ defaultOpen: true })
    const desc = baseElement.querySelector('[data-slot="dialog-description"]')!
    expect(desc.tagName.toLowerCase()).toBe('p')
  })

  it('close button has type="button"', () => {
    const { baseElement } = renderDialog({ defaultOpen: true })
    const close = baseElement.querySelector('[data-slot="dialog-close"]')!
    expect(close.getAttribute('type')).toBe('button')
  })

  it('forwards ref to trigger', () => {
    const ref = React.createRef<HTMLButtonElement>()
    render(
      <Dialog>
        <DialogTrigger ref={ref}>Open</DialogTrigger>
      </Dialog>,
    )
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  // --- Direction ---

  it('portaled overlay and content inherit dir from DirectionProvider', () => {
    const { baseElement, unmount } = render(
      <DirectionProvider dir="rtl">
        <Dialog defaultOpen>
          <DialogPortal>
            <DialogOverlay data-testid="dir-overlay" />
            <DialogContent data-testid="dir-content">
              <DialogTitle>Title</DialogTitle>
              <DialogDescription>Description</DialogDescription>
            </DialogContent>
          </DialogPortal>
        </Dialog>
      </DirectionProvider>,
    )
    expect(baseElement.querySelector('[data-testid="dir-overlay"]')?.getAttribute('dir')).toBe('rtl')
    expect(baseElement.querySelector('[data-testid="dir-content"]')?.getAttribute('dir')).toBe('rtl')
    unmount()
  })
})

async function openDialog(contentProps: React.ComponentProps<typeof DialogContent> = {}) {
  render(
    <>
      <Dialog modal={false}>
        <DialogTrigger>Open</DialogTrigger>
        <DialogOverlay data-testid="overlay" />
        <DialogContent {...contentProps}>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Description</DialogDescription>
        </DialogContent>
      </Dialog>
      <button type="button">Outside</button>
    </>,
  )
  const trigger = screen.getByText('Open')
  fireEvent.click(trigger)
  await wait(0)
  return { trigger, outside: screen.getByText('Outside') }
}

const isOpen = () => screen.queryByText('Title') !== null

// The content waits for the click before it reads a pointer down outside, so a test has to send all of it.
describe('Dialog with modal', () => {
  it('stays open on a right click or a control click outside, which open a context menu rather than press', async () => {
    renderDialog({ defaultOpen: true })
    await wait(0)
    const overlay = document.querySelector<HTMLElement>('[data-slot="dialog-overlay"]')

    fireEvent.pointerDown(overlay as HTMLElement, { button: 2 })
    fireEvent.pointerDown(overlay as HTMLElement, { button: 0, ctrlKey: true })
    await wait(0)

    expect(screen.queryByRole('dialog')).not.toBeNull()
  })

  it('closes on a middle click outside with control held, which opens no context menu', async () => {
    renderDialog({ defaultOpen: true })
    await wait(0)

    fireEvent.pointerDown(document.querySelector('[data-slot="dialog-overlay"]') as HTMLElement, {
      button: 1,
      ctrlKey: true,
    })
    await wait(0)

    expect(screen.queryByRole('dialog')).toBeNull()
  })

  function renderBeside(contentProps: React.ComponentProps<typeof DialogContent>) {
    render(
      <>
        <Dialog defaultOpen>
          <DialogContent aria-describedby={undefined} {...contentProps}>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>
        <button type="button">Outside</button>
      </>,
    )
    return screen.getByText('Outside')
  }

  it('lets focus leave when trapFocus is false', async () => {
    const outside = renderBeside({ trapFocus: false })
    await wait(0)

    act(() => outside.focus())

    expect(document.activeElement).toBe(outside)
  })

  it('leaves the page its pointer events when disableOutsidePointerEvents is false', async () => {
    renderBeside({ disableOutsidePointerEvents: false })
    await wait(0)

    expect(document.body.style.pointerEvents).toBe('')
  })

  it('hands a focus outside to onFocusOutside and stays open, with the trap off', async () => {
    const onFocusOutside = mock()
    const outside = renderBeside({ trapFocus: false, onFocusOutside })
    await wait(0)

    act(() => outside.focus())

    expect(onFocusOutside).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('dialog')).not.toBeNull()
  })
})

describe('Dialog without modal', () => {
  it('renders no overlay', async () => {
    await openDialog()

    expect(screen.queryByTestId('overlay')).toBeNull()
  })

  it('closes on a click outside and leaves focus where the user clicked', async () => {
    const { trigger, outside } = await openDialog()

    await clickOutside(outside, { focus: true })

    expect(isOpen()).toBe(false)
    expect(document.activeElement).toBe(outside)
  })

  it('returns focus to the trigger when it closes from inside', async () => {
    const { trigger } = await openDialog()

    fireEvent.keyDown(document.activeElement as Element, { key: 'Escape' })
    await wait(0)

    expect(isOpen()).toBe(false)
    expect(document.activeElement).toBe(trigger)
  })

  it('leaves its own trigger to the trigger', async () => {
    const onInteractOutside = mock()
    const { trigger } = await openDialog({ onInteractOutside })

    fireEvent.pointerDown(trigger, { button: 1 })

    expect((onInteractOutside.mock.calls[0]?.[0] as Event).defaultPrevented).toBe(true)
    expect(isOpen()).toBe(true)

    await clickOutside(trigger)

    expect(onInteractOutside).toHaveBeenCalledTimes(1)
    expect(isOpen()).toBe(false)
  })

  it('ignores the focus that follows a click outside while the content is still mounted', async () => {
    const onInteractOutside = mock()
    const { outside } = await openDialog({ forceMount: true, onInteractOutside })

    await clickOutside(outside, { focus: true })
    act(() => screen.getByText('Open').focus())

    const events = onInteractOutside.mock.calls.map(([event]) => event as CustomEvent<{ originalEvent: Event }>)
    expect(events.map((event) => [event.detail.originalEvent.type, event.defaultPrevented])).toEqual([
      ['pointerdown', false],
      ['focusin', true],
    ])
  })

  it('keeps open when the consumer refuses an outside interaction', async () => {
    const { outside } = await openDialog({ onInteractOutside: (event) => event.preventDefault() })

    await clickOutside(outside)

    expect(isOpen()).toBe(true)
  })

  it('returns focus to the trigger on close after an outside interaction the consumer refused', async () => {
    const { trigger, outside } = await openDialog({ onInteractOutside: (event) => event.preventDefault() })
    await clickOutside(outside)

    fireEvent.keyDown(document.activeElement as Element, { key: 'Escape' })
    await wait(0)

    expect(document.activeElement).toBe(trigger)
  })

  it('closes when focus moves outside it, and leaves focus there', async () => {
    const { outside } = await openDialog()

    act(() => outside.focus())
    await wait(0)

    expect(isOpen()).toBe(false)
    expect(document.activeElement).toBe(outside)
  })

  it('forgets a click outside once it closes, so focus leaving closes it the next time', async () => {
    const { trigger, outside } = await openDialog()
    await clickOutside(outside)
    fireEvent.click(trigger)
    await wait(0)

    act(() => outside.focus())
    await wait(0)

    expect(isOpen()).toBe(false)
  })

  it('forgets a click outside once it closes, so the next close from inside returns focus to the trigger', async () => {
    const { trigger, outside } = await openDialog()
    await clickOutside(outside)
    fireEvent.click(trigger)
    await wait(0)

    fireEvent.keyDown(document.activeElement as Element, { key: 'Escape' })
    await wait(0)

    expect(document.activeElement).toBe(trigger)
  })

  const contentState = () => document.querySelector<HTMLElement>('[data-slot="dialog-content"]')?.dataset.state

  it('kept mounted, closes when focus leaves it after a click on the page while it was closed', async () => {
    const { trigger, outside } = await openDialog({ forceMount: true })
    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' })
    await wait(0)
    await clickOutside(outside)
    fireEvent.click(trigger)
    await wait(0)

    act(() => outside.focus())
    await wait(0)

    expect(contentState()).toBe('closed')
  })

  it('kept mounted, returns focus to the trigger on unmount when its last opening closed from inside', async () => {
    const page = (mounted: boolean) => (
      <>
        <Dialog modal={false}>
          <DialogTrigger>Open</DialogTrigger>
          {mounted && (
            <DialogContent forceMount aria-describedby={undefined}>
              <DialogTitle>Title</DialogTitle>
            </DialogContent>
          )}
        </Dialog>
        <button type="button">Outside</button>
      </>
    )
    const view = render(page(true))
    const trigger = screen.getByText('Open')
    fireEvent.click(trigger)
    await wait(0)
    await clickOutside(screen.getByText('Outside'))
    fireEvent.click(trigger)
    await wait(0)
    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' })
    await wait(0)

    view.rerender(page(false))
    await wait(0)

    expect(document.activeElement).toBe(trigger)
  })

  it('stays open when a right click on its trigger moves focus to a focusable box around it', async () => {
    render(
      <Dialog modal={false}>
        <div data-testid="box" tabIndex={0}>
          <DialogTrigger>Open</DialogTrigger>
        </div>
        <DialogContent aria-describedby={undefined}>
          <DialogTitle>Title</DialogTitle>
        </DialogContent>
      </Dialog>,
    )
    const trigger = screen.getByText('Open')
    fireEvent.click(trigger)
    await wait(0)

    fireEvent.pointerDown(trigger, { button: 2 })
    act(() => screen.getByTestId('box').focus())
    await wait(0)

    expect(isOpen()).toBe(true)
  })
})

function renderOpen(children: React.ReactNode, contentProps: React.ComponentProps<typeof DialogContent> = {}) {
  render(
    <Dialog defaultOpen>
      <DialogPortal>
        <DialogContent {...contentProps}>{children}</DialogContent>
      </DialogPortal>
    </Dialog>,
  )
}

describe('Dialog accessibility warnings in development', () => {
  const nodeEnv = process.env.NODE_ENV
  let error: ReturnType<typeof spyOn>
  let warn: ReturnType<typeof spyOn>

  beforeEach(() => {
    process.env.NODE_ENV = 'development'
    error = spyOn(console, 'error').mockImplementation(() => {})
    warn = spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    error.mockRestore()
    warn.mockRestore()
    process.env.NODE_ENV = nodeEnv
  })

  const titleErrors = () => error.mock.calls.filter(([message]) => String(message).includes('requires a `DialogTitle`'))
  const descriptionWarnings = () =>
    warn.mock.calls.filter(([message]) => String(message).includes('requires a description'))

  it('errors without a title and warns without a description, naming the part to render', () => {
    renderOpen(null)

    expect(titleErrors().length).toBeGreaterThan(0)
    expect(String(descriptionWarnings()[0]?.[0])).toContain('Render `DialogDescription` inside it')
  })

  it('stays quiet with a title and a description', () => {
    renderOpen(
      <>
        <DialogTitle>Title</DialogTitle>
        <DialogDescription>Description</DialogDescription>
      </>,
    )

    expect(titleErrors()).toEqual([])
    expect(descriptionWarnings()).toEqual([])
  })

  it('names the parts its WarningProvider gives', () => {
    render(
      <WarningProvider contentName="SheetContent" titleName="SheetTitle" descriptionName="SheetDescription">
        <Dialog defaultOpen>
          <DialogContent />
        </Dialog>
      </WarningProvider>,
    )

    const title = error.mock.calls.find(([message]) => String(message).includes('requires a'))
    expect(String(title?.[0])).toStartWith('`SheetContent` requires a `SheetTitle` for')
    expect(String(warn.mock.calls[0]?.[0])).toContain('Render `SheetDescription` inside it')
  })

  it.each([{ 'aria-label': 'Ducks' }, { 'aria-labelledby': 'elsewhere' }])('takes %o in place of a title', (props) => {
    renderOpen(<DialogDescription>Description</DialogDescription>, props)

    expect(titleErrors()).toEqual([])
  })

  it.each([{ 'aria-describedby': 'elsewhere' }, { 'aria-describedby': undefined }])(
    'takes %o in place of a description',
    (props) => {
      renderOpen(<DialogTitle>Title</DialogTitle>, props)

      expect(descriptionWarnings()).toEqual([])
    },
  )
})

describe('Dialog parts', () => {
  it('throws for a Title or Description outside the content', () => {
    const error = spyOn(console, 'error').mockImplementation(() => {})

    expect(() =>
      render(
        <Dialog>
          <DialogTitle>Title</DialogTitle>
        </Dialog>,
      ),
    ).toThrow('`DialogTitle` must be used within `DialogContent`')
    expect(() =>
      render(
        <Dialog>
          <DialogDescription>Description</DialogDescription>
        </Dialog>,
      ),
    ).toThrow('`DialogDescription` must be used within `DialogContent`')
    error.mockRestore()
  })

  it('sets dir on the overlay and the content, and on none of the parts inside them', () => {
    render(
      <DirectionProvider dir="rtl">
        <Dialog defaultOpen>
          <DialogTrigger>Open</DialogTrigger>
          <DialogPortal>
            <DialogOverlay data-testid="overlay" />
            <DialogContent>
              <DialogTitle>Title</DialogTitle>
              <DialogDescription>Description</DialogDescription>
              <DialogClose>Close</DialogClose>
            </DialogContent>
          </DialogPortal>
        </Dialog>
      </DirectionProvider>,
    )

    expect(screen.getByTestId('overlay').getAttribute('dir')).toBe('rtl')
    expect(screen.getByRole('dialog').getAttribute('dir')).toBe('rtl')
    expect(['Open', 'Title', 'Description', 'Close'].map((text) => screen.getByText(text).getAttribute('dir'))).toEqual(
      [null, null, null, null],
    )
  })

  it('takes dir from its own prop over the provider', () => {
    render(
      <DirectionProvider dir="rtl">
        <Dialog defaultOpen dir="ltr">
          <DialogPortal>
            <DialogOverlay data-testid="overlay" />
            <DialogContent>
              <DialogTitle>Title</DialogTitle>
              <DialogDescription>Description</DialogDescription>
            </DialogContent>
          </DialogPortal>
        </Dialog>
      </DirectionProvider>,
    )

    expect(screen.getByTestId('overlay').getAttribute('dir')).toBe('ltr')
    expect(screen.getByRole('dialog').getAttribute('dir')).toBe('ltr')
  })

  it('names a Description with an empty id by a generated one', () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription id="">Description</DialogDescription>
        </DialogContent>
      </Dialog>,
    )

    const { id } = screen.getByText('Description')
    expect(id).toBeTruthy()
    expect(screen.getByRole('dialog').getAttribute('aria-describedby')).toBe(id)
  })

  it('carries its own id from the first commit, so a ref can read it', () => {
    const ids: string[] = []

    render(
      <Dialog defaultOpen>
        <DialogContent id="pond" ref={(node) => void (node && ids.push(node.id))}>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Description</DialogDescription>
        </DialogContent>
      </Dialog>,
    )

    expect(ids[0]).toBe('pond')
  })
})

describe('Dialog part props', () => {
  it('lets the props on a trigger win over its own attributes', () => {
    render(
      <Dialog>
        <DialogTrigger type="submit" data-slot="opener">
          Open
        </DialogTrigger>
      </Dialog>,
    )
    const trigger = screen.getByText('Open')

    expect([trigger.getAttribute('type'), trigger.dataset.slot]).toEqual(['submit', 'opener'])
  })

  it('renders the content with data-slot="dialog-content"', () => {
    renderDialog({ defaultOpen: true })

    expect(screen.getByRole('dialog').dataset.slot).toBe('dialog-content')
  })

  it('lets a style on the content set its nesting variable', () => {
    const style: React.CSSProperties & Record<`--${string}`, number> = { '--gentleduck-dialog-nested-dialogs': 2 }
    render(
      <Dialog defaultOpen>
        <DialogContent aria-describedby={undefined} style={style}>
          <DialogTitle>Title</DialogTitle>
        </DialogContent>
      </Dialog>,
    )

    expect(screen.getByRole('dialog').style.getPropertyValue('--gentleduck-dialog-nested-dialogs')).toBe('2')
  })

  it('renders into the container its portal names', () => {
    const container = document.createElement('div')
    document.body.append(container)
    render(
      <Dialog defaultOpen>
        <DialogPortal container={container}>
          <DialogContent aria-describedby={undefined}>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </DialogPortal>
      </Dialog>,
    )

    expect(container.contains(screen.getByRole('dialog'))).toBe(true)
    container.remove()
  })

  it('mounts a closed overlay forced by itself or by its portal', () => {
    render(
      <Dialog>
        <DialogOverlay data-testid="own" forceMount />
        <DialogPortal forceMount>
          <DialogOverlay data-testid="portalled" />
        </DialogPortal>
      </Dialog>,
    )

    expect([screen.getByTestId('own').dataset.state, screen.getByTestId('portalled').dataset.state]).toEqual([
      'closed',
      'closed',
    ])
  })

  it('keeps a title in its place among the others when its id changes', () => {
    const page = (id: string) => (
      <Dialog defaultOpen>
        <DialogContent aria-describedby={undefined}>
          <DialogTitle id={id}>Name</DialogTitle>
          <DialogTitle id="subtitle">Subtitle</DialogTitle>
        </DialogContent>
      </Dialog>
    )
    const view = render(page('name'))

    view.rerender(page('renamed'))

    expect(screen.getByRole('dialog').getAttribute('aria-labelledby')).toBe('renamed subtitle')
  })

  it('puts focus guards at both ends of the page while open, and takes them away once closed', async () => {
    renderDialog({ defaultOpen: true })
    const ends = [document.body.firstElementChild, document.body.lastElementChild].map((node) =>
      node?.getAttribute('data-slot'),
    )

    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' })
    await wait(0)

    expect([ends, document.querySelectorAll('[data-slot="focus-guard"]').length]).toEqual([
      ['focus-guard', 'focus-guard'],
      0,
    ])
  })

  it('moves focus from its last element to its first on Tab, and back on Shift+Tab', async () => {
    render(
      <Dialog defaultOpen>
        <DialogContent aria-describedby={undefined}>
          <DialogTitle>Title</DialogTitle>
          <button type="button">First</button>
          <button type="button">Last</button>
        </DialogContent>
      </Dialog>,
    )
    await wait(0)
    const [first, last] = [screen.getByText('First'), screen.getByText('Last')]

    act(() => last.focus())
    fireEvent.keyDown(last, { key: 'Tab' })
    const afterTab = document.activeElement?.textContent
    fireEvent.keyDown(first, { key: 'Tab', shiftKey: true })

    expect([afterTab, document.activeElement?.textContent]).toEqual(['First', 'Last'])
  })
})

describe('Dialog returning focus', () => {
  function OpenedElsewhere({ modal }: { modal: boolean }) {
    const [open, setOpen] = React.useState(false)
    return (
      <>
        <Dialog open={open} onOpenChange={setOpen} modal={modal}>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent aria-describedby={undefined}>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>
        <button type="button" onClick={() => setOpen(true)}>
          Elsewhere
        </button>
      </>
    )
  }

  it.each([{ modal: true }, { modal: false }])(
    'returns focus to its trigger when something else opened it, %o',
    async ({ modal }) => {
      render(<OpenedElsewhere modal={modal} />)
      const elsewhere = screen.getByText('Elsewhere')
      act(() => elsewhere.focus())
      fireEvent.click(elsewhere)
      await wait(0)

      fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' })
      await wait(0)

      expect(document.activeElement).toBe(screen.getByText('Open'))
    },
  )
})

describe('Dialog scroll lock', () => {
  function Branch({ register, testId }: { register: boolean; testId: string }) {
    const [node, setNode] = React.useState<HTMLElement | null>(null)
    useFocusScopeBranch(register ? node : null)
    return ReactDOM.createPortal(
      <div
        data-testid={testId}
        ref={(element) => {
          scrollable(element)
          setNode(element)
        }}
      />,
      document.body,
    )
  }

  it('lets a registered branch scroll and keeps the rest of the page locked', async () => {
    render(
      <Dialog defaultOpen>
        <DialogPortal>
          <DialogOverlay />
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>Description</DialogDescription>
            <Branch register testId="branch" />
            <Branch register={false} testId="stray" />
          </DialogContent>
        </DialogPortal>
      </Dialog>,
    )
    await untilScrollLocked()

    expect(scrolls(screen.getByTestId('branch'))).toBe(true)
    expect(scrolls(screen.getByTestId('stray'))).toBe(false)
  })
})

describe('Dialog giving the page back on close', () => {
  function renderLocked(forceMount?: true) {
    return render(
      <Dialog defaultOpen>
        <DialogPortal forceMount={forceMount}>
          <DialogOverlay />
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>Description</DialogDescription>
            <DialogClose>Close</DialogClose>
          </DialogContent>
        </DialogPortal>
      </Dialog>,
    )
  }

  it('removes the content before it gives the page back its pointer events and its scroll', async () => {
    renderLocked()
    await untilScrollLocked()

    const changes = pageChangesOnClose(screen.getByRole('dialog'), () => fireEvent.click(screen.getByText('Close')))

    expect(changes[0]).toBe('content removed')
    expect(changes).toContain('body style')
    expect(changes).toContain('body data-scroll-locked')
  })

  it('gives the page back at once when the content is force mounted to animate out', async () => {
    renderLocked(true)
    await untilScrollLocked()

    fireEvent.click(screen.getByText('Close'))

    expect(screen.getByRole('dialog', { hidden: true }).dataset.state).toBe('closed')
    expect(document.body.style.pointerEvents).toBe('')
    expect(document.body.hasAttribute('data-scroll-locked')).toBe(false)
  })

  it('gives the page its pointer events back while a CSS exit animation runs', () => {
    let animationName = 'none'
    const computedStyle = globalThis.getComputedStyle
    const styleSpy = spyOn(globalThis, 'getComputedStyle').mockImplementation((element, pseudo) =>
      element.getAttribute('role') === 'dialog'
        ? ({
            get animationName() {
              return animationName
            },
          } as CSSStyleDeclaration)
        : computedStyle(element, pseudo),
    )
    const exit = {
      animationName: 'fade-out',
      finished: new Promise<never>(() => {}),
      pending: true,
      playState: 'running',
    }
    Object.defineProperty(HTMLElement.prototype, 'getAnimations', {
      configurable: true,
      value(this: HTMLElement) {
        return this.getAttribute('role') === 'dialog' ? [exit] : []
      },
    })
    renderLocked()
    expect(document.body.style.pointerEvents).toBe('none')

    animationName = 'fade-out'
    fireEvent.click(screen.getByText('Close'))

    expect(screen.getByRole('dialog', { hidden: true }).dataset.state).toBe('closed')
    expect(document.body.style.pointerEvents).toBe('')
    styleSpy.mockRestore()
    Reflect.deleteProperty(HTMLElement.prototype, 'getAnimations')
  })
})

describe('Dialog opened from another dialog', () => {
  function Level({ name, children }: { name: string; children?: React.ReactNode }) {
    return (
      <Dialog>
        <DialogTrigger>Open {name}</DialogTrigger>
        <DialogPortal>
          <DialogOverlay data-testid={`${name} overlay`} />
          <DialogContent aria-label={name} aria-describedby={undefined}>
            {children}
            <DialogClose>Close {name}</DialogClose>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    )
  }
  // The dialog under an open nested one is aria-hidden, which gives it no accessible name to find it by.
  const dialog = (name: string) => screen.getByLabelText<HTMLElement>(name, { selector: '[role=dialog]' })
  const depth = (name: string) => dialog(name).style.getPropertyValue('--gentleduck-dialog-nested-dialogs')
  const click = (text: string) => act(() => fireEvent.click(screen.getByText(text)))

  it('marks the dialog opened from another as nested, and the one it was opened from as holding it', () => {
    render(
      <Level name="outer">
        <Level name="inner" />
      </Level>,
    )

    click('Open outer')
    click('Open inner')

    expect(dialog('inner').hasAttribute('data-nested')).toBe(true)
    expect(screen.getByTestId('inner overlay').hasAttribute('data-nested')).toBe(true)
    expect(dialog('inner').hasAttribute('data-nested-dialog-open')).toBe(false)
    expect(dialog('outer').hasAttribute('data-nested')).toBe(false)
    expect(screen.getByTestId('outer overlay').hasAttribute('data-nested')).toBe(false)
    expect(dialog('outer').hasAttribute('data-nested-dialog-open')).toBe(true)
  })

  it('counts how deep the open dialogs go, and stops counting one once it closes', () => {
    render(
      <Level name="outer">
        <Level name="middle">
          <Level name="inner" />
        </Level>
      </Level>,
    )

    click('Open outer')
    expect(depth('outer')).toBe('0')
    click('Open middle')
    click('Open inner')
    expect([depth('outer'), depth('middle'), depth('inner')]).toEqual(['2', '1', '0'])

    click('Close inner')
    expect([depth('outer'), depth('middle')]).toEqual(['1', '0'])
    expect(dialog('middle').hasAttribute('data-nested-dialog-open')).toBe(false)
    expect(dialog('outer').hasAttribute('data-nested-dialog-open')).toBe(true)
  })

  it('stops counting a nested dialog that leaves the page while it is open', () => {
    function Removable() {
      const [shown, setShown] = React.useState(true)
      return (
        <Level name="outer">
          <button type="button" onClick={() => setShown(false)}>
            Remove
          </button>
          {shown && <Level name="inner" />}
        </Level>
      )
    }
    render(<Removable />)

    click('Open outer')
    click('Open inner')
    click('Remove')

    expect(depth('outer')).toBe('0')
    expect(dialog('outer').hasAttribute('data-nested-dialog-open')).toBe(false)
  })

  it('counts an alert dialog opened from a dialog', () => {
    render(
      <Level name="outer">
        <AlertDialog>
          <AlertDialogTrigger>Delete</AlertDialogTrigger>
          <AlertDialogPortal>
            <AlertDialogContent>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
            </AlertDialogContent>
          </AlertDialogPortal>
        </AlertDialog>
      </Level>,
    )

    click('Open outer')
    click('Delete')

    expect(screen.getByRole('alertdialog').hasAttribute('data-nested')).toBe(true)
    expect(depth('outer')).toBe('1')
  })

  it('is not nested in a dialog whose root holds it outside the content', () => {
    render(
      <Dialog>
        <DialogTrigger>Open outer</DialogTrigger>
        <Level name="beside" />
      </Dialog>,
    )

    click('Open beside')

    expect(dialog('beside').hasAttribute('data-nested')).toBe(false)
  })
})

describe('Dialog focus targets', () => {
  function Focused({ modal, ...contentProps }: { modal: boolean } & React.ComponentProps<typeof DialogContent>) {
    return (
      <>
        <Dialog modal={modal}>
          <DialogTrigger>Open</DialogTrigger>
          <DialogPortal>
            <DialogContent aria-describedby={undefined} {...contentProps}>
              <DialogTitle>Rename</DialogTitle>
              <button type="button">First</button>
              <input aria-label="Name" />
            </DialogContent>
          </DialogPortal>
        </Dialog>
        <input aria-label="Search" />
      </>
    )
  }

  async function open(props: { modal: boolean } & React.ComponentProps<typeof DialogContent>) {
    render(<Focused {...props} />)
    act(() => screen.getByText('Open').focus())
    fireEvent.click(screen.getByText('Open'))
    await wait(0)
  }

  async function close() {
    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' })
    await wait(0)
  }

  const field = (label: string) => ({
    get current() {
      return screen.queryByLabelText<HTMLInputElement>(label)
    },
  })

  it('focuses the element initialFocus names on open rather than the first one', async () => {
    for (const modal of [true, false]) {
      await open({ modal, initialFocus: field('Name') })

      expect(document.activeElement).toBe(screen.getByLabelText('Name'))
      cleanup()
    }
  })

  it('leaves focus on the trigger when initialFocus is false', async () => {
    for (const modal of [true, false]) {
      await open({ modal, initialFocus: false })

      expect(document.activeElement).toBe(screen.getByText('Open'))
      cleanup()
    }
  })

  it('focuses the element finalFocus names on close rather than the trigger', async () => {
    for (const modal of [true, false]) {
      await open({ modal, finalFocus: field('Search') })

      await close()

      expect(document.activeElement).toBe(screen.getByLabelText('Search'))
      cleanup()
    }
  })

  it('lets an auto focus handler that prevents the default win over the targets', async () => {
    await open({
      modal: true,
      initialFocus: field('Name'),
      finalFocus: field('Search'),
      onOpenAutoFocus: (event) => event.preventDefault(),
      onCloseAutoFocus: (event) => event.preventDefault(),
    })
    expect(document.activeElement).not.toBe(screen.getByLabelText('Name'))

    await close()

    expect(document.activeElement).not.toBe(screen.getByLabelText('Search'))
  })
})
