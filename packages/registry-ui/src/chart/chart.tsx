'use client'

import { cn } from '@gentleduck/libs/cn'
import { useDirection } from '@gentleduck/primitives/direction'
import * as React from 'react'
import * as RechartsPrimitive from 'recharts'
import { toDirection } from '../direction/direction.libs'
import { getPayloadConfigFromPayload, isSafeCssColor, isSafeCssIdent } from './chart.libs'
import type {
  IChartContainerProps,
  IChartContextProps,
  IChartLegendContentProps,
  IChartStyleProps,
  IChartTooltipContentProps,
} from './chart.types'

/** Theme name -> CSS selector that scopes the injected `--color-*` vars. */
export const THEMES = { dark: '.dark', light: '' } as const
const DEFAULT_CHART_INITIAL_DIMENSION = { width: 640, height: 360 } as const

const ChartContext = React.createContext<IChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error('useChart must be used within a <ChartContainer />')
  }

  return context
}

function ChartContainer({ id, className, children, config, ref, dir, ...props }: IChartContainerProps) {
  const uniqueId = React.useId()
  const safeUniqueId = uniqueId.replace(/:/g, '')
  // SEC-003: the `id` is interpolated into a CSS selector; reject any
  // caller-supplied override that is not a safe identifier.
  const safeId = id && isSafeCssIdent(id) ? id : safeUniqueId
  const chartId = `chart-${safeId}`
  const direction = useDirection(toDirection(dir))

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        className={cn(
          "flex aspect-video min-w-0 justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-hidden [&_.recharts-surface]:outline-hidden",
          // SVG `text-anchor` start/end follow `direction`; swap them in RTL so Recharts labels stay where it placed them.
          'rtl:[&_text[text-anchor=end]]:[text-anchor:start] rtl:[&_text[text-anchor=start]]:[text-anchor:end]',
          className,
        )}
        {...props}
        data-chart={chartId}
        data-slot="chart-container"
        dir={direction}
        ref={ref}>
        <ChartStyle config={config} id={chartId} />
        <RechartsPrimitive.ResponsiveContainer initialDimension={DEFAULT_CHART_INITIAL_DIMENSION} minWidth={0}>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}
ChartContainer.displayName = 'ChartContainer'

function ChartStyle({ id, config }: IChartStyleProps) {
  // SEC-003: `id` is interpolated into a CSS selector — drop it entirely if unsafe.
  if (!isSafeCssIdent(id)) {
    return null
  }

  // SEC-001: only keep entries whose key is a safe CSS identifier; both the
  // key and color values are interpolated raw into a `<style>` block.
  const colorConfig = Object.entries(config).filter(
    ([key, config]) => isSafeCssIdent(key) && (config.theme || config.color),
  )

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      // biome-ignore lint/security/noDangerouslySetInnerHtml: validated CSS injection for chart color themes
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color = itemConfig.theme?.[theme as keyof typeof itemConfig.theme] || itemConfig.color
    // SEC-001: drop any color that is not a strictly-allowlisted CSS value.
    return color && isSafeCssColor(color) ? `  --color-${key}: ${color};` : null
  })
  .filter(Boolean)
  .join('\n')}
}
`,
          )
          .join('\n'),
      }}
    />
  )
}
ChartStyle.displayName = 'ChartStyle'

const ChartTooltip = RechartsPrimitive.Tooltip

function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = 'dot',
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  ref,
  color,
  nameKey,
  labelKey,
}: IChartTooltipContentProps) {
  const { config } = useChart()

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) {
      return null
    }

    const [item] = payload
    const key = `${labelKey || item?.dataKey || item?.name || 'value'}`
    const itemConfig = getPayloadConfigFromPayload(config, item, key)
    const value =
      !labelKey && typeof label === 'string' ? config[label as keyof typeof config]?.label || label : itemConfig?.label

    if (labelFormatter) {
      return (
        <div className={cn('font-medium', labelClassName)} data-slot="tooltip-label">
          {labelFormatter(value, payload)}
        </div>
      )
    }

    if (!value) {
      return null
    }

    return (
      <div className={cn('font-medium', labelClassName)} data-slot="tooltip-label">
        {value}
      </div>
    )
  }, [label, labelFormatter, payload, hideLabel, labelClassName, config, labelKey])

  if (!active || !payload?.length) {
    return null
  }

  const nestLabel = payload.length === 1 && indicator !== 'dot'

  return (
    <div
      className={cn(
        'grid min-w-32 items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl',
        className,
      )}
      data-slot="tooltip-content"
      ref={ref}>
      {nestLabel ? null : tooltipLabel}
      <div className="grid gap-1.5" data-slot="tooltip-items">
        {payload.map((item: RechartsPrimitive.TooltipPayloadEntry<string | number, string | number>, index: number) => (
          <ChartTooltipItem
            key={String(item.dataKey)}
            item={item}
            index={index}
            nameKey={nameKey}
            indicator={indicator}
            hideIndicator={hideIndicator}
            color={color}
            nestLabel={nestLabel}
            tooltipLabel={tooltipLabel}
            formatter={formatter}
          />
        ))}
      </div>
    </div>
  )
}
ChartTooltipContent.displayName = 'ChartTooltipContent'

interface IChartTooltipItemProps {
  item: RechartsPrimitive.TooltipPayloadEntry<string | number, string | number>
  index: number
  nameKey?: string
  indicator: 'line' | 'dot' | 'dashed'
  hideIndicator: boolean
  color?: string
  nestLabel: boolean
  tooltipLabel: React.ReactNode
  formatter?: IChartTooltipContentProps['formatter']
}

/**
 * Per-payload tooltip row hoisted out of `ChartTooltipContent` so React can
 * bail out of unchanged rows on every Recharts hover-tick re-render. Keyed on
 * `dataKey` upstream; uses the default shallow `React.memo` comparator since
 * all incoming props are primitive or function references.
 */
const ChartTooltipItem = React.memo(function ChartTooltipItem({
  item,
  index,
  nameKey,
  indicator,
  hideIndicator,
  color,
  nestLabel,
  tooltipLabel,
  formatter,
}: IChartTooltipItemProps) {
  const { config } = useChart()
  const key = `${nameKey || item.name || item.dataKey || 'value'}`
  const itemConfig = getPayloadConfigFromPayload(config, item, key)
  const indicatorColor = color || item.payload?.fill || item.color

  return (
    <div
      className={cn(
        'flex w-full flex-wrap items-stretch gap-2 [&>svg:not([class*=size-])]:size-2.5 [&>svg]:text-muted-foreground',
        indicator === 'dot' && 'items-center',
      )}
      data-slot="tooltip-item">
      {formatter && item?.value !== undefined && item.name ? (
        formatter(item.value, item.name, item, index, item.payload)
      ) : (
        <>
          {itemConfig?.icon ? (
            <itemConfig.icon />
          ) : (
            !hideIndicator && (
              <div
                className={cn('shrink-0 rounded-xs border-(--color-border) bg-(--color-bg)', {
                  'size-2.5': indicator === 'dot',
                  'my-0.5': nestLabel && indicator === 'dashed',
                  'w-0 border-[1.5px] border-dashed bg-transparent': indicator === 'dashed',
                  'w-1': indicator === 'line',
                })}
                style={
                  {
                    '--color-bg': indicatorColor,
                    '--color-border': indicatorColor,
                  } as React.CSSProperties
                }
              />
            )
          )}
          <div className={cn('flex flex-1 justify-between leading-none', nestLabel ? 'items-end' : 'items-center')}>
            <div className="grid gap-1.5">
              {nestLabel ? tooltipLabel : null}
              <span className="text-muted-foreground">{itemConfig?.label || item.name}</span>
            </div>
            {item.value !== undefined && item.value !== null && (
              <span className="font-medium font-mono text-foreground tabular-nums">{item.value.toLocaleString()}</span>
            )}
          </div>
        </>
      )}
    </div>
  )
})
ChartTooltipItem.displayName = 'ChartTooltipItem'

const ChartLegend = RechartsPrimitive.Legend
ChartLegend.displayName = 'ChartLegend'

function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = 'bottom',
  ref,
  nameKey,
}: IChartLegendContentProps) {
  const { config } = useChart()

  if (!payload?.length) {
    return null
  }

  return (
    <div
      className={cn('flex items-center justify-center gap-4', verticalAlign === 'top' ? 'pb-3' : 'pt-3', className)}
      data-slot="legend-content"
      ref={ref}>
      {payload?.map((item: RechartsPrimitive.LegendPayload) => {
        const key = `${nameKey || item.dataKey || 'value'}`
        const itemConfig = getPayloadConfigFromPayload(config, item, key)

        return (
          <div
            className={cn('flex items-center gap-1.5 [&>svg:not([class*=size-])]:size-3 [&>svg]:text-muted-foreground')}
            data-slot="legend-item"
            key={item.value}>
            {itemConfig?.icon && !hideIcon ? (
              <itemConfig.icon />
            ) : (
              <div
                className="size-2 shrink-0 rounded-xs"
                style={{
                  backgroundColor: item.color,
                }}
              />
            )}
            {itemConfig?.label}
          </div>
        )
      })}
    </div>
  )
}
ChartLegendContent.displayName = 'ChartLegendContent'

export { ChartContainer, ChartLegend, ChartLegendContent, ChartStyle, ChartTooltip, ChartTooltipContent }
