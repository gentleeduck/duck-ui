import { Badge } from '@gentleduck/registry-ui/badge'
import { ScrollArea } from '@gentleduck/registry-ui/scroll-area'

const topics = ['Design', 'Engineering', 'Product', 'Research', 'Marketing', 'Sales', 'Support', 'Finance', 'Legal']

export default function Demo() {
  return (
    <ScrollArea className="w-72" viewportClassName="scrollbar-none snap-x">
      <div className="flex w-max gap-2 py-1">
        {topics.map((topic) => (
          <Badge className="snap-start" key={topic} variant="secondary">
            {topic}
          </Badge>
        ))}
      </div>
    </ScrollArea>
  )
}
