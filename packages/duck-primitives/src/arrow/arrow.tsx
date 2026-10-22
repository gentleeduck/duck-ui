import * as React from 'react'
import { Primitive } from '../primitive-elements'
import type { IArrow } from './arrow.types'

const NAME = 'Arrow'

type ArrowElement = React.ComponentRef<typeof Primitive.svg>

const Arrow = React.forwardRef<ArrowElement, IArrow.IProps>((props, forwardedRef) => {
  const { children, asChild, width = 10, height = 5, ...arrowProps } = props
  return (
    <Primitive.svg
      data-slot="arrow"
      viewBox="0 0 30 10"
      preserveAspectRatio="none"
      {...arrowProps}
      ref={forwardedRef}
      width={width}
      height={height}>
      {asChild ? children : <path d="M 0,0 C 6,0 13.5,10 15,10 C 16.5,10 24,0 30,0 Z" />}
    </Primitive.svg>
  )
})

Arrow.displayName = NAME

export { Arrow, Arrow as Root }
