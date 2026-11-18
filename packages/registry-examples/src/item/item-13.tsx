import { Button } from '@gentleduck/registry-ui/button'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemMedia,
  ItemTitle,
} from '@gentleduck/registry-ui/item'
import { GitBranch } from 'lucide-react'

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <Item variant="outline">
        <ItemMedia variant="icon">
          <GitBranch aria-hidden="true" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>feat/pond-search</ItemTitle>
          <ItemDescription>Deployed to preview 4 minutes ago.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button size="sm" variant="outline">
            Visit
          </Button>
        </ItemActions>
        <ItemFooter className="text-muted-foreground text-xs">
          <span>3 commits ahead of main</span>
          <span>Built in 1m 12s</span>
        </ItemFooter>
      </Item>
    </div>
  )
}
