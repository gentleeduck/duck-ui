// From Radix UI primitives, apps/storybook/stories/select.stories.tsx. MIT, see ../../__tests__/radix/LICENSE.

import * as React from 'react'
import { createPortal } from 'react-dom'
import { ExternalOverlayTrigger } from '../../__stories__/external-overlay'
import { Frame, ShadowRoot, usePortalContainer } from '../../__stories__/hosts'
import { Dialog, Label as LabelPrimitive, Popover, Select } from '../../__stories__/radix-ui'
import { foodGroups } from './foods'
import styles from './select.stories.module.css'

export default {
  title: 'Components/Select',
}

const Label = LabelPrimitive.Root
const foods = foodGroups.flatMap((group) => group.foods)

export const WithExtensionOverlay = () => {
  const [open, setOpen] = React.useState(false)

  return (
    <div style={{ display: 'grid', gap: 20, padding: 50, justifyItems: 'start' }}>
      <ExternalOverlayTrigger />
      <Label>
        Choose a number:
        <Select.Root open={open} onOpenChange={setOpen} defaultValue="two">
          <Select.Trigger className={styles.trigger}>
            <Select.Value />
            <Select.Icon />
          </Select.Trigger>
          <Select.Portal>
            <Select.Content className={styles.content} position="popper" sideOffset={5}>
              <Select.Viewport className={styles.viewport}>
                <Select.Item className={styles.item} value="one">
                  <Select.ItemText>One</Select.ItemText>
                  <Select.ItemIndicator className={styles.indicator}>
                    <TickIcon />
                  </Select.ItemIndicator>
                </Select.Item>
                <Select.Item className={styles.item} value="two">
                  <Select.ItemText>Two</Select.ItemText>
                  <Select.ItemIndicator className={styles.indicator}>
                    <TickIcon />
                  </Select.ItemIndicator>
                </Select.Item>
                <Select.Item className={styles.item} value="three">
                  <Select.ItemText>Three</Select.ItemText>
                  <Select.ItemIndicator className={styles.indicator}>
                    <TickIcon />
                  </Select.ItemIndicator>
                </Select.Item>
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </Label>
      <div data-testid="select-state">{open ? 'open' : 'closed'}</div>
    </div>
  )
}

export const DismissesOnlySelectInsideDialog = () => {
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [selectOpen, setSelectOpen] = React.useState(false)

  if (!dialogOpen && selectOpen) {
    setSelectOpen(false)
  }

  return (
    <div style={{ display: 'grid', gap: 16, padding: 40, justifyItems: 'start' }}>
      <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
        <Dialog.Trigger className={styles.trigger}>Open dialog</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Content
            aria-describedby={undefined}
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
            <Dialog.Title>Dialog with nested select</Dialog.Title>
            <Label>
              Choose a value:
              <Select.Root open={selectOpen} onOpenChange={setSelectOpen} defaultValue="two">
                <Select.Trigger className={styles.trigger}>
                  <Select.Value />
                  <Select.Icon />
                </Select.Trigger>
                <Select.Portal>
                  <Select.Content className={styles.content} sideOffset={5}>
                    <Select.Viewport className={styles.viewport}>
                      <Select.Item className={styles.item} value="one">
                        <Select.ItemText>One</Select.ItemText>
                        <Select.ItemIndicator className={styles.indicator}>
                          <TickIcon />
                        </Select.ItemIndicator>
                      </Select.Item>
                      <Select.Item className={styles.item} value="two">
                        <Select.ItemText>Two</Select.ItemText>
                        <Select.ItemIndicator className={styles.indicator}>
                          <TickIcon />
                        </Select.ItemIndicator>
                      </Select.Item>
                      <Select.Item className={styles.item} value="three">
                        <Select.ItemText>Three</Select.ItemText>
                        <Select.ItemIndicator className={styles.indicator}>
                          <TickIcon />
                        </Select.ItemIndicator>
                      </Select.Item>
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </Label>
            <p style={{ marginTop: 12, marginBottom: 0 }}>
              dialog: {dialogOpen ? 'open' : 'closed'} | select: {selectOpen ? 'open' : 'closed'}
            </p>
            <Dialog.Close style={{ marginTop: 12 }}>Close dialog</Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}

export const DismissesOnlySelectInPopover = () => {
  const [popoverOpen, setPopoverOpen] = React.useState(false)
  const [firstOpen, setFirstOpen] = React.useState(false)
  const [secondOpen, setSecondOpen] = React.useState(false)

  if (!popoverOpen) {
    if (firstOpen) {
      setFirstOpen(false)
    }
    if (secondOpen) {
      setSecondOpen(false)
    }
  }

  return (
    <div style={{ display: 'grid', gap: 16, padding: 40, justifyItems: 'start' }}>
      <Popover.Root open={popoverOpen} onOpenChange={setPopoverOpen}>
        <Popover.Trigger className={styles.trigger}>Open popover</Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            sideOffset={5}
            style={{
              display: 'grid',
              gap: 12,
              padding: 20,
              backgroundColor: 'white',
              border: '1px solid #ccc',
              borderRadius: 8,
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
            }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <Label>
                First select:
                <Select.Root open={firstOpen} onOpenChange={setFirstOpen} defaultValue="one">
                  <Select.Trigger className={styles.trigger} data-testid="first-trigger">
                    <Select.Value />
                    <Select.Icon />
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content className={styles.content} position="popper" sideOffset={5}>
                      <Select.Viewport className={styles.viewport}>
                        <Select.Item className={styles.item} value="one">
                          <Select.ItemText>One</Select.ItemText>
                          <Select.ItemIndicator className={styles.indicator}>
                            <TickIcon />
                          </Select.ItemIndicator>
                        </Select.Item>
                        <Select.Item className={styles.item} value="two">
                          <Select.ItemText>Two</Select.ItemText>
                          <Select.ItemIndicator className={styles.indicator}>
                            <TickIcon />
                          </Select.ItemIndicator>
                        </Select.Item>
                        <Select.Item className={styles.item} value="three">
                          <Select.ItemText>Three</Select.ItemText>
                          <Select.ItemIndicator className={styles.indicator}>
                            <TickIcon />
                          </Select.ItemIndicator>
                        </Select.Item>
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              </Label>
              <Label>
                Second select:
                <Select.Root open={secondOpen} onOpenChange={setSecondOpen} defaultValue="a">
                  <Select.Trigger className={styles.trigger} data-testid="second-trigger">
                    <Select.Value />
                    <Select.Icon />
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content className={styles.content} position="popper" sideOffset={5}>
                      <Select.Viewport className={styles.viewport}>
                        <Select.Item className={styles.item} value="a">
                          <Select.ItemText>A</Select.ItemText>
                          <Select.ItemIndicator className={styles.indicator}>
                            <TickIcon />
                          </Select.ItemIndicator>
                        </Select.Item>
                        <Select.Item className={styles.item} value="b">
                          <Select.ItemText>B</Select.ItemText>
                          <Select.ItemIndicator className={styles.indicator}>
                            <TickIcon />
                          </Select.ItemIndicator>
                        </Select.Item>
                        <Select.Item className={styles.item} value="c">
                          <Select.ItemText>C</Select.ItemText>
                          <Select.ItemIndicator className={styles.indicator}>
                            <TickIcon />
                          </Select.ItemIndicator>
                        </Select.Item>
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              </Label>
            </div>
            <p style={{ margin: 0 }}>
              popover: {popoverOpen ? 'open' : 'closed'} | first: {firstOpen ? 'open' : 'closed'} | second:{' '}
              {secondOpen ? 'open' : 'closed'}
            </p>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  )
}

export const Cypress = () => {
  const [data, setData] = React.useState<{ size?: string; model?: string }>({})
  const [model, setModel] = React.useState<string | undefined>('')
  const [openColor, setOpenColor] = React.useState(false)
  const [color, setColor] = React.useState<string | undefined>('green')

  function handleChange(event: React.ChangeEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget)
    setData({
      size: formData.get('size')?.toString(),
      model: formData.get('model')?.toString(),
    })
  }

  return (
    <>
      <form
        style={{ padding: 50 }}
        onSubmit={(event) => {
          handleChange(event)
          event.preventDefault()
        }}
        onChange={handleChange}>
        <Label>
          choose a size:
          <Select.Root defaultValue="M" name="size">
            <Select.Trigger className={styles.trigger}>
              <Select.Value />
              <Select.Icon />
            </Select.Trigger>
            <Select.Portal>
              <Select.Content className={styles.content}>
                <Select.Viewport className={styles.viewport}>
                  <Select.Item className={styles.item} value="S">
                    <Select.ItemText>Small</Select.ItemText>
                    <Select.ItemIndicator className={styles.indicator}>
                      <TickIcon />
                    </Select.ItemIndicator>
                  </Select.Item>
                  <Select.Item className={styles.item} value="M">
                    <Select.ItemText>Medium</Select.ItemText>
                    <Select.ItemIndicator className={styles.indicator}>
                      <TickIcon />
                    </Select.ItemIndicator>
                  </Select.Item>
                  <Select.Item className={styles.item} value="L">
                    <Select.ItemText>Large</Select.ItemText>
                    <Select.ItemIndicator className={styles.indicator}>
                      <TickIcon />
                    </Select.ItemIndicator>
                  </Select.Item>
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </Label>
        <button type="submit" style={{ width: 100, height: 50 }}>
          buy
        </button>
        {data.size ? <p>You picked t-shirt size {data.size}</p> : null}
      </form>

      <hr />

      <form
        style={{ padding: 50 }}
        onSubmit={(event) => {
          handleChange(event)
          event.preventDefault()
        }}>
        <Label>
          choose a model
          <Select.Root name="model" value={model} onValueChange={setModel}>
            <Select.Trigger className={styles.trigger}>
              <Select.Value placeholder="…" />
              <Select.Icon />
            </Select.Trigger>
            <Select.Portal>
              <Select.Content className={styles.content}>
                <Select.Viewport className={styles.viewport}>
                  <Select.Item className={styles.item} value="S">
                    <Select.ItemText>Model S</Select.ItemText>
                    <Select.ItemIndicator className={styles.indicator}>
                      <TickIcon />
                    </Select.ItemIndicator>
                  </Select.Item>
                  <Select.Item className={styles.item} value="3">
                    <Select.ItemText>Modal 3</Select.ItemText>
                    <Select.ItemIndicator className={styles.indicator}>
                      <TickIcon />
                    </Select.ItemIndicator>
                  </Select.Item>
                  <Select.Item className={styles.item} value="X">
                    <Select.ItemText>Model X</Select.ItemText>
                    <Select.ItemIndicator className={styles.indicator}>
                      <TickIcon />
                    </Select.ItemIndicator>
                  </Select.Item>
                  <Select.Item className={styles.item} value="Y">
                    <Select.ItemText>Model Y</Select.ItemText>
                    <Select.ItemIndicator className={styles.indicator}>
                      <TickIcon />
                    </Select.ItemIndicator>
                  </Select.Item>
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </Label>

        <button type="button" style={{ width: 100, height: 50 }} onClick={() => setModel('')}>
          unset
        </button>
        <button type="submit" style={{ width: 100, height: 50 }}>
          submit model
        </button>
        {data.model !== undefined ? <p>Submitted model: {data.model === '' ? 'empty' : data.model}</p> : null}
      </form>

      <div style={{ padding: 50 }}>
        <Label>
          choose an open color
          <Select.Root open={openColor} onOpenChange={setOpenColor} value={color} onValueChange={setColor}>
            <Select.Trigger className={styles.trigger}>
              <Select.Value placeholder="Pick a color" />
              <Select.Icon />
            </Select.Trigger>
            <Select.Portal>
              <Select.Content className={styles.content}>
                <Select.Viewport className={styles.viewport}>
                  <Select.Item className={styles.item} value="red">
                    <Select.ItemText>Red</Select.ItemText>
                    <Select.ItemIndicator className={styles.indicator}>
                      <TickIcon />
                    </Select.ItemIndicator>
                  </Select.Item>
                  <Select.Item className={styles.item} value="green">
                    <Select.ItemText>Green</Select.ItemText>
                    <Select.ItemIndicator className={styles.indicator}>
                      <TickIcon />
                    </Select.ItemIndicator>
                  </Select.Item>
                  <Select.Item className={styles.item} value="blue">
                    <Select.ItemText>Blue</Select.ItemText>
                    <Select.ItemIndicator className={styles.indicator}>
                      <TickIcon />
                    </Select.ItemIndicator>
                  </Select.Item>
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </Label>

        <button
          type="button"
          style={{ width: 160, height: 50 }}
          onClick={() => setColor((value) => (value === '' ? 'green' : ''))}>
          toggle open color value
        </button>
      </div>
    </>
  )
}

function ShadowHost({ children }: { children: (container: HTMLElement) => React.ReactNode }) {
  const hostRef = React.useRef<HTMLDivElement>(null)
  const [container, setContainer] = React.useState<HTMLElement | null>(null)

  React.useLayoutEffect(() => {
    if (!hostRef.current || hostRef.current.shadowRoot) return
    const shadow = hostRef.current.attachShadow({ mode: 'open' })

    // CSS modules are injected into document.head by style-loader; shadow DOM
    // does not inherit those styles, so we clone them in.
    for (const node of document.head.querySelectorAll('style, link[rel="stylesheet"]')) {
      shadow.appendChild(node.cloneNode(true))
    }

    const div = document.createElement('div')
    shadow.appendChild(div)
    setContainer(div)
  }, [])

  return (
    <div ref={hostRef} className="shadow-host">
      {container !== null ? createPortal(children(container), container) : null}
    </div>
  )
}

export const CypressShadowDom = () => {
  const [value, setValue] = React.useState<string | undefined>('')

  return (
    <ShadowHost>
      {(shadowContainer) => (
        <div style={{ padding: 50 }}>
          <Select.Root value={value} onValueChange={setValue}>
            <Select.Trigger className={styles.trigger} aria-label="pick a food">
              <Select.Value placeholder="Pick a food" />
              <Select.Icon />
            </Select.Trigger>
            <Select.Portal container={shadowContainer}>
              <Select.Content position="popper" side="bottom" className={styles.content}>
                {/* Constrain height so the viewport is scrollable, making it
                easier to test the shadow DOM pointer up bug. */}
                <Select.Viewport className={styles.viewport} style={{ maxHeight: '100px' }}>
                  {foodGroups.map((foodGroup) =>
                    foodGroup.foods.map((food) => (
                      <Select.Item key={food.value} className={styles.item} value={food.value}>
                        <Select.ItemText>{food.label}</Select.ItemText>
                        <Select.ItemIndicator className={styles.indicator}>
                          <TickIcon />
                        </Select.ItemIndicator>
                      </Select.Item>
                    )),
                  )}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
          {value && <p>food: {value}</p>}
        </div>
      )}
    </ShadowHost>
  )
}

export const Basic = () => {
  const [value, setValue] = React.useState('')
  const [open, setOpen] = React.useState(false)
  const [submitted, setSubmitted] = React.useState('')
  const [rtl, setRtl] = React.useState(false)
  const [itemAligned, setItemAligned] = React.useState(false)
  const [disabled, setDisabled] = React.useState(false)
  const [short, setShort] = React.useState(false)
  const [fieldsetDisabled, setFieldsetDisabled] = React.useState(false)
  const [withItems, setWithItems] = React.useState(false)
  const [animated, setAnimated] = React.useState(false)
  const toggles = [
    ['Right-to-left', rtl, setRtl],
    ['Item-aligned', itemAligned, setItemAligned],
    ['Disabled', disabled, setDisabled],
    ['Disabled fieldset', fieldsetDisabled, setFieldsetDisabled],
    ['Short list', short, setShort],
    ['Items', withItems, setWithItems],
    ['Animated', animated, setAnimated],
  ] as const

  return (
    <div className={styles.page}>
      <form
        className={styles.page}
        onReset={() => setValue('')}
        onSubmit={(event) => {
          event.preventDefault()
          setSubmitted(String(new FormData(event.currentTarget).get('food')))
        }}>
        <label htmlFor="food">Food</label>
        <fieldset className={styles.fieldset} disabled={fieldsetDisabled}>
          <Select.Root
            dir={rtl ? 'rtl' : undefined}
            disabled={disabled}
            items={withItems ? foods : undefined}
            name="food"
            onOpenChange={setOpen}
            onValueChange={setValue}
            open={open}
            required
            value={value}>
            <Select.Trigger className={styles.trigger} id="food">
              <Select.Value placeholder="Pick a food" />
              <Select.Icon />
            </Select.Trigger>
            <Select.Portal>
              <Select.Content
                className={animated ? `${styles.content} ${styles.animatedContent}` : styles.content}
                position={itemAligned ? 'item-aligned' : 'popper'}
                sideOffset={5}
                style={short ? { maxHeight: 160 } : undefined}>
                <Select.ScrollUpButton className={`${styles.scrollButton} ${styles.scrollUpButton}`}>
                  up
                </Select.ScrollUpButton>
                <Select.Viewport className={styles.viewport}>
                  {foodGroups.map((group, index) => (
                    <React.Fragment key={group.label ?? 'other'}>
                      {index > 0 ? <Select.Separator className={styles.separator} /> : null}
                      <Select.Group>
                        {group.label ? <Select.Label className={styles.label}>{group.label}</Select.Label> : null}
                        {group.foods.map((food) => (
                          <Select.Item
                            className={styles.item}
                            disabled={food.disabled}
                            key={food.value}
                            value={food.value}>
                            <Select.ItemText>{food.label}</Select.ItemText>
                            <Select.ItemIndicator className={styles.indicator}>
                              <TickIcon />
                            </Select.ItemIndicator>
                          </Select.Item>
                        ))}
                      </Select.Group>
                    </React.Fragment>
                  ))}
                </Select.Viewport>
                <Select.ScrollDownButton className={`${styles.scrollButton} ${styles.scrollDownButton}`}>
                  down
                </Select.ScrollDownButton>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </fieldset>
        <button type="submit">Submit</button>
        <button type="reset">Reset</button>
      </form>
      <button type="button" onClick={() => setValue('grapes')}>
        Pick Grapes
      </button>
      <output aria-label="Value">{value || 'none'}</output>
      <output aria-label="Submitted">{submitted}</output>
      <output aria-label="State">{open ? 'open' : 'closed'}</output>
      {toggles.map(([label, checked, set]) => (
        <label key={label}>
          <input type="checkbox" checked={checked} onChange={(event) => set(event.target.checked)} />
          {label}
        </label>
      ))}
    </div>
  )
}

export const Multiple = () => {
  const [value, setValue] = React.useState<string[]>([])
  const [submitted, setSubmitted] = React.useState('')
  const [rtl, setRtl] = React.useState(false)
  const [itemAligned, setItemAligned] = React.useState(false)
  const [withItems, setWithItems] = React.useState(false)
  const toggles = [
    ['Right-to-left', rtl, setRtl],
    ['Item-aligned', itemAligned, setItemAligned],
    ['Items', withItems, setWithItems],
  ] as const

  return (
    <div className={styles.page}>
      <form
        className={styles.page}
        onSubmit={(event) => {
          event.preventDefault()
          setSubmitted(new FormData(event.currentTarget).getAll('foods').join(','))
        }}>
        <label htmlFor="foods">Foods</label>
        <Select.Root
          dir={rtl ? 'rtl' : undefined}
          items={withItems ? foods : undefined}
          multiple
          name="foods"
          onValueChange={setValue}
          required
          value={value}>
          <Select.Trigger className={styles.trigger} id="foods">
            <Select.Value placeholder="Pick some foods" />
            <Select.Icon />
          </Select.Trigger>
          <Select.Portal>
            <Select.Content
              className={styles.content}
              position={itemAligned ? 'item-aligned' : 'popper'}
              sideOffset={5}>
              <Select.Viewport className={styles.viewport}>
                {foodGroups.map((group, index) => (
                  <React.Fragment key={group.label ?? 'other'}>
                    {index > 0 ? <Select.Separator className={styles.separator} /> : null}
                    <Select.Group>
                      {group.label ? <Select.Label className={styles.label}>{group.label}</Select.Label> : null}
                      {group.foods.map((food) => (
                        <Select.Item
                          className={styles.item}
                          disabled={food.disabled}
                          key={food.value}
                          value={food.value}>
                          <Select.ItemText>{food.label}</Select.ItemText>
                          <Select.ItemIndicator className={styles.indicator}>
                            <TickIcon />
                          </Select.ItemIndicator>
                        </Select.Item>
                      ))}
                    </Select.Group>
                  </React.Fragment>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
        <button type="submit">Submit</button>
        <button type="reset">Reset</button>
      </form>
      <button type="button" onClick={() => setValue(['leek', 'apple'])}>
        Pick Leek and Apple
      </button>
      <output aria-label="Value">{value.join(',') || 'none'}</output>
      <output aria-label="Submitted">{submitted}</output>
      {toggles.map(([label, checked, set]) => (
        <label key={label}>
          <input type="checkbox" checked={checked} onChange={(event) => set(event.target.checked)} />
          {label}
        </label>
      ))}
    </div>
  )
}

function Fruit({ label }: { label: string }) {
  const [value, setValue] = React.useState('banana')

  return (
    <Select.Root onValueChange={setValue} value={value}>
      <Select.Trigger aria-label={label} className={styles.trigger}>
        <Select.Value />
        <Select.Icon />
      </Select.Trigger>
      <Select.Portal container={usePortalContainer()}>
        <Select.Content className={styles.content}>
          <Select.Viewport className={styles.viewport}>
            {foodGroups[0]?.foods.map((food) => (
              <Select.Item className={styles.item} key={food.value} value={food.value}>
                <Select.ItemText>{food.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}

export const Hosts = () => (
  <div className={styles.page}>
    <button type="button">Outside</button>
    <Frame className={styles.frame}>
      <Fruit label="Fruit in a frame" />
    </Frame>
    <ShadowRoot>
      <Fruit label="Fruit in a shadow root" />
    </ShadowRoot>
  </div>
)

const TickIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 32 32"
    width="12"
    height="12"
    fill="none"
    stroke="currentcolor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="3">
    <path d="M2 20 L12 28 30 4" />
  </svg>
)
