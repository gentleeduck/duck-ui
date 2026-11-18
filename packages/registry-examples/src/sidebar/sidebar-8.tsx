'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from '@gentleduck/registry-ui/sidebar'
import { Hash, Plus } from 'lucide-react'
import * as React from 'react'

const CHANNELS = [
  { name: 'general', unread: 4 },
  { name: 'design', unread: 0 },
  { name: 'releases', unread: 12 },
  { name: 'support', unread: 1 },
]

export default function Demo() {
  const [channels, setChannels] = React.useState(CHANNELS)
  const [active, setActive] = React.useState('general')
  const [query, setQuery] = React.useState('')
  const shown = channels.filter((channel) => channel.name.includes(query.trim().toLowerCase()))

  return (
    <div className="relative flex h-full w-full overflow-hidden [transform:translateZ(0)]">
      <SidebarProvider>
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
            <span className="font-medium">#{active}</span>
            <SidebarTrigger />
          </header>
          <p className="p-4 text-muted-foreground text-sm">The sidebar sits on the inline-end edge.</p>
        </SidebarInset>
        <Sidebar side="right">
          <SidebarHeader>
            <SidebarInput
              aria-label="Find a channel"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Find a channel"
              value={query}
            />
          </SidebarHeader>
          <SidebarSeparator />
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Channels</SidebarGroupLabel>
              <SidebarGroupAction
                onClick={() => setChannels((list) => [...list, { name: `channel-${list.length + 1}`, unread: 0 }])}
                title="Add a channel">
                <Plus aria-hidden="true" />
                <span className="sr-only">Add a channel</span>
              </SidebarGroupAction>
              <SidebarGroupContent>
                <SidebarMenu>
                  {shown.map((channel) => (
                    <SidebarMenuItem key={channel.name}>
                      <SidebarMenuButton
                        isActive={channel.name === active}
                        onClick={() => {
                          setActive(channel.name)
                          setChannels((list) =>
                            list.map((item) => (item.name === channel.name ? { ...item, unread: 0 } : item)),
                          )
                        }}>
                        <Hash aria-hidden="true" />
                        <span>{channel.name}</span>
                      </SidebarMenuButton>
                      {channel.unread > 0 && <SidebarMenuBadge>{channel.unread}</SidebarMenuBadge>}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
                {shown.length === 0 && <p className="px-2 py-1.5 text-muted-foreground text-xs">No channel matches.</p>}
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    </div>
  )
}
