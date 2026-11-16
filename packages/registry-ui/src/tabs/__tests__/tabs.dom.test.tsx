import { afterEach, describe, expect, mock, spyOn, test } from 'bun:test'
import { DirectionProvider } from '@gentleduck/primitives/direction'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import * as React from 'react'
import { MotionTabs, MotionTabsContent, MotionTabsContents, MotionTabsList, MotionTabsTrigger } from '../motion-tabs'
import { type ITabsProps, Tabs, TabsContent, TabsList, TabsTrigger } from '../tabs'

afterEach(cleanup)

const wait = (ms: number) => act(() => new Promise<void>((resolve) => setTimeout(resolve, ms)))

interface IDemoProps extends ITabsProps {
  disabledAlpha?: boolean
  disabledBeta?: boolean
  gamma?: { defaultChecked?: boolean; onClick?: () => void }
  onListKeyDown?: React.KeyboardEventHandler<HTMLDivElement>
}

function PlainDemo({ disabledAlpha, disabledBeta, gamma, onListKeyDown, ...props }: IDemoProps) {
  return (
    <Tabs {...props}>
      <TabsList aria-label="Sections" onKeyDown={onListKeyDown}>
        <TabsTrigger disabled={disabledAlpha} value="a">
          Alpha
        </TabsTrigger>
        <TabsTrigger disabled={disabledBeta} value="b">
          Beta
        </TabsTrigger>
        <TabsTrigger {...gamma} value="c">
          Gamma
        </TabsTrigger>
      </TabsList>
      <TabsContent value="a">Panel A</TabsContent>
      <TabsContent value="b">Panel B</TabsContent>
      <TabsContent value="c">Panel C</TabsContent>
    </Tabs>
  )
}

function MotionDemo({ disabledAlpha, disabledBeta, gamma, onListKeyDown, ...props }: IDemoProps) {
  return (
    <MotionTabs {...props}>
      <MotionTabsList aria-label="Sections" onKeyDown={onListKeyDown}>
        <MotionTabsTrigger disabled={disabledAlpha} value="a">
          Alpha
        </MotionTabsTrigger>
        <MotionTabsTrigger disabled={disabledBeta} value="b">
          Beta
        </MotionTabsTrigger>
        <MotionTabsTrigger {...gamma} value="c">
          Gamma
        </MotionTabsTrigger>
      </MotionTabsList>
      <MotionTabsContents>
        <MotionTabsContent value="a">Panel A</MotionTabsContent>
        <MotionTabsContent value="b">Panel B</MotionTabsContent>
        <MotionTabsContent value="c">Panel C</MotionTabsContent>
      </MotionTabsContents>
    </MotionTabs>
  )
}

const tab = (name: string) => screen.getByRole('tab', { name })
const selected = () => screen.getByRole('tab', { selected: true }).textContent
const key = (name: string, k: string) => fireEvent.keyDown(tab(name), { key: k })

describe.each([
  ['Tabs', PlainDemo],
  ['MotionTabs', MotionDemo],
] as const)('registry-ui %s', (_, Demo) => {
  test('a value given later moves the selection, and value beats defaultValue', () => {
    const { rerender } = render(<Demo defaultValue="a" value="b" />)

    expect(selected()).toBe('Beta')

    rerender(<Demo defaultValue="a" value="c" />)

    expect(selected()).toBe('Gamma')
    expect(screen.getByRole('tabpanel').textContent).toBe('Panel C')
  })

  test('a controlled tab stays put on a click its owner does not follow, and reports the click', () => {
    const onValueChange = mock()
    render(<Demo onValueChange={onValueChange} value="a" />)

    fireEvent.click(tab('Gamma'))

    expect(onValueChange).toHaveBeenCalledTimes(1)
    expect(onValueChange).toHaveBeenCalledWith('c')
    expect(selected()).toBe('Alpha')
  })

  test('onValueChange fires once per change, never on mount or on a re-render', () => {
    const calls: string[] = []
    const { rerender } = render(<Demo defaultValue="a" onValueChange={(value) => calls.push(value)} />)

    rerender(<Demo defaultValue="a" onValueChange={(value) => calls.push(value)} />)
    fireEvent.click(tab('Gamma'))
    fireEvent.click(tab('Gamma'))

    expect(calls).toEqual(['c'])
    expect(selected()).toBe('Gamma')
  })

  test('arrows move focus and selection past a disabled tab and wrap; Home and End jump; Up and Down do nothing', () => {
    render(<Demo defaultValue="a" disabledBeta />)
    tab('Alpha').focus()

    key('Alpha', 'ArrowRight')

    expect(document.activeElement).toBe(tab('Gamma'))
    expect(selected()).toBe('Gamma')

    key('Gamma', 'ArrowRight')

    expect(selected()).toBe('Alpha')

    key('Alpha', 'End')

    expect(selected()).toBe('Gamma')

    key('Gamma', 'Home')
    key('Alpha', 'ArrowDown')

    expect(selected()).toBe('Alpha')
    expect(screen.getByRole('tablist').getAttribute('aria-orientation')).toBe('horizontal')
  })

  test('in RTL the left arrow moves to the next tab', () => {
    render(
      <DirectionProvider dir="rtl">
        <Demo defaultValue="a" />
      </DirectionProvider>,
    )

    key('Alpha', 'ArrowLeft')

    expect(selected()).toBe('Beta')
  })

  test('vertical tabs move on Up and Down, and leave Left and Right alone', () => {
    render(<Demo defaultValue="a" orientation="vertical" />)

    expect(screen.getByRole('tablist').getAttribute('aria-orientation')).toBe('vertical')

    key('Alpha', 'ArrowDown')

    expect(selected()).toBe('Beta')

    key('Beta', 'ArrowRight')
    key('Beta', 'ArrowUp')

    expect(selected()).toBe('Alpha')
  })

  test('a key the owner handled, or one on the list itself, is left alone', () => {
    render(<Demo defaultValue="a" onListKeyDown={(event) => event.key === 'End' && event.preventDefault()} />)

    key('Alpha', 'End')
    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowRight' })

    expect(selected()).toBe('Alpha')
  })

  test("a click runs the trigger's own onClick, and a disabled trigger selects nothing", () => {
    const onClick = mock()
    render(<Demo defaultValue="a" disabledBeta gamma={{ onClick }} />)

    fireEvent.click(tab('Beta'))

    expect(selected()).toBe('Alpha')

    fireEvent.click(tab('Gamma'))

    expect(onClick).toHaveBeenCalledTimes(1)
    expect(selected()).toBe('Gamma')
  })

  test('with no tab selected the first enabled one takes the tab stop, until a tab is chosen', () => {
    render(<Demo disabledAlpha />)
    const stops = () => ['Alpha', 'Beta', 'Gamma'].map((name) => tab(name).tabIndex)

    expect(stops()).toEqual([-1, 0, -1])

    fireEvent.click(tab('Gamma'))

    expect(stops()).toEqual([-1, -1, 0])
  })

  test('a trigger marked defaultChecked opens on mount', () => {
    render(<Demo gamma={{ defaultChecked: true }} />)

    expect(selected()).toBe('Gamma')
  })

  test('a defaultChecked trigger does not pull a controlled value back once it moves', () => {
    function Owner() {
      const [value, setValue] = React.useState('c')
      return <Demo gamma={{ defaultChecked: true }} onValueChange={setValue} value={value} />
    }
    render(<Owner />)

    fireEvent.click(tab('Beta'))

    expect(selected()).toBe('Beta')
  })

  test('a tab and its panel name each other, only the selected tab is in the tab order, and the panel is', () => {
    render(<Demo defaultValue="b" />)
    const panel = screen.getByRole('tabpanel')

    expect(tab('Beta').getAttribute('aria-controls')).toBe(panel.id)
    expect(panel.getAttribute('aria-labelledby')).toBe(tab('Beta').id)
    expect(screen.getAllByRole('tab').map((node) => node.tabIndex)).toEqual([-1, 0, -1])
    expect(panel.tabIndex).toBe(0)
  })
})

describe('registry-ui Tabs parts', () => {
  test('a part outside Tabs says where it belongs', () => {
    const error = spyOn(console, 'error').mockImplementation(() => {})

    expect(() => render(<TabsList />)).toThrow('must be used within Tabs')
    expect(() => render(<MotionTabsContents />)).toThrow('must be used within MotionTabs')
    error.mockRestore()
  })

  test('the root, a trigger and a panel forward their refs, and the root carries the direction it resolved', () => {
    const root = React.createRef<HTMLDivElement>()
    const trigger = React.createRef<HTMLButtonElement>()
    const panel = React.createRef<HTMLDivElement>()
    let called: HTMLDivElement | null = null

    render(
      <Tabs defaultValue="a" dir="rtl" ref={root}>
        <TabsList>
          <TabsTrigger ref={trigger} value="a">
            Tab A
          </TabsTrigger>
        </TabsList>
        <TabsContent ref={panel} value="a">
          A
        </TabsContent>
        <TabsContent
          ref={(node) => {
            called = node
          }}
          value="b">
          B
        </TabsContent>
      </Tabs>,
    )

    expect(root.current?.dataset.slot).toBe('tabs')
    expect(root.current?.getAttribute('dir')).toBe('rtl')
    expect(trigger.current?.textContent).toBe('Tab A')
    expect(panel.current?.textContent).toBe('A')
    expect(called).not.toBeNull()
  })

  test('renderOnce keeps a visited panel and its state; a plain panel starts over on every visit', () => {
    render(
      <Tabs defaultValue="kept">
        <TabsList>
          <TabsTrigger value="kept">Kept</TabsTrigger>
          <TabsTrigger value="fresh">Fresh</TabsTrigger>
          <TabsTrigger value="other">Other</TabsTrigger>
        </TabsList>
        <TabsContent renderOnce value="kept">
          <input aria-label="Kept draft" />
        </TabsContent>
        <TabsContent value="fresh">
          <input aria-label="Fresh draft" />
        </TabsContent>
        <TabsContent value="other">Other</TabsContent>
      </Tabs>,
    )

    fireEvent.change(screen.getByLabelText('Kept draft'), { target: { value: 'kept text' } })
    fireEvent.click(tab('Fresh'))
    fireEvent.change(screen.getByLabelText('Fresh draft'), { target: { value: 'fresh text' } })
    fireEvent.click(tab('Other'))
    fireEvent.click(tab('Kept'))

    expect((screen.getByLabelText('Kept draft') as HTMLInputElement).value).toBe('kept text')

    fireEvent.click(tab('Fresh'))

    expect((screen.getByLabelText('Fresh draft') as HTMLInputElement).value).toBe('')
  })

  test('vertical panels drop the gap a horizontal list leaves above them', () => {
    render(
      <Tabs defaultValue="a" orientation="vertical">
        <TabsContent value="a">A</TabsContent>
      </Tabs>,
    )

    expect(screen.getByRole('tabpanel').classList.contains('mt-2')).toBe(false)
    expect(screen.getByRole('tabpanel').dataset.orientation).toBe('vertical')
  })
})

describe('registry-ui MotionTabs parts', () => {
  const transform = (panel: string) => (screen.getByText(panel).parentElement as HTMLElement).style.transform

  test('a later tab slides in from the end, an earlier one from the start, mirrored in RTL and for a controlled value', async () => {
    render(<MotionDemo defaultValue="a" />)

    fireEvent.click(tab('Gamma'))

    expect(transform('Panel C')).toContain('translateX(8%)')

    await wait(50)
    fireEvent.click(tab('Alpha'))

    expect(transform('Panel A')).toContain('translateX(-8%)')

    cleanup()
    render(
      <DirectionProvider dir="rtl">
        <MotionDemo defaultValue="a" />
      </DirectionProvider>,
    )
    fireEvent.click(tab('Gamma'))

    expect(transform('Panel C')).toContain('translateX(-8%)')

    cleanup()
    const { rerender } = render(<MotionDemo value="c" />)
    rerender(<MotionDemo value="a" />)

    expect(transform('Panel A')).toContain('translateX(-8%)')
  })

  test('vertical tabs slide their panels up and down, the same way in RTL, and settle', async () => {
    render(<MotionDemo defaultValue="a" orientation="vertical" />)

    fireEvent.click(tab('Gamma'))

    expect(transform('Panel C')).toContain('translateY(8%)')
    expect(transform('Panel C')).not.toContain('translateX')

    await waitFor(() => expect(transform('Panel C')).toBe('none'))

    cleanup()
    render(
      <DirectionProvider dir="rtl">
        <MotionDemo defaultValue="a" orientation="vertical" />
      </DirectionProvider>,
    )
    fireEvent.click(tab('Gamma'))

    expect(transform('Panel C')).toContain('translateY(8%)')
  })

  test('a disabled trigger shakes instead of opening, and settles', async () => {
    render(<MotionDemo defaultValue="a" disabledBeta />)

    fireEvent.click(tab('Beta'))
    await wait(500)

    expect(selected()).toBe('Alpha')
    expect(tab('Beta').getAttribute('aria-disabled')).toBe('true')
  })

  test('a value no panel carries leaves the box empty', () => {
    render(<MotionDemo value="z" />)

    expect(screen.queryByRole('tabpanel')).toBeNull()
  })

  test('the box takes the height of the open panel and follows it as it grows or shrinks', async () => {
    const observed: { callback: () => void; target?: Element }[] = []
    class FakeObserver {
      entry: { callback: () => void; target?: Element }
      constructor(callback: () => void) {
        this.entry = { callback }
        observed.push(this.entry)
      }
      observe(target: Element) {
        this.entry.target = target
      }
      unobserve() {}
      disconnect() {
        this.entry.target = undefined
      }
    }
    Object.defineProperty(globalThis, 'ResizeObserver', { configurable: true, value: FakeObserver })

    render(<MotionDemo defaultValue="a" />)
    const box = document.querySelector('[data-slot="tabs-contents"]') as HTMLElement
    const resize = async (height: number) => {
      const wrapper = screen.getByRole('tabpanel').parentElement as HTMLElement
      Object.defineProperty(wrapper, 'offsetHeight', { configurable: true, value: height })
      act(() => {
        for (const entry of observed) if (entry.target === wrapper) entry.callback()
      })
      for (let frame = 0; frame < 30 && box.style.height !== `${height}px`; frame++) await wait(100)
    }

    await resize(144)

    expect(box.style.height).toBe('144px')

    await resize(44)

    expect(box.style.height).toBe('44px')
    Reflect.deleteProperty(globalThis, 'ResizeObserver')
  })
})

describe.each([
  ['Tabs', Tabs, TabsList, TabsTrigger],
  ['MotionTabs', MotionTabs, MotionTabsList, MotionTabsTrigger],
] as const)('registry-ui %s tab stop', (_, Root, List, Trigger) => {
  test('with no tab selected, the stop moves on when the first tab turns disabled without its siblings rendering', async () => {
    let disableAlpha = () => {}
    function Alpha() {
      const [disabled, setDisabled] = React.useState(false)
      disableAlpha = () => setDisabled(true)
      return (
        <Trigger disabled={disabled} value="a">
          Alpha
        </Trigger>
      )
    }
    render(
      <Root>
        <List aria-label="Sections">
          <Alpha />
          <Trigger value="b">Beta</Trigger>
        </List>
      </Root>,
    )
    const stops = () => ['Alpha', 'Beta'].map((name) => screen.getByRole('tab', { name }).tabIndex)
    expect(stops()).toEqual([0, -1])

    await act(async () => disableAlpha())

    expect(stops()).toEqual([-1, 0])
  })
})
