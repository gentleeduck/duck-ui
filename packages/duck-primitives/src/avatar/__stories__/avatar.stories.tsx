import * as React from 'react'
import * as Avatar from '..'
import styles from './avatar.stories.module.css'

export default {
  title: 'Components/Avatar',
}

const PHOTO = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect width="48" height="48" fill="teal"/></svg>',
)}`
const BROKEN = 'data:image/png;base64,broken'

export const Loaded = () => {
  const [statuses, setStatuses] = React.useState<string[]>([])
  return (
    <>
      <Avatar.Root className={styles.root}>
        <Avatar.Image
          alt="Ada"
          className={styles.image}
          src={PHOTO}
          onLoadingStatusChange={(status) => setStatuses((seen) => [...seen, status])}
        />
        <Avatar.Fallback>AL</Avatar.Fallback>
      </Avatar.Root>
      <p>Statuses {statuses.join(' ')}</p>
    </>
  )
}

export const Broken = () => (
  <Avatar.Root className={styles.root}>
    <Avatar.Image alt="Ada" className={styles.image} src={BROKEN} />
    <Avatar.Fallback>AL</Avatar.Fallback>
  </Avatar.Root>
)

export const NoSource = () => (
  <Avatar.Root className={styles.root}>
    <Avatar.Image alt="Ada" className={styles.image} />
    <Avatar.Fallback>AL</Avatar.Fallback>
  </Avatar.Root>
)

export const DelayedFallback = () => (
  <Avatar.Root className={styles.root}>
    <Avatar.Image alt="Ada" className={styles.image} src={BROKEN} />
    <Avatar.Fallback delayMs={600}>AL</Avatar.Fallback>
  </Avatar.Root>
)

export const ChangingSource = () => {
  const [src, setSrc] = React.useState(BROKEN)
  return (
    <>
      <Avatar.Root className={styles.root}>
        <Avatar.Image alt="Ada" className={styles.image} src={src} />
        <Avatar.Fallback>AL</Avatar.Fallback>
      </Avatar.Root>
      <button type="button" onClick={() => setSrc((current) => (current === PHOTO ? BROKEN : PHOTO))}>
        Swap
      </button>
    </>
  )
}
