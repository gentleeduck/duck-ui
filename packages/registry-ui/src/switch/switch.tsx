'use client'

import { cn } from '@gentleduck/libs/cn'
import { checkersStylePattern } from '@gentleduck/motion/variants'
import { useCheckedSync, useSvgIndicator } from '@gentleduck/primitives/checkers'
import { useDirection } from '@gentleduck/primitives/direction'
import * as React from 'react'
import { toDirection } from '../direction/direction.libs'

const Switch = React.forwardRef<
  HTMLInputElement,
  Omit<React.HTMLProps<HTMLInputElement>, 'ref'> & {
    indicator?: React.ReactElement
    checkedIndicator?: React.ReactElement
    onCheckedChange?: (checked: boolean) => void
  }
>(
  (
    { className, indicator, checkedIndicator, checked, onChange, onClick, onCheckedChange, dir, style, ...props },
    ref,
  ) => {
    const direction = useDirection(toDirection(dir))
    const inputRef = React.useRef<HTMLInputElement>(null)
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, [])

    const sync = useCheckedSync(inputRef, {
      checked,
      onChange: (event) => {
        onChange?.(event)
        onCheckedChange?.(event.target.checked)
      },
      onClick,
      // A reset fires no change event, so the owner hears of the value it puts the input back on from here.
      onReset: (input) => {
        if (input.checked !== input.defaultChecked) onCheckedChange?.(input.defaultChecked)
      },
    })

    const { indicatorReady, checkedIndicatorReady, inputStyle, SvgIndicator } = useSvgIndicator({
      checkedIndicator,
      indicator,
    })

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
              type: 'switch',
            }),
            'transition-[color,background-color,border-color,box-shadow,opacity] duration-200 ease-(--gentleduck-motion-ease)',
            '[&:before,&:after]:transition-[opacity,transform,translate,scale,rotate] [&:before,&:after]:duration-[inherit] [&:before,&:after]:ease-[inherit]',
            '[&[dir=ltr]:checked]:after:translate-x-full [&[dir=ltr]]:after:translate-x-0',
            '[&[dir=rtl]:checked]:after:-translate-x-full [&[dir=rtl]]:after:translate-x-0',
            '[&[dir=ltr]:checked]:after:origin-right [&[dir=ltr]:not(:checked)]:after:origin-left',
            '[&[dir=rtl]:checked]:after:origin-left [&[dir=rtl]:not(:checked)]:after:origin-right',
            'active:after:scale-x-125 active:after:scale-y-110',
            indicatorReady && !checkedIndicatorReady && 'checked:after:mask-none',
            className,
          )}
          checked={checked}
          onChange={sync.onChange}
          onClick={sync.onClick}
          ref={inputRef}
          // biome-ignore lint/a11y/useAriaPropsForRole: a native checkbox carries its checked state, which aria-checked would only repeat
          role="switch"
          dir={direction}
          style={{ ...style, ...inputStyle }}
          type="checkbox"
          {...props}
          data-slot="switch"
        />
        <SvgIndicator />
      </>
    )
  },
)
Switch.displayName = 'Switch'

export { Switch }
