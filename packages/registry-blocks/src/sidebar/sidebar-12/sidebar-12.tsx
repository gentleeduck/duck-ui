import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@gentleduck/registry-ui/breadcrumb'
import { Separator } from '@gentleduck/registry-ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@gentleduck/registry-ui/sidebar'
import { AppSidebar } from './components/app-sidebar'

export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger className="-ms-1" />
          <Separator className="me-2 h-4" orientation="vertical" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>October 2024</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="grid auto-rows-min gap-4 md:grid-cols-5">
            {Array.from({ length: 20 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder elements
              <div className="aspect-square rounded-xl bg-muted/50" key={i} />
            ))}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
