import { Slider as Ark } from '@ark-ui/react/slider'
import { Slider as Base } from '@base-ui-components/react/slider'
import * as Duck from '@gentleduck/primitives/slider'
import * as Radix from '@radix-ui/react-slider'
import { Slider, SliderThumb, SliderTrack } from 'react-aria-components'
import type { IBench } from '../../__benches__/bench.types'

const VALUES = [[20], [60]]

const tree =
  (S: IBench.Parts<'Range' | 'Root' | 'Thumb' | 'Track'>): IBench.View =>
  (on) => (
    <S.Root value={VALUES[+on]}>
      <S.Track>
        <S.Range />
      </S.Track>
      <S.Thumb />
    </S.Root>
  )

export default {
  name: 'Slider',
  size: {
    radix: '@radix-ui/react-slider',
    baseui: '@base-ui-components/react/slider',
    'react-aria': { names: ['Slider', 'SliderTrack', 'SliderThumb'], from: 'react-aria-components' },
    ark: '@ark-ui/react/slider',
  },
  runtime: {
    overlay: false,
    view: {
      duck: tree(Duck),
      radix: tree(Radix),
      baseui: (on) => (
        <Base.Root value={VALUES[+on]}>
          <Base.Control>
            <Base.Track>
              <Base.Indicator />
              <Base.Thumb />
            </Base.Track>
          </Base.Control>
        </Base.Root>
      ),
      'react-aria': (on) => (
        <Slider aria-label="slider" value={VALUES[+on][0]}>
          <SliderTrack>
            <SliderThumb />
          </SliderTrack>
        </Slider>
      ),
      ark: (on) => (
        <Ark.Root value={VALUES[+on]}>
          <Ark.Control>
            <Ark.Track>
              <Ark.Range />
            </Ark.Track>
            <Ark.Thumb index={0}>
              <Ark.HiddenInput />
            </Ark.Thumb>
          </Ark.Control>
        </Ark.Root>
      ),
    },
  },
} satisfies IBench.ICase
