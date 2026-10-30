import * as React from 'react'
import { useLayoutEffect } from '../hooks/use-layout-effect'

export interface ISvgIndicatorOptions {
  indicator?: React.ReactNode
  checkedIndicator?: React.ReactNode
  indeterminateIndicator?: React.ReactNode
}

const SLOTS = [
  ['indicator', '--svg-off'],
  ['checkedIndicator', '--svg-on'],
  ['indeterminateIndicator', '--svg-indeterminate'],
] as const

// An image is parsed as its own XML document and draws nothing without the SVG namespace, which serialized
// HTML only carries when the markup set it as an attribute.
const toUrl = (markup: string) =>
  `url("data:image/svg+xml,${encodeURIComponent(markup.replace(/^<svg(?![^>]*\sxmlns=)/, '<svg xmlns="http://www.w3.org/2000/svg"'))}")`

/**
 * Renders SVG indicators into hidden nodes and hands their markup back as data-URI CSS variables: `--svg-off`,
 * `--svg-on` and `--svg-indeterminate`, for an input that cannot hold children to draw as a mask.
 */
export function useSvgIndicator(options: ISvgIndicatorOptions) {
  const latest = React.useRef(options)
  // The returned component keeps one identity so its markup is never remounted, and reads what to draw from here.
  latest.current = options
  const [sources] = React.useState<(HTMLDivElement | null)[]>(() => [])
  const [markup, setMarkup] = React.useState<readonly string[]>(['', '', ''])

  const [SvgIndicator] = React.useState(() => {
    const refs = SLOTS.map((_, index) => (node: HTMLDivElement | null) => {
      sources[index] = node
    })
    function SvgIndicator(props: React.HTMLAttributes<HTMLDivElement>) {
      return SLOTS.map(([option], index) =>
        latest.current[option] ? (
          <div aria-hidden hidden {...props} key={option} ref={refs[index]}>
            {latest.current[option]}
          </div>
        ) : null,
      )
    }
    return SvgIndicator
  })

  useLayoutEffect(() => {
    const next = SLOTS.map((_, index) => sources[index]?.innerHTML.trim() ?? '')
    setMarkup((previous) => (next.every((value, index) => value === previous[index]) ? previous : next))
  })

  const inputStyle = React.useMemo(
    () =>
      Object.fromEntries(
        SLOTS.flatMap(([, name], index) => {
          const value = markup[index]
          return value ? [[name, toUrl(value)]] : []
        }),
      ),
    [markup],
  ) as React.CSSProperties

  return {
    checkedIndicatorReady: !!markup[1],
    indeterminateIndicatorReady: !!markup[2],
    indicatorReady: !!markup[0],
    inputStyle,
    SvgIndicator,
  }
}

export interface ICheckedSyncOptions {
  /** The state the owner holds the input on, or `undefined` while the input keeps its own. */
  checked: boolean | undefined
  onChange?: React.ChangeEventHandler<HTMLInputElement>
  onClick?: React.MouseEventHandler<HTMLInputElement>
}

/**
 * Keeps a native checkbox's form in step with the `checked` its owner sets. A change from outside reaches the form as
 * the click Radix's hidden input sends, without running the input's handlers, and a form reset the owner does not
 * follow is undone before the next paint. Returns the `onChange` and `onClick` to put on the input.
 */
export function useCheckedSync(
  ref: React.RefObject<HTMLInputElement | null>,
  { checked, onChange, onClick }: ICheckedSyncOptions,
) {
  const latest = React.useRef(checked)
  latest.current = checked
  const heard = React.useRef(checked)
  const syncing = React.useRef(false)

  React.useEffect(() => {
    const input = ref.current
    if (checked === undefined || checked === heard.current) return
    heard.current = checked
    if (!input?.form) return
    // React reports a click as a change only when the value differs from the last one it saw, so it is shown the old
    // value and the new one is set past it.
    input.checked = !checked
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'checked')?.set?.call(input, checked)
    syncing.current = true
    input.dispatchEvent(new Event('click', { bubbles: true }))
    syncing.current = false
  }, [checked, ref])

  React.useEffect(() => {
    const input = ref.current
    if (!input?.form) return
    const { form } = input
    let frame = 0
    // The reset lands after its event, so the owner's value goes back on in the frame that would paint it.
    const hold = () => {
      frame = requestAnimationFrame(() => {
        if (latest.current !== undefined) input.checked = latest.current
      })
    }
    form.addEventListener('reset', hold)
    return () => {
      form.removeEventListener('reset', hold)
      cancelAnimationFrame(frame)
    }
  }, [ref])

  return {
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      if (syncing.current) return
      heard.current = event.target.checked
      onChange?.(event)
    },
    onClick: (event: React.MouseEvent<HTMLInputElement>) => {
      if (syncing.current) return event.stopPropagation()
      onClick?.(event)
    },
  }
}
