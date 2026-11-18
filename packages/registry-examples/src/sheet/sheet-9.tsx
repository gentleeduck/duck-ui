import { Button } from '@gentleduck/registry-ui/button'
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
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Order</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Order 1042</SheetTitle>
          <SheetDescription>Two items, paid by card.</SheetDescription>
        </SheetHeader>
        <Sheet>
          <SheetTrigger asChild>
            <Button className="self-start" variant="secondary">
              Show the customer
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-xs">
            <SheetHeader>
              <SheetTitle>Ada Lovelace</SheetTitle>
              <SheetDescription>Escape closes this sheet and leaves the order open.</SheetDescription>
            </SheetHeader>
            <SheetFooter className="mt-auto">
              <SheetClose asChild>
                <Button variant="outline">Back to the order</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </SheetContent>
    </Sheet>
  )
}
