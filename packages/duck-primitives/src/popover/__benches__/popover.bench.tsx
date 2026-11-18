import { Popover as Ark } from '@ark-ui/react/popover'
import { Portal as ArkPortal } from '@ark-ui/react/portal'
import { Popover as Base } from '@base-ui-components/react/popover'
import * as Duck from '@gentleduck/primitives/popover'
import { CloseButton, Popover as HeadlessPopover, PopoverButton, PopoverPanel } from '@headlessui/react'
import * as Radix from '@radix-ui/react-popover'
import { Button, Dialog, DialogTrigger, Popover } from 'react-aria-components'
import type { IBench } from '../../__benches__/bench.types'

const tree =
  (P: IBench.Parts<'Close' | 'Content' | 'Portal' | 'Root' | 'Trigger'>): IBench.View =>
  (on) => (
    <P.Root open={on}>
      <P.Trigger>open</P.Trigger>
      <P.Portal>
        <P.Content data-bench-content="">
          content<P.Close>close</P.Close>
        </P.Content>
      </P.Portal>
    </P.Root>
  )

export default {
  name: 'Popover',
  note: 'Headless UI has no controlled open state, so its copies are timed mounting and unmounting closed, and no more.',
  size: {
    radix: '@radix-ui/react-popover',
    baseui: '@base-ui-components/react/popover',
    'react-aria': { names: ['DialogTrigger', 'Popover', 'Dialog', 'Button'], from: 'react-aria-components' },
    ark: ['@ark-ui/react/popover', '@ark-ui/react/portal'],
    headless: { names: ['Popover', 'PopoverButton', 'PopoverPanel', 'CloseButton'], from: '@headlessui/react' },
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
                content<Base.Close>close</Base.Close>
              </Base.Popup>
            </Base.Positioner>
          </Base.Portal>
        </Base.Root>
      ),
      'react-aria': (on) => (
        <DialogTrigger isOpen={on}>
          <Button>open</Button>
          <Popover>
            <Dialog data-bench-content="">
              content<Button slot="close">close</Button>
            </Dialog>
          </Popover>
        </DialogTrigger>
      ),
      ark: (on) => (
        <Ark.Root open={on} lazyMount unmountOnExit>
          <Ark.Trigger>open</Ark.Trigger>
          <ArkPortal>
            <Ark.Positioner>
              <Ark.Content data-bench-content="">
                content<Ark.CloseTrigger>close</Ark.CloseTrigger>
              </Ark.Content>
            </Ark.Positioner>
          </ArkPortal>
        </Ark.Root>
      ),
      headless: () => (
        <HeadlessPopover>
          <PopoverButton>open</PopoverButton>
          <PopoverPanel anchor="bottom" data-bench-content="">
            content<CloseButton>close</CloseButton>
          </PopoverPanel>
        </HeadlessPopover>
      ),
    },
  },
} satisfies IBench.ICase
