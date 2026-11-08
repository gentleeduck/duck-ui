import * as React from 'react'
import * as Menu from '..'
import styles from './menu.stories.module.css'

export default { title: 'Components/Menu' }

type Toggle = readonly [string, boolean, (checked: boolean) => void]

function Toggles({ toggles }: { toggles: readonly Toggle[] }) {
  return toggles.map(([label, checked, set]) => (
    <label key={label}>
      <input checked={checked} onChange={(event) => set(event.target.checked)} type="checkbox" />
      {label}
    </label>
  ))
}

// Menu has no trigger of its own; this is the one DropdownMenu builds on it.
function Trigger({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Menu.Anchor asChild>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        onKeyDown={(event) => {
          if (!['Enter', ' ', 'ArrowDown'].includes(event.key)) return
          event.preventDefault()
          onOpenChange(event.key === 'ArrowDown' || !open)
        }}
        onPointerDown={(event) => {
          if (event.button !== 0 || event.ctrlKey) return
          onOpenChange(!open)
          if (!open) event.preventDefault()
        }}
        type="button">
        Open
      </button>
    </Menu.Anchor>
  )
}

export const Basic = () => {
  const [open, setOpen] = React.useState(false)
  const [selected, setSelected] = React.useState<string[]>([])
  const [rtl, setRtl] = React.useState(false)
  const [modal, setModal] = React.useState(true)
  const [loop, setLoop] = React.useState(false)
  const select = (name: string) => () => setSelected((list) => [...list, name])

  return (
    <div className={styles.page}>
      <Toggles
        toggles={[
          ['Right-to-left', rtl, setRtl],
          ['Modal', modal, setModal],
          ['Loop', loop, setLoop],
        ]}
      />
      <div className={styles.row}>
        <Menu.Root dir={rtl ? 'rtl' : 'ltr'} modal={modal} onOpenChange={setOpen} open={open}>
          <Trigger onOpenChange={setOpen} open={open} />
          <Menu.Portal>
            <Menu.Content align="start" className={styles.content} loop={loop} sideOffset={5}>
              <Menu.Label className={styles.label}>Tabs</Menu.Label>
              <Menu.Group>
                <Menu.Item className={styles.item} onSelect={select('new tab')}>
                  New tab
                </Menu.Item>
                <Menu.Item className={styles.item} onSelect={select('new window')}>
                  New window
                </Menu.Item>
                <Menu.Item className={styles.item} disabled onSelect={select('print')}>
                  Print
                </Menu.Item>
              </Menu.Group>
              <Menu.Separator className={styles.separator} />
              <Menu.Item className={styles.item} closeOnSelect={false} onSelect={select('zoom in')}>
                Zoom in
              </Menu.Item>
              <Menu.Item className={styles.item} onSelect={(event) => event.preventDefault()}>
                Stays open
              </Menu.Item>
              <Menu.Item className={styles.item} onSelect={select('history')} textValue="History">
                History <kbd>H</kbd>
              </Menu.Item>
              <Menu.Arrow className={styles.arrow} />
            </Menu.Content>
          </Menu.Portal>
        </Menu.Root>
        <button onClick={() => setSelected((list) => [...list, 'page'])} type="button">
          Page button
        </button>
      </div>
      <output aria-label="State">{open ? 'open' : 'closed'}</output>
      <output aria-label="Selected">{selected.join(', ')}</output>
    </div>
  )
}

export const CheckableItems = () => {
  const [open, setOpen] = React.useState(false)
  const [formats, setFormats] = React.useState({ bold: true, italic: false })
  const [align, setAlign] = React.useState('start')
  const all = formats.bold && formats.italic
  const some = formats.bold || formats.italic

  return (
    <div className={styles.page}>
      <Menu.Root onOpenChange={setOpen} open={open}>
        <Trigger onOpenChange={setOpen} open={open} />
        <Menu.Portal>
          <Menu.Content align="start" className={styles.content} sideOffset={5}>
            <Menu.CheckboxItem
              checked={all ? true : some ? 'indeterminate' : false}
              className={styles.item}
              onCheckedChange={(checked) => setFormats({ bold: checked, italic: checked })}>
              <Menu.ItemIndicator aria-hidden className={styles.indicator}>
                {some && !all ? '-' : 'x'}
              </Menu.ItemIndicator>
              All formats
            </Menu.CheckboxItem>
            {(['bold', 'italic'] as const).map((format) => (
              <Menu.CheckboxItem
                checked={formats[format]}
                className={styles.item}
                closeOnSelect={false}
                key={format}
                onCheckedChange={(checked) => setFormats((current) => ({ ...current, [format]: checked }))}>
                <Menu.ItemIndicator aria-hidden className={styles.indicator}>
                  x
                </Menu.ItemIndicator>
                {format === 'bold' ? 'Bold' : 'Italic'}
              </Menu.CheckboxItem>
            ))}
            <Menu.Separator className={styles.separator} />
            <Menu.Label className={styles.label}>Align</Menu.Label>
            <Menu.RadioGroup onValueChange={setAlign} value={align}>
              {['start', 'center', 'end'].map((value) => (
                <Menu.RadioItem className={styles.item} key={value} value={value}>
                  <Menu.ItemIndicator aria-hidden className={styles.indicator}>
                    o
                  </Menu.ItemIndicator>
                  {value}
                </Menu.RadioItem>
              ))}
            </Menu.RadioGroup>
          </Menu.Content>
        </Menu.Portal>
      </Menu.Root>
      <output aria-label="Formats">
        {Object.entries(formats)
          .flatMap(([name, on]) => (on ? [name] : []))
          .join(', ')}
      </output>
      <output aria-label="Align">{align}</output>
    </div>
  )
}

export const Submenus = () => {
  const [open, setOpen] = React.useState(false)
  const [rtl, setRtl] = React.useState(false)
  const [escapeClosesOne, setEscapeClosesOne] = React.useState(false)
  const [selected, setSelected] = React.useState<string[]>([])
  const select = (name: string) => () => setSelected((list) => [...list, name])

  return (
    <div className={styles.page}>
      <Toggles
        toggles={[
          ['Right-to-left', rtl, setRtl],
          ['Escape closes only the submenu', escapeClosesOne, setEscapeClosesOne],
        ]}
      />
      <Menu.Root dir={rtl ? 'rtl' : 'ltr'} onOpenChange={setOpen} open={open}>
        <Trigger onOpenChange={setOpen} open={open} />
        <Menu.Portal>
          <Menu.Content align="start" className={styles.content} sideOffset={5}>
            <Menu.Item className={styles.item} onSelect={select('new tab')}>
              New tab
            </Menu.Item>
            <Sub closeParentOnEsc={!escapeClosesOne} label="Bookmarks">
              <Menu.Item className={styles.item} onSelect={select('inbox')}>
                Inbox
              </Menu.Item>
              <Sub closeParentOnEsc={!escapeClosesOne} label="Work">
                <Menu.Item className={styles.item} onSelect={select('notes')}>
                  Notes
                </Menu.Item>
              </Sub>
            </Sub>
            <Sub disabled label="History">
              <Menu.Item className={styles.item}>Yesterday</Menu.Item>
            </Sub>
          </Menu.Content>
        </Menu.Portal>
      </Menu.Root>
      <output aria-label="State">{open ? 'open' : 'closed'}</output>
      <output aria-label="Selected">{selected.join(', ')}</output>
    </div>
  )
}

function Sub({
  children,
  closeParentOnEsc,
  disabled,
  label,
}: {
  children: React.ReactNode
  closeParentOnEsc?: boolean
  disabled?: boolean
  label: string
}) {
  const [open, setOpen] = React.useState(false)

  return (
    <Menu.Sub closeParentOnEsc={closeParentOnEsc} onOpenChange={setOpen} open={open}>
      <Menu.SubTrigger className={styles.item} disabled={disabled}>
        {label}
      </Menu.SubTrigger>
      <Menu.Portal>
        <Menu.SubContent alignOffset={-6} className={styles.content} sideOffset={8}>
          {children}
        </Menu.SubContent>
      </Menu.Portal>
    </Menu.Sub>
  )
}
