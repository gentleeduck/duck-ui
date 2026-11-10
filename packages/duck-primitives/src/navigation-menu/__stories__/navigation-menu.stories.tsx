import * as React from 'react'
import * as NavigationMenu from '..'
import styles from './navigation-menu.stories.module.css'

export default {
  title: 'Components/NavigationMenu',
}

const toggle = (label: string, checked: boolean, onChange: (checked: boolean) => void) => (
  <label>
    <input checked={checked} onChange={(event) => onChange(event.currentTarget.checked)} type="checkbox" />
    {label}
  </label>
)

const milliseconds = (label: string, value: number, onChange: (value: number) => void) => (
  <label>
    {label}
    <input
      min={0}
      onChange={(event) => onChange(event.currentTarget.valueAsNumber || 0)}
      step={50}
      type="number"
      value={value}
    />
  </label>
)

interface IItemsProps {
  contentClass: string
  closeOnSelect?: boolean
  forceMount?: true
  onSelect?: (name: string) => void
}

const Items = ({ contentClass, closeOnSelect, forceMount, onSelect }: IItemsProps) => {
  const link = (name: string) => (
    <NavigationMenu.Link
      className={styles.link}
      closeOnSelect={closeOnSelect}
      href={`#${name}`}
      key={name}
      onSelect={() => onSelect?.(name)}>
      {name}
    </NavigationMenu.Link>
  )

  return (
    <>
      <NavigationMenu.Item className={styles.item} value="learn">
        <NavigationMenu.Trigger className={styles.trigger}>Learn</NavigationMenu.Trigger>
        <NavigationMenu.Content className={contentClass} forceMount={forceMount}>
          {['Stitches', 'Colors'].map(link)}
        </NavigationMenu.Content>
      </NavigationMenu.Item>
      <NavigationMenu.Item className={styles.item} value="overview">
        <NavigationMenu.Trigger className={styles.trigger}>Overview</NavigationMenu.Trigger>
        <NavigationMenu.Content className={contentClass} data-wide="" forceMount={forceMount}>
          {['Introduction', 'Getting started', 'Styling', 'Animation', 'Accessibility', 'Releases'].map(link)}
        </NavigationMenu.Content>
      </NavigationMenu.Item>
      <NavigationMenu.Item className={styles.item} value="soon">
        <NavigationMenu.Trigger className={styles.trigger} disabled>
          Soon
        </NavigationMenu.Trigger>
        <NavigationMenu.Content className={contentClass} forceMount={forceMount}>
          Nothing yet
        </NavigationMenu.Content>
      </NavigationMenu.Item>
      <NavigationMenu.Item className={styles.item}>
        <NavigationMenu.Link active className={styles.link} href="#blog" onSelect={() => onSelect?.('Blog')}>
          Blog
        </NavigationMenu.Link>
      </NavigationMenu.Item>
      <NavigationMenu.Indicator className={styles.indicator} forceMount={forceMount} />
    </>
  )
}

const inViewport = `${styles.content} ${styles.inViewport}`

export const Basic = () => {
  const [value, setValue] = React.useState('')
  const [vertical, setVertical] = React.useState(false)
  const [rtl, setRtl] = React.useState(false)
  const [manual, setManual] = React.useState(false)
  const [viewport, setViewport] = React.useState(true)
  const [keepOpen, setKeepOpen] = React.useState(false)
  const [forceMount, setForceMount] = React.useState(false)
  const [selected, setSelected] = React.useState('none')

  return (
    <div className={styles.page}>
      <div className={styles.controls}>
        {toggle('Vertical', vertical, setVertical)}
        {toggle('Right-to-left', rtl, setRtl)}
        {toggle('Manual', manual, setManual)}
        {toggle('Viewport', viewport, setViewport)}
        {toggle('Keep open on select', keepOpen, setKeepOpen)}
        {toggle('Force mount', forceMount, setForceMount)}
      </div>
      <output aria-label="Open item">{value || 'none'}</output>
      <output aria-label="Selected link">{selected}</output>
      <NavigationMenu.Root
        activationMode={manual ? 'manual' : 'automatic'}
        className={vertical ? `${styles.root} ${styles.vertical}` : styles.root}
        dir={rtl ? 'rtl' : 'ltr'}
        onValueChange={setValue}
        orientation={vertical ? 'vertical' : 'horizontal'}
        value={value}>
        <NavigationMenu.List className={styles.list}>
          <Items
            closeOnSelect={!keepOpen}
            contentClass={viewport ? inViewport : `${styles.content} ${styles.inline}`}
            forceMount={forceMount || undefined}
            onSelect={setSelected}
          />
        </NavigationMenu.List>
        {viewport ? (
          <div className={styles.viewportPosition}>
            <NavigationMenu.Viewport className={styles.viewport} forceMount={forceMount || undefined} />
          </div>
        ) : null}
      </NavigationMenu.Root>
    </div>
  )
}

export const Timing = () => {
  const [value, setValue] = React.useState('')
  const [delayDuration, setDelayDuration] = React.useState(200)
  const [skipDelayDuration, setSkipDelayDuration] = React.useState(300)
  const [closeDelay, setCloseDelay] = React.useState(150)

  return (
    <div className={styles.page}>
      <div className={styles.controls}>
        {milliseconds('delayDuration', delayDuration, setDelayDuration)}
        {milliseconds('skipDelayDuration', skipDelayDuration, setSkipDelayDuration)}
        {milliseconds('closeDelay', closeDelay, setCloseDelay)}
      </div>
      <output aria-label="Open item">{value || 'none'}</output>
      <NavigationMenu.Root
        className={styles.root}
        closeDelay={closeDelay}
        delayDuration={delayDuration}
        onValueChange={setValue}
        skipDelayDuration={skipDelayDuration}
        value={value}>
        <NavigationMenu.List className={styles.list}>
          <Items contentClass={inViewport} />
        </NavigationMenu.List>
        <div className={styles.viewportPosition}>
          <NavigationMenu.Viewport className={styles.viewport} />
        </div>
      </NavigationMenu.Root>
    </div>
  )
}

export const ViewportChildren = () => {
  const [asChild, setAsChild] = React.useState(false)
  const bar = <span aria-hidden className={styles.viewportBar} data-testid="viewport-bar" />

  return (
    <div className={styles.page}>
      <div className={styles.controls}>{toggle('asChild', asChild, setAsChild)}</div>
      <NavigationMenu.Root className={styles.root}>
        <NavigationMenu.List className={styles.list}>
          <Items contentClass={inViewport} />
        </NavigationMenu.List>
        <div className={styles.viewportPosition}>
          {asChild ? (
            <NavigationMenu.Viewport asChild>
              <section aria-label="Menu panel" className={styles.viewport}>
                {bar}
              </section>
            </NavigationMenu.Viewport>
          ) : (
            <NavigationMenu.Viewport className={styles.viewport}>{bar}</NavigationMenu.Viewport>
          )}
        </div>
      </NavigationMenu.Root>
    </div>
  )
}

const SUB_MODES = { automatic: 'automatic', inherit: "the root's", manual: 'manual' }

type SubMode = keyof typeof SUB_MODES

export const Submenu = () => {
  const [manual, setManual] = React.useState(false)
  const [subMode, setSubMode] = React.useState<SubMode>('inherit')
  const [toggles, setToggles] = React.useState(false)

  return (
    <div className={styles.page}>
      <div className={styles.controls}>
        {toggle('Manual', manual, setManual)}
        {toggle('Close on a second click', toggles, setToggles)}
      </div>
      <fieldset className={styles.controls}>
        <legend>Sub-menu activation</legend>
        {(Object.keys(SUB_MODES) as SubMode[]).map((mode) => (
          <label key={mode}>
            <input checked={subMode === mode} name="sub-mode" onChange={() => setSubMode(mode)} type="radio" />
            {SUB_MODES[mode]}
          </label>
        ))}
      </fieldset>
      <NavigationMenu.Root activationMode={manual ? 'manual' : 'automatic'} className={styles.root}>
        <NavigationMenu.List className={styles.list}>
          <NavigationMenu.Item className={styles.item} value="products">
            <NavigationMenu.Trigger className={styles.trigger}>Products</NavigationMenu.Trigger>
            <NavigationMenu.Content className={`${styles.content} ${styles.inline}`}>
              <NavigationMenu.Sub
                activationMode={subMode === 'inherit' ? undefined : subMode}
                defaultValue="extensibility"
                disableToggle={!toggles}
                orientation="vertical">
                <NavigationMenu.List className={styles.list}>
                  <NavigationMenu.Item value="extensibility">
                    <NavigationMenu.Trigger className={styles.trigger}>Extensibility</NavigationMenu.Trigger>
                    <NavigationMenu.Content className={styles.content}>
                      <NavigationMenu.Link className={styles.link} href="#plugins">
                        Plugins
                      </NavigationMenu.Link>
                    </NavigationMenu.Content>
                  </NavigationMenu.Item>
                  <NavigationMenu.Item value="security">
                    <NavigationMenu.Trigger className={styles.trigger}>Security</NavigationMenu.Trigger>
                    <NavigationMenu.Content className={styles.content}>
                      <NavigationMenu.Link className={styles.link} href="#audit-log">
                        Audit log
                      </NavigationMenu.Link>
                    </NavigationMenu.Content>
                  </NavigationMenu.Item>
                </NavigationMenu.List>
              </NavigationMenu.Sub>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
        </NavigationMenu.List>
      </NavigationMenu.Root>
    </div>
  )
}
