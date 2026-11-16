'use client'

import { cn } from '@gentleduck/libs/cn'
import { useDirection } from '@gentleduck/primitives/direction'
import * as React from 'react'
import { toDirection } from '../direction/direction.libs'
import { Textarea } from '../textarea'
import type { IJsonEditorViewProps } from './json-editor.types'

const LOCALE_NUMBERING_SYSTEMS: Record<string, string> = {
  ar: 'arab',
  bn: 'beng',
  fa: 'arabext',
  gu: 'gujr',
  hi: 'deva',
  km: 'khmr',
  kn: 'knda',
  lo: 'laoo',
  ml: 'mlym',
  mr: 'deva',
  my: 'mymr',
  ne: 'deva',
  or: 'orya',
  pa: 'guru',
  ps: 'arabext',
  ta: 'tamldec',
  te: 'telu',
  th: 'thai',
  ur: 'arabext',
}

export function JsonEditorView({
  value,
  onChange,
  onScroll,
  scrollTop,
  rows,
  placeholder,
  readOnly,
  lineNumbers,
  lineHeightPx,
  dir,
  lang,
  onKeyDown,
  ...textareaProps
}: IJsonEditorViewProps) {
  const direction = useDirection(toDirection(dir))
  const lineCount = React.useMemo(() => {
    const count = value ? value.split(/\r\n|\r|\n/).length : 1
    return Math.max(1, count)
  }, [value])

  const numbers = React.useMemo(() => {
    if (!lang) {
      return Array.from({ length: lineCount }, (_, i) => String(i + 1)).join('\n')
    }

    // Some engines default these locales to latn digits, so their own are asked for unless the tag names a system.
    const [base = ''] = lang.toLowerCase().split('-')
    const numberingSystem = lang.toLowerCase().includes('-nu-') ? undefined : LOCALE_NUMBERING_SYSTEMS[base]
    const fmt = new Intl.NumberFormat(lang, { numberingSystem, useGrouping: false })
    return Array.from({ length: lineCount }, (_, i) => fmt.format(i + 1)).join('\n')
  }, [lineCount, lang])

  return (
    <div className="overflow-hidden rounded-md border bg-background" data-slot="json-editor-shell" dir={direction}>
      {/* JSON is LTR in any locale; the gutter shares that dir so it stays beside line starts, off the scrollbar. */}
      <div className="relative" data-slot="json-editor-container" dir="ltr">
        {lineNumbers ? (
          <div className="absolute inset-y-0 start-0 w-12 border-e bg-muted/30" data-slot="json-editor-gutter">
            <pre
              aria-hidden
              className="select-none px-2 py-2 text-end font-mono text-muted-foreground text-xs"
              data-slot="json-editor-line-numbers"
              style={{
                lineHeight: `${lineHeightPx}px`,
                transform: `translateY(-${scrollTop}px)`,
              }}>
              {numbers}
            </pre>
          </div>
        ) : null}

        <Textarea
          {...textareaProps}
          className={cn(
            'w-full resize-y bg-transparent px-3 py-2 font-mono text-sm outline-hidden placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring',
            lineNumbers ? 'ps-14' : '',
          )}
          data-slot="json-editor-textarea"
          dir="ltr"
          onChange={(event) => onChange(event.currentTarget.value)}
          onKeyDown={onKeyDown}
          onScroll={(event) => onScroll?.(event.currentTarget.scrollTop)}
          placeholder={placeholder}
          readOnly={readOnly}
          rows={rows}
          spellCheck={false}
          style={{ lineHeight: `${lineHeightPx}px` }}
          value={value}
        />
      </div>
    </div>
  )
}
JsonEditorView.displayName = 'JsonEditorView'
