// From Radix UI primitives, apps/storybook/stories/popper.stories.tsx. MIT, see ../../__tests__/radix/LICENSE.

import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Direction, Popper, Portal } from '../../__stories__/radix-ui'
import type { IPopper } from '../popper.types'
import styles from './popper.stories.module.css'

export default {
  title: 'Utilities/Popper',
}

export const HideWhenDetachedInScrollContainer = () => {
  const [container, setContainer] = React.useState<HTMLDivElement | null>(null)
  return (
    <div style={{ paddingTop: 300, paddingLeft: 50 }}>
      <div
        ref={setContainer}
        data-testid="scroll-container"
        style={{ width: 300, height: 200, overflow: 'auto', border: '1px solid black' }}>
        <div style={{ height: 900, paddingTop: 20 }}>
          <Popper.Root>
            <Popper.Anchor data-testid="anchor" className={styles.anchor} style={{ width: 80, height: 40 }}>
              anchor
            </Popper.Anchor>
            {container && (
              <Portal.Root asChild>
                <Popper.Content
                  data-testid="content"
                  className={styles.content}
                  side="right"
                  sideOffset={5}
                  hideWhenDetached>
                  content
                </Popper.Content>
              </Portal.Root>
            )}
          </Popper.Root>
        </div>
      </div>
    </div>
  )
}

export const AvailableSizeWithCustomPortal = () => {
  const [host, setHost] = React.useState<HTMLDivElement | null>(null)
  return (
    <div style={{ padding: 50 }}>
      <Popper.Root>
        <Popper.Anchor data-testid="anchor" className={styles.anchor} style={{ width: 80, height: 40 }}>
          anchor
        </Popper.Anchor>
        {host &&
          ReactDOM.createPortal(
            <Popper.Content data-testid="content" className={styles.content} sideOffset={5}>
              content
            </Popper.Content>,
            host,
          )}
      </Popper.Root>

      {/* A custom portal host that both establishes a containing block (via
          `transform`) and clips its children (via `overflow: hidden`), which is
          what makes Floating UI treat it as a clipping ancestor. */}
      <div
        ref={setHost}
        data-testid="portal-host"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 120,
          height: 120,
          overflow: 'hidden',
          transform: 'translateZ(0)',
        }}
      />
    </div>
  )
}

export const Placement = () => {
  const [side, setSide] = React.useState<IPopper.Side>('bottom')
  const [align, setAlign] = React.useState<IPopper.Align>('center')
  const [sideOffset, setSideOffset] = React.useState(8)
  const [alignOffset, setAlignOffset] = React.useState(0)
  const [rtl, setRtl] = React.useState(false)

  return (
    <div className={styles.page}>
      <Choice label="Side" options={Popper.SIDE_OPTIONS} value={side} onChange={setSide} />
      <Choice label="Align" options={Popper.ALIGN_OPTIONS} value={align} onChange={setAlign} />
      <NumberField label="Side offset" value={sideOffset} onChange={setSideOffset} />
      <NumberField label="Align offset" value={alignOffset} onChange={setAlignOffset} />
      <label>
        <input checked={rtl} onChange={(event) => setRtl(event.currentTarget.checked)} type="checkbox" />
        Right to left
      </label>
      <Direction.Provider dir={rtl ? 'rtl' : 'ltr'}>
        <Popper.Root>
          <Popper.Anchor
            className={`${styles.anchor} ${styles.anchorPlaced} ${styles.anchorFancy}`}
            data-testid="anchor">
            Anchor
          </Popper.Anchor>
          <Portal.Root>
            <Popper.Content
              align={align}
              alignOffset={alignOffset}
              className={styles.content}
              data-testid="content"
              side={side}
              sideOffset={sideOffset}>
              {side}, {align}
              <Popper.Arrow className={styles.arrow} data-testid="arrow" height={6} width={12} />
            </Popper.Content>
          </Portal.Root>
        </Popper.Root>
      </Direction.Provider>
    </div>
  )
}

const anchorPlaces = {
  middle: { insetInlineStart: 140, insetBlockStart: 100 },
  'bottom edge': { insetInlineStart: 140, insetBlockEnd: 10 },
  'right edge': { insetInlineEnd: 10, insetBlockStart: 100 },
  'past right edge': { insetInlineEnd: -100, insetBlockStart: 100 },
}

export const Collisions = () => {
  const [boundary, setBoundary] = React.useState<HTMLDivElement | null>(null)
  const [side, setSide] = React.useState<IPopper.Side>('bottom')
  const [place, setPlace] = React.useState<keyof typeof anchorPlaces>('middle')
  const [avoidCollisions, setAvoidCollisions] = React.useState(true)
  const [stickyAlways, setStickyAlways] = React.useState(false)
  const [shiftCrossAxis, setShiftCrossAxis] = React.useState(false)
  const [collisionPadding, setCollisionPadding] = React.useState(0)

  return (
    <div className={styles.page}>
      <Choice label="Side" options={Popper.SIDE_OPTIONS} value={side} onChange={setSide} />
      <Choice
        label="Anchor at"
        options={Object.keys(anchorPlaces) as (keyof typeof anchorPlaces)[]}
        value={place}
        onChange={setPlace}
      />
      <Toggle label="Avoid collisions" value={avoidCollisions} onChange={setAvoidCollisions} />
      <Toggle label="Sticky always" value={stickyAlways} onChange={setStickyAlways} />
      <Toggle label="Shift cross axis" value={shiftCrossAxis} onChange={setShiftCrossAxis} />
      <NumberField label="Collision padding" value={collisionPadding} onChange={setCollisionPadding} />
      <div className={styles.boundary} data-testid="boundary" ref={setBoundary}>
        <Popper.Root>
          <Popper.Anchor
            className={`${styles.anchor} ${styles.anchorBox}`}
            data-testid="anchor"
            style={{ position: 'absolute', ...anchorPlaces[place] }}>
            Anchor
          </Popper.Anchor>
          {boundary && (
            <Popper.Content
              avoidCollisions={avoidCollisions}
              className={`${styles.content} ${styles.contentLarge}`}
              collisionBoundary={boundary}
              collisionPadding={collisionPadding}
              data-testid="content"
              shiftCrossAxis={shiftCrossAxis}
              side={side}
              sticky={stickyAlways ? 'always' : 'partial'}>
              Kept inside the box
            </Popper.Content>
          )}
        </Popper.Root>
      </div>
    </div>
  )
}

export const Arrow = () => {
  const [wide, setWide] = React.useState(false)
  const [arrowPadding, setArrowPadding] = React.useState(0)

  return (
    <div className={styles.page}>
      <Toggle label="Wide anchor" value={wide} onChange={setWide} />
      <NumberField label="Arrow padding" value={arrowPadding} onChange={setArrowPadding} />
      <Popper.Root>
        <Popper.Anchor
          className={`${styles.anchor} ${wide ? styles.anchorWide : styles.anchorSmall}`}
          data-testid="anchor"
        />
        <Popper.Content
          align="start"
          arrowPadding={arrowPadding}
          className={styles.content}
          data-testid="content"
          sideOffset={4}>
          Points at the anchor
          <Popper.Arrow className={styles.arrow} data-testid="arrow" height={8} width={16} />
        </Popper.Content>
      </Popper.Root>
    </div>
  )
}

export const FollowsPointer = () => {
  const pointer = React.useRef({ x: 0, y: 0 })
  const anchor = React.useRef<IPopper.IMeasurable>({ getBoundingClientRect: () => DOMRect.fromRect(pointer.current) })

  return (
    <div className={styles.page}>
      <div
        className={styles.boundary}
        data-testid="area"
        onPointerMove={(event) => {
          pointer.current = { x: event.clientX, y: event.clientY }
        }}>
        Move the pointer here
        <Popper.Root>
          <Popper.Anchor virtualRef={anchor} />
          <Popper.Content
            className={styles.content}
            data-testid="content"
            side="right"
            sideOffset={8}
            updatePositionStrategy="always">
            Here
          </Popper.Content>
        </Popper.Root>
      </div>
    </div>
  )
}

export const Animated = () => {
  const [side, setSide] = React.useState<IPopper.Side>('bottom')
  const [open, setOpen] = React.useState(false)

  return (
    <div className={styles.page}>
      <style>{'@keyframes popper-story-grow { from { opacity: 0; transform: scale(0.6) } }'}</style>
      <Choice label="Side" options={Popper.SIDE_OPTIONS} value={side} onChange={setSide} />
      <Toggle label="Open" value={open} onChange={setOpen} />
      <Popper.Root>
        <Popper.Anchor className={`${styles.anchor} ${styles.anchorPlaced}`} data-testid="anchor">
          Anchor
        </Popper.Anchor>
        {open && (
          <Popper.Content
            className={styles.content}
            data-testid="content"
            side={side}
            sideOffset={4}
            style={{ animation: 'popper-story-grow 400ms ease-out' }}>
            Grows from the arrow
            <Popper.Arrow className={styles.arrow} height={6} width={12} />
          </Popper.Content>
        )}
      </Popper.Root>
    </div>
  )
}

export const AvailableSize = () => (
  <div className={styles.page}>
    <Popper.Root>
      <Popper.Anchor className={`${styles.anchor} ${styles.anchorWide}`} data-testid="anchor">
        Anchor
      </Popper.Anchor>
      <Popper.Content className={`${styles.content} ${styles.contentFitted}`} data-testid="content" sideOffset={4}>
        {Array.from({ length: 60 }, (_, index) => (
          <div key={index}>Row {index + 1}</div>
        ))}
      </Popper.Content>
    </Popper.Root>
  </div>
)

function Choice<T extends string>(props: {
  label: string
  options: readonly T[]
  value: NoInfer<T>
  onChange(value: NoInfer<T>): void
}) {
  return (
    <fieldset>
      <legend>{props.label}</legend>
      {props.options.map((option) => (
        <label key={option}>
          <input
            checked={props.value === option}
            name={props.label}
            onChange={() => props.onChange(option)}
            type="radio"
          />
          {option}
        </label>
      ))}
    </fieldset>
  )
}

function Toggle(props: { label: string; value: boolean; onChange(value: boolean): void }) {
  return (
    <label>
      <input checked={props.value} onChange={(event) => props.onChange(event.currentTarget.checked)} type="checkbox" />
      {props.label}
    </label>
  )
}

function NumberField(props: { label: string; value: number; onChange(value: number): void }) {
  return (
    <label>
      {props.label}{' '}
      <input
        onChange={(event) => props.onChange(Number(event.currentTarget.value))}
        type="number"
        value={props.value}
      />
    </label>
  )
}
