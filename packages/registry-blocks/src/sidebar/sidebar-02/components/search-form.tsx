import { Label } from '@gentleduck/registry-ui/label'
import { SidebarGroup, SidebarGroupContent, SidebarInput } from '@gentleduck/registry-ui/sidebar'
import { Search } from 'lucide-react'

export function SearchForm({ ...props }: React.ComponentProps<'form'>) {
  return (
    <form {...props}>
      <SidebarGroup className="py-0">
        <SidebarGroupContent className="relative">
          <Label className="sr-only" htmlFor="search">
            Search
          </Label>
          <SidebarInput className="ps-8" id="search" placeholder="Search the docs..." />
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute start-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50"
          />
        </SidebarGroupContent>
      </SidebarGroup>
    </form>
  )
}
