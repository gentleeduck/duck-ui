'use client'

import { Button } from '@gentleduck/registry-ui/button'
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
  SidebarMenuSkeleton,
  SidebarProvider,
  SidebarTrigger,
} from '@gentleduck/registry-ui/sidebar'
import { BarChart3, Box, Home, ShoppingCart, Users } from 'lucide-react'
import * as React from 'react'

const PAGES = [
  { icon: Home, title: 'Overview' },
  { icon: ShoppingCart, title: 'Orders' },
  { icon: Users, title: 'Customers' },
  { icon: Box, title: 'Products' },
  { icon: BarChart3, title: 'Reports' },
]

export default function Demo() {
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    if (!loading) return
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [loading])

  return (
    <div className="relative flex h-full w-full overflow-hidden [transform:translateZ(0)]">
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Store</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu aria-busy={loading}>
                  {PAGES.map((page, index) => (
                    <SidebarMenuItem key={page.title}>
                      {loading ? (
                        <SidebarMenuSkeleton index={index} showIcon />
                      ) : (
                        <SidebarMenuButton isActive={index === 0}>
                          <page.icon aria-hidden="true" />
                          <span>{page.title}</span>
                        </SidebarMenuButton>
                      )}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger />
            <Button disabled={loading} onClick={() => setLoading(true)} size="sm" variant="outline">
              Reload
            </Button>
          </header>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
