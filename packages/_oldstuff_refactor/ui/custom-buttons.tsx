import React from 'react'
// import { IoHeart } from 'react-icons/io5'
// import { IoMdHeartEmpty } from 'react-icons/io'
// import { LucideIcon } from 'lucide-react'
import { LikedType, TaggedUserType } from './swapy'
import { Button, ButtonProps } from '@gentleduck/registry-ui-duckui/button'
import { cn } from '@gentleduck/libs/cn'

export interface LikeButtonProps extends Omit<ButtonProps, 'onClick'> {
  user: TaggedUserType
  showLikes?: boolean
  likes: LikedType
  onClick?: ({ e, state }: { e: React.MouseEvent<HTMLButtonElement>; state: LikeState }) => void
}

export interface LikeState {
  current: number
  prev: number
  scrollTo: 'up' | 'down' | null
  hasLiked: boolean
}

const LikeButton: React.FC<LikeButtonProps> = ({
  user = [],
  likes,
  className,
  showLikes = true,
  onClick,
  ...props
}) => {
  const { amount } = likes ?? {}

  // Initialize state
  const [likeState, setLikeState] = React.useState<LikeState>({
    current: amount,
    prev: amount,
    scrollTo: null as 'up' | 'down' | null,
    hasLiked: false,
  })

  // Toggle like status
  const handleLikeToggle = React.useCallback(() => {
    setLikeState((prevState) => {
      const newLikes = prevState.hasLiked ? prevState.current - 1 : prevState.current + 1
      return {
        ...prevState,
        prev: prevState.current,
        current: newLikes,
        scrollTo: prevState.hasLiked ? 'down' : 'up',
        hasLiked: !prevState.hasLiked,
      }
    })
  }, [setLikeState])

  return (
    <Button
      size="icon"
      variant="nothing"
      className={cn('rounded-full h-auto w-auto', likeState.hasLiked && 'btn-love')}
      onClick={(e) => {
        onClick && onClick({ e, state: likeState })
        handleLikeToggle()
      }}
      // icon={{
      //   children: (likeState.hasLiked ? IoHeart : IoMdHeartEmpty) as LucideIcon,
      //   className: 'text-[#e2264d]',
      // }}
      {...props}>
      {showLikes && (
        <div
          className={cn(
            'relative grid place-content-center h-4 overflow-hidden leading-4 transition',
            likeState.scrollTo,
          )}
          style={{
            width: `${Math.min(48, Math.max(24, String(likeState.current).length * 12))}px`,
          }}>
          <span className="absolute top-0 left-0">{likeState.current}</span>
          <span className="absolute top-0 left-0">{likeState.prev}</span>
        </div>
      )}
    </Button>
  )
}
export { LikeButton }
