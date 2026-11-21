'use client'

import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@gentleduck/registry-ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import data from '../../public/data/benchmarks/primitives.json'

const config = {
  gentleduck: { label: 'gentleduck (KB)', color: 'var(--chart-1)' },
  radix: { label: 'Radix UI (KB)', color: 'var(--chart-2)' },
  baseui: { label: 'Base UI (KB)', color: 'var(--chart-3)' },
} satisfies ChartConfig

const chartData = data.perComponent.map((c: { name: string; gentleduck: number; radix: number; baseui: number }) => ({
  name: c.name,
  gentleduck: c.gentleduck > 0 ? +(c.gentleduck / 1024).toFixed(1) : 0,
  radix: c.radix > 0 ? +(c.radix / 1024).toFixed(1) : 0,
  baseui: c.baseui > 0 ? +(c.baseui / 1024).toFixed(1) : 0,
}))

export default function PrimitivesAllComponents() {
  return (
    <div className="w-full">
      <p className="mb-3 text-muted-foreground text-xs">
        All {chartData.length} components. 0 KB means the library does not ship that primitive.
      </p>
      <ChartContainer className="aspect-[1/2] min-h-[950px] w-full" config={config}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
          <CartesianGrid horizontal={false} />
          <YAxis dataKey="name" type="category" width={110} tickLine={false} axisLine={false} fontSize={11} />
          <XAxis type="number" tickLine={false} axisLine={false} fontSize={10} />
          <ChartTooltip content={<ChartTooltipContent indicator="dashed" />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="gentleduck" fill="var(--color-gentleduck)" radius={[0, 4, 4, 0]} barSize={7} />
          <Bar dataKey="radix" fill="var(--color-radix)" radius={[0, 4, 4, 0]} barSize={7} />
          <Bar dataKey="baseui" fill="var(--color-baseui)" radius={[0, 4, 4, 0]} barSize={7} />
        </BarChart>
      </ChartContainer>
    </div>
  )
}
