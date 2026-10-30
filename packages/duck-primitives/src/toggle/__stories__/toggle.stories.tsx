import * as React from 'react'
import * as Toggle from '..'
import styles from './toggle.stories.module.css'

export default { title: 'Components/Toggle' }

export const Basic = () => {
  const [changes, setChanges] = React.useState<boolean[]>([])
  const [disabled, setDisabled] = React.useState(false)

  return (
    <div className={styles.page}>
      <Toggle.Root
        aria-label="Bold"
        className={styles.toggle}
        disabled={disabled}
        onPressedChange={(pressed) => setChanges((list) => [...list, pressed])}>
        {(pressed) => (pressed ? 'Bold on' : 'Bold off')}
      </Toggle.Root>
      <Toggle.Root aria-label="Italic" className={styles.toggle} defaultPressed>
        Italic
      </Toggle.Root>
      <output aria-label="Changes">{changes.join(', ')}</output>
      <label>
        <input checked={disabled} onChange={(event) => setDisabled(event.target.checked)} type="checkbox" />
        Disabled
      </label>
    </div>
  )
}

export const Controlled = () => {
  const [pressed, setPressed] = React.useState(false)
  const [locked, setLocked] = React.useState(false)
  const [asked, setAsked] = React.useState<boolean[]>([])

  return (
    <div className={styles.page}>
      <Toggle.Root
        aria-label="Mute"
        className={styles.toggle}
        onPressedChange={(next) => {
          setAsked((list) => [...list, next])
          if (!locked) setPressed(next)
        }}
        pressed={pressed}>
        Mute
      </Toggle.Root>
      <output aria-label="Asked">{asked.join(', ')}</output>
      <button onClick={() => setPressed(true)} type="button">
        Mute from outside
      </button>
      <label>
        <input checked={locked} onChange={(event) => setLocked(event.target.checked)} type="checkbox" />
        Locked
      </label>
    </div>
  )
}

const FancyButton = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<'button'>>(
  ({ className, ...props }, ref) => <button {...props} className={`${styles.toggle} ${className ?? ''}`} ref={ref} />,
)
FancyButton.displayName = 'FancyButton'

export const Composed = () => {
  const ref = React.useRef<HTMLButtonElement>(null)
  const [refTag, setRefTag] = React.useState('')
  const [pinned, setPinned] = React.useState(true)
  const [allowUnpin, setAllowUnpin] = React.useState(false)

  React.useEffect(() => setRefTag(ref.current?.tagName ?? ''), [])

  return (
    <div className={styles.page}>
      <Toggle.Root
        aria-label="Pin"
        asChild
        className="composed"
        onClick={(event) => {
          if (pinned && !allowUnpin) event.preventDefault()
        }}
        onPressedChange={setPinned}
        pressed={pinned}
        ref={ref}>
        <FancyButton>{pinned ? 'Pinned' : 'Not pinned'}</FancyButton>
      </Toggle.Root>
      <output aria-label="Ref">{refTag}</output>
      <label>
        <input checked={allowUnpin} onChange={(event) => setAllowUnpin(event.target.checked)} type="checkbox" />
        Allow unpin
      </label>
    </div>
  )
}
