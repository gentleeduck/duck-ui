import { Typeset } from '@gentleduck/registry-ui/typeset'

export default function Demo() {
  return (
    <Typeset className="w-full max-w-md" size="sm">
      <p>This page covers it:</p>
      <div className="flex flex-col gap-2 rounded-lg border p-4" data-not-typeset="">
        <span className="text-muted-foreground text-xs">docs / calendar</span>
        <a className="font-semibold hover:underline" href="#selecting-a-range">
          Selecting a range
        </a>
        <Typeset size="sm">
          <p>
            Pass <code>mode="range"</code> and the calendar keeps a start and an end:
          </p>
          <ul>
            <li>The first click sets the start</li>
            <li>The second click sets the end</li>
          </ul>
        </Typeset>
      </div>
      <p>The card lays itself out with utilities, and the excerpt inside it is prose again.</p>
    </Typeset>
  )
}
