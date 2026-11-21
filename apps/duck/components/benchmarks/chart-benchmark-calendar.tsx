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
import data from '../../public/data/benchmarks/calendar.json'

const tabs = ['Modules', 'Performance', 'Adapters'] as const
type Tab = (typeof tabs)[number]

const COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'hsl(200 70% 50%)',
  'hsl(280 65% 55%)',
]

const perfConfig = { us: { label: 'Time (μs)', color: 'var(--chart-1)' } } satisfies ChartConfig
const adapterConfig = {
  buildMonth: { label: 'buildMonth (μs)', color: 'var(--chart-1)' },
  format: { label: 'format (μs)', color: 'var(--chart-3)' },
} satisfies ChartConfig

const modules = (data as Record<string, unknown>).moduleSizes as { name: string; sizeKB: number }[] | undefined
const pieData = modules
  ? modules.map((m, i) => ({ name: m.name, size: m.sizeKB, fill: COLORS[i % COLORS.length] }))
  : []
const pieConfig = {
  ...Object.fromEntries((modules ?? []).map((m, i) => [m.name, { label: m.name, color: COLORS[i % COLORS.length] }])),
  size: { label: 'Size (KB)' },
} as ChartConfig
const totalKB = modules ? modules.reduce((sum, m) => sum + m.sizeKB, 0) : 0

export default function CalendarBenchmarkSelf() {
  const [tab, setTab] = React.useState<Tab>('Modules')

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
        {tab === 'Modules' && pieData.length > 0 && (
          <div>
            <p className="mb-3 text-muted-foreground text-xs">Internal module breakdown of @gentleduck/calendar.</p>
            <ChartContainer className="mx-auto aspect-square min-h-[280px] max-w-[320px]" config={pieConfig}>
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel indicator="dot" />} cursor={false} />
                <Pie data={pieData} dataKey="size" nameKey="name" innerRadius={60} strokeWidth={3}>
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                        return (
                          <text dominantBaseline="middle" textAnchor="middle" x={viewBox.cx} y={viewBox.cy}>
                            <tspan className="fill-foreground font-bold text-2xl" x={viewBox.cx} y={viewBox.cy}>
                              {totalKB.toFixed(1)}
                            </tspan>
                            <tspan className="fill-muted-foreground text-xs" x={viewBox.cx} y={(viewBox.cy || 0) + 20}>
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

        {tab === 'Performance' && (
          <div>
            <p className="mb-3 text-muted-foreground text-xs">
              Core engine operations. Average of 2,000 iterations (us).
            </p>
            <ChartContainer className="aspect-[2/1] min-h-[220px] w-full" config={perfConfig}>
              <BarChart
                data={data.corePerformance}
                layout="vertical"
                margin={{ left: 10, right: 30, top: 5, bottom: 5 }}>
                <CartesianGrid horizontal={false} />
                <YAxis dataKey="label" type="category" width={160} tickLine={false} axisLine={false} fontSize={11} />
                <XAxis type="number" tickLine={false} axisLine={false} fontSize={10} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent indicator="line" labelFormatter={(_, payload) => payload[0]?.payload?.label} />
                  }
                />
                <Bar dataKey="us" fill="var(--color-us)" radius={[0, 4, 4, 0]} barSize={14} />
              </BarChart>
            </ChartContainer>
          </div>
        )}

        {tab === 'Adapters' && (
          <div>
            <p className="mb-3 text-muted-foreground text-xs">buildCalendarMonth + format across 4 calendar systems.</p>
            <ChartContainer className="aspect-[2/1] min-h-[200px] w-full" config={adapterConfig}>
              <BarChart data={data.adapterPerformance} margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={10} />
                <YAxis tickLine={false} axisLine={false} fontSize={10} />
                <ChartTooltip content={<ChartTooltipContent indicator="dashed" />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="buildMonth" fill="var(--color-buildMonth)" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="format" fill="var(--color-format)" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ChartContainer>
          </div>
        )}
      </div>
    </div>
  )
}
