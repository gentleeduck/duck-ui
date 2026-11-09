// From Radix UI primitives, apps/storybook/stories/menubar.stories.tsx. MIT, see ../../__tests__/radix/LICENSE.

import * as React from 'react'
import { ExternalOverlayTrigger } from '../../__stories__/external-overlay'
import { Menubar } from '../../__stories__/radix-ui'
import styles from './menubar.stories.module.css'

export default {
  title: 'Components/Menubar',
}

const subTriggerClass = [styles.item, styles.subTrigger].join(' ')

export const WithExtensionOverlay = () => {
  const [value, setValue] = React.useState('')

  return (
    <div style={{ display: 'grid', gap: 20, padding: 50, justifyItems: 'start' }}>
      <ExternalOverlayTrigger />
      <Menubar.Root className={styles.root} value={value} onValueChange={setValue}>
        <Menubar.Menu value="edit">
          <Menubar.Trigger className={styles.trigger}>Edit</Menubar.Trigger>
          <Menubar.Portal>
            <Menubar.Content className={styles.content} sideOffset={2}>
              <Menubar.Item className={styles.item}>Undo</Menubar.Item>
              <Menubar.Item className={styles.item}>Redo</Menubar.Item>
            </Menubar.Content>
          </Menubar.Portal>
        </Menubar.Menu>
      </Menubar.Root>
      <div data-testid="menubar-state">{value === '' ? 'closed' : 'open'}</div>
    </div>
  )
}

export const Cypress = () => {
  const [loop, setLoop] = React.useState(false)
  const [rtl, setRtl] = React.useState(false)
  const [portalled, setPortalled] = React.useState(false)

  const dir = rtl ? 'rtl' : 'ltr'
  const Portal = portalled ? Menubar.Portal : React.Fragment

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        paddingTop: 50,
      }}>
      <div style={{ display: 'flex', gap: 25, marginBottom: 20 }}>
        <label>
          <input type="checkbox" checked={rtl} onChange={(event) => setRtl(event.currentTarget.checked)} />
          Right-to-left
        </label>

        <label>
          <input type="checkbox" checked={loop} onChange={(event) => setLoop(event.currentTarget.checked)} />
          Loop
        </label>

        <label>
          <input type="checkbox" checked={portalled} onChange={(event) => setPortalled(event.currentTarget.checked)} />
          Portalled
        </label>
      </div>
      <div dir={dir}>
        <Menubar.Root className={styles.root} loop={loop} dir={dir}>
          <Menubar.Menu>
            <Menubar.Trigger className={styles.trigger}>File</Menubar.Trigger>
            <Portal>
              <Menubar.Content className={styles.content} sideOffset={2}>
                <Menubar.Item className={styles.item}>New Tab</Menubar.Item>
                <Menubar.Item className={styles.item}>New Window</Menubar.Item>
                <Menubar.Item className={styles.item}>New Incognito Window</Menubar.Item>
                <Menubar.Separator className={styles.separator} />
                <Menubar.Sub>
                  <Menubar.SubTrigger className={subTriggerClass}>
                    Share <span>→</span>
                  </Menubar.SubTrigger>
                  <Menubar.SubContent className={styles.content} alignOffset={-6}>
                    <Menubar.Item className={styles.item}>Email Link</Menubar.Item>
                    <Menubar.Item className={styles.item}>Messages</Menubar.Item>
                    <Menubar.Item className={styles.item}>Airdrop</Menubar.Item>
                  </Menubar.SubContent>
                </Menubar.Sub>
                <Menubar.Separator className={styles.separator} />
                <Menubar.Item className={styles.item}>Print…</Menubar.Item>
              </Menubar.Content>
            </Portal>
          </Menubar.Menu>

          <Menubar.Menu>
            <Menubar.Trigger className={styles.trigger}>Edit</Menubar.Trigger>
            <Portal>
              <Menubar.Content className={styles.content} sideOffset={2}>
                <Menubar.Item className={styles.item} disabled>
                  Undo
                </Menubar.Item>
                <Menubar.Item className={styles.item}>Redo</Menubar.Item>
                <Menubar.Separator className={styles.separator} />
                <Menubar.Sub>
                  <Menubar.SubTrigger className={subTriggerClass}>
                    Find <span>→</span>
                  </Menubar.SubTrigger>
                  <Portal>
                    <Menubar.SubContent className={styles.content} alignOffset={-6}>
                      <Menubar.Item className={styles.item}>Search the web…</Menubar.Item>
                      <Menubar.Separator className={styles.separator} />
                      <Menubar.Item className={styles.item}>Find…</Menubar.Item>
                      <Menubar.Item className={styles.item}>Find Next</Menubar.Item>
                      <Menubar.Item className={styles.item}>Find Previous</Menubar.Item>
                      <Menubar.Sub>
                        <Menubar.SubTrigger className={subTriggerClass}>
                          Advanced <span>→</span>
                        </Menubar.SubTrigger>

                        <Portal>
                          <Menubar.SubContent className={styles.content} alignOffset={-6}>
                            <Menubar.Item className={styles.item}>Regex</Menubar.Item>
                            <Menubar.Item className={styles.item}>Replace</Menubar.Item>
                          </Menubar.SubContent>
                        </Portal>
                      </Menubar.Sub>
                    </Menubar.SubContent>
                  </Portal>
                </Menubar.Sub>

                <Menubar.Sub>
                  <Menubar.SubTrigger className={subTriggerClass} disabled>
                    Speech <span>→</span>
                  </Menubar.SubTrigger>
                  <Portal>
                    <Menubar.SubContent className={styles.content} alignOffset={-6}>
                      <Menubar.Item className={styles.item}>Start Speaking</Menubar.Item>
                      <Menubar.Item className={styles.item}>Stop Speaking</Menubar.Item>
                    </Menubar.SubContent>
                  </Portal>
                </Menubar.Sub>

                <Menubar.Sub>
                  <Menubar.SubTrigger className={subTriggerClass}>
                    Substitutions <span>→</span>
                  </Menubar.SubTrigger>
                  <Portal>
                    <Menubar.SubContent className={styles.content} alignOffset={-6}>
                      <Menubar.Item className={styles.item}>Smart Quotes</Menubar.Item>
                      <Menubar.Item className={styles.item}>Smart Dashes</Menubar.Item>
                    </Menubar.SubContent>
                  </Portal>
                </Menubar.Sub>
                <Menubar.Separator className={styles.separator} />
                <Menubar.Item className={styles.item}>Cut</Menubar.Item>
                <Menubar.Item className={styles.item}>Copy</Menubar.Item>
                <Menubar.Item className={styles.item}>Paste</Menubar.Item>
              </Menubar.Content>
            </Portal>
          </Menubar.Menu>

          <Menubar.Menu>
            <Menubar.Trigger className={styles.trigger}>History</Menubar.Trigger>
            <Portal>
              <Menubar.Content className={styles.content} sideOffset={2}>
                <Menubar.Item className={styles.item}>Radix</Menubar.Item>
                <Menubar.Item className={styles.item}>Github</Menubar.Item>
                <Menubar.Item className={styles.item}>WorkOS</Menubar.Item>
              </Menubar.Content>
            </Portal>
          </Menubar.Menu>
        </Menubar.Root>
      </div>
    </div>
  )
}

export const CheckableItems = () => {
  const [ruler, setRuler] = React.useState(true)
  const [grid, setGrid] = React.useState(false)
  const [zoom, setZoom] = React.useState('fit')

  return (
    <div style={{ display: 'grid', gap: 20, padding: 50, justifyItems: 'start' }}>
      <Menubar.Root className={styles.root}>
        <Menubar.Menu value="view">
          <Menubar.Trigger className={styles.trigger}>View</Menubar.Trigger>
          <Menubar.Portal>
            <Menubar.Content align="start" className={styles.content} sideOffset={5}>
              <Menubar.Label className={styles.label}>Show</Menubar.Label>
              <Menubar.CheckboxItem checked={ruler} className={styles.item} onCheckedChange={setRuler}>
                Ruler
                <Menubar.ItemIndicator aria-hidden>✓</Menubar.ItemIndicator>
              </Menubar.CheckboxItem>
              <Menubar.CheckboxItem
                checked={grid}
                className={styles.item}
                closeOnSelect={false}
                onCheckedChange={setGrid}>
                Grid
                <Menubar.ItemIndicator aria-hidden>✓</Menubar.ItemIndicator>
              </Menubar.CheckboxItem>
              <Menubar.Sub closeParentOnEsc={false}>
                <Menubar.SubTrigger className={subTriggerClass}>
                  Panels <span>→</span>
                </Menubar.SubTrigger>
                <Menubar.SubContent alignOffset={-6} className={styles.content}>
                  <Menubar.Item className={styles.item}>Layers</Menubar.Item>
                  <Menubar.Item className={styles.item}>Outline</Menubar.Item>
                </Menubar.SubContent>
              </Menubar.Sub>
              <Menubar.Separator className={styles.separator} />
              <Menubar.Group aria-label="Zoom">
                <Menubar.Label className={styles.label}>Zoom</Menubar.Label>
                <Menubar.RadioGroup onValueChange={setZoom} value={zoom}>
                  <Menubar.RadioItem className={styles.item} value="fit">
                    Fit
                    <Menubar.ItemIndicator aria-hidden>●</Menubar.ItemIndicator>
                  </Menubar.RadioItem>
                  <Menubar.RadioItem className={styles.item} value="actual">
                    Actual size
                    <Menubar.ItemIndicator aria-hidden>●</Menubar.ItemIndicator>
                  </Menubar.RadioItem>
                </Menubar.RadioGroup>
              </Menubar.Group>
              <Menubar.Separator className={styles.separator} />
              <Menubar.Item className={styles.item} disabled>
                Paste
              </Menubar.Item>
              <Menubar.Arrow />
            </Menubar.Content>
          </Menubar.Portal>
        </Menubar.Menu>
      </Menubar.Root>
      <output aria-label="Settings">{`ruler ${ruler ? 'on' : 'off'}, grid ${grid ? 'on' : 'off'}, zoom ${zoom}`}</output>
    </div>
  )
}

export const ControlledAndDisabled = () => {
  const [value, setValue] = React.useState('')
  const [disabled, setDisabled] = React.useState(false)
  const [vertical, setVertical] = React.useState(false)
  const [modal, setModal] = React.useState(false)
  const [clicks, setClicks] = React.useState(0)

  return (
    <div style={{ display: 'grid', gap: 20, padding: 50, justifyItems: 'start' }}>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={() => setValue('edit')} type="button">
          Open Edit
        </button>
        <button onClick={() => setValue('')} type="button">
          Close menus
        </button>
        <button onClick={() => setClicks((count) => count + 1)} type="button">
          Count
        </button>
      </div>
      <output aria-label="Open menu">{value || 'none'}</output>
      <output aria-label="Clicks">{clicks}</output>
      <div style={{ display: 'flex', gap: 20 }}>
        <label>
          <input checked={disabled} onChange={(event) => setDisabled(event.currentTarget.checked)} type="checkbox" />
          Disabled
        </label>
        <label>
          <input checked={vertical} onChange={(event) => setVertical(event.currentTarget.checked)} type="checkbox" />
          Vertical
        </label>
        <label>
          <input checked={modal} onChange={(event) => setModal(event.currentTarget.checked)} type="checkbox" />
          Modal
        </label>
      </div>
      <Menubar.Root
        className={styles.root}
        disabled={disabled}
        modal={modal}
        onValueChange={setValue}
        orientation={vertical ? 'vertical' : 'horizontal'}
        style={vertical ? { display: 'flex', flexDirection: 'column' } : undefined}
        value={value}>
        {[
          ['file', 'File', ['New Tab', 'New Window']],
          ['edit', 'Edit', ['Undo', 'Redo']],
        ].map(([menu, label, items]) => (
          <Menubar.Menu key={menu as string} value={menu as string}>
            <Menubar.Trigger className={styles.trigger}>{label}</Menubar.Trigger>
            <Menubar.Portal>
              <Menubar.Content align="start" className={styles.content} side={vertical ? 'right' : 'bottom'}>
                {(items as string[]).map((item) => (
                  <Menubar.Item className={styles.item} key={item}>
                    {item}
                  </Menubar.Item>
                ))}
              </Menubar.Content>
            </Menubar.Portal>
          </Menubar.Menu>
        ))}
        <Menubar.Menu value="help">
          <Menubar.Trigger className={styles.trigger} disabled>
            Help
          </Menubar.Trigger>
        </Menubar.Menu>
      </Menubar.Root>
    </div>
  )
}
