'use client'

import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@gentleduck/registry-ui/chart'
import * as React from 'react'
import { Bar, BarChart, CartesianGrid, Label, Pie, PieChart, XAxis, YAxis } from 'recharts'
import data from '../../public/data/benchmarks/primitives.json'

const tabs = ['Module Sizes', 'Total'] as const
type Tab = (typeof tabs)[number]

const COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'hsl(200 70% 50%)',
  'hsl(280 65% 55%)',
  'hsl(340 75% 55%)',
  'hsl(160 60% 45%)',
]

const totalConfig = {
  sizeKB: { label: 'Size (KB)', color: 'var(--chart-1)' },
  components: { label: 'Components', color: 'var(--chart-3)' },
} satisfies ChartConfig

const topModules = data.allSizes.slice(0, 8)
const otherSize = data.allSizes.slice(8).reduce((sum: number, m: { sizeKB: number }) => sum + m.sizeKB, 0)
const pieData = [
  ...topModules.map((m: { name: string; sizeKB: number }, i: number) => ({
    name: m.name,
    size: m.sizeKB,
    fill: COLORS[i % COLORS.length],
  })),
  { name: 'other', size: +otherSize.toFixed(1), fill: 'var(--chart-5)' },
]
const pieConfig = {
  ...Object.fromEntries(
    topModules.map((m: { name: string }, i: number) => [m.name, { label: m.name, color: COLORS[i % COLORS.length] }]),
  ),
  other: { label: `Other (${data.allSizes.length - 8} modules)`, color: 'var(--chart-5)' },
  size: { label: 'Size (KB)' },
} as ChartConfig

const totalKB = data.allSizes.reduce((sum: number, m: { sizeKB: number }) => sum + m.sizeKB, 0)

export default function PrimitivesBenchmarkOverview() {
  const [tab, setTab] = React.useState<Tab>('Module Sizes')

  return (
    <div className="w-full space-y-4">
      <div className="flex w-fit gap-1 rounded-lg bg-muted p-1">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-md px-3 py-1.5 font-medium text-xs transition-colors ${tab === t ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="min-h-[320px]">
        {tab === 'Module Sizes' && (
          <div>
            <p className="mb-3 text-muted-foreground text-xs">Internal module breakdown. Top 8 + rest grouped.</p>
            <ChartContainer className="mx-auto aspect-square min-h-[380px] max-w-[400px]" config={pieConfig}>
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel indicator="dot" />} cursor={false} />
                <Pie data={pieData} dataKey="size" nameKey="name" innerRadius={65} strokeWidth={3}>
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                        return (
                          <text dominantBaseline="middle" textAnchor="middle" x={viewBox.cx} y={viewBox.cy}>
                            <tspan className="fill-foreground font-bold text-3xl" x={viewBox.cx} y={viewBox.cy}>
                              {totalKB.toFixed(0)}
                            </tspan>
                            <tspan className="fill-muted-foreground text-xs" x={viewBox.cx} y={(viewBox.cy || 0) + 22}>
                              KB total
                            </tspan>
                          </text>
                        )
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          </div>
        )}

        {tab === 'Total' && (
          <div>
            <p className="mb-3 text-muted-foreground text-xs">
              Total package size vs component count across headless UI libraries.
            </p>
            <ChartContainer className="aspect-[2/1] min-h-[280px] w-full" config={totalConfig}>
              <BarChart data={data.totalComparison} margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis tickLine={false} axisLine={false} fontSize={10} />
                <ChartTooltip content={<ChartTooltipContent indicator="dashed" />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="sizeKB" fill="var(--color-sizeKB)" radius={[4, 4, 0, 0]} barSize={28} />
                <Bar dataKey="components" fill="var(--color-components)" radius={[4, 4, 0, 0]} barSize={28} />
              </BarChart>
            </ChartContainer>
          </div>
        )}
      </div>
    </div>
  )
}
