'use client'

import { Button } from '@gentleduck/registry-ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@gentleduck/registry-ui/dialog'

const TERMS = [
  ['Your account', 'You keep your password to yourself and tell us when someone else may have it.'],
  ['What you post', 'You own what you upload. You let us store it and show it to the people you share it with.'],
  ['What we keep', 'We keep your files while your account is open, and for 30 days after you close it.'],
  ['Payment', 'A paid plan renews each month until you cancel it. A cancelled plan runs to the end of its month.'],
  ['Refunds', 'We refund a plan cancelled within 14 days of its first payment, and none after that.'],
  ['Fair use', 'You do not use the service to send spam, to break the law, or to slow it down for others.'],
  ['Changes', 'We tell you a month before these terms change. Using the service after that accepts them.'],
  ['Ending', 'You can close your account at any time. We close one that breaks these terms, after a warning.'],
] as const

export default function Demo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Read the terms</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[min(32rem,85vh)] grid-rows-[auto_minmax(0,1fr)_auto]">
        <DialogHeader>
          <DialogTitle>Terms of service</DialogTitle>
          <DialogDescription>The terms scroll inside the dialog, and the page behind it stays put.</DialogDescription>
        </DialogHeader>
        <section
          aria-label="Terms"
          className="-mx-6 overflow-y-auto px-6 text-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
          // biome-ignore lint/a11y/noNoninteractiveTabindex: the terms hold nothing focusable, so without Tab a keyboard cannot scroll them
          tabIndex={0}>
          {TERMS.map(([heading, text]) => (
            <div className="mb-4" key={heading}>
              <h3 className="mb-1 font-medium">{heading}</h3>
              <p className="text-muted-foreground">{text}</p>
            </div>
          ))}
        </section>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Decline</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button>Accept</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
