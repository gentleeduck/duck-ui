import DialogPrimitive, { useDialogContext } from '@gentleduck/aria-feather/dialog'
import { cn } from '@gentleduck/libs/cn'
import { AnimDialogModalVariants, AnimDialogVariants, AnimVariants } from '@gentleduck/motion/anim'
import { X } from 'lucide-react'
import type React from 'react'
import { Button } from '../button'
import { DialogContentProps } from './dialog.types'

function Dialog({ closeButton = true, ...props }: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root closeButton={closeButton} {...props} />
}

function DialogTrigger({
  children,
  asChild,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger> & React.ComponentPropsWithoutRef<typeof Button>) {
  return (
    <DialogPrimitive.Trigger>
      <Button {...props} asChild={asChild}>
        {children}
      </Button>
    </DialogPrimitive.Trigger>
  )
}

function DialogClose({
  ref,
  size = 16,
  children,
  className,
  ...props
}: React.HTMLProps<HTMLButtonElement> & {
  size?: number
}): React.JSX.Element {
  const { onOpenChange } = useDialogContext()

  return (
    <button
      {...props}
      ref={ref}
      type="button"
      aria-label="close"
      className={cn(
        'absolute end-3 top-3 size-4 cursor-pointer rounded text-accent-foreground opacity-70 transition-all hover:opacity-100',
        className,
      )}
      onClick={() => onOpenChange?.(false)}>
      {children ?? <X aria-hidden size={size} />}
    </button>
  )
}

/**
 * DialogContent component renders the content of a dialog.
 * It supports additional class names and props to customize the
 * appearance and behavior of the content. The component uses
 * a flexbox layout to arrange its children in a vertical column
 * and applies responsive text alignment.
 *
 * @param {DialogContentProps} props - The properties passed to the component.
 * @param {React.RefObject<HTMLDivElement>} [props.ref] - The ref to be forwarded to the component.
 *
 * @returns {React.JSX.Element} The rendered DialogContent component.
 */
function DialogContent({
  children,
  className,
  renderOnce = false,
  overlay = 'default',
  closedby = 'any',
  animation = 'default',
  ...props
}: DialogContentProps): React.JSX.Element {
  return (
    <DialogPrimitive.Content
      dialogClose={DialogClose}
      className={cn(
        AnimVariants({ overlay: overlay }),
        AnimDialogVariants({ animation: animation }),
        AnimDialogModalVariants(),
        className,
        'overflow-hidden',
      )}
      {...props}>
      <div className="flex flex-col gap-4">{children}</div>
    </DialogPrimitive.Content>
  )
}

/**
 * DialogHeader component renders a header section for a dialog.
 * It supports additional class names and props to customize the
 * appearance and behavior of the header. The component uses a
 * flexbox layout to arrange its children in a vertical column
 * and applies responsive text alignment.
 *
 * @param {React.HTMLProps<HTMLDivElement>} props - The properties passed to the component.
 * @param {React.RefObject<HTMLDivElement>} [props.ref] - The ref to be forwarded to the component.
 *
 * @returns {React.JSX.Element} The rendered DialogHeader component.
 */
function DialogHeader({ className, ref, ...props }: React.HTMLProps<HTMLDivElement>): React.JSX.Element {
  return <div ref={ref} className={cn('flex flex-col gap-1.5 text-left rtl:text-right', className)} {...props} />
}

/**
 * DialogFooter component renders a footer section for a dialog.
 * It supports additional class names and props to customize the
 * appearance and behavior of the footer. The component uses a
 * flexbox layout to arrange its children in a column on small
 * screens and in a row with space between items on larger screens.
 *
 * @param {React.HTMLProps<HTMLDivElement>} props - The properties passed to the component.
 * @param {React.RefObject<HTMLDivElement>} [props.ref] - The ref to be forwarded to the component.
 *
 * @returns {React.JSX.Element} The rendered DialogFooter component.
 */
function DialogFooter({ className, ref, ...props }: React.HTMLProps<HTMLDivElement>): React.JSX.Element {
  return (
    <div ref={ref} className={cn(`flex flex-col-reverse gap-2 sm:flex-row sm:justify-end`, className)} {...props} />
  )
}

/**
 * `DialogTitle` is a React component that forwards its ref to the `DialogTitle` component.
 * It accepts all props that `DialogTitle` accepts, along with an optional `className` prop
 * to customize its styling.
 *
 * @param {React.HTMLProps<HTMLHeadingElement>} props - The properties passed to the component.
 * @param {React.RefObject<HTMLHeadingElement>} [props.ref] - A ref that will be forwarded to the `DialogTitle` component.
 *
 * @returns {React.JSX.Element} The rendered `DialogTitle` component with forwarded ref and applied props.
 */
function DialogTitle({ className, ref, ...props }: React.HTMLProps<HTMLHeadingElement>): React.JSX.Element {
  return <h2 ref={ref} className={cn('font-semibold text-lg leading-none tracking-tight', className)} {...props} />
}

/**
 * `DialogDescription` is a React component that forwards its ref to the `DialogDescription` component.
 * It applies additional class names to style the description text.
 *
 * @param {React.HTMLProps<HTMLParagraphElement>} props - The properties passed to the component.
 * @param {React.RefObject<HTMLParagraphElement>} [props.ref] - The ref to be forwarded to the `DialogDescription` component.
 *
 * @returns {React.JSX.Element} The rendered `DialogDescription` component with forwarded ref and applied class names.
 */
const DialogDescription = ({ className, ref, ...props }: React.HTMLProps<HTMLParagraphElement>): React.JSX.Element => (
  <p ref={ref} className={cn('text-muted-foreground text-sm', className)} {...props} />
)

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose }
