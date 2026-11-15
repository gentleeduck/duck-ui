import { afterEach, describe, expect, test } from 'bun:test'
import { DirectionProvider } from '@gentleduck/primitives/direction'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import { MotionTextarea } from '../motion-textarea'
import { Textarea } from '../textarea'

afterEach(cleanup)

const wait = (ms: number) => act(() => new Promise<void>((resolve) => setTimeout(resolve, ms)))

describe('registry-ui Textarea', () => {
  test('passes its ref, attributes and changes to the textarea, and lets a class of its own win', () => {
    const ref = React.createRef<HTMLTextAreaElement>()
    const typed: string[] = []

    render(
      <Textarea
        aria-label="Message"
        className="min-h-32"
        maxLength={20}
        onChange={(event) => typed.push(event.target.value)}
        ref={ref}
        rows={4}
      />,
    )
    const textarea = screen.getByRole('textbox', { name: 'Message' })
    fireEvent.change(textarea, { target: { value: 'hello' } })

    expect(ref.current).toBe(textarea as HTMLTextAreaElement)
    expect(textarea.dataset.slot).toBe('textarea')
    expect(textarea.getAttribute('rows')).toBe('4')
    expect(textarea.getAttribute('maxlength')).toBe('20')
    expect(textarea.className.split(' ')).toContain('min-h-32')
    expect(textarea.className.split(' ')).not.toContain('min-h-16')
    expect(typed).toEqual(['hello'])
  })

  test('takes its direction from a provider, from its own dir before that, and keeps dir="auto" for the text to decide', () => {
    render(
      <DirectionProvider dir="rtl">
        <Textarea aria-label="Inherited" />
        <Textarea aria-label="Own" dir="ltr" />
        <Textarea aria-label="Auto" dir="auto" />
      </DirectionProvider>,
    )

    expect(screen.getByRole('textbox', { name: 'Inherited' }).getAttribute('dir')).toBe('rtl')
    expect(screen.getByRole('textbox', { name: 'Own' }).getAttribute('dir')).toBe('ltr')
    expect(screen.getByRole('textbox', { name: 'Auto' }).getAttribute('dir')).toBe('auto')
  })

  test('draws aria-invalid, aria-warning and aria-disabled the way Input does', () => {
    render(<Textarea aria-label="Message" />)
    const classes = screen.getByRole('textbox').className.split(' ')

    for (const name of ['aria-invalid:border-destructive', 'aria-warning:border-warning', 'aria-disabled:opacity-50']) {
      expect(classes).toContain(name)
    }
  })
})

describe('registry-ui MotionTextarea', () => {
  test('scales the textarea in inside a full-width wrapper, and forwards the ref to the textarea', async () => {
    const ref = React.createRef<HTMLTextAreaElement>()

    render(<MotionTextarea aria-label="Message" ref={ref} />)
    const textarea = screen.getByRole('textbox', { name: 'Message' })
    const wrapper = textarea.parentElement as HTMLElement

    expect(ref.current).toBe(textarea as HTMLTextAreaElement)
    expect(wrapper.classList.contains('w-full')).toBe(true)
    expect(Number(wrapper.style.opacity)).toBe(0)

    for (let frame = 0; frame < 20 && wrapper.style.opacity !== '1'; frame++) await wait(100)

    expect(wrapper.style.opacity).toBe('1')
  })
})
