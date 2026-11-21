'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@gentleduck/registry-ui/sidebar'

export default function Demo() {
  return (
    <SidebarProvider className="min-h-0">
      <Sidebar mobileDescription="Every page of the help centre." mobileTitle="Help centre">
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              {['Getting started', 'Billing', 'Accounts'].map((page) => (
                <SidebarMenuItem key={page}>
                  <SidebarMenuButton>{page}</SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <main className="flex items-center gap-2 p-4 text-sm">
        <SidebarTrigger />
        On a phone the sidebar opens as a sheet named by mobileTitle and mobileDescription.
      </main>
    </SidebarProvider>
  )
}
