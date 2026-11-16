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
import data from '../../../../apps/duck/public/data/benchmarks/variants.json'

const tabs = ['Bundle Size', 'Runtime', 'Features'] as const
type Tab = (typeof tabs)[number]

type BundleRow = {
  name: string
  shippedKB: number | null
  fullApiKB: number | null
  realImportKB: number | null
}

type RuntimeStats = {
  medianNs: number
  meanNs: number
  p95Ns: number
  p99Ns: number
  rmeP: number
  opsPerSec?: number
}

type RuntimeResult = {
  library: string
  warm: RuntimeStats
  cold: RuntimeStats
}

type RuntimeScenario = {
  scenario: string
  label: string
  warmNote: string
  coldNote: string
  results: RuntimeResult[]
}

type FeatureRow = {
  feature: string
  gentleduck: boolean
  cva: boolean
  tv: boolean
  clsx: boolean
}

const bundleRows = data.bundleSize.results as BundleRow[]
const runtimeScenarios = data.runtimePerformance as RuntimeScenario[]
const featureRows = data.features.rows as FeatureRow[]

const bundleConfig = {
  realImportKB: { label: 'real import (KB)', color: 'var(--chart-1)' },
} satisfies ChartConfig

const runtimeConfig = {
  warm: { label: 'warm (ns)', color: 'var(--chart-1)' },
  cold: { label: 'cold (ns)', color: 'var(--chart-3)' },
} satisfies ChartConfig

function formatEnv(env: typeof data.environment, generatedAt: string): string {
  const parts: string[] = []
  if (env.cpu) parts.push(`${env.cpu} × ${env.cpuCount}`)
  parts.push(`node ${env.node}`)
  if (env.bun) parts.push(`bun ${env.bun}`)
  if (env.commit) parts.push(`commit ${env.commit.slice(0, 7)}`)
  parts.push(new Date(generatedAt).toISOString().slice(0, 10))
  return parts.join(' · ')
}

export default function VariantsBenchmarkDashboard() {
  const [tab, setTab] = React.useState<Tab>('Bundle Size')
  const [scenarioId, setScenarioId] = React.useState<string>(runtimeScenarios[0]?.scenario ?? '')

  const scenario = runtimeScenarios.find((s) => s.scenario === scenarioId) ?? runtimeScenarios[0]
  const runtimeData = (scenario?.results ?? []).map((r) => ({
    library: r.library,
    warm: r.warm.medianNs,
    cold: r.cold.medianNs,
  }))

  return (
    <div className="w-full space-y-4" data-slot="variants-benchmark-dashboard">
      <p className="text-muted-foreground text-xs">{formatEnv(data.environment, data.generatedAt)}</p>

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

      <div className="min-h-[360px]">
        {tab === 'Bundle Size' && (
          <div>
            <p className="mb-3 text-muted-foreground text-xs">
              <strong className="text-foreground">Real-import cost</strong> — gzipped bundle of a single import of the
              main export, with all transitive dependencies inlined. The only apples-to-apples comparison.
            </p>
            <ChartContainer className="aspect-[2/1] min-h-[240px] w-full" config={bundleConfig}>
              <BarChart data={bundleRows} layout="vertical" margin={{ left: 10, right: 30, top: 5, bottom: 5 }}>
                <CartesianGrid horizontal={false} />
                <YAxis dataKey="name" type="category" width={180} tickLine={false} axisLine={false} fontSize={11} />
                <XAxis type="number" tickLine={false} axisLine={false} fontSize={10} unit=" KB" />
                <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                <Bar dataKey="realImportKB" fill="var(--color-realImportKB)" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ChartContainer>
            <div className="mt-4 overflow-x-auto rounded-md border">
              <table className="w-full text-xs">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-start font-medium">library</th>
                    <th
                      className="px-3 py-2 text-end font-medium"
                      title="Gzipped raw file from node_modules — excludes transitive deps, not a fair comparison.">
                      shipped
                    </th>
                    <th
                      className="px-3 py-2 text-end font-medium"
                      title="Bundle `export *` with deps, minified, gzipped — full surface-area cost.">
                      full API
                    </th>
                    <th
                      className="px-3 py-2 text-end font-medium"
                      title="Bundle a single import with deps, minified, gzipped — what an app actually pays.">
                      real import
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {bundleRows.map((r) => (
                    <tr key={r.name} className="border-t">
                      <td className="px-3 py-2">{r.name}</td>
                      <td className="px-3 py-2 text-end text-muted-foreground tabular-nums">{r.shippedKB ?? 'n/a'}</td>
                      <td className="px-3 py-2 text-end text-muted-foreground tabular-nums">{r.fullApiKB ?? 'n/a'}</td>
                      <td className="px-3 py-2 text-end font-medium tabular-nums">{r.realImportKB ?? 'n/a'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'Runtime' && (
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <p className="text-muted-foreground text-xs">
                Median ns/op per library — warm (same props) vs cold (unique className).
              </p>
              <select
                value={scenarioId}
                onChange={(e) => setScenarioId(e.target.value)}
                className="ms-auto rounded-md border border-input bg-background px-2 py-1 text-xs">
                {runtimeScenarios.map((s) => (
                  <option key={s.scenario} value={s.scenario}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <ChartContainer className="aspect-[2/1] min-h-[280px] w-full" config={runtimeConfig}>
              <BarChart data={runtimeData} layout="vertical" margin={{ left: 10, right: 30, top: 5, bottom: 20 }}>
                <CartesianGrid horizontal={false} />
                <YAxis dataKey="library" type="category" width={180} tickLine={false} axisLine={false} fontSize={11} />
                <XAxis type="number" tickLine={false} axisLine={false} fontSize={10} unit=" ns" />
                <ChartTooltip content={<ChartTooltipContent indicator="dashed" />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="warm" fill="var(--color-warm)" radius={[0, 4, 4, 0]} barSize={12} />
                <Bar dataKey="cold" fill="var(--color-cold)" radius={[0, 4, 4, 0]} barSize={12} />
              </BarChart>
            </ChartContainer>
            <div className="mt-4 overflow-x-auto rounded-md border">
              <table className="w-full text-xs">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-start font-medium">library</th>
                    <th className="px-3 py-2 text-start font-medium">mode</th>
                    <th className="px-3 py-2 text-end font-medium">median (ns)</th>
                    <th className="px-3 py-2 text-end font-medium">p95</th>
                    <th className="px-3 py-2 text-end font-medium">p99</th>
                    <th className="px-3 py-2 text-end font-medium">rme%</th>
                    <th className="px-3 py-2 text-end font-medium">ops/sec</th>
                  </tr>
                </thead>
                <tbody>
                  {(scenario?.results ?? []).flatMap((r) =>
                    (['warm', 'cold'] as const).map((mode, i) => {
                      const s = r[mode]
                      return (
                        <tr key={`${r.library}-${mode}`} className="border-t">
                          <td className="px-3 py-2">{i === 0 ? r.library : ''}</td>
                          <td className="px-3 py-2 text-muted-foreground">{mode}</td>
                          <td className="px-3 py-2 text-end font-medium tabular-nums">{s.medianNs}</td>
                          <td className="px-3 py-2 text-end text-muted-foreground tabular-nums">{s.p95Ns}</td>
                          <td className="px-3 py-2 text-end text-muted-foreground tabular-nums">{s.p99Ns}</td>
                          <td className="px-3 py-2 text-end text-muted-foreground tabular-nums">{s.rmeP}</td>
                          <td className="px-3 py-2 text-end tabular-nums">
                            {s.opsPerSec ? s.opsPerSec.toLocaleString() : '—'}
                          </td>
                        </tr>
                      )
                    }),
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'Features' && (
          <div>
            <p className="mb-3 text-muted-foreground text-xs">Self-reported feature matrix.</p>
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs">
                  <tr>
                    <th className="px-3 py-2 text-start font-medium">feature</th>
                    <th className="px-3 py-2 text-start font-medium">gentleduck</th>
                    <th className="px-3 py-2 text-start font-medium">cva</th>
                    <th className="px-3 py-2 text-start font-medium">tv</th>
                    <th className="px-3 py-2 text-start font-medium">clsx</th>
                  </tr>
                </thead>
                <tbody>
                  {featureRows.map((row) => (
                    <tr key={row.feature} className="border-t">
                      <td className="px-3 py-2">{row.feature}</td>
                      <td className="px-3 py-2">{row.gentleduck ? '✓' : '·'}</td>
                      <td className="px-3 py-2">{row.cva ? '✓' : '·'}</td>
                      <td className="px-3 py-2">{row.tv ? '✓' : '·'}</td>
                      <td className="px-3 py-2">{row.clsx ? '✓' : '·'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
