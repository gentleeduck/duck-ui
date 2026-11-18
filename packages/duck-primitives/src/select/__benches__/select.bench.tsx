import { Portal as ArkPortal } from '@ark-ui/react/portal'
import { Select as Ark, createListCollection } from '@ark-ui/react/select'
import { Select as Base } from '@base-ui-components/react/select'
import * as Duck from '@gentleduck/primitives/select'
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'
import * as Radix from '@radix-ui/react-select'
import { Button, ListBox, ListBoxItem, Popover, Select, SelectValue } from 'react-aria-components'
import type { IBench } from '../../__benches__/bench.types'
import { MENU_ITEMS } from '../../__benches__/fixtures'

const ARK_ITEMS = createListCollection({ items: MENU_ITEMS })
const ARK_VALUE = [MENU_ITEMS[0]]
const DUCK_ITEMS = MENU_ITEMS.map((v) => ({ value: v, label: v }))

const tree =
  (
    S: IBench.Parts<'Content' | 'Item' | 'ItemText' | 'Portal' | 'Root' | 'Trigger' | 'Value' | 'Viewport'>,
    root: object = {},
  ): IBench.View =>
  (on) => (
    <S.Root open={on} value={MENU_ITEMS[0]} {...root}>
      <S.Trigger>
        <S.Value />
      </S.Trigger>
      <S.Portal>
        <S.Content position="popper" data-bench-content="">
          <S.Viewport>
            {MENU_ITEMS.map((v) => (
              <S.Item key={v} value={v}>
                <S.ItemText>{v}</S.ItemText>
              </S.Item>
            ))}
          </S.Viewport>
        </S.Content>
      </S.Portal>
    </S.Root>
  )

export default {
  name: 'Select',
  note: "gentleduck is given `items`, as Ark UI is given its collection. Headless UI's Listbox has no controlled open state, so its copies are timed mounting and unmounting closed, and no more.",
  size: {
    radix: '@radix-ui/react-select',
    baseui: '@base-ui-components/react/select',
    'react-aria': {
      names: ['Select', 'SelectValue', 'Button', 'Popover', 'ListBox', 'ListBoxItem'],
      from: 'react-aria-components',
    },
    ark: ['@ark-ui/react/select', '@ark-ui/react/portal'],
    headless: { names: ['Listbox', 'ListboxButton', 'ListboxOptions', 'ListboxOption'], from: '@headlessui/react' },
  },
  runtime: {
    overlay: true,
    closedOnly: ['headless'],
    view: {
      duck: tree(Duck, { items: DUCK_ITEMS }),
      radix: tree(Radix),
      baseui: (on) => (
        <Base.Root open={on} value={MENU_ITEMS[0]}>
          <Base.Trigger>
            <Base.Value />
          </Base.Trigger>
          <Base.Portal>
            <Base.Positioner alignItemWithTrigger={false}>
              <Base.Popup data-bench-content="">
                {MENU_ITEMS.map((v) => (
                  <Base.Item key={v} value={v}>
                    <Base.ItemText>{v}</Base.ItemText>
                  </Base.Item>
                ))}
              </Base.Popup>
            </Base.Positioner>
          </Base.Portal>
        </Base.Root>
      ),
      'react-aria': (on) => (
        <Select aria-label="select" isOpen={on} selectedKey={MENU_ITEMS[0]}>
          <Button>
            <SelectValue />
          </Button>
          <Popover>
            <ListBox data-bench-content="">
              {MENU_ITEMS.map((v) => (
                <ListBoxItem key={v} id={v}>
                  {v}
                </ListBoxItem>
              ))}
            </ListBox>
          </Popover>
        </Select>
      ),
      ark: (on) => (
        <Ark.Root collection={ARK_ITEMS} open={on} value={ARK_VALUE} lazyMount unmountOnExit>
          <Ark.Control>
            <Ark.Trigger>
              <Ark.ValueText />
            </Ark.Trigger>
          </Ark.Control>
          <ArkPortal>
            <Ark.Positioner>
              <Ark.Content data-bench-content="">
                {MENU_ITEMS.map((v) => (
                  <Ark.Item key={v} item={v}>
                    <Ark.ItemText>{v}</Ark.ItemText>
                  </Ark.Item>
                ))}
              </Ark.Content>
            </Ark.Positioner>
          </ArkPortal>
          <Ark.HiddenSelect />
        </Ark.Root>
      ),
      headless: () => (
        <Listbox value={MENU_ITEMS[0]}>
          <ListboxButton>{MENU_ITEMS[0]}</ListboxButton>
          <ListboxOptions anchor="bottom" data-bench-content="">
            {MENU_ITEMS.map((v) => (
              <ListboxOption key={v} value={v}>
                {v}
              </ListboxOption>
            ))}
          </ListboxOptions>
        </Listbox>
      ),
    },
  },
} satisfies IBench.ICase
