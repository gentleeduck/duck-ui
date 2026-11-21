'use client'

import { Primitive } from '@gentleduck/primitives/primitive-elements'
import * as React from 'react'
import styles from '../primitives.module.css'

const Badge = React.forwardRef<HTMLSpanElement, React.ComponentPropsWithoutRef<typeof Primitive.span>>(
  ({ className, ...props }, ref) => (
    <Primitive.span className={`${styles.note} ${className ?? ''}`} data-slot="badge" ref={ref} {...props} />
  ),
)

export default function PrimitiveCustomExample() {
  return (
    <div className={styles.row}>
      <Badge>A badge</Badge>
      <Badge asChild>
        <a href="#releases">A badge that is a link</a>
      </Badge>
    </div>
  )
}
