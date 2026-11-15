'use client'
import { useMediaQuery } from '@gentleduck/hooks/use-media-query'
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@gentleduck/registry-ui/breadcrumb'
import { Button } from '@gentleduck/registry-ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@gentleduck/registry-ui/drawer'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@gentleduck/registry-ui/dropdown-menu'
import Link from 'next/link'
import * as React from 'react'

const items: { href?: string; label: string }[] = [
  { href: '#', label: 'Home' },
  { href: '#', label: 'Documentation' },
  { href: '#', label: 'Building Your Application' },
  { href: '#', label: 'Data Fetching' },
  { label: 'Caching and Revalidating' },
]
const ITEMS_TO_DISPLAY = 3
export default function Demo() {
  const [open, setOpen] = React.useState(false)
  const isDesktop = useMediaQuery('(min-width: 768px)')
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href={items[0]?.href ?? '/'}>{items[0]?.label}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        {items.length > ITEMS_TO_DISPLAY ? (
          <>
            <BreadcrumbItem>
              {isDesktop ? (
                <DropdownMenu onOpenChange={setOpen} open={open}>
                  <DropdownMenuTrigger aria-label="Toggle menu" className="flex items-center gap-1">
                    <BreadcrumbEllipsis className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="bottom" align="start">
                    {items.slice(1, -2).map((item) => (
                      <DropdownMenuItem asChild key={item.label}>
                        <Link href={item.href ? item.href : '#'}>{item.label}</Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Drawer onOpenChange={setOpen} open={open}>
                  <DrawerTrigger aria-label="Toggle Menu">
                    <BreadcrumbEllipsis className="h-4 w-4" />
                  </DrawerTrigger>
                  <DrawerContent>
                    <DrawerHeader className="text-start">
                      <DrawerTitle>Navigate to</DrawerTitle>
                      <DrawerDescription>Select a page to navigate to.</DrawerDescription>
                    </DrawerHeader>
                    <div className="grid gap-1 px-4">
                      {items.slice(1, -2).map((item) => (
                        <Link className="py-1 text-sm" href={item.href ? item.href : '#'} key={item.label}>
                          {item.label}
                        </Link>
                      ))}
                    </div>
                    <DrawerFooter className="pt-4">
                      <DrawerClose asChild>
                        <Button variant="outline">Close</Button>
                      </DrawerClose>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>
              )}
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        ) : null}
        {items.slice(-ITEMS_TO_DISPLAY + 1).map((item) => (
          <React.Fragment key={item.label}>
            <BreadcrumbItem>
              {item.href ? (
                <BreadcrumbLink asChild className="max-w-20 truncate md:max-w-none">
                  <Link href={item.href}>{item.label}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className="max-w-20 truncate md:max-w-none">{item.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {item.href ? <BreadcrumbSeparator /> : null}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
