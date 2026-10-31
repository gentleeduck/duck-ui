import { afterEach, describe, expect, test } from 'bun:test'
import * as DialogPrimitive from '@gentleduck/primitives/dialog'
import { cleanup, render } from '@testing-library/react'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
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
})
