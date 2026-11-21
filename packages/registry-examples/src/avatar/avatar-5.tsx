'use client'

import { Avatar, AvatarFallback, AvatarGroup, AvatarImage } from '@gentleduck/registry-ui/avatar'
import * as React from 'react'

const team = [
  { alt: 'Ana', id: 'ana', src: 'https://avatars.githubusercontent.com/u/108896341?v=4' },
  { alt: 'Bruno', id: 'bruno' },
  { alt: 'Carla', id: 'carla' },
  { alt: 'Diego', id: 'diego' },
  { alt: 'Elena', id: 'elena' },
]

export default function Demo() {
  const [status, setStatus] = React.useState('idle')

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-3">
        <Avatar className="size-14">
          <AvatarImage
            alt="gentleduck"
            onLoadingStatusChange={setStatus}
            sizes="56px"
            srcSet="https://avatars.githubusercontent.com/u/108896341?v=4&s=56 1x, https://avatars.githubusercontent.com/u/108896341?v=4&s=112 2x"
          />
          <AvatarFallback>GD</AvatarFallback>
        </Avatar>
        <span className="text-muted-foreground text-sm">srcSet alone, status: {status}</span>
      </div>
      <AvatarGroup getOverflowLabel={(count) => `${count} personas más`} imgs={team} maxVisible={3} />
    </div>
  )
}
