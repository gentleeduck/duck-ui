import { Portal as ArkPortal } from '@ark-ui/react/portal'
import { Tooltip as Ark } from '@ark-ui/react/tooltip'
import { Tooltip as Base } from '@base-ui-components/react/tooltip'
import * as Duck from '@gentleduck/primitives/tooltip'
import * as Radix from '@radix-ui/react-tooltip'
import { Button, Tooltip, TooltipTrigger } from 'react-aria-components'
import type { IBench } from '../../__benches__/bench.types'

const tree =
  (T: IBench.Parts<'Content' | 'Portal' | 'Provider' | 'Root' | 'Trigger'>): IBench.View =>
  (on) => (
    <T.Provider>
      <T.Root open={on}>
        <T.Trigger>open</T.Trigger>
        <T.Portal>
          <T.Content data-bench-content="">tip</T.Content>
        </T.Portal>
      </T.Root>
    </T.Provider>
  )

export default {
  name: 'Tooltip',
  size: {
    radix: '@radix-ui/react-tooltip',
    baseui: '@base-ui-components/react/tooltip',
    'react-aria': { names: ['TooltipTrigger', 'Tooltip', 'Button'], from: 'react-aria-components' },
    ark: ['@ark-ui/react/tooltip', '@ark-ui/react/portal'],
  },
  runtime: {
    overlay: true,
    view: {
      duck: tree(Duck),
      radix: tree(Radix),
      baseui: (on) => (
        <Base.Provider>
          <Base.Root open={on}>
            <Base.Trigger>open</Base.Trigger>
            <Base.Portal>
              <Base.Positioner>
                <Base.Popup data-bench-content="">tip</Base.Popup>
              </Base.Positioner>
            </Base.Portal>
          </Base.Root>
        </Base.Provider>
      ),
      'react-aria': (on) => (
        <TooltipTrigger isOpen={on}>
          <Button>open</Button>
          <Tooltip data-bench-content="">tip</Tooltip>
        </TooltipTrigger>
      ),
      ark: (on) => (
        <Ark.Root open={on} lazyMount unmountOnExit>
          <Ark.Trigger>open</Ark.Trigger>
          <ArkPortal>
            <Ark.Positioner>
              <Ark.Content data-bench-content="">tip</Ark.Content>
            </Ark.Positioner>
          </ArkPortal>
        </Ark.Root>
      ),
    },
  },
} satisfies IBench.ICase
