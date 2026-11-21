'use client'

import { Primitive } from '@gentleduck/primitives/primitive-elements'
import styles from '../primitives.module.css'

export default function PrimitiveAsChildExample() {
  return (
    <div className={styles.row}>
      <Primitive.button className={styles.button} onClick={() => undefined} type="button">
        A native button
      </Primitive.button>
      <Primitive.button asChild className={styles.button}>
        <a href="#next">A link that takes the button's props</a>
      </Primitive.button>
    </div>
  )
}
