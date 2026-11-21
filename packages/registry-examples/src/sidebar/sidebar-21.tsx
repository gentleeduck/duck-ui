'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@gentleduck/registry-ui/sidebar'

const CHANNELS = Array.from({ length: 30 }, (_, index) => `channel-${index + 1}`)

export default function Demo() {
  return (
    <SidebarProvider className="h-72 min-h-0">
      <Sidebar className="h-72 border-e" collapsible="none">
        <SidebarContent noScroll={false}>
          <SidebarGroup>
            <SidebarMenu>
              {CHANNELS.map((channel) => (
                <SidebarMenuItem key={channel}>
                  <SidebarMenuButton>#{channel}</SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <main className="p-4 text-muted-foreground text-sm">noScroll off shows the scrollbar on a long list.</main>
    </SidebarProvider>
  )
}
