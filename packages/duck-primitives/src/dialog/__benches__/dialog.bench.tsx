import { Dialog as Ark } from '@ark-ui/react/dialog'
import { Portal as ArkPortal } from '@ark-ui/react/portal'
import { Dialog as Base } from '@base-ui-components/react/dialog'
import * as Duck from '@gentleduck/primitives/dialog'
import {
  CloseButton,
  Description,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  Dialog as HeadlessDialog,
} from '@headlessui/react'
import * as Radix from '@radix-ui/react-dialog'
import { Button, Dialog, DialogTrigger, Heading, Modal, ModalOverlay } from 'react-aria-components'
import type { IBench } from '../../__benches__/bench.types'
import { noop } from '../../__benches__/fixtures'

const tree =
  (
    D: IBench.Parts<'Close' | 'Content' | 'Description' | 'Overlay' | 'Portal' | 'Root' | 'Title' | 'Trigger'>,
  ): IBench.View =>
  (on) => (
    <D.Root open={on}>
      <D.Trigger>open</D.Trigger>
      <D.Portal>
        <D.Overlay />
        <D.Content data-bench-content="">
          <D.Title>Title</D.Title>
          <D.Description>Description</D.Description>
          <D.Close>close</D.Close>
        </D.Content>
      </D.Portal>
    </D.Root>
  )

export default {
  name: 'Dialog',
  size: {
    radix: '@radix-ui/react-dialog',
    baseui: '@base-ui-components/react/dialog',
    'react-aria': {
      names: ['DialogTrigger', 'ModalOverlay', 'Modal', 'Dialog', 'Heading', 'Button'],
      from: 'react-aria-components',
    },
    ark: ['@ark-ui/react/dialog', '@ark-ui/react/portal'],
    headless: {
      names: ['Dialog', 'DialogBackdrop', 'DialogPanel', 'DialogTitle', 'Description', 'CloseButton'],
      from: '@headlessui/react',
    },
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
            <Base.Backdrop />
            <Base.Popup data-bench-content="">
              <Base.Title>Title</Base.Title>
              <Base.Description>Description</Base.Description>
              <Base.Close>close</Base.Close>
            </Base.Popup>
          </Base.Portal>
        </Base.Root>
      ),
      'react-aria': (on) => (
        <DialogTrigger isOpen={on}>
          <Button>open</Button>
          <ModalOverlay>
            <Modal>
              <Dialog data-bench-content="">
                <Heading slot="title">Title</Heading>
                <p>Description</p>
                <Button slot="close">close</Button>
              </Dialog>
            </Modal>
          </ModalOverlay>
        </DialogTrigger>
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
      headless: (on) => (
        <>
          <button type="button">open</button>
          <HeadlessDialog open={on} onClose={noop}>
            <DialogBackdrop />
            <DialogPanel data-bench-content="">
              <DialogTitle>Title</DialogTitle>
              <Description>Description</Description>
              <CloseButton>close</CloseButton>
            </DialogPanel>
          </HeadlessDialog>
        </>
      ),
    },
  },
} satisfies IBench.ICase
