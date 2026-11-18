import { PinInput as Ark } from '@ark-ui/react/pin-input'
import * as Duck from '@gentleduck/primitives/input-otp'
import * as Radix from '@radix-ui/react-one-time-password-field'
import { OTPInput } from 'input-otp'
import type { IBench } from '../../__benches__/bench.types'
import { noop } from '../../__benches__/fixtures'

const SLOTS = [0, 1, 2, 3]
const VALUES = ['12', '1234']
const ARK_VALUES = [
  ['1', '2', '', ''],
  ['1', '2', '3', '4'],
]

export default {
  name: 'Input OTP',
  size: {
    radix: '@radix-ui/react-one-time-password-field',
    'input-otp': 'input-otp',
    ark: '@ark-ui/react/pin-input',
  },
  runtime: {
    overlay: false,
    view: {
      duck: (on) => (
        <Duck.Root maxLength={4} value={VALUES[+on]} onValueChange={noop}>
          <Duck.Group>
            {SLOTS.map((i) => (
              <Duck.Slot key={i} />
            ))}
          </Duck.Group>
        </Duck.Root>
      ),
      radix: (on) => (
        <Radix.Root value={VALUES[+on]} onValueChange={noop}>
          {SLOTS.map((i) => (
            <Radix.Input key={i} />
          ))}
          <Radix.HiddenInput />
        </Radix.Root>
      ),
      'input-otp': (on) => (
        <OTPInput
          maxLength={4}
          value={VALUES[+on]}
          onChange={noop}
          render={({ slots }) => (
            <div>
              {slots.map((slot, i) => (
                <div key={SLOTS[i]}>{slot.char}</div>
              ))}
            </div>
          )}
        />
      ),
      ark: (on) => (
        <Ark.Root count={4} value={ARK_VALUES[+on]}>
          <Ark.Control>
            {SLOTS.map((i) => (
              <Ark.Input key={i} index={i} />
            ))}
          </Ark.Control>
          <Ark.HiddenInput />
        </Ark.Root>
      ),
    },
  },
} satisfies IBench.ICase
