// From Headless UI, packages/@headlessui-react/src/components/focus-trap/focus-trap.test.tsx. MIT, see
// src/__tests__/headless/LICENSE. A FocusTrap there is a scope here that is trapped and loops. Left out: initialFocus,
// which the dialog takes and dialog.headless.test.tsx covers, and the warning about nothing to focus, where this scope
// focuses its own element instead, as focus-scope.test.tsx covers. Focus on mount passing over hidden elements is in
// focus-scope.e2e.ts, since jsdom focuses an element that is not displayed and a browser does not.

import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { freshDom, wait } from '../../__tests__/dom'
import { FocusScope } from '../index'

freshDom()

const focused = () => document.activeElement?.id

function Trap({ children }: { children: React.ReactNode }) {
  return (
    <>
      <button type="button" id="before">
        Before
      </button>
      <FocusScope trapped loop>
        {children}
      </FocusScope>
      <button type="button" id="after">
        After
      </button>
    </>
  )
}

async function tabs(count: number, shift = false) {
  const user = userEvent.setup()
  const stops: Array<string | undefined> = []
  for (let step = 0; step < count; step++) {
    await user.tab({ shift })
    stops.push(focused())
  }
  return stops
}

describe('Headless UI focus trap', () => {
  it('focuses its first element on mount, and takes focus back from outside it', async () => {
    render(
      <Trap>
        <button type="button" id="a">
          a
        </button>
        <button type="button" id="b">
          b
        </button>
      </Trap>,
    )
    await wait(0)
    const mounted = focused()

    act(() => document.getElementById('before')?.focus())

    expect([mounted, focused()]).toEqual(['a', 'a'])
  })

  it('stays on its one element on Tab and on Shift+Tab', async () => {
    render(
      <Trap>
        <button type="button" id="only">
          only
        </button>
      </Trap>,
    )
    await wait(0)

    expect([...(await tabs(2)), ...(await tabs(2, true))]).toEqual(['only', 'only', 'only', 'only'])
  })

  it('moves on Tab to the next element and loops from the last, and back on Shift+Tab', async () => {
    render(
      <Trap>
        <button type="button" id="a">
          a
        </button>
        <button type="button" id="b">
          b
        </button>
        <button type="button" id="c">
          c
        </button>
      </Trap>,
    )
    await wait(0)

    expect([...(await tabs(3)), ...(await tabs(3, true))]).toEqual(['b', 'c', 'a', 'c', 'b', 'a'])
  })

  for (const [what, hide] of [
    ['hidden', { style: { display: 'none' } }],
    ['disabled', { disabled: true }],
  ] as const) {
    it(`passes over a ${what} element on Tab, and loops`, async () => {
      render(
        <Trap>
          <button type="button" id="a">
            a
          </button>
          <button type="button" id="b">
            b
          </button>
          <button type="button" id="c" {...hide}>
            c
          </button>
          <button type="button" id="d">
            d
          </button>
        </Trap>,
      )
      await wait(0)

      expect(await tabs(3)).toEqual(['b', 'd', 'a'])
    })
  }

  it('keeps Tab inside it when a positive tabIndex outside it comes next in the page order', async () => {
    render(
      <>
        <div tabIndex={-1}>
          <input tabIndex={2} id="a" />
          <input tabIndex={1} id="b" />
        </div>
        <FocusScope trapped loop>
          <input tabIndex={1} id="c" />
          <input id="d" />
        </FocusScope>
      </>,
    )
    await wait(0)
    const mounted = focused()

    expect([mounted, ...(await tabs(3))]).toEqual(['c', 'd', 'c', 'd'])
  })

  it('takes a Tab from its own element on to its first stop, and keeps focus there on a Shift+Tab, when a positive tabIndex outside comes next', async () => {
    const user = userEvent.setup()
    render(
      <>
        <input tabIndex={2} id="a" />
        <FocusScope trapped loop data-testid="scope">
          <input tabIndex={1} id="c" />
          <input id="d" />
        </FocusScope>
        <input tabIndex={1} id="b" />
      </>,
    )
    await wait(0)
    const scope = screen.getByTestId('scope')
    const from = async (shift: boolean) => {
      act(() => scope.focus())
      await user.tab({ shift })
      return document.activeElement
    }

    expect([await from(false), await from(true)]).toEqual([document.getElementById('c'), scope])
  })
})
