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
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import data from '../../../../apps/duck/public/data/benchmarks/calendar.json'

const tabs = ['Bundle Size', 'Total Cost'] as const
type Tab = (typeof tabs)[number]

const bundleConfig = {
  sizeKB: { label: 'JS Size (KB)', color: 'var(--chart-1)' },
} satisfies ChartConfig

const totalCostConfig = {
  js: { label: 'JavaScript (KB)', color: 'var(--chart-1)' },
  css: { label: 'CSS (KB)', color: 'var(--chart-2)' },
} satisfies ChartConfig

const totalCost = (data as Record<string, unknown>).totalCost as { name: string; js: number; css: number }[] | undefined

export default function CalendarBenchmarkVs() {
  const [tab, setTab] = React.useState<Tab>('Bundle Size')

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

      <div className="h-[320px]">
        {tab === 'Bundle Size' && (
          <div>
            <p className="mb-3 text-muted-foreground text-xs">
              Gzipped JS. The first five are measured; react-datepicker and react-calendar are published sizes.
            </p>
            <ChartContainer className="aspect-[2/1] min-h-[250px] w-full" config={bundleConfig}>
              <BarChart data={data.bundleSize} layout="vertical" margin={{ left: 10, right: 30, top: 5, bottom: 5 }}>
                <CartesianGrid horizontal={false} />
                <YAxis dataKey="name" type="category" width={160} tickLine={false} axisLine={false} fontSize={11} />
                <XAxis type="number" tickLine={false} axisLine={false} fontSize={10} />
                <ChartTooltip content={<ChartTooltipContent indicator="dashed" />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="sizeKB" fill="var(--color-sizeKB)" radius={[0, 4, 4, 0]} barSize={14} />
              </BarChart>
            </ChartContainer>
          </div>
        )}

        {tab === 'Total Cost' && totalCost && (
          <div>
            <p className="mb-3 text-muted-foreground text-xs">
              Total download cost: JavaScript + required CSS (stacked).
            </p>
            <ChartContainer className="aspect-[2/1] min-h-[250px] w-full" config={totalCostConfig}>
              <BarChart data={totalCost} layout="vertical" margin={{ left: 10, right: 30, top: 5, bottom: 5 }}>
                <CartesianGrid horizontal={false} />
                <YAxis dataKey="name" type="category" width={160} tickLine={false} axisLine={false} fontSize={11} />
                <XAxis type="number" tickLine={false} axisLine={false} fontSize={10} />
                <ChartTooltip content={<ChartTooltipContent indicator="dashed" />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="js" fill="var(--color-js)" radius={[0, 0, 0, 0]} barSize={16} stackId="cost" />
                <Bar dataKey="css" fill="var(--color-css)" radius={[0, 4, 4, 0]} barSize={16} stackId="cost" />
              </BarChart>
            </ChartContainer>
          </div>
        )}
      </div>
    </div>
  )
}
