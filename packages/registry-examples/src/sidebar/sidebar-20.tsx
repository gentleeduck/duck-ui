'use client'

import { Button } from '@gentleduck/registry-ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  useSidebar,
} from '@gentleduck/registry-ui/sidebar'

function Controls() {
  const { open, setOpen, toggleSidebar, isMobile, openMobile, setOpenMobile } = useSidebar()
  return (
    <main className="flex flex-col gap-2 p-4 text-sm">
      <div className="flex gap-2">
        <Button onClick={toggleSidebar} size="sm" variant="outline">
          Toggle
        </Button>
        <Button onClick={() => setOpen(true)} size="sm" variant="outline">
          Open
        </Button>
        <Button onClick={() => setOpenMobile(!openMobile)} size="sm" variant="outline">
          Mobile sheet
        </Button>
      </div>
      <p className="text-muted-foreground">
        {isMobile
          ? `On a phone, the sheet is ${openMobile ? 'open' : 'closed'}.`
          : `The sidebar is ${open ? 'open' : 'closed'}.`}
      </p>
    </main>
  )
}

export default function Demo() {
  return (
    <SidebarProvider className="min-h-0">
      <Sidebar collapsible="offcanvas">
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              {['Inbox', 'Sent', 'Archive'].map((folder) => (
                <SidebarMenuItem key={folder}>
                  <SidebarMenuButton>{folder}</SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <Controls />
    </SidebarProvider>
  )
}
