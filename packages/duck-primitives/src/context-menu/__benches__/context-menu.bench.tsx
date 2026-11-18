import { Menu as Ark } from '@ark-ui/react/menu'
import { Portal as ArkPortal } from '@ark-ui/react/portal'
import { ContextMenu as Base } from '@base-ui-components/react/context-menu'
import * as Duck from '@gentleduck/primitives/context-menu'
import * as Radix from '@radix-ui/react-context-menu'
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
  name: 'Context Menu',
  note: "Ark UI's context menu is its Menu opened from a `ContextTrigger`.",
  size: {
    radix: '@radix-ui/react-context-menu',
    baseui: '@base-ui-components/react/context-menu',
    ark: ['@ark-ui/react/menu', '@ark-ui/react/portal'],
  },
  runtime: {
    overlay: true,
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
      ark: (on) => (
        <Ark.Root open={on} lazyMount unmountOnExit>
          <Ark.ContextTrigger>open</Ark.ContextTrigger>
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
    },
  },
} satisfies IBench.ICase
