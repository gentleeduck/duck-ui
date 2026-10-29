import type * as React from 'react'
import type { Scope } from '../libs/create-context'
import type { Primitive } from '../primitive-elements'

export namespace IAvatar {
  export type IScoped<TProps> = TProps & { __scopeAvatar?: Scope }

  export type ImageLoadingStatus = 'idle' | 'loading' | 'loaded' | 'error'

  export interface IContext {
    imageLoadingStatus: ImageLoadingStatus
    onImageLoadingStatusChange(status: ImageLoadingStatus): void
    imageCountRef: React.RefObject<number>
  }

  export interface IProps extends React.ComponentPropsWithoutRef<typeof Primitive.span> {}

  export interface IFallbackProps extends React.ComponentPropsWithoutRef<typeof Primitive.span> {
    delayMs?: number
  }

  export interface IImageProps extends React.ComponentPropsWithoutRef<typeof Primitive.img> {
    src?: string
    onLoadingStatusChange?: (status: ImageLoadingStatus) => void
  }
}
