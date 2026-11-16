'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@gentleduck/registry-ui/dropdown-menu'
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
  SidebarRail,
  SidebarTrigger,
} from '@gentleduck/registry-ui/sidebar'
import { Check, ChevronsUpDown, GalleryVerticalEnd, Home, Inbox, LayoutDashboard, Settings, Users } from 'lucide-react'
import * as React from 'react'

const data = {
  versions: ['3.2.0', '3.1.0', '3.0.0-rc'],
  navMain: [
    {
      title: 'Overview',
      items: [
        { title: 'Analytics', url: '#', icon: LayoutDashboard, isActive: true },
        { title: 'Reports', url: '#', icon: Home },
        { title: 'Notifications', url: '#', icon: Inbox },
      ],
    },
    {
      title: 'Account',
      items: [
        { title: 'Profile', url: '#', icon: Users },
        { title: 'Preferences', url: '#', icon: Settings },
      ],
    },
  ],
}

export default function Demo() {
  const [selectedVersion, setSelectedVersion] = React.useState(data.versions[0])

  return (
    <div className="relative flex h-full w-full overflow-hidden [transform:translateZ(0)]">
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      size="lg"
                      className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                      <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                        <GalleryVerticalEnd aria-hidden="true" className="size-4" />
                      </div>
                      <div className="flex flex-col gap-0.5 leading-none">
                        <span className="font-semibold">Documentation</span>
                        <span className="">v{selectedVersion}</span>
                      </div>
                      <ChevronsUpDown aria-hidden="true" className="ms-auto" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-(--gentleduck-dropdown-menu-trigger-width)">
                    {data.versions.map((version) => (
                      <DropdownMenuItem key={version} onSelect={() => setSelectedVersion(version)}>
                        v{version} {version === selectedVersion && <Check aria-hidden="true" className="ms-auto" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
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
          <SidebarRail />
        </Sidebar>
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ms-1" />
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
