import * as React from 'react'
import { useCallbackRef } from '../hooks/use-callback-ref'
import { useLayoutEffect } from '../hooks/use-layout-effect'
import { useComposedRefs } from '../libs/compose-ref'
import { Primitive } from '../primitive-elements'
import { useAvatarContext } from './avatar'
import type { IAvatar } from './avatar.types'

const IMAGE_NAME = 'AvatarImage'

// Hidden but still laid out, since a lazy image that is `display: none` never loads.
const HIDDEN: React.CSSProperties = { position: 'absolute', width: 1, height: 1, visibility: 'hidden' }

type AvatarImageElement = React.ComponentRef<typeof Primitive.img>
type Settled = { source: string; status: IAvatar.ImageLoadingStatus }

// The image's own state decides, since a load or error can arrive before hydration or for a request since replaced.
function settle(image: HTMLImageElement | null, source: string, setSettled: (settled: Settled) => void) {
  if (image?.complete) setSettled({ source, status: image.naturalWidth > 0 ? 'loaded' : 'error' })
}

const AvatarImage = React.forwardRef<AvatarImageElement, IAvatar.IImageProps>(
  (props: IAvatar.IScoped<IAvatar.IImageProps>, forwardedRef) => {
    const { __scopeAvatar, src, srcSet, style, onLoad, onError, onLoadingStatusChange, ...imageProps } = props
    const context = useAvatarContext(IMAGE_NAME, __scopeAvatar)
    const imageRef = React.useRef<AvatarImageElement>(null)
    const composedRefs = useComposedRefs(forwardedRef, imageRef)
    const source = src || srcSet ? `${src} ${srcSet}` : ''
    const [settled, setSettled] = React.useState<Settled>()
    const status = settled?.source === source ? settled.status : source ? 'loading' : 'error'
    const handleLoadingStatusChange = useCallbackRef((status: IAvatar.ImageLoadingStatus) => {
      onLoadingStatusChange?.(status)
      context.onImageLoadingStatusChange(status)
    })

    useLayoutEffect(() => settle(imageRef.current, source, setSettled), [source])

    useLayoutEffect(() => {
      handleLoadingStatusChange(status)
    }, [status, handleLoadingStatusChange])

    const { imageCountRef, onImageLoadingStatusChange } = context
    useLayoutEffect(() => {
      if (++imageCountRef.current === 2 && process.env.NODE_ENV !== 'production') {
        console.warn(
          'Avatar: Only one `Avatar.Image` component should be rendered per `Avatar.Root`, but multiple were detected. This will lead to unexpected behavior.',
        )
      }
      return () => {
        imageCountRef.current--
        onImageLoadingStatusChange('idle')
      }
    }, [imageCountRef, onImageLoadingStatusChange])

    return source ? (
      // biome-ignore lint/performance/noImgElement: avatar primitive needs raw <img> for framework-agnostic usage
      <Primitive.img
        data-slot="avatar-image"
        data-state={status}
        {...imageProps}
        ref={composedRefs}
        style={status === 'loaded' ? style : { ...style, ...HIDDEN }}
        onLoad={(event) => {
          onLoad?.(event)
          settle(event.currentTarget, source, setSettled)
        }}
        onError={(event) => {
          onError?.(event)
          settle(event.currentTarget, source, setSettled)
        }}
        // Last, so React 18 sets `loading` and `crossOrigin` before the request starts.
        srcSet={srcSet}
        src={src}
      />
    ) : null
  },
)

AvatarImage.displayName = IMAGE_NAME

export { AvatarImage }
