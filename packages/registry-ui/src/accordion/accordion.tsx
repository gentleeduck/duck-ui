'use client'

import { cn } from '@gentleduck/libs/cn'
import * as AccordionPrimitive from '@gentleduck/primitives/accordion'
import { ChevronDown } from 'lucide-react'
import * as React from 'react'

const AccordionRenderOnceContext = React.createContext(false)

export type IAccordionProps = AccordionPrimitive.IAccordion.IProps & {
  renderOnce?: boolean
}

export type AccordionProps = IAccordionProps

const Accordion = React.forwardRef<HTMLDivElement, IAccordionProps>(
  ({ className, renderOnce = false, ...props }, ref) => (
    <AccordionRenderOnceContext.Provider value={renderOnce}>
      <AccordionPrimitive.Root ref={ref} className={cn('min-w-100 font-sans not-italic', className)} {...props} />
    </AccordionRenderOnceContext.Provider>
  ),
)
Accordion.displayName = 'Accordion'

const AccordionItem = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>>(
  ({ className, ...props }, ref) => (
    <AccordionPrimitive.Item
      ref={ref}
      className={cn('group overflow-hidden border-border border-b', className)}
      {...props}
    />
  ),
)
AccordionItem.displayName = 'AccordionItem'

const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> & {
    icon?: React.ReactNode
  }
>(({ className, children, icon, ...props }, ref) => {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={cn(
          'group/accordion-trigger flex w-full cursor-pointer select-none items-center justify-between py-4 text-start font-medium font-sans text-base not-italic ring-offset-background transition-[color,background-color,border-color,box-shadow] hover:underline focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          className,
        )}
        {...props}>
        <span>{children}</span>
        <AccordionPrimitive.Indicator
          className="[&>svg:not([class*=size-])]:size-4 [&>svg]:shrink-0 [&>svg]:transition-transform [&>svg]:duration-200 [&>svg]:ease-(--gentleduck-motion-ease) data-[state=open]:[&>svg]:rotate-180"
          data-slot="accordion-icon">
          {icon ?? <ChevronDown />}
        </AccordionPrimitive.Indicator>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
})
AccordionTrigger.displayName = 'AccordionTrigger'

const AccordionContent = React.forwardRef<
  HTMLDivElement,
  Omit<React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>, 'asChild' | 'forceMount' | 'hiddenUntilFound'>
>(({ className, children, ...props }, ref) => {
  const renderOnce = React.useContext(AccordionRenderOnceContext)
  const { open } = AccordionPrimitive.useAccordionItemContext('AccordionContent', undefined)
  const [hasOpened, setHasOpened] = React.useState(open)
  if (open && !hasOpened) setHasOpened(true)

  return (
    <AccordionPrimitive.Content
      ref={ref}
      hiddenUntilFound={!renderOnce || hasOpened}
      className={cn(
        // tw-animate-css's accordion keyframes read the Radix name for the height.
        'overflow-hidden font-sans text-base not-italic [--radix-accordion-content-height:var(--gentleduck-accordion-content-height)]',
        'data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down',
        'animation-duration-200 data-[state=closed]:animation-duration-150 ease-(--gentleduck-motion-ease)',
        'motion-reduce:animate-none',
        className,
      )}
      {...props}>
      <div className="pt-0 pb-4">{children}</div>
    </AccordionPrimitive.Content>
  )
})
AccordionContent.displayName = 'AccordionContent'

export { Accordion, AccordionContent, AccordionItem, AccordionRenderOnceContext, AccordionTrigger }
