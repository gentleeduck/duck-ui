import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import * as React from 'react'
import { afterEach, describe, expect, test } from 'vitest'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../alert-dialog'
import { MotionAlertDialog, MotionAlertDialogContent } from '../motion-alert-dialog'

afterEach(cleanup)

function Drain({ defaultOpen }: { defaultOpen?: boolean }) {
  return (
    <MotionAlertDialog defaultOpen={defaultOpen}>
      <AlertDialogTrigger>Drain</AlertDialogTrigger>
      <MotionAlertDialogContent className="max-w-sm">
        <AlertDialogTitle>Drain the pond?</AlertDialogTitle>
        <AlertDialogDescription>The ducks will notice.</AlertDialogDescription>
        <AlertDialogCancel>Keep it</AlertDialogCancel>
      </MotionAlertDialogContent>
    </MotionAlertDialog>
  )
}

describe('registry-ui MotionAlertDialog', () => {
  test('mounts nothing while closed, and opens as an alert dialog named by its title', () => {
    render(<Drain />)
    expect(screen.queryByRole('alertdialog')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Drain' }))

    const dialog = screen.getByRole('alertdialog', { name: 'Drain the pond?' })
    expect(dialog.className).toContain('max-w-sm')
    expect(dialog.getAttribute('aria-describedby')).toBe(screen.getByText('The ducks will notice.').id)
  })

  test('stays mounted while it animates out, and is gone after', async () => {
    render(<Drain defaultOpen />)
    const dialogs = () => document.querySelectorAll('[role="alertdialog"]')

    fireEvent.click(screen.getByRole('button', { name: 'Keep it' }))

    expect(dialogs()[0]?.getAttribute('data-state')).toBe('closed')
    await waitFor(() => expect(dialogs().length).toBe(0))
  })
})

describe('registry-ui AlertDialog container', () => {
  test.each([
    ['AlertDialogContent', AlertDialog, AlertDialogContent],
    ['MotionAlertDialogContent', MotionAlertDialog, MotionAlertDialogContent],
  ] as const)('%s portals into the element it is given', (_, Root, Content) => {
    const element = document.createElement('section')
    document.body.append(element)
    render(
      <Root defaultOpen>
        <Content aria-describedby={undefined} container={element}>
          <AlertDialogTitle>Drain the pond?</AlertDialogTitle>
        </Content>
      </Root>,
    )

    expect(element.contains(screen.getByText('Drain the pond?'))).toBe(true)
    element.remove()
  })
})
