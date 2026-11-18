import type { IBench } from '../../__benches__/bench.types'

export default {
  name: 'Mount',
  note: "Keeps children mounted through an exit, for a fixed time or an element's transitions. Radix's nearest, `Presence`, waits for an animation on the one child it wraps.",
  size: {},
} satisfies IBench.ICase
