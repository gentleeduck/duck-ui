import type * as React from 'react'

export namespace IMount {
  export interface IProps {
    open: boolean
    children?: React.ReactNode
    animationDuration?: number
  }

  export type IMinimalProps = {
    forceMount?: boolean
    open?: boolean
    children?: React.ReactNode
    skipWaiting?: boolean
    renderOnce?: boolean
  }
}
