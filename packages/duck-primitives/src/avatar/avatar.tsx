import * as React from 'react'
import { createContextScope } from '../libs/create-context'
import { Primitive } from '../primitive-elements'
import type { IAvatar } from './avatar.types'

const AVATAR_NAME = 'Avatar'

const [createAvatarContext, createAvatarScope] = createContextScope(AVATAR_NAME)

const [AvatarProvider, useAvatarContext] = createAvatarContext<IAvatar.IContext>(AVATAR_NAME)

type AvatarElement = React.ComponentRef<typeof Primitive.span>

const Avatar = React.forwardRef<AvatarElement, IAvatar.IProps>(
  (props: IAvatar.IScoped<IAvatar.IProps>, forwardedRef) => {
    const { __scopeAvatar, ...avatarProps } = props
    const [imageLoadingStatus, setImageLoadingStatus] = React.useState<IAvatar.ImageLoadingStatus>('idle')
    const imageCountRef = React.useRef(0)
    return (
      <AvatarProvider
        scope={__scopeAvatar}
        imageLoadingStatus={imageLoadingStatus}
        onImageLoadingStatusChange={setImageLoadingStatus}
        imageCountRef={imageCountRef}>
        <Primitive.span data-slot="avatar" {...avatarProps} ref={forwardedRef} />
      </AvatarProvider>
    )
  },
)

Avatar.displayName = AVATAR_NAME

export { Avatar, createAvatarScope, useAvatarContext }
