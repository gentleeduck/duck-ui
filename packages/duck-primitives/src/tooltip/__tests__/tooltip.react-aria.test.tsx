// From React Aria, packages/react-aria-components/test/Tooltip.test.js. Apache 2.0, see
// src/__tests__/react-aria/LICENSE; changed to drive this tooltip, its React Aria parts and render props taken out.
// Left out: its PortalProvider, Focusable and Pressable, which have no counterpart here.

import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { freshDom, wait } from '../../__tests__/dom'
import { Tooltip, TooltipContent, TooltipPortal, TooltipProvider, TooltipTrigger } from '../index'

freshDom()

describe('React Aria tooltip', () => {
  it('shows on focus from the keyboard', async () => {
    render(
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger>Edit</TooltipTrigger>
          <TooltipPortal>
            <TooltipContent>Change the name</TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </TooltipProvider>,
    )
    fireEvent.keyDown(document.body, { key: 'Tab' })

    act(() => screen.getByText('Edit').focus())
    await wait(0)

    expect(screen.getByRole('tooltip').textContent).toBe('Change the name')
  })

  it('hides once the page under its trigger scrolls', async () => {
    render(
      <TooltipProvider delayDuration={0}>
        <div data-testid="scroller">
          <Tooltip defaultOpen>
            <TooltipTrigger>Edit</TooltipTrigger>
            <TooltipPortal>
              <TooltipContent>Change the name</TooltipContent>
            </TooltipPortal>
          </Tooltip>
        </div>
      </TooltipProvider>,
    )
    await wait(0)

    fireEvent.scroll(screen.getByTestId('scroller'))
    await wait(0)

    expect(screen.queryByRole('tooltip')).toBeNull()
  })

  it('renders into the container its portal names', async () => {
    const container = document.body.appendChild(document.createElement('div'))
    render(
      <TooltipProvider delayDuration={0}>
        <Tooltip defaultOpen>
          <TooltipTrigger>Edit</TooltipTrigger>
          <TooltipPortal container={container}>
            <TooltipContent>Change the name</TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </TooltipProvider>,
    )
    await wait(0)

    expect(container.querySelector('[role="tooltip"]')?.textContent).toBe('Change the name')
    container.remove()
  })
})
