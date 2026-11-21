```tsx title="components/sidebar-1.tsx"
// import from your project: import Demo from '@/components/sidebar-1'
'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@gentleduck/registry-ui/avatar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@gentleduck/registry-ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@gentleduck/registry-ui/dropdown-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from '@gentleduck/registry-ui/sidebar'
import {
  AudioWaveform,
  BadgeCheck,
  Bell,
  BookOpen,
  Bot,
  ChevronRight,
  ChevronsUpDown,
  Command,
  CreditCard,
  Folder,
  Forward,
  Frame,
  GalleryVerticalEnd,
  LogOut,
  Map as MapIcon,
  MoreHorizontal,
  PieChart,
  Plus,
  Settings2,
  Sparkles,
  SquareTerminal,
  Trash2,
} from 'lucide-react'
import * as React from 'react'

const data = {
  user: {
    name: 'Alex Morgan',
    email: 'alex@gentleduck.org',
    avatar: '/avatars/01.png',
  },
  teams: [
    {
      name: 'Duck Labs',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
    {
      name: 'Pond Studio',
      logo: AudioWaveform,
      plan: 'Startup',
    },
    {
      name: 'Feather Works',
      logo: Command,
      plan: 'Free',
    },
  ],
  navMain: [
    {
      title: 'Workspace',
      url: '#',
      icon: SquareTerminal,
      isActive: true,
      items: [
        { title: 'Overview', url: '#' },
        { title: 'Favorites', url: '#' },
        { title: 'Preferences', url: '#' },
      ],
    },
    {
      title: 'Components',
      url: '#',
      icon: Bot,
      items: [
        { title: 'Primitives', url: '#' },
        { title: 'Compositions', url: '#' },
        { title: 'Patterns', url: '#' },
      ],
    },
    {
      title: 'Resources',
      url: '#',
      icon: BookOpen,
      items: [
        { title: 'Getting Started', url: '#' },
        { title: 'Guides', url: '#' },
        { title: 'Examples', url: '#' },
        { title: 'Releases', url: '#' },
      ],
    },
    {
      title: 'Settings',
      url: '#',
      icon: Settings2,
      items: [
        { title: 'Profile', url: '#' },
        { title: 'Team', url: '#' },
        { title: 'Billing', url: '#' },
        { title: 'Usage', url: '#' },
      ],
    },
  ],
  projects: [
    { name: 'Component Library', url: '#', icon: Frame },
    { name: 'Landing Pages', url: '#', icon: PieChart },
    { name: 'Documentation', url: '#', icon: MapIcon },
  ],
}

function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string
    logo: React.ElementType
    plan: string
  }[]
}) {
  const { isMobile } = useSidebar()
  const [activeTeam, setActiveTeam] = React.useState(teams[0])

  if (!activeTeam) {
    return null
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <activeTeam.logo aria-hidden="true" className="size-4" />
              </div>
              <div className="grid flex-1 text-start text-sm leading-tight">
                <span className="truncate font-medium">{activeTeam.name}</span>
                <span className="truncate text-xs">{activeTeam.plan}</span>
              </div>
              <ChevronsUpDown aria-hidden="true" className="ms-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--gentleduck-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}>
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-muted-foreground text-xs">Teams</DropdownMenuLabel>
              {teams.map((team, index) => (
                <DropdownMenuItem key={team.name} onClick={() => setActiveTeam(team)} className="gap-2 p-2">
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    <team.logo className="size-3.5 shrink-0" />
                  </div>
                  {team.name}
                  <DropdownMenuShortcut>Cmd+{index + 1}</DropdownMenuShortcut>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="gap-2 p-2">
                <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                  <Plus aria-hidden="true" className="size-4" />
                </div>
                <div className="font-medium text-muted-foreground">Add team</div>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: React.ElementType
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const { open } = useSidebar()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible key={item.title} defaultOpen={item.isActive} className="group/collapsible">
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={item.title}>
                  {item.icon && <item.icon aria-hidden="true" />}
                  {open && (
                    <>
                      <span>{item.title}</span>
                      <ChevronRight
                        aria-hidden="true"
                        className="ms-auto transition-transform duration-200 group-data-[open=true]/collapsible:rotate-90"
                      />{' '}
                    </>
                  )}
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton asChild>
                        <a href={subItem.url}>
                          <span>{subItem.title}</span>
                        </a>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

function NavProjects({
  projects,
}: {
  projects: {
    name: string
    url: string
    icon: React.ElementType
  }[]
}) {
  const { isMobile } = useSidebar()

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Projects</SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild>
              <a href={item.url}>
                <item.icon aria-hidden="true" />
                <span>{item.name}</span>
              </a>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction showOnHover>
                  <MoreHorizontal aria-hidden="true" />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-48 rounded-lg"
                side={isMobile ? 'bottom' : 'right'}
                align={isMobile ? 'end' : 'start'}>
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <Folder aria-hidden="true" className="text-muted-foreground" />
                    <span>View Project</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Forward aria-hidden="true" className="text-muted-foreground" />
                    <span>Share Project</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <Trash2 aria-hidden="true" className="text-muted-foreground" />
                    <span>Delete Project</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem>
          <SidebarMenuButton className="text-sidebar-foreground/70">
            <MoreHorizontal aria-hidden="true" className="text-sidebar-foreground/70" />
            <span>More</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}

function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">AM</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-start text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown aria-hidden="true" className="ms-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--gentleduck-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}>
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-start text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-lg">AM</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-start text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles aria-hidden="true" />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck aria-hidden="true" />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard aria-hidden="true" />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell aria-hidden="true" />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <LogOut aria-hidden="true" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export default function Demo() {
  return (
    <div className="relative flex h-full w-full overflow-hidden [transform:translateZ(0)]">
      <SidebarProvider>
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <TeamSwitcher teams={data.teams} />
          </SidebarHeader>
          <SidebarContent>
            <NavMain items={data.navMain} />
            <NavProjects projects={data.projects} />
          </SidebarContent>
          <SidebarFooter>
            <NavUser user={data.user} />
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ms-1" />
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4">
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
              <div className="aspect-video rounded-xl bg-muted/50" />
              <div className="aspect-video rounded-xl bg-muted/50" />
              <div className="aspect-video rounded-xl bg-muted/50" />
            </div>
            <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
```

## About

Sidebars are one of the most complex components to build. They are central
to any application and often contain a lot of moving parts.

We now have a solid foundation to build on top of. Composable. Themeable.
Customizable.

[Browse the Blocks Library](/blocks).

## Installation

CLI
Manual

```bash
npx @gentleduck/cli add sidebar
```

## Usage

```tsx showLineNumbers title="app/layout.tsx"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main>
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  )
}
```

```tsx showLineNumbers title="components/app-sidebar.tsx"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar"

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup />
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}
```

## Examples

### sidebar variant

Use the default `sidebar` variant for a standard sidebar layout.

```tsx title="components/sidebar-2.tsx"
// import from your project: import Demo from '@/components/sidebar-2'
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
```

### floating variant

Use the `floating` variant for a sidebar with rounded borders and a drop shadow.

```tsx title="components/sidebar-3.tsx"
// import from your project: import Demo from '@/components/sidebar-3'
'use client'

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

const data = {
  navMain: [
    {
      title: 'Content',
      items: [
        { title: 'Articles', url: '#', icon: LayoutDashboard, isActive: true },
        { title: 'Media', url: '#', icon: Home },
        { title: 'Pages', url: '#', icon: Inbox },
      ],
    },
    {
      title: 'Tools',
      items: [
        { title: 'Editor', url: '#', icon: Users },
        { title: 'Templates', url: '#', icon: Settings },
      ],
    },
  ],
}

export default function Demo() {
  return (
    <div className="relative flex h-full w-full overflow-hidden [transform:translateZ(0)]">
      <SidebarProvider>
        <Sidebar variant="floating">
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <GalleryVerticalEnd className="size-4" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-semibold">My App</span>
                    <span className="text-xs">Floating variant</span>
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
          <header className="flex h-16 shrink-0 items-center gap-2 px-4">
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
```

### inset variant

Use the `inset` variant for a sidebar that sits inside the page layout.

}>
  If you use the `inset` variant, remember to wrap your main content
  in a `SidebarInset` component.

```tsx showLineNumbers
<SidebarProvider>
  <Sidebar variant="inset" />
  <SidebarInset>
    <main>{children}</main>
  </SidebarInset>
</SidebarProvider>
```

```tsx title="components/sidebar-4.tsx"
// import from your project: import Demo from '@/components/sidebar-4'
'use client'

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

const data = {
  navMain: [
    {
      title: 'Workspace',
      items: [
        { title: 'Projects', url: '#', icon: LayoutDashboard, isActive: true },
        { title: 'Tasks', url: '#', icon: Home },
        { title: 'Calendar', url: '#', icon: Inbox },
      ],
    },
    {
      title: 'Admin',
      items: [
        { title: 'Members', url: '#', icon: Users },
        { title: 'Billing', url: '#', icon: Settings },
      ],
    },
  ],
}

export default function Demo() {
  return (
    <div className="relative flex h-full w-full overflow-hidden [transform:translateZ(0)]">
      <SidebarProvider>
        <Sidebar variant="inset">
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <GalleryVerticalEnd className="size-4" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-semibold">My App</span>
                    <span className="text-xs">Inset variant</span>
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
          <header className="flex h-16 shrink-0 items-center gap-2 px-4">
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
```

### Controlled Sidebar

Use the `open` and `onOpenChange` props to control the sidebar.

```tsx title="components/sidebar-5.tsx"
// import from your project: import Demo from '@/components/sidebar-5'
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
```

```tsx showLineNumbers
export function AppSidebar() {
  const [open, setOpen] = React.useState(false)

  return (
    <SidebarProvider open={open} onOpenChange={setOpen}>
      <Sidebar />
    </SidebarProvider>
  )
}
```

### Right side, search and badges

`side="right"` puts the sidebar on the inline-end edge; render it after `SidebarInset` so its gap lands on that side. `SidebarInput` filters the menu, `SidebarGroupAction` adds a channel, and `SidebarMenuBadge` shows the unread count beside each item.

```tsx title="components/sidebar-8.tsx"
// import from your project: import Demo from '@/components/sidebar-8'
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
```

### Loading

`SidebarMenuSkeleton` holds each row's place while the menu loads. Pass `index` to vary the widths, which are fixed so the server and the client render the same markup, and `showIcon` for the icon's place.

```tsx title="components/sidebar-9.tsx"
// import from your project: import Demo from '@/components/sidebar-9'
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
```

### Collapsible groups

A `Collapsible` around each group folds it away, with the group label as its trigger. `SidebarMenuSub` nests the pages under each item, and `size="sm"` makes the sub buttons smaller.

```tsx title="components/sidebar-17.tsx"
// import from your project: import Demo from '@/components/sidebar-17'
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
```

### Non-collapsing

`collapsible="none"` renders a plain column with no fixed position and no toggle, for a sidebar inside a page such as a settings panel. Give the provider `min-h-0`, since it fills the viewport's height by default.

```tsx title="components/sidebar-18.tsx"
// import from your project: import Demo from '@/components/sidebar-18'
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
```

### Naming the mobile sheet

```tsx title="components/sidebar-19.tsx"
// import from your project: import Demo from '@/components/sidebar-19'
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
```

### Controlled from the hook

```tsx title="components/sidebar-20.tsx"
// import from your project: import Demo from '@/components/sidebar-20'
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
```

### A visible scrollbar

```tsx title="components/sidebar-21.tsx"
// import from your project: import Demo from '@/components/sidebar-21'
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
```

## Component Composition

A `Sidebar` component is composed of the following parts:

* `SidebarProvider` - Handles collapsible state.
* `Sidebar` - The sidebar container.
* `SidebarHeader` and `SidebarFooter` - Sticky at the top and bottom of the sidebar.
* `SidebarContent` - Scrollable content.
* `SidebarGroup` - Section within the `SidebarContent`.
* `SidebarTrigger` - Trigger for the `Sidebar`.

## SidebarProvider

The `SidebarProvider` component is used to provide the sidebar context to the `Sidebar` component. You should always wrap your application in a `SidebarProvider` component.

| Name           | Type                      | Description                                  |
| -------------- | ------------------------- | -------------------------------------------- |
| `defaultOpen`  | `boolean`                 | Default open state of the sidebar.           |
| `open`         | `boolean`                 | Open state of the sidebar (controlled).      |
| `onOpenChange` | `(open: boolean) => void` | Sets open state of the sidebar (controlled). |

### Width

If you have a single sidebar in your application, you can use the `SIDEBAR_WIDTH` and `SIDEBAR_WIDTH_MOBILE` variables in `sidebar.tsx` to set the width of the sidebar.

```tsx showLineNumbers title="components/ui/sidebar.tsx"
const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_MOBILE = "18rem"
const SIDEBAR_WIDTH_ICON = "3rem"
```

For multiple sidebars in your application, you can use the `--sidebar-width` and `--sidebar-width-icon` CSS variables in the `style` prop. `MotionSidebar` animates to the same variables. On mobile the sidebar opens in a sheet portalled out of the provider, so it takes `SIDEBAR_WIDTH_MOBILE` whatever the provider sets.

```tsx showLineNumbers
<SidebarProvider
  style={
    {
      "--sidebar-width": "20rem",
    } as React.CSSProperties
  }
>
  <Sidebar />
</SidebarProvider>
```

### Keyboard Shortcut

To trigger the sidebar, you use the `cmd+b` keyboard shortcut on Mac and `ctrl+b` on Windows.

```tsx showLineNumbers title="components/ui/sidebar.tsx"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"
```

## Sidebar

The main `Sidebar` component used to render a collapsible sidebar.

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `side` | `'left' \| 'right'` | `'left'` | The side of the sidebar. Flow-relative: `left` is the inline-start edge, so it sits on the right in RTL. |
| `variant` | `'sidebar' \| 'floating' \| 'inset'` | `'sidebar'` | The variant of the sidebar. |
| `collapsible` | `'offcanvas' \| 'icon' \| 'none'` | `'offcanvas'` | Collapsible state of the sidebar. |
| `dir` | `'ltr' \| 'rtl'` | - | Direction override. Defaults to the nearest `DirectionProvider`, then `<html dir>`. |
| `mobileTitle` | `string` | `'Sidebar'` | Title for the mobile sheet dialog. |
| `mobileDescription` | `string` | `'Displays the mobile sidebar.'` | Description for the mobile sheet dialog. |

| Prop        | Description                                                  |
| ----------- | ------------------------------------------------------------ |
| `offcanvas` | A collapsible sidebar that slides in from the left or right. |
| `icon`      | A sidebar that collapses to icons.                           |
| `none`      | A non-collapsible sidebar.                                   |

## useSidebar

The `useSidebar` hook is used to control the sidebar.

```tsx showLineNumbers
import { useSidebar } from "@/components/ui/sidebar"

export function AppSidebar() {
  const {
    state,
    open,
    setOpen,
    openMobile,
    setOpenMobile,
    isMobile,
    toggleSidebar,
  } = useSidebar()
}
```

| Property        | Type                      | Description                                   |
| --------------- | ------------------------- | --------------------------------------------- |
| `state`         | `expanded` or `collapsed` | The current state of the sidebar.             |
| `open`          | `boolean`                 | Whether the sidebar is open.                  |
| `setOpen`       | `(open: boolean) => void` | Sets the open state of the sidebar.           |
| `openMobile`    | `boolean`                 | Whether the sidebar is open on mobile.        |
| `setOpenMobile` | `(open: boolean) => void` | Sets the open state of the sidebar on mobile. |
| `isMobile`      | `boolean`                 | Whether the sidebar is on mobile.             |
| `toggleSidebar` | `() => void`              | Toggles the sidebar. Desktop and mobile.      |
| `dir`           | `'ltr' \| 'rtl'`          | The resolved text direction.                  |

## SidebarHeader

Use the `SidebarHeader` component to add a sticky header to the sidebar.

```tsx showLineNumbers title="components/app-sidebar.tsx"
<Sidebar>
  <SidebarHeader>
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton>
              Select Workspace
              <ChevronDown className="ms-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-(--gentleduck-dropdown-menu-trigger-width)">
            <DropdownMenuItem>
              <span>Duck Labs</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  </SidebarHeader>
</Sidebar>
```

## SidebarFooter

Use the `SidebarFooter` component to add a sticky footer to the sidebar.

```tsx showLineNumbers
<Sidebar>
  <SidebarFooter>
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton>
          <User2 /> Username
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  </SidebarFooter>
</Sidebar>
```

## SidebarContent

The `SidebarContent` component is used to wrap the content of the sidebar. This is where you add your `SidebarGroup` components. It is scrollable.

| Name       | Type      | Default | Description                                       |
| ---------- | --------- | ------- | ------------------------------------------------- |
| `noScroll` | `boolean` | `true`  | Hides the scrollbar while keeping scroll behavior. |

```tsx showLineNumbers
<Sidebar>
  <SidebarContent>
    <SidebarGroup />
    <SidebarGroup />
  </SidebarContent>
</Sidebar>
```

To show the scrollbar, set `noScroll` to `false`:

```tsx showLineNumbers
<SidebarContent noScroll={false}>
  <SidebarGroup />
</SidebarContent>
```

## SidebarGroup

Use the `SidebarGroup` component to create a section within the sidebar.

A `SidebarGroup` has a `SidebarGroupLabel`, a `SidebarGroupContent` and an optional `SidebarGroupAction`.

```tsx showLineNumbers
<SidebarGroup>
  <SidebarGroupLabel>Application</SidebarGroupLabel>
  <SidebarGroupAction>
    <Plus /> <span className="sr-only">Add Project</span>
  </SidebarGroupAction>
  <SidebarGroupContent></SidebarGroupContent>
</SidebarGroup>
```

To make a `SidebarGroup` collapsible, wrap it in a `Collapsible`.

```tsx showLineNumbers
<SidebarGroup>
  <Collapsible defaultOpen className="group/collapsible gap-0">
    <SidebarGroupLabel asChild className="w-full justify-between hover:bg-sidebar-accent has-[>svg]:px-2">
      <CollapsibleTrigger variant="nothing">
        Help
        <ChevronDown className="transition-transform group-data-[open=true]/collapsible:rotate-180" />
      </CollapsibleTrigger>
    </SidebarGroupLabel>
    <CollapsibleContent>
      <SidebarGroupContent />
    </CollapsibleContent>
  </Collapsible>
</SidebarGroup>
```

`CollapsibleTrigger` is a `Button`, so `variant="nothing"` drops its ghost style and the label's classes win. See [Collapsible groups](#collapsible-groups).

## SidebarMenu

The `SidebarMenu` component is used for building a menu within a `SidebarGroup`.

```tsx showLineNumbers
<SidebarMenu>
  {projects.map((project) => (
    <SidebarMenuItem key={project.name}>
      <SidebarMenuButton asChild>
        <a href={project.url}>
          <project.icon />
          <span>{project.name}</span>
        </a>
      </SidebarMenuButton>
    </SidebarMenuItem>
  ))}
</SidebarMenu>
```

## SidebarMenuButton

The `SidebarMenuButton` component is used to render a menu button within a `SidebarMenuItem`.

By default, the `SidebarMenuButton` renders a button but you can use the `asChild` prop to render a different component such as a `Link` or an `a` tag.

| Name       | Type                                          | Default     | Description                                    |
| ---------- | --------------------------------------------- | ----------- | ---------------------------------------------- |
| `asChild`  | `boolean`                                     | `false`     | Render as child element.                       |
| `isActive` | `boolean`                                     | `false`     | Marks the menu item as active.                 |
| `variant`  | `default` or `outline`                        | `default`   | The visual variant of the button.              |
| `size`     | `default`, `sm`, or `lg`                      | `default`   | The size of the button.                        |
| `tooltip`  | `string` or `TooltipContent` props            | `undefined` | Tooltip shown when sidebar is collapsed.       |

```tsx showLineNumbers
<SidebarMenuButton asChild isActive>
  <a href="#">Home</a>
</SidebarMenuButton>
```

### Tooltip

Use the `tooltip` prop to show a tooltip when the sidebar is collapsed to icons. `SidebarProvider` supplies the `TooltipProvider` it needs, with no delay, so the label shows as soon as an icon is hovered or focused.

```tsx showLineNumbers
<SidebarMenuButton tooltip="Home">
  <Home />
  <span>Home</span>
</SidebarMenuButton>
```

You can also pass `TooltipContent` props for more control:

```tsx showLineNumbers
<SidebarMenuButton
  tooltip={{
    children: "Home",
    side: "right",
    align: "center",
  }}
>
  <Home />
  <span>Home</span>
</SidebarMenuButton>
```

## SidebarMenuAction

The `SidebarMenuAction` component is used to render a menu action within a `SidebarMenuItem`.

| Name          | Type      | Default | Description                                      |
| ------------- | --------- | ------- | ------------------------------------------------ |
| `asChild`     | `boolean` | `false` | Render as child element.                         |
| `showOnHover` | `boolean` | `false` | Only show the action on hover (hidden by default). |

```tsx showLineNumbers
<SidebarMenuItem>
  <SidebarMenuButton asChild>
    <a href="#">
      <Home />
      <span>Home</span>
    </a>
  </SidebarMenuButton>
  <SidebarMenuAction showOnHover>
    <Plus /> <span className="sr-only">Add Project</span>
  </SidebarMenuAction>
</SidebarMenuItem>
```

## SidebarMenuSub

The `SidebarMenuSub` component is used to render a submenu within a `SidebarMenu`.

Use `SidebarMenuSubButton` inside `SidebarMenuSubItem` for sub-menu items.

#### SidebarMenuSubButton

| Name       | Type              | Default | Description                    |
| ---------- | ----------------- | ------- | ------------------------------ |
| `asChild`  | `boolean`         | `false` | Render as child element.       |
| `size`     | `sm` or `md`      | `md`    | The size of the sub-button.    |
| `isActive` | `boolean`         | `false` | Marks the sub-item as active.  |

```tsx showLineNumbers
<SidebarMenuItem>
  <SidebarMenuButton />
  <SidebarMenuSub>
    <SidebarMenuSubItem>
      <SidebarMenuSubButton isActive>
        <span>Active Sub Item</span>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
    <SidebarMenuSubItem>
      <SidebarMenuSubButton asChild>
        <a href="#">Sub Item Link</a>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  </SidebarMenuSub>
</SidebarMenuItem>
```

## SidebarMenuBadge

The `SidebarMenuBadge` component is used to render a badge within a `SidebarMenuItem`.

```tsx showLineNumbers
<SidebarMenuItem>
  <SidebarMenuButton />
  <SidebarMenuBadge>24</SidebarMenuBadge>
</SidebarMenuItem>
```

## SidebarMenuSkeleton

The `SidebarMenuSkeleton` component is used to render a skeleton for a `SidebarMenu`.

| Name       | Type      | Default | Description                          |
| ---------- | --------- | ------- | ------------------------------------ |
| `showIcon` | `boolean` | `false` | Show a skeleton icon before the text. |

```tsx showLineNumbers
<SidebarMenu>
  {Array.from({ length: 5 }).map((_, index) => (
    <SidebarMenuItem key={index}>
      <SidebarMenuSkeleton showIcon />
    </SidebarMenuItem>
  ))}
</SidebarMenu>
```

## SidebarTrigger

Use the `SidebarTrigger` component to render a button that toggles the sidebar. It extends the `Button` component and accepts all its props.

```tsx showLineNumbers
<SidebarTrigger />
```

You can also build a custom trigger using the `useSidebar` hook:

```tsx showLineNumbers
import { useSidebar } from "@/components/ui/sidebar"

export function CustomTrigger() {
  const { toggleSidebar } = useSidebar()

  return <button onClick={toggleSidebar}>Toggle Sidebar</button>
}
```

## SidebarRail

The `SidebarRail` component is used to render a rail within a `Sidebar`. This rail can be used to toggle the sidebar.

```tsx showLineNumbers
<Sidebar>
  <SidebarHeader />
  <SidebarContent>
    <SidebarGroup />
  </SidebarContent>
  <SidebarFooter />
  <SidebarRail />
</Sidebar>
```

## Notes

### Data Attributes

All sidebar components expose `data-slot` attributes for precise CSS targeting.

| Component              | `data-slot`              |
| ---------------------- | ------------------------ |
| `SidebarProvider`      | `sidebar-wrapper`        |
| `Sidebar`              | `sidebar`                |
| `SidebarTrigger`       | `sidebar-trigger`        |
| `SidebarRail`          | `sidebar-rail`           |
| `SidebarInset`         | `sidebar-inset`          |
| `SidebarInput`         | `sidebar-input`          |
| `SidebarHeader`        | `sidebar-header`         |
| `SidebarFooter`        | `sidebar-footer`         |
| `SidebarSeparator`     | `sidebar-separator`      |
| `SidebarContent`       | `sidebar-content`        |
| `SidebarGroup`         | `sidebar-group`          |
| `SidebarGroupLabel`    | `sidebar-group-label`    |
| `SidebarGroupAction`   | `sidebar-group-action`   |
| `SidebarGroupContent`  | `sidebar-group-content`  |
| `SidebarMenu`          | `sidebar-menu`           |
| `SidebarMenuItem`      | `sidebar-menu-item`      |
| `SidebarMenuButton`    | `sidebar-menu-button`    |
| `SidebarMenuAction`    | `sidebar-menu-action`    |
| `SidebarMenuBadge`     | `sidebar-menu-badge`     |
| `SidebarMenuSkeleton`  | `sidebar-menu-skeleton`  |
| `SidebarMenuSub`       | `sidebar-menu-sub`       |
| `SidebarMenuSubItem`   | `sidebar-menu-sub-item`  |
| `SidebarMenuSubButton` | `sidebar-menu-sub-button`|

### Theming

We use the following CSS variables to theme the sidebar.

```css
@layer base {
  :root {
    --sidebar-background: 0 0% 98%;
    --sidebar-foreground: 240 5.3% 26.1%;
    --sidebar-primary: 240 5.9% 10%;
    --sidebar-primary-foreground: 0 0% 98%;
    --sidebar-accent: 240 4.8% 95.9%;
    --sidebar-accent-foreground: 240 5.9% 10%;
    --sidebar-border: 220 13% 91%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }

  .dark {
    --sidebar-background: 240 5.9% 10%;
    --sidebar-foreground: 240 4.8% 95.9%;
    --sidebar-primary: 0 0% 98%;
    --sidebar-primary-foreground: 240 5.9% 10%;
    --sidebar-accent: 240 3.7% 15.9%;
    --sidebar-accent-foreground: 240 4.8% 95.9%;
    --sidebar-border: 240 3.7% 15.9%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }
}
```

### Styling

Here are some tips for styling the sidebar based on different states.

Hide a group when the sidebar collapses to icons:

```tsx
<Sidebar collapsible="icon">
  <SidebarContent>
    <SidebarGroup className="group-data-[collapsible=icon]:hidden" />
  </SidebarContent>
</Sidebar>
```

Show an action when the menu button is active:

```tsx
<SidebarMenuItem>
  <SidebarMenuButton />
  <SidebarMenuAction className="peer-data-active/menu-button:opacity-100" />
</SidebarMenuItem>
```

## RTL Support

Set the direction once with `DirectionProvider` (or `<html dir="rtl">`) and the sidebar follows. `side` is flow-relative: the default `left` is the inline-start edge, so in RTL the sidebar moves to the right together with its border, rail, collapse animation, mobile sheet, and trigger icon. `side="right"` puts it on the inline-end edge.

```tsx title="components/sidebar-6.tsx"
// import from your project: import Demo from '@/components/sidebar-6'
'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@gentleduck/registry-ui/avatar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@gentleduck/registry-ui/collapsible'
import { DirectionProvider } from '@gentleduck/registry-ui/direction'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@gentleduck/registry-ui/dropdown-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from '@gentleduck/registry-ui/sidebar'
import {
  AudioWaveform,
  BadgeCheck,
  Bell,
  BookOpen,
  Bot,
  ChevronDown,
  ChevronsUpDown,
  Command,
  CreditCard,
  Folder,
  Forward,
  Frame,
  GalleryVerticalEnd,
  LogOut,
  Map as MapIcon,
  MoreHorizontal,
  PieChart,
  Plus,
  Settings2,
  Sparkles,
  SquareTerminal,
  Trash2,
} from 'lucide-react'
import * as React from 'react'

const data = {
  user: {
    name: 'أحمد محمد',
    email: 'ahmad@gentleduck.org',
    avatar: '/avatars/01.png',
  },
  teams: [
    {
      name: 'مختبرات داك',
      logo: GalleryVerticalEnd,
      plan: 'باقة المؤسسات',
    },
    {
      name: 'استوديو البركة',
      logo: AudioWaveform,
      plan: 'باقة الشركات الناشئة',
    },
    {
      name: 'أعمال الريشة',
      logo: Command,
      plan: 'الباقة المجانية',
    },
  ],
  navMain: [
    {
      title: 'مساحة العمل',
      url: '#',
      icon: SquareTerminal,
      isActive: true,
      items: [
        { title: 'نظرة عامة', url: '#' },
        { title: 'المفضلة', url: '#' },
        { title: 'التفضيلات', url: '#' },
      ],
    },
    {
      title: 'المكونات',
      url: '#',
      icon: Bot,
      items: [
        { title: 'الأساسيات', url: '#' },
        { title: 'التركيبات', url: '#' },
        { title: 'الأنماط', url: '#' },
      ],
    },
    {
      title: 'الموارد',
      url: '#',
      icon: BookOpen,
      items: [
        { title: 'البدء', url: '#' },
        { title: 'الأدلة', url: '#' },
        { title: 'الأمثلة', url: '#' },
        { title: 'الإصدارات', url: '#' },
      ],
    },
    {
      title: 'الإعدادات',
      url: '#',
      icon: Settings2,
      items: [
        { title: 'الملف الشخصي', url: '#' },
        { title: 'الفريق', url: '#' },
        { title: 'الفوترة', url: '#' },
        { title: 'الاستخدام', url: '#' },
      ],
    },
  ],
  projects: [
    { name: 'مكتبة المكونات', url: '#', icon: Frame },
    { name: 'صفحات الهبوط', url: '#', icon: PieChart },
    { name: 'التوثيق', url: '#', icon: MapIcon },
  ],
}

function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string
    logo: React.ElementType
    plan: string
  }[]
}) {
  const { isMobile } = useSidebar()
  const [activeTeam, setActiveTeam] = React.useState(teams[0])

  if (!activeTeam) {
    return null
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <activeTeam.logo aria-hidden="true" className="size-4" />
              </div>
              <div className="grid flex-1 text-start text-sm leading-tight">
                <span className="truncate font-medium">{activeTeam.name}</span>
                <span className="truncate text-xs">{activeTeam.plan}</span>
              </div>
              <ChevronsUpDown aria-hidden="true" className="ms-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--gentleduck-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}>
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-muted-foreground text-xs">الفرق</DropdownMenuLabel>
              {teams.map((team, index) => (
                <DropdownMenuItem key={team.name} onClick={() => setActiveTeam(team)} className="gap-2 p-2">
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    <team.logo className="size-3.5 shrink-0" />
                  </div>
                  {team.name}
                  <DropdownMenuShortcut>Cmd+{index + 1}</DropdownMenuShortcut>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="gap-2 p-2">
                <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                  <Plus aria-hidden="true" className="size-4" />
                </div>
                <div className="font-medium text-muted-foreground">إضافة فريق</div>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: React.ElementType
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const { open } = useSidebar()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>المنصة</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible key={item.title} defaultOpen={item.isActive} className="group/collapsible">
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={item.title}>
                  {item.icon && <item.icon aria-hidden="true" />}
                  {open && (
                    <>
                      <span>{item.title}</span>
                      <ChevronDown
                        aria-hidden="true"
                        className="ms-auto transition-transform duration-200 group-data-[open=true]/collapsible:rotate-180"
                      />
                    </>
                  )}
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton asChild>
                        <a href={subItem.url}>
                          <span>{subItem.title}</span>
                        </a>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

function NavProjects({
  projects,
}: {
  projects: {
    name: string
    url: string
    icon: React.ElementType
  }[]
}) {
  const { isMobile } = useSidebar()

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>المشاريع</SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild>
              <a href={item.url}>
                <item.icon aria-hidden="true" />
                <span>{item.name}</span>
              </a>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction showOnHover>
                  <MoreHorizontal aria-hidden="true" />
                  <span className="sr-only">المزيد</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-48 rounded-lg"
                side={isMobile ? 'bottom' : 'right'}
                align={isMobile ? 'end' : 'start'}>
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <Folder aria-hidden="true" className="text-muted-foreground" />
                    <span>عرض المشروع</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Forward aria-hidden="true" className="text-muted-foreground" />
                    <span>مشاركة المشروع</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <Trash2 aria-hidden="true" className="text-muted-foreground" />
                    <span>حذف المشروع</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem>
          <SidebarMenuButton className="text-sidebar-foreground/70">
            <MoreHorizontal aria-hidden="true" className="text-sidebar-foreground/70" />
            <span>المزيد</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}

function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">أم</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-start text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown aria-hidden="true" className="ms-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--gentleduck-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}>
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-start text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-lg">أم</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-start text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles aria-hidden="true" />
                الترقية إلى Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck aria-hidden="true" />
                الحساب
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard aria-hidden="true" />
                الفوترة
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell aria-hidden="true" />
                الإشعارات
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <LogOut aria-hidden="true" />
                تسجيل الخروج
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export default function Demo() {
  return (
    <DirectionProvider dir="rtl">
      <div className="transform-[translateZ(0)] relative flex h-full w-full overflow-hidden">
        <SidebarProvider>
          <Sidebar collapsible="icon">
            <SidebarHeader>
              <TeamSwitcher teams={data.teams} />
            </SidebarHeader>
            <SidebarContent>
              <NavMain items={data.navMain} />
              <NavProjects projects={data.projects} />
            </SidebarContent>
            <SidebarFooter>
              <NavUser user={data.user} />
            </SidebarFooter>
            <SidebarRail text="إظهار الشريط الجانبي أو إخفاؤه" />
          </Sidebar>
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ms-1" text="إظهار الشريط الجانبي أو إخفاؤه" />
                <span className="font-medium text-sm">نظرة عامة</span>
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4">
              <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                <div className="aspect-video rounded-xl bg-muted/50" />
                <div className="aspect-video rounded-xl bg-muted/50" />
                <div className="aspect-video rounded-xl bg-muted/50" />
              </div>
              <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </DirectionProvider>
  )
}
```

```tsx
<DirectionProvider dir="rtl">
  <SidebarProvider>
    <Sidebar>{/* ... */}</Sidebar>
  </SidebarProvider>
</DirectionProvider>
```

## Motion

} title="Alpha: Motion Compositions" tone="warning">
  Motion components work standalone, but some compositions may behave unexpectedly: this is still under active development. If you find a broken composition, please [file an issue](https://github.com/gentleeduck/gentleduck/issues).

Use `MotionSidebar` for smooth width animations powered by [motion](https://motion.dev). The sidebar width animates with a bouncy spring transition when collapsing and expanding.

```tsx title="components/sidebar-7.tsx"
// import from your project: import Demo from '@/components/sidebar-7'
'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@gentleduck/registry-ui/avatar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@gentleduck/registry-ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@gentleduck/registry-ui/dropdown-menu'
import {
  MotionSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from '@gentleduck/registry-ui/sidebar'
import {
  AudioWaveform,
  BadgeCheck,
  Bell,
  BookOpen,
  Bot,
  ChevronRight,
  ChevronsUpDown,
  Command,
  CreditCard,
  Folder,
  Forward,
  Frame,
  GalleryVerticalEnd,
  LogOut,
  Map as MapIcon,
  MoreHorizontal,
  PieChart,
  Plus,
  Settings2,
  Sparkles,
  SquareTerminal,
  Trash2,
} from 'lucide-react'
import * as React from 'react'

const data = {
  user: {
    name: 'Alex Morgan',
    email: 'alex@gentleduck.org',
    avatar: '/avatars/01.png',
  },
  teams: [
    {
      name: 'Duck Labs',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
    {
      name: 'Pond Studio',
      logo: AudioWaveform,
      plan: 'Startup',
    },
    {
      name: 'Feather Works',
      logo: Command,
      plan: 'Free',
    },
  ],
  navMain: [
    {
      title: 'Workspace',
      url: '#',
      icon: SquareTerminal,
      isActive: true,
      items: [
        { title: 'Overview', url: '#' },
        { title: 'Favorites', url: '#' },
        { title: 'Preferences', url: '#' },
      ],
    },
    {
      title: 'Components',
      url: '#',
      icon: Bot,
      items: [
        { title: 'Primitives', url: '#' },
        { title: 'Compositions', url: '#' },
        { title: 'Patterns', url: '#' },
      ],
    },
    {
      title: 'Resources',
      url: '#',
      icon: BookOpen,
      items: [
        { title: 'Getting Started', url: '#' },
        { title: 'Guides', url: '#' },
        { title: 'Examples', url: '#' },
        { title: 'Releases', url: '#' },
      ],
    },
    {
      title: 'Settings',
      url: '#',
      icon: Settings2,
      items: [
        { title: 'Profile', url: '#' },
        { title: 'Team', url: '#' },
        { title: 'Billing', url: '#' },
        { title: 'Usage', url: '#' },
      ],
    },
  ],
  projects: [
    { name: 'Component Library', url: '#', icon: Frame },
    { name: 'Landing Pages', url: '#', icon: PieChart },
    { name: 'Documentation', url: '#', icon: MapIcon },
  ],
}

function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string
    logo: React.ElementType
    plan: string
  }[]
}) {
  const { isMobile } = useSidebar()
  const [activeTeam, setActiveTeam] = React.useState(teams[0])

  if (!activeTeam) {
    return null
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <activeTeam.logo aria-hidden="true" className="size-4" />
              </div>
              <div className="grid flex-1 text-start text-sm leading-tight">
                <span className="truncate font-medium">{activeTeam.name}</span>
                <span className="truncate text-xs">{activeTeam.plan}</span>
              </div>
              <ChevronsUpDown aria-hidden="true" className="ms-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--gentleduck-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}>
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-muted-foreground text-xs">Teams</DropdownMenuLabel>
              {teams.map((team, index) => (
                <DropdownMenuItem key={team.name} onClick={() => setActiveTeam(team)} className="gap-2 p-2">
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    <team.logo className="size-3.5 shrink-0" />
                  </div>
                  {team.name}
                  <DropdownMenuShortcut>Cmd+{index + 1}</DropdownMenuShortcut>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="gap-2 p-2">
                <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                  <Plus aria-hidden="true" className="size-4" />
                </div>
                <div className="font-medium text-muted-foreground">Add team</div>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: React.ElementType
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const { open } = useSidebar()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible key={item.title} defaultOpen={item.isActive} className="group/collapsible">
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={item.title}>
                  {item.icon && <item.icon aria-hidden="true" />}
                  {open && (
                    <>
                      <span>{item.title}</span>
                      <ChevronRight
                        aria-hidden="true"
                        className="ms-auto transition-transform duration-200 group-data-[open=true]/collapsible:rotate-90"
                      />{' '}
                    </>
                  )}
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton asChild>
                        <a href={subItem.url}>
                          <span>{subItem.title}</span>
                        </a>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

function NavProjects({
  projects,
}: {
  projects: {
    name: string
    url: string
    icon: React.ElementType
  }[]
}) {
  const { isMobile } = useSidebar()

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Projects</SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild>
              <a href={item.url}>
                <item.icon aria-hidden="true" />
                <span>{item.name}</span>
              </a>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction showOnHover>
                  <MoreHorizontal aria-hidden="true" />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-48 rounded-lg"
                side={isMobile ? 'bottom' : 'right'}
                align={isMobile ? 'end' : 'start'}>
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <Folder aria-hidden="true" className="text-muted-foreground" />
                    <span>View Project</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Forward aria-hidden="true" className="text-muted-foreground" />
                    <span>Share Project</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <Trash2 aria-hidden="true" className="text-muted-foreground" />
                    <span>Delete Project</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem>
          <SidebarMenuButton className="text-sidebar-foreground/70">
            <MoreHorizontal aria-hidden="true" className="text-sidebar-foreground/70" />
            <span>More</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}

function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">AM</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-start text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown aria-hidden="true" className="ms-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--gentleduck-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}>
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-start text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-lg">AM</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-start text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles aria-hidden="true" />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck aria-hidden="true" />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard aria-hidden="true" />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell aria-hidden="true" />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <LogOut aria-hidden="true" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export default function Demo() {
  return (
    <div className="relative flex h-full w-full overflow-hidden [transform:translateZ(0)]">
      <SidebarProvider>
        <MotionSidebar collapsible="icon">
          <SidebarHeader>
            <TeamSwitcher teams={data.teams} />
          </SidebarHeader>
          <SidebarContent>
            <NavMain items={data.navMain} />
            <NavProjects projects={data.projects} />
          </SidebarContent>
          <SidebarFooter>
            <NavUser user={data.user} />
          </SidebarFooter>
          <SidebarRail />
        </MotionSidebar>
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ms-1" />
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4">
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
              <div className="aspect-video rounded-xl bg-muted/50" />
              <div className="aspect-video rounded-xl bg-muted/50" />
              <div className="aspect-video rounded-xl bg-muted/50" />
            </div>
            <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
```

}>
  Requires the `motion` package. Use `MotionSidebar` instead of `Sidebar`. All other sub-components (`SidebarProvider`, `SidebarContent`, `SidebarTrigger`, etc.) stay the same.

### MotionSidebar

Same props as `Sidebar`, less `onAnimationStart`, `onDrag`, `onDragStart` and `onDragEnd`, which motion uses for its own callbacks. Replaces CSS width transition with motion `m.div animate` using a `springBouncy` spring transition. Handles icon collapse, offcanvas slide, and floating/inset variants. On mobile, renders through the regular (non-motion) `Sheet`/`SheetContent`. Requires the `motion` package.