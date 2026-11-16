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
