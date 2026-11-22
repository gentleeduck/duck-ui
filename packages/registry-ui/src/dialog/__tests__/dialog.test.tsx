import * as DialogPrimitive from '@gentleduck/primitives/dialog'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, test } from 'vitest'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../dialog'
import { dialogStackStyle } from '../dialog.constants'
import { MotionDialog, MotionDialogContent } from '../motion-dialog'

afterEach(cleanup)

function renderOpen(children: React.ReactNode) {
  return renderToStaticMarkup(
    <DialogPrimitive.Root defaultOpen>
      <DialogPrimitive.Content>{children}</DialogPrimitive.Content>
    </DialogPrimitive.Root>,
  )
}

describe('registry-ui Dialog', () => {
  test('draws its header, title and description', () => {
    const html = renderOpen(
      <DialogHeader>
        <DialogTitle className="italic">Pond rules</DialogTitle>
        <DialogDescription>No diving</DialogDescription>
      </DialogHeader>,
    )

    expect(html).toContain('<div class="flex flex-col space-y-1.5 text-center sm:text-start">')
    expect(html).toMatch(/<h2 [^>]*class="font-semibold text-lg leading-none tracking-tight italic">Pond rules<\/h2>/)
    expect(html).toMatch(/<p [^>]*class="text-muted-foreground text-sm">No diving<\/p>/)
  })

  test('stacks the footer actions apart on small screens and rows them from sm up', () => {
    const html = renderOpen(<DialogFooter className="pt-2" />)

    expect(html).toContain('<div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-2"></div>')
  })
})

describe('registry-ui Dialog opened from another', () => {
  test.each([
    ['Dialog', Dialog, DialogContent],
    ['MotionDialog', MotionDialog, MotionDialogContent],
  ] as const)('%s clears the nested overlay and steps the one under it back', (_, Root, Content) => {
    render(
      <Root defaultOpen>
        <Content aria-label="Outer" aria-describedby={undefined}>
          <Root defaultOpen>
            <Content aria-label="Inner" aria-describedby={undefined} />
          </Root>
        </Content>
      </Root>,
    )

    const nestedOverlay = document.querySelector('[data-slot="dialog-overlay"][data-nested]')
    const holding = document.querySelector('[data-nested-dialog-open]')
    expect(nestedOverlay?.classList.contains('data-[nested]:bg-transparent')).toBe(true)
    expect(holding?.getAttribute('aria-label')).toBe('Outer')
    expect(dialogStackStyle.split(' ').every((name) => holding?.classList.contains(name))).toBe(true)
  })

  test('keeps a closed dialog in the page with forceMount, as its overlay too', () => {
    render(
      <Dialog>
        <DialogContent aria-describedby={undefined} forceMount>
          <DialogTitle>Kept</DialogTitle>
        </DialogContent>
      </Dialog>,
    )

    const overlay = document.querySelector('[data-slot="dialog-overlay"]')

    // Its exit fade holds its end and lets presses through, or the kept overlay would cover the page once it ends.
    expect([
      document.querySelector('[role="dialog"]')?.getAttribute('data-state'),
      overlay?.getAttribute('data-state'),
      ['data-[state=closed]:pointer-events-none', 'data-[state=closed]:fill-mode-forwards'].every((name) =>
        overlay?.classList.contains(name),
      ),
    ]).toEqual(['closed', 'closed', true])
  })
})

describe('registry-ui MotionDialog closing', () => {
  test('draws nothing closed, and holds its content in the page, taking no presses, until the exit ends', async () => {
    const view = (open: boolean) => (
      <MotionDialog open={open}>
        <MotionDialogContent aria-describedby={undefined}>
          <DialogTitle>Pond</DialogTitle>
        </MotionDialogContent>
      </MotionDialog>
    )
    const { rerender } = render(view(false))
    expect(screen.queryByText('Pond')).toBeNull()

    rerender(view(true))
    rerender(view(false))

    const content = screen.getByText('Pond').closest('[role="dialog"]') as HTMLElement
    const overlay = document.querySelector('[data-slot="dialog-overlay"]') as HTMLElement
    await waitFor(() => expect([content.style.pointerEvents, overlay.style.pointerEvents]).toEqual(['none', 'none']))
    await waitFor(() => expect(screen.queryByText('Pond')).toBeNull(), { timeout: 3000 })
  })
})

describe('registry-ui Dialog container', () => {
  test.each([
    ['DialogContent', Dialog, DialogContent],
    ['MotionDialogContent', MotionDialog, MotionDialogContent],
  ] as const)('%s portals into the element it is given', (_, Root, Content) => {
    const element = document.createElement('section')
    document.body.append(element)
    render(
      <Root defaultOpen>
        <Content aria-describedby={undefined} container={element}>
          <DialogTitle>Pond</DialogTitle>
        </Content>
      </Root>,
    )

    expect(element.contains(screen.getByText('Pond'))).toBe(true)
    element.remove()
  })
})
