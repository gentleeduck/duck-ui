import { afterEach, describe, expect, test } from 'bun:test'
import { cleanup, render } from '@testing-library/react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../dropdown-menu'

afterEach(cleanup)

describe('registry-ui dropdown-menu forceMount', () => {
  test('keeps the content in the page while closed, marked closed, for an exit animation to run on', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent forceMount>
          <DropdownMenuItem>Copy</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )

    expect(document.querySelector('[role="menu"]')?.getAttribute('data-state')).toBe('closed')
  })
})
