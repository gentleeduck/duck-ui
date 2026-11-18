import { Drawer as Ark } from '@ark-ui/react/drawer'
import { Portal as ArkPortal } from '@ark-ui/react/portal'
import * as Duck from '@gentleduck/primitives/sheet'
import { Button, Heading, Sheet, SheetContent, SheetOverlay, SheetTrigger } from 'react-aria-components'
import { Drawer as Vaul } from 'vaul'
import type { IBench } from '../../__benches__/bench.types'

export default {
  name: 'Sheet',
  note: "gentleduck's sheet is its dialog drawn from an edge, so Dialog's table has Radix and Base UI. Here it meets the drawers: vaul, React Aria's Sheet and Ark UI's Drawer, each of which also tracks a swipe.",
  size: {
    vaul: 'vaul',
    'react-aria': {
      names: ['SheetTrigger', 'SheetOverlay', 'Sheet', 'SheetContent', 'Heading', 'Button'],
      from: 'react-aria-components',
    },
    ark: ['@ark-ui/react/drawer', '@ark-ui/react/portal'],
  },
  runtime: {
    overlay: true,
    view: {
      duck: (on) => (
        <Duck.Root open={on}>
          <Duck.Trigger>open</Duck.Trigger>
          <Duck.Portal>
            <Duck.Overlay />
            <Duck.Content data-bench-content="">
              <Duck.Title>Title</Duck.Title>
              <Duck.Description>Description</Duck.Description>
              <Duck.Close>close</Duck.Close>
            </Duck.Content>
          </Duck.Portal>
        </Duck.Root>
      ),
      vaul: (on) => (
        <Vaul.Root open={on}>
          <Vaul.Trigger>open</Vaul.Trigger>
          <Vaul.Portal>
            <Vaul.Overlay />
            <Vaul.Content data-bench-content="">
              <Vaul.Title>Title</Vaul.Title>
              <Vaul.Description>Description</Vaul.Description>
              <Vaul.Close>close</Vaul.Close>
            </Vaul.Content>
          </Vaul.Portal>
        </Vaul.Root>
      ),
      'react-aria': (on) => (
        <SheetTrigger isOpen={on}>
          <Button>open</Button>
          <SheetOverlay>
            <Sheet>
              <SheetContent data-bench-content="">
                <Heading slot="title">Title</Heading>
                <p>Description</p>
                <Button slot="close">close</Button>
              </SheetContent>
            </Sheet>
          </SheetOverlay>
        </SheetTrigger>
      ),
      ark: (on) => (
        <Ark.Root open={on} lazyMount unmountOnExit>
          <Ark.Trigger>open</Ark.Trigger>
          <ArkPortal>
            <Ark.Backdrop />
            <Ark.Positioner>
              <Ark.Content data-bench-content="">
                <Ark.Title>Title</Ark.Title>
                <Ark.Description>Description</Ark.Description>
                <Ark.CloseTrigger>close</Ark.CloseTrigger>
              </Ark.Content>
            </Ark.Positioner>
          </ArkPortal>
        </Ark.Root>
      ),
    },
  },
} satisfies IBench.ICase
