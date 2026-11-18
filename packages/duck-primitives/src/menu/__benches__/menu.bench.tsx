import type { IBench } from '../../__benches__/bench.types'

export default {
  name: 'Menu',
  note: 'The menu every gentleduck menu is built on, sized against the same layer elsewhere. Its timings are those of Dropdown Menu, Context Menu and Menubar.',
  size: {
    baseui: '@base-ui-components/react/menu',
    ark: '@ark-ui/react/menu',
  },
} satisfies IBench.ICase
