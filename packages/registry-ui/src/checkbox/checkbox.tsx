'use client'

import { cn } from '@gentleduck/libs/cn'
import { checkersStylePattern } from '@gentleduck/motion/variants'
import { useCheckedSync, useSvgIndicator } from '@gentleduck/primitives/checkers'
import { useDirection } from '@gentleduck/primitives/direction'
import { useControllableState } from '@gentleduck/primitives/hooks/use-controllable-state'
import { useLayoutEffect } from '@gentleduck/primitives/hooks/use-layout-effect'
import * as React from 'react'
import { toDirection } from '../direction/direction.libs'
import { Label } from '../label'
import type { CheckedState, ICheckboxGroupProps, ICheckboxProps, ICheckboxWithLabelProps } from './checkbox.types'

const Checkbox = React.forwardRef<HTMLInputElement, ICheckboxProps>(
  (
    {
      className,
      indicator,
      checkedIndicator,
      indeterminateIndicator,
      style,
      checked: checkedProp,
      defaultChecked = false,
      onCheckedChange,
      onClick,
      dir,
      ...props
    },
    ref,
  ) => {
    const direction = useDirection(toDirection(dir))
    const { indicatorReady, checkedIndicatorReady, indeterminateIndicatorReady, inputStyle, SvgIndicator } =
      useSvgIndicator({ checkedIndicator, indeterminateIndicator, indicator })
    const [checked, setChecked] = useControllableState<CheckedState>({
      caller: 'Checkbox',
      defaultProp: defaultChecked,
      onChange: onCheckedChange,
      prop: checkedProp,
    })
    const inputRef = React.useRef<HTMLInputElement>(null)
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, [])
    const [firstChecked] = React.useState(checked)
    const resetTo = checkedProp === undefined ? defaultChecked : firstChecked

    useLayoutEffect(() => {
      if (inputRef.current) inputRef.current.indeterminate = checked === 'indeterminate'
    }, [checked])

    const sync = useCheckedSync(inputRef, {
      checked: checked === true,
      onChange: (event) => {
        setChecked(event.target.checked)
        // A click clears the mixed state before the value is asked for, so a refused change restores it here.
        event.target.indeterminate = checked === 'indeterminate'
      },
      onClick,
      onReset: () => setChecked(resetTo),
    })

    // The form resets the input to this, and the state follows it through onReset.
    useLayoutEffect(() => {
      if (inputRef.current) inputRef.current.defaultChecked = resetTo === true
    }, [resetTo])

    return (
      <>
        <input
          className={cn(
            checkersStylePattern({
              indicatorState:
                indicatorReady && checkedIndicatorReady
                  ? 'both'
                  : indicatorReady
                    ? 'indicatorReady'
                    : checkedIndicatorReady
                      ? 'checkedIndicatorReady'
                      : 'default',
              type: 'checkbox',
            }),
            'transition-[color,background-color,border-color,box-shadow,opacity] duration-200 ease-(--gentleduck-motion-ease)',
            '[&:before,&:after]:transition-[opacity,transform,translate,scale,rotate] [&:before,&:after]:duration-200 [&:before,&:after]:ease-[cubic-bezier(0.34,1.56,0.64,1)]',
            checkedIndicatorReady
              ? 'after:rotate-0 checked:after:rotate-0 checked:after:bg-current'
              : indicatorReady
                ? 'checked:after:mask-none checked:after:mb-0.5 checked:after:h-2.25 checked:after:w-1 checked:after:border-2 checked:after:border-t-0 checked:after:border-l-0 checked:after:bg-transparent'
                : 'after:mb-0.5 after:h-2.25 after:w-1 after:border-2 after:border-t-0 after:border-l-0 after:bg-transparent',
            indicatorReady &&
              'after:translate-y-0 after:rotate-0 after:scale-100 after:bg-muted-foreground after:opacity-100',
            'data-[checked="indeterminate"]:border-primary data-[checked="indeterminate"]:bg-primary data-[checked="indeterminate"]:text-primary-foreground',
            'data-[checked="indeterminate"]:after:mb-0 data-[checked="indeterminate"]:after:translate-y-0 data-[checked="indeterminate"]:after:rotate-0 data-[checked="indeterminate"]:after:scale-100 data-[checked="indeterminate"]:after:border-0 data-[checked="indeterminate"]:after:opacity-100',
            indeterminateIndicatorReady
              ? 'data-[checked="indeterminate"]:after:mask-[var(--svg-indeterminate)] data-[checked="indeterminate"]:after:size-[1em] data-[checked="indeterminate"]:after:bg-current'
              : 'data-[checked="indeterminate"]:after:mask-none data-[checked="indeterminate"]:after:h-0.5 data-[checked="indeterminate"]:after:w-2 data-[checked="indeterminate"]:after:rounded-full data-[checked="indeterminate"]:after:bg-current',
            'rounded-sm bg-transparent',
            className,
          )}
          checked={checked === true}
          data-checked={String(checked)}
          data-slot="checkbox"
          onChange={sync.onChange}
          onClick={sync.onClick}
          ref={inputRef}
          dir={direction}
          style={{ ...style, ...inputStyle }}
          type="checkbox"
          {...props}
        />
        <SvgIndicator />
      </>
    )
  },
)
Checkbox.displayName = 'Checkbox'

const CheckboxWithLabel = React.forwardRef<HTMLDivElement, Omit<ICheckboxWithLabelProps, 'ref'>>(
  ({ id, checkbox, label, className, ...props }, ref) => {
    const { className: labelClassName, ...labelProps } = label
    return (
      <div
        className={cn('flex items-center justify-start gap-2', className)}
        ref={ref}
        {...props}
        data-slot="checkbox-with-label">
        <Checkbox id={id} {...checkbox} />
        <Label className={cn('cursor-pointer', labelClassName)} htmlFor={id} {...labelProps} />
      </div>
    )
  },
)
CheckboxWithLabel.displayName = 'CheckboxWithLabel'

const CheckboxGroup = React.forwardRef<HTMLDivElement, Omit<ICheckboxGroupProps, 'ref'>>(
  ({ subtasks, defaults, ...props }, ref) => {
    const { checkbox, label } = defaults || {}
    return (
      <div className={cn('mb-3 flex flex-col gap-2')} {...props} data-slot="checkbox-group" ref={ref}>
        {subtasks.map(({ id, title, checked }) => (
          <CheckboxWithLabel
            checkbox={{
              ...checkbox,
              className: 'size-4 rounded-full border-muted-foreground/80',
              defaultChecked: checked,
            }}
            label={{ ...label, children: title }}
            data-slot="checkbox-with-label"
            id={id}
            key={id}
          />
        ))}
      </div>
    )
  },
)
CheckboxGroup.displayName = 'CheckboxGroup'

export { Checkbox, CheckboxGroup, CheckboxWithLabel }
