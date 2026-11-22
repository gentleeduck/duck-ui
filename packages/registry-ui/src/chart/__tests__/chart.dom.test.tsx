import { cleanup, render, screen } from '@testing-library/react'
import type * as React from 'react'
import type { LegendPayload, TooltipPayloadEntry } from 'recharts'
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest'
import { ChartContainer, ChartLegendContent, ChartStyle, ChartTooltipContent } from '../chart'
import { getPayloadConfigFromPayload, isSafeCssColor } from '../chart.libs'
import type { IChartConfig } from '../chart.types'

// jsdom has no layout and no ResizeObserver, and the chart's ResponsiveContainer draws nothing at 0 by 0, so the
// observer reports a box of 640 by 360.
beforeAll(() => {
  Object.assign(globalThis, {
    ResizeObserver: class {
      constructor(private readonly report: ResizeObserverCallback) {}
      observe(target: Element) {
        this.report([{ target, contentRect: { width: 640, height: 360 } } as ResizeObserverEntry], this)
      }
      unobserve() {}
      disconnect() {}
    },
  })
})
afterAll(() => {
  Reflect.deleteProperty(globalThis, 'ResizeObserver')
})
afterEach(cleanup)

function Duck() {
  return <svg data-testid="duck-icon" />
}

const config = {
  mallard: { color: '#2a9d8f', label: 'Mallards' },
  teal: { label: 'Teals', theme: { dark: '#e9c46a', light: '#264653' } },
  swan: { color: 'white', icon: Duck, label: 'Swans' },
  january: { label: 'January, all ponds' },
} satisfies IChartConfig

type Entry = TooltipPayloadEntry<string | number, string | number>

const mallards = { color: '#2a9d8f', dataKey: 'mallard', name: 'mallard', value: 1200, payload: { month: 'jan' } }
const teals = { color: '#264653', dataKey: 'teal', name: 'teal', value: 30, payload: { month: 'jan', fill: '#111111' } }

function chart(children: React.ReactNode, chartConfig: IChartConfig = config) {
  return render(<ChartContainer config={chartConfig}>{children}</ChartContainer>)
}

function rows() {
  return Array.from(document.querySelectorAll('[data-slot="tooltip-item"]'), (row) => row.textContent)
}

function indicators() {
  return Array.from(document.querySelectorAll<HTMLElement>('[data-slot="tooltip-item"] > div:first-child'))
}

describe('registry-ui ChartTooltipContent', () => {
  test('shows nothing while the pointer is off the chart, or over no data', () => {
    chart(
      <>
        <ChartTooltipContent payload={[mallards as Entry]} />
        <ChartTooltipContent active payload={[]} />
      </>,
    )

    expect(document.querySelector('[data-slot="tooltip-content"]')).toBeNull()
  })

  test('names each series from the config, beside its value and colour', () => {
    chart(<ChartTooltipContent active label="March" payload={[mallards, teals] as Entry[]} />)

    expect(screen.getByText('March').getAttribute('data-slot')).toBe('tooltip-label')
    expect(rows()).toEqual([`Mallards${(1200).toLocaleString()}`, 'Teals30'])
    const [mallard, teal] = indicators()
    expect(mallard.className.split(' ')).toContain('size-2.5')
    expect(mallard.style.getPropertyValue('--color-bg')).toBe('#2a9d8f')
    expect(teal.style.getPropertyValue('--color-bg')).toBe('#111111')
  })

  test('shows a value of 0 as a value', () => {
    chart(<ChartTooltipContent active payload={[{ ...mallards, value: 0 }] as Entry[]} />)

    const value = document.querySelector('[data-slot="tooltip-item"] .font-mono')
    expect(value?.textContent).toBe('0')
  })

  test('names a row by its dataKey, then its own name, and by nothing without either', () => {
    chart(
      <ChartTooltipContent
        active
        hideLabel
        payload={
          [
            { dataKey: 'mallard', value: 1, payload: {} },
            { name: 'heron', value: 2, payload: {} },
            { value: 3, payload: {} },
          ] as Entry[]
        }
      />,
    )

    expect(rows()).toEqual(['Mallards1', 'heron2', '3'])
  })

  test("takes the label from the first series' name without a dataKey, and shows none without either", () => {
    const { unmount } = chart(
      <ChartTooltipContent active payload={[{ name: 'teal', value: 2, payload: {} }] as Entry[]} />,
    )
    expect(document.querySelector('[data-slot="tooltip-label"]')?.textContent).toBe('Teals')
    unmount()

    chart(<ChartTooltipContent active payload={[{ value: 3, payload: {} }] as Entry[]} />)
    expect(document.querySelector('[data-slot="tooltip-label"]')).toBeNull()
  })

  test('reads the label from the config, by the label or by labelKey', () => {
    const { unmount } = chart(<ChartTooltipContent active label="january" payload={[mallards] as Entry[]} />)
    expect(screen.getByText('January, all ponds')).toBeTruthy()
    unmount()

    chart(
      <ChartTooltipContent
        active
        labelKey="month"
        payload={[{ ...mallards, payload: { month: 'swan' } }] as Entry[]}
      />,
    )
    expect(document.querySelector('[data-slot="tooltip-label"]')?.textContent).toBe('Swans')
  })

  test('formats the label and the rows when told to, and hides what it is told to', () => {
    const { unmount } = chart(
      <ChartTooltipContent
        active
        formatter={(value, name) => <b>{`${name}: ${value} ducks`}</b>}
        label="March"
        labelFormatter={(value, payload) => `${value} (${payload.length} series)`}
        payload={[mallards, teals] as Entry[]}
      />,
    )
    expect(screen.getByText('March (2 series)')).toBeTruthy()
    expect(rows()).toEqual(['mallard: 1200 ducks', 'teal: 30 ducks'])
    unmount()

    chart(<ChartTooltipContent active hideIndicator hideLabel label="March" payload={[mallards] as Entry[]} />)
    expect(document.querySelector('[data-slot="tooltip-label"]')).toBeNull()
    expect(document.querySelector('[data-slot="tooltip-item"]')?.children).toHaveLength(1)
  })

  test('draws a line or a dashed indicator, nesting a single series label beside it', () => {
    const { unmount } = chart(
      <ChartTooltipContent active indicator="line" label="March" payload={[mallards] as Entry[]} />,
    )
    expect(indicators()[0].className.split(' ')).toContain('w-1')
    expect(document.querySelector('[data-slot="tooltip-items"] [data-slot="tooltip-label"]')?.textContent).toBe('March')
    unmount()

    chart(
      <ChartTooltipContent
        active
        color="#ff0000"
        indicator="dashed"
        label="March"
        payload={[mallards, teals] as Entry[]}
      />,
    )
    const [dashed] = indicators()
    expect(dashed.className.split(' ')).toContain('border-dashed')
    expect(dashed.className.split(' ')).not.toContain('my-0.5')
    expect(dashed.style.getPropertyValue('--color-bg')).toBe('#ff0000')
    expect(document.querySelector('[data-slot="tooltip-items"] [data-slot="tooltip-label"]')).toBeNull()
  })

  test("draws a series' icon in place of its indicator, and names a row by nameKey", () => {
    chart(
      <ChartTooltipContent
        active
        nameKey="kind"
        payload={[{ dataKey: 'count', name: 'count', value: 4, payload: { kind: 'swan' } }] as Entry[]}
      />,
    )

    expect(screen.getByTestId('duck-icon')).toBeTruthy()
    expect(rows()).toEqual(['Swans4'])
    expect(document.querySelector('[data-slot="tooltip-label"]')).toBeNull()
  })

  test('refuses to render outside a ChartContainer', () => {
    const quiet = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<ChartTooltipContent active payload={[mallards] as Entry[]} />)).toThrow(
      'useChart must be used within a <ChartContainer />',
    )
    quiet.mockRestore()
  })
})

describe('registry-ui ChartLegendContent', () => {
  const legend = [
    { color: '#2a9d8f', dataKey: 'mallard', value: 'mallard', type: 'square' },
    { color: '#ffffff', dataKey: 'swan', value: 'swan', type: 'square' },
  ] as LegendPayload[]

  test('names each series from the config, with its icon or a swatch of its colour', () => {
    chart(<ChartLegendContent payload={legend} />)

    const items = Array.from(document.querySelectorAll('[data-slot="legend-item"]'))
    expect(items.map((item) => item.textContent)).toEqual(['Mallards', 'Swans'])
    expect((items[0].firstElementChild as HTMLElement).style.backgroundColor).toBe('rgb(42, 157, 143)')
    expect(screen.getByTestId('duck-icon')).toBeTruthy()
    expect(document.querySelector('[data-slot="legend-content"]')?.className.split(' ')).toContain('pt-3')
  })

  test('swaps icons for swatches, sits above the chart, and names items by nameKey', () => {
    chart(
      <ChartLegendContent
        hideIcon
        nameKey="kind"
        payload={[{ color: '#000000', dataKey: 'count', value: 'count', payload: { kind: 'teal' } }] as LegendPayload[]}
        verticalAlign="top"
      />,
    )

    expect(screen.queryByTestId('duck-icon')).toBeNull()
    expect(document.querySelector('[data-slot="legend-item"]')?.textContent).toBe('Teals')
    expect(document.querySelector('[data-slot="legend-content"]')?.className.split(' ')).toContain('pb-3')
  })

  test('names an item that has no dataKey by its value', () => {
    chart(<ChartLegendContent payload={[{ color: '#2a9d8f', value: 'mallard', type: 'square' }] as LegendPayload[]} />)

    expect(document.querySelector('[data-slot="legend-item"]')?.textContent).toBe('Mallards')
  })

  test('shows nothing without a series', () => {
    chart(<ChartLegendContent payload={[]} />)

    expect(document.querySelector('[data-slot="legend-content"]')).toBeNull()
  })
})

describe('registry-ui ChartStyle', () => {
  test('writes a light and a dark colour for a themed series, and a single colour for the rest', () => {
    const { container } = render(<ChartStyle config={config} id="ponds" />)

    const css = container.querySelector('style')?.innerHTML ?? ''
    expect(css).toContain(
      ' [data-chart=ponds] {\n  --color-mallard: #2a9d8f;\n  --color-teal: #264653;\n  --color-swan: white;\n}',
    )
    expect(css).toContain('.dark [data-chart=ponds] {\n  --color-mallard: #2a9d8f;\n  --color-teal: #e9c46a;')
  })

  test('writes nothing for a config without a colour, or for an unsafe id', () => {
    const { container } = render(
      <>
        <ChartStyle config={{ january: { label: 'January' } }} id="ponds" />
        <ChartStyle config={config} id="a b" />
      </>,
    )

    expect(container.innerHTML).toBe('')
  })

  test('takes a safe id of its own on the container, and makes one up for an unsafe id', () => {
    const { container } = render(
      <>
        <ChartContainer config={config} id="ponds">
          <div />
        </ChartContainer>
        <ChartContainer config={config} id="a b">
          <div />
        </ChartContainer>
      </>,
    )

    const [own, made] = Array.from(container.querySelectorAll('[data-slot="chart-container"]'))
    expect(own.getAttribute('data-chart')).toBe('chart-ponds')
    expect(made.getAttribute('data-chart')).toMatch(/^chart-[^\s:]+$/)
    expect(made.getAttribute('data-chart')).not.toBe('chart-a b')
  })
})

describe('registry-ui chart libs', () => {
  test('finds a series in the config by the key, by a name the entry holds, or by one its data holds', () => {
    expect(getPayloadConfigFromPayload(config, { dataKey: 'teal' }, 'teal')?.label).toBe('Teals')
    expect(getPayloadConfigFromPayload(config, { name: 'swan' }, 'name')?.label).toBe('Swans')
    expect(getPayloadConfigFromPayload(config, { payload: { kind: 'mallard' } }, 'kind')?.label).toBe('Mallards')
    expect(getPayloadConfigFromPayload(config, { payload: { kind: 3 } }, 'kind')).toBeUndefined()
    expect(getPayloadConfigFromPayload(config, null, 'teal')).toBeUndefined()
    expect(getPayloadConfigFromPayload(config, 'teal', 'teal')).toBeUndefined()
  })

  test('takes a colour only in a form that cannot leave its declaration', () => {
    expect(
      ['#fff', 'rgb(1, 2, 3)', 'hsl(var(--x))', 'var(--chart-1)', 'RebeccaPurple', 'currentColor'].map(isSafeCssColor),
    ).toEqual([true, true, false, true, true, true])
    expect(isSafeCssColor('red;}body{display:none')).toBe(false)
    expect(isSafeCssColor(7 as unknown as string)).toBe(false)
  })
})
