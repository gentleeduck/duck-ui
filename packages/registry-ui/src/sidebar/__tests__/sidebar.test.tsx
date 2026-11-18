import { describe, expect, test } from 'bun:test'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { DirectionProvider } from '../../direction'
import { Sidebar, SidebarTrigger } from '../sidebar'
import { getPhysicalSidebarSide } from '../sidebar.constants'
import { SidebarContext } from '../sidebar.hooks'

const sidebarContextValue = {
  state: 'expanded' as const,
  open: true,
  setOpen: () => {},
  openMobile: false,
  setOpenMobile: () => {},
  isMobile: false,
  toggleSidebar: () => {},
  dir: 'ltr' as const,
}

describe('registry-ui sidebar', () => {
  test('SidebarTrigger prefers a provided icon over the default panel icon', () => {
    const html = renderToStaticMarkup(
      <SidebarContext.Provider value={sidebarContextValue}>
        <SidebarTrigger icon={<span data-icon="custom">C</span>} />
      </SidebarContext.Provider>,
    )

    expect(html).toContain('data-icon="custom"')
    expect(html).not.toContain('lucide-panel-left')
  })

  test('SidebarTrigger still renders the default panel icon when no icon is provided', () => {
    const html = renderToStaticMarkup(
      <SidebarContext.Provider value={sidebarContextValue}>
        <SidebarTrigger />
      </SidebarContext.Provider>,
    )

    expect(html).toContain('lucide-panel-left')
  })

  test('getPhysicalSidebarSide treats `side` as flow-relative', () => {
    expect(getPhysicalSidebarSide('left', 'ltr')).toBe('left')
    expect(getPhysicalSidebarSide('right', 'ltr')).toBe('right')
    expect(getPhysicalSidebarSide('left', 'rtl')).toBe('right')
    expect(getPhysicalSidebarSide('right', 'rtl')).toBe('left')
  })

  test('Sidebar pins itself with logical insets so an RTL ancestor mirrors it', () => {
    const html = renderToStaticMarkup(
      <DirectionProvider dir="rtl">
        <SidebarContext.Provider value={{ ...sidebarContextValue, dir: 'rtl' }}>
          <Sidebar>content</Sidebar>
        </SidebarContext.Provider>
      </DirectionProvider>,
    )

    expect(html).toContain('data-side="left"')
    expect(html).toContain('dir="rtl"')
    expect(html).toContain('data-[side=left]:start-0')
    expect(html).toContain('group-data-[side=left]:border-e')
    expect(html).not.toContain('data-[side=left]:left-0')
  })
})
