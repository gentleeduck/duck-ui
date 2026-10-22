import * as React from 'react'
import { Presence } from '..'

export default {
  title: 'Utilities/Presence',
}

const EXITS = {
  none: 'no animation',
  one: 'fade-out 300ms',
  several: 'fade-out 200ms and slide-out 500ms',
  contains: 'fade-out 300ms, opening with fade 600ms',
  missing: 'an animation with no keyframes',
  same: 'the animation it opened with',
  delayed: 'an opening animation still in its delay',
  hidden: 'fade-out 300ms while display is none',
}

type Exit = keyof typeof EXITS

// Global, so the names stay as written: CSS modules would hash them, and `fade` would no longer be part of `fade-out`.
const STYLES = `
@keyframes presence-story-fade-in { from { opacity: 0 } }
@keyframes presence-story-fade { from { opacity: 0 } }
@keyframes presence-story-fade-out { to { opacity: 0 } }
@keyframes presence-story-slide-out { to { translate: 0 8px } }
.presence-story { display: flex; flex-direction: column; gap: 16px; max-width: 420px; font-family: system-ui, sans-serif }
.presence-story fieldset { display: flex; flex-direction: column; gap: 4px }
.presence-story-content { margin: 0; padding: 12px 16px; border-radius: 8px; background: #eff6ff; color: #1e3a8a }
.presence-story-content[data-state="open"] { animation: presence-story-fade-in 300ms ease-out }
.presence-story-content[data-exit="one"][data-state="closed"] { animation: presence-story-fade-out 300ms ease-in }
.presence-story-content[data-exit="several"][data-state="closed"] {
  animation: presence-story-fade-out 200ms ease-in, presence-story-slide-out 500ms ease-in
}
.presence-story-content[data-exit="contains"][data-state="open"] { animation: presence-story-fade 600ms ease-out }
.presence-story-content[data-exit="contains"][data-state="closed"] { animation: presence-story-fade-out 300ms ease-in }
.presence-story-content[data-exit="missing"][data-state="closed"] { animation: presence-story-missing 300ms }
.presence-story-content[data-exit="same"] { animation: presence-story-fade-in 300ms ease-out }
.presence-story-content[data-exit="delayed"] { animation: presence-story-fade-in 300ms ease-out 2s infinite }
.presence-story-content[data-exit="hidden"][data-state="closed"] { display: none; animation: presence-story-fade-out 300ms }
.presence-story-content[data-exit="none"] { animation: none }
`

export const Animated = () => {
  const [open, setOpen] = React.useState(false)
  const [exit, setExit] = React.useState<Exit>('one')
  const [renderFunction, setRenderFunction] = React.useState(false)
  const content = (present: boolean) => (
    <p className="presence-story-content" data-exit={exit} data-state={open ? 'open' : 'closed'} id="content">
      Saved, {present ? 'present' : 'not present'}
    </p>
  )

  return (
    <div className="presence-story">
      <style>{STYLES}</style>
      <button onClick={() => setOpen(!open)} type="button">
        {open ? 'Close' : 'Open'}
      </button>
      {renderFunction ? (
        <Presence present={open}>{({ present }) => content(present)}</Presence>
      ) : (
        <Presence present={open}>{content(open)}</Presence>
      )}
      <fieldset>
        <legend>Exit</legend>
        {(Object.keys(EXITS) as Exit[]).map((name) => (
          <label key={name}>
            <input checked={exit === name} name="exit" onChange={() => setExit(name)} type="radio" />
            {EXITS[name]}
          </label>
        ))}
      </fieldset>
      <label>
        <input checked={renderFunction} onChange={(event) => setRenderFunction(event.target.checked)} type="checkbox" />
        Render function
      </label>
    </div>
  )
}
