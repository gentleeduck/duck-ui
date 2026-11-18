import { Progress as Ark } from '@ark-ui/react/progress'
import { Progress as Base } from '@base-ui-components/react/progress'
import * as Duck from '@gentleduck/primitives/progress'
import * as Radix from '@radix-ui/react-progress'
import { ProgressBar } from 'react-aria-components'
import type { IBench } from '../../__benches__/bench.types'

const VALUES = [20, 60]

const tree =
  (P: IBench.Parts<'Indicator' | 'Root'>): IBench.View =>
  (on) => (
    <P.Root value={VALUES[+on]}>
      <P.Indicator />
    </P.Root>
  )

export default {
  name: 'Progress',
  size: {
    radix: '@radix-ui/react-progress',
    baseui: '@base-ui-components/react/progress',
    'react-aria': { names: ['ProgressBar'], from: 'react-aria-components' },
    ark: '@ark-ui/react/progress',
  },
  runtime: {
    overlay: false,
    view: {
      duck: tree(Duck),
      radix: tree(Radix),
      baseui: (on) => (
        <Base.Root value={VALUES[+on]}>
          <Base.Track>
            <Base.Indicator />
          </Base.Track>
        </Base.Root>
      ),
      'react-aria': (on) => (
        <ProgressBar aria-label="progress" value={VALUES[+on]}>
          {({ percentage }) => <div style={{ width: `${percentage}%` }} />}
        </ProgressBar>
      ),
      ark: (on) => (
        <Ark.Root value={VALUES[+on]}>
          <Ark.Track>
            <Ark.Range />
          </Ark.Track>
        </Ark.Root>
      ),
    },
  },
} satisfies IBench.ICase
