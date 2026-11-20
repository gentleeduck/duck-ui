import { DirectionProvider } from '@gentleduck/primitives/direction'
import { cleanup, render, screen } from '@testing-library/react'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, test } from 'vitest'
import { Input } from '../input'
import { MotionInput } from '../motion-input'

afterEach(cleanup)

describe('registry-ui input', () => {
  test('Input is as tall as the select and button beside it, with the same shadow', () => {
    const html = renderToStaticMarkup(<Input />)

    expect(html).toContain('h-9')
    expect(html).toContain('shadow-xs')
  })

  test('passes its type, ref and attributes to the input, and lets a class of its own win', () => {
    const ref = React.createRef<HTMLInputElement>()
    render(<Input aria-invalid="true" aria-label="Pond" className="h-12" ref={ref} type="email" />)

    const input = screen.getByRole('textbox', { name: 'Pond' })
    expect(ref.current).toBe(input as HTMLInputElement)
    expect(input.getAttribute('type')).toBe('email')
    expect(input.getAttribute('data-slot')).toBe('input')
    expect(input.className.split(' ')).toContain('h-12')
    expect(input.className.split(' ')).not.toContain('h-9')
    expect(input.className.split(' ')).toContain('aria-invalid:border-destructive')
  })

  test('takes its direction from a provider, from its own dir before that, and keeps dir="auto" for the text to decide', () => {
    render(
      <DirectionProvider dir="rtl">
        <Input aria-label="Inherited" />
        <Input aria-label="Own" dir="ltr" />
        <Input aria-label="Auto" dir="auto" />
      </DirectionProvider>,
    )

    expect(screen.getByRole('textbox', { name: 'Inherited' }).getAttribute('dir')).toBe('rtl')
    expect(screen.getByRole('textbox', { name: 'Own' }).getAttribute('dir')).toBe('ltr')
    expect(screen.getByRole('textbox', { name: 'Auto' }).getAttribute('dir')).toBe('auto')
  })

  test('MotionInput scales the input in, and keeps its index off the input', () => {
    const ref = React.createRef<HTMLInputElement>()
    render(<MotionInput aria-label="Pond" index={2} ref={ref} />)

    const input = screen.getByRole('textbox', { name: 'Pond' })
    expect(ref.current).toBe(input as HTMLInputElement)
    expect((input.parentElement as HTMLElement).style.transform).toContain('scale(')
    expect(input.hasAttribute('index')).toBe(false)
  })
})
