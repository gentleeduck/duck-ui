import { afterEach, beforeAll, describe, expect, mock, test } from 'bun:test'
import { DirectionProvider } from '@gentleduck/primitives/direction'
import { act, cleanup, fireEvent, render, renderHook, screen, within } from '@testing-library/react'
import * as React from 'react'
import { type Control, useForm, useWatch } from 'react-hook-form'
import { JsonTextareaField } from '../json-editor'
import { useJsonEditorHotkeys } from '../json-editor.hooks'
import { formatJson, isObjectLike, safeStringify, tryParseJson } from '../json-editor.libs'
import type { IJsonTextareaFieldProps } from '../json-editor.types'
import { MotionJsonTextareaField } from '../motion-json-editor'

// jsdom has no ResizeObserver, which the popover measures its arrow with.
beforeAll(() => {
  Object.assign(globalThis, {
    ResizeObserver: class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  })
})

afterEach(cleanup)

interface IValues {
  settings: unknown
}

type IHarnessProps = Partial<IJsonTextareaFieldProps<IValues>> & { value?: unknown; formError?: string }

function Committed({ control }: { control: Control<IValues> }) {
  const value = useWatch({ control, name: 'settings' })
  return <output data-testid="committed">{JSON.stringify(value) ?? 'undefined'}</output>
}

function Harness({ value = { theme: 'dark' }, formError, ...props }: IHarnessProps) {
  const form = useForm<IValues>({ defaultValues: { settings: value } })
  React.useEffect(() => {
    if (formError) form.setError('settings', { message: formError })
  }, [form, formError])
  return (
    <>
      <JsonTextareaField control={form.control} label="Settings" name="settings" {...props} />
      <Committed control={form.control} />
    </>
  )
}

const editor = () => screen.getByRole('textbox', { name: 'Settings' }) as HTMLTextAreaElement
const committed = () => screen.getByTestId('committed').textContent
const type = (textarea: HTMLElement, value: string) => fireEvent.change(textarea, { target: { value } })
const save = (textarea: HTMLElement) => fireEvent.keyDown(textarea, { ctrlKey: true, key: 'Enter' })

describe('registry-ui JsonTextareaField', () => {
  test('the label names the editor, which shows the value as JSON with a number per line', () => {
    render(<Harness />)

    expect(editor().value).toBe('{\n  "theme": "dark"\n}')
    expect(screen.getByText('Saved')).toBeTruthy()
    expect(document.querySelector('[data-slot="json-editor-line-numbers"]')?.textContent).toBe('1\n2\n3')
    expect((screen.getByText('Settings') as HTMLLabelElement).control).toBe(editor())
  })

  test('saves on Ctrl or Cmd and Enter, and Escape or Cancel puts the saved value back', () => {
    render(<Harness />)

    type(editor(), '{"theme":"light"}')
    expect(screen.getByText('Unsaved changes')).toBeTruthy()
    save(editor())
    expect(committed()).toBe('{"theme":"light"}')
    expect(editor().value).toBe('{\n  "theme": "light"\n}')
    expect(screen.queryByRole('button', { name: 'Save' })).toBeNull()

    type(editor(), '{"theme":"blue"}')
    fireEvent.keyDown(editor(), { key: 'Escape' })
    expect(editor().value).toBe('{\n  "theme": "light"\n}')

    type(editor(), '{"theme":"blue"}')
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(editor().value).toBe('{\n  "theme": "light"\n}')

    type(editor(), '{"theme":"teal"}')
    fireEvent.keyDown(editor(), { key: 'Enter', metaKey: true })
    expect(committed()).toBe('{"theme":"teal"}')

    type(editor(), '{"theme":"pink"}')
    fireEvent.keyDown(editor(), { key: 'Enter' })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(committed()).toBe('{"theme":"pink"}')
  })

  test('Format pretty-prints the draft, and is off while the draft is empty or not JSON', () => {
    render(<Harness value={null} />)

    const format = screen.getByRole('button', { name: 'Format' }) as HTMLButtonElement
    expect(editor().value).toBe('')
    expect(format.disabled).toBe(true)
    type(editor(), '{"a":')
    expect(format.disabled).toBe(true)
    type(editor(), '{"a":[1,2]}')
    fireEvent.click(format)
    expect(editor().value).toBe('{\n  "a": [\n    1,\n    2\n  ]\n}')
    expect(committed()).toBe('null')
  })

  test('refuses JSON it cannot read, beside the editor, until the draft changes', () => {
    render(<Harness />)

    type(editor(), '{bad')
    save(editor())
    const alert = screen.getByRole('alert')
    expect(alert.textContent).toStartWith('Enter valid JSON.')
    expect(editor().getAttribute('aria-invalid')).toBe('true')
    expect(editor().getAttribute('aria-describedby')).toContain(alert.id)
    expect(committed()).toBe('{"theme":"dark"}')

    type(editor(), '{bad}')
    expect(screen.queryByRole('alert')).toBeNull()
    expect(editor().getAttribute('aria-invalid')).toBe('false')
  })

  test('with allowArray off takes only an object, or nothing', () => {
    render(<Harness allowArray={false} />)

    type(editor(), '[1]')
    save(editor())
    expect(screen.getByRole('alert').textContent).toBe('Enter a JSON object.')
    type(editor(), '42')
    save(editor())
    expect(screen.getByRole('alert').textContent).toBe('Enter a JSON object.')
    type(editor(), '{"a":1}')
    save(editor())
    expect(committed()).toBe('{"a":1}')
    type(editor(), '  ')
    save(editor())
    expect(committed()).toBe('null')
  })

  test('takes any JSON value by default, and shows a string quoted so it saves again unchanged', () => {
    render(<Harness value="dark" />)

    expect(editor().value).toBe('"dark"')
    type(editor(), '[1, 2]')
    save(editor())
    expect(committed()).toBe('[1,2]')
    type(editor(), '"light"')
    save(editor())
    expect(committed()).toBe('"light"')
    expect(editor().value).toBe('"light"')
    save(editor())
    expect(screen.queryByRole('alert')).toBeNull()
  })

  test('shows a string holding JSON text as that text', () => {
    render(<Harness value={'{"theme":"dark"}'} />)

    expect(editor().value).toBe('{"theme":"dark"}')
    type(editor(), '{"theme":"dim"}')
    save(editor())
    expect(committed()).toBe('{"theme":"dim"}')
  })

  test('read only: nothing formats or saves, from a button or a key', () => {
    render(<Harness isEditable={false} />)

    expect(editor().readOnly).toBe(true)
    expect((screen.getByRole('button', { name: 'Format' }) as HTMLButtonElement).disabled).toBe(true)
    type(editor(), '{"theme":"light"}')
    expect((screen.getByRole('button', { name: 'Save' }) as HTMLButtonElement).disabled).toBe(true)
    save(editor())
    expect(committed()).toBe('{"theme":"dark"}')
  })

  test("a form's own error marks the editor invalid and describes it", () => {
    render(<Harness formError="Settings are required." />)

    const alert = screen.getByRole('alert')
    expect(alert.textContent).toBe('Settings are required.')
    expect(editor().getAttribute('aria-invalid')).toBe('true')
    expect(editor().getAttribute('aria-describedby')).toContain(alert.id)
    expect(document.querySelector('[data-slot="json-editor-field"]')?.getAttribute('data-invalid')).toBe('true')
  })

  test('translates every string it shows, a refusal included', () => {
    render(
      <Harness
        allowArray={false}
        expandMode="sheet"
        text={{
          cancel: 'Annuler',
          format: 'Formater',
          full: 'Plein',
          invalidJson: 'JSON invalide.',
          notAnObject: 'Un objet JSON.',
          saved: 'Enregistre',
          statusHint: 'Raccourcis',
          unsavedChanges: 'Modifie',
        }}
      />,
    )

    expect(screen.getByRole('button', { name: 'Formater' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Plein' })).toBeTruthy()
    expect(screen.getByText('Raccourcis')).toBeTruthy()
    expect(screen.getByText('Enregistre')).toBeTruthy()
    type(editor(), '[')
    expect(screen.getByText('Modifie')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Annuler' })).toBeTruthy()
    save(editor())
    expect(screen.getByRole('alert').textContent).toStartWith('JSON invalide.')
    type(editor(), '[]')
    save(editor())
    expect(screen.getByRole('alert').textContent).toBe('Un objet JSON.')
  })

  test('in popover mode a trigger previews the value and opens the editor', () => {
    const long = { notes: 'x'.repeat(200) }
    const { unmount } = render(<Harness mode="popover" value={null} />)

    expect(screen.getByRole('button', { name: 'Settings NULL' })).toBeTruthy()
    unmount()
    render(<Harness mode="popover" value={long} />)

    const trigger = screen.getByRole('button', { name: /^Settings \{ "notes"/ })
    expect(trigger.textContent).toHaveLength(120)
    expect(trigger.textContent).toEndWith('...')
    fireEvent.click(trigger)
    type(editor(), '{"a":1}')
    save(editor())
    expect(committed()).toBe('{"a":1}')
    expect(screen.queryByRole('textbox')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Settings { "a": 1 }' }))
    type(editor(), '{"a":2}')
    fireEvent.keyDown(editor(), { key: 'Escape' })
    expect(screen.queryByRole('textbox')).toBeNull()
    expect(committed()).toBe('{"a":1}')

    fireEvent.click(screen.getByRole('button', { name: 'Settings { "a": 1 }' }))
    type(editor(), '{"a":3}')
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByRole('textbox')).toBeNull()
  })

  test('a popover left open closes when the mode turns inline', () => {
    function Switcher() {
      const [mode, setMode] = React.useState<'inline' | 'popover'>('popover')
      return (
        <>
          <button onClick={() => setMode('inline')} type="button">
            Inline
          </button>
          <Harness mode={mode} />
        </>
      )
    }
    render(<Switcher />)

    fireEvent.click(screen.getByRole('button', { name: /^Settings/ }))
    expect(document.querySelector('[data-slot="json-editor-popover"]')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Inline' }))
    expect(document.querySelector('[data-slot="json-editor-popover"]')).toBeNull()
    expect(screen.getAllByRole('textbox')).toHaveLength(1)
  })

  test('Full opens the draft in a sheet that saves it, and asks before dropping changes', () => {
    render(<Harness />)

    type(editor(), '{"theme":"draft"}')
    fireEvent.click(screen.getByRole('button', { name: 'Full' }))
    let sheet = screen.getByRole('dialog', { name: 'Edit JSON' })
    const sheetEditor = within(sheet).getByRole('textbox', { name: 'Settings' }) as HTMLTextAreaElement
    expect(sheetEditor.value).toBe('{"theme":"draft"}')
    expect(sheetEditor.rows).toBe(24)
    fireEvent.click(within(sheet).getByRole('button', { name: 'Format' }))
    expect(sheetEditor.value).toBe('{\n  "theme": "draft"\n}')

    fireEvent.click(within(sheet).getByRole('button', { name: 'Close' }))
    fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }))
    expect(screen.getByRole('dialog', { name: 'Edit JSON' })).toBeTruthy()
    fireEvent.keyDown(sheetEditor, { key: 'Escape' })
    fireEvent.click(screen.getByRole('button', { name: 'Discard' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(committed()).toBe('{"theme":"dark"}')

    fireEvent.click(screen.getByRole('button', { name: 'Full' }))
    sheet = screen.getByRole('dialog', { name: 'Edit JSON' })
    expect(within(sheet).getAllByRole('button', { name: 'Close' })).toHaveLength(1)
    const next = within(sheet).getByRole('textbox', { name: 'Settings' })
    type(next, '{bad')
    fireEvent.click(within(sheet).getByRole('button', { name: 'Save' }))
    expect(within(sheet).getByRole('alert').textContent).toStartWith('Enter valid JSON.')
    expect(next.getAttribute('aria-invalid')).toBe('true')
    type(next, '{"theme":"sheet"}')
    save(next)
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(committed()).toBe('{"theme":"sheet"}')

    fireEvent.click(screen.getByRole('button', { name: 'Full' }))
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  test('the sheet slides from the side asked for, under its own title', () => {
    render(<Harness sheetSide="left" sheetTitle="Edit settings" />)

    fireEvent.click(screen.getByRole('button', { name: 'Full' }))
    const sheet = screen.getByRole('dialog', { name: 'Edit settings' })
    expect(sheet.className.split(' ')).toContain('start-0')
  })

  test('with expandMode callback, Full hands the draft and its value to onExpandEditor', () => {
    const onExpandEditor = mock()
    render(<Harness expandMode="callback" onExpandEditor={onExpandEditor} />)

    type(editor(), '{"a":1}')
    fireEvent.click(screen.getByRole('button', { name: 'Full' }))
    expect(onExpandEditor).toHaveBeenLastCalledWith({ name: 'settings', rawText: '{"a":1}', value: { a: 1 } })
    type(editor(), '{bad')
    fireEvent.click(screen.getByRole('button', { name: 'Full' }))
    expect(onExpandEditor).toHaveBeenLastCalledWith({ name: 'settings', rawText: '{bad', value: { theme: 'dark' } })
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  test('with expandMode none there is no Full', () => {
    render(<Harness expandMode="none" />)

    expect(screen.queryByRole('button', { name: 'Full' })).toBeNull()
  })

  test('numbers the lines in the digits of its lang, unless the tag names its own', () => {
    render(
      <>
        <Harness lang="ar" value={{ a: 1 }} />
        <Harness lang="ar-u-ca-islamic" value={{ a: 1 }} />
        <Harness lang="ar-u-nu-latn" value={{ a: 1 }} />
        <Harness lang="en" value={{ a: 1 }} />
      </>,
    )

    const gutters = Array.from(document.querySelectorAll('[data-slot="json-editor-line-numbers"]'))
    expect(gutters.map((gutter) => gutter.textContent)).toEqual(['١\n٢\n٣', '١\n٢\n٣', '1\n2\n3', '1\n2\n3'])
  })

  test('keeps the gutter beside the lines as the editor scrolls, and leaves it out when asked', () => {
    const { unmount } = render(<Harness lineHeightPx={24} />)

    const textarea = editor()
    textarea.scrollTop = 40
    fireEvent.scroll(textarea)
    const gutter = document.querySelector<HTMLElement>('[data-slot="json-editor-line-numbers"]')
    expect(gutter?.style.transform).toBe('translateY(-40px)')
    expect(gutter?.style.lineHeight).toBe('24px')
    unmount()
    render(<Harness lineNumbers={false} />)

    expect(document.querySelector('[data-slot="json-editor-gutter"]')).toBeNull()
  })

  test('mirrors its chrome in RTL while the JSON stays LTR', () => {
    render(
      <DirectionProvider dir="rtl">
        <Harness />
      </DirectionProvider>,
    )

    expect(document.querySelector('[data-slot="json-editor-field"]')?.getAttribute('dir')).toBe('rtl')
    expect(document.querySelector('[data-slot="json-editor-shell"]')?.getAttribute('dir')).toBe('rtl')
    expect(document.querySelector('[data-slot="json-editor-container"]')?.getAttribute('dir')).toBe('ltr')
    expect(editor().getAttribute('dir')).toBe('ltr')
  })

  test('MotionJsonTextareaField scales the field in', () => {
    function MotionHarness() {
      const form = useForm<IValues>({ defaultValues: { settings: { a: 1 } } })
      return <MotionJsonTextareaField control={form.control} label="Settings" name="settings" />
    }
    render(<MotionHarness />)

    const field = document.querySelector('[data-slot="json-editor-field"]') as HTMLElement
    expect((field.parentElement as HTMLElement).style.transform).toContain('scale(')
    expect(editor().value).toBe('{\n  "a": 1\n}')
  })
})

describe('registry-ui json editor libs', () => {
  test('safeStringify writes a value as JSON, a string holding JSON as itself, and nothing for the rest', () => {
    const loop: Record<string, unknown> = {}
    loop.self = loop

    expect(safeStringify({ a: [1] })).toBe('{\n  "a": [\n    1\n  ]\n}')
    expect(safeStringify(3)).toBe('3')
    expect(safeStringify('dark')).toBe('"dark"')
    expect(safeStringify('[1]')).toBe('[1]')
    expect(safeStringify(null)).toBe('')
    expect(safeStringify(undefined)).toBe('')
    expect(safeStringify(loop)).toBe('')
  })

  test('tryParseJson reads blank as null and names what it could not read', () => {
    expect(tryParseJson('  ')).toEqual({ ok: true, value: null })
    expect(tryParseJson('[1]')).toEqual({ ok: true, value: [1] })
    const refused = tryParseJson('{bad')
    expect(refused.ok).toBe(false)
    expect(refused.ok ? '' : refused.message).not.toBe('')
  })

  test('formatJson pretty-prints, leaves blank blank, and passes a refusal on', () => {
    expect(formatJson('{"a":1}')).toEqual({ formatted: '{\n  "a": 1\n}', ok: true })
    expect(formatJson('')).toEqual({ formatted: '', ok: true })
    expect(formatJson('{').ok).toBe(false)
  })

  test('isObjectLike takes an object and nothing else', () => {
    expect([{}, [], null, 'a', 1].map(isObjectLike)).toEqual([true, false, false, false, false])
  })
})

describe('registry-ui useJsonEditorHotkeys', () => {
  const keyDown = (init: Partial<React.KeyboardEvent<HTMLTextAreaElement>>) =>
    ({ preventDefault: mock(), ...init }) as unknown as React.KeyboardEvent<HTMLTextAreaElement>

  test('calls onSave on Ctrl or Cmd and Enter and onEscape on Escape, only while enabled', () => {
    const onEscape = mock()
    const onSave = mock()
    const { result, rerender } = renderHook(({ enabled }) => useJsonEditorHotkeys({ enabled, onEscape, onSave }), {
      initialProps: { enabled: true },
    })

    const escape = keyDown({ key: 'Escape' })
    act(() => result.current(escape))
    act(() => result.current(keyDown({ ctrlKey: true, key: 'Enter' })))
    act(() => result.current(keyDown({ key: 'Enter', metaKey: true })))
    act(() => result.current(keyDown({ key: 'a' })))
    expect(escape.preventDefault).toHaveBeenCalledTimes(1)
    expect([onEscape.mock.calls.length, onSave.mock.calls.length]).toEqual([1, 2])

    const first = result.current
    rerender({ enabled: true })
    expect(result.current).toBe(first)
    rerender({ enabled: false })
    act(() => result.current(keyDown({ key: 'Escape' })))
    expect(onEscape).toHaveBeenCalledTimes(1)
  })
})
