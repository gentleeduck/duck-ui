// From React Aria, packages/react-aria-components/test/Dialog.test.js. Apache 2.0, see
// src/__tests__/react-aria/LICENSE; changed to drive this dialog and dropdown menu, its React Aria parts taken out.
// Left out: a dialog named by its trigger, where this one is named by its title; onEnter and onExit, and the
// PortalProvider, which have no counterpart here.

import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { describe, expect, it } from 'vitest'
import { freshDom, wait } from '../../__tests__/dom'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from '../../dropdown-menu'
import { Dialog, DialogContent, DialogOverlay, DialogPortal, DialogTitle } from '../index'

freshDom()

describe('React Aria dialog', () => {
  it('keeps focus on the field it opens with when a menu item opens it from the keyboard', async () => {
    const user = userEvent.setup()
    function App() {
      const [open, setOpen] = React.useState(false)
      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
            <DropdownMenuPortal>
              <DropdownMenuContent>
                <DropdownMenuItem onSelect={() => setOpen(true)}>Add account</DropdownMenuItem>
                <DropdownMenuItem>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenuPortal>
          </DropdownMenu>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogPortal>
              <DialogOverlay />
              <DialogContent aria-describedby={undefined}>
                <DialogTitle>Sign up</DialogTitle>
                {/* biome-ignore lint/a11y/noAutofocus: the field the dialog opens on is what this case is about */}
                <input aria-label="Email" autoFocus />
                <input aria-label="Password" />
              </DialogContent>
            </DialogPortal>
          </Dialog>
        </>
      )
    }
    render(<App />)
    await user.tab()

    await user.keyboard('{Enter}')
    await wait(0)
    await user.keyboard('{Enter}')
    await wait(0)

    expect(document.activeElement).toBe(screen.getByLabelText('Email'))
  })

  it('renders into the container its portal names', async () => {
    const container = document.body.appendChild(document.createElement('div'))
    render(
      <Dialog defaultOpen>
        <DialogPortal container={container}>
          <DialogContent aria-describedby={undefined}>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </DialogPortal>
      </Dialog>,
    )
    await wait(0)

    expect(container.querySelector('[role="dialog"]')).not.toBeNull()
    act(() => void fireEvent.keyDown(document.body, { key: 'Escape' }))
    container.remove()
  })
})
