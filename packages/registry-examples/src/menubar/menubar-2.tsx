'use client'

import { DirectionProvider } from '@gentleduck/registry-ui/direction'
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from '@gentleduck/registry-ui/menubar'
import * as React from 'react'

export default function Demo() {
  const [showBookmarks, setShowBookmarks] = React.useState(false)
  const [showFullUrls, setShowFullUrls] = React.useState(true)
  const [profile, setProfile] = React.useState('ahmad')

  return (
    <DirectionProvider dir="rtl">
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>ملف</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>
              علامة تبويب جديدة
              <MenubarShortcut>⌘T</MenubarShortcut>
            </MenubarItem>
            <MenubarItem>
              نافذة جديدة
              <MenubarShortcut>⌘N</MenubarShortcut>
            </MenubarItem>
            <MenubarItem disabled>نافذة جديدة للتصفح المتخفي</MenubarItem>
            <MenubarSeparator />
            <MenubarSub>
              <MenubarSubTrigger>مشاركة</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem>رابط عبر البريد الإلكتروني</MenubarItem>
                <MenubarItem>الرسائل</MenubarItem>
                <MenubarItem>الملاحظات</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
            <MenubarSeparator />
            <MenubarItem>
              طباعة... <MenubarShortcut>⌘P</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>تحرير</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>
              تراجع <MenubarShortcut>⌘Z</MenubarShortcut>
            </MenubarItem>
            <MenubarItem>
              إعادة <MenubarShortcut>⇧⌘Z</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarSub>
              <MenubarSubTrigger>بحث</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem>البحث في الويب</MenubarItem>
                <MenubarSeparator />
                <MenubarItem>بحث...</MenubarItem>
                <MenubarItem>البحث عن التالي</MenubarItem>
                <MenubarItem>البحث عن السابق</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
            <MenubarSeparator />
            <MenubarItem>قص</MenubarItem>
            <MenubarItem>نسخ</MenubarItem>
            <MenubarItem>لصق</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>عرض</MenubarTrigger>
          <MenubarContent>
            <MenubarCheckboxItem checked={showBookmarks} onCheckedChange={setShowBookmarks}>
              إظهار شريط الإشارات دائمًا
            </MenubarCheckboxItem>
            <MenubarCheckboxItem checked={showFullUrls} onCheckedChange={setShowFullUrls}>
              إظهار الروابط كاملة دائمًا
            </MenubarCheckboxItem>
            <MenubarSeparator />
            <MenubarItem inset>
              إعادة التحميل <MenubarShortcut>⌘R</MenubarShortcut>
            </MenubarItem>
            <MenubarItem disabled inset>
              فرض إعادة التحميل <MenubarShortcut>⇧⌘R</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem inset>تبديل وضع ملء الشاشة</MenubarItem>
            <MenubarSeparator />
            <MenubarItem inset>إخفاء الشريط الجانبي</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>الملفات الشخصية</MenubarTrigger>
          <MenubarContent>
            <MenubarRadioGroup value={profile} onValueChange={setProfile}>
              <MenubarRadioItem value="ali">علي</MenubarRadioItem>
              <MenubarRadioItem value="ahmad">أحمد</MenubarRadioItem>
              <MenubarRadioItem value="omar">عمر</MenubarRadioItem>
            </MenubarRadioGroup>
            <MenubarSeparator />
            <MenubarItem inset>تعديل...</MenubarItem>
            <MenubarSeparator />
            <MenubarItem inset>إضافة ملف شخصي...</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </DirectionProvider>
  )
}
