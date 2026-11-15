'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Toggle } from '@gentleduck/registry-ui/toggle'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@gentleduck/registry-ui/tooltip'
import { Archive, Inbox, Send } from 'lucide-react'
import * as React from 'react'

const actions = [
  { icon: <Inbox />, label: 'Inbox' },
  { icon: <Send />, label: 'Sent' },
  { icon: <Archive />, label: 'Archive' },
]

export default function Demo() {
  const [collapsed, setCollapsed] = React.useState(true)

  return (
    <div className="flex flex-col items-start gap-4">
      <Toggle onPressedChange={(pressed) => setCollapsed(!pressed)} pressed={!collapsed} size="sm" variant="outline">
        Show labels
      </Toggle>
      <TooltipProvider>
        <div className="flex gap-2">
          {actions.map(({ icon, label }) => (
            <Tooltip key={label}>
              <TooltipTrigger asChild>
                <Button
                  aria-label={collapsed ? label : undefined}
                  icon={icon}
                  isCollapsed={collapsed}
                  variant="outline">
                  {label}
                </Button>
              </TooltipTrigger>
              {collapsed ? <TooltipContent>{label}</TooltipContent> : null}
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    </div>
  )
}
