'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { DirectionProvider } from '@gentleduck/registry-ui/direction'
import { Input } from '@gentleduck/registry-ui/input'
import { Label } from '@gentleduck/registry-ui/label'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@gentleduck/registry-ui/sheet'

export default function Demo() {
  return (
    <DirectionProvider dir="rtl">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant={'outline'}>فتح اللوحة</Button>
        </SheetTrigger>
        <SheetContent closeText="إغلاق">
          <SheetHeader>
            <SheetTitle>تعديل الملف الشخصي</SheetTitle>
            <SheetDescription>عدّل بيانات ملفك الشخصي هنا، ثم اضغط على حفظ عند الانتهاء.</SheetDescription>
          </SheetHeader>
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name">الاسم</Label>
              <Input className="col-span-3" defaultValue="أحمد محمد" id="name" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username">اسم المستخدم</Label>
              <Input className="col-span-3" defaultValue="ahmad_mohamed" id="username" />
            </div>
          </div>
          <SheetFooter className="mt-2">
            <SheetClose asChild>
              <Button>حفظ التغييرات</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </DirectionProvider>
  )
}
