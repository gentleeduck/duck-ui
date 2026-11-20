import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, test } from 'vitest'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '../context-menu'

afterEach(cleanup)

describe('registry-ui context-menu forceMount', () => {
  test('keeps the content in the page while closed, marked closed, for an exit animation to run on', () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger>Area</ContextMenuTrigger>
        <ContextMenuContent forceMount>
          <ContextMenuItem>Copy</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    )

    expect(document.querySelector('[role="menu"]')?.getAttribute('data-state')).toBe('closed')
  })
})
