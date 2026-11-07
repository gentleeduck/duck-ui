'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { DirectionProvider } from '@gentleduck/registry-ui/direction'
import { Input } from '@gentleduck/registry-ui/input'
import { Label } from '@gentleduck/registry-ui/label'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from '@gentleduck/registry-ui/popover'

export default function Demo() {
  return (
    <DirectionProvider dir="rtl">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">فتح النافذة المنبثقة</Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="grid gap-4">
            <div className="space-y-2">
              <PopoverTitle>الأبعاد</PopoverTitle>
              <PopoverDescription>اضبط أبعاد الطبقة.</PopoverDescription>
            </div>
            <div className="grid gap-2">
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="width">العرض</Label>
                <Input className="col-span-2 h-8" defaultValue="100%" id="width" />
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="maxWidth">أقصى عرض</Label>
                <Input className="col-span-2 h-8" defaultValue="300px" id="maxWidth" />
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="height">الارتفاع</Label>
                <Input className="col-span-2 h-8" defaultValue="25px" id="height" />
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="maxHeight">أقصى ارتفاع</Label>
                <Input className="col-span-2 h-8" defaultValue="none" id="maxHeight" />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </DirectionProvider>
  )
}
