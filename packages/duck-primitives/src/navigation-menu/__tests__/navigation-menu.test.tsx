import { afterAll, beforeAll, describe, expect, it } from 'bun:test'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import * as React from 'react'
import { freshDom, wait } from '../../__tests__/dom'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuSub,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from '../index'

freshDom()

describe('NavigationMenu', () => {
  it('renders with data-slot="navigation-menu"', () => {
    const { container } = render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href="/">Home</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    )
    expect(container.querySelector('[data-slot="navigation-menu"]')).not.toBeNull()
  })

  it('renders as a nav element', () => {
    const { container } = render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href="/">Home</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    )
    expect(container.querySelector('nav')).not.toBeNull()
  })

  it('renders list with data-slot="navigation-menu-list"', () => {
    const { container } = render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href="/">Home</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    )
    expect(container.querySelector('[data-slot="navigation-menu-list"]')).not.toBeNull()
  })

  it('renders link with data-slot="navigation-menu-link"', () => {
    const { container } = render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href="/about">About</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    )
    const link = container.querySelector('[data-slot="navigation-menu-link"]')
    expect(link).not.toBeNull()
    expect(link?.textContent).toBe('About')
  })

  it('renders open content with data-slot="navigation-menu-content", in the item and in the viewport', () => {
    const menu = (viewport: boolean) => (
      <NavigationMenu defaultValue="learn">
        <NavigationMenuList>
          <NavigationMenuItem value="learn">
            <NavigationMenuTrigger>Learn</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink href="#docs">Docs</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
        {viewport && <NavigationMenuViewport />}
      </NavigationMenu>
    )

    const inViewport = (element: HTMLElement) => element.closest('[data-slot="navigation-menu-viewport"]') !== null
    const inline = render(menu(false))
    expect(inline.getByText('Docs').parentElement?.getAttribute('data-slot')).toBe('navigation-menu-content')
    expect(inViewport(inline.getByText('Docs'))).toBe(false)
    inline.unmount()

    const viewport = render(menu(true))
    expect(viewport.getByText('Docs').parentElement?.getAttribute('data-slot')).toBe('navigation-menu-content')
    expect(inViewport(viewport.getByText('Docs'))).toBe(true)
  })

  it('link sets data-active when active', () => {
    const { container } = render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href="/" active>
              Current
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    )
    const link = container.querySelector('[data-slot="navigation-menu-link"]')!
    expect(link.getAttribute('data-active')).toBe('')
  })

  it('forwards ref to nav', () => {
    const ref = React.createRef<HTMLElement>()
    render(
      <NavigationMenu ref={ref}>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href="/">Home</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    )
    expect(ref.current?.tagName).toBe('NAV')
  })

  it('passes className', () => {
    const { container } = render(
      <NavigationMenu className="my-nav">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href="/">Home</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    )
    expect(container.querySelector('.my-nav')).not.toBeNull()
  })

  it('list renders as ul element', () => {
    const { container } = render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href="/">Home</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    )
    expect(container.querySelector('ul[data-slot="navigation-menu-list"]')).not.toBeNull()
  })

  it('link without active has no data-active', () => {
    const { container } = render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href="/about">About</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    )
    const link = container.querySelector('[data-slot="navigation-menu-link"]')!
    expect(link.hasAttribute('data-active')).toBe(false)
  })

  it('renders multiple items', () => {
    const { container } = render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href="/">Home</NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/about">About</NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/contact">Contact</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    )
    expect(container.querySelectorAll('[data-slot="navigation-menu-link"]').length).toBe(3)
  })
})

function renderSiteNavigation(
  props: React.ComponentProps<typeof NavigationMenu> = {},
  {
    viewport = true,
    learnTrigger = {},
  }: { viewport?: boolean; learnTrigger?: React.ComponentProps<typeof NavigationMenuTrigger> } = {},
) {
  return render(
    <>
      <button type="button">Before</button>
      <NavigationMenu delayDuration={0} {...props}>
        <NavigationMenuList>
          <NavigationMenuItem value="learn">
            <NavigationMenuTrigger {...learnTrigger}>Learn</NavigationMenuTrigger>
            <NavigationMenuContent data-testid="learn-content">
              <NavigationMenuLink href="#docs">Docs</NavigationMenuLink>
              <NavigationMenuLink href="#guides">Guides</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem value="build">
            <NavigationMenuTrigger>Build</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink href="#kit">Kit</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuIndicator data-testid="indicator" />
        </NavigationMenuList>
        {viewport && <NavigationMenuViewport />}
      </NavigationMenu>
      <button type="button">After</button>
    </>,
  )
}

const openItem = () => ['Docs', 'Kit'].find((name) => screen.queryByText(name) !== null) ?? null
const mouse = { pointerType: 'mouse' }
const focusProxy = () => document.querySelector<HTMLElement>('[aria-hidden][tabindex="0"]')

async function hover(name: string) {
  fireEvent.pointerEnter(screen.getByText(name), mouse)
  fireEvent.pointerMove(screen.getByText(name), mouse)
  await wait(0)
}

describe('NavigationMenu pointer', () => {
  it('opens 200ms after the pointer rests on a trigger by default', async () => {
    renderSiteNavigation({ delayDuration: undefined })
    await hover('Learn')

    await wait(120)
    expect(openItem()).toBeNull()

    await wait(150)
    expect(openItem()).toBe('Docs')
  })

  it('closes 150ms after the pointer leaves the trigger by default', async () => {
    renderSiteNavigation()
    await hover('Learn')

    fireEvent.pointerLeave(screen.getByText('Learn'), mouse)
    await wait(100)
    expect(openItem()).toBe('Docs')

    await wait(100)
    expect(openItem()).toBeNull()
  })

  it('waits closeDelay after the pointer leaves before it closes', async () => {
    renderSiteNavigation({ closeDelay: 400 })
    await hover('Learn')

    fireEvent.pointerLeave(screen.getByText('Learn'), mouse)
    await wait(250)
    expect(openItem()).toBe('Docs')

    await wait(250)
    expect(openItem()).toBeNull()
  })

  it('stays open when the pointer moves from the trigger into the content', async () => {
    renderSiteNavigation()
    await hover('Learn')

    fireEvent.pointerLeave(screen.getByText('Learn'), mouse)
    fireEvent.pointerEnter(screen.getByTestId('learn-content'), mouse)
    await wait(200)

    expect(openItem()).toBe('Docs')
  })

  it('opens the next item at once while one is open', async () => {
    renderSiteNavigation({ delayDuration: 5000 })
    fireEvent.click(screen.getByText('Learn'))

    fireEvent.pointerLeave(screen.getByText('Learn'), mouse)
    fireEvent.pointerMove(screen.getByText('Build'), mouse)

    expect(openItem()).toBe('Kit')
  })

  it('keeps the next item open past the close the last one started', async () => {
    renderSiteNavigation()
    fireEvent.click(screen.getByText('Learn'))

    fireEvent.pointerLeave(screen.getByText('Learn'), mouse)
    fireEvent.pointerMove(screen.getByText('Build'), mouse)
    await wait(200)

    expect(openItem()).toBe('Kit')
  })

  it('keeps an item that waited out its delay open past the close the last one started', async () => {
    renderSiteNavigation({ delayDuration: 50, skipDelayDuration: 0, closeDelay: 300 })
    fireEvent.click(screen.getByText('Learn'))

    fireEvent.pointerLeave(screen.getByText('Learn'), mouse)
    fireEvent.pointerMove(screen.getByText('Build'), mouse)
    await wait(400)

    expect(openItem()).toBe('Kit')
  })

  it('cancels every close still to come once the pointer reaches the content', async () => {
    renderSiteNavigation({ defaultValue: 'learn' })

    fireEvent.pointerLeave(screen.getByText('Learn'), mouse)
    fireEvent.pointerLeave(screen.getByText('Build'), mouse)
    fireEvent.pointerEnter(screen.getByTestId('learn-content'), mouse)
    await wait(200)

    expect(openItem()).toBe('Docs')
  })

  it('opens on time while the pointer keeps moving over the trigger', async () => {
    renderSiteNavigation({ delayDuration: 200 })

    fireEvent.pointerMove(screen.getByText('Learn'), mouse)
    await wait(150)
    fireEvent.pointerMove(screen.getByText('Learn'), mouse)
    await wait(100)

    expect(openItem()).toBe('Docs')
  })

  it('opens nothing when the pointer leaves the trigger before the open delay runs out', async () => {
    const changes: string[] = []
    renderSiteNavigation({ value: '', delayDuration: 100, onValueChange: (value) => changes.push(value) })

    fireEvent.pointerMove(screen.getByText('Learn'), mouse)
    fireEvent.pointerLeave(screen.getByText('Learn'), mouse)
    await wait(200)

    expect(changes).toEqual([])
  })

  it('opens only the trigger the pointer reached last when leaving the first was prevented', async () => {
    const changes: string[] = []
    renderSiteNavigation(
      { value: '', delayDuration: 100, onValueChange: (value) => changes.push(value) },
      { learnTrigger: { onPointerLeave: (event) => event.preventDefault() } },
    )

    fireEvent.pointerMove(screen.getByText('Learn'), mouse)
    fireEvent.pointerLeave(screen.getByText('Learn'), mouse)
    fireEvent.pointerMove(screen.getByText('Build'), mouse)
    await wait(150)

    expect(changes).toEqual(['build'])
  })

  it('changes nothing once it unmounts with an open or a close still to come', async () => {
    const changes: string[] = []
    const onValueChange = (value: string) => changes.push(value)
    const opening = renderSiteNavigation({ value: '', delayDuration: 100, onValueChange })
    fireEvent.pointerMove(screen.getByText('Learn'), mouse)
    opening.unmount()
    const closing = renderSiteNavigation({ value: 'learn', onValueChange })
    fireEvent.pointerLeave(screen.getByText('Learn'), mouse)
    closing.unmount()

    await wait(200)

    expect(changes).toEqual([])
  })

  for (const viewport of [false, true]) {
    it(`closes once a mouse leaves the content ${viewport ? 'in the viewport' : 'in its item'}, and stays open when a touch does`, async () => {
      renderSiteNavigation({ defaultValue: 'learn' }, { viewport })

      fireEvent.pointerLeave(screen.getByTestId('learn-content'), { pointerType: 'touch' })
      await wait(200)
      const afterTouch = openItem()
      fireEvent.pointerLeave(screen.getByTestId('learn-content'), mouse)
      await wait(200)

      expect([afterTouch, openItem()]).toEqual(['Docs', null])
    })
  }

  it('keeps an open item when the pointer comes back to its trigger before it closes', async () => {
    renderSiteNavigation({ defaultValue: 'learn' })
    const learn = screen.getByText('Learn')

    fireEvent.pointerMove(learn, mouse)
    fireEvent.pointerLeave(learn, mouse)
    fireEvent.pointerMove(learn, mouse)
    await wait(200)

    expect(openItem()).toBe('Docs')
  })

  for (const [closing, close] of [
    ['a click', () => fireEvent.click(screen.getByText('Learn'))],
    ['Escape', () => fireEvent.keyDown(screen.getByText('Docs'), { key: 'Escape' })],
  ] as const) {
    it(`stays shut under the pointer after ${closing} closes it, and opens again once the pointer comes back`, async () => {
      renderSiteNavigation({ defaultValue: 'learn' })
      close()

      fireEvent.pointerMove(screen.getByText('Learn'), mouse)
      await wait(0)
      const underPointer = openItem()
      fireEvent.pointerLeave(screen.getByText('Learn'), mouse)
      await hover('Learn')

      expect([underPointer, openItem()]).toEqual([null, 'Docs'])
    })
  }

  it('leaves the open item for its trigger when another trigger is pressed', async () => {
    renderSiteNavigation({ defaultValue: 'learn' })
    await wait(0)

    fireEvent.pointerDown(screen.getByText('Build'))

    expect(openItem()).toBe('Docs')
  })

  it('closes on a press outside the menu', async () => {
    renderSiteNavigation({ defaultValue: 'learn' })
    await wait(0)

    fireEvent.pointerDown(screen.getByText('After'))

    expect(openItem()).toBeNull()
  })

  it('stays open on a press on the viewport around the content', async () => {
    renderSiteNavigation({ defaultValue: 'learn' })
    await wait(0)

    fireEvent.pointerDown(document.querySelector('[data-slot="navigation-menu-viewport"]')!)

    expect(openItem()).toBe('Docs')
  })

  it('leaves focus where it was when a menu the pointer opened closes', async () => {
    renderSiteNavigation()
    act(() => screen.getByText('After').focus())
    await hover('Learn')

    fireEvent.keyDown(screen.getByText('After'), { key: 'Escape' })

    expect([openItem(), document.activeElement?.textContent]).toEqual([null, 'After'])
  })

  it('ties the open trigger and its content together by id', () => {
    renderSiteNavigation({ defaultValue: 'learn' })
    const trigger = screen.getByText('Learn')
    const content = screen.getByTestId('learn-content')

    expect([
      trigger.getAttribute('aria-controls'),
      content.getAttribute('aria-labelledby'),
      document.querySelector('[aria-owns]')?.getAttribute('aria-owns'),
      trigger.getAttribute('data-state'),
      screen.getByText('Build').getAttribute('data-state'),
    ]).toEqual([content.id, trigger.id, content.id, 'open', 'closed'])
  })

  it('renders no focus proxy and nothing owning a content while every item is closed', () => {
    renderSiteNavigation()

    expect([focusProxy() === null, document.querySelector('[aria-owns]') === null]).toEqual([true, true])
  })

  it('leaves an item a double-click closed shut once the open delay the pointer started runs out', async () => {
    renderSiteNavigation({ delayDuration: 100 })
    const learn = screen.getByText('Learn')
    fireEvent.pointerEnter(learn, mouse)
    fireEvent.pointerMove(learn, mouse)

    fireEvent.click(learn)
    fireEvent.click(learn)
    await wait(150)

    expect(openItem()).toBeNull()
  })
})

describe('NavigationMenu link select', () => {
  function LinkMenu({
    closeOnSelect,
    onClick,
    onSelect,
  }: Pick<React.ComponentProps<typeof NavigationMenuLink>, 'closeOnSelect' | 'onClick' | 'onSelect'>) {
    return (
      <NavigationMenu defaultValue="learn">
        <NavigationMenuList>
          <NavigationMenuItem value="learn">
            <NavigationMenuTrigger>Learn</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink closeOnSelect={closeOnSelect} href="#docs" onClick={onClick} onSelect={onSelect}>
                Docs
              </NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    )
  }

  it('closes the menu once a link is selected', () => {
    render(<LinkMenu />)

    fireEvent.click(screen.getByText('Docs'))

    expect(screen.queryByText('Docs')).toBeNull()
  })

  it('stays open when onSelect prevents the default', () => {
    render(<LinkMenu onSelect={(event) => event.preventDefault()} />)

    fireEvent.click(screen.getByText('Docs'))

    expect(screen.getByText('Docs')).toBeTruthy()
  })

  it('selects and closes when the link prevents its own click, as a client-side router does', () => {
    const selected: string[] = []
    render(<LinkMenu onClick={(event) => event.preventDefault()} onSelect={() => selected.push('Docs')} />)

    fireEvent.click(screen.getByText('Docs'))

    expect([selected, screen.queryByText('Docs')?.textContent]).toEqual([['Docs'], undefined])
  })

  it('commits what onSelect sets together with the close', () => {
    const commits: string[] = []
    const record = () =>
      commits.push(
        `${document.querySelector('output')?.textContent} ${screen.getByText('Learn').getAttribute('data-state')}`,
      )
    function Page() {
      const [selected, setSelected] = React.useState('none')
      return (
        <React.Profiler id="page" onRender={record}>
          <output>{selected}</output>
          <LinkMenu onSelect={() => setSelected('chosen')} />
        </React.Profiler>
      )
    }
    render(<Page />)

    fireEvent.click(screen.getByText('Docs'))

    expect(commits.find((commit) => commit.startsWith('chosen'))).toBe('chosen closed')
  })

  it('stays open after a link is selected with closeOnSelect={false}', () => {
    render(<LinkMenu closeOnSelect={false} />)

    fireEvent.click(screen.getByText('Docs'))

    expect(screen.getByText('Docs')).toBeTruthy()
  })

  for (const [key, held] of [
    ['metaKey', 'Cmd'],
    ['ctrlKey', 'Ctrl'],
    ['shiftKey', 'Shift'],
    ['altKey', 'Alt'],
  ] as const) {
    it(`stays open after a link is clicked with ${held} held, which opens it outside the page`, () => {
      render(<LinkMenu />)

      fireEvent.click(screen.getByText('Docs'), { [key]: true })

      expect(screen.getByText('Docs')).toBeTruthy()
    })
  }
})

describe('NavigationMenu manual activation', () => {
  it('drops an open the pointer scheduled once the menu turns manual', async () => {
    function Switching() {
      const [mode, setMode] = React.useState<'automatic' | 'manual'>('automatic')
      return (
        <>
          <button type="button" onClick={() => setMode('manual')}>
            Manual
          </button>
          <NavigationMenu delayDuration={100} activationMode={mode}>
            <NavigationMenuList>
              <NavigationMenuItem value="learn">
                <NavigationMenuTrigger>Learn</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <NavigationMenuLink href="#docs">Docs</NavigationMenuLink>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </>
      )
    }
    render(<Switching />)
    await hover('Learn')

    fireEvent.click(screen.getByText('Manual'))
    await wait(200)

    expect(screen.queryByText('Docs')).toBeNull()
  })

  it('keeps a clicked item open after the pointer leaves its trigger and the viewport', async () => {
    renderSiteNavigation({ activationMode: 'manual' })
    fireEvent.click(screen.getByText('Learn'))
    const viewport = document.querySelector('[data-slot="navigation-menu-viewport"]') as HTMLElement

    fireEvent.pointerLeave(screen.getByText('Learn'), mouse)
    await wait(200)
    fireEvent.pointerEnter(viewport, mouse)
    fireEvent.pointerLeave(viewport, mouse)
    await wait(200)

    expect(openItem()).toBe('Docs')
  })
})

// The shared preload's observer never calls back, and the viewport and the indicator measure only when it does.
class ReportingResizeObserver {
  static observing = new Set<ReportingResizeObserver>()
  private element: Element | null = null
  constructor(private callback: ResizeObserverCallback) {}
  observe(element: Element) {
    this.element = element
    ReportingResizeObserver.observing.add(this)
    this.callback([], this as never)
  }
  unobserve() {
    ReportingResizeObserver.observing.delete(this)
  }
  disconnect() {}
  static reportAgain(only?: Element | null) {
    for (const observer of ReportingResizeObserver.observing) {
      if (!only || observer.element === only) observer.callback([], observer as never)
    }
  }
}

describe('NavigationMenu viewport size', () => {
  const originals = (['offsetWidth', 'offsetHeight'] as const).map(
    (key) => [key, Object.getOwnPropertyDescriptor(HTMLElement.prototype, key)] as const,
  )
  const originalObserver = globalThis.ResizeObserver
  let measured = 0
  beforeAll(() => {
    globalThis.ResizeObserver = ReportingResizeObserver as never
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      configurable: true,
      get(this: HTMLElement) {
        if (this.dataset.width) measured++
        return Number(this.dataset.width ?? 0)
      },
    })
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
      configurable: true,
      get(this: HTMLElement) {
        return Number(this.dataset.height ?? 0)
      },
    })
  })
  afterAll(() => {
    globalThis.ResizeObserver = originalObserver
    for (const [key, original] of originals) if (original) Object.defineProperty(HTMLElement.prototype, key, original)
  })

  const MeasuredMenu = ({ value }: { value: string }) => (
    <NavigationMenu value={value}>
      <NavigationMenuList>
        <NavigationMenuItem value="learn">
          <NavigationMenuTrigger>Learn</NavigationMenuTrigger>
          <NavigationMenuContent forceMount data-height="80" data-width="120">
            <NavigationMenuLink href="#docs">Docs</NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem value="build">
          <NavigationMenuTrigger>Build</NavigationMenuTrigger>
          <NavigationMenuContent forceMount data-height="160" data-width="240">
            <NavigationMenuLink href="#kit">Kit</NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
      <NavigationMenuViewport data-testid="viewport" />
    </NavigationMenu>
  )
  const viewportSize = (axis: 'width' | 'height') =>
    screen.getByTestId('viewport').style.getPropertyValue(`--gentleduck-navigation-menu-viewport-${axis}`)
  const viewportWidth = () => viewportSize('width')

  it('takes the size of the open content, not of another one kept mounted', () => {
    const { rerender } = render(<MeasuredMenu value="learn" />)
    expect([viewportWidth(), viewportSize('height')]).toEqual(['120px', '80px'])

    rerender(<MeasuredMenu value="build" />)
    expect([viewportWidth(), viewportSize('height')]).toEqual(['240px', '160px'])
  })

  it('measures once for several resizes reported in one frame', async () => {
    render(<MeasuredMenu value="learn" />)
    measured = 0

    ReportingResizeObserver.reportAgain()
    ReportingResizeObserver.reportAgain()
    await wait(50)

    expect(measured).toBe(1)
  })

  it('drops a measure still to come for a content another one replaced', async () => {
    const { rerender } = render(<MeasuredMenu value="learn" />)
    screen.getByText('Docs').parentElement?.setAttribute('data-width', '150')
    ReportingResizeObserver.reportAgain()

    rerender(<MeasuredMenu value="build" />)
    await wait(50)

    expect(viewportWidth()).toBe('240px')
  })

  it('takes a later resize of the open content a frame after it is reported', async () => {
    render(<MeasuredMenu value="learn" />)

    screen.getByText('Docs').parentElement?.setAttribute('data-width', '150')
    ReportingResizeObserver.reportAgain()
    const reported = viewportWidth()
    await wait(50)

    expect([reported, viewportWidth()]).toEqual(['120px', '150px'])
  })
})

describe('NavigationMenu keyboard', () => {
  it('moves focus into open content on ArrowDown', () => {
    renderSiteNavigation({ defaultValue: 'learn' })
    act(() => screen.getByText('Learn').focus())

    expect(fireEvent.keyDown(screen.getByText('Learn'), { key: 'ArrowDown' })).toBe(false)
    expect(document.activeElement).toBe(screen.getByText('Docs'))
  })

  it('enters vertical content on the arrow pointing away from the start edge', () => {
    renderSiteNavigation({ defaultValue: 'learn', orientation: 'vertical', dir: 'rtl' })
    act(() => screen.getByText('Learn').focus())

    fireEvent.keyDown(screen.getByText('Learn'), { key: 'ArrowRight' })
    expect(document.activeElement).toBe(screen.getByText('Learn'))

    fireEvent.keyDown(screen.getByText('Learn'), { key: 'ArrowLeft' })
    expect(document.activeElement).toBe(screen.getByText('Docs'))
  })

  it('moves between triggers with the arrows, Home and End, in the key press, keeping the page still', () => {
    renderSiteNavigation()
    act(() => screen.getByText('Learn').focus())

    expect(fireEvent.keyDown(screen.getByText('Learn'), { key: 'ArrowRight' })).toBe(false)
    expect(document.activeElement).toBe(screen.getByText('Build'))

    fireEvent.keyDown(screen.getByText('Build'), { key: 'ArrowUp' })
    expect(document.activeElement).toBe(screen.getByText('Learn'))

    fireEvent.keyDown(screen.getByText('Learn'), { key: 'End' })
    expect(document.activeElement).toBe(screen.getByText('Build'))

    fireEvent.keyDown(screen.getByText('Build'), { key: 'Home' })
    expect(document.activeElement).toBe(screen.getByText('Learn'))
  })

  it('moves to the next trigger on ArrowDown while the trigger is closed', () => {
    renderSiteNavigation()
    act(() => screen.getByText('Learn').focus())

    fireEvent.keyDown(screen.getByText('Learn'), { key: 'ArrowDown' })

    expect(document.activeElement).toBe(screen.getByText('Build'))
  })

  it('reads ArrowLeft as the next trigger right to left', () => {
    renderSiteNavigation({ dir: 'rtl' })
    act(() => screen.getByText('Learn').focus())

    fireEvent.keyDown(screen.getByText('Learn'), { key: 'ArrowLeft' })

    expect(document.activeElement).toBe(screen.getByText('Build'))
  })
})

describe('NavigationMenu content tab order', () => {
  it('tabs through its links and hands the last Tab to the focus proxy', () => {
    renderSiteNavigation({ defaultValue: 'learn' })
    act(() => screen.getByText('Docs').focus())

    expect(fireEvent.keyDown(screen.getByText('Docs'), { key: 'Tab' })).toBe(false)
    expect(document.activeElement).toBe(screen.getByText('Guides'))

    act(() => {
      fireEvent.keyDown(screen.getByText('Guides'), { key: 'Tab' })
    })
    expect(document.activeElement).toBe(focusProxy())
  })

  it('hands a Tab from a link inside a shadow root on to the focus proxy, not back to the first link', () => {
    function ShadowLink() {
      const ref = React.useRef<HTMLDivElement>(null)
      React.useLayoutEffect(() => {
        const host = ref.current
        if (!host || host.shadowRoot) return
        const link = document.createElement('a')
        link.href = '#shadow'
        link.textContent = 'Shadow'
        host.attachShadow({ mode: 'open' }).append(link)
      }, [])
      return <div data-testid="host" ref={ref} />
    }
    render(
      <NavigationMenu defaultValue="learn">
        <NavigationMenuList>
          <NavigationMenuItem value="learn">
            <NavigationMenuTrigger>Shadowed</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink href="#light">Light</NavigationMenuLink>
              <ShadowLink />
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    )
    const shadowLink = screen.getByTestId('host').shadowRoot?.querySelector('a') as HTMLElement
    act(() => shadowLink.focus())

    act(() => {
      fireEvent.keyDown(shadowLink, { key: 'Tab', composed: true })
    })

    expect(document.activeElement).toBe(focusProxy())
  })

  it('tabs backwards through its links with Shift+Tab', () => {
    render(
      <NavigationMenu defaultValue="learn">
        <NavigationMenuList>
          <NavigationMenuItem value="learn">
            <NavigationMenuTrigger>Learn</NavigationMenuTrigger>
            <NavigationMenuContent>
              {['Docs', 'Guides', 'Recipes'].map((name) => (
                <NavigationMenuLink href={`#${name}`} key={name}>
                  {name}
                </NavigationMenuLink>
              ))}
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    )
    act(() => screen.getByText('Recipes').focus())

    fireEvent.keyDown(screen.getByText('Recipes'), { key: 'Tab', shiftKey: true })

    expect(document.activeElement).toBe(screen.getByText('Guides'))
  })

  it('takes its links out of the tab order when focus moves back to the trigger', () => {
    renderSiteNavigation({ defaultValue: 'learn' })
    act(() => screen.getByText('Docs').focus())

    act(() => screen.getByText('Learn').focus())

    expect(['Docs', 'Guides'].map((name) => screen.getByText(name).getAttribute('tabindex'))).toEqual(['-1', '-1'])
  })

  it('takes the links of a content kept mounted out of the tab order when Escape closes it', () => {
    render(
      <NavigationMenu defaultValue="learn">
        <NavigationMenuList>
          <NavigationMenuItem value="learn">
            <NavigationMenuTrigger>Learn</NavigationMenuTrigger>
            <NavigationMenuContent forceMount>
              <NavigationMenuLink href="#docs">Docs</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    )

    fireEvent.keyDown(document.body, { key: 'Escape' })

    expect(screen.getByText('Docs').getAttribute('tabindex')).toBe('-1')
  })

  it('enters the content at its first link when focus comes to the proxy from the trigger', () => {
    renderSiteNavigation({ defaultValue: 'learn' })
    act(() => screen.getByText('Learn').focus())

    act(() => focusProxy()?.focus())

    expect(document.activeElement).toBe(screen.getByText('Docs'))
  })

  it('gives a link back its place in the tab order without leaving a tabindex behind', () => {
    render(
      <>
        <NavigationMenu defaultValue="learn">
          <NavigationMenuList>
            <NavigationMenuItem value="learn">
              <NavigationMenuTrigger>Learn</NavigationMenuTrigger>
              <NavigationMenuContent forceMount>
                <NavigationMenuLink href="#docs">Docs</NavigationMenuLink>
                <NavigationMenuLink href="#guides" tabIndex={0}>
                  Guides
                </NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <button type="button">After</button>
      </>,
    )
    act(() => screen.getByText('Docs').focus())
    act(() => screen.getByText('After').focus())
    const removed = ['Docs', 'Guides'].map((name) => screen.getByText(name).getAttribute('tabindex'))

    fireEvent.click(screen.getByText('Learn'))
    act(() => screen.getByText('Learn').focus())
    act(() => focusProxy()?.focus())

    expect([
      removed,
      ['Docs', 'Guides'].map((name) => screen.getByText(name).outerHTML.match(/ (data-)?tabindex="[^"]*"/g)),
    ]).toEqual([
      ['-1', '-1'],
      [null, [' tabindex="0"']],
    ])
  })

  it('enters the content at its last link when focus comes back to the proxy from the next trigger', () => {
    renderSiteNavigation({ defaultValue: 'learn' })
    act(() => screen.getByText('Build').focus())

    act(() => focusProxy()?.focus())

    expect(document.activeElement).toBe(screen.getByText('Guides'))
  })
})

describe('NavigationMenu vertical indicator', () => {
  const original = globalThis.ResizeObserver
  beforeAll(() => {
    globalThis.ResizeObserver = ReportingResizeObserver as never
  })
  afterAll(() => {
    globalThis.ResizeObserver = original
  })

  it('stays drawn, as hidden, once its item closes when force mounted', async () => {
    const Menu = ({ value }: { value: string }) => (
      <NavigationMenu value={value}>
        <NavigationMenuList>
          <NavigationMenuItem value="learn">
            <NavigationMenuTrigger>Learn</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink href="#docs">Docs</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuIndicator forceMount data-testid="indicator" />
        </NavigationMenuList>
      </NavigationMenu>
    )
    const { rerender } = render(<Menu value="learn" />)
    await waitFor(() => screen.getByTestId('indicator'))

    rerender(<Menu value="" />)

    expect(screen.getByTestId('indicator').getAttribute('data-state')).toBe('hidden')
  })

  it('keeps following the trigger it left once its item closes, when force mounted', async () => {
    const Menu = ({ value }: { value: string }) => (
      <NavigationMenu value={value}>
        <NavigationMenuList>
          <NavigationMenuItem value="learn">
            <NavigationMenuTrigger>Learn</NavigationMenuTrigger>
          </NavigationMenuItem>
          <NavigationMenuIndicator forceMount data-testid="indicator" />
        </NavigationMenuList>
      </NavigationMenu>
    )
    const { rerender } = render(<Menu value="learn" />)
    await waitFor(() => screen.getByTestId('indicator'))
    rerender(<Menu value="" />)

    Object.defineProperty(screen.getByText('Learn'), 'offsetWidth', { configurable: true, value: 90 })
    act(() => ReportingResizeObserver.reportAgain())
    await wait(20)

    expect(screen.getByTestId('indicator').style.width).toBe('90px')
  })

  it('measures height and slides down the track', async () => {
    renderSiteNavigation({ defaultValue: 'learn', orientation: 'vertical' })
    await waitFor(() => screen.getByTestId('indicator'))
    Object.defineProperties(screen.getByText('Learn'), {
      offsetHeight: { configurable: true, value: 30 },
      offsetWidth: { configurable: true, value: 70 },
      offsetTop: { configurable: true, value: 12 },
      offsetLeft: { configurable: true, value: 5 },
      offsetParent: {
        configurable: true,
        value: document.querySelector('[data-slot="navigation-menu-list-wrapper"]'),
      },
    })
    act(() => ReportingResizeObserver.reportAgain())
    await wait(20)

    const { style } = screen.getByTestId('indicator')
    expect([style.top, style.height, style.transform]).toEqual(['0px', '30px', 'translateY(12px)'])
  })

  it('moves with its trigger when only the track reports a resize', async () => {
    renderSiteNavigation({ defaultValue: 'learn' })
    await waitFor(() => screen.getByTestId('indicator'))
    const track = document.querySelector('[data-slot="navigation-menu-list-wrapper"]')
    Object.defineProperties(screen.getByText('Learn'), {
      offsetLeft: { configurable: true, value: 40 },
      offsetParent: { configurable: true, value: track },
    })

    act(() => ReportingResizeObserver.reportAgain(track))
    await wait(20)

    expect(screen.getByTestId('indicator').style.transform).toBe('translateX(40px)')
  })

  it('measures the open trigger from the track, through a positioned item around it', async () => {
    render(
      <NavigationMenu defaultValue="build">
        <NavigationMenuList>
          <NavigationMenuItem value="learn">
            <NavigationMenuTrigger>Learn</NavigationMenuTrigger>
          </NavigationMenuItem>
          <NavigationMenuItem data-testid="item" value="build">
            <NavigationMenuTrigger>Build</NavigationMenuTrigger>
          </NavigationMenuItem>
          <NavigationMenuIndicator data-testid="indicator" />
        </NavigationMenuList>
      </NavigationMenu>,
    )
    const track = document.querySelector('[data-slot="navigation-menu-list-wrapper"]')
    const item = screen.getByTestId('item')
    const layout = (node: Element, offsetParent: Element | null, offsetLeft: number) =>
      Object.defineProperties(node, {
        offsetLeft: { configurable: true, value: offsetLeft },
        offsetParent: { configurable: true, value: offsetParent },
      })
    layout(item, track, 80)
    layout(screen.getByText('Build'), item, 4)
    act(() => ReportingResizeObserver.reportAgain())
    await wait(20)

    expect(screen.getByTestId('indicator').style.transform).toBe('translateX(84px)')
  })
})

describe('NavigationMenu content opened under focus', () => {
  it('moves into content a click opened on the focused trigger with ArrowDown', () => {
    renderSiteNavigation()
    act(() => screen.getByText('Learn').focus())
    fireEvent.click(screen.getByText('Learn'))

    fireEvent.keyDown(screen.getByText('Learn'), { key: 'ArrowDown' })

    expect(document.activeElement).toBe(screen.getByText('Docs'))
  })
})

describe('NavigationMenu skip delay', () => {
  it('waits out the open delay again once the skip delay has passed since an item closed', async () => {
    renderSiteNavigation({ delayDuration: 200, skipDelayDuration: 50 })
    fireEvent.click(screen.getByText('Learn'))
    fireEvent.click(screen.getByText('Learn'))
    await wait(80)

    fireEvent.pointerMove(screen.getByText('Build'), mouse)
    expect(openItem()).toBeNull()

    await wait(250)
    expect(openItem()).toBe('Kit')
  })

  it('opens the next item at once inside the skip delay after one closed', async () => {
    renderSiteNavigation({ delayDuration: 5000, skipDelayDuration: 300 })
    fireEvent.click(screen.getByText('Learn'))
    fireEvent.click(screen.getByText('Learn'))
    await wait(50)

    fireEvent.pointerMove(screen.getByText('Build'), mouse)

    expect(openItem()).toBe('Kit')
  })

  it('keeps skipping the open delay once an item opens inside the skip delay', async () => {
    renderSiteNavigation({ delayDuration: 5000, skipDelayDuration: 50 })
    fireEvent.click(screen.getByText('Learn'))
    fireEvent.click(screen.getByText('Learn'))
    fireEvent.pointerMove(screen.getByText('Build'), mouse)
    await wait(100)

    fireEvent.pointerEnter(screen.getByText('Learn'), mouse)
    fireEvent.pointerMove(screen.getByText('Learn'), mouse)

    expect(openItem()).toBe('Docs')
  })
})

function renderSubMenu(
  props: React.ComponentProps<typeof NavigationMenu> = {},
  subProps: React.ComponentProps<typeof NavigationMenuSub> = {},
) {
  return render(
    <NavigationMenu {...props}>
      <NavigationMenuList>
        <NavigationMenuItem value="learn">
          <NavigationMenuTrigger>Learn</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink href="#overview">Overview</NavigationMenuLink>
            <NavigationMenuSub {...subProps}>
              <NavigationMenuList>
                <NavigationMenuItem value="basics">
                  <NavigationMenuTrigger>Basics</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <NavigationMenuLink href="#intro">Intro</NavigationMenuLink>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem value="advanced">
                  <NavigationMenuTrigger>Advanced</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <NavigationMenuLink href="#hooks">Hooks</NavigationMenuLink>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenuSub>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>,
  )
}

describe('NavigationMenu sub menu', () => {
  it('tells onValueChange which sub item a click opened', () => {
    const changes: string[] = []
    renderSubMenu({ defaultValue: 'learn' }, { onValueChange: (value) => changes.push(value) })

    fireEvent.click(screen.getByText('Advanced'))

    expect(changes).toEqual(['advanced'])
  })

  it('keeps both open on a press in the top content outside the sub content', async () => {
    renderSubMenu({ defaultValue: 'learn' }, { defaultValue: 'basics' })
    await wait(0)

    fireEvent.pointerDown(screen.getByText('Overview'))

    expect([screen.queryByText('Overview')?.textContent, screen.queryByText('Intro')?.textContent]).toEqual([
      'Overview',
      'Intro',
    ])
  })

  it('hands focus straight to the top trigger when a link in a sub content is chosen', () => {
    renderSubMenu({ defaultValue: 'learn' }, { defaultValue: 'basics' })
    act(() => screen.getByText('Intro').focus())
    const focused: (string | null | undefined)[] = []
    const record = () => focused.push(document.activeElement?.textContent)
    document.addEventListener('focusin', record)

    fireEvent.click(screen.getByText('Intro'))
    document.removeEventListener('focusin', record)

    expect(focused).toEqual(['Learn'])
  })

  it('closes the whole menu on Escape in a sub content opened after the top one', () => {
    renderSubMenu({ defaultValue: 'learn' })
    fireEvent.click(screen.getByText('Basics'))
    act(() => screen.getByText('Intro').focus())

    fireEvent.keyDown(screen.getByText('Intro'), { key: 'Escape' })

    expect([screen.queryByText('Overview')?.textContent, document.activeElement?.textContent]).toEqual([
      undefined,
      'Learn',
    ])
  })

  it('moves from a link in the top content to the sub triggers with the arrows', () => {
    renderSubMenu({ defaultValue: 'learn' })
    act(() => screen.getByText('Overview').focus())

    fireEvent.keyDown(screen.getByText('Overview'), { key: 'ArrowDown' })

    expect(document.activeElement).toBe(screen.getByText('Basics'))
  })

  it('takes pointer events from a closed content kept mounted, but not from a closed sub content', () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem value="learn">
            <NavigationMenuTrigger>Learn</NavigationMenuTrigger>
            <NavigationMenuContent forceMount data-testid="learn-content">
              <NavigationMenuSub>
                <NavigationMenuList>
                  <NavigationMenuItem value="basics">
                    <NavigationMenuTrigger>Basics</NavigationMenuTrigger>
                    <NavigationMenuContent forceMount data-testid="basics-content">
                      <NavigationMenuLink href="#intro">Intro</NavigationMenuLink>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenuSub>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    )

    expect([
      screen.getByTestId('learn-content').style.pointerEvents,
      screen.getByTestId('basics-content').style.pointerEvents,
    ]).toEqual(['none', ''])
  })

  it('closes the whole menu on Escape inside a sub menu and hands focus to the top trigger', () => {
    render(
      <NavigationMenu defaultValue="learn">
        <NavigationMenuList>
          <NavigationMenuItem value="learn">
            <NavigationMenuTrigger>Learn</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuSub defaultValue="basics">
                <NavigationMenuList>
                  <NavigationMenuItem value="basics">
                    <NavigationMenuTrigger>Basics</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <NavigationMenuLink href="#intro">Intro</NavigationMenuLink>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenuSub>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    )
    act(() => screen.getByText('Intro').focus())

    fireEvent.keyDown(screen.getByText('Intro'), { key: 'Escape' })

    expect([screen.queryByText('Intro'), screen.queryByText('Basics')]).toEqual([null, null])
    expect(document.activeElement).toBe(screen.getByText('Learn'))
  })
})

function recordErrors() {
  const errors: unknown[] = []
  const record = (event: ErrorEvent) => errors.push(event.error)
  window.addEventListener('error', record)
  return { errors, stop: () => window.removeEventListener('error', record) }
}

function Plain({ children }: { children?: React.ReactNode }) {
  return <span>{children}</span>
}

function NoRef({ ref: _ref, ...props }: React.ComponentProps<'div'>) {
  return <div {...props} />
}

describe('NavigationMenu items without a value', () => {
  it('opens only the item pressed when no item names a value', () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          {['Learn', 'Build'].map((name) => (
            <NavigationMenuItem key={name}>
              <NavigationMenuTrigger>{name}</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuLink href={`#${name}`}>{`${name} link`}</NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>,
    )

    fireEvent.click(screen.getByText('Build'))

    expect([screen.queryByText('Learn link'), screen.queryByText('Build link')?.textContent]).toEqual([
      null,
      'Build link',
    ])
  })
})

describe('NavigationMenu motion', () => {
  it.each([
    ['horizontal', 'ltr', ['from-start', 'to-end']],
    ['vertical', 'ltr', ['from-start', 'to-end']],
    ['vertical', 'rtl', ['from-start', 'to-end']],
    ['horizontal', 'rtl', ['from-end', 'to-start']],
  ] as const)(
    '%s and %s, moving back an item slides the contents the way the row runs on screen',
    (orientation, dir, motion) => {
      const Menu = ({ value }: { value: string }) => (
        <NavigationMenu dir={dir} orientation={orientation} value={value}>
          <NavigationMenuList>
            <NavigationMenuItem value="learn">
              <NavigationMenuTrigger>Learn</NavigationMenuTrigger>
              <NavigationMenuContent forceMount data-testid="learn-content">
                <NavigationMenuLink href="#docs">Docs</NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem value="build">
              <NavigationMenuTrigger>Build</NavigationMenuTrigger>
              <NavigationMenuContent forceMount data-testid="build-content">
                <NavigationMenuLink href="#kit">Kit</NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      )
      const { rerender } = render(<Menu value="build" />)

      rerender(<Menu value="learn" />)

      expect([
        screen.getByTestId('learn-content').getAttribute('data-motion'),
        screen.getByTestId('build-content').getAttribute('data-motion'),
      ]).toEqual([...motion])
    },
  )

  const ThreeItems = ({ value }: { value: string }) => (
    <NavigationMenu value={value}>
      <NavigationMenuList>
        {['learn', 'build', 'ship'].map((item) => (
          <NavigationMenuItem key={item} value={item}>
            <NavigationMenuTrigger>{item}</NavigationMenuTrigger>
            <NavigationMenuContent forceMount data-testid={`${item}-content`}>
              <NavigationMenuLink href={`#${item}`}>{`${item} link`}</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  )
  const motionOf = (item: string) => screen.getByTestId(`${item}-content`).getAttribute('data-motion')

  it('leaves the slide on a content neither opening nor closing', () => {
    const { rerender } = render(<ThreeItems value="learn" />)
    rerender(<ThreeItems value="build" />)
    const leaving = motionOf('learn')

    rerender(<ThreeItems value="ship" />)

    expect([leaving, motionOf('learn')]).toEqual(['to-start', 'to-start'])
  })

  it('slides nothing out when the whole menu closes', () => {
    const { rerender } = render(<ThreeItems value="learn" />)

    rerender(<ThreeItems value="" />)

    expect(motionOf('learn')).toBeNull()
  })
})

describe('NavigationMenu pointer types', () => {
  it('leaves a touch moving over a trigger to the press', async () => {
    renderSiteNavigation()

    fireEvent.pointerMove(screen.getByText('Learn'), { pointerType: 'touch' })
    await wait(0)

    expect(openItem()).toBeNull()
  })
})

describe('NavigationMenu disabled trigger', () => {
  function renderWithDisabledBuild(props: React.ComponentProps<typeof NavigationMenu> = {}) {
    render(
      <NavigationMenu delayDuration={0} {...props}>
        <NavigationMenuList>
          <NavigationMenuItem value="learn">
            <NavigationMenuTrigger>Learn</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink href="#docs">Docs</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem value="build">
            <NavigationMenuTrigger disabled>Build</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink href="#kit">Kit</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    )
  }

  it('marks only the disabled trigger with data-disabled', () => {
    renderWithDisabledBuild()

    expect([
      screen.getByText('Learn').getAttribute('data-disabled'),
      screen.getByText('Build').getAttribute('data-disabled'),
    ]).toEqual([null, ''])
  })

  it('keeps the open item when the pointer leaves a disabled trigger', async () => {
    renderWithDisabledBuild({ defaultValue: 'learn' })

    fireEvent.pointerLeave(screen.getByText('Build'), mouse)
    await wait(200)

    expect(openItem()).toBe('Docs')
  })
})

describe('NavigationMenu skip delay off', () => {
  it('waits out the open delay between items when skipDelayDuration is 0', async () => {
    renderSiteNavigation({ delayDuration: 200, skipDelayDuration: 0 })
    fireEvent.click(screen.getByText('Learn'))

    fireEvent.pointerMove(screen.getByText('Build'), mouse)
    const atOnce = openItem()
    await wait(250)

    expect([atOnce, openItem()]).toEqual(['Docs', 'Kit'])
  })
})

describe('NavigationMenu keyboard edges', () => {
  it('keeps focus on the first trigger on Home', () => {
    renderSiteNavigation()
    act(() => screen.getByText('Learn').focus())

    fireEvent.keyDown(screen.getByText('Learn'), { key: 'Home' })

    expect(document.activeElement).toBe(screen.getByText('Learn'))
  })

  it('passes over a link whose element never takes the ref', () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem value="learn">
            <NavigationMenuTrigger>Learn</NavigationMenuTrigger>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Plain>Blog</Plain>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem value="build">
            <NavigationMenuTrigger>Build</NavigationMenuTrigger>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    )
    act(() => screen.getByText('Build').focus())

    // The arrow walks past Blog's entry, which Home could jump over.
    fireEvent.keyDown(screen.getByText('Build'), { key: 'ArrowLeft' })

    expect(document.activeElement).toBe(screen.getByText('Learn'))
  })

  it('stays on an open trigger that has no content on ArrowDown', () => {
    const { errors, stop } = recordErrors()
    render(
      <NavigationMenu defaultValue="solo">
        <NavigationMenuList>
          <NavigationMenuItem value="solo">
            <NavigationMenuTrigger>Solo</NavigationMenuTrigger>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    )
    act(() => screen.getByText('Solo').focus())

    fireEvent.keyDown(screen.getByText('Solo'), { key: 'ArrowDown' })
    stop()

    expect([document.activeElement?.textContent, errors]).toEqual(['Solo', []])
  })

  for (const [key, held] of [
    ['ctrlKey', 'Ctrl'],
    ['altKey', 'Alt'],
    ['metaKey', 'Cmd'],
  ] as const) {
    it(`leaves ${held}+Tab in the content to the browser`, () => {
      renderSiteNavigation({ defaultValue: 'learn' })
      act(() => screen.getByText('Docs').focus())

      expect(fireEvent.keyDown(screen.getByText('Docs'), { key: 'Tab', [key]: true })).toBe(true)
      expect(document.activeElement).toBe(screen.getByText('Docs'))
    })
  }

  it('lets focus leave a content whose element never takes the ref', () => {
    const { errors, stop } = recordErrors()
    render(
      <>
        <NavigationMenu defaultValue="learn">
          <NavigationMenuList>
            <NavigationMenuItem value="learn">
              <NavigationMenuTrigger>Learn</NavigationMenuTrigger>
              <NavigationMenuContent asChild>
                <NoRef>
                  <NavigationMenuLink href="#docs">Docs</NavigationMenuLink>
                </NoRef>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <button type="button">After</button>
      </>,
    )
    act(() => screen.getByText('Docs').focus())

    act(() => screen.getByText('After').focus())
    stop()

    expect([document.activeElement?.textContent, errors]).toEqual(['After', []])
  })

  it('lets something in the content move focus out of it as the content unmounts', () => {
    const { errors, stop } = recordErrors()
    function HandsFocusBack() {
      React.useLayoutEffect(() => () => document.querySelector<HTMLElement>('#after')?.focus(), [])
      return null
    }
    const { rerender } = render(
      <>
        <NavigationMenu value="learn">
          <NavigationMenuList>
            <NavigationMenuItem value="learn">
              <NavigationMenuTrigger>Learn</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuLink href="#docs">Docs</NavigationMenuLink>
                <HandsFocusBack />
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <button type="button" id="after">
          After
        </button>
      </>,
    )
    act(() => screen.getByText('Docs').focus())
    const focusedBefore = document.activeElement === screen.getByText('Docs')

    rerender(
      <>
        <NavigationMenu value="learn">
          <NavigationMenuList />
        </NavigationMenu>
        <button type="button" id="after">
          After
        </button>
      </>,
    )
    stop()

    expect([focusedBefore, document.activeElement?.textContent, errors]).toEqual([true, 'After', []])
  })
})

describe('NavigationMenu viewport contents', () => {
  it('drops the content of an item that leaves, under StrictMode', () => {
    const Menu = ({ learn }: { learn: boolean }) => (
      <React.StrictMode>
        <NavigationMenu value="learn">
          <NavigationMenuList>
            {learn && (
              <NavigationMenuItem value="learn">
                <NavigationMenuTrigger>Learn</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <NavigationMenuLink href="#docs">Docs</NavigationMenuLink>
                </NavigationMenuContent>
              </NavigationMenuItem>
            )}
          </NavigationMenuList>
          <NavigationMenuViewport />
        </NavigationMenu>
      </React.StrictMode>
    )
    const { rerender } = render(<Menu learn />)
    const shown = screen.queryByText('Docs') !== null

    rerender(<Menu learn={false} />)

    expect([shown, screen.queryByText('Docs')]).toEqual([true, null])
  })

  it('marks which content in the viewport is open, so one kept mounted can be hidden', () => {
    render(
      <NavigationMenu value="build">
        <NavigationMenuList>
          <NavigationMenuItem value="learn">
            <NavigationMenuTrigger>Learn</NavigationMenuTrigger>
            <NavigationMenuContent forceMount>
              <NavigationMenuLink href="#docs">Docs</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem value="build">
            <NavigationMenuTrigger>Build</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink href="#kit">Kit</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
        <NavigationMenuViewport />
      </NavigationMenu>,
    )
    const state = (name: string) =>
      screen.getByText(name).closest('[data-slot="navigation-menu-content"]')?.getAttribute('data-state')

    expect([state('Docs'), state('Kit')]).toEqual(['closed', 'open'])
  })

  it('keeps the content it closed while force mounted, closed to the pointer', () => {
    const Menu = ({ value }: { value: string }) => (
      <NavigationMenu value={value}>
        <NavigationMenuList>
          <NavigationMenuItem value="learn">
            <NavigationMenuTrigger>Learn</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink href="#docs">Docs</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
        <NavigationMenuViewport forceMount data-testid="viewport" />
      </NavigationMenu>
    )
    const { rerender } = render(<Menu value="learn" />)

    rerender(<Menu value="" />)

    const viewport = screen.getByTestId('viewport')
    expect([
      viewport.getAttribute('data-state'),
      viewport.style.pointerEvents,
      screen.queryByText('Docs')?.textContent,
    ]).toEqual(['closed', 'none', 'Docs'])
  })

  const ViewportMenu = ({
    value,
    learnRef,
  }: {
    value: string
    learnRef: React.Ref<React.ComponentRef<typeof NavigationMenuContent>>
  }) => (
    <NavigationMenu value={value}>
      <NavigationMenuList>
        <NavigationMenuItem value="learn">
          <NavigationMenuTrigger>Learn</NavigationMenuTrigger>
          <NavigationMenuContent forceMount ref={learnRef}>
            <NavigationMenuLink href="#docs">Docs</NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem value="build">
          <NavigationMenuTrigger>Build</NavigationMenuTrigger>
          <NavigationMenuContent forceMount>
            <NavigationMenuLink href="#kit">Kit</NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
      <NavigationMenuViewport />
    </NavigationMenu>
  )

  it('keeps the element of a content in the viewport on its ref while other items open', () => {
    const handed: (string | null)[] = []
    const learnRef = (node: HTMLElement | null) => {
      handed.push(node && node.getAttribute('data-slot'))
    }
    const { rerender } = render(<ViewportMenu learnRef={learnRef} value="learn" />)
    const first = handed.at(-1)
    handed.length = 0

    rerender(<ViewportMenu learnRef={learnRef} value="build" />)
    rerender(<ViewportMenu learnRef={learnRef} value="learn" />)

    expect([first, handed]).toEqual(['navigation-menu-content', []])
  })

  it('closes once on Escape under StrictMode', () => {
    const changes: string[] = []
    render(
      <React.StrictMode>
        <NavigationMenu value="learn" onValueChange={(value) => changes.push(value)}>
          <NavigationMenuList>
            <NavigationMenuItem value="learn">
              <NavigationMenuTrigger>Learn</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuLink href="#docs">Docs</NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </React.StrictMode>,
    )

    fireEvent.keyDown(document.body, { key: 'Escape' })

    expect(changes).toEqual([''])
  })
})

describe('NavigationMenu orientation and direction', () => {
  const original = globalThis.ResizeObserver
  beforeAll(() => {
    globalThis.ResizeObserver = ReportingResizeObserver as never
  })
  afterAll(() => {
    globalThis.ResizeObserver = original
  })

  it('marks every part with the orientation and direction it runs in', async () => {
    render(
      <NavigationMenu defaultValue="learn" dir="rtl" orientation="vertical">
        <NavigationMenuList>
          <NavigationMenuItem value="learn">
            <NavigationMenuTrigger>Learn</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuSub defaultValue="basics" orientation="vertical">
                <NavigationMenuList>
                  <NavigationMenuItem value="basics">
                    <NavigationMenuTrigger>Basics</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <NavigationMenuLink href="#intro">Intro</NavigationMenuLink>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenuSub>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuIndicator />
        </NavigationMenuList>
        <NavigationMenuViewport />
      </NavigationMenu>,
    )
    await waitFor(() => document.querySelector('[data-slot="navigation-menu-indicator"]') ?? Promise.reject())
    const marks = (slot: string) =>
      Array.from(document.querySelectorAll(`[data-slot="navigation-menu${slot}"]`), (node) =>
        ['data-orientation', 'dir', 'aria-hidden'].map((name) => node.getAttribute(name)),
      )

    expect(
      Object.fromEntries(
        ['', '-list', '-content', '-sub', '-viewport', '-indicator'].map((slot) => [slot, marks(slot)]),
      ),
    ).toEqual({
      '': [['vertical', 'rtl', null]],
      '-list': [
        ['vertical', 'rtl', null],
        ['vertical', null, null],
      ],
      '-content': [
        ['vertical', 'rtl', null],
        ['vertical', 'rtl', null],
      ],
      '-sub': [['vertical', null, null]],
      '-viewport': [['vertical', null, null]],
      '-indicator': [['vertical', null, 'true']],
    })
  })
})
