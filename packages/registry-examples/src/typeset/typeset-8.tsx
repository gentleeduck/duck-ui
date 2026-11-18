import { Typeset } from '@gentleduck/registry-ui/typeset'

export default function Demo() {
  return (
    <Typeset className="w-full max-w-xl">
      <h2 className="text-primary">Version 2.4</h2>
      <p className="mt-1 text-muted-foreground text-sm">Released on 2 October 2026</p>
      <p>
        The calendar selects ranges. Pass <code>mode="range"</code> and read the start and end from{' '}
        <code>onSelect</code>.
      </p>
      <blockquote className="border-s-primary text-foreground">
        Upgrading needs no code changes unless you styled the selected day yourself.
      </blockquote>
    </Typeset>
  )
}
