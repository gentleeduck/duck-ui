}>
  **Recharts v3 is here.** Charts have been upgraded to [Recharts v3](https://recharts.org/) with server-side rendering via `next/dynamic`, improved accessibility (enabled by default), and smaller client bundles. No changes needed on your end  -  the API is the same.

```tsx title="components/chart-1.tsx"
// import from your project: import Demo from '@/components/chart-1'
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@gentleduck/registry-ui/card'
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@gentleduck/registry-ui/chart'
import * as React from 'react'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'
const chartData = [
  { date: '2024-04-01', desktop: 222, mobile: 150 },
  { date: '2024-04-02', desktop: 97, mobile: 180 },
  { date: '2024-04-03', desktop: 167, mobile: 120 },
  { date: '2024-04-04', desktop: 242, mobile: 260 },
  { date: '2024-04-05', desktop: 373, mobile: 290 },
  { date: '2024-04-06', desktop: 301, mobile: 340 },
  { date: '2024-04-07', desktop: 245, mobile: 180 },
  { date: '2024-04-08', desktop: 409, mobile: 320 },
  { date: '2024-04-09', desktop: 59, mobile: 110 },
  { date: '2024-04-10', desktop: 261, mobile: 190 },
  { date: '2024-04-11', desktop: 327, mobile: 350 },
  { date: '2024-04-12', desktop: 292, mobile: 210 },
  { date: '2024-04-13', desktop: 342, mobile: 380 },
  { date: '2024-04-14', desktop: 137, mobile: 220 },
  { date: '2024-04-15', desktop: 120, mobile: 170 },
  { date: '2024-04-16', desktop: 138, mobile: 190 },
  { date: '2024-04-17', desktop: 446, mobile: 360 },
  { date: '2024-04-18', desktop: 364, mobile: 410 },
  { date: '2024-04-19', desktop: 243, mobile: 180 },
  { date: '2024-04-20', desktop: 89, mobile: 150 },
  { date: '2024-04-21', desktop: 137, mobile: 200 },
  { date: '2024-04-22', desktop: 224, mobile: 170 },
  { date: '2024-04-23', desktop: 138, mobile: 230 },
  { date: '2024-04-24', desktop: 387, mobile: 290 },
  { date: '2024-04-25', desktop: 215, mobile: 250 },
  { date: '2024-04-26', desktop: 75, mobile: 130 },
  { date: '2024-04-27', desktop: 383, mobile: 420 },
  { date: '2024-04-28', desktop: 122, mobile: 180 },
  { date: '2024-04-29', desktop: 315, mobile: 240 },
  { date: '2024-04-30', desktop: 454, mobile: 380 },
  { date: '2024-05-01', desktop: 165, mobile: 220 },
  { date: '2024-05-02', desktop: 293, mobile: 310 },
  { date: '2024-05-03', desktop: 247, mobile: 190 },
  { date: '2024-05-04', desktop: 385, mobile: 420 },
  { date: '2024-05-05', desktop: 481, mobile: 390 },
  { date: '2024-05-06', desktop: 498, mobile: 520 },
  { date: '2024-05-07', desktop: 388, mobile: 300 },
  { date: '2024-05-08', desktop: 149, mobile: 210 },
  { date: '2024-05-09', desktop: 227, mobile: 180 },
  { date: '2024-05-10', desktop: 293, mobile: 330 },
  { date: '2024-05-11', desktop: 335, mobile: 270 },
  { date: '2024-05-12', desktop: 197, mobile: 240 },
  { date: '2024-05-13', desktop: 197, mobile: 160 },
  { date: '2024-05-14', desktop: 448, mobile: 490 },
  { date: '2024-05-15', desktop: 473, mobile: 380 },
  { date: '2024-05-16', desktop: 338, mobile: 400 },
  { date: '2024-05-17', desktop: 499, mobile: 420 },
  { date: '2024-05-18', desktop: 315, mobile: 350 },
  { date: '2024-05-19', desktop: 235, mobile: 180 },
  { date: '2024-05-20', desktop: 177, mobile: 230 },
  { date: '2024-05-21', desktop: 82, mobile: 140 },
  { date: '2024-05-22', desktop: 81, mobile: 120 },
  { date: '2024-05-23', desktop: 252, mobile: 290 },
  { date: '2024-05-24', desktop: 294, mobile: 220 },
  { date: '2024-05-25', desktop: 201, mobile: 250 },
  { date: '2024-05-26', desktop: 213, mobile: 170 },
  { date: '2024-05-27', desktop: 420, mobile: 460 },
  { date: '2024-05-28', desktop: 233, mobile: 190 },
  { date: '2024-05-29', desktop: 78, mobile: 130 },
  { date: '2024-05-30', desktop: 340, mobile: 280 },
  { date: '2024-05-31', desktop: 178, mobile: 230 },
  { date: '2024-06-01', desktop: 178, mobile: 200 },
  { date: '2024-06-02', desktop: 470, mobile: 410 },
  { date: '2024-06-03', desktop: 103, mobile: 160 },
  { date: '2024-06-04', desktop: 439, mobile: 380 },
  { date: '2024-06-05', desktop: 88, mobile: 140 },
  { date: '2024-06-06', desktop: 294, mobile: 250 },
  { date: '2024-06-07', desktop: 323, mobile: 370 },
  { date: '2024-06-08', desktop: 385, mobile: 320 },
  { date: '2024-06-09', desktop: 438, mobile: 480 },
  { date: '2024-06-10', desktop: 155, mobile: 200 },
  { date: '2024-06-11', desktop: 92, mobile: 150 },
  { date: '2024-06-12', desktop: 492, mobile: 420 },
  { date: '2024-06-13', desktop: 81, mobile: 130 },
  { date: '2024-06-14', desktop: 426, mobile: 380 },
  { date: '2024-06-15', desktop: 307, mobile: 350 },
  { date: '2024-06-16', desktop: 371, mobile: 310 },
  { date: '2024-06-17', desktop: 475, mobile: 520 },
  { date: '2024-06-18', desktop: 107, mobile: 170 },
  { date: '2024-06-19', desktop: 341, mobile: 290 },
  { date: '2024-06-20', desktop: 408, mobile: 450 },
  { date: '2024-06-21', desktop: 169, mobile: 210 },
  { date: '2024-06-22', desktop: 317, mobile: 270 },
  { date: '2024-06-23', desktop: 480, mobile: 530 },
  { date: '2024-06-24', desktop: 132, mobile: 180 },
  { date: '2024-06-25', desktop: 141, mobile: 190 },
  { date: '2024-06-26', desktop: 434, mobile: 380 },
  { date: '2024-06-27', desktop: 448, mobile: 490 },
  { date: '2024-06-28', desktop: 149, mobile: 200 },
  { date: '2024-06-29', desktop: 103, mobile: 160 },
  { date: '2024-06-30', desktop: 446, mobile: 400 },
]

const chartConfig = {
  desktop: {
    color: 'var(--chart-1)',
    label: 'Desktop',
  },
  mobile: {
    color: 'var(--chart-2)',
    label: 'Mobile',
  },
  views: {
    label: 'Page Views',
  },
} satisfies ChartConfig

export default function Demo() {
  const [activeChart, setActiveChart] = React.useState<keyof typeof chartConfig>('desktop')

  const total = React.useMemo(
    () => ({
      desktop: chartData.reduce((acc, curr) => acc + curr.desktop, 0),
      mobile: chartData.reduce((acc, curr) => acc + curr.mobile, 0),
    }),
    [],
  )

  return (
    <div>
      <Card className="rounded-sm border-none">
        <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
          <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
            <CardTitle>Bar Chart - Interactive</CardTitle>
            <CardDescription>Showing total visitors for the last 3 months</CardDescription>
          </div>
          <div className="flex">
            {['desktop', 'mobile'].map((key) => {
              const chart = key as keyof typeof chartConfig
              return (
                <button
                  aria-pressed={activeChart === chart}
                  className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-start even:border-s data-[active=true]:bg-muted/50 sm:border-s sm:border-t-0 sm:px-8 sm:py-6"
                  data-active={activeChart === chart}
                  key={chart}
                  onClick={() => setActiveChart(chart)}
                  type="button">
                  <span className="text-muted-foreground text-xs">{chartConfig[chart].label}</span>
                  <span className="font-bold text-lg leading-none sm:text-3xl">
                    {total[key as keyof typeof total].toLocaleString()}
                  </span>
                </button>
              )
            })}
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:p-6">
          <ChartContainer className="aspect-auto h-[250px] w-full" config={chartConfig}>
            <BarChart
              data={chartData}
              margin={{
                left: 12,
                right: 12,
              }}>
              <CartesianGrid vertical={false} />
              <XAxis
                axisLine={false}
                dataKey="date"
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short',
                  })
                }}
                tickLine={false}
                tickMargin={8}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-[150px]"
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    }}
                    nameKey="views"
                  />
                }
              />
              <Bar
                dataKey={activeChart}
                fill={`${'color' in chartConfig[activeChart] ? chartConfig[activeChart].color : ''}`}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
```

Introducing **Charts**. A collection of chart components that you can copy and paste into your apps.

Charts are designed to look great out of the box. They work well with the other components and are fully customizable to fit your project.

[Browse the Charts Library](/charts).

## Philosophy

Charts turn data into stories. We wrap Recharts because building accessible, responsive, animated SVG charts from scratch is a multi-month project  -  not a component library feature. Our layer adds consistent theming (via ChartConfig), accessible tooltips and legends, and the visual polish that makes charts feel native to your design system.

## How It's Built

## Installation

CLI
Manual

Run the following command to install `chart.tsx`

```bash
npx @gentleduck/cli add chart
```

Add the following colors to your CSS file

```css title="app/globals.css" showLineNumbers
@layer base {
  :root {
    --chart-1: oklch(0.646 0.222 41.116);
    --chart-2: oklch(0.6 0.118 184.704);
    --chart-3: oklch(0.398 0.07 227.392);
    --chart-4: oklch(0.828 0.189 84.429);
    --chart-5: oklch(0.769 0.188 70.08);
  }

  .dark {
    --chart-1: oklch(0.488 0.243 264.376);
    --chart-2: oklch(0.696 0.17 162.48);
    --chart-3: oklch(0.769 0.188 70.08);
    --chart-4: oklch(0.627 0.265 303.9);
    --chart-5: oklch(0.645 0.246 16.439);
  }
}
```

Install the following dependencies:

```bash
npm install recharts @gentleduck/libs 
```

Copy and paste the following code into `components/ui/chart.tsx`.

Add the following colors to your CSS file

```css title="app/globals.css" showLineNumbers
@layer base {
  :root {
    --chart-1: oklch(0.646 0.222 41.116);
    --chart-2: oklch(0.6 0.118 184.704);
    --chart-3: oklch(0.398 0.07 227.392);
    --chart-4: oklch(0.828 0.189 84.429);
    --chart-5: oklch(0.769 0.188 70.08);
  }

  .dark {
    --chart-1: oklch(0.488 0.243 264.376);
    --chart-2: oklch(0.696 0.17 162.48);
    --chart-3: oklch(0.769 0.188 70.08);
    --chart-4: oklch(0.627 0.265 303.9);
    --chart-5: oklch(0.645 0.246 16.439);
  }
}
```

## Usage

We use [Recharts](https://recharts.org/) under the hood.

We designed the `chart` component with composition in mind. **You build your charts using Recharts components and only bring in custom components, such as `ChartTooltip`, when and where you need it**.

```tsx showLineNumbers /ChartContainer/ /ChartTooltipContent/
import { Bar, BarChart } from "recharts"

import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

export function MyChart() {
  return (
    <ChartContainer>
      <BarChart data={data}>
        <Bar dataKey="value" />
        <ChartTooltip content={<ChartTooltipContent />} />
      </BarChart>
    </ChartContainer>
  )
}
```

We do not wrap Recharts. This means you're not locked into an abstraction. When a new Recharts version is released, you can follow the official upgrade path to upgrade your charts.

## Examples

### Your First Chart

Let's build your first chart. We'll build a bar chart, add a grid, axis, tooltip and legend.

Start by defining your data

The following data represents the number of desktop and mobile users for each month.

} className="mt-4">
  **Note:** Your data can be in any shape. You are not limited to the shape of the data below. Use the `dataKey` prop to map your data to the chart.
  

  ```tsx title="components/example-chart.tsx" showLineNumbers
  const chartData = [
    { month: "January", desktop: 186, mobile: 80 },
    { month: "February", desktop: 305, mobile: 200 },
    { month: "March", desktop: 237, mobile: 120 },
    { month: "April", desktop: 73, mobile: 190 },
    { month: "May", desktop: 209, mobile: 130 },
    { month: "June", desktop: 214, mobile: 140 },
  ]
  ```

  Define your chart config

  The chart config holds configuration for the chart. This is where you place human-readable strings, such as labels, icons and color tokens for theming.

  ```tsx title="components/example-chart.tsx" showLineNumbers
  import { type ChartConfig } from "@/components/ui/chart"

  const chartConfig = {
    desktop: {
      label: "Desktop",
      color: "#2563eb",
    },
    mobile: {
      label: "Mobile",
      color: "#60a5fa",
    },
  } satisfies ChartConfig
  ```

  Build your chart

  You can now build your chart using Recharts components.

  } className="mt-4 bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:border-amber-950">
    **Important:** Remember to set a `min-h-[VALUE]` on the `ChartContainer` component. This is required for the chart be responsive.
  

  

  ```tsx title="components/chart-2.tsx"
// import from your project: import Demo from '@/components/chart-2'
'use client'

import { type ChartConfig, ChartContainer } from '@gentleduck/registry-ui/chart'
import { Bar, BarChart } from 'recharts'

const chartData = [
  { desktop: 186, mobile: 80, month: 'January' },
  { desktop: 305, mobile: 200, month: 'February' },
  { desktop: 237, mobile: 120, month: 'March' },
  { desktop: 73, mobile: 190, month: 'April' },
  { desktop: 209, mobile: 130, month: 'May' },
  { desktop: 214, mobile: 140, month: 'June' },
]

const chartConfig = {
  desktop: {
    color: '#2563eb',
    label: 'Desktop',
  },
  mobile: {
    color: '#60a5fa',
    label: 'Mobile',
  },
} satisfies ChartConfig

export default function Demo() {
  return (
    <ChartContainer className="min-h-[200px] w-full" config={chartConfig}>
      <BarChart data={chartData}>
        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
        <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
```

### Add a Grid

Let's add a grid to the chart.

Import the `CartesianGrid` component.

```tsx /CartesianGrid/
import { Bar, BarChart, CartesianGrid } from "recharts"
```

Add the `CartesianGrid` component to your chart.

```tsx showLineNumbers {3}
<ChartContainer config={chartConfig} className="min-h-50 w-full">
  <BarChart accessibilityLayer data={chartData}>
    <CartesianGrid vertical={false} />
    <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
    <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
  </BarChart>
</ChartContainer>
```

```tsx title="components/chart-3.tsx"
// import from your project: import Demo from '@/components/chart-3'
'use client'

import { type ChartConfig, ChartContainer } from '@gentleduck/registry-ui/chart'
import { Bar, BarChart, CartesianGrid } from 'recharts'

const chartData = [
  { desktop: 186, mobile: 80, month: 'January' },
  { desktop: 305, mobile: 200, month: 'February' },
  { desktop: 237, mobile: 120, month: 'March' },
  { desktop: 73, mobile: 190, month: 'April' },
  { desktop: 209, mobile: 130, month: 'May' },
  { desktop: 214, mobile: 140, month: 'June' },
]

const chartConfig = {
  desktop: {
    color: '#2563eb',
    label: 'Desktop',
  },
  mobile: {
    color: '#60a5fa',
    label: 'Mobile',
  },
} satisfies ChartConfig

export default function Demo() {
  return (
    <ChartContainer className="min-h-[200px] w-full" config={chartConfig}>
      <BarChart data={chartData}>
        <CartesianGrid vertical={false} />
        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
        <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
```

### Add an Axis

To add an x-axis to the chart, we'll use the `XAxis` component.

Import the `XAxis` component.

```tsx /XAxis/
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
```

Add the `XAxis` component to your chart.

```tsx showLineNumbers {4-10}
<ChartContainer config={chartConfig} className="h-50 w-full">
  <BarChart accessibilityLayer data={chartData}>
    <CartesianGrid vertical={false} />
    <XAxis
      dataKey="month"
      tickLine={false}
      tickMargin={10}
      axisLine={false}
      tickFormatter={(value) => value.slice(0, 3)}
    />
    <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
    <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
  </BarChart>
</ChartContainer>
```

```tsx title="components/chart-4.tsx"
// import from your project: import Demo from '@/components/chart-4'
'use client'

import { type ChartConfig, ChartContainer } from '@gentleduck/registry-ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'

const chartData = [
  { desktop: 186, mobile: 80, month: 'January' },
  { desktop: 305, mobile: 200, month: 'February' },
  { desktop: 237, mobile: 120, month: 'March' },
  { desktop: 73, mobile: 190, month: 'April' },
  { desktop: 209, mobile: 130, month: 'May' },
  { desktop: 214, mobile: 140, month: 'June' },
]

const chartConfig = {
  desktop: {
    color: '#2563eb',
    label: 'Desktop',
  },
  mobile: {
    color: '#60a5fa',
    label: 'Mobile',
  },
} satisfies ChartConfig

export default function Demo() {
  return (
    <ChartContainer className="min-h-[200px] w-full" config={chartConfig}>
      <BarChart data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          axisLine={false}
          dataKey="month"
          tickFormatter={(value) => value.slice(0, 3)}
          tickLine={false}
          tickMargin={10}
        />
        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
        <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
```

### Add Tooltip

So far we've only used components from Recharts. They look great out of the box thanks to some customization in the `chart` component.

To add a tooltip, we'll use the custom `ChartTooltip` and `ChartTooltipContent` components from `chart`.

Import the `ChartTooltip` and `ChartTooltipContent` components.

```tsx
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
```

Add the components to your chart.

```tsx showLineNumbers {11}
<ChartContainer config={chartConfig} className="h-50 w-full">
  <BarChart accessibilityLayer data={chartData}>
    <CartesianGrid vertical={false} />
    <XAxis
      dataKey="month"
      tickLine={false}
      tickMargin={10}
      axisLine={false}
      tickFormatter={(value) => value.slice(0, 3)}
    />
    <ChartTooltip content={<ChartTooltipContent />} />
    <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
    <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
  </BarChart>
</ChartContainer>
```

```tsx title="components/chart-5.tsx"
// import from your project: import Demo from '@/components/chart-5'
'use client'

import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@gentleduck/registry-ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'

const chartData = [
  { desktop: 186, mobile: 80, month: 'January' },
  { desktop: 305, mobile: 200, month: 'February' },
  { desktop: 237, mobile: 120, month: 'March' },
  { desktop: 73, mobile: 190, month: 'April' },
  { desktop: 209, mobile: 130, month: 'May' },
  { desktop: 214, mobile: 140, month: 'June' },
]

const chartConfig = {
  desktop: {
    color: '#2563eb',
    label: 'Desktop',
  },
  mobile: {
    color: '#60a5fa',
    label: 'Mobile',
  },
} satisfies ChartConfig

export default function Demo() {
  return (
    <ChartContainer className="min-h-[200px] w-full" config={chartConfig}>
      <BarChart data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          axisLine={false}
          dataKey="month"
          tickFormatter={(value) => value.slice(0, 3)}
          tickLine={false}
          tickMargin={10}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
        <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
```

Hover to see the tooltips. Easy, right? Two components, and we've got a beautiful tooltip.

### Add Legend

We'll do the same for the legend. We'll use the `ChartLegend` and `ChartLegendContent` components from `chart`.

Import the `ChartLegend` and `ChartLegendContent` components.

```tsx
import { ChartLegend, ChartLegendContent } from "@/components/ui/chart"
```

Add the components to your chart.

```tsx showLineNumbers {12}
<ChartContainer config={chartConfig} className="h-50 w-full">
  <BarChart accessibilityLayer data={chartData}>
    <CartesianGrid vertical={false} />
    <XAxis
      dataKey="month"
      tickLine={false}
      tickMargin={10}
      axisLine={false}
      tickFormatter={(value) => value.slice(0, 3)}
    />
    <ChartTooltip content={<ChartTooltipContent />} />
    <ChartLegend content={<ChartLegendContent />} />
    <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
    <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
  </BarChart>
</ChartContainer>
```

```tsx title="components/chart-6.tsx"
// import from your project: import Demo from '@/components/chart-6'
'use client'

import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@gentleduck/registry-ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'

const chartData = [
  { desktop: 186, mobile: 80, month: 'January' },
  { desktop: 305, mobile: 200, month: 'February' },
  { desktop: 237, mobile: 120, month: 'March' },
  { desktop: 73, mobile: 190, month: 'April' },
  { desktop: 209, mobile: 130, month: 'May' },
  { desktop: 214, mobile: 140, month: 'June' },
]

const chartConfig = {
  desktop: {
    color: '#2563eb',
    label: 'Desktop',
  },
  mobile: {
    color: '#60a5fa',
    label: 'Mobile',
  },
} satisfies ChartConfig

export default function Demo() {
  return (
    <ChartContainer className="min-h-[200px] w-full" config={chartConfig}>
      <BarChart data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          axisLine={false}
          dataKey="month"
          tickFormatter={(value) => value.slice(0, 3)}
          tickLine={false}
          tickMargin={10}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
        <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
```

Done. You've built your first chart! What's next?

* [Themes and Colors](/duck-ui/components/chart#theming)
* [Tooltip](/duck-ui/components/chart#tooltip)
* [Legend](/duck-ui/components/chart#legend)

### Tooltip and legend options

```tsx title="components/chart-10.tsx"
// import from your project: import Demo from '@/components/chart-10'
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
```

## Chart Config

The chart config is where you define the labels, icons and colors for a chart.

It is intentionally decoupled from chart data.

This allows you to share config and color tokens between charts. It can also works independently for cases where your data or color tokens live remotely or in a different format.

```tsx showLineNumbers /ChartConfig/
import { Monitor } from "lucide-react"

import { type ChartConfig } from "@/components/ui/chart"

const chartConfig = {
  desktop: {
    label: "Desktop",
    icon: Monitor,
    // A color like 'hsl(220, 98%, 61%)' or 'var(--color-name)'
    color: "#2563eb",
    // OR a theme object with 'light' and 'dark' keys
    theme: {
      light: "#2563eb",
      dark: "#dc2626",
    },
  },
} satisfies ChartConfig
```

## Theming

Charts has built-in support for theming. You can use css variables (recommended) or color values in any color format, such as hex, hsl or oklch.

### CSS Variables

Define your colors in your css file

```css {6-7,14-15} title="app/globals.css" showLineNumbers
@layer base {
  :root {
    --chart-1: oklch(0.646 0.222 41.116);
    --chart-2: oklch(0.6 0.118 184.704);
  }

  .dark  {
    --chart-1: oklch(0.488 0.243 264.376);
    --chart-2: oklch(0.696 0.17 162.48);
  }
}
```

Add the color to your `chartConfig`

```tsx {4,8} showLineNumbers
const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig
```

### hex, hsl or oklch

You can also define your colors directly in the chart config. Use the color format you prefer.

```tsx showLineNumbers
const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#2563eb",
  },
} satisfies ChartConfig
```

### Using Colors

To use the theme colors in your chart, reference the colors using the format `var(--color-KEY)`.

#### Components

```tsx
<Bar dataKey="desktop" fill="var(--color-desktop)" />
```

#### Chart Data

```tsx showLineNumbers
const chartData = [
  { browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
  { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
]
```

#### Tailwind

```tsx
<LabelList className="fill-(--color-desktop)" />
```

## Tooltip

A chart tooltip contains a label, name, indicator and value. You can use a combination of these to customize your tooltip.

```tsx title="components/chart-7.tsx"
// import from your project: import Demo from '@/components/chart-7'
'use client'

import { cn } from '@gentleduck/libs/cn'
import type * as React from 'react'

export default function Demo() {
  return (
    <div className="grid aspect-video w-full max-w-md justify-center text-foreground md:grid-cols-2 [&>div]:relative [&>div]:flex [&>div]:h-[137px] [&>div]:w-[224px] [&>div]:items-center [&>div]:justify-center [&>div]:p-4">
      <div>
        <div className="absolute top-[45px] left-[-35px] z-10 font-medium text-sm">Label</div>
        <svg
          className="absolute top-[50px] left-[5px] z-10"
          fill="none"
          height="12"
          viewBox="0 0 193 40"
          width="50"
          xmlns="http://www.w3.org/2000/svg">
          <title>Label</title>
          <g clipPath="url(#a)">
            <path
              d="M173.928 21.13C115.811 44.938 58.751 45.773 0 26.141c4.227-4.386 7.82-2.715 10.567-1.88 21.133 5.64 42.9 6.266 64.457 7.101 31.066 1.253 60.441-5.848 89.183-17.335 1.268-.418 2.325-1.253 4.861-2.924-14.582-2.924-29.165 2.089-41.845-3.76.212-.835.212-1.879.423-2.714 9.51-.627 19.231-1.253 28.742-2.089 9.51-.835 18.808-1.88 28.318-2.506 6.974-.418 9.933 2.924 7.397 9.19-3.17 8.145-7.608 15.664-11.623 23.391-.423.836-1.057 1.88-1.902 2.298-2.325.835-4.65 1.044-7.186 1.67-.422-2.088-1.479-4.386-1.268-6.265.423-2.506 1.902-4.595 3.804-9.19Z"
              fill="currentColor"
            />
          </g>
          <defs>
            <clipPath id="a">
              <path d="M0 0h193v40H0z" fill="currentColor" />
            </clipPath>
          </defs>
        </svg>
        <TooltipDemo
          className="w-[8rem]"
          label="Page Views"
          payload={[
            { fill: 'hsl(var(--chart-1))', name: 'Desktop', value: 186 },
            { fill: 'hsl(var(--chart-2))', name: 'Mobile', value: 80 },
          ]}
        />
      </div>
      <div className="items-end">
        <div className="absolute top-[0px] left-[122px] z-10 font-medium text-sm">Name</div>
        <svg
          className="absolute top-[10px] left-[85px] z-10 -scale-x-100"
          fill="none"
          height="42"
          viewBox="0 0 122 148"
          width="35"
          xmlns="http://www.w3.org/2000/svg">
          <title>Name</title>
          <g clipPath="url(#ab)">
            <path
              d="M0 2.65c6.15-4.024 12.299-2.753 17.812-.847a115.56 115.56 0 0 1 21.84 10.59C70.4 32.727 88.849 61.744 96.483 97.54c1.908 9.108 2.544 18.639 3.817 29.017 8.481-4.871 12.934-14.402 21.416-19.909 1.061 4.236-1.06 6.989-2.756 9.319-6.998 9.531-14.207 19.062-21.63 28.382-3.604 4.448-6.36 4.871-10.177 1.059-8.058-7.837-12.935-17.368-14.42-28.382 0-.424.636-1.059 1.485-2.118 9.118 2.33 6.997 13.979 14.843 18.215 3.393-14.614.848-28.593-2.969-42.149-4.029-14.19-9.33-27.746-17.812-39.82-8.27-11.86-18.66-21.392-30.11-30.287C26.93 11.758 14.207 6.039 0 2.65Z"
              fill="currentColor"
            />
          </g>
          <defs>
            <clipPath id="ab">
              <path d="M0 0h122v148H0z" fill="currentColor" />
            </clipPath>
          </defs>
        </svg>
        <TooltipDemo
          className="w-[8rem]"
          hideLabel
          indicator="dashed"
          label="Browser"
          payload={[
            { fill: 'hsl(var(--chart-3))', name: 'Chrome', value: 1286 },
            { fill: 'hsl(var(--chart-4))', name: 'Firefox', value: 1000 },
          ]}
        />
      </div>
      <div className="!hidden md:!flex">
        <TooltipDemo
          className="w-[9rem]"
          indicator="line"
          label="Page Views"
          payload={[{ fill: 'hsl(var(--chart-3))', name: 'Desktop', value: 12486 }]}
        />
      </div>
      <div className="!items-start !justify-start">
        <div className="absolute top-[60px] left-[50px] z-10 font-medium text-sm">Indicator</div>
        <TooltipDemo
          className="w-[8rem]"
          hideLabel
          indicator="dot"
          label="Browser"
          payload={[{ fill: 'hsl(var(--chart-1))', name: 'Chrome', value: 1286 }]}
        />
        <svg
          className="absolute top-[38px] left-[30px] z-10 rotate-[-40deg]"
          fill="none"
          height="34"
          viewBox="0 0 75 175"
          width="15"
          xmlns="http://www.w3.org/2000/svg">
          <title>Indicator</title>
          <g clipPath="url(#abc)">
            <path
              d="M20.187 175c-4.439-2.109-7.186-2.531-8.032-4.008-3.17-5.484-6.763-10.968-8.454-17.084-5.073-16.242-4.439-32.694-1.057-49.146 5.707-28.053 18.388-52.942 34.24-76.565 1.692-2.531 3.171-5.063 4.862-7.805 0-.21-.211-.632-.634-1.265-4.65 1.265-9.511 2.53-14.161 3.585-2.537.422-5.496.422-8.032-.421-1.48-.422-3.593-2.742-3.593-4.219 0-1.898 1.48-4.218 2.747-5.906 1.057-1.054 2.96-1.265 4.65-1.687C35.406 7.315 48.088 3.729 60.98.776c10.99-2.53 14.584 1.055 13.95 11.812-.634 11.18-.846 22.358-1.268 33.326-.212 3.375-.846 6.96-1.268 10.757-8.878-4.007-8.878-4.007-12.048-38.177C47.03 33.259 38.153 49.289 29.91 65.741 21.667 82.193 16.17 99.49 13.212 117.84c-2.959 18.984.634 36.912 6.975 57.161Z"
              fill="currentColor"
            />
          </g>
          <defs>
            <clipPath id="abc">
              <path d="M0 0h75v175H0z" fill="currentColor" />
            </clipPath>
          </defs>
        </svg>
      </div>
    </div>
  )
}

function TooltipDemo({
  indicator = 'dot',
  label,
  payload,
  hideLabel,
  hideIndicator,
  className,
}: {
  label: string
  hideLabel?: boolean
  hideIndicator?: boolean
  indicator?: 'line' | 'dot' | 'dashed'
  payload: {
    name: string
    value: number
    fill: string
  }[]
  nameKey?: string
  labelKey?: string
} & React.ComponentProps<'div'>) {
  const tooltipLabel = hideLabel ? null : <div className="font-medium">{label}</div>

  if (!payload?.length) {
    return null
  }

  const nestLabel = payload.length === 1 && indicator !== 'dot'

  return (
    <div
      className={cn(
        'grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl transition-all ease-in-out hover:-translate-y-0.5',
        className,
      )}>
      {!nestLabel ? tooltipLabel : null}
      <div className="grid gap-1.5">
        {payload.map((item) => {
          const indicatorColor = item.fill

          return (
            <div
              className={cn(
                'flex w-full items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground',
                indicator === 'dot' && 'items-center',
              )}
              key={item.name}>
              {!hideIndicator && (
                <div
                  className={cn('shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)', {
                    'h-2.5 w-2.5': indicator === 'dot',
                    'my-0.5': nestLabel && indicator === 'dashed',
                    'w-0 border-[1.5px] border-dashed bg-transparent': indicator === 'dashed',
                    'w-1': indicator === 'line',
                  })}
                  style={
                    {
                      '--color-bg': indicatorColor,
                      '--color-border': indicatorColor,
                    } as React.CSSProperties
                  }
                />
              )}
              <div className={cn('flex flex-1 justify-between leading-none', nestLabel ? 'items-end' : 'items-center')}>
                <div className="grid gap-1.5">
                  {nestLabel ? tooltipLabel : null}
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="font-medium font-mono text-foreground tabular-nums">
                  {item.value.toLocaleString()}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

You can turn on/off any of these using the `hideLabel`, `hideIndicator` props and customize the indicator style using the `indicator` prop.

Use `labelKey` and `nameKey` to use a custom key for the tooltip label and name.

Chart comes with the `<ChartTooltip>` and `<ChartTooltipContent>` components. You can use these two components to add custom tooltips to your chart.

```tsx
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
```

```tsx
<ChartTooltip content={<ChartTooltipContent />} />
```

See the full [API Reference](#api-reference) below for all available props.

### Colors

Colors are automatically referenced from the chart config.

### Custom

To use a custom key for tooltip label and names, use the `labelKey` and `nameKey` props.

```tsx showLineNumbers /browser/
const chartData = [
  { browser: "chrome", visitors: 187, fill: "var(--color-chrome)" },
  { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
]

const chartConfig = {
  visitors: {
    label: "Total Visitors",
  },
  chrome: {
    label: "Chrome",
    color: "hsl(var(--chart-1))",
  },
  safari: {
    label: "Safari",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig
```

```tsx
<ChartTooltip
  content={<ChartTooltipContent labelKey="visitors" nameKey="browser" />}
/>
```

This will use `Total Visitors` for label and `Chrome` and `Safari` for the tooltip names.

## Legend

You can use the custom `<ChartLegend>` and `<ChartLegendContent>` components to add a legend to your chart.

```tsx
import { ChartLegend, ChartLegendContent } from "@/components/ui/chart"
```

```tsx
<ChartLegend content={<ChartLegendContent />} />
```

### Colors

Colors are automatically referenced from the chart config.

### Custom

To use a custom key for legend names, use the `nameKey` prop.

```tsx showLineNumbers /browser/
const chartData = [
  { browser: "chrome", visitors: 187, fill: "var(--color-chrome)" },
  { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
]

const chartConfig = {
  chrome: {
    label: "Chrome",
    color: "hsl(var(--chart-1))",
  },
  safari: {
    label: "Safari",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig
```

```tsx
<ChartLegend content={<ChartLegendContent nameKey="browser" />} />
```

This will use `Chrome` and `Safari` for the legend names.

### Icons, formatter and placement

A series given an `icon` in the config shows it in the legend and the tooltip in place of its colour swatch; `hideIcon` on `ChartLegendContent` keeps the swatch. `verticalAlign="top"` on `ChartLegend` puts the legend above the chart, and `ChartLegendContent` pads it from below. `formatter` on `ChartTooltipContent` draws each tooltip row itself, and a series given a `theme` takes its light or dark colour from the page.

```tsx title="components/chart-9.tsx"
// import from your project: import Demo from '@/components/chart-9'
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
```

## Accessibility

You can turn on the `accessibilityLayer` prop to add an accessible layer to your chart.

This prop adds keyboard access and screen reader support to your charts.

```tsx
<LineChart accessibilityLayer />
```

## RTL Support

Set the direction once with `DirectionProvider` (or `<html dir="rtl">`) and the chart follows: the tooltip and legend lay out right-to-left, and axis labels stay anchored where Recharts placed them. The axes themselves are not mirrored; use Recharts' `reversed` and `orientation` props if you want that.

```tsx title="components/chart-8.tsx"
// import from your project: import Demo from '@/components/chart-8'
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@gentleduck/registry-ui/card'
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@gentleduck/registry-ui/chart'
import { DirectionProvider } from '@gentleduck/registry-ui/direction'
import * as React from 'react'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'

const chartData = [
  { date: '2024-04-01', desktop: 222, mobile: 150 },
  { date: '2024-04-02', desktop: 97, mobile: 180 },
  { date: '2024-04-03', desktop: 167, mobile: 120 },
  { date: '2024-04-04', desktop: 242, mobile: 260 },
  { date: '2024-04-05', desktop: 373, mobile: 290 },
  { date: '2024-04-06', desktop: 301, mobile: 340 },
  { date: '2024-04-07', desktop: 245, mobile: 180 },
  { date: '2024-04-08', desktop: 409, mobile: 320 },
  { date: '2024-04-09', desktop: 59, mobile: 110 },
  { date: '2024-04-10', desktop: 261, mobile: 190 },
  { date: '2024-04-11', desktop: 327, mobile: 350 },
  { date: '2024-04-12', desktop: 292, mobile: 210 },
  { date: '2024-04-13', desktop: 342, mobile: 380 },
  { date: '2024-04-14', desktop: 137, mobile: 220 },
  { date: '2024-04-15', desktop: 120, mobile: 170 },
  { date: '2024-04-16', desktop: 138, mobile: 190 },
  { date: '2024-04-17', desktop: 446, mobile: 360 },
  { date: '2024-04-18', desktop: 364, mobile: 410 },
  { date: '2024-04-19', desktop: 243, mobile: 180 },
  { date: '2024-04-20', desktop: 89, mobile: 150 },
  { date: '2024-04-21', desktop: 137, mobile: 200 },
  { date: '2024-04-22', desktop: 224, mobile: 170 },
  { date: '2024-04-23', desktop: 138, mobile: 230 },
  { date: '2024-04-24', desktop: 387, mobile: 290 },
  { date: '2024-04-25', desktop: 215, mobile: 250 },
  { date: '2024-04-26', desktop: 75, mobile: 130 },
  { date: '2024-04-27', desktop: 383, mobile: 420 },
  { date: '2024-04-28', desktop: 122, mobile: 180 },
  { date: '2024-04-29', desktop: 315, mobile: 240 },
  { date: '2024-04-30', desktop: 454, mobile: 380 },
  { date: '2024-05-01', desktop: 165, mobile: 220 },
  { date: '2024-05-02', desktop: 293, mobile: 310 },
  { date: '2024-05-03', desktop: 247, mobile: 190 },
  { date: '2024-05-04', desktop: 385, mobile: 420 },
  { date: '2024-05-05', desktop: 481, mobile: 390 },
  { date: '2024-05-06', desktop: 498, mobile: 520 },
  { date: '2024-05-07', desktop: 388, mobile: 300 },
  { date: '2024-05-08', desktop: 149, mobile: 210 },
  { date: '2024-05-09', desktop: 227, mobile: 180 },
  { date: '2024-05-10', desktop: 293, mobile: 330 },
  { date: '2024-05-11', desktop: 335, mobile: 270 },
  { date: '2024-05-12', desktop: 197, mobile: 240 },
  { date: '2024-05-13', desktop: 197, mobile: 160 },
  { date: '2024-05-14', desktop: 448, mobile: 490 },
  { date: '2024-05-15', desktop: 473, mobile: 380 },
  { date: '2024-05-16', desktop: 338, mobile: 400 },
  { date: '2024-05-17', desktop: 499, mobile: 420 },
  { date: '2024-05-18', desktop: 315, mobile: 350 },
  { date: '2024-05-19', desktop: 235, mobile: 180 },
  { date: '2024-05-20', desktop: 177, mobile: 230 },
  { date: '2024-05-21', desktop: 82, mobile: 140 },
  { date: '2024-05-22', desktop: 81, mobile: 120 },
  { date: '2024-05-23', desktop: 252, mobile: 290 },
  { date: '2024-05-24', desktop: 294, mobile: 220 },
  { date: '2024-05-25', desktop: 201, mobile: 250 },
  { date: '2024-05-26', desktop: 213, mobile: 170 },
  { date: '2024-05-27', desktop: 420, mobile: 460 },
  { date: '2024-05-28', desktop: 233, mobile: 190 },
  { date: '2024-05-29', desktop: 78, mobile: 130 },
  { date: '2024-05-30', desktop: 340, mobile: 280 },
  { date: '2024-05-31', desktop: 178, mobile: 230 },
  { date: '2024-06-01', desktop: 178, mobile: 200 },
  { date: '2024-06-02', desktop: 470, mobile: 410 },
  { date: '2024-06-03', desktop: 103, mobile: 160 },
  { date: '2024-06-04', desktop: 439, mobile: 380 },
  { date: '2024-06-05', desktop: 88, mobile: 140 },
  { date: '2024-06-06', desktop: 294, mobile: 250 },
  { date: '2024-06-07', desktop: 323, mobile: 370 },
  { date: '2024-06-08', desktop: 385, mobile: 320 },
  { date: '2024-06-09', desktop: 438, mobile: 480 },
  { date: '2024-06-10', desktop: 155, mobile: 200 },
  { date: '2024-06-11', desktop: 92, mobile: 150 },
  { date: '2024-06-12', desktop: 492, mobile: 420 },
  { date: '2024-06-13', desktop: 81, mobile: 130 },
  { date: '2024-06-14', desktop: 426, mobile: 380 },
  { date: '2024-06-15', desktop: 307, mobile: 350 },
  { date: '2024-06-16', desktop: 371, mobile: 310 },
  { date: '2024-06-17', desktop: 475, mobile: 520 },
  { date: '2024-06-18', desktop: 107, mobile: 170 },
  { date: '2024-06-19', desktop: 341, mobile: 290 },
  { date: '2024-06-20', desktop: 408, mobile: 450 },
  { date: '2024-06-21', desktop: 169, mobile: 210 },
  { date: '2024-06-22', desktop: 317, mobile: 270 },
  { date: '2024-06-23', desktop: 480, mobile: 530 },
  { date: '2024-06-24', desktop: 132, mobile: 180 },
  { date: '2024-06-25', desktop: 141, mobile: 190 },
  { date: '2024-06-26', desktop: 434, mobile: 380 },
  { date: '2024-06-27', desktop: 448, mobile: 490 },
  { date: '2024-06-28', desktop: 149, mobile: 200 },
  { date: '2024-06-29', desktop: 103, mobile: 160 },
  { date: '2024-06-30', desktop: 446, mobile: 400 },
]

// Latin digits keep the axis, header totals, and tooltip values consistent.
const LOCALE = 'ar-u-nu-latn'

const chartConfig = {
  desktop: {
    color: 'var(--chart-1)',
    label: 'سطح المكتب',
  },
  mobile: {
    color: 'var(--chart-2)',
    label: 'الهاتف',
  },
  views: {
    label: 'مشاهدات الصفحة',
  },
} satisfies ChartConfig

export default function Demo() {
  const [activeChart, setActiveChart] = React.useState<keyof typeof chartConfig>('desktop')

  const total = React.useMemo(
    () => ({
      desktop: chartData.reduce((acc, curr) => acc + curr.desktop, 0),
      mobile: chartData.reduce((acc, curr) => acc + curr.mobile, 0),
    }),
    [],
  )

  return (
    <DirectionProvider dir="rtl">
      <Card className="rounded-sm border-none">
        <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
          <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
            <CardTitle>مخطط شريطي - تفاعلي</CardTitle>
            <CardDescription>إجمالي الزوار خلال آخر 3 أشهر</CardDescription>
          </div>
          <div className="flex">
            {['desktop', 'mobile'].map((key) => {
              const chart = key as keyof typeof chartConfig
              return (
                <button
                  aria-pressed={activeChart === chart}
                  className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-start even:border-s data-[active=true]:bg-muted/50 sm:border-s sm:border-t-0 sm:px-8 sm:py-6"
                  data-active={activeChart === chart}
                  key={chart}
                  onClick={() => setActiveChart(chart)}
                  type="button">
                  <span className="text-muted-foreground text-xs">{chartConfig[chart].label}</span>
                  <span className="font-bold text-lg leading-none sm:text-3xl">
                    {total[key as keyof typeof total].toLocaleString(LOCALE)}
                  </span>
                </button>
              )
            })}
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:p-6">
          <ChartContainer className="aspect-auto h-[250px] w-full" config={chartConfig}>
            <BarChart
              data={chartData}
              margin={{
                left: 12,
                right: 12,
              }}>
              <CartesianGrid vertical={false} />
              <XAxis
                axisLine={false}
                dataKey="date"
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString(LOCALE, {
                    day: 'numeric',
                    month: 'short',
                  })
                }}
                tickLine={false}
                tickMargin={8}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-[150px]"
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString(LOCALE, {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    }}
                    nameKey="views"
                  />
                }
              />
              <Bar
                dataKey={activeChart}
                fill={`${'color' in chartConfig[activeChart] ? chartConfig[activeChart].color : ''}`}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </DirectionProvider>
  )
}
```

## API Reference

### ChartContainer

The top-level wrapper component for all charts. Provides chart context and applies default styling for Recharts elements.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `dir` | `'ltr' \| 'rtl'` | - | Direction override. Resolved via `useDirection` (`dir` prop -> `DirectionProvider` -> `<html dir>`). |
| `config` | `ChartConfig` | - | (required) Chart configuration object mapping data keys to labels, icons, and colors. |
| `id` | `string` | - | Optional id used to scope CSS custom properties. Auto-generated when omitted. |
| `children` | `React.ComponentProps<typeof ResponsiveContainer>['children']` | - | (required) Recharts chart element(s) to render inside the responsive container. |
| `className` | `string` | - | Additional CSS classes applied to the outer `div`. |
| `ref` | `React.Ref<HTMLDivElement>` | - | Ref forwarded to the outer `div`. |
| `...props` | `React.HTMLProps<HTMLDivElement>` | - | Additional props to spread to the content div. |

### ChartTooltip

Re-export of `RechartsPrimitive.Tooltip`. Use this as the wrapper and pass `<ChartTooltipContent />` via its `content` prop.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `...props` | `React.ComponentPropsWithoutRef<typeof RechartsPrimitive.Tooltip>` | - | Additional props inherited from Recharts `Tooltip`. |

### ChartTooltipContent

Custom content renderer for `<ChartTooltip>` (Recharts `Tooltip`). Reads theme colors from chart context.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `labelKey` | `string` | - | Config or data key to use for the tooltip label. |
| `nameKey` | `string` | - | Config or data key to use for the tooltip name. |
| `indicator` | `'dot' \| 'line' \| 'dashed'` | `'dot'` | Visual style of the color indicator next to each item. |
| `hideLabel` | `boolean` | `false` | Whether to hide the tooltip label entirely. |
| `hideIndicator` | `boolean` | `false` | Whether to hide the color indicator. |
| `label` | `string` | - | Raw label value provided by Recharts. |
| `labelFormatter` | `(value: any, payload: any[]) => React.ReactNode` | - | Custom formatter for the tooltip label. Receives the resolved label value and full payload. |
| `formatter` | `(value: any, name: string, item: any, index: number, payload: any) => React.ReactNode` | - | Custom formatter for individual tooltip items. When provided, replaces the default item rendering. |
| `color` | `string` | - | Override color for the indicator. Falls back to `item.payload.fill` then `item.color`. |
| `labelClassName` | `string` | - | Additional CSS classes applied to the label element. |
| `className` | `string` | - | Additional CSS classes applied to the tooltip container. |
| `ref` | `React.Ref<HTMLDivElement>` | - | Ref forwarded to the tooltip container `div`. |
| `...props` | `React.HTMLProps<HTMLDivElement>` | - | Additional props to spread to the content div. |

### ChartLegend

Re-export of `RechartsPrimitive.Legend`. Use this as the wrapper and pass `<ChartLegendContent />` via its `content` prop.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `...props` | `React.ComponentPropsWithoutRef<typeof RechartsPrimitive.Legend>` | - | Additional props inherited from Recharts `Legend`. |

### ChartLegendContent

Custom content renderer for `<ChartLegend>` (Recharts `Legend`). Reads theme colors and icons from chart context.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `nameKey` | `string` | - | Config or data key to use for legend item names. |
| `hideIcon` | `boolean` | `false` | Shows the colour swatch in place of a series' config `icon`. |
| `verticalAlign` | `'top' \| 'middle' \| 'bottom'` | `'bottom'` | Vertical alignment of the legend relative to the chart. Controls top/bottom padding. |
| `payload` | `RechartsPrimitive.LegendProps['payload']` | - | Legend payload provided automatically by Recharts. |
| `className` | `string` | - | Additional CSS classes applied to the legend container. |
| `ref` | `React.Ref<HTMLDivElement>` | - | Ref forwarded to the legend container `div`. |
| `...props` | `React.HTMLProps<HTMLDivElement>` | - | Additional props to spread to the content div. |

### ChartStyle

Internal component that injects a `<style>` tag to set CSS custom properties (`--color-*`) for each chart data key based on the `config`. Supports light/dark theming.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | `string` | - | (required) The chart id used to scope styles via `[data-chart]` attribute selector. |
| `config` | `ChartConfig` | - | (required) Chart configuration object. Entries with `theme` or `color` values produce CSS custom properties. |

### ChartConfig

The configuration type used by all chart components.

```tsx
type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<'light' | 'dark', string> }
  )
}
```

Each key maps to a data series. Use either `color` (single value) or `theme` (light/dark pair)  -  never both.