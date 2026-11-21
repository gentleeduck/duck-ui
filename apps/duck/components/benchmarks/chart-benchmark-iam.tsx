'use client'

import type { ChartConfig } from '@gentleduck/registry-ui/chart'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@gentleduck/registry-ui/chart'
import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from 'recharts'
import data from '../../public/data/benchmarks/iam.json'
import { ChartTabs } from './chart-tabs'

const COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'hsl(173 80% 40%)',
  'hsl(24 95% 53%)',
  'hsl(199 89% 48%)',
  'hsl(316 72% 51%)',
  'hsl(60 70% 44%)',
  'hsl(142 50% 50%)',
  'hsl(210 60% 55%)',
  'hsl(0 75% 55%)',
]

const tabs = ['Modules', 'Core Performance', 'Engine Performance'] as const
type Tab = (typeof tabs)[number]

const modules = data.moduleSizes
  .filter((m) => m.name !== 'Core (full)')
  .map((m, i) => ({
    name: m.name,
    sizeKB: m.sizeKB,
    fill: COLORS[i % COLORS.length],
  }))

const modulesConfig = modules.reduce<Record<string, { label: string; color: string }>>((acc, m, i) => {
  acc[`module${i}`] = { label: m.name as string, color: COLORS[i % COLORS.length] as string }
  return acc
}, {}) satisfies ChartConfig

const coreData = data.corePerformance.map((d) => ({ name: d.label, us: d.us }))

const coreConfig = {
  us: { label: 'Time (us)', color: 'var(--chart-1)' },
} satisfies ChartConfig

const engineData = data.enginePerformance.map((d) => ({ name: d.label, us: d.us }))

const engineConfig = {
  us: { label: 'Time (us)', color: 'var(--chart-2)' },
} satisfies ChartConfig

export default function ChartBenchmarkIam() {
  const [activeTab, setActiveTab] = useState<Tab>('Modules')

  return (
    <div className="w-full">
      <ChartTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'Modules' && (
        <div className="space-y-4">
          <ChartContainer config={modulesConfig} className="mx-auto h-[350px] w-full max-w-[500px]">
            <PieChart>
              <ChartTooltip
                content={<ChartTooltipContent formatter={(value, name) => `${name}: ${value} KB`} hideLabel />}
              />
              <Pie
                data={modules}
                dataKey="sizeKB"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={2}>
                {modules.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm">
            {modules.map((m) => (
              <div key={m.name} className="flex items-center gap-1.5">
                <div className="size-2.5 shrink-0 rounded-sm" style={{ backgroundColor: m.fill }} />
                <span className="text-muted-foreground">
                  {m.name} ({m.sizeKB} KB)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Core Performance' && (
        <ChartContainer config={coreConfig} className="h-[300px] w-full">
          <BarChart data={coreData} layout="vertical" margin={{ left: 0, right: 40 }}>
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <XAxis type="number" tickFormatter={(v: number) => `${v} us`} />
            <YAxis type="category" dataKey="name" width={220} tick={{ fontSize: 11 }} />
            <ChartTooltip content={<ChartTooltipContent formatter={(value) => `${value} us`} />} />
            <Bar dataKey="us" fill="var(--chart-1)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ChartContainer>
      )}

      {activeTab === 'Engine Performance' && (
        <ChartContainer config={engineConfig} className="h-[280px] w-full">
          <BarChart data={engineData} layout="vertical" margin={{ left: 0, right: 40 }}>
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <XAxis type="number" tickFormatter={(v: number) => `${v} us`} />
            <YAxis type="category" dataKey="name" width={220} tick={{ fontSize: 11 }} />
            <ChartTooltip content={<ChartTooltipContent formatter={(value) => `${value} us`} />} />
            <Bar dataKey="us" fill="var(--chart-2)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ChartContainer>
      )}
    </div>
  )
}
