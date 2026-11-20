// From Base UI, packages/react/src/popover/{root,title,description,trigger}/*.test.tsx. MIT, see
// src/__tests__/base-ui/LICENSE. Base UI's Popup is the content here. Left out: its handles, detached triggers, the
// payload, `openOnHover`, `keepMounted`, the backdrop, toolbars and cancelable event details, which have no
// counterpart.

import { act, fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import { describe, expect, it } from 'vitest'
import { clickOutside, freshDom, wait } from '../../__tests__/dom'
import { Dialog, DialogContent, DialogPortal, DialogTitle } from '../../dialog'
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverPortal,
  PopoverTitle,
  PopoverTrigger,
} from '../index'

freshDom()

const panel = () => screen.queryByRole('dialog', { name: 'Settings', hidden: true })

function Content() {
  return (
    <PopoverPortal>
      <PopoverContent>
        <PopoverTitle>Settings</PopoverTitle>
        <PopoverDescription>Change how it looks.</PopoverDescription>
        <PopoverClose>Close</PopoverClose>
      </PopoverContent>
    </PopoverPortal>
  )
}

describe('Base UI popover parts', () => {
  it('is named by its title and described by its description', async () => {
    render(
      <Popover defaultOpen>
        <PopoverTrigger>Open</PopoverTrigger>
        <Content />
      </Popover>,
    )
    await wait(0)
    const dialog = panel()

    expect(document.getElementById(dialog?.getAttribute('aria-describedby') ?? '')?.textContent).toBe(
      'Change how it looks.',
    )
  })
})

describe('Base UI popover focus', () => {
  it('gives focus back to its trigger on close after opening from code while the page held focus', async () => {
    function Example() {
      const [open, setOpen] = React.useState(false)
      return (
        <>
          <button type="button" onClick={() => setOpen(true)} tabIndex={-1}>
            Open from code
          </button>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger>Open</PopoverTrigger>
            <Content />
          </Popover>
        </>
      )
    }
    render(<Example />)
    fireEvent.click(screen.getByText('Open from code'))
    await wait(0)

    fireEvent.click(screen.getByText('Close'))
    await wait(0)

    expect(document.activeElement?.textContent).toBe('Open')
  })

  it('gives focus back to what held it before once its trigger unmounts while open', async () => {
    function Example() {
      const [withTrigger, setWithTrigger] = React.useState(true)
      return (
        <>
          <button type="button">Before</button>
          <button type="button" onClick={() => setWithTrigger(false)}>
            Drop trigger
          </button>
          <Popover>
            {withTrigger ? <PopoverTrigger>Open</PopoverTrigger> : null}
            <Content />
          </Popover>
        </>
      )
    }
    render(<Example />)
    act(() => screen.getByText('Open').focus())
    fireEvent.click(screen.getByText('Open'))
    await wait(0)

    fireEvent.click(screen.getByText('Drop trigger'))
    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' })
    await wait(0)

    expect(document.activeElement).not.toBeNull()
    expect(document.activeElement?.isConnected).toBe(true)
  })
})

describe('Base UI popover dismissal', () => {
  it('closes on a press inside a modal dialog opened before it outside its React tree', async () => {
    render(
      <>
        <Dialog defaultOpen>
          <DialogPortal>
            <DialogContent aria-describedby={undefined}>
              <DialogTitle>Dialog</DialogTitle>
              <button type="button">Inside the dialog</button>
            </DialogContent>
          </DialogPortal>
        </Dialog>
        <Popover defaultOpen>
          <PopoverTrigger>Open</PopoverTrigger>
          <Content />
        </Popover>
      </>,
    )
    await wait(0)

    await clickOutside(screen.getByText('Inside the dialog'))

    expect(panel()).toBeNull()
  })
})
