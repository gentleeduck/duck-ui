import * as React from 'react'

import { buttonVariants } from './button.constants'
import { AnimationIconProps, ButtonProps } from './button.types'
import { Slot } from '@gentleduck/aria-feather/slot'

import { cn } from '@gentleduck/libs/cn'
import { Loader } from 'lucide-react'

// TODO: make button customizable to the max (icon, width, sizes, etc...)

/**
 * Renders a customizable button component, supporting various styles and behaviors.
 *
 * @param {ButtonProps} props - The props for the button component.
 * @param {React.ReactNode} [props.children] - The content to be displayed inside the button.
 * @param {string} [props.variant] - The visual style variant of the button.
 * @param {string} [props.size] - The size of the button, can be overridden to 'icon' if collapsed.
 * @param {string} [props.border] - The border style of the button.
 * @param {boolean} [props.asChild] - If true, renders the button as a child component.
 * @param {string} [props.className] - Additional custom class names for styling.
 * @param {object} [props.label] - Configuration for the button's label, including display options.
 * @param {boolean} [props.loading] - Indicates if the button should show a loading spinner.
 * @param {boolean} [props.isCollapsed] - If true, the button is rendered in a collapsed state.
 * @param {React.ReactNode} [props.icon] - An icon to be displayed inside the button.
 * @param {React.ReactNode} [props.secondIcon] - An optional second icon inside the button.
 * @param {React.Ref<HTMLButtonElement>} [props.ref] - A ref to the button element.
 * @param {object} [...props] - Additional props pdocsassed to the button component.
 *
 * @returns {React.JSX.Element} A button element with the specified configurations.
 */
function Button({
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
  disabled,
  ref,
  ...props
}: ButtonProps & { ref?: React.Ref<HTMLButtonElement> }): React.JSX.Element {
  const Component = (asChild ? Slot : 'button') as React.ElementType

  const Button = (
    <Component
      {...props}
      ref={ref}
      className={cn(
        buttonVariants({
          variant,
          size: isCollapsed ? 'icon' : size,
          border,
          className,
        }),
      )}
      disabled={loading ?? disabled}>
      <div className="flex items-center justify-between w-full gap-2">
        {!isCollapsed && children}
        {!isCollapsed && secondIcon && secondIcon}
        {loading ? <Loader className="animate-spin" /> : icon}
      </div>
    </Component>
  )

  return Button
}

/**
 * Renders an animation icon component.
 *
 * @param {AnimationIconProps} props - The props for the animation icon component.
 * @param {React.ReactNode} props.children - The content to be displayed inside the animation icon.
 * @param {{icon?: React.ReactNode, iconPlacement?: 'left' | 'right'}} props.animationIcon - Configuration for the animation icon, including the icon and placement.
 * @param {React.ReactNode} props.animationIcon.icon - The icon to be displayed inside the animation icon.
 * @param {'left' | 'right'} props.animationIcon.iconPlacement - The placement of the icon inside the animation icon.
 *
 * @returns {React.JSX.Element} An animation icon component with the specified configurations.
 */
function AnimationIcon({ children, animationIcon }: AnimationIconProps): React.JSX.Element {
  return (
    <>
      {animationIcon?.icon && animationIcon.iconPlacement === 'left' && (
        <div className="w-0 translate-x-[-1.3em] pr-0 opacity-0 transition-all duration-200 group-hover:w-5 group-hover:-translate-x-1 group-hover:pr-2 group-hover:opacity-100">
          {animationIcon?.icon}
        </div>
      )}
      {children}
      {animationIcon?.icon && animationIcon.iconPlacement === 'right' && (
        <div className="w-0 translate-x-[1.3em] pl-0 opacity-0 transition-all duration-200 group-hover:w-5 group-hover:translate-x-0 group-hover:pl-2 group-hover:opacity-100">
          {animationIcon?.icon}
        </div>
      )}
    </>
  )
}

export { Button, AnimationIcon }
