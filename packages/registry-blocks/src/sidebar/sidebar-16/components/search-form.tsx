import { Label } from '@gentleduck/registry-ui/label'
import { SidebarInput } from '@gentleduck/registry-ui/sidebar'
import { Search } from 'lucide-react'

export function SearchForm({ ...props }: React.ComponentProps<'form'>) {
  return (
    <form {...props}>
      <div className="relative">
        <Label className="sr-only" htmlFor="search">
          Search
        </Label>
        <SidebarInput className="h-8 ps-7" id="search" placeholder="Type to search..." />
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute start-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50"
        />
      </div>
    </form>
  )
}
