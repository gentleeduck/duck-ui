import { cleanup, render, screen } from '@testing-library/react'
import * as React from 'react'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { DirectionProvider } from '../../direction'
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerTitle } from '../drawer'

const { matchMedia } = window

beforeEach(() => {
  const media = (query: string) => ({
    addEventListener: () => {},
    matches: false,
    media: query,
    removeEventListener: () => {},
  })
  Object.assign(globalThis, { matchMedia: media })
  Object.assign(window, { matchMedia: media })
})

afterEach(() => {
  cleanup()
  Object.assign(globalThis, { matchMedia })
  Object.assign(window, { matchMedia })
})

type Side = 'top' | 'bottom' | 'left' | 'right'

function Sheet({ side }: { side?: Side }) {
  return (
    <Drawer defaultOpen direction={side}>
      <DrawerContent overlayProps={{ className: 'backdrop-blur' }}>
        <DrawerTitle>Filters</DrawerTitle>
        <DrawerDescription>Narrow the ducks down.</DrawerDescription>
        <DrawerFooter>Apply</DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

const opensFrom = () => screen.getByRole('dialog').getAttribute('data-vaul-drawer-direction')

describe('registry-ui Drawer', () => {
  test('opens from the bottom by default, with the overlay it is handed', () => {
    render(<Sheet />)

    expect(opensFrom()).toBe('bottom')
    expect(document.querySelector('[data-slot="drawer-overlay"]')?.className).toContain('backdrop-blur')
  })

  test.each([
    ['left', 'right'],
    ['right', 'left'],
    ['top', 'top'],
  ] as const)(
    'opens a %s drawer from the %s in a right-to-left page, and lays its text out right to left',
    (side, from) => {
      render(
        <DirectionProvider dir="rtl">
          <Sheet side={side} />
        </DirectionProvider>,
      )

      expect(opensFrom()).toBe(from)
      for (const slot of ['drawer-content', 'drawer-title', 'drawer-description', 'drawer-footer']) {
        expect(document.querySelector(`[data-slot="${slot}"]`)?.getAttribute('dir')).toBe('rtl')
      }
    },
  )

  test('keeps a left drawer on the left in a left-to-right page', () => {
    render(<Sheet side="left" />)

    expect(opensFrom()).toBe('left')
  })
})
