import { afterEach, describe, expect, test } from 'bun:test'
import { cleanup, render } from '@testing-library/react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../tooltip'

afterEach(cleanup)

describe('registry-ui tooltip forceMount', () => {
  test('keeps the content in the page while closed, marked closed, for an exit animation to run on', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Save</TooltipTrigger>
          <TooltipContent forceMount>Saves the file</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    )

    expect(document.querySelector('[data-slot="tooltip-content"]')?.getAttribute('data-state')).toBe('closed')
  })
})
