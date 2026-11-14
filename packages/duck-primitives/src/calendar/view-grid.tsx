import * as React from 'react'
import { Primitive } from '../primitive-elements'
import type { ICalendar } from './calendar.types'

export const ViewGrid = React.forwardRef<HTMLDivElement, ICalendar.IViewGridProps>((props, forwardedRef) => {
  const { cells, columns: asked, selected, rtl, cellSlot, onPage, ...gridProps } = props
  const columns = Number.isInteger(asked) && asked > 0 ? asked : 3
  const [focused, setFocused] = React.useState(Math.max(selected, 0))
  const buttons = React.useRef<(HTMLButtonElement | null)[]>([])
  const rows = Array.from({ length: Math.ceil(cells.length / columns) }, (_, row) =>
    cells.slice(row * columns, (row + 1) * columns),
  )

  const onKeyDown = (event: React.KeyboardEvent, index: number) => {
    const rowStart = index - (index % columns)
    const steps: Record<string, number> = {
      ArrowLeft: rtl ? 1 : -1,
      ArrowRight: rtl ? -1 : 1,
      ArrowUp: -columns,
      ArrowDown: columns,
      Home: rowStart - index,
      End: Math.min(rowStart + columns, cells.length) - 1 - index,
    }
    if (event.key === 'PageUp' || event.key === 'PageDown') {
      event.preventDefault()
      onPage(event.key === 'PageUp' ? -1 : 1)
      return
    }
    const step = steps[event.key]
    if (step === undefined) return
    event.preventDefault()
    buttons.current[index + step]?.focus()
  }

  return (
    <Primitive.div role="grid" {...gridProps} ref={forwardedRef}>
      {rows.map((row, r) => (
        // biome-ignore lint/a11y/useSemanticElements: role="row" on div per WAI-ARIA grid pattern
        // biome-ignore lint/a11y/useFocusableInteractive: rows are not interactive, their cells are
        // biome-ignore lint/suspicious/noArrayIndexKey: keyed by position, as the cells are
        <div key={r} role="row">
          {row.map((cell, c) => {
            const index = r * columns + c
            return (
              <Primitive.button
                // Keyed by position, so a page keeps the focused button rather than remounting it.
                key={index}
                ref={(el) => {
                  buttons.current[index] = el
                }}
                type="button"
                role="gridcell"
                tabIndex={index === focused ? 0 : -1}
                aria-selected={index === selected}
                aria-current={cell.isCurrent ? 'date' : undefined}
                data-slot={cellSlot}
                data-current={cell.isCurrent ? 'true' : undefined}
                data-selected={index === selected ? 'true' : undefined}
                {...cell.data}
                onFocus={() => setFocused(index)}
                onKeyDown={(event) => onKeyDown(event, index)}
                onClick={cell.onPick}>
                {cell.label}
              </Primitive.button>
            )
          })}
        </div>
      ))}
    </Primitive.div>
  )
})

ViewGrid.displayName = 'CalendarViewGrid'
