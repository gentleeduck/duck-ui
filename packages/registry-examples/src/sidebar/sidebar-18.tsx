'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@gentleduck/registry-ui/sidebar'
import { Bell, Lock, Palette, User } from 'lucide-react'
import * as React from 'react'

const SECTIONS = [
  { description: 'Your name, photo and email address.', icon: User, title: 'Profile' },
  { description: 'Which events reach you, and where.', icon: Bell, title: 'Notifications' },
  { description: 'Theme, density and the language of the interface.', icon: Palette, title: 'Appearance' },
  { description: 'Your password and the devices signed in.', icon: Lock, title: 'Security' },
]

export default function Demo() {
  const [current, setCurrent] = React.useState(SECTIONS[0])

  return (
    <SidebarProvider className="min-h-0 p-6">
      <div className="flex w-full max-w-2xl overflow-hidden rounded-lg border">
        <Sidebar className="w-44 border-e" collapsible="none">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {SECTIONS.map((section) => (
                    <SidebarMenuItem key={section.title}>
                      <SidebarMenuButton isActive={section === current} onClick={() => setCurrent(section)}>
                        <section.icon aria-hidden="true" />
                        <span>{section.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <section className="grid flex-1 content-start gap-1 p-6">
          <h3 className="font-semibold">{current.title}</h3>
          <p className="text-muted-foreground text-sm">{current.description}</p>
        </section>
      </div>
    </SidebarProvider>
  )
}
