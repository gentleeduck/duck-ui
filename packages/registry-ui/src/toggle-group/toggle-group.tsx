'use client'

import { cn } from '@gentleduck/libs/cn'
import * as ToggleGroupPrimitive from '@gentleduck/primitives/toggle-group'
import type { Variants } from '@gentleduck/variants'
import * as React from 'react'
import { toggleVariants } from '../toggle/toggle.constants'

interface IToggleGroupContextProps extends Variants.VariantProps<typeof toggleVariants> {
  type?: 'single' | 'multiple'
}

const ToggleGroupContext = React.createContext<IToggleGroupContextProps>({
  size: 'default',
  variant: 'default',
})

type ToggleGroupElement = React.ComponentRef<typeof ToggleGroupPrimitive.Root>
type IToggleGroupProps = React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> &
  Variants.VariantProps<typeof toggleVariants>
type ToggleGroupProps = IToggleGroupProps

const ToggleGroup: React.ForwardRefExoticComponent<IToggleGroupProps & React.RefAttributes<ToggleGroupElement>> =
  React.forwardRef<ToggleGroupElement, IToggleGroupProps>(
    ({ className, variant = 'default', size = 'default', children, ...props }, ref) => {
      const { type } = props
      const vertical = props.orientation === 'vertical'
      const contextValue = React.useMemo<IToggleGroupContextProps>(
        () => ({ size, type, variant }),
        [size, type, variant],
      )
      return (
        <ToggleGroupContext.Provider value={contextValue}>
          <ToggleGroupPrimitive.Root
            className={cn(
              'isolate flex rounded-md',
              vertical
                ? 'flex-col items-stretch *:first:rounded-t-md *:last:rounded-b-md'
                : 'items-center justify-center *:first:rounded-s-md *:last:rounded-e-md',
              variant === 'outline' &&
                (vertical ? '[&>*:not(:last-child)]:border-b-0' : '[&>*:not(:last-child)]:border-e-0'),
              className,
            )}
            ref={ref}
            {...props}>
            {children}
          </ToggleGroupPrimitive.Root>
        </ToggleGroupContext.Provider>
      )
    },
  )
ToggleGroup.displayName = 'ToggleGroup'

type ToggleGroupItemElement = React.ComponentRef<typeof ToggleGroupPrimitive.Item>
type IToggleGroupItemProps = React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item> &
  Variants.VariantProps<typeof toggleVariants>
type ToggleGroupItemProps = IToggleGroupItemProps
const ToggleGroupItem: React.ForwardRefExoticComponent<
  IToggleGroupItemProps & React.RefAttributes<ToggleGroupItemElement>
> = React.forwardRef<ToggleGroupItemElement, IToggleGroupItemProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    const context = React.useContext(ToggleGroupContext)

    return (
      <ToggleGroupPrimitive.Item
        className={cn(
          toggleVariants({ variant: variant || context.variant, size: size || context.size }),
          'relative rounded-none focus-visible:z-10 focus-visible:ring-offset-0',
          className,
        )}
        ref={ref}
        {...props}>
        {children}
      </ToggleGroupPrimitive.Item>
    )
  },
)
ToggleGroupItem.displayName = 'ToggleGroupItem'

export type {
  IToggleGroupContextProps,
  IToggleGroupItemProps,
  IToggleGroupProps,
  ToggleGroupElement,
  ToggleGroupItemElement,
  ToggleGroupItemProps,
  ToggleGroupProps,
}
export { ToggleGroup, ToggleGroupContext, ToggleGroupItem }
