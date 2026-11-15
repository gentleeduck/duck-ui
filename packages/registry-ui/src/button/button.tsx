'use client'
import { cn } from '@gentleduck/libs/cn'
import { Slot, Slottable } from '@gentleduck/primitives/slot'
import { Loader } from 'lucide-react'
import * as React from 'react'
import { buttonVariants } from './button.constants'
import type { AnimationIconProps, ButtonProps } from './button.types'

/** A link cannot be disabled, so its click is stopped before anyone hears it. Enter on a link is a click too. */
export function stopClick(event: React.MouseEvent) {
  event.preventDefault()
  event.stopPropagation()
}

/** Slot lets its child's own props win, and runs the child's handler first, so the child itself is told it is held. */
export function holdChild(children: React.ReactNode, loading: boolean) {
  if (!React.isValidElement<React.HTMLAttributes<HTMLElement>>(children)) return children
  return React.cloneElement(children, {
    'aria-disabled': true,
    onClickCapture: stopClick,
    ...(loading ? { 'aria-busy': true } : {}),
  })
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'default',
      size = 'default',
      border = 'default',
      asChild,
      className,
      loading,
      isCollapsed,
      icon,
      secondIcon,
      type = 'button',
      disabled,
      ...props
    },
    ref,
  ) => {
    const buttonClass = cn(
      buttonVariants({
        border,
        className,
        size: isCollapsed ? 'icon' : size,
        variant,
      }),
    )

    if (asChild) {
      const isDisabled = Boolean(loading) || Boolean(disabled)
      return (
        <Slot
          data-slot="button"
          {...props}
          aria-busy={loading ? true : undefined}
          aria-disabled={isDisabled ? true : props['aria-disabled']}
          className={buttonClass}
          onClickCapture={isDisabled ? stopClick : props.onClickCapture}
          ref={ref}>
          {isDisabled ? holdChild(children, Boolean(loading)) : children}
        </Slot>
      )
    }

    return (
      <button
        data-slot="button"
        {...props}
        aria-busy={loading ? true : undefined}
        className={buttonClass}
        disabled={Boolean(loading) || disabled}
        ref={ref}
        type={type}>
        {loading ? <Loader aria-hidden="true" className="animate-spin motion-reduce:animate-none" /> : icon}
        <Slottable>{!isCollapsed && children}</Slottable>
        {!isCollapsed && secondIcon && secondIcon}
      </button>
    )
  },
)
Button.displayName = 'Button'

function AnimationIcon({ children, animationIcon }: AnimationIconProps): React.JSX.Element {
  return (
    <>
      {animationIcon?.icon && animationIcon.iconPlacement === 'left' && (
        <div className="w-0 pe-0 opacity-0 transition-[width,padding,opacity,translate] duration-200 ease-(--gentleduck-motion-ease) group-hover:w-5 group-hover:pe-2 group-hover:opacity-100 ltr:translate-x-[-1.3em] ltr:group-hover:-translate-x-1 rtl:translate-x-[1.3em] rtl:group-hover:translate-x-1">
          {animationIcon?.icon}
        </div>
      )}
      {children}
      {animationIcon?.icon && animationIcon.iconPlacement === 'right' && (
        <div className="w-0 ps-0 opacity-0 transition-[width,padding,opacity,translate] duration-200 ease-(--gentleduck-motion-ease) group-hover:w-5 group-hover:translate-x-0 group-hover:ps-2 group-hover:opacity-100 ltr:translate-x-[1.3em] rtl:translate-x-[-1.3em]">
          {animationIcon?.icon}
        </div>
      )}
    </>
  )
}
AnimationIcon.displayName = 'AnimationIcon'

export { AnimationIcon, Button }
