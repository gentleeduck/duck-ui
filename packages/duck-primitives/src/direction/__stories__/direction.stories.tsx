import * as React from 'react'
import * as Popover from '../../popover'
import * as Direction from '..'
import styles from './direction.stories.module.css'

export default { title: 'Components/Direction' }

type Choice = Direction.IDirection.Kind | ''

const CHOICES: readonly Choice[] = ['', 'ltr', 'rtl']

function Pick<T extends string>({
  label,
  onChange,
  options,
  value,
}: {
  label: string
  onChange: (value: T) => void
  options: readonly T[]
  value: T
}) {
  return (
    <label>
      {label}{' '}
      <select
        aria-label={label}
        onChange={(event) => {
          const next = options.find((option) => option === event.target.value)
          if (next !== undefined) onChange(next)
        }}
        value={value}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option || 'none'}
          </option>
        ))}
      </select>
    </label>
  )
}

function Wrap({ children, dir }: { children: React.ReactNode; dir: Choice }) {
  return dir ? <Direction.Provider dir={dir}>{children}</Direction.Provider> : children
}

function Resolved({ label, localDir }: { label: string; localDir?: Direction.IDirection.Kind }) {
  return (
    <span>
      {label}: <output aria-label={label}>{Direction.useDirection(localDir)}</output>
    </span>
  )
}

export const Basic = () => {
  const [document, setDocument] = React.useState('')
  const [provider, setProvider] = React.useState<Choice>('')
  const [nested, setNested] = React.useState<Choice>('')
  const [local, setLocal] = React.useState<Choice>('')

  React.useEffect(() => {
    const html = window.document.documentElement
    if (document) html.setAttribute('dir', document)
    else html.removeAttribute('dir')
    return () => html.removeAttribute('dir')
  }, [document])

  return (
    <div className={styles.page}>
      <Pick label="Document" onChange={setDocument} options={['', 'ltr', 'rtl', 'RTL', 'auto']} value={document} />
      <Pick label="Provider dir" onChange={setProvider} options={CHOICES} value={provider} />
      <Pick label="Nested provider dir" onChange={setNested} options={CHOICES} value={nested} />
      <Pick label="Local dir" onChange={setLocal} options={CHOICES} value={local} />
      <Resolved label="Page" />
      <Wrap dir={provider}>
        <Resolved label="Provider" />
        <Wrap dir={nested}>
          <Resolved label="Nested" />
          <Resolved label="Local" localDir={local || undefined} />
        </Wrap>
      </Wrap>
    </div>
  )
}

export const Layout = () => {
  const [rtl, setRtl] = React.useState(true)
  const dir = rtl ? 'rtl' : 'ltr'

  return (
    <div className={styles.page}>
      <label>
        <input checked={rtl} onChange={(event) => setRtl(event.target.checked)} type="checkbox" />
        Right-to-left
      </label>
      <Direction.Provider dir={dir}>
        <div className={styles.row}>
          <span>First</span>
          <span>Second</span>
        </div>
        <p className={styles.mark}>Marked</p>
      </Direction.Provider>
      <div className={styles.grid}>
        <Direction.Provider dir={dir}>
          <div>Cell one</div>
          <div>Cell two</div>
        </Direction.Provider>
      </div>
    </div>
  )
}

export const Portalled = () => {
  const [rtl, setRtl] = React.useState(true)

  return (
    <div className={styles.page}>
      <label>
        <input checked={rtl} onChange={(event) => setRtl(event.target.checked)} type="checkbox" />
        Right-to-left
      </label>
      <Direction.Provider dir={rtl ? 'rtl' : 'ltr'}>
        <div className={styles.triggers}>
          <Popover.Root>
            <Popover.Trigger>Align start</Popover.Trigger>
            <Popover.Portal>
              <Popover.Content align="start" aria-label="Below" className={styles.content} side="bottom" sideOffset={4}>
                Below, at the start
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
          <Popover.Root>
            <Popover.Trigger>Side right</Popover.Trigger>
            <Popover.Portal>
              <Popover.Content aria-label="Beside" className={styles.content} side="right" sideOffset={4}>
                Beside
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>
      </Direction.Provider>
    </div>
  )
}
