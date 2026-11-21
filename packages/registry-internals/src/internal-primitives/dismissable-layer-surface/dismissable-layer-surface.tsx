'use client'

import { DismissableLayer, useDismissableLayerSurface } from '@gentleduck/primitives/dismissable-layer'
import * as React from 'react'
import styles from '../primitives.module.css'

function Backdrop() {
  const ref = useDismissableLayerSurface()
  return (
    <div
      className={styles.overlay}
      onPointerDown={(event) => event.stopPropagation()}
      ref={ref}
      style={{ background: 'color-mix(in oklab, black 20%, transparent)' }}
    />
  )
}

export default function DismissableLayerSurfaceExample() {
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <button className={styles.button} onClick={() => setOpen(true)} type="button">
        Open over a backdrop
      </button>
      {open ? (
        <>
          <Backdrop />
          <DismissableLayer className={styles.dialog} onDismiss={() => setOpen(false)}>
            The backdrop stops every press it gets, and a press on it still closes this layer.
          </DismissableLayer>
        </>
      ) : null}
    </>
  )
}
