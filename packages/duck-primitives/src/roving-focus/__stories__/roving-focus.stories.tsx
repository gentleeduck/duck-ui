import * as React from 'react'
import { Frame, ShadowRoot } from '../../__stories__/hosts'
import { RovingFocusGroup, RovingFocusGroupItem } from '..'
import styles from './roving-focus.stories.module.css'

export default { title: 'Components/RovingFocusGroup' }

const TOOLS = ['Bold', 'Italic', 'Underline', 'Strike', 'Code']

type Toggle = readonly [string, boolean, (checked: boolean) => void]

function Toggles({ toggles }: { toggles: readonly Toggle[] }) {
  return toggles.map(([label, checked, set]) => (
    <label key={label}>
      <input checked={checked} onChange={(event) => set(event.target.checked)} type="checkbox" />
      {label}
    </label>
  ))
}

export const Basic = () => {
  const [rtl, setRtl] = React.useState(false)
  const [vertical, setVertical] = React.useState(false)
  const [loop, setLoop] = React.useState(false)
  const [underline, setUnderline] = React.useState(true)
  const [italicActive, setItalicActive] = React.useState(false)
  const [preventEntry, setPreventEntry] = React.useState(false)
  const [tabStop, setTabStop] = React.useState<string | null>(null)

  return (
    <div className={styles.page}>
      <Toggles
        toggles={[
          ['Right-to-left', rtl, setRtl],
          ['Vertical', vertical, setVertical],
          ['Loop', loop, setLoop],
          ['Underline can take focus', underline, setUnderline],
          ['Italic is active', italicActive, setItalicActive],
          ['Prevent entry focus', preventEntry, setPreventEntry],
        ]}
      />
      <input aria-label="Before" />
      <RovingFocusGroup
        aria-label="Formatting"
        className={styles.group}
        dir={rtl ? 'rtl' : undefined}
        loop={loop}
        onCurrentTabStopIdChange={setTabStop}
        onEntryFocus={(event) => {
          if (preventEntry) event.preventDefault()
        }}
        orientation={vertical ? 'vertical' : 'horizontal'}
        role="toolbar">
        {TOOLS.map((tool) => {
          const focusable = tool !== 'Underline' || underline
          return (
            <RovingFocusGroupItem
              active={italicActive && tool === 'Italic'}
              asChild
              focusable={focusable}
              key={tool}
              tabStopId={tool}>
              {({ isCurrentTabStop, hasTabStop }) => (
                <button
                  className={styles.item}
                  data-has-tab-stop={hasTabStop ? '' : undefined}
                  data-tab-stop={isCurrentTabStop ? '' : undefined}
                  disabled={!focusable}
                  type="button">
                  {tool}
                </button>
              )}
            </RovingFocusGroupItem>
          )
        })}
      </RovingFocusGroup>
      <button type="button">After</button>
      <output aria-label="Tab stop" role="status">
        {tabStop ?? 'None'}
      </output>
    </div>
  )
}

function Trio() {
  return (
    <RovingFocusGroup aria-label="Trio" className={styles.group} role="toolbar">
      {['One', 'Two', 'Three'].map((name) => (
        <RovingFocusGroupItem asChild key={name}>
          <button className={styles.item} type="button">
            {name}
          </button>
        </RovingFocusGroupItem>
      ))}
    </RovingFocusGroup>
  )
}

export const Hosts = () => (
  <div className={styles.page}>
    <Frame className={styles.frame}>
      <Trio />
    </Frame>
    <ShadowRoot>
      <Trio />
    </ShadowRoot>
  </div>
)
