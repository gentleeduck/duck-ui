'use client'

import type { ChartConfig } from '@gentleduck/registry-ui/chart'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@gentleduck/registry-ui/chart'
import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts'
import { ChartTabs } from './chart-tabs'

const GREEN = 'var(--chart-1)'
const BLUE = 'var(--chart-2)'
const GRAY = 'var(--chart-3)'

const tabs = ['Performance', 'Bundle Size'] as const
type Tab = (typeof tabs)[number]

const perfData = [
  { name: '@casl/ability', value: 16_857_000, type: 'casl' },
  { name: '@gentleduck/iam [PROD]', value: 8_233_000, type: 'duck' },
  { name: 'easy-rbac', value: 5_003_000, type: 'other' },
  { name: '@rbac/rbac', value: 2_884_000, type: 'other' },
  { name: '@gentleduck/iam [DEV]', value: 1_355_000, type: 'duck' },
  { name: 'accesscontrol', value: 674_000, type: 'other' },
  { name: 'casbin', value: 143_000, type: 'other' },
]

const perfConfig = {
  value: { label: 'ops/sec' },
} satisfies ChartConfig

const bundleData = [
  { name: 'easy-rbac', sizeKB: 2, type: 'other' },
  { name: '@rbac/rbac', sizeKB: 4, type: 'other' },
  { name: '@casl/ability', sizeKB: 6, type: 'other' },
  { name: 'accesscontrol', sizeKB: 8.2, type: 'other' },
  { name: 'role-acl', sizeKB: 12, type: 'other' },
  { name: '@gentleduck/iam (full)', sizeKB: 23.3, type: 'duck' },
  { name: 'casbin', sizeKB: 30, type: 'other' },
]

const bundleConfig = {
  sizeKB: { label: 'Size (gzip KB)' },
} satisfies ChartConfig

function getBarColor(type: string) {
  if (type === 'duck') return GREEN
  if (type === 'casl') return BLUE
  return GRAY
}

export default function ChartBenchmarkIamVs() {
  const [activeTab, setActiveTab] = useState<Tab>('Performance')

  return (
    <div className="w-full">
      <ChartTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'Performance' && (
        <ChartContainer config={perfConfig} className="h-[350px] w-full">
          <BarChart data={perfData} layout="vertical" margin={{ left: 0, right: 40 }}>
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <XAxis type="number" tickFormatter={(v: number) => `${(v / 1_000_000).toFixed(0)}M`} />
            <YAxis type="category" dataKey="name" width={180} tick={{ fontSize: 12 }} />
            <ChartTooltip
              content={<ChartTooltipContent formatter={(value) => `${Number(value).toLocaleString()} ops/sec`} />}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {perfData.map((entry) => (
                <Cell key={entry.name} fill={getBarColor(entry.type)} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      )}

      {activeTab === 'Bundle Size' && (
        <ChartContainer config={bundleConfig} className="h-[350px] w-full">
          <BarChart data={bundleData} layout="vertical" margin={{ left: 0, right: 40 }}>
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <XAxis type="number" tickFormatter={(v: number) => `${v} KB`} />
            <YAxis type="category" dataKey="name" width={180} tick={{ fontSize: 12 }} />
            <ChartTooltip content={<ChartTooltipContent formatter={(value) => `${value} KB (gzipped)`} />} />
            <Bar dataKey="sizeKB" radius={[0, 4, 4, 0]}>
              {bundleData.map((entry) => (
                <Cell key={entry.name} fill={entry.type === 'duck' ? GREEN : GRAY} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      )}
    </div>
  )
}
