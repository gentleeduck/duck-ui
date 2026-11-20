import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test } from 'vitest'
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from '../menubar'

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

  test('mounts no closed submenu along with it, and leaves focus where it was', () => {
    function Bar({ mounted }: { mounted: boolean }) {
      return (
        <>
          <input aria-label="Name" />
          {mounted && (
            <Menubar>
              <MenubarMenu>
                <MenubarTrigger>File</MenubarTrigger>
                <MenubarContent forceMount>
                  <MenubarItem>New</MenubarItem>
                  <MenubarSub>
                    <MenubarSubTrigger>Share</MenubarSubTrigger>
                    <MenubarSubContent>
                      <MenubarItem>Mail</MenubarItem>
                    </MenubarSubContent>
                  </MenubarSub>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
          )}
        </>
      )
    }
    const { rerender } = render(<Bar mounted={false} />)
    const field = screen.getByLabelText('Name')
    act(() => field.focus())

    rerender(<Bar mounted />)

    expect([screen.queryByText('New') !== null, screen.queryByText('Mail'), document.activeElement === field]).toEqual([
      true,
      null,
      true,
    ])
  })
})
