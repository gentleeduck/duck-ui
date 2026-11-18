import { Avatar, AvatarFallback, AvatarGroup, AvatarImage } from '@gentleduck/registry-ui/avatar'

const team = [
  { alt: 'wildduck', fallback: 'WD', id: 'wildduck', src: 'https://avatars.githubusercontent.com/u/108896341?v=4' },
  { alt: 'Ada Lovelace', fallback: 'AL', id: 'ada' },
  { alt: 'Grace Hopper', fallback: 'GH', id: 'grace' },
  { alt: 'Alan Turing', fallback: 'AT', id: 'alan' },
  { alt: 'Katherine Johnson', fallback: 'KJ', id: 'katherine' },
]

export default function Demo() {
  return (
    <div className="flex flex-row flex-wrap items-center gap-12">
      <Avatar>
        <AvatarImage alt="A photo that is gone" src="/avatars/missing.png" />
        <AvatarFallback delayMs={600}>NF</AvatarFallback>
      </Avatar>
      <AvatarGroup imgs={team} maxVisible={3} />
    </div>
  )
}
