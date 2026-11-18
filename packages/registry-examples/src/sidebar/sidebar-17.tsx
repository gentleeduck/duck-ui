import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@gentleduck/registry-ui/collapsible'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
} from '@gentleduck/registry-ui/sidebar'
import { BookOpen, ChevronDown, Rocket } from 'lucide-react'

const SECTIONS = [
  {
    open: true,
    pages: [
      { icon: Rocket, pages: ['Installation', 'Project structure'], title: 'Getting started' },
      { icon: BookOpen, pages: ['Theming', 'Dark mode', 'RTL'], title: 'Guides' },
    ],
    title: 'Documentation',
  },
  {
    open: false,
    pages: [{ icon: BookOpen, pages: ['Changelog', 'Roadmap'], title: 'Releases' }],
    title: 'Project',
  },
]

export default function Demo() {
  return (
    <div className="relative flex h-full w-full overflow-hidden [transform:translateZ(0)]">
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            {SECTIONS.map((section) => (
              <SidebarGroup key={section.title}>
                <Collapsible className="group/collapsible gap-0" defaultOpen={section.open}>
                  <SidebarGroupLabel
                    asChild
                    className="w-full justify-between hover:bg-sidebar-accent hover:text-sidebar-accent-foreground has-[>svg]:px-2">
                    <CollapsibleTrigger variant="nothing">
                      {section.title}
                      <ChevronDown
                        aria-hidden="true"
                        className="transition-transform group-data-[open=true]/collapsible:rotate-180"
                      />
                    </CollapsibleTrigger>
                  </SidebarGroupLabel>
                  <CollapsibleContent>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {section.pages.map((page) => (
                          <SidebarMenuItem key={page.title}>
                            <SidebarMenuButton>
                              <page.icon aria-hidden="true" />
                              <span>{page.title}</span>
                            </SidebarMenuButton>
                            <SidebarMenuSub>
                              {page.pages.map((name, index) => (
                                <SidebarMenuSubItem key={name}>
                                  <SidebarMenuSubButton
                                    href={`#${name.toLowerCase().replace(' ', '-')}`}
                                    isActive={section.open && index === 0}
                                    size="sm">
                                    {name}
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarGroup>
            ))}
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center border-b px-4">
            <SidebarTrigger />
          </header>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
