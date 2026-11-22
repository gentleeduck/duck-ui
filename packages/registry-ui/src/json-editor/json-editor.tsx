'use client'

import { cn } from '@gentleduck/libs/cn'
import { useDirection } from '@gentleduck/primitives/direction'
import { Portal } from '@gentleduck/primitives/portal'
import { Maximize } from 'lucide-react'
import * as React from 'react'
import type { FieldValues } from 'react-hook-form'
import { useController } from 'react-hook-form'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../alert-dialog'
import { Button } from '../button'
import { toDirection } from '../direction/direction.libs'
import { Field, FieldDescription, FieldError, FieldLabel } from '../field'
import { Popover, PopoverContent, PopoverTrigger } from '../popover'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../sheet'
import { useJsonEditorHotkeys } from './json-editor.hooks'
import { formatValue, isObjectLike, safeStringify, tryParseJson } from './json-editor.libs'
import type { IJsonEditorText, IJsonTextareaFieldProps } from './json-editor.types'
import { JsonEditorView } from './json-editor.view'

interface IComponentOverrides {
  Button: typeof Button
  Popover: typeof Popover
  PopoverContent: typeof PopoverContent
  Sheet: typeof Sheet
  SheetContent: typeof SheetContent
}

const defaultComponents: IComponentOverrides = { Button, Popover, PopoverContent, Sheet, SheetContent }

export function JsonTextareaField<TFieldValues extends FieldValues>(
  props: IJsonTextareaFieldProps<TFieldValues> & { components?: IComponentOverrides },
): React.JSX.Element {
  const {
    control,
    name,
    label,
    description,
    className,
    actionsClassName,
    isEditable = true,
    allowArray = true,
    mode = 'inline',
    rows = 12,
    placeholder = '{\n  "theme": "dark"\n}',
    lineNumbers = true,
    lineHeightPx = 20,
    dir,
    lang,
    expandMode = 'sheet',
    sheetSide,
    sheetTitle = 'Edit JSON',
    text: textProp,
    onExpandEditor,
    components: componentOverrides,
  } = props

  const C = componentOverrides ?? defaultComponents
  // Resolved here because the sheet, popover, and dialog portal out of the DOM subtree that carries `dir`.
  const direction = useDirection(toDirection(dir))

  const t: Required<IJsonEditorText> = {
    format: textProp?.format ?? 'Format',
    cancel: textProp?.cancel ?? 'Cancel',
    save: textProp?.save ?? 'Save',
    full: textProp?.full ?? 'Full',
    close: textProp?.close ?? 'Close',
    keepEditing: textProp?.keepEditing ?? 'Keep editing',
    discard: textProp?.discard ?? 'Discard',
    discardTitle: textProp?.discardTitle ?? 'Discard changes?',
    discardDescription:
      textProp?.discardDescription ?? 'You have unsaved changes in the editor. If you close now, they will be lost.',
    statusHint: textProp?.statusHint ?? 'Ctrl/Cmd + Enter: Save, Esc: Cancel',
    sheetStatusHint: textProp?.sheetStatusHint ?? 'Ctrl/Cmd + Enter: Save, Esc: Close',
    unsavedChanges: textProp?.unsavedChanges ?? 'Unsaved changes',
    saved: textProp?.saved ?? 'Saved',
    nullPreview: textProp?.nullPreview ?? 'NULL',
    invalidJson: textProp?.invalidJson ?? 'Enter valid JSON.',
    notAnObject: textProp?.notAnObject ?? 'Enter a JSON object.',
  }

  const id = React.useId()
  const labelId = `${id}-label`
  const editorId = `${id}-editor`
  const previewId = `${id}-preview`
  const errorId = `${id}-error`
  const sheetErrorId = `${id}-sheet-error`
  const fieldErrorId = `${id}-field-error`
  const sheetFieldErrorId = `${id}-sheet-field-error`

  const { field, fieldState } = useController({ control, name })
  const committedText = React.useMemo(() => safeStringify(field.value), [field.value])

  const [draft, setDraft] = React.useState(committedText)
  const [dirty, setDirty] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [scrollTop, setScrollTop] = React.useState(0)

  React.useEffect(() => {
    if (dirty) return
    setDraft(committedText)
  }, [committedText, dirty])

  const [popoverOpen, setPopoverOpen] = React.useState(false)

  React.useEffect(() => {
    if (mode !== 'popover') {
      setPopoverOpen(false)
    }
  }, [mode])

  const [sheetOpen, setSheetOpen] = React.useState(false)
  const [sheetDraft, setSheetDraft] = React.useState('')
  const [sheetDirty, setSheetDirty] = React.useState(false)
  const [sheetError, setSheetError] = React.useState<string | null>(null)
  const [sheetScrollTop, setSheetScrollTop] = React.useState(0)
  const [confirmDiscardOpen, setConfirmDiscardOpen] = React.useState(false)

  const draftParsed = tryParseJson(draft)
  const sheetParsed = tryParseJson(sheetDraft)
  // Format is offered only for a draft that reads as a value, so its handler exists only then.
  const draftFormatted = draftParsed.ok && draftParsed.value !== null ? formatValue(draftParsed.value) : undefined
  const sheetFormatted = sheetParsed.ok && sheetParsed.value !== null ? formatValue(sheetParsed.value) : undefined

  // Commits the text when the field takes its value, and answers why when it does not.
  const commit = (text: string): string | null => {
    const parsed = tryParseJson(text)
    if (!parsed.ok) return `${t.invalidJson} ${parsed.message}`
    if (!allowArray && parsed.value !== null && !isObjectLike(parsed.value)) return t.notAnObject
    field.onChange(parsed.value)
    return null
  }

  const cancelInline = () => {
    setDraft(committedText)
    setDirty(false)
    setError(null)
    setPopoverOpen(false)
  }

  const saveInline = () => {
    if (!isEditable) return
    const refusal = commit(draft)
    setError(refusal)
    if (refusal) return
    setDirty(false)
    setPopoverOpen(false)
  }

  const formatInline = (formatted: string) => {
    setDraft(formatted)
    setDirty(true)
  }

  const inlineHotkeys = useJsonEditorHotkeys({
    enabled: mode === 'inline' || popoverOpen,
    onEscape: cancelInline,
    onSave: saveInline,
  })

  const openSheet = () => {
    setSheetDraft(draft)
    setSheetDirty(false)
    setSheetError(null)
    setSheetScrollTop(0)
    setSheetOpen(true)
  }

  const requestCloseSheet = () => {
    if (sheetDirty) setConfirmDiscardOpen(true)
    else setSheetOpen(false)
  }

  const discardSheetChanges = () => {
    setConfirmDiscardOpen(false)
    setSheetDirty(false)
    setSheetOpen(false)
  }

  const saveSheet = () => {
    if (!isEditable) return
    const refusal = commit(sheetDraft)
    setSheetError(refusal)
    if (refusal) return
    setDirty(false)
    setError(null)
    setSheetDirty(false)
    setSheetOpen(false)
  }

  const formatSheet = (formatted: string) => {
    setSheetDraft(formatted)
    setSheetDirty(true)
  }

  const sheetHotkeys = useJsonEditorHotkeys({
    enabled: sheetOpen,
    onEscape: requestCloseSheet,
    onSave: saveSheet,
  })

  const handleExpand = () => {
    if (expandMode === 'sheet') {
      openSheet()
      return
    }
    onExpandEditor?.({ name, rawText: draft, value: draftParsed.ok ? draftParsed.value : field.value })
  }

  let preview = committedText.replace(/\s+/g, ' ').trim() || t.nullPreview
  if (preview.length > 120) preview = `${preview.slice(0, 117)}...`

  const fieldError = fieldState.error?.message
  const describedBy = (...ids: Array<string | false>) => ids.filter(Boolean).join(' ') || undefined

  const inlineEditor = (
    <div className="space-y-2" data-slot="json-editor-inline">
      <JsonEditorView
        aria-describedby={describedBy(!!error && errorId, !!fieldError && fieldErrorId)}
        aria-invalid={!!(error || fieldState.error)}
        dir={direction}
        id={editorId}
        lang={lang}
        lineHeightPx={lineHeightPx}
        lineNumbers={lineNumbers}
        onChange={(value) => {
          setDraft(value)
          setDirty(true)
          setError(null)
        }}
        onKeyDown={inlineHotkeys}
        onScroll={setScrollTop}
        placeholder={placeholder}
        readOnly={!isEditable}
        rows={rows}
        scrollTop={scrollTop}
        value={draft}
      />

      <div
        className="flex items-center justify-between gap-2 text-muted-foreground text-xs"
        data-slot="json-editor-status">
        <span>{t.statusHint}</span>
        {dirty ? <span className="text-foreground">{t.unsavedChanges}</span> : <span>{t.saved}</span>}
      </div>

      <FieldError data-slot="json-editor-error" id={errorId}>
        {error}
      </FieldError>
    </div>
  )

  return (
    <Field
      className={cn('space-y-3', className)}
      data-invalid={!!(error || fieldState.error) || undefined}
      data-slot="json-editor-field"
      dir={direction}>
      <div className="mb-1 flex items-start justify-between gap-4" data-slot="json-editor-header">
        <div className="space-y-1">
          <FieldLabel className="font-semibold text-base" htmlFor={editorId} id={labelId}>
            {label}
          </FieldLabel>
          {description ? <FieldDescription>{description}</FieldDescription> : null}
        </div>

        <div className={cn('flex items-center gap-2', actionsClassName)} data-slot="json-editor-actions">
          <C.Button
            disabled={!isEditable || draftFormatted === undefined}
            onClick={draftFormatted === undefined ? undefined : () => formatInline(draftFormatted)}
            size="sm"
            type="button"
            variant="outline">
            {t.format}
          </C.Button>

          {dirty ? (
            <>
              <C.Button onClick={cancelInline} size="sm" type="button" variant="outline">
                {t.cancel}
              </C.Button>
              <C.Button disabled={!isEditable} onClick={saveInline} size="sm" type="button">
                {t.save}
              </C.Button>
            </>
          ) : null}

          {expandMode !== 'none' ? (
            <C.Button onClick={handleExpand} size="sm" type="button" variant="outline">
              <Maximize aria-hidden="true" size={14} />
              <span className="ms-2">{t.full}</span>
            </C.Button>
          ) : null}
        </div>
      </div>

      <div>
        {mode === 'inline' ? (
          inlineEditor
        ) : (
          <div data-slot="json-editor-popover">
            <C.Popover dir={direction} onOpenChange={setPopoverOpen} open={popoverOpen}>
              <PopoverTrigger asChild>
                <C.Button
                  aria-labelledby={`${labelId} ${previewId}`}
                  className="w-full justify-start overflow-hidden text-start font-mono text-xs"
                  type="button"
                  variant="outline">
                  <span className="truncate" dir="ltr" id={previewId}>
                    {preview}
                  </span>
                </C.Button>
              </PopoverTrigger>
              <C.PopoverContent className="w-[min(96vw,720px)] p-2">{inlineEditor}</C.PopoverContent>
            </C.Popover>
          </div>
        )}
      </div>

      <FieldError errors={[fieldState.error]} id={fieldErrorId} />

      {expandMode === 'sheet' ? (
        <C.Sheet dir={direction} onOpenChange={requestCloseSheet} open={sheetOpen}>
          <C.SheetContent className="w-full sm:max-w-3xl" hideClose side={sheetSide ?? 'right'}>
            <SheetHeader>
              <SheetTitle>{sheetTitle}</SheetTitle>
            </SheetHeader>

            <div className="mt-4 space-y-3" data-slot="json-editor-sheet-content">
              <JsonEditorView
                aria-describedby={describedBy(!!sheetError && sheetErrorId, !!fieldError && sheetFieldErrorId)}
                aria-invalid={!!(sheetError || fieldState.error)}
                aria-labelledby={labelId}
                dir={direction}
                lang={lang}
                lineHeightPx={lineHeightPx}
                lineNumbers={lineNumbers}
                onChange={(value) => {
                  setSheetDraft(value)
                  setSheetDirty(true)
                  setSheetError(null)
                }}
                onKeyDown={sheetHotkeys}
                onScroll={setSheetScrollTop}
                placeholder={placeholder}
                readOnly={!isEditable}
                rows={24}
                scrollTop={sheetScrollTop}
                value={sheetDraft}
              />

              <FieldError data-slot="json-editor-sheet-error" id={sheetErrorId}>
                {sheetError}
              </FieldError>
              {/* The sheet hides the page behind it, the field's own error with it. */}
              <FieldError errors={[fieldState.error]} id={sheetFieldErrorId} />

              <div className="flex items-center justify-between gap-2" data-slot="json-editor-sheet-actions">
                <div className="text-muted-foreground text-xs">{t.sheetStatusHint}</div>

                <div className="flex items-center gap-2">
                  <C.Button
                    disabled={!isEditable || sheetFormatted === undefined}
                    onClick={sheetFormatted === undefined ? undefined : () => formatSheet(sheetFormatted)}
                    size="sm"
                    type="button"
                    variant="outline">
                    {t.format}
                  </C.Button>

                  <C.Button onClick={requestCloseSheet} size="sm" type="button" variant="outline">
                    {t.close}
                  </C.Button>

                  <C.Button disabled={!isEditable} onClick={saveSheet} size="sm" type="button">
                    {t.save}
                  </C.Button>
                </div>
              </div>
            </div>
          </C.SheetContent>
        </C.Sheet>
      ) : null}

      <Portal>
        <AlertDialog dir={direction} onOpenChange={setConfirmDiscardOpen} open={confirmDiscardOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t.discardTitle}</AlertDialogTitle>
              <AlertDialogDescription>{t.discardDescription}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel asChild onClick={() => setConfirmDiscardOpen(false)}>
                <C.Button variant="outline" size="sm">
                  {t.keepEditing}
                </C.Button>
              </AlertDialogCancel>
              <AlertDialogAction asChild onClick={discardSheetChanges}>
                <C.Button variant="default" size="sm">
                  {t.discard}
                </C.Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Portal>
    </Field>
  )
}
JsonTextareaField.displayName = 'JsonTextareaField'
