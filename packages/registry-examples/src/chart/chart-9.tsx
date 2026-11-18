'use client'

import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@gentleduck/registry-ui/chart'
import { Bird, Feather } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'

const chartData = [
  { mallard: 42, month: 'January', swan: 6 },
  { mallard: 38, month: 'February', swan: 4 },
  { mallard: 51, month: 'March', swan: 0 },
  { mallard: 64, month: 'April', swan: 3 },
]

const chartConfig = {
  mallard: {
    color: '#2563eb',
    icon: Bird,
    label: 'Mallards',
  },
  swan: {
    icon: Feather,
    label: 'Swans',
    theme: { dark: '#e2e8f0', light: '#64748b' },
  },
} satisfies ChartConfig

export default function Demo() {
  return (
    <ChartContainer className="min-h-[200px] w-full" config={chartConfig}>
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          axisLine={false}
          dataKey="month"
          tickFormatter={(value) => value.slice(0, 3)}
          tickLine={false}
          tickMargin={10}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, name) => (
                <span className="flex w-full justify-between gap-4">
                  <span className="text-muted-foreground">{chartConfig[name as keyof typeof chartConfig].label}</span>
                  <span className="font-medium font-mono tabular-nums">
                    {value} {value === 1 ? 'bird' : 'birds'}
                  </span>
                </span>
              )}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} verticalAlign="top" />
        <Bar dataKey="mallard" fill="var(--color-mallard)" radius={4} stackId="ponds" />
        <Bar dataKey="swan" fill="var(--color-swan)" radius={4} stackId="ponds" />
      </BarChart>
    </ChartContainer>
  )
}
