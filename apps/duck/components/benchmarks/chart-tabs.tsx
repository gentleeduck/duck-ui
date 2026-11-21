'use client'

interface ChartTabsProps<T extends string> {
  tabs: readonly T[]
  activeTab: T
  onTabChange: (tab: T) => void
  labelFn?: (tab: T) => string
}

export function ChartTabs<T extends string>({ tabs, activeTab, onTabChange, labelFn }: ChartTabsProps<T>) {
  return (
    <div className="mb-4 inline-flex items-center rounded-lg bg-muted p-1">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onTabChange(tab)}
          className={`rounded-md px-3 py-1.5 font-medium text-sm transition-colors ${
            activeTab === tab ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}>
          {labelFn ? labelFn(tab) : tab}
        </button>
      ))}
    </div>
  )
}
