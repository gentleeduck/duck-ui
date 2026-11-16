'use client'

import * as React from 'react'
import data from '../../../../apps/duck/public/data/benchmarks/calendar.json'

const tabs = ['vs react-day-picker', 'vs react-aria', 'vs react-datepicker', 'vs react-calendar'] as const
type Tab = (typeof tabs)[number]

const comparisons = (data as Record<string, unknown>).libraryComparisons as
  | {
      name: string
      comparison: { metric: string; gentleduck: string; competitor: string; winner: string }[]
    }[]
  | undefined

export default function CalendarComparisonTables() {
  const [tab, setTab] = React.useState<Tab>('vs react-day-picker')
  const index = tabs.indexOf(tab)
  const comp = comparisons?.[index]

  if (!comp) return null

  return (
    <div className="w-full space-y-4">
      <div className="flex w-fit flex-wrap gap-1 rounded-lg bg-muted p-1">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-md px-2.5 py-1.5 font-medium text-[11px] transition-colors ${tab === t ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
            {t}
          </button>
        ))}
      </div>

      <div>
        <p className="mb-3 text-muted-foreground text-xs">
          @gentleduck/calendar vs {comp.name} — feature-by-feature comparison
        </p>
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-3 py-2.5 text-start font-medium text-muted-foreground">Metric</th>
                <th className="px-3 py-2.5 text-start font-medium">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                    gentleduck
                  </span>
                </th>
                <th className="px-3 py-2.5 text-start font-medium">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
                    {comp.name}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {comp.comparison.map((row, i) => (
                <tr key={row.metric} className={`border-b last:border-b-0 ${i % 2 === 0 ? '' : 'bg-muted/20'}`}>
                  <td className="px-3 py-2 font-medium text-muted-foreground">{row.metric}</td>
                  <td className="px-3 py-2">
                    <span
                      className={
                        row.winner === 'gentleduck'
                          ? 'inline-flex items-center gap-1 font-semibold text-green-600 dark:text-green-400'
                          : ''
                      }>
                      {row.winner === 'gentleduck' && <span className="text-green-500">✓</span>}
                      {row.gentleduck}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={
                        row.winner === 'competitor'
                          ? 'inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400'
                          : ''
                      }>
                      {row.winner === 'competitor' && <span className="text-blue-500">✓</span>}
                      {row.competitor}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex items-center gap-4 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
            Winner
          </span>
          <span>
            {comp.comparison.filter((r) => r.winner === 'gentleduck').length} gentleduck ·{' '}
            {comp.comparison.filter((r) => r.winner === 'competitor').length} {comp.name} ·{' '}
            {comp.comparison.filter((r) => r.winner === 'tie').length} tie
          </span>
        </div>
      </div>
    </div>
  )
}
