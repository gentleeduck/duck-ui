import { ToggleGroup as Ark } from '@ark-ui/react/toggle-group'
import { Toggle as BaseToggle } from '@base-ui-components/react/toggle'
import { ToggleGroup as BaseToggleGroup } from '@base-ui-components/react/toggle-group'
import * as Duck from '@gentleduck/primitives/toggle-group'
import * as Radix from '@radix-ui/react-toggle-group'
import { ToggleButton, ToggleButtonGroup } from 'react-aria-components'
import type { IBench } from '../../__benches__/bench.types'
import { ITEMS } from '../../__benches__/fixtures'

const VALUES = [['a'], ['b']]
const KEYS = [new Set(['a']), new Set(['b'])]

const tree =
  (G: IBench.Parts<'Item' | 'Root'>): IBench.View =>
  (on) => (
    <G.Root type="single" value={VALUES[+on][0]}>
      {ITEMS.map((v) => (
        <G.Item key={v} value={v}>
          {v}
        </G.Item>
      ))}
    </G.Root>
  )

export default {
  name: 'Toggle Group',
  size: {
    radix: '@radix-ui/react-toggle-group',
    baseui: ['@base-ui-components/react/toggle-group', '@base-ui-components/react/toggle'],
    'react-aria': { names: ['ToggleButtonGroup', 'ToggleButton'], from: 'react-aria-components' },
    ark: '@ark-ui/react/toggle-group',
  },
  runtime: {
    overlay: false,
    view: {
      duck: tree(Duck),
      radix: tree(Radix),
      baseui: (on) => (
        <BaseToggleGroup value={VALUES[+on]}>
          {ITEMS.map((v) => (
            <BaseToggle key={v} value={v}>
              {v}
            </BaseToggle>
          ))}
        </BaseToggleGroup>
      ),
      'react-aria': (on) => (
        <ToggleButtonGroup selectionMode="single" selectedKeys={KEYS[+on]}>
          {ITEMS.map((v) => (
            <ToggleButton key={v} id={v}>
              {v}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      ),
      ark: (on) => (
        <Ark.Root value={VALUES[+on]}>
          {ITEMS.map((v) => (
            <Ark.Item key={v} value={v}>
              {v}
            </Ark.Item>
          ))}
        </Ark.Root>
      ),
    },
  },
} satisfies IBench.ICase
