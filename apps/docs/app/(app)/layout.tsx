'use client'
import { SiteHeader } from '~/components/layouts/site-header'
import { SiteFooter } from '~/components/layouts/site-footer'
import { CommandMenu } from '~/components/layouts'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@gentleduck/registry-ui-duckui/select'
import { Calendar, Clock, MicOff, Users, Video } from 'lucide-react'

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  // const html = document.documentElement
  // html.setAttribute('dir', 'rtl')
  return (
    <div data-wrapper="" className="flex items-center place-content-center min-h-screen flex-col gap-8">
      <DialogDemo />
    </div>
    // <SiteHeader />
    // <main className="flex flex-1 flex-col">{children}</main>
    //   <SiteFooter />
  )
}

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@gentleduck/registry-ui-duckui/dialog'
import { Input } from '@gentleduck/registry-ui-duckui/input'
import { Label } from '@gentleduck/registry-ui-duckui/label'

function DialogDemo() {
  return (
    <Dialog>
      <DialogTrigger variant="outline">Edit Profile</DialogTrigger>
      <DialogContent renderOnce className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>Make changes to your profile here. Click save when you're done.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" defaultValue="Pedro Duarte" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input id="username" defaultValue="@peduarte" className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <DialogTrigger>Save changes</DialogTrigger>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
