import * as React from 'react'
import { Frame, ShadowRoot, usePortalContainer } from '../../__stories__/hosts'
import * as HoverCard from '..'
import styles from './hover-card.stories.module.css'

export default {
  title: 'Components/HoverCard',
}

const contentStyle: React.CSSProperties = {
  background: 'white',
  border: '1px solid black',
  display: 'grid',
  gap: 8,
  padding: 12,
  width: 220,
}

function Profile({ children, name }: { children?: React.ReactNode; name: string }) {
  return (
    <HoverCard.Portal container={usePortalContainer()}>
      <HoverCard.Content aria-label={`${name} profile`} sideOffset={5} style={contentStyle}>
        <strong>{name}</strong>
        {children ?? <span>Swims in the mill pond.</span>}
        <a href="#follow">Follow</a>
        <HoverCard.Arrow />
      </HoverCard.Content>
    </HoverCard.Portal>
  )
}

export const Delays = () => {
  const [mallard, setMallard] = React.useState(false)
  const [teal, setTeal] = React.useState(false)

  return (
    <div style={{ display: 'flex', gap: 120, padding: 50 }}>
      <HoverCard.Root closeDelay={400} onOpenChange={setMallard} openDelay={600}>
        <HoverCard.Trigger href="#mallard">@mallard</HoverCard.Trigger>
        <Profile name="Mallard" />
      </HoverCard.Root>
      <HoverCard.Root closeDelay={0} onOpenChange={setTeal} openDelay={0}>
        <HoverCard.Trigger href="#teal">@teal</HoverCard.Trigger>
        <Profile name="Teal" />
      </HoverCard.Root>
      <output aria-label="Open cards">
        {[mallard && 'mallard', teal && 'teal'].filter(Boolean).join(', ') || 'none'}
      </output>
    </div>
  )
}

export const ControlledAndDisabled = () => {
  const [open, setOpen] = React.useState(false)
  const [disabled, setDisabled] = React.useState(false)

  return (
    <div style={{ display: 'grid', gap: 20, justifyItems: 'start', padding: 50 }}>
      <label>
        <input checked={disabled} onChange={(event) => setDisabled(event.currentTarget.checked)} type="checkbox" />
        Disabled
      </label>
      <button onClick={() => setOpen(true)} type="button">
        Show card
      </button>
      <HoverCard.Root closeDelay={0} disabled={disabled} onOpenChange={setOpen} open={open} openDelay={0}>
        <HoverCard.Trigger href="#pintail">@pintail</HoverCard.Trigger>
        <Profile name="Pintail" />
      </HoverCard.Root>
      <output aria-label="Card">{open ? 'open' : 'closed'}</output>
    </div>
  )
}

const flock = ['Mallard', 'Teal', 'Pintail', 'Wigeon']

export const List = () => (
  <div className={styles.page}>
    <ul className={styles.list}>
      {flock.map((name) => (
        <li key={name}>
          <HoverCard.Root>
            <HoverCard.Trigger href={`#${name.toLowerCase()}`}>@{name.toLowerCase()}</HoverCard.Trigger>
            <Profile name={name} />
          </HoverCard.Root>
        </li>
      ))}
    </ul>
  </div>
)

export const Selection = () => (
  <div className={styles.page}>
    <HoverCard.Root closeDelay={100} openDelay={0}>
      <HoverCard.Trigger href="#gadwall">@gadwall</HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content aria-label="Gadwall profile" side="right" sideOffset={5} style={contentStyle}>
          <strong>Gadwall</strong>
          <span>Dabbles for pondweed.</span>
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
    <p>Page text below the card.</p>
  </div>
)

function Loading() {
  const [loaded, setLoaded] = React.useState(false)

  React.useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 300)
    return () => clearTimeout(timer)
  }, [])

  return loaded ? <button type="button">Follow back</button> : <span>Loading</span>
}

export const LateContent = () => (
  <div className={styles.page}>
    <HoverCard.Root closeDelay={0} openDelay={0}>
      <HoverCard.Trigger href="#shoveler">@shoveler</HoverCard.Trigger>
      <Profile name="Shoveler">
        <Loading />
      </Profile>
    </HoverCard.Root>
  </div>
)

export const Animated = () => {
  const [keepMounted, setKeepMounted] = React.useState(false)

  return (
    <div className={styles.page}>
      <label>
        <input
          checked={keepMounted}
          onChange={(event) => setKeepMounted(event.currentTarget.checked)}
          type="checkbox"
        />
        Keep mounted
      </label>
      <HoverCard.Root closeDelay={0} openDelay={0}>
        <HoverCard.Trigger href="#scaup">@scaup</HoverCard.Trigger>
        <HoverCard.Portal forceMount={keepMounted || undefined}>
          <HoverCard.Content aria-label="Scaup profile" className={styles.animated} sideOffset={5} style={contentStyle}>
            <strong>Scaup</strong>
            <span>Dives for mussels.</span>
          </HoverCard.Content>
        </HoverCard.Portal>
      </HoverCard.Root>
    </div>
  )
}

const ProfileLink = React.forwardRef<HTMLAnchorElement, React.ComponentPropsWithoutRef<'a'>>((props, ref) => (
  <a {...props} className={styles.avatar} ref={ref} />
))

export const AsChild = () => (
  <div className={styles.page}>
    <HoverCard.Root closeDelay={0} openDelay={0}>
      <HoverCard.Trigger asChild>
        <ProfileLink aria-label="Smew" href="#smew">
          S
        </ProfileLink>
      </HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content asChild sideOffset={5}>
          <article aria-label="Smew profile" style={contentStyle}>
            <strong>Smew</strong>
            <span>Nests in tree holes.</span>
          </article>
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  </div>
)

const sides = ['top', 'right', 'bottom', 'left'] as const

export const Placement = () => {
  const [side, setSide] = React.useState<(typeof sides)[number]>('bottom')
  const [rtl, setRtl] = React.useState(false)

  return (
    <div className={styles.page}>
      <fieldset>
        <legend>Side</legend>
        {sides.map((value) => (
          <label key={value}>
            <input checked={side === value} name="side" onChange={() => setSide(value)} type="radio" />
            {value}
          </label>
        ))}
      </fieldset>
      <label>
        <input checked={rtl} onChange={(event) => setRtl(event.currentTarget.checked)} type="checkbox" />
        Right to left
      </label>
      <HoverCard.Root closeDelay={0} dir={rtl ? 'rtl' : undefined} openDelay={0}>
        <HoverCard.Trigger className={styles.target} href="#garganey">
          @garganey
        </HoverCard.Trigger>
        <HoverCard.Portal>
          <HoverCard.Content aria-label="Garganey profile" side={side} sideOffset={8} style={contentStyle}>
            <strong>Garganey</strong>
            <span>Crosses the Sahara each spring.</span>
            <HoverCard.Arrow />
          </HoverCard.Content>
        </HoverCard.Portal>
      </HoverCard.Root>
    </div>
  )
}

function Hosted({ name, note }: { name: string; note: string }) {
  return (
    <>
      <p>Text beside the card.</p>
      <HoverCard.Root closeDelay={0} openDelay={0}>
        <HoverCard.Trigger href={`#${name.toLowerCase()}`}>@{name.toLowerCase()}</HoverCard.Trigger>
        <Profile name={name}>
          <span>{note}</span>
        </Profile>
      </HoverCard.Root>
    </>
  )
}

export const InIframe = () => (
  <div className={styles.page}>
    <p>Page text beside the frame.</p>
    <Frame className={styles.frame}>
      <Hosted name="Eider" note="Sea duck of the north." />
    </Frame>
  </div>
)

export const InShadowRoot = () => (
  <div className={styles.page}>
    <p>Page text beside the shadow root.</p>
    <ShadowRoot>
      <Hosted name="Goldeneye" note="Whistling wings in winter." />
    </ShadowRoot>
  </div>
)
