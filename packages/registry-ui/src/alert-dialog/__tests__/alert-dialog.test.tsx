import { afterEach, describe, expect, test } from 'bun:test'
import * as AlertDialogPrimitive from '@gentleduck/primitives/alert-dialog'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../alert-dialog'

afterEach(cleanup)

function renderOpen(children: React.ReactNode) {
  return renderToStaticMarkup(
    <AlertDialogPrimitive.Root defaultOpen>
      <AlertDialogPrimitive.Content>{children}</AlertDialogPrimitive.Content>
    </AlertDialogPrimitive.Root>,
  )
}

describe('registry-ui AlertDialog', () => {
  test('draws the action as the default button and the cancel as the outline one', () => {
    const html = renderOpen(
      <>
        <AlertDialogTitle>Drain the pond?</AlertDialogTitle>
        <AlertDialogDescription>The ducks will notice.</AlertDialogDescription>
        <AlertDialogCancel>Keep it</AlertDialogCancel>
        <AlertDialogAction className="w-full">Drain</AlertDialogAction>
      </>,
    )

    expect(html).toMatch(/<button [^>]*class="[^"]*border border-input bg-background [^"]*">Keep it<\/button>/)
    expect(html).toMatch(/<button [^>]*class="[^"]*bg-primary text-primary-foreground [^"]* w-full">Drain<\/button>/)
  })

  test('is an alert dialog with its title and description drawn', () => {
    const html = renderOpen(
      <>
        <AlertDialogTitle>Drain the pond?</AlertDialogTitle>
        <AlertDialogDescription>The ducks will notice.</AlertDialogDescription>
      </>,
    )

    expect(html).toMatch(/role="alertdialog"/)
    expect(html).toMatch(/<h2 [^>]*class="font-semibold text-lg">Drain the pond\?<\/h2>/)
    expect(html).toMatch(/<p [^>]*class="text-muted-foreground text-sm">The ducks will notice\.<\/p>/)
  })

  test('stacks the header centred on small screens and starts it at the reading edge from sm up', () => {
    const html = renderOpen(<AlertDialogHeader className="pb-2" />)

    expect(html).toContain('<div class="flex flex-col space-y-2 text-center sm:text-start pb-2"></div>')
  })

  test('stacks the footer actions apart on small screens and rows them from sm up', () => {
    const html = renderOpen(<AlertDialogFooter className="pt-2" />)

    expect(html).toContain('<div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-2"></div>')
  })

  test('focuses the element initialFocus names on open in place of the cancel button', async () => {
    const Confirm = () => {
      const field = React.useRef<HTMLInputElement>(null)
      return (
        <AlertDialog>
          <AlertDialogTrigger>Delete</AlertDialogTrigger>
          <AlertDialogContent initialFocus={field}>
            <AlertDialogTitle>Delete the pond?</AlertDialogTitle>
            <AlertDialogDescription>Type its name to confirm.</AlertDialogDescription>
            <input aria-label="Pond name" ref={field} />
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction>Delete</AlertDialogAction>
          </AlertDialogContent>
        </AlertDialog>
      )
    }
    render(<Confirm />)

    act(() => screen.getByText('Delete').focus())
    fireEvent.click(screen.getByText('Delete'))
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)))

    expect(document.activeElement).toBe(screen.getByLabelText('Pond name'))
  })
})
