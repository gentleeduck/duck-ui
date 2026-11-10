import { afterAll, afterEach, beforeAll, describe, expect, test } from 'bun:test'
import { act, cleanup, render, screen } from '@testing-library/react'
import { MotionNavigationMenu } from '../motion-navigation-menu'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '../navigation-menu'

// jsdom has no ResizeObserver; this one reports each element once, as a browser does when it starts observing.
beforeAll(() => {
  Object.assign(globalThis, {
    ResizeObserver: class {
      constructor(private readonly report: () => void) {}
      observe() {
        this.report()
      }
      unobserve() {}
      disconnect() {}
    },
  })
})
afterAll(() => {
  Reflect.deleteProperty(globalThis, 'ResizeObserver')
})
afterEach(cleanup)

const menu = (Root: typeof NavigationMenu, props: React.ComponentProps<typeof NavigationMenu> = {}) =>
  render(
    <Root defaultValue="learn" {...props}>
      <NavigationMenuList>
        <NavigationMenuItem value="learn">
          <NavigationMenuTrigger>Learn</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink active href="#docs">
              Docs
            </NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuIndicator />
      </NavigationMenuList>
    </Root>,
  )

const slot = (name: string) => document.querySelector<HTMLElement>(`[data-slot="${name}"]`) as HTMLElement
const classes = (element: Element) => element.className.split(' ')

const variables = (element: Element) => [...element.className.matchAll(/\((--[a-z-]+)\)/g)].map((match) => match[1])

describe('registry-ui navigation menu', () => {
  test('an active link is styled by the attribute the primitive sets', () => {
    menu(NavigationMenu)
    const link = screen.getByText('Docs')

    expect(link.getAttribute('data-active')).toBe('')
    expect(link.className).toContain('data-active:bg-accent/50')
    expect(link.className).not.toContain('data-[active=true]')
  })

  test('the viewport sizes itself from the variables the primitive writes', () => {
    menu(NavigationMenu)
    const viewport = document.querySelector<HTMLElement>('[data-slot="navigation-menu-viewport"]')
    const sizes = variables(viewport as HTMLElement).filter((name) => name.includes('viewport'))

    expect(sizes).toEqual([
      '--gentleduck-navigation-menu-viewport-height',
      '--gentleduck-navigation-menu-viewport-width',
    ])
    for (const name of sizes) expect(viewport?.style.getPropertyValue(name)).toMatch(/px$/)
  })

  test('the motion menu leaves the bar still and scales its viewport in, from the size the primitive writes', () => {
    const { container } = menu(MotionNavigationMenu)
    const root = slot('navigation-menu')
    const viewport = slot('navigation-menu-viewport')

    expect(container.firstElementChild).toBe(root)
    expect(root.getAttribute('data-viewport')).toBe('true')
    expect(root.getAttribute('style')).toBeNull()
    expect(viewport.style.opacity).toBe('0')
    expect(viewport.style.transform).toBe('scale(0.95)')
    expect(classes(viewport)).not.toContain('data-[state=open]:animate-in')
    expect(viewport.style.getPropertyValue('--gentleduck-navigation-menu-viewport-height')).toMatch(/px$/)
  })

  test('the motion viewport plays its exit before it leaves, and comes back for the next item', async () => {
    const tree = (value: string) => (
      <MotionNavigationMenu value={value}>
        <NavigationMenuList>
          <NavigationMenuItem value="learn">
            <NavigationMenuTrigger>Learn</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink href="#docs">Docs</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </MotionNavigationMenu>
    )
    const { rerender } = render(tree('learn'))

    rerender(tree(''))

    expect(slot('navigation-menu-viewport').getAttribute('data-state')).toBe('closed')
    expect(screen.getByText('Docs')).toBeTruthy()

    // The viewport waits out its 320ms exit spring.
    await act(() => new Promise((resolve) => setTimeout(resolve, 250)))
    const midExit = slot('navigation-menu-viewport') !== null
    await act(() => new Promise((resolve) => setTimeout(resolve, 120)))

    expect([midExit, slot('navigation-menu-viewport')]).toEqual([true, null])

    rerender(tree('learn'))

    expect(slot('navigation-menu-viewport').getAttribute('data-state')).toBe('open')
  })
})

describe('registry-ui navigation menu layout', () => {
  test('draws the indicator under the open trigger, with an arrow pointing up at it', () => {
    menu(NavigationMenu)
    const indicator = slot('navigation-menu-indicator')

    expect(indicator.getAttribute('data-state')).toBe('visible')
    expect(indicator.matches('.group\\/indicator[data-orientation="horizontal"]')).toBe(true)
    expect(classes(indicator)).toContain('top-full')
    expect(classes(indicator.firstElementChild as Element)).toContain('rounded-tl-sm')
  })

  test('without the viewport, draws the open content in its item', () => {
    menu(NavigationMenu, { viewport: false })

    expect(slot('navigation-menu').getAttribute('data-viewport')).toBe('false')
    expect(slot('navigation-menu-viewport')).toBeNull()
    expect(slot('navigation-menu-content').closest('[data-slot="navigation-menu-item"]')).not.toBeNull()
    expect(classes(slot('navigation-menu-content'))).toContain('group-data-[viewport=false]/navigation-menu:top-full')
  })

  test('a vertical menu stacks its list and opens to the side, keyed on the orientation the primitive writes', () => {
    menu(NavigationMenu, { orientation: 'vertical' })
    const root = slot('navigation-menu')
    const viewport = slot('navigation-menu-viewport')
    const indicator = slot('navigation-menu-indicator')
    const chevron = screen.getByText('Learn').querySelector('svg') as SVGElement

    expect(root.matches('.group\\/navigation-menu[data-orientation="vertical"]')).toBe(true)
    expect(slot('navigation-menu-list').getAttribute('data-orientation')).toBe('vertical')
    expect(classes(slot('navigation-menu-list'))).toContain('data-[orientation=vertical]:flex-col')
    expect(classes(screen.getByText('Learn'))).toContain('group-data-[orientation=vertical]/navigation-menu:w-full')
    expect(chevron.getAttribute('class')).toContain('ltr:group-data-[orientation=vertical]/navigation-menu:-rotate-90')
    expect(classes(viewport.parentElement as Element)).toContain(
      'group-data-[orientation=vertical]/navigation-menu:start-full',
    )
    expect(viewport.getAttribute('data-orientation')).toBe('vertical')
    expect(classes(viewport)).toContain('data-[orientation=vertical]:ms-1.5')
    expect(classes(viewport)).toContain('origin-top')
    expect(indicator.matches('.group\\/indicator[data-orientation="vertical"]')).toBe(true)
    expect(classes(indicator.firstElementChild as Element)).toContain(
      'group-data-[orientation=vertical]/indicator:start-[60%]',
    )
    expect(slot('navigation-menu-content').getAttribute('data-orientation')).toBe('vertical')
    expect(classes(slot('navigation-menu-content'))).toContain(
      'data-[orientation=vertical]:data-[motion=from-end]:slide-in-from-bottom-52',
    )
  })
})
