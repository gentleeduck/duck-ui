'use client'

import { cn } from '@gentleduck/libs/cn'
import { useSvgIndicator } from '@gentleduck/primitives/checkers'
import * as RadioGroupPrimitive from '@gentleduck/primitives/radio-group'
import * as React from 'react'

const RadioGroup = React.forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return <RadioGroupPrimitive.Root className={cn('flex flex-col gap-2', className)} ref={ref} {...props} />
})
RadioGroup.displayName = 'RadioGroup'

const RadioGroupItem = React.forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> & {
    indicator?: React.ReactElement
    checkedIndicator?: React.ReactElement
  }
>(({ className, indicator, checkedIndicator, children, textValue, id, style, ...props }, ref) => {
  const { indicatorReady, checkedIndicatorReady, inputStyle, SvgIndicator } = useSvgIndicator({
    checkedIndicator,
    indicator,
  })
  const generatedId = React.useId()
  const itemId = id ?? generatedId
  const resolvedTextValue =
    textValue ?? (typeof children === 'string' || typeof children === 'number' ? String(children) : undefined)

  const indicatorStateClass = cn(
    indicatorReady &&
      'after:mask-[var(--svg-off)] after:scale-100 after:bg-muted-foreground after:opacity-100 data-[state=checked]:after:bg-current',
    checkedIndicatorReady
      ? 'data-[state=checked]:after:mask-[var(--svg-on)]'
      : indicatorReady && 'data-[state=checked]:after:mask-none',
  )

  return (
    <div className="group/radio flex items-center gap-2">
      <RadioGroupPrimitive.Item
        id={itemId}
        className={cn(
          // Underlying primitive is a <button>, so we key off data-[state=checked] instead of :checked
          'relative m-0 flex size-[1em] appearance-none items-center rounded-full p-2',
          'border border-border bg-border text-primary-foreground data-[state=checked]:border-primary data-[state=checked]:bg-primary',
          'ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'data-disabled:cursor-not-allowed data-disabled:opacity-50',
          'after:mask-type-alpha after:mask-contain after:absolute after:block after:size-[1em] after:rounded-[inherit] after:bg-current after:drop-shadow',
          'after:opacity-0 data-[state=checked]:after:opacity-100',
          'justify-center after:text-[10px]',
          'after:scale-0 data-[state=checked]:after:scale-100',
          indicatorStateClass,
          'transition-[color,background-color,border-color,box-shadow,opacity] duration-200 ease-(--gentleduck-motion-ease)',
          '[&:before,&:after]:transition-[opacity,transform,translate,scale,rotate] [&:before,&:after]:duration-[inherit] [&:before,&:after]:ease-[inherit]',
          className,
        )}
        ref={ref}
        style={{ ...style, ...inputStyle }}
        textValue={resolvedTextValue}
        {...props}
      />
      <SvgIndicator />
      {children || children === 0 ? (
        <label
          className="cursor-pointer font-normal text-base group-has-disabled/radio:cursor-not-allowed group-has-disabled/radio:opacity-70"
          data-slot="radio-label"
          htmlFor={itemId}>
          {children}
        </label>
      ) : null}
    </div>
  )
})
RadioGroupItem.displayName = 'RadioGroupItem'

export { RadioGroup, RadioGroupItem }
