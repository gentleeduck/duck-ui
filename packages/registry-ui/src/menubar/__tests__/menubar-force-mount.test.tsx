import { afterEach, describe, expect, test } from 'bun:test'
import { cleanup, render } from '@testing-library/react'
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from '../menubar'

afterEach(cleanup)

describe('registry-ui menubar forceMount', () => {
  test('keeps the content in the page while closed, marked closed, for an exit animation to run on', () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent forceMount>
            <MenubarItem>New</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    )

    expect(document.querySelector('[role="menu"]')?.getAttribute('data-state')).toBe('closed')
  })
})
