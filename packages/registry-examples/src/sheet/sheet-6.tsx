import { Button } from '@gentleduck/registry-ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@gentleduck/registry-ui/sheet'

export default function Demo() {
  return (
    <div className="flex gap-2">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Wide</Button>
        </SheetTrigger>
        <SheetContent className="sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Release notes</SheetTitle>
            <SheetDescription>A side sheet stops at a small width unless its class lifts the cap.</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Short</Button>
        </SheetTrigger>
        <SheetContent className="h-1/3" side="bottom">
          <SheetHeader>
            <SheetTitle>Cookie settings</SheetTitle>
            <SheetDescription>A top or bottom sheet takes a height class.</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  )
}
