import { afterEach, describe, expect, it, mock } from 'bun:test'
import { fireEvent, render } from '@testing-library/react'
import * as React from 'react'
import { DirectionProvider } from '../../direction'
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarPortal,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from '../index'

function renderMenubar() {
  return render(
    <Menubar>
      <MenubarMenu value="file">
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarPortal>
          <MenubarContent>
            <MenubarItem>New</MenubarItem>
            <MenubarItem>Open</MenubarItem>
          </MenubarContent>
        </MenubarPortal>
      </MenubarMenu>
      <MenubarMenu value="edit">
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarPortal>
          <MenubarContent>
            <MenubarItem>Undo</MenubarItem>
            <MenubarItem>Redo</MenubarItem>
          </MenubarContent>
        </MenubarPortal>
      </MenubarMenu>
    </Menubar>,
  )
}

describe('Menubar', () => {
  it('renders with data-slot="menubar"', () => {
    const { container } = renderMenubar()
    expect(container.querySelector('[data-slot="menubar"]')).not.toBeNull()
  })

  it('renders triggers with data-slot="menubar-trigger"', () => {
    const { container } = renderMenubar()
    expect(container.querySelectorAll('[data-slot="menubar-trigger"]').length).toBe(2)
  })

  it('triggers have role="menuitem"', () => {
    const { container } = renderMenubar()
    const triggers = container.querySelectorAll('[data-slot="menubar-trigger"]')
    for (const t of triggers) {
      expect(t.getAttribute('role')).toBe('menuitem')
    }
  })

  it('triggers have aria-haspopup="menu"', () => {
    const { container } = renderMenubar()
    const trigger = container.querySelector('[data-slot="menubar-trigger"]')!
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu')
  })

  it('triggers start closed', () => {
    const { container } = renderMenubar()
    const triggers = container.querySelectorAll('[data-slot="menubar-trigger"]')
    for (const t of triggers) {
      expect(t.getAttribute('data-state')).toBe('closed')
      expect(t.getAttribute('aria-expanded')).toBe('false')
    }
  })

  it('triggers have type="button"', () => {
    const { container } = renderMenubar()
    const trigger = container.querySelector('[data-slot="menubar-trigger"]')!
    expect(trigger.getAttribute('type')).toBe('button')
  })

  it('opens on Enter key', () => {
    const { container } = renderMenubar()
    const trigger = container.querySelector('[data-slot="menubar-trigger"]')!
    fireEvent.keyDown(trigger, { key: 'Enter' })
    expect(trigger.getAttribute('data-state')).toBe('open')
  })

  it('opens on Space key', () => {
    const { container } = renderMenubar()
    const trigger = container.querySelector('[data-slot="menubar-trigger"]')!
    fireEvent.keyDown(trigger, { key: ' ' })
    expect(trigger.getAttribute('data-state')).toBe('open')
  })

  it('opens on ArrowDown key', () => {
    const { container } = renderMenubar()
    const trigger = container.querySelector('[data-slot="menubar-trigger"]')!
    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    expect(trigger.getAttribute('data-state')).toBe('open')
  })

  it('forwards ref', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(
      <Menubar ref={ref}>
        <MenubarMenu value="f">
          <MenubarTrigger>File</MenubarTrigger>
        </MenubarMenu>
      </Menubar>,
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})

const mounted: Array<() => void> = []

function renderNestedMenubar(dir?: 'ltr' | 'rtl') {
  const menubar = (
    <Menubar>
      <MenubarMenu value="archive">
        <MenubarTrigger>Archive</MenubarTrigger>
        <MenubarPortal>
          <MenubarContent>
            <MenubarItem>Create</MenubarItem>
            <MenubarSub>
              <MenubarSubTrigger>Forward</MenubarSubTrigger>
              <MenubarPortal>
                <MenubarSubContent>
                  <MenubarItem>Mail</MenubarItem>
                </MenubarSubContent>
              </MenubarPortal>
            </MenubarSub>
          </MenubarContent>
        </MenubarPortal>
      </MenubarMenu>
      <MenubarMenu value="modify">
        <MenubarTrigger>Modify</MenubarTrigger>
        <MenubarPortal>
          <MenubarContent>
            <MenubarItem>Revert</MenubarItem>
          </MenubarContent>
        </MenubarPortal>
      </MenubarMenu>
      <MenubarMenu value="display">
        <MenubarTrigger>Display</MenubarTrigger>
        <MenubarPortal>
          <MenubarContent>
            <MenubarItem>Magnify</MenubarItem>
          </MenubarContent>
        </MenubarPortal>
      </MenubarMenu>
    </Menubar>
  )
  const utils = render(dir ? <DirectionProvider dir={dir}>{menubar}</DirectionProvider> : menubar)
  mounted.push(utils.unmount)
  const triggerState = (label: string) =>
    utils.getByText(label, { selector: '[data-slot="menubar-trigger"]' }).getAttribute('data-state')
  fireEvent.keyDown(utils.getByText('Archive', { selector: '[data-slot="menubar-trigger"]' }), { key: 'Enter' })
  return { ...utils, triggerState }
}

describe('Menubar keyboard direction', () => {
  afterEach(() => {
    for (const unmount of mounted.splice(0)) unmount()
  })

  it('moves to the next menu with ArrowRight in LTR', () => {
    const { getByText, triggerState } = renderNestedMenubar()
    fireEvent.keyDown(getByText('Create'), { key: 'ArrowRight' })
    expect(triggerState('Modify')).toBe('open')
  })

  it('moves to the next menu with ArrowLeft in RTL', () => {
    const { getByText, triggerState } = renderNestedMenubar('rtl')
    fireEvent.keyDown(getByText('Create'), { key: 'ArrowLeft' })
    expect(triggerState('Modify')).toBe('open')
  })

  it('moves to the previous menu with ArrowRight in RTL', () => {
    const { getByText, triggerState } = renderNestedMenubar('rtl')
    fireEvent.keyDown(getByText('Create'), { key: 'ArrowRight' })
    expect(triggerState('Display')).toBe('open')
  })

  it('opens a submenu with ArrowLeft in RTL without leaving the menu', () => {
    const { getByText, queryByText, triggerState } = renderNestedMenubar('rtl')
    fireEvent.keyDown(getByText('Forward'), { key: 'ArrowLeft' })
    expect(triggerState('Archive')).toBe('open')
    expect(queryByText('Mail')).not.toBeNull()
  })

  it('places the submenu on the left in RTL', () => {
    const { getByText } = renderNestedMenubar('rtl')
    fireEvent.keyDown(getByText('Forward'), { key: 'ArrowLeft' })
    const subContent = getByText('Mail').closest('[role="menu"]')
    expect(subContent?.getAttribute('dir')).toBe('rtl')
    expect(subContent?.getAttribute('data-side')).toBe('left')
  })

  it('closes a submenu with ArrowRight in RTL without leaving the menu', () => {
    const { getByText, queryByText, triggerState } = renderNestedMenubar('rtl')
    fireEvent.keyDown(getByText('Forward'), { key: 'ArrowLeft' })
    fireEvent.keyDown(getByText('Mail'), { key: 'ArrowRight' })
    expect(triggerState('Archive')).toBe('open')
    expect(queryByText('Mail')).toBeNull()
  })

  it('closes a submenu with ArrowLeft in LTR without leaving the menu', () => {
    const { getByText, queryByText, triggerState } = renderNestedMenubar()
    fireEvent.keyDown(getByText('Forward'), { key: 'ArrowRight' })
    fireEvent.keyDown(getByText('Mail'), { key: 'ArrowLeft' })
    expect(triggerState('Archive')).toBe('open')
    expect(queryByText('Mail')).toBeNull()
  })
})
