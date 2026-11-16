'use client'

import { Button } from '@gentleduck/registry-ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@gentleduck/registry-ui/sidebar'
import { GalleryVerticalEnd, Home, Inbox, LayoutDashboard, Settings, Users } from 'lucide-react'
import * as React from 'react'

const data = {
  navMain: [
    {
      title: 'Main',
      items: [
        { title: 'Feed', url: '#', icon: LayoutDashboard, isActive: true },
        { title: 'Explore', url: '#', icon: Home },
        { title: 'Bookmarks', url: '#', icon: Inbox },
      ],
    },
    {
      title: 'System',
      items: [
        { title: 'Logs', url: '#', icon: Users },
        { title: 'Config', url: '#', icon: Settings },
      ],
    },
  ],
}

export default function Demo() {
  const [open, setOpen] = React.useState(true)

  return (
    <div className="relative flex h-full w-full overflow-hidden [transform:translateZ(0)]">
      <SidebarProvider open={open} onOpenChange={setOpen}>
        <Sidebar>
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <GalleryVerticalEnd className="size-4" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-semibold">My App</span>
                    <span className="text-xs">Controlled</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent>
            {data.navMain.map((section) => (
              <SidebarGroup key={section.title}>
                <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {section.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={item.isActive}>
                          <a href={item.url}>
                            {item.icon && <item.icon />}
                            <span>{item.title}</span>
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ms-1" />
            <div className="ms-auto flex items-center gap-2">
              <span className="text-muted-foreground text-sm">Sidebar is {open ? 'open' : 'closed'}</span>
              <Button variant="outline" size="sm" onClick={() => setOpen(!open)}>
                Toggle
              </Button>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4">
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
              <div className="aspect-video rounded-xl bg-muted/50" />
              <div className="aspect-video rounded-xl bg-muted/50" />
              <div className="aspect-video rounded-xl bg-muted/50" />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
