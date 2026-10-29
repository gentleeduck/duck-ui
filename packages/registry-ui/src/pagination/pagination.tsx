import { cn } from '@gentleduck/libs/cn'
import { useDirection } from '@gentleduck/primitives/direction'
import type { IPagination } from '@gentleduck/primitives/pagination'
import * as PaginationPrimitive from '@gentleduck/primitives/pagination'
import {
  ChevronLeft,
  ChevronLeftIcon,
  ChevronRight,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  type LucideIcon,
  MoreHorizontal,
} from 'lucide-react'
import * as React from 'react'
import { Button, buttonVariants } from '../button'
import { toDirection } from '../direction/direction.libs'
import type { IDuckPaginationProps, IPaginationLinkProps } from './pagination.types'

const Pagination = React.forwardRef<
  React.ComponentRef<typeof PaginationPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof PaginationPrimitive.Root>
>(({ className, ...props }, ref) => (
  <PaginationPrimitive.Root className={cn('mx-auto flex w-full justify-center', className)} ref={ref} {...props} />
))
Pagination.displayName = 'Pagination'

const PaginationContent = React.forwardRef<
  React.ComponentRef<typeof PaginationPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PaginationPrimitive.Content>
>(({ className, ...props }, ref) => (
  <PaginationPrimitive.Content className={cn('flex flex-row items-center gap-1', className)} ref={ref} {...props} />
))
PaginationContent.displayName = 'PaginationContent'

const PaginationItem = React.forwardRef<
  React.ComponentRef<typeof PaginationPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof PaginationPrimitive.Item>
>(({ className, ...props }, ref) => <PaginationPrimitive.Item className={cn(className)} ref={ref} {...props} />)
PaginationItem.displayName = 'PaginationItem'

const PaginationLink = React.forwardRef<HTMLAnchorElement, IPaginationLinkProps>(
  ({ className, isActive, size = 'icon', ...props }, ref) => (
    <a
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        buttonVariants({
          size,
          variant: isActive ? 'outline' : 'ghost',
        }),
        className,
      )}
      data-slot="pagination-link"
      ref={ref}
      {...props}
    />
  ),
)
PaginationLink.displayName = 'PaginationLink'

const PaginationPrevious = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<typeof PaginationLink> & { text?: string }
>(({ className, text = 'Previous', ...props }, ref) => (
  <PaginationLink
    aria-label="Go to previous page"
    className={cn('gap-1 ps-2.5', className)}
    data-slot="pagination-previous"
    ref={ref}
    {...props}
    size="default">
    <ChevronLeft aria-hidden="true" className="size-4 rtl:rotate-180" />
    <span className="hidden sm:block">{text}</span>
  </PaginationLink>
))
PaginationPrevious.displayName = 'PaginationPrevious'

const PaginationNext = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<typeof PaginationLink> & { text?: string }
>(({ className, text = 'Next', ...props }, ref) => (
  <PaginationLink
    aria-label="Go to next page"
    className={cn('gap-1 pe-2.5', className)}
    data-slot="pagination-next"
    ref={ref}
    {...props}
    size="default">
    <span className="hidden sm:block">{text}</span>
    <ChevronRight aria-hidden="true" className="size-4 rtl:rotate-180" />
  </PaginationLink>
))
PaginationNext.displayName = 'PaginationNext'

const PaginationEllipsis = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<'span'> & { text?: string }
>(({ className, text = 'More pages', ...props }, ref) => (
  <span
    role="img"
    aria-label={text}
    className={cn('flex size-9 items-center justify-center', className)}
    data-slot="pagination-ellipsis"
    ref={ref}
    {...props}>
    <MoreHorizontal aria-hidden="true" className="size-4" />
  </span>
))
PaginationEllipsis.displayName = 'PaginationEllipsis'

const PaginationPage = React.forwardRef<
  React.ComponentRef<typeof PaginationPrimitive.Page>,
  React.ComponentPropsWithoutRef<typeof PaginationPrimitive.Page>
>(({ className, ...props }, ref) => (
  <PaginationPrimitive.Page
    className={cn(
      buttonVariants({ size: 'icon', variant: 'ghost' }),
      'data-selected:border data-selected:border-input data-selected:bg-background data-selected:shadow-xs',
      className,
    )}
    ref={ref}
    {...props}
  />
))
PaginationPage.displayName = 'PaginationPage'

const renderPages = (items: IPagination.IRangeItem[]) =>
  items.map((item) => (
    <PaginationItem key={item}>
      {typeof item === 'number' ? <PaginationPage value={item} /> : <PaginationEllipsis />}
    </PaginationItem>
  ))

/** The root's pages, each in an item, with the ellipsis the same size as a page so the controls never shift. */
const PaginationPages = ({ children = renderPages }: IPagination.IPagesProps) => (
  <PaginationPrimitive.Pages>{children}</PaginationPrimitive.Pages>
)

function createTrigger(Trigger: typeof PaginationPrimitive.Next, Icon: LucideIcon, displayName: string) {
  const PaginationTrigger = React.forwardRef<
    React.ComponentRef<typeof Trigger>,
    React.ComponentPropsWithoutRef<typeof Trigger>
  >(({ className, children, ...props }, ref) => (
    <Trigger className={cn(buttonVariants({ size: 'icon', variant: 'ghost' }), className)} ref={ref} {...props}>
      {children ?? <Icon aria-hidden="true" className="rtl:rotate-180" />}
    </Trigger>
  ))
  PaginationTrigger.displayName = displayName
  return PaginationTrigger
}

const PaginationFirstTrigger = createTrigger(PaginationPrimitive.First, ChevronsLeftIcon, 'PaginationFirstTrigger')
const PaginationPreviousTrigger = createTrigger(
  PaginationPrimitive.Previous,
  ChevronLeftIcon,
  'PaginationPreviousTrigger',
)
const PaginationNextTrigger = createTrigger(PaginationPrimitive.Next, ChevronRightIcon, 'PaginationNextTrigger')
const PaginationLastTrigger = createTrigger(PaginationPrimitive.Last, ChevronsRightIcon, 'PaginationLastTrigger')

const PaginationWrapper = (props: IDuckPaginationProps) => {
  const { className: wrapperClassName, dir, ...wrapperProps } = props.wrapper ?? {}
  const { className: contentClassName, ...contentProps } = props.content ?? {}
  const { className: itemClassName, ...itemProps } = props.item ?? {}
  const { className: rightClassName, icon: rightIcon, ...rightProps } = props.right ?? {}
  const { className: maxRightClassName, icon: maxRightIcon, ...maxRightProps } = props.maxRight ?? {}
  const { className: leftClassName, icon: leftIcon, ...leftProps } = props.left ?? {}
  const { className: maxLeftClassName, icon: maxLeftIcon, ...maxLeftProps } = props.maxLeft ?? {}
  const direction = useDirection(toDirection(dir))
  const StartIcon = direction === 'rtl' ? ChevronRightIcon : ChevronLeftIcon
  const EndIcon = direction === 'rtl' ? ChevronLeftIcon : ChevronRightIcon
  const StartDoubleIcon = direction === 'rtl' ? ChevronsRightIcon : ChevronsLeftIcon
  const EndDoubleIcon = direction === 'rtl' ? ChevronsLeftIcon : ChevronsRightIcon

  return (
    <Pagination className={cn('justify-end', wrapperClassName)} dir={direction} {...wrapperProps}>
      <PaginationContent className={cn('gap-2', contentClassName)} {...contentProps}>
        <PaginationItem className={cn(itemClassName)} {...itemProps}>
          <Button
            aria-label="Go to first page"
            className={cn('w-[32px] p-0', maxLeftClassName)}
            icon={maxLeftIcon === undefined ? <StartDoubleIcon aria-hidden="true" /> : maxLeftIcon}
            size="sm"
            variant="outline"
            {...maxLeftProps}
          />
        </PaginationItem>
        <PaginationItem className={cn(itemClassName)} {...itemProps}>
          <Button
            aria-label="Go to previous page"
            className={cn('w-[32px] p-0', leftClassName)}
            icon={leftIcon === undefined ? <StartIcon aria-hidden="true" /> : leftIcon}
            size="sm"
            variant="outline"
            {...leftProps}
          />
        </PaginationItem>
        <PaginationItem className={cn(itemClassName)} {...itemProps}>
          <Button
            aria-label="Go to next page"
            className={cn('w-[32px] p-0', rightClassName)}
            icon={rightIcon === undefined ? <EndIcon aria-hidden="true" /> : rightIcon}
            size="sm"
            variant="outline"
            {...rightProps}
          />
        </PaginationItem>
        <PaginationItem className={cn(itemClassName)} {...itemProps}>
          <Button
            aria-label="Go to last page"
            className={cn('w-[32px] p-0', maxRightClassName)}
            icon={maxRightIcon === undefined ? <EndDoubleIcon aria-hidden="true" /> : maxRightIcon}
            size="sm"
            variant="outline"
            {...maxRightProps}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationFirstTrigger,
  PaginationItem,
  PaginationLastTrigger,
  PaginationLink,
  PaginationNext,
  PaginationNextTrigger,
  PaginationPage,
  PaginationPages,
  PaginationPrevious,
  PaginationPreviousTrigger,
  PaginationWrapper,
}
