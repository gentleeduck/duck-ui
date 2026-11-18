import { Toggle as Ark } from '@ark-ui/react/toggle'
import { Toggle as Base } from '@base-ui-components/react/toggle'
import * as Duck from '@gentleduck/primitives/toggle'
import * as Radix from '@radix-ui/react-toggle'
import { ToggleButton } from 'react-aria-components'
import type { IBench } from '../../__benches__/bench.types'

const tree =
  (T: IBench.Parts<'Root'>): IBench.View =>
  (on) => <T.Root pressed={on}>B</T.Root>

export default {
  name: 'Toggle',
  size: {
    radix: '@radix-ui/react-toggle',
    baseui: '@base-ui-components/react/toggle',
    'react-aria': { names: ['ToggleButton'], from: 'react-aria-components' },
    ark: '@ark-ui/react/toggle',
  },
  runtime: {
    overlay: false,
    view: {
      duck: tree(Duck),
      radix: tree(Radix),
      baseui: (on) => <Base pressed={on}>B</Base>,
      'react-aria': (on) => <ToggleButton isSelected={on}>B</ToggleButton>,
      ark: tree(Ark),
    },
  },
} satisfies IBench.ICase
