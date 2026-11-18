import { Avatar as Ark } from '@ark-ui/react/avatar'
import { Avatar as Base } from '@base-ui-components/react/avatar'
import * as Duck from '@gentleduck/primitives/avatar'
import * as Radix from '@radix-ui/react-avatar'
import type { IBench } from '../../__benches__/bench.types'

const tree =
  (A: IBench.Parts<'Fallback' | 'Root'>): IBench.View =>
  (on) => (
    <A.Root>
      <A.Fallback>{on ? 'CD' : 'AB'}</A.Fallback>
    </A.Root>
  )

export default {
  name: 'Avatar',
  size: {
    radix: '@radix-ui/react-avatar',
    baseui: '@base-ui-components/react/avatar',
    ark: '@ark-ui/react/avatar',
  },
  runtime: {
    overlay: false,
    view: { duck: tree(Duck), radix: tree(Radix), baseui: tree(Base), ark: tree(Ark) },
  },
} satisfies IBench.ICase
