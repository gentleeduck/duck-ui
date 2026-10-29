import * as React from 'react'
import { Primitive } from '../primitive-elements'
import { useAvatarContext } from './avatar'
import type { IAvatar } from './avatar.types'

const FALLBACK_NAME = 'AvatarFallback'

type AvatarFallbackElement = React.ComponentRef<typeof Primitive.span>

const AvatarFallback = React.forwardRef<AvatarFallbackElement, IAvatar.IFallbackProps>(
  (props: IAvatar.IScoped<IAvatar.IFallbackProps>, forwardedRef) => {
    const { __scopeAvatar, delayMs, ...fallbackProps } = props
    const context = useAvatarContext(FALLBACK_NAME, __scopeAvatar)
    const [canRender, setCanRender] = React.useState(delayMs === undefined)

    React.useEffect(() => {
      if (delayMs !== undefined) {
        const timerId = window.setTimeout(() => setCanRender(true), delayMs)
        return () => window.clearTimeout(timerId)
      }
    }, [delayMs])

    return canRender && context.imageLoadingStatus !== 'loaded' ? (
      <Primitive.span data-slot="avatar-fallback" {...fallbackProps} ref={forwardedRef} />
    ) : null
  },
)

AvatarFallback.displayName = FALLBACK_NAME

export { AvatarFallback }
