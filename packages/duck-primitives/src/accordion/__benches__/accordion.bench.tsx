import { Accordion as Ark } from '@ark-ui/react/accordion'
import { Accordion as Base } from '@base-ui-components/react/accordion'
import * as Duck from '@gentleduck/primitives/accordion'
import * as Radix from '@radix-ui/react-accordion'
import { Button, Disclosure, DisclosureGroup, DisclosurePanel, Heading } from 'react-aria-components'
import type { IBench } from '../../__benches__/bench.types'
import { ITEMS } from '../../__benches__/fixtures'

const OPEN = [['a'], ['b']]
const OPEN_KEYS = [new Set(['a']), new Set(['b'])]

const tree =
  (A: IBench.Parts<'Content' | 'Header' | 'Item' | 'Root' | 'Trigger'>): IBench.View =>
  (on) => (
    <A.Root type="single" value={OPEN[+on][0]}>
      {ITEMS.map((v) => (
        <A.Item key={v} value={v}>
          <A.Header>
            <A.Trigger>{v}</A.Trigger>
          </A.Header>
          <A.Content>{v}</A.Content>
        </A.Item>
      ))}
    </A.Root>
  )

export default {
  name: 'Accordion',
  size: {
    radix: '@radix-ui/react-accordion',
    baseui: '@base-ui-components/react/accordion',
    'react-aria': {
      names: ['DisclosureGroup', 'Disclosure', 'DisclosurePanel', 'Heading', 'Button'],
      from: 'react-aria-components',
    },
    ark: '@ark-ui/react/accordion',
  },
  runtime: {
    overlay: false,
    view: {
      duck: tree(Duck),
      radix: tree(Radix),
      baseui: (on) => (
        <Base.Root value={OPEN[+on]}>
          {ITEMS.map((v) => (
            <Base.Item key={v} value={v}>
              <Base.Header>
                <Base.Trigger>{v}</Base.Trigger>
              </Base.Header>
              <Base.Panel>{v}</Base.Panel>
            </Base.Item>
          ))}
        </Base.Root>
      ),
      'react-aria': (on) => (
        <DisclosureGroup expandedKeys={OPEN_KEYS[+on]}>
          {ITEMS.map((v) => (
            <Disclosure key={v} id={v}>
              <Heading>
                <Button slot="trigger">{v}</Button>
              </Heading>
              <DisclosurePanel>{v}</DisclosurePanel>
            </Disclosure>
          ))}
        </DisclosureGroup>
      ),
      ark: (on) => (
        <Ark.Root value={OPEN[+on]} lazyMount unmountOnExit>
          {ITEMS.map((v) => (
            <Ark.Item key={v} value={v}>
              <h3>
                <Ark.ItemTrigger>{v}</Ark.ItemTrigger>
              </h3>
              <Ark.ItemContent>{v}</Ark.ItemContent>
            </Ark.Item>
          ))}
        </Ark.Root>
      ),
    },
  },
} satisfies IBench.ICase
