import { Avatar, AvatarFallback, AvatarImage } from '@gentleduck/registry-ui/avatar'
import { HoverCard, HoverCardArrow, HoverCardContent, HoverCardTrigger } from '@gentleduck/registry-ui/hover-card'
import { CalendarIcon } from 'lucide-react'

export default function Demo() {
  return (
    <HoverCard>
      <HoverCardTrigger variant="link">@nextjs</HoverCardTrigger>
      <HoverCardContent side="bottom" arrowPadding={8} className="w-80">
        <div className="flex justify-between space-x-4">
          <Avatar>
            <AvatarImage alt="VC" src="https://github.com/gentleeduck.png" />
            <AvatarFallback>VC</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">@nextjs</h4>
            <p className="text-sm">The React Framework — created and maintained by @vercel.</p>
            <div className="flex items-center pt-2">
              <CalendarIcon className="me-2 h-4 w-4 opacity-70" />
              <span className="text-muted-foreground text-xs">Joined December 2021</span>
            </div>
          </div>
        </div>
        <HoverCardArrow />
      </HoverCardContent>
    </HoverCard>
  )
}
