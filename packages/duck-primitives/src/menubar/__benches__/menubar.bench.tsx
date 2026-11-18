import { Menu as BaseMenu } from '@base-ui-components/react/menu'
import { Menubar as BaseMenubar } from '@base-ui-components/react/menubar'
import * as Duck from '@gentleduck/primitives/menubar'
import * as Radix from '@radix-ui/react-menubar'
import type { IBench } from '../../__benches__/bench.types'
import { MENU_ITEMS } from '../../__benches__/fixtures'

const MENUS = ['a', 'b', 'c']
const OPEN = ['', 'b']

const tree =
  (M: IBench.Parts<'Content' | 'Item' | 'Menu' | 'Portal' | 'Root' | 'Trigger'>): IBench.View =>
  (on) => (
    <M.Root value={OPEN[+on]}>
      {MENUS.map((v) => (
        <M.Menu key={v} value={v}>
          <M.Trigger>{v}</M.Trigger>
          <M.Portal>
            <M.Content data-bench-content="">
              {MENU_ITEMS.map((item) => (
                <M.Item key={item}>{item}</M.Item>
              ))}
            </M.Content>
          </M.Portal>
        </M.Menu>
      ))}
    </M.Root>
  )

export default {
  name: 'Menubar',
  note: "Base UI's Menubar is only the bar, so its figures include the Menu each entry opens. Ark UI and React Aria ship no menubar.",
  size: {
    radix: '@radix-ui/react-menubar',
    baseui: ['@base-ui-components/react/menubar', '@base-ui-components/react/menu'],
  },
  runtime: {
    overlay: true,
    view: {
      duck: tree(Duck),
      radix: tree(Radix),
      baseui: (on) => (
        <BaseMenubar>
          {MENUS.map((v) => (
            <BaseMenu.Root key={v} open={OPEN[+on] === v}>
              <BaseMenu.Trigger>{v}</BaseMenu.Trigger>
              <BaseMenu.Portal>
                <BaseMenu.Positioner>
                  <BaseMenu.Popup data-bench-content="">
                    {MENU_ITEMS.map((item) => (
                      <BaseMenu.Item key={item}>{item}</BaseMenu.Item>
                    ))}
                  </BaseMenu.Popup>
                </BaseMenu.Positioner>
              </BaseMenu.Portal>
            </BaseMenu.Root>
          ))}
        </BaseMenubar>
      ),
    },
  },
} satisfies IBench.ICase
