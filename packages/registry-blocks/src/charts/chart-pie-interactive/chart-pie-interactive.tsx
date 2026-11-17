'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@gentleduck/registry-ui/card'
import {
  type ChartConfig,
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
} from '@gentleduck/registry-ui/chart'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@gentleduck/registry-ui/select'
import * as React from 'react'
import { Label, Pie, PieChart, type PieSectorDataItem, Sector } from 'recharts'

export const description = 'An interactive pie chart'

const desktopData = [
  { desktop: 186, fill: 'var(--color-january)', month: 'january' },
  { desktop: 305, fill: 'var(--color-february)', month: 'february' },
  { desktop: 237, fill: 'var(--color-march)', month: 'march' },
  { desktop: 173, fill: 'var(--color-april)', month: 'april' },
  { desktop: 209, fill: 'var(--color-may)', month: 'may' },
]

const chartConfig = {
  april: {
    color: 'var(--chart-4)',
    label: 'April',
  },
  desktop: {
    label: 'Desktop',
  },
  february: {
    color: 'var(--chart-2)',
    label: 'February',
  },
  january: {
    color: 'var(--chart-1)',
    label: 'January',
  },
  march: {
    color: 'var(--chart-3)',
    label: 'March',
  },
  may: {
    color: 'var(--chart-5)',
    label: 'May',
  },
  mobile: {
    label: 'Mobile',
  },
  visitors: {
    label: 'Visitors',
  },
} satisfies ChartConfig

export default function Component() {
  const id = 'pie-interactive'
  const [activeMonth, setActiveMonth] = React.useState(desktopData[0]?.month)

  const activeIndex = React.useMemo(() => desktopData.findIndex((item) => item.month === activeMonth), [activeMonth])
  const months = React.useMemo(() => desktopData.map((item) => item.month), [])

  return (
    <Card className="flex flex-col" data-chart={id}>
      <ChartStyle config={chartConfig} id={id} />
      <CardHeader className="flex-row items-start space-y-0 pb-0">
        <div className="grid gap-1">
          <CardTitle>Pie Chart - Interactive</CardTitle>
          <CardDescription>January - June 2024</CardDescription>
        </div>
        <Select onValueChange={setActiveMonth} value={activeMonth}>
          <SelectTrigger aria-label="Select a value" className="ms-auto h-7 w-[130px] rounded-lg ps-2.5">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent align="end" className="rounded-xl" side="bottom">
            {months.map((key) => {
              const config = chartConfig[key as keyof typeof chartConfig]

              if (!config) {
                return null
              }

              return (
                <SelectItem className="rounded-lg [&_span]:flex" key={key} value={key}>
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className="flex h-3 w-3 shrink-0 rounded-sm"
                      style={{
                        backgroundColor: `var(--color-${key})`,
                      }}
                    />
                    {config?.label}
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex flex-1 justify-center pb-0">
        <ChartContainer className="mx-auto aspect-square w-full max-w-[300px]" config={chartConfig} id={id}>
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} cursor={false} defaultIndex={activeIndex} />
            <Pie
              activeShape={({ outerRadius = 0, ...props }: PieSectorDataItem) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 10} />
                  <Sector {...props} innerRadius={outerRadius + 12} outerRadius={outerRadius + 25} />
                </g>
              )}
              data={desktopData}
              dataKey="desktop"
              innerRadius={60}
              nameKey="month"
              strokeWidth={5}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text dominantBaseline="middle" textAnchor="middle" x={viewBox.cx} y={viewBox.cy}>
                        <tspan className="fill-foreground font-bold text-3xl" x={viewBox.cx} y={viewBox.cy}>
                          {desktopData[activeIndex]?.desktop.toLocaleString()}
                        </tspan>
                        <tspan className="fill-muted-foreground" x={viewBox.cx} y={(viewBox.cy || 0) + 24}>
                          Visitors
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
