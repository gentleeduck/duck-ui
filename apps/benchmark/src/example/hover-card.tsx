import { HoverCard, HoverCardContent, HoverCardTrigger } from '@gentleduck/registry-ui-duckui/hover-card'

export default function HoverCardDemo() {
  return (
    <HoverCard>
      <HoverCardTrigger variant="link">@nextjs</HoverCardTrigger>
      <HoverCardContent>
        <div className="flex justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">@nextjs</h4>
            <p className="text-sm">The React Framework – created and maintained by @vercel.</p>
            <div className="text-muted-foreground text-xs">Joined December 2021</div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
