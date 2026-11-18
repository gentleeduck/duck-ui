import { NavigationMenu as Ark } from '@ark-ui/react/navigation-menu'
import { NavigationMenu as Base } from '@base-ui-components/react/navigation-menu'
import * as Duck from '@gentleduck/primitives/navigation-menu'
import * as Radix from '@radix-ui/react-navigation-menu'
import type { IBench } from '../../__benches__/bench.types'
import { ITEMS } from '../../__benches__/fixtures'

const VALUES = ['a', 'b']

const tree =
  (N: IBench.Parts<'Content' | 'Item' | 'Link' | 'List' | 'Root' | 'Trigger' | 'Viewport'>): IBench.View =>
  (on) => (
    <N.Root value={VALUES[+on]}>
      <N.List>
        {ITEMS.map((v) => (
          <N.Item key={v} value={v}>
            <N.Trigger>{v}</N.Trigger>
            <N.Content>
              <N.Link href="#">{v}</N.Link>
            </N.Content>
          </N.Item>
        ))}
      </N.List>
      <N.Viewport />
    </N.Root>
  )

export default {
  name: 'Navigation Menu',
  size: {
    radix: '@radix-ui/react-navigation-menu',
    baseui: '@base-ui-components/react/navigation-menu',
    ark: '@ark-ui/react/navigation-menu',
  },
  runtime: {
    overlay: false,
    view: {
      duck: tree(Duck),
      radix: tree(Radix),
      baseui: (on) => (
        <Base.Root value={VALUES[+on]}>
          <Base.List>
            {ITEMS.map((v) => (
              <Base.Item key={v} value={v}>
                <Base.Trigger>{v}</Base.Trigger>
                <Base.Content>
                  <Base.Link href="#">{v}</Base.Link>
                </Base.Content>
              </Base.Item>
            ))}
          </Base.List>
          <Base.Portal>
            <Base.Positioner>
              <Base.Popup>
                <Base.Viewport />
              </Base.Popup>
            </Base.Positioner>
          </Base.Portal>
        </Base.Root>
      ),
      ark: (on) => (
        <Ark.Root value={VALUES[+on]}>
          <Ark.List>
            {ITEMS.map((v) => (
              <Ark.Item key={v} value={v}>
                <Ark.Trigger>{v}</Ark.Trigger>
                <Ark.Content>
                  <Ark.Link href="#">{v}</Ark.Link>
                </Ark.Content>
              </Ark.Item>
            ))}
          </Ark.List>
        </Ark.Root>
      ),
    },
  },
} satisfies IBench.ICase
