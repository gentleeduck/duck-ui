import { HoverCard as Ark } from '@ark-ui/react/hover-card'
import { Portal as ArkPortal } from '@ark-ui/react/portal'
import { PreviewCard as Base } from '@base-ui-components/react/preview-card'
import * as Duck from '@gentleduck/primitives/hover-card'
import * as Radix from '@radix-ui/react-hover-card'
import { Link, Popover, PreviewTrigger } from 'react-aria-components'
import type { IBench } from '../../__benches__/bench.types'

const tree =
  (H: IBench.Parts<'Content' | 'Portal' | 'Root' | 'Trigger'>): IBench.View =>
  (on) => (
    <H.Root open={on}>
      <H.Trigger href="#">open</H.Trigger>
      <H.Portal>
        <H.Content data-bench-content="">card</H.Content>
      </H.Portal>
    </H.Root>
  )

export default {
  name: 'Hover Card',
  note: "React Aria's hover card is its PreviewTrigger.",
  size: {
    radix: '@radix-ui/react-hover-card',
    baseui: '@base-ui-components/react/preview-card',
    'react-aria': { names: ['PreviewTrigger', 'Link', 'Popover'], from: 'react-aria-components' },
    ark: ['@ark-ui/react/hover-card', '@ark-ui/react/portal'],
  },
  runtime: {
    overlay: true,
    view: {
      duck: tree(Duck),
      radix: tree(Radix),
      baseui: (on) => (
        <Base.Root open={on}>
          <Base.Trigger href="#">open</Base.Trigger>
          <Base.Portal>
            <Base.Positioner>
              <Base.Popup data-bench-content="">card</Base.Popup>
            </Base.Positioner>
          </Base.Portal>
        </Base.Root>
      ),
      'react-aria': (on) => (
        <PreviewTrigger isOpen={on}>
          <Link href="#">open</Link>
          <Popover data-bench-content="">card</Popover>
        </PreviewTrigger>
      ),
      ark: (on) => (
        <Ark.Root open={on} lazyMount unmountOnExit>
          <Ark.Trigger asChild>
            <a href="#">open</a>
          </Ark.Trigger>
          <ArkPortal>
            <Ark.Positioner>
              <Ark.Content data-bench-content="">card</Ark.Content>
            </Ark.Positioner>
          </ArkPortal>
        </Ark.Root>
      ),
    },
  },
} satisfies IBench.ICase
