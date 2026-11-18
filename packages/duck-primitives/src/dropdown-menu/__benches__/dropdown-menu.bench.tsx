import { Menu as Ark } from '@ark-ui/react/menu'
import { Portal as ArkPortal } from '@ark-ui/react/portal'
import { Menu as Base } from '@base-ui-components/react/menu'
import * as Duck from '@gentleduck/primitives/dropdown-menu'
import { MenuItem as HeadlessItem, Menu as HeadlessMenu, MenuButton, MenuItems } from '@headlessui/react'
import * as Radix from '@radix-ui/react-dropdown-menu'
import { Button, Menu, MenuItem, MenuTrigger, Popover } from 'react-aria-components'
import type { IBench } from '../../__benches__/bench.types'
import { MENU_ITEMS } from '../../__benches__/fixtures'

const tree =
  (M: IBench.Parts<'Content' | 'Item' | 'Portal' | 'Root' | 'Trigger'>): IBench.View =>
  (on) => (
    <M.Root open={on}>
      <M.Trigger>open</M.Trigger>
      <M.Portal>
        <M.Content data-bench-content="">
          {MENU_ITEMS.map((v) => (
            <M.Item key={v}>{v}</M.Item>
          ))}
        </M.Content>
      </M.Portal>
    </M.Root>
  )

export default {
  name: 'Dropdown Menu',
  note: 'Headless UI has no controlled open state, so its copies are timed mounting and unmounting closed, and no more.',
  size: {
    radix: '@radix-ui/react-dropdown-menu',
    baseui: '@base-ui-components/react/menu',
    'react-aria': { names: ['MenuTrigger', 'Popover', 'Menu', 'MenuItem', 'Button'], from: 'react-aria-components' },
    ark: ['@ark-ui/react/menu', '@ark-ui/react/portal'],
    headless: { names: ['Menu', 'MenuButton', 'MenuItems', 'MenuItem'], from: '@headlessui/react' },
  },
  runtime: {
    overlay: true,
    closedOnly: ['headless'],
    view: {
      duck: tree(Duck),
      radix: tree(Radix),
      baseui: (on) => (
        <Base.Root open={on}>
          <Base.Trigger>open</Base.Trigger>
          <Base.Portal>
            <Base.Positioner>
              <Base.Popup data-bench-content="">
                {MENU_ITEMS.map((v) => (
                  <Base.Item key={v}>{v}</Base.Item>
                ))}
              </Base.Popup>
            </Base.Positioner>
          </Base.Portal>
        </Base.Root>
      ),
      'react-aria': (on) => (
        <MenuTrigger isOpen={on}>
          <Button>open</Button>
          <Popover>
            <Menu data-bench-content="">
              {MENU_ITEMS.map((v) => (
                <MenuItem key={v} id={v}>
                  {v}
                </MenuItem>
              ))}
            </Menu>
          </Popover>
        </MenuTrigger>
      ),
      ark: (on) => (
        <Ark.Root open={on} lazyMount unmountOnExit>
          <Ark.Trigger>open</Ark.Trigger>
          <ArkPortal>
            <Ark.Positioner>
              <Ark.Content data-bench-content="">
                {MENU_ITEMS.map((v) => (
                  <Ark.Item key={v} value={v}>
                    {v}
                  </Ark.Item>
                ))}
              </Ark.Content>
            </Ark.Positioner>
          </ArkPortal>
        </Ark.Root>
      ),
      headless: () => (
        <HeadlessMenu>
          <MenuButton>open</MenuButton>
          <MenuItems anchor="bottom" data-bench-content="">
            {MENU_ITEMS.map((v) => (
              <HeadlessItem key={v}>
                <button type="button">{v}</button>
              </HeadlessItem>
            ))}
          </MenuItems>
        </HeadlessMenu>
      ),
    },
  },
} satisfies IBench.ICase
