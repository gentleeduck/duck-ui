'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Typeset } from '@gentleduck/registry-ui/typeset'
import * as React from 'react'

const BLOCKS: React.ReactNode[] = [
  <p key="intro">Sure. Wrap the rendered markdown in a typeset container:</p>,
  <pre key="code">
    <code>{'<Typeset size="sm">\n  <Markdown>{message}</Markdown>\n</Typeset>'}</code>
  </pre>,
  <p key="why">Each new block only adds space above itself, so nothing on screen moves while the answer streams.</p>,
  <ul key="list">
    <li>No layout jumps</li>
    <li>No per-element classes</li>
  </ul>,
]

export default function Demo() {
  const [count, setCount] = React.useState(0)

  React.useEffect(() => {
    if (count >= BLOCKS.length) return
    const timer = setTimeout(() => setCount((value) => value + 1), 700)
    return () => clearTimeout(timer)
  }, [count])

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <div className="self-end rounded-2xl rounded-ee-md bg-primary px-3.5 py-2 text-primary-foreground text-sm">
        How do I style chat answers?
      </div>
      <Typeset aria-live="polite" size="sm">
        {BLOCKS.slice(0, count)}
      </Typeset>
      <Button className="self-start" onClick={() => setCount(0)} size="sm" variant="outline">
        Replay
      </Button>
    </div>
  )
}
