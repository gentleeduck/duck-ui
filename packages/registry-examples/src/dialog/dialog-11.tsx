'use client'

import { Button } from '@gentleduck/registry-ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@gentleduck/registry-ui/dialog'
import { Kbd, KbdGroup } from '@gentleduck/registry-ui/kbd'
import * as React from 'react'

const SHORTCUTS = [
  ['Search', ['Ctrl', 'K']],
  ['New file', ['Ctrl', 'N']],
  ['Save', ['Ctrl', 'S']],
] as const

export default function Demo() {
  const [presses, setPresses] = React.useState(0)

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Dialog modal={false}>
        <DialogTrigger asChild>
          <Button variant="outline">Show shortcuts</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-xs" onInteractOutside={(event) => event.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Keyboard shortcuts</DialogTitle>
            <DialogDescription>It stays open while you use the page behind it.</DialogDescription>
          </DialogHeader>
          <dl className="grid grid-cols-[1fr_auto] gap-2 text-sm">
            {SHORTCUTS.map(([action, keys]) => (
              <React.Fragment key={action}>
                <dt>{action}</dt>
                <dd>
                  <KbdGroup>
                    {keys.map((key) => (
                      <Kbd key={key}>{key}</Kbd>
                    ))}
                  </KbdGroup>
                </dd>
              </React.Fragment>
            ))}
          </dl>
        </DialogContent>
      </Dialog>
      <Button onClick={() => setPresses((count) => count + 1)} variant="secondary">
        Pressed {presses} times
      </Button>
    </div>
  )
}
