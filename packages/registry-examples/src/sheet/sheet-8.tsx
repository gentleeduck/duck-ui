import { Button } from '@gentleduck/registry-ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@gentleduck/registry-ui/sheet'

const CHAPTERS = Array.from({ length: 30 }, (_, index) => `Chapter ${index + 1}`)

export default function Demo() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Contents</Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Contents</SheetTitle>
          <SheetDescription>The list scrolls, and the header and footer stay put.</SheetDescription>
        </SheetHeader>
        <nav aria-label="Chapters" className="-mx-6 min-h-0 flex-1 overflow-y-auto px-6">
          <ul className="grid gap-1 text-sm">
            {CHAPTERS.map((chapter) => (
              <li key={chapter}>
                <a className="block rounded-md px-2 py-1.5 hover:bg-accent" href={`#${chapter.replace(' ', '-')}`}>
                  {chapter}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <SheetFooter>
          <Button variant="secondary">Download the book</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
