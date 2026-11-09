// From Radix UI primitives, apps/storybook/stories/context-menu.stories.tsx. MIT, see ../../__tests__/radix/LICENSE.

import * as React from 'react'
import { ExternalOverlayTrigger } from '../../__stories__/external-overlay'
import { ContextMenu, Dialog } from '../../__stories__/radix-ui'
import styles from './context-menu.stories.module.css'

export default {
  title: 'Components/ContextMenu',
}

export const Submenus = () => {
  const [rtl, setRtl] = React.useState(false)

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        gap: 20,
      }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <label style={{ marginBottom: 10 }}>
          <input type="checkbox" checked={rtl} onChange={(event) => setRtl(event.currentTarget.checked)} />
          Right-to-left
        </label>
        <ContextMenu.Root dir={rtl ? 'rtl' : 'ltr'}>
          <ContextMenu.Trigger className={styles.trigger}>Right Click Here</ContextMenu.Trigger>
          <ContextMenu.Portal>
            <ContextMenu.Content className={styles.content}>
              <ContextMenu.Item className={styles.item} onSelect={() => console.log('new-tab')}>
                New Tab
              </ContextMenu.Item>
              <ContextMenu.Item className={styles.item} onSelect={() => console.log('new-window')}>
                New Window
              </ContextMenu.Item>
              <ContextMenu.Separator className={styles.separator} />
              <ContextMenu.Sub>
                <ContextMenu.SubTrigger className={styles.subTrigger}>Bookmarks →</ContextMenu.SubTrigger>
                <ContextMenu.Portal>
                  <ContextMenu.SubContent className={styles.content} sideOffset={12} alignOffset={-6}>
                    <ContextMenu.Item className={styles.item} onSelect={() => console.log('index')}>
                      Inbox
                    </ContextMenu.Item>
                    <ContextMenu.Item className={styles.item} onSelect={() => console.log('calendar')}>
                      Calendar
                    </ContextMenu.Item>
                    <ContextMenu.Separator className={styles.separator} />
                    <ContextMenu.Sub>
                      <ContextMenu.SubTrigger className={styles.subTrigger}>WorkOS →</ContextMenu.SubTrigger>
                      <ContextMenu.Portal>
                        <ContextMenu.SubContent className={styles.content} sideOffset={12} alignOffset={-6}>
                          <ContextMenu.Item className={styles.item} onSelect={() => console.log('stitches')}>
                            Stitches
                          </ContextMenu.Item>
                          <ContextMenu.Item className={styles.item} onSelect={() => console.log('composer')}>
                            Composer
                          </ContextMenu.Item>
                          <ContextMenu.Item className={styles.item} onSelect={() => console.log('radix')}>
                            Radix
                          </ContextMenu.Item>
                          <ContextMenu.Arrow />
                        </ContextMenu.SubContent>
                      </ContextMenu.Portal>
                    </ContextMenu.Sub>
                    <ContextMenu.Separator className={styles.separator} />
                    <ContextMenu.Item className={styles.item} onSelect={() => console.log('notion')}>
                      Notion
                    </ContextMenu.Item>
                    <ContextMenu.Arrow />
                  </ContextMenu.SubContent>
                </ContextMenu.Portal>
              </ContextMenu.Sub>
              <ContextMenu.Sub>
                <ContextMenu.SubTrigger className={styles.subTrigger} disabled>
                  History →
                </ContextMenu.SubTrigger>
                <ContextMenu.Portal>
                  <ContextMenu.SubContent className={styles.content} sideOffset={12} alignOffset={-6}>
                    <ContextMenu.Item className={styles.item} onSelect={() => console.log('github')}>
                      Github
                    </ContextMenu.Item>
                    <ContextMenu.Item className={styles.item} onSelect={() => console.log('google')}>
                      Google
                    </ContextMenu.Item>
                    <ContextMenu.Item className={styles.item} onSelect={() => console.log('stack-overflow')}>
                      Stack Overflow
                    </ContextMenu.Item>
                    <ContextMenu.Arrow />
                  </ContextMenu.SubContent>
                </ContextMenu.Portal>
              </ContextMenu.Sub>
              <ContextMenu.Sub>
                <ContextMenu.SubTrigger className={styles.subTrigger}>Tools →</ContextMenu.SubTrigger>
                <ContextMenu.Portal>
                  <ContextMenu.SubContent className={styles.content} sideOffset={12} alignOffset={-6}>
                    <ContextMenu.Item className={styles.item} onSelect={() => console.log('extensions')}>
                      Extensions
                    </ContextMenu.Item>
                    <ContextMenu.Item className={styles.item} onSelect={() => console.log('task-manager')}>
                      Task Manager
                    </ContextMenu.Item>
                    <ContextMenu.Item className={styles.item} onSelect={() => console.log('developer-tools')}>
                      Developer Tools
                    </ContextMenu.Item>
                    <ContextMenu.Arrow />
                  </ContextMenu.SubContent>
                </ContextMenu.Portal>
              </ContextMenu.Sub>
              <ContextMenu.Separator className={styles.separator} />
              <ContextMenu.Item className={styles.item} disabled onSelect={() => console.log('print')}>
                Print…
              </ContextMenu.Item>
              <ContextMenu.Item className={styles.item} onSelect={() => console.log('cast')}>
                Cast…
              </ContextMenu.Item>
              <ContextMenu.Item className={styles.item} onSelect={() => console.log('find')}>
                Find…
              </ContextMenu.Item>
            </ContextMenu.Content>
          </ContextMenu.Portal>
        </ContextMenu.Root>
      </div>
    </div>
  )
}

export const WithExtensionOverlay = () => {
  const [open, setOpen] = React.useState(false)

  return (
    <div style={{ display: 'grid', gap: 20, padding: 50, justifyItems: 'start' }}>
      <ExternalOverlayTrigger />
      <ContextMenu.Root open={open} onOpenChange={setOpen}>
        <ContextMenu.Trigger className={styles.trigger}>Right Click Here</ContextMenu.Trigger>
        <ContextMenu.Portal>
          <ContextMenu.Content className={styles.content}>
            <ContextMenu.Item className={styles.item}>New Tab</ContextMenu.Item>
            <ContextMenu.Item className={styles.item}>New Window</ContextMenu.Item>
          </ContextMenu.Content>
        </ContextMenu.Portal>
      </ContextMenu.Root>
      <div data-testid="context-menu-state">{open ? 'open' : 'closed'}</div>
    </div>
  )
}

export const DismissesOnlyContextMenuInsideDialog = () => {
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [isModal, setIsModal] = React.useState<boolean | undefined>(undefined)

  if (!dialogOpen && menuOpen) {
    setMenuOpen(false)
  }

  return (
    <div style={{ display: 'grid', gap: 16, padding: 40, justifyItems: 'start' }}>
      <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
        <Dialog.Trigger className={styles.trigger}>Open dialog</Dialog.Trigger>
        <label>
          <input
            type="checkbox"
            checked={isModal || false}
            ref={(node) => {
              if (node && isModal === undefined) {
                node.indeterminate = true
              }
            }}
            onChange={(event) => {
              event.target.indeterminate = false
              setIsModal((prev) => !prev)
            }}
          />
          <span>Modal</span>
        </label>
        <Dialog.Portal>
          <Dialog.Content
            style={{
              position: 'fixed',
              top: 100,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 360,
              padding: 20,
              backgroundColor: 'white',
              border: '1px solid #ccc',
              borderRadius: 8,
            }}>
            <Dialog.Title>Dialog with nested context menu</Dialog.Title>
            <ContextMenu.Root open={menuOpen} onOpenChange={setMenuOpen} modal={isModal}>
              <ContextMenu.Trigger className={styles.trigger}>Right click inside dialog</ContextMenu.Trigger>
              <ContextMenu.Portal>
                <ContextMenu.Content className={styles.content}>
                  <ContextMenu.Item className={styles.item}>Item one</ContextMenu.Item>
                  <ContextMenu.Item className={styles.item}>Item two</ContextMenu.Item>
                </ContextMenu.Content>
              </ContextMenu.Portal>
            </ContextMenu.Root>
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
      <ContextMenu.Root>
        <ContextMenu.Trigger className={styles.trigger}>Right Click Here</ContextMenu.Trigger>
        <ContextMenu.Portal>
          <ContextMenu.Content className={styles.content}>
            <ContextMenu.Label className={styles.label}>Show</ContextMenu.Label>
            <ContextMenu.CheckboxItem className={styles.item} checked={ruler} onCheckedChange={setRuler}>
              Ruler
              <ContextMenu.ItemIndicator aria-hidden>✓</ContextMenu.ItemIndicator>
            </ContextMenu.CheckboxItem>
            <ContextMenu.CheckboxItem
              className={styles.item}
              checked={grid}
              closeOnSelect={false}
              onCheckedChange={setGrid}>
              Grid
              <ContextMenu.ItemIndicator aria-hidden>✓</ContextMenu.ItemIndicator>
            </ContextMenu.CheckboxItem>
            <ContextMenu.Separator className={styles.separator} />
            <ContextMenu.Label className={styles.label}>Zoom</ContextMenu.Label>
            <ContextMenu.RadioGroup value={zoom} onValueChange={setZoom}>
              <ContextMenu.RadioItem className={styles.item} value="fit">
                Fit
                <ContextMenu.ItemIndicator aria-hidden>●</ContextMenu.ItemIndicator>
              </ContextMenu.RadioItem>
              <ContextMenu.RadioItem className={styles.item} value="actual">
                Actual size
                <ContextMenu.ItemIndicator aria-hidden>●</ContextMenu.ItemIndicator>
              </ContextMenu.RadioItem>
            </ContextMenu.RadioGroup>
            <ContextMenu.Separator className={styles.separator} />
            <ContextMenu.Item className={styles.item} disabled>
              Paste
            </ContextMenu.Item>
          </ContextMenu.Content>
        </ContextMenu.Portal>
      </ContextMenu.Root>
      <output aria-label="View">{`ruler ${ruler ? 'on' : 'off'}, grid ${grid ? 'on' : 'off'}, zoom ${zoom}`}</output>
    </div>
  )
}

export const ModalAndDisabled = () => {
  const [modal, setModal] = React.useState(true)
  const [disabled, setDisabled] = React.useState(false)
  const [clicks, setClicks] = React.useState(0)

  return (
    <div style={{ display: 'grid', gap: 20, padding: 50, justifyItems: 'start' }}>
      <label>
        <input type="checkbox" checked={modal} onChange={(event) => setModal(event.currentTarget.checked)} />
        Modal
      </label>
      <label>
        <input type="checkbox" checked={disabled} onChange={(event) => setDisabled(event.currentTarget.checked)} />
        Disabled
      </label>
      <ContextMenu.Root modal={modal}>
        <ContextMenu.Trigger className={styles.trigger} disabled={disabled}>
          Right Click Here
        </ContextMenu.Trigger>
        <ContextMenu.Portal>
          <ContextMenu.Content className={styles.content}>
            <ContextMenu.Item className={styles.item}>New Tab</ContextMenu.Item>
          </ContextMenu.Content>
        </ContextMenu.Portal>
      </ContextMenu.Root>
      <button type="button" onClick={() => setClicks((count) => count + 1)}>
        Count
      </button>
      <output aria-label="Clicks">{clicks}</output>
    </div>
  )
}
