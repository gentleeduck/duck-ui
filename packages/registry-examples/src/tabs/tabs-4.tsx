'use client'

import {
  MotionTabs,
  MotionTabsContent,
  MotionTabsContents,
  MotionTabsList,
  MotionTabsTrigger,
} from '@gentleduck/registry-ui/tabs'

const visitors = [
  { page: '/dashboard', views: 1423, uniques: 892, bounce: '32%' },
  { page: '/pricing', views: 987, uniques: 654, bounce: '45%' },
  { page: '/docs', views: 756, uniques: 523, bounce: '28%' },
]

const activity = [
  { action: 'Deployed v2.4.1', user: 'Sarah', time: '2m ago' },
  { action: 'Merged PR #847', user: 'James', time: '18m ago' },
  { action: 'Upgraded to Team', user: 'Alex', time: '1h ago' },
]

export default function Demo() {
  return (
    <div className="flex h-full w-full max-w-md flex-col items-start gap-8 pt-16">
      <MotionTabs className="w-full" defaultValue="analytics">
        <MotionTabsList className="grid w-full grid-cols-3 rounded-full bg-muted p-1">
          <MotionTabsTrigger className="rounded-full" value="overview">
            Overview
          </MotionTabsTrigger>
          <MotionTabsTrigger className="rounded-full" value="analytics">
            Analytics
          </MotionTabsTrigger>
          <MotionTabsTrigger className="rounded-full" value="history" disabled>
            History
          </MotionTabsTrigger>
        </MotionTabsList>
        <MotionTabsContents>
          <MotionTabsContent value="overview">
            <div className="space-y-3 rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
              <h3 className="font-semibold text-sm">Project Overview</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-md border p-2.5">
                  <p className="text-muted-foreground text-xs">Uptime</p>
                  <p className="font-bold text-lg">99.98%</p>
                </div>
                <div className="rounded-md border p-2.5">
                  <p className="text-muted-foreground text-xs">Latency</p>
                  <p className="font-bold text-lg">45ms</p>
                </div>
              </div>
              <div className="space-y-1.5">
                <h4 className="font-medium text-muted-foreground text-xs">Recent</h4>
                {activity.map((item) => (
                  <div
                    key={item.time}
                    className="flex items-center justify-between rounded-md bg-muted/50 px-2.5 py-1.5">
                    <div>
                      <p className="text-xs">{item.action}</p>
                      <p className="text-[10px] text-muted-foreground">{item.user}</p>
                    </div>
                    <p className="shrink-0 text-[10px] text-muted-foreground">{item.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </MotionTabsContent>
          <MotionTabsContent value="analytics">
            <div className="space-y-3 rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
              <h3 className="font-semibold text-sm">Analytics</h3>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-md bg-muted p-2.5 text-center">
                  <p className="font-bold text-lg">24.5k</p>
                  <p className="text-[10px] text-muted-foreground">Visitors</p>
                </div>
                <div className="rounded-md bg-muted p-2.5 text-center">
                  <p className="font-bold text-lg">12.1k</p>
                  <p className="text-[10px] text-muted-foreground">Views</p>
                </div>
                <div className="rounded-md bg-muted p-2.5 text-center">
                  <p className="font-bold text-lg">3.2%</p>
                  <p className="text-[10px] text-muted-foreground">CVR</p>
                </div>
              </div>
              <div className="rounded-md border">
                <div className="grid grid-cols-4 border-b px-2.5 py-1.5 font-medium text-[10px] text-muted-foreground">
                  <span>Page</span>
                  <span className="text-end">Views</span>
                  <span className="text-end">Uniques</span>
                  <span className="text-end">Bounce</span>
                </div>
                {visitors.map((row) => (
                  <div key={row.page} className="grid grid-cols-4 border-b px-2.5 py-1.5 text-xs last:border-0">
                    <span className="truncate font-mono text-[10px]">{row.page}</span>
                    <span className="text-end">{row.views.toLocaleString()}</span>
                    <span className="text-end">{row.uniques.toLocaleString()}</span>
                    <span className="text-end">{row.bounce}</span>
                  </div>
                ))}
              </div>
            </div>
          </MotionTabsContent>
          <MotionTabsContent value="history">
            <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
              <h3 className="font-semibold text-sm">History</h3>
              <p className="mt-1 text-muted-foreground text-xs">Audit log is available on the Team plan.</p>
            </div>
          </MotionTabsContent>
        </MotionTabsContents>
      </MotionTabs>
    </div>
  )
}
