'use client'

import { useStateMachine } from '@gentleduck/primitives/hooks/use-state-machine'
import styles from '../primitives.module.css'

export default function HooksStateMachineExample() {
  const [state, send] = useStateMachine('stopped', {
    paused: { play: 'playing', stop: 'stopped' },
    playing: { pause: 'paused', stop: 'stopped' },
    stopped: { play: 'playing' },
  })

  return (
    <div className={styles.stack}>
      <div className={styles.row}>
        <button className={styles.button} onClick={() => send('play')} type="button">
          Play
        </button>
        <button className={styles.button} onClick={() => send('pause')} type="button">
          Pause
        </button>
        <button className={styles.button} onClick={() => send('stop')} type="button">
          Stop
        </button>
      </div>
      <p className={styles.note}>State: {state}. An event the state has no move for is dropped.</p>
    </div>
  )
}
