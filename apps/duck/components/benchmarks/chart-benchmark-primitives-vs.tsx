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
} satisfies ChartConfig

const chartData = data.savingsVsRadix.map((s: { name: string; gentleduckKB: number; competitorKB: number }) => ({
  name: s.name,
  gentleduck: s.gentleduckKB,
  radix: s.competitorKB,
}))

export default function PrimitivesVsRadix() {
  return (
    <div className="w-full">
      <p className="mb-3 text-muted-foreground text-xs">
        {chartData.length} components both libraries ship, each bundled the same way. Per-component gzipped size (KB).
      </p>
      <ChartContainer className="aspect-[3/2] min-h-[450px] w-full" config={config}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
          <CartesianGrid horizontal={false} />
          <YAxis dataKey="name" type="category" width={110} tickLine={false} axisLine={false} fontSize={11} />
          <XAxis type="number" tickLine={false} axisLine={false} fontSize={10} />
          <ChartTooltip content={<ChartTooltipContent indicator="dashed" />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="gentleduck" fill="var(--color-gentleduck)" radius={[0, 4, 4, 0]} barSize={10} />
          <Bar dataKey="radix" fill="var(--color-radix)" radius={[0, 4, 4, 0]} barSize={10} />
        </BarChart>
      </ChartContainer>
    </div>
  )
}
