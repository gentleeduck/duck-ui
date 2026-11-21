'use client'

import { useState } from 'react'
import data from '../../public/data/benchmarks/iam.json'
import { ChartTabs } from './chart-tabs'

const tabs = data.libraryComparisons.map((lib) => lib.name)

function WinnerIcon({ winner }: { winner: string }) {
  if (winner === 'gentleduck') {
    return <span className="text-green-600 dark:text-green-400">&#10003;</span>
  }
  if (winner === 'competitor') {
    return <span className="text-blue-600 dark:text-blue-400">&#10003;</span>
  }
  return <span className="text-muted-foreground">&mdash;</span>
}

function Summary({ comparison }: { comparison: (typeof data.libraryComparisons)[0]['comparison'] }) {
  let wins = 0
  let losses = 0
  let ties = 0
  for (const c of comparison) {
    if (c.winner === 'gentleduck') wins++
    else if (c.winner === 'competitor') losses++
    else ties++
  }

  return (
    <div className="mt-3 text-muted-foreground text-sm">
      <span className="font-medium text-green-600 dark:text-green-400">{wins} wins</span>
      {' / '}
      <span className="font-medium text-blue-600 dark:text-blue-400">{losses} losses</span>
      {' / '}
      <span className="font-medium">{ties} ties</span>
      {' for @gentleduck/iam'}
    </div>
  )
}

export default function ChartBenchmarkIamCompare() {
  const [activeTab, setActiveTab] = useState(tabs[0] ?? '')
  const activeLib = data.libraryComparisons.find((lib) => lib.name === activeTab)

  return (
    <div className="w-full">
      <ChartTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} labelFn={(tab) => `vs ${tab}`} />

      {activeLib && (
        <div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2 pe-4 text-start font-medium">Metric</th>
                  <th className="px-4 py-2 text-start font-medium">@gentleduck/iam</th>
                  <th className="px-4 py-2 text-start font-medium">{activeLib.name}</th>
                  <th className="py-2 ps-4 text-center font-medium">Winner</th>
                </tr>
              </thead>
              <tbody>
                {activeLib.comparison.map((row) => (
                  <tr key={row.metric} className="border-border/50 border-b">
                    <td className="py-2 pe-4 font-medium">{row.metric}</td>
                    <td
                      className={`px-4 py-2 ${row.winner === 'gentleduck' ? 'font-medium text-green-600 dark:text-green-400' : ''}`}>
                      {row.gentleduck}
                    </td>
                    <td
                      className={`px-4 py-2 ${row.winner === 'competitor' ? 'font-medium text-blue-600 dark:text-blue-400' : ''}`}>
                      {row.competitor}
                    </td>
                    <td className="py-2 ps-4 text-center">
                      <WinnerIcon winner={row.winner} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Summary comparison={activeLib.comparison} />
        </div>
      )}
    </div>
  )
}
