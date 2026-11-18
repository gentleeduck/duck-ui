import { Separator } from '@gentleduck/registry-ui/separator'
import * as React from 'react'

const RELEASES = [
  { name: 'v2.4.0', note: 'Calendar date fields' },
  { name: 'v2.3.1', note: 'Select highlight fix' },
  { name: 'v2.3.0', note: 'Resizable collapsing' },
]

export default function Demo() {
  return (
    <div className="w-72 rounded-md border">
      {RELEASES.map((release, index) => (
        <React.Fragment key={release.name}>
          {index > 0 ? <Separator /> : null}
          <div className="flex items-center justify-between px-4 py-3 text-sm">
            <span className="font-medium">{release.name}</span>
            <span className="text-muted-foreground">{release.note}</span>
          </div>
        </React.Fragment>
      ))}
    </div>
  )
}
