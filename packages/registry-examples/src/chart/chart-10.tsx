'use client'

import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@gentleduck/registry-ui/chart'
import { Monitor, Smartphone } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'

const data = [
  { browser: 'chrome', desktop: 186, mobile: 80 },
  { browser: 'safari', desktop: 305, mobile: 200 },
  { browser: 'firefox', desktop: 237, mobile: 120 },
]

const config = {
  chrome: { label: 'Chrome' },
  desktop: { color: 'var(--chart-1)', icon: Monitor, label: 'Desktop' },
  firefox: { label: 'Firefox' },
  mobile: { color: 'var(--chart-2)', icon: Smartphone, label: 'Mobile' },
  safari: { label: 'Safari' },
} satisfies ChartConfig

export default function Demo() {
  return (
    <ChartContainer className="h-[220px] w-full max-w-md" config={config}>
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          axisLine={false}
          dataKey="browser"
          tickFormatter={(value) => config[value as keyof typeof config].label}
          tickLine={false}
        />
        <ChartTooltip
          content={<ChartTooltipContent hideIndicator labelClassName="text-primary" labelKey="browser" />}
        />
        <ChartLegend content={<ChartLegendContent hideIcon />} />
        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
        <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
