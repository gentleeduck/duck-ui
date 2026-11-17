import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@gentleduck/registry-ui/sidebar'
import { Plus } from 'lucide-react'
import type * as React from 'react'
import { Calendars } from './calendars'
import { DatePicker } from './date-picker'
import { NavUser } from './nav-user'

const data = {
  calendars: [
    {
      items: ['Personal', 'Work', 'Family'],
      name: 'My Calendars',
    },
    {
      items: ['Holidays', 'Birthdays'],
      name: 'Favorites',
    },
    {
      items: ['Travel', 'Reminders', 'Deadlines'],
      name: 'Other',
    },
  ],
  user: {
    avatar: '/avatars/01.png',
    email: 'alex@gentleduck.org',
    name: 'Alex Morgan',
  },
}

export function SidebarRight({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar className="sticky top-0 hidden h-svh border-s lg:flex" collapsible="none" {...props}>
      <SidebarHeader className="h-16 border-sidebar-border border-b">
        <NavUser user={data.user} />
      </SidebarHeader>
      <SidebarContent>
        <DatePicker />
        <SidebarSeparator className="mx-0" />
        <Calendars calendars={data.calendars} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Plus aria-hidden="true" />
              <span>New Calendar</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
