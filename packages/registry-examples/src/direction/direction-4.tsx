'use client'

import { DirectionProvider, Provider, toDirection, useDirection } from '@gentleduck/registry-ui/direction'

function Arrow({ dir }: { dir?: string }) {
  const direction = useDirection(toDirection(dir))
  return (
    <span className="rounded-md border px-3 py-1 text-sm">
      {direction === 'rtl' ? '<-' : '->'} {direction}
    </span>
  )
}

export default function Demo() {
  return (
    <div className="flex flex-col items-center gap-3">
      <DirectionProvider dir="rtl">
        <div className="flex gap-2">
          <Arrow />
          <Arrow dir="ltr" />
          <Arrow dir="sideways" />
        </div>
      </DirectionProvider>
      <Provider dir="ltr">
        <Arrow />
      </Provider>
      <p className="text-muted-foreground text-sm">
        toDirection drops a value that is not ltr or rtl, so useDirection falls back to the provider.
      </p>
    </div>
  )
}
