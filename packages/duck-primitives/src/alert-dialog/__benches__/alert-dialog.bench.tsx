import { Dialog as Ark } from '@ark-ui/react/dialog'
import { Portal as ArkPortal } from '@ark-ui/react/portal'
import { AlertDialog as Base } from '@base-ui-components/react/alert-dialog'
import * as Duck from '@gentleduck/primitives/alert-dialog'
import { Description, DialogPanel, DialogTitle, Dialog as HeadlessDialog } from '@headlessui/react'
import * as Radix from '@radix-ui/react-alert-dialog'
import { Button, Dialog, DialogTrigger, Heading, Modal, ModalOverlay } from 'react-aria-components'
import type { IBench } from '../../__benches__/bench.types'
import { noop } from '../../__benches__/fixtures'

const tree =
  (
    D: IBench.Parts<
      'Action' | 'Cancel' | 'Content' | 'Description' | 'Overlay' | 'Portal' | 'Root' | 'Title' | 'Trigger'
    >,
  ): IBench.View =>
  (on) => (
    <D.Root open={on}>
      <D.Trigger>open</D.Trigger>
      <D.Portal>
        <D.Overlay />
        <D.Content data-bench-content="">
          <D.Title>Title</D.Title>
          <D.Description>Description</D.Description>
          <D.Cancel>cancel</D.Cancel>
          <D.Action>confirm</D.Action>
        </D.Content>
      </D.Portal>
    </D.Root>
  )

export default {
  name: 'Alert Dialog',
  note: 'React Aria, Ark UI and Headless UI have no alert dialog of their own; each is its dialog with `role="alertdialog"`.',
  size: {
    radix: '@radix-ui/react-alert-dialog',
    baseui: '@base-ui-components/react/alert-dialog',
    'react-aria': {
      names: ['DialogTrigger', 'ModalOverlay', 'Modal', 'Dialog', 'Heading', 'Button'],
      from: 'react-aria-components',
    },
    ark: ['@ark-ui/react/dialog', '@ark-ui/react/portal'],
    headless: { names: ['Dialog', 'DialogPanel', 'DialogTitle', 'Description'], from: '@headlessui/react' },
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
              <Base.Close>cancel</Base.Close>
              <Base.Close>confirm</Base.Close>
            </Base.Popup>
          </Base.Portal>
        </Base.Root>
      ),
      'react-aria': (on) => (
        <DialogTrigger isOpen={on}>
          <Button>open</Button>
          <ModalOverlay>
            <Modal>
              <Dialog role="alertdialog" data-bench-content="">
                <Heading slot="title">Title</Heading>
                <p>Description</p>
                <Button slot="close">cancel</Button>
                <Button slot="close">confirm</Button>
              </Dialog>
            </Modal>
          </ModalOverlay>
        </DialogTrigger>
      ),
      ark: (on) => (
        <Ark.Root open={on} role="alertdialog" lazyMount unmountOnExit>
          <Ark.Trigger>open</Ark.Trigger>
          <ArkPortal>
            <Ark.Backdrop />
            <Ark.Positioner>
              <Ark.Content data-bench-content="">
                <Ark.Title>Title</Ark.Title>
                <Ark.Description>Description</Ark.Description>
                <Ark.CloseTrigger>cancel</Ark.CloseTrigger>
                <Ark.CloseTrigger>confirm</Ark.CloseTrigger>
              </Ark.Content>
            </Ark.Positioner>
          </ArkPortal>
        </Ark.Root>
      ),
      headless: (on) => (
        <>
          <button type="button">open</button>
          <HeadlessDialog open={on} onClose={noop} role="alertdialog">
            <DialogPanel data-bench-content="">
              <DialogTitle>Title</DialogTitle>
              <Description>Description</Description>
              <button type="button">cancel</button>
              <button type="button">confirm</button>
            </DialogPanel>
          </HeadlessDialog>
        </>
      ),
    },
  },
} satisfies IBench.ICase
