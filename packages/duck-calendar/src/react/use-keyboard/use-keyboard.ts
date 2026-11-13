import * as React from 'react'
import { useCallback } from 'react'
import type { UseKeyboard } from './use-keyboard.types'

/** Maximum number of days to skip when searching for the next non-disabled date. */
const MAX_SKIP = 365

type Action<TDate> = (focused: TDate, config: UseKeyboard.IKeyboardConfig<TDate>) => TDate | null // null means "no movement, just a side-effect"

function stepUntilEnabled<TDate>(
  start: TDate,
  config: UseKeyboard.IKeyboardConfig<TDate>,
  step: (date: TDate) => TDate,
): TDate | null {
  let candidate = step(start)
  for (let i = 0; i < MAX_SKIP; i++) {
    if (!config.isDisabled(candidate)) return candidate
    candidate = step(candidate)
  }
  return null // all candidates were disabled
}

function buildActionMap<TDate>(): Record<string, Action<TDate>> {
  return {
    ArrowLeft: (focused, config) => stepUntilEnabled(focused, config, (d) => config.adapter.addDays(d, -1)),

    ArrowRight: (focused, config) => stepUntilEnabled(focused, config, (d) => config.adapter.addDays(d, 1)),

    ArrowUp: (focused, config) => stepUntilEnabled(focused, config, (d) => config.adapter.addDays(d, -7)),

    ArrowDown: (focused, config) => stepUntilEnabled(focused, config, (d) => config.adapter.addDays(d, 7)),

    PageUp: (focused, config) =>
      stepUntilEnabled(focused, config, (d) => config.adapter.addMonths(d, -(config.pageSize ?? 1))),

    PageDown: (focused, config) =>
      stepUntilEnabled(focused, config, (d) => config.adapter.addMonths(d, config.pageSize ?? 1)),

    'Shift+PageUp': (focused, config) => stepUntilEnabled(focused, config, (d) => config.adapter.addYears(d, -1)),

    'Shift+PageDown': (focused, config) => stepUntilEnabled(focused, config, (d) => config.adapter.addYears(d, 1)),

    Home: (focused, config) => {
      const weekStart = config.weekStartDay ?? 0
      const start = config.adapter.startOfWeek(focused, weekStart)
      if (!config.isDisabled(start)) return start
      return stepUntilEnabled(start, config, (d) => config.adapter.addDays(d, 1))
    },

    End: (focused, config) => {
      const weekStart = config.weekStartDay ?? 0
      // end of week = start of week + 6
      const end = config.adapter.addDays(config.adapter.startOfWeek(focused, weekStart), 6)
      if (!config.isDisabled(end)) return end
      return stepUntilEnabled(end, config, (d) => config.adapter.addDays(d, -1))
    },
  }
}

// built once, outside the hook  -  no re-creation on render
const ACTION_MAP: Record<string, Action<unknown>> = buildActionMap<unknown>()

const RTL_ARROW_KEYS: Record<string, string> = { ArrowLeft: 'ArrowRight', ArrowRight: 'ArrowLeft' }

export function useKeyboard<TDate>(config: UseKeyboard.IKeyboardConfig<TDate>): UseKeyboard.IKeyboardReturn {
  // Keep config in a ref to avoid recreating the callback on every prop change
  const configRef = React.useRef(config)
  configRef.current = config

  const onKeyDown: React.KeyboardEventHandler = useCallback(
    (e) => {
      const cfg = configRef.current
      const rawKey = e.shiftKey && (e.key === 'PageUp' || e.key === 'PageDown') ? `Shift+${e.key}` : e.key
      const key = cfg.direction === 'rtl' ? (RTL_ARROW_KEYS[rawKey] ?? rawKey) : rawKey

      // Enter / Space  -  select
      if (key === 'Enter' || key === ' ') {
        e.preventDefault()
        if (!cfg.isDisabled(cfg.focusedDate)) {
          cfg.onSelect(cfg.focusedDate, { shiftKey: e.shiftKey })
        }
        return
      }

      // Escape  -  dismiss
      if (key === 'Escape') {
        e.preventDefault()
        cfg.onDismiss?.()
        return
      }

      const action = ACTION_MAP[key] as Action<TDate> | undefined
      if (!action) return

      e.preventDefault()
      const next = action(cfg.focusedDate, cfg)
      if (next !== null) {
        cfg.onFocusChange(next)
      }
    },
    [], // stable  -  reads from configRef
  )

  return { onKeyDown }
}
