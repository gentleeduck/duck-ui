'use client'

import { cn } from '@gentleduck/libs/cn'
import { useDirection } from '@gentleduck/primitives/direction'
import type { Variants } from '@gentleduck/variants'
import React, { useMemo } from 'react'
import { toDirection } from '../direction/direction.libs'
import { Label } from '../label'
import { Separator } from '../separator'
import { fieldVariants } from './field.constants'

const FieldSet = React.forwardRef<HTMLFieldSetElement, React.ComponentPropsWithoutRef<'fieldset'>>(
  ({ className, dir, ...props }, ref) => {
    const direction = useDirection(toDirection(dir))
    return (
      <fieldset
        ref={ref}
        className={cn(
          'flex flex-col gap-6',
          'has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3',
          className,
        )}
        dir={direction}
        data-slot="field-set"
        {...props}
      />
    )
  },
)
FieldSet.displayName = 'FieldSet'

const FieldLegend = React.forwardRef<
  HTMLLegendElement,
  React.ComponentPropsWithoutRef<'legend'> & { variant?: 'legend' | 'label' }
>(({ className, variant = 'legend', ...props }, ref) => {
  return (
    <legend
      ref={ref}
      className={cn('mb-3 font-medium', 'data-[variant=legend]:text-base', 'data-[variant=label]:text-sm', className)}
      data-slot="field-legend"
      data-variant={variant}
      {...props}
    />
  )
})
FieldLegend.displayName = 'FieldLegend'

const FieldGroup = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'group/field-group @container/field-group flex w-full flex-col gap-7 data-[slot=checkbox-group]:gap-3 [&>[data-slot=field-group]]:gap-4',
          className,
        )}
        data-slot="field-group"
        {...props}
      />
    )
  },
)
FieldGroup.displayName = 'FieldGroup'

const Field = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'> & Variants.VariantProps<typeof fieldVariants>
>(({ className, orientation = 'vertical', ...props }, ref) => {
  return (
    // biome-ignore lint/a11y/useSemanticElements: field group role is semantically correct for form field grouping
    <div
      ref={ref}
      className={cn(fieldVariants({ orientation }), className)}
      data-orientation={orientation}
      data-slot="field"
      role="group"
      {...props}
    />
  )
})
Field.displayName = 'Field'

const FieldContent = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('group/field-content flex flex-1 flex-col gap-1.5 leading-snug', className)}
        data-slot="field-content"
        {...props}
      />
    )
  },
)
FieldContent.displayName = 'FieldContent'

const FieldLabel = React.forwardRef<HTMLLabelElement, React.ComponentPropsWithoutRef<typeof Label>>(
  ({ className, ...props }, ref) => {
    return (
      <Label
        ref={ref}
        className={cn(
          'group/field-label peer/field-label flex w-fit gap-2 leading-snug group-data-[disabled=true]/field:cursor-not-allowed group-data-[disabled=true]/field:opacity-50',
          'has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col has-[>[data-slot=field]]:rounded-md has-[>[data-slot=field]]:border [&>*]:data-[slot=field]:p-4',
          'has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/5 dark:has-data-[state=checked]:bg-primary/10',
          className,
        )}
        data-slot="field-label"
        {...props}
      />
    )
  },
)
FieldLabel.displayName = 'FieldLabel'

const FieldTitle = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex w-fit items-center gap-2 font-medium text-sm leading-snug group-data-[disabled=true]/field:cursor-not-allowed group-data-[disabled=true]/field:opacity-50',
          className,
        )}
        data-slot="field-label"
        {...props}
      />
    )
  },
)
FieldTitle.displayName = 'FieldTitle'

const FieldDescription = React.forwardRef<HTMLParagraphElement, React.ComponentPropsWithoutRef<'p'>>(
  ({ className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn(
          'font-normal text-muted-foreground text-sm leading-normal group-has-[[data-orientation=horizontal]]/field:text-balance',
          'nth-last-2:-mt-1 last:mt-0 [[data-variant=legend]+&]:-mt-1.5',
          '[&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4',
          className,
        )}
        data-slot="field-description"
        {...props}
      />
    )
  },
)
FieldDescription.displayName = 'FieldDescription'

const FieldSeparator = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'> & {
    children?: React.ReactNode
  }
>(({ children, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('relative -my-2 h-5 text-sm group-data-[variant=outline]/field-group:-mb-2', className)}
      data-content={!!children}
      data-slot="field-separator"
      {...props}>
      <Separator className="absolute inset-0 top-1/2" />
      {children && (
        <span
          className="relative mx-auto block w-fit bg-background px-2 text-muted-foreground"
          data-slot="field-separator-content">
          {children}
        </span>
      )}
    </div>
  )
})
FieldSeparator.displayName = 'FieldSeparator'

const FieldError = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'> & {
    errors?: Array<{ message?: string } | undefined>
  }
>(({ className, children, errors, ...props }, ref) => {
  const content = useMemo(() => {
    if (children) {
      return children
    }

    if (!errors) {
      return null
    }

    if (errors?.length === 1 && errors[0]?.message) {
      return errors[0].message
    }

    return (
      <ul className="ms-4 flex list-disc flex-col gap-1">
        {/* biome-ignore lint/suspicious/noArrayIndexKey: error messages have no stable unique id */}
        {errors.map((error, index) => error?.message && <li key={index}>{error.message}</li>)}
      </ul>
    )
  }, [children, errors])

  if (!content) {
    return null
  }

  return (
    <div
      ref={ref}
      className={cn('font-normal text-destructive text-sm', className)}
      data-slot="field-error"
      role="alert"
      {...props}>
      {content}
    </div>
  )
})
FieldError.displayName = 'FieldError'

export {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
}
