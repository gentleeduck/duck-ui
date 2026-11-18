import { RadioGroup as Ark } from '@ark-ui/react/radio-group'
import { Radio as BaseRadio } from '@base-ui-components/react/radio'
import { RadioGroup as BaseRadioGroup } from '@base-ui-components/react/radio-group'
import * as Duck from '@gentleduck/primitives/radio-group'
import { Radio as HeadlessRadio, RadioGroup as HeadlessRadioGroup } from '@headlessui/react'
import * as Radix from '@radix-ui/react-radio-group'
import { Radio, RadioGroup } from 'react-aria-components'
import type { IBench } from '../../__benches__/bench.types'
import { ITEMS, noop } from '../../__benches__/fixtures'

const VALUES = ['a', 'b']

const tree =
  (R: IBench.Parts<'Indicator' | 'Item' | 'Root'>): IBench.View =>
  (on) => (
    <R.Root value={VALUES[+on]}>
      {ITEMS.map((v) => (
        <R.Item key={v} value={v}>
          <R.Indicator />
        </R.Item>
      ))}
    </R.Root>
  )

export default {
  name: 'Radio Group',
  size: {
    radix: '@radix-ui/react-radio-group',
    baseui: ['@base-ui-components/react/radio-group', '@base-ui-components/react/radio'],
    'react-aria': { names: ['RadioGroup', 'Radio'], from: 'react-aria-components' },
    ark: '@ark-ui/react/radio-group',
    headless: { names: ['RadioGroup', 'Radio'], from: '@headlessui/react' },
  },
  runtime: {
    overlay: false,
    view: {
      duck: tree(Duck),
      radix: tree(Radix),
      baseui: (on) => (
        <BaseRadioGroup value={VALUES[+on]}>
          {ITEMS.map((v) => (
            <BaseRadio.Root key={v} value={v}>
              <BaseRadio.Indicator />
            </BaseRadio.Root>
          ))}
        </BaseRadioGroup>
      ),
      'react-aria': (on) => (
        <RadioGroup aria-label="radio group" value={VALUES[+on]}>
          {ITEMS.map((v) => (
            <Radio key={v} value={v}>
              {v}
            </Radio>
          ))}
        </RadioGroup>
      ),
      ark: (on) => (
        <Ark.Root value={VALUES[+on]}>
          {ITEMS.map((v) => (
            <Ark.Item key={v} value={v}>
              <Ark.ItemControl />
              <Ark.ItemHiddenInput />
            </Ark.Item>
          ))}
        </Ark.Root>
      ),
      headless: (on) => (
        <HeadlessRadioGroup value={VALUES[+on]} onChange={noop}>
          {ITEMS.map((v) => (
            <HeadlessRadio key={v} value={v}>
              {v}
            </HeadlessRadio>
          ))}
        </HeadlessRadioGroup>
      ),
    },
  },
} satisfies IBench.ICase
