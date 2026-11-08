// From Radix UI primitives, apps/storybook/stories/dropdown-menu.stories.tsx. MIT, see ../../__tests__/radix/LICENSE.

import * as React from 'react'
import { ExternalOverlayTrigger } from '../../__stories__/external-overlay'
import { Dialog, DropdownMenu } from '../../__stories__/radix-ui'
import * as Tooltip from '../../tooltip'
import styles from './dropdown-menu.stories.module.css'

export default {
  title: 'Components/DropdownMenu',
}

const subTriggerClass = [styles.item, styles.subTrigger].join(' ')

export const Submenus = () => {
  const [rtl, setRtl] = React.useState(false)
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <label style={{ marginBottom: 10 }}>
          <input type="checkbox" checked={rtl} onChange={(event) => setRtl(event.currentTarget.checked)} />
          Right-to-left
        </label>
        <DropdownMenu.Root dir={rtl ? 'rtl' : 'ltr'}>
          <DropdownMenu.Trigger className={styles.trigger}>Open</DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className={styles.content} sideOffset={5}>
              <DropdownMenu.Item className={styles.item} onSelect={() => console.log('new-tab')}>
                New Tab
              </DropdownMenu.Item>
              <DropdownMenu.Item className={styles.item} onSelect={() => console.log('new-window')}>
                New Window
              </DropdownMenu.Item>
              <DropdownMenu.Separator className={styles.separator} />
              <DropdownMenu.Sub>
                <DropdownMenu.SubTrigger className={subTriggerClass}>Bookmarks →</DropdownMenu.SubTrigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.SubContent className={styles.content} sideOffset={12} alignOffset={-6}>
                    <DropdownMenu.Item className={styles.item} onSelect={() => console.log('index')}>
                      Inbox
                    </DropdownMenu.Item>
                    <DropdownMenu.Item className={styles.item} onSelect={() => console.log('calendar')}>
                      Calendar
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator className={styles.separator} />
                    <DropdownMenu.Sub>
                      <DropdownMenu.SubTrigger className={subTriggerClass}>WorkOS →</DropdownMenu.SubTrigger>
                      <DropdownMenu.Portal>
                        <DropdownMenu.SubContent className={styles.content} sideOffset={12} alignOffset={-6}>
                          <DropdownMenu.Item className={styles.item} onSelect={() => console.log('stitches')}>
                            Stitches
                          </DropdownMenu.Item>
                          <DropdownMenu.Item className={styles.item} onSelect={() => console.log('composer')}>
                            Composer
                          </DropdownMenu.Item>
                          <DropdownMenu.Item className={styles.item} onSelect={() => console.log('radix')}>
                            Radix
                          </DropdownMenu.Item>
                          <DropdownMenu.Arrow />
                        </DropdownMenu.SubContent>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Sub>
                    <DropdownMenu.Separator className={styles.separator} />
                    <DropdownMenu.Item className={styles.item} onSelect={() => console.log('notion')}>
                      Notion
                    </DropdownMenu.Item>
                    <DropdownMenu.Arrow />
                  </DropdownMenu.SubContent>
                </DropdownMenu.Portal>
              </DropdownMenu.Sub>
              <DropdownMenu.Sub>
                <DropdownMenu.SubTrigger className={subTriggerClass} disabled>
                  History →
                </DropdownMenu.SubTrigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.SubContent className={styles.content} sideOffset={12} alignOffset={-6}>
                    <DropdownMenu.Item className={styles.item} onSelect={() => console.log('github')}>
                      Github
                    </DropdownMenu.Item>
                    <DropdownMenu.Item className={styles.item} onSelect={() => console.log('google')}>
                      Google
                    </DropdownMenu.Item>
                    <DropdownMenu.Item className={styles.item} onSelect={() => console.log('stack-overflow')}>
                      Stack Overflow
                    </DropdownMenu.Item>
                    <DropdownMenu.Arrow />
                  </DropdownMenu.SubContent>
                </DropdownMenu.Portal>
              </DropdownMenu.Sub>
              <DropdownMenu.Sub>
                <DropdownMenu.SubTrigger className={subTriggerClass}>Tools →</DropdownMenu.SubTrigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.SubContent className={styles.content} sideOffset={12} alignOffset={-6}>
                    <DropdownMenu.Item className={styles.item} onSelect={() => console.log('extensions')}>
                      Extensions
                    </DropdownMenu.Item>
                    <DropdownMenu.Item className={styles.item} onSelect={() => console.log('task-manager')}>
                      Task Manager
                    </DropdownMenu.Item>
                    <DropdownMenu.Item className={styles.item} onSelect={() => console.log('developer-tools')}>
                      Developer Tools
                    </DropdownMenu.Item>
                    <DropdownMenu.Arrow />
                  </DropdownMenu.SubContent>
                </DropdownMenu.Portal>
              </DropdownMenu.Sub>
              <DropdownMenu.Separator className={styles.separator} />
              <DropdownMenu.Item className={styles.item} disabled onSelect={() => console.log('print')}>
                Print…
              </DropdownMenu.Item>
              <DropdownMenu.Item className={styles.item} onSelect={() => console.log('cast')}>
                Cast…
              </DropdownMenu.Item>
              <DropdownMenu.Item className={styles.item} onSelect={() => console.log('find')}>
                Find…
              </DropdownMenu.Item>
              <DropdownMenu.Arrow />
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </div>
  )
}

export const WithExtensionOverlay = () => {
  const [open, setOpen] = React.useState(false)

  return (
    <div style={{ display: 'grid', gap: 20, padding: 50, justifyItems: 'start' }}>
      <ExternalOverlayTrigger />
      <DropdownMenu.Root open={open} onOpenChange={setOpen}>
        <DropdownMenu.Trigger className={styles.trigger}>Open</DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content className={styles.content} sideOffset={5}>
            <DropdownMenu.Item className={styles.item}>New Tab</DropdownMenu.Item>
            <DropdownMenu.Item className={styles.item}>New Window</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
      <div data-testid="dropdown-menu-state">{open ? 'open' : 'closed'}</div>
    </div>
  )
}

export const DismissesOnlyMenuInsideDialog = () => {
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [menuOpen, setMenuOpen] = React.useState(false)

  React.useEffect(() => {
    if (!dialogOpen) {
      setMenuOpen(false)
    }
  }, [dialogOpen])

  return (
    <div
      style={{
        display: 'grid',
        gap: 16,
        alignItems: 'start',
        justifyItems: 'start',
        padding: 40,
      }}>
      <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
        <Dialog.Trigger className={styles.trigger}>Open dialog</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Content className={styles.dialog}>
            <Dialog.Title>Dialog with nested dropdown</Dialog.Title>
            <DropdownMenu.Root open={menuOpen} onOpenChange={setMenuOpen}>
              <DropdownMenu.Trigger className={styles.trigger} style={{ width: '100%', marginBottom: 12 }}>
                Open menu
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content className={styles.content} sideOffset={5}>
                  <DropdownMenu.Item className={styles.item}>Item one</DropdownMenu.Item>
                  <DropdownMenu.Item className={styles.item}>Item two</DropdownMenu.Item>
                  <DropdownMenu.Arrow />
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>

            <button type="button" className={styles.item} style={{ width: '100%' }}>
              Dialog surface button
            </button>

            <p style={{ marginTop: 12, marginBottom: 0 }}>
              dialog: {dialogOpen ? 'open' : 'closed'} | menu: {menuOpen ? 'open' : 'closed'}
            </p>

            <Dialog.Close style={{ marginTop: 12 }}>Close dialog</Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}

export const CheckableItems = () => {
  const [ruler, setRuler] = React.useState(true)
  const [grid, setGrid] = React.useState(false)
  const [zoom, setZoom] = React.useState('fit')

  return (
    <div style={{ display: 'grid', gap: 20, padding: 50, justifyItems: 'start' }}>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger className={styles.trigger}>View</DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content className={styles.content} sideOffset={5}>
            <DropdownMenu.Label className={styles.label}>Show</DropdownMenu.Label>
            <DropdownMenu.CheckboxItem className={styles.item} checked={ruler} onCheckedChange={setRuler}>
              Ruler
              <DropdownMenu.ItemIndicator aria-hidden>✓</DropdownMenu.ItemIndicator>
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              className={styles.item}
              checked={grid}
              closeOnSelect={false}
              onCheckedChange={setGrid}>
              Grid
              <DropdownMenu.ItemIndicator aria-hidden>✓</DropdownMenu.ItemIndicator>
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.Separator className={styles.separator} />
            <DropdownMenu.Label className={styles.label}>Zoom</DropdownMenu.Label>
            <DropdownMenu.RadioGroup value={zoom} onValueChange={setZoom}>
              <DropdownMenu.RadioItem className={styles.item} value="fit">
                Fit
                <DropdownMenu.ItemIndicator aria-hidden>●</DropdownMenu.ItemIndicator>
              </DropdownMenu.RadioItem>
              <DropdownMenu.RadioItem className={styles.item} value="actual">
                Actual size
                <DropdownMenu.ItemIndicator aria-hidden>●</DropdownMenu.ItemIndicator>
              </DropdownMenu.RadioItem>
            </DropdownMenu.RadioGroup>
            <DropdownMenu.Separator className={styles.separator} />
            <DropdownMenu.Item className={styles.item} disabled>
              Paste
            </DropdownMenu.Item>
            <DropdownMenu.Arrow />
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
      <output aria-label="Settings">{`ruler ${ruler ? 'on' : 'off'}, grid ${grid ? 'on' : 'off'}, zoom ${zoom}`}</output>
    </div>
  )
}

export const ModalAndDisabled = () => {
  const [modal, setModal] = React.useState(true)
  const [disabled, setDisabled] = React.useState(false)
  const [clicks, setClicks] = React.useState(0)

  return (
    <div style={{ display: 'grid', gap: 20, padding: 50, justifyItems: 'start' }}>
      <button type="button" onClick={() => setClicks((count) => count + 1)}>
        Count
      </button>
      <output aria-label="Clicks">{clicks}</output>
      <input aria-label="Notes" />
      <label>
        <input type="checkbox" checked={modal} onChange={(event) => setModal(event.currentTarget.checked)} />
        Modal
      </label>
      <label>
        <input type="checkbox" checked={disabled} onChange={(event) => setDisabled(event.currentTarget.checked)} />
        Disabled
      </label>
      <DropdownMenu.Root modal={modal}>
        <DropdownMenu.Trigger className={styles.trigger} disabled={disabled}>
          Open
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content className={styles.content} sideOffset={5}>
            <DropdownMenu.Item className={styles.item}>New Tab</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
      <div className={styles.tall} />
    </div>
  )
}

export const OpensDialog = () => {
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [file, setFile] = React.useState('kept')
  const actionsRef = React.useRef<HTMLButtonElement>(null)

  return (
    <div style={{ display: 'grid', gap: 20, padding: 50, justifyItems: 'start' }}>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger className={styles.trigger} ref={actionsRef}>
          Actions
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content className={styles.content} sideOffset={5}>
            <DropdownMenu.Item className={styles.item}>Rename</DropdownMenu.Item>
            <DropdownMenu.Item className={styles.item} onSelect={() => setDialogOpen(true)}>
              Delete
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
      <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
        <Dialog.Portal>
          <Dialog.Content className={styles.dialog} finalFocus={actionsRef}>
            <Dialog.Title>Delete the file?</Dialog.Title>
            <Dialog.Description>It cannot be brought back.</Dialog.Description>
            <Dialog.Close className={styles.trigger}>Cancel</Dialog.Close>
            <button
              className={styles.trigger}
              onClick={() => {
                setFile('deleted')
                setDialogOpen(false)
              }}
              type="button">
              Delete for good
            </button>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <output aria-label="File">{file}</output>
    </div>
  )
}

export const Links = () => {
  const [hash, setHash] = React.useState('')

  React.useEffect(() => {
    const onHashChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return (
    <div style={{ display: 'grid', gap: 20, padding: 50, justifyItems: 'start' }}>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger className={styles.trigger}>Account</DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content className={styles.content} sideOffset={5}>
            <DropdownMenu.Item asChild className={styles.item}>
              <a href="#profile">Profile</a>
            </DropdownMenu.Item>
            <DropdownMenu.Item asChild className={styles.item}>
              <a href="#billing">Billing</a>
            </DropdownMenu.Item>
            <DropdownMenu.Item asChild className={styles.item} disabled>
              <a href="#team">Team</a>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
      <output aria-label="Location">{hash}</output>
    </div>
  )
}

const COUNTRIES = [
  'Argentina',
  'Australia',
  'Austria',
  'Belgium',
  'Brazil',
  'Canada',
  'Chile',
  'Denmark',
  'Egypt',
  'Finland',
  'France',
  'Germany',
  'Greece',
  'India',
  'Ireland',
  'Italy',
  'Japan',
  'Kenya',
  'Mexico',
  'Morocco',
  'Netherlands',
  'Norway',
  'Peru',
  'Poland',
  'Portugal',
  'Spain',
  'Sweden',
  'Turkey',
  'Uruguay',
  'Vietnam',
]

export const LongList = () => (
  <div style={{ padding: 50 }}>
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className={styles.trigger}>Country</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className={[styles.content, styles.scrollable].join(' ')} sideOffset={5}>
          {COUNTRIES.map((country) => (
            <DropdownMenu.Item className={styles.item} key={country}>
              {country}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  </div>
)

const SIDES = ['top', 'right', 'bottom', 'left'] as const
const ALIGNS = ['start', 'center', 'end'] as const

export const Placement = () => {
  const [side, setSide] = React.useState<(typeof SIDES)[number]>('bottom')
  const [align, setAlign] = React.useState<(typeof ALIGNS)[number]>('start')

  return (
    <div style={{ display: 'grid', gap: 20, padding: 50, justifyItems: 'start' }}>
      <fieldset>
        <legend>Side</legend>
        {SIDES.map((each) => (
          <label key={each}>
            <input checked={side === each} name="side" onChange={() => setSide(each)} type="radio" />
            {each}
          </label>
        ))}
      </fieldset>
      <fieldset>
        <legend>Align</legend>
        {ALIGNS.map((each) => (
          <label key={each}>
            <input checked={align === each} name="align" onChange={() => setAlign(each)} type="radio" />
            {each}
          </label>
        ))}
      </fieldset>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger className={[styles.trigger, styles.wide].join(' ')}>Open</DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align={align}
            className={[styles.content, styles.triggerWidth].join(' ')}
            side={side}
            sideOffset={5}>
            <DropdownMenu.Item className={styles.item}>New Tab</DropdownMenu.Item>
            <DropdownMenu.Item className={styles.item}>New Window</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  )
}

export const WithTooltip = () => (
  <Tooltip.Provider>
    <div style={{ padding: 50 }}>
      <DropdownMenu.Root>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <DropdownMenu.Trigger aria-label="More actions" className={styles.trigger}>
              ...
            </DropdownMenu.Trigger>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content className={styles.tooltip} sideOffset={5}>
              More actions
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
        <DropdownMenu.Portal>
          <DropdownMenu.Content className={styles.content} sideOffset={5}>
            <DropdownMenu.Item className={styles.item}>Duplicate</DropdownMenu.Item>
            <DropdownMenu.Item className={styles.item}>Archive</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  </Tooltip.Provider>
)

export const Animated = () => (
  <div style={{ padding: 50 }}>
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className={styles.trigger}>Open</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className={[styles.content, styles.animatedContent].join(' ')} sideOffset={5}>
          <DropdownMenu.Item className={styles.item}>New Tab</DropdownMenu.Item>
          <DropdownMenu.Item className={styles.item}>New Window</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  </div>
)
