import * as DialogPrimitive from '@gentleduck/primitives/dialog'
import { DirectionProvider } from '@gentleduck/primitives/direction'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { MotionSheet, MotionSheetContent } from '../motion-sheet'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '../sheet'
import { sheetVariants } from '../sheet.constants'

afterEach(cleanup)

const wait = (ms: number) => act(() => new Promise<void>((resolve) => setTimeout(resolve, ms)))
const classes = () => screen.getByRole('dialog').className.split(' ')

function offscreen() {
  const [, axis, offset] = /^translate([XY])\((-?[\d.]+)%\)$/.exec(screen.getByRole('dialog').style.transform) ?? []
  return `${axis}${Math.round(Number(offset) / 100)}`
}

function renderOpen(children: React.ReactNode) {
  return renderToStaticMarkup(
    <DialogPrimitive.Root defaultOpen>
      <DialogPrimitive.Content>{children}</DialogPrimitive.Content>
    </DialogPrimitive.Root>,
  )
}

describe('registry-ui Sheet', () => {
  test('leaves the dialog primitives it is built from their own names', () => {
    expect(
      [DialogPrimitive.Root, DialogPrimitive.Trigger, DialogPrimitive.Close, DialogPrimitive.Portal].map(
        (component) => component.displayName,
      ),
    ).toEqual(['Dialog', 'DialogTrigger', 'DialogClose', 'DialogPortal'])
  })

  test('lays out its header and footer like the dialog', () => {
    const html = renderOpen(
      <>
        <SheetHeader>
          <SheetTitle>Pond rules</SheetTitle>
          <SheetDescription>No diving</SheetDescription>
        </SheetHeader>
        <SheetFooter className="mt-auto" />
      </>,
    )

    expect(html).toContain('<div class="flex flex-col space-y-2 text-center sm:text-start">')
    expect(html).toMatch(/<h2 [^>]*class="font-semibold text-foreground text-lg">Pond rules<\/h2>/)
    expect(html).toMatch(/<p [^>]*class="text-muted-foreground text-sm">No diving<\/p>/)
    expect(html).toContain('<div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end mt-auto"></div>')
  })

  test('slides in from the logical start or end, mirrored in RTL', () => {
    expect(sheetVariants({ side: 'left' })).toContain('start-0')
    expect(sheetVariants({ side: 'left' })).toContain('rtl:data-[state=open]:slide-in-from-right')
    expect(sheetVariants()).toContain('end-0')
  })

  test('lays its content out in a column, so its gap spaces the header, body and footer', () => {
    render(
      <Sheet defaultOpen>
        <SheetContent>
          <SheetTitle>Pond rules</SheetTitle>
          <SheetDescription>No diving</SheetDescription>
        </SheetContent>
      </Sheet>,
    )

    expect(screen.getByRole('dialog').className.split(' ')).toEqual(
      expect.arrayContaining(['flex', 'flex-col', 'gap-4']),
    )
  })

  test('lays the motion content out in a column too', async () => {
    render(
      <MotionSheet defaultOpen>
        <MotionSheetContent>
          <SheetTitle>Pond rules</SheetTitle>
          <SheetDescription>No diving</SheetDescription>
        </MotionSheetContent>
      </MotionSheet>,
    )
    await act(async () => {})

    expect(screen.getByRole('dialog').className.split(' ')).toEqual(
      expect.arrayContaining(['flex', 'flex-col', 'gap-4']),
    )
  })

  test('the trigger opens it, and its close button, named by closeText, closes it', () => {
    render(
      <Sheet>
        <SheetTrigger>Rules</SheetTrigger>
        <SheetContent closeText="Dismiss" side="top">
          <SheetTitle>Pond rules</SheetTitle>
        </SheetContent>
      </Sheet>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Rules' }))

    expect(classes()).toEqual(expect.arrayContaining(['inset-x-0', 'top-0', 'border-b']))

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }))

    expect(screen.queryByRole('dialog')).toBeNull()
  })

  test('hideClose leaves the closing to the content', () => {
    render(
      <Sheet defaultOpen>
        <SheetContent hideClose side="bottom">
          <SheetTitle>Pond rules</SheetTitle>
        </SheetContent>
      </Sheet>,
    )

    expect(screen.queryByRole('button', { name: 'Close' })).toBeNull()
    expect(classes()).toEqual(expect.arrayContaining(['inset-x-0', 'bottom-0', 'border-t']))
  })

  const edges: [string, 'top' | 'bottom', typeof Sheet, typeof SheetContent][] = [
    ['a top sheet', 'top', Sheet, SheetContent],
    ['a bottom sheet', 'bottom', Sheet, SheetContent],
    ['a top motion sheet', 'top', MotionSheet, MotionSheetContent],
    ['a bottom motion sheet', 'bottom', MotionSheet, MotionSheetContent],
  ]

  test.each(edges)(
    'keeps %s no taller than the screen, so a body given the rest of it scrolls',
    async (_, side, Root, Content) => {
      render(
        <Root defaultOpen>
          <Content side={side}>
            <SheetTitle>Pond rules</SheetTitle>
          </Content>
        </Root>,
      )
      await act(async () => {})

      expect(classes()).toContain('max-h-dvh')
    },
  )

  test('a sheet opened from a sheet leaves the dimming to the first overlay', () => {
    render(
      <Sheet defaultOpen>
        <SheetContent>
          <SheetTitle>Pond rules</SheetTitle>
          <Sheet defaultOpen>
            <SheetContent>
              <SheetTitle>Diving</SheetTitle>
            </SheetContent>
          </Sheet>
        </SheetContent>
      </Sheet>,
    )

    const overlays = Array.from(document.querySelectorAll('[data-slot="dialog-overlay"]'))

    expect(overlays.map((overlay) => overlay.hasAttribute('data-nested'))).toEqual([false, true])
    expect(overlays[1]?.className).toContain('data-[nested]:bg-transparent')
  })
})

describe('registry-ui MotionSheet', () => {
  const cases: [string, React.ReactElement, string[], string][] = [
    ['the right by default', <MotionSheetContent key="right" />, ['right-0', 'border-l'], 'X1'],
    ['the left when asked', <MotionSheetContent key="left" side="left" />, ['left-0', 'border-r'], 'X-1'],
    ['the top', <MotionSheetContent key="top" side="top" />, ['top-0', 'border-b'], 'Y-1'],
    ['the bottom', <MotionSheetContent key="bottom" side="bottom" />, ['bottom-0', 'border-t'], 'Y1'],
  ]

  test.each(cases)('slides in from %s', async (_, content, placed, from) => {
    render(<MotionSheet defaultOpen>{content}</MotionSheet>)
    await act(async () => {})

    expect(classes()).toEqual(expect.arrayContaining(placed))
    expect(offscreen()).toBe(from)
  })

  const mirrored: [string, React.ReactElement][] = [
    [
      'the root',
      <MotionSheet defaultOpen dir="rtl" key="root">
        <MotionSheetContent side="left" />
      </MotionSheet>,
    ],
    [
      'a provider',
      <DirectionProvider dir="rtl" key="provider">
        <MotionSheet defaultOpen>
          <MotionSheetContent side="left" />
        </MotionSheet>
      </DirectionProvider>,
    ],
    [
      'the content',
      <MotionSheet defaultOpen key="content">
        <MotionSheetContent dir="rtl" side="left" />
      </MotionSheet>,
    ],
  ]

  test.each(mirrored)('right-to-left from %s mirrors the start side to the right edge', async (_, tree) => {
    render(tree)
    await act(async () => {})

    expect(classes()).toEqual(expect.arrayContaining(['right-0', 'border-l']))
    expect(offscreen()).toBe('X1')
    expect(screen.getByRole('dialog').getAttribute('dir')).toBe('rtl')
  })

  test('right-to-left sends the end side to the left edge and leaves the top where it is', async () => {
    render(
      <MotionSheet defaultOpen dir="rtl">
        <MotionSheetContent />
      </MotionSheet>,
    )
    await act(async () => {})

    expect(classes()).toEqual(expect.arrayContaining(['left-0', 'border-r']))

    cleanup()
    render(
      <MotionSheet defaultOpen dir="rtl">
        <MotionSheetContent side="top" />
      </MotionSheet>,
    )
    await act(async () => {})

    expect(classes()).toEqual(expect.arrayContaining(['top-0', 'border-b']))
  })

  test('its close button, named by closeText, lets the overlay go through, then unmounts it after the exit', async () => {
    const onOpenChange = vi.fn()
    render(
      <MotionSheet defaultOpen onOpenChange={onOpenChange}>
        <MotionSheetContent closeText="Dismiss">
          <SheetTitle>Pond rules</SheetTitle>
        </MotionSheetContent>
      </MotionSheet>,
    )
    await act(async () => {})

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    await wait(50)

    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(screen.getByText('Pond rules')).toBeTruthy()
    expect((document.querySelector('[data-slot="dialog-overlay"]') as HTMLElement).style.pointerEvents).toBe('none')

    await wait(400)

    expect(screen.queryByText('Pond rules')).toBeNull()
  })

  test('jumps into place, as its overlay does, when the user asks for reduced motion', async () => {
    const matchMedia = window.matchMedia
    Object.assign(window, {
      matchMedia: (query: string) => ({
        addEventListener: () => {},
        matches: query === '(prefers-reduced-motion: reduce)',
        removeEventListener: () => {},
      }),
    })
    render(
      <MotionSheet defaultOpen>
        <MotionSheetContent />
      </MotionSheet>,
    )
    await act(async () => {})
    await wait(50)
    Object.assign(window, { matchMedia })

    expect(screen.getByRole('dialog').style.transform).toBe('none')
  })

  test('a motion sheet opened from a sheet leaves the dimming to the first overlay', async () => {
    render(
      <Sheet defaultOpen>
        <SheetContent>
          <SheetTitle>Pond rules</SheetTitle>
          <MotionSheet defaultOpen>
            <MotionSheetContent>
              <SheetTitle>Diving</SheetTitle>
            </MotionSheetContent>
          </MotionSheet>
        </SheetContent>
      </Sheet>,
    )
    await act(async () => {})

    const overlays = Array.from(document.querySelectorAll('[data-slot="dialog-overlay"]'))

    expect(overlays.map((overlay) => overlay.hasAttribute('data-nested'))).toEqual([false, true])
    expect(overlays[1]?.className).toContain('data-[nested]:bg-transparent')
  })

  test('hideClose drops its close button', async () => {
    render(
      <MotionSheet defaultOpen>
        <MotionSheetContent hideClose>
          <SheetTitle>Pond rules</SheetTitle>
        </MotionSheetContent>
      </MotionSheet>,
    )
    await act(async () => {})

    expect(screen.queryByRole('button', { name: 'Close' })).toBeNull()
  })

  test('keeps a closed sheet in the page with forceMount', () => {
    render(
      <Sheet>
        <SheetContent aria-describedby={undefined} forceMount>
          <SheetTitle>Kept</SheetTitle>
        </SheetContent>
      </Sheet>,
    )

    expect(document.querySelector('[role="dialog"]')?.getAttribute('data-state')).toBe('closed')
  })
})
