import { DirectionProvider } from '@gentleduck/primitives/direction'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import { afterEach, describe, expect, test, vi } from 'vitest'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from '../input-group'
import { MotionInputGroup } from '../motion-input-group'

afterEach(cleanup)

const classes = (element: Element | null) => (element as HTMLElement).className.split(' ')

describe('registry-ui InputGroup', () => {
  test('joins an input and its addons in one group, each marked by its slot', () => {
    render(
      <InputGroup data-testid="group">
        <InputGroupInput aria-label="Pond" />
        <InputGroupAddon>
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">
          <InputGroupButton>Copy</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>,
    )

    const group = screen.getByTestId('group')
    expect(group.getAttribute('role')).toBe('group')
    expect(group.getAttribute('data-slot')).toBe('input-group')
    expect(group.getAttribute('dir')).toBe('ltr')
    const input = screen.getByRole('textbox', { name: 'Pond' })
    expect(input.getAttribute('data-slot')).toBe('input-group-control')
    expect(input.getAttribute('dir')).toBe('ltr')
    expect(classes(input)).toContain('border-0')
    const start = screen.getByText('https://').parentElement as HTMLElement
    expect(start.getAttribute('data-slot')).toBe('input-group-addon')
    expect(start.getAttribute('data-align')).toBe('inline-start')
    expect(classes(start)).toContain('order-first')
    const button = screen.getByRole('button', { name: 'Copy' })
    expect(button.getAttribute('type')).toBe('button')
    expect(button.getAttribute('data-size')).toBe('xs')
    expect(classes(button)).toContain('h-6')
    expect(classes(button.parentElement)).toContain('order-last')
  })

  test('puts an addon above or below a textarea', () => {
    render(
      <InputGroup>
        <InputGroupTextarea aria-label="Note" />
        <InputGroupAddon align="block-start">Title</InputGroupAddon>
        <InputGroupAddon align="block-end">
          <InputGroupButton size="icon-sm">Send</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>,
    )

    expect(screen.getByRole('textbox', { name: 'Note' }).getAttribute('data-slot')).toBe('input-group-control')
    expect(screen.getByText('Title').getAttribute('data-align')).toBe('block-start')
    expect(classes(screen.getByText('Title'))).toContain('order-first')
    const send = screen.getByRole('button', { name: 'Send' })
    expect(send.parentElement?.getAttribute('data-align')).toBe('block-end')
    expect(classes(send)).toContain('size-8')
  })

  test('focuses its input from a click on an addon, but not from a button in one', () => {
    render(
      <InputGroup>
        <InputGroupInput aria-label="Pond" />
        <InputGroupAddon>Search</InputGroupAddon>
        <InputGroupAddon align="inline-end">
          <InputGroupButton>Clear</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Clear' }))
    expect(document.activeElement).toBe(document.body)
    fireEvent.click(screen.getByText('Search'))
    expect(document.activeElement).toBe(screen.getByRole('textbox', { name: 'Pond' }))
  })

  test('focuses a textarea, a control of your own, or a plain input, from a click on an addon', () => {
    render(
      <>
        <InputGroup>
          <InputGroupTextarea aria-label="Note" />
          <InputGroupAddon align="block-end">Markdown</InputGroupAddon>
        </InputGroup>
        <InputGroup>
          <textarea aria-label="Feedback" data-slot="input-group-control" />
          <InputGroupAddon align="block-end">Feedback hint</InputGroupAddon>
        </InputGroup>
        <InputGroup>
          <input aria-label="Plain" />
          <InputGroupAddon>Plain hint</InputGroupAddon>
        </InputGroup>
      </>,
    )

    fireEvent.click(screen.getByText('Markdown'))
    expect(document.activeElement).toBe(screen.getByRole('textbox', { name: 'Note' }))
    fireEvent.click(screen.getByText('Feedback hint'))
    expect(document.activeElement).toBe(screen.getByRole('textbox', { name: 'Feedback' }))
    fireEvent.click(screen.getByText('Plain hint'))
    expect(document.activeElement).toBe(screen.getByRole('textbox', { name: 'Plain' }))
  })

  test("runs an addon's own onClick before the focus, which it can prevent", () => {
    const onClick = vi.fn()
    render(
      <InputGroup>
        <InputGroupInput aria-label="Pond" />
        <InputGroupAddon onClick={onClick}>Counted</InputGroupAddon>
        <InputGroupAddon onClick={(event) => event.preventDefault()}>Kept</InputGroupAddon>
      </InputGroup>,
    )

    fireEvent.click(screen.getByText('Kept'))
    expect(document.activeElement).toBe(document.body)
    fireEvent.click(screen.getByText('Counted'))
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(document.activeElement).toBe(screen.getByRole('textbox', { name: 'Pond' }))
  })

  test('takes its direction from a provider, from its own dir before that, and keeps auto for the text to decide', () => {
    render(
      <DirectionProvider dir="rtl">
        <InputGroup data-testid="inherited">
          <InputGroupInput aria-label="Inherited" />
          <InputGroupInput aria-label="Auto" dir="auto" />
        </InputGroup>
        <InputGroup data-testid="own" dir="ltr">
          <InputGroupInput aria-label="Own" dir="ltr" />
        </InputGroup>
      </DirectionProvider>,
    )

    expect(screen.getByTestId('inherited').getAttribute('dir')).toBe('rtl')
    expect(screen.getByRole('textbox', { name: 'Inherited' }).getAttribute('dir')).toBe('rtl')
    expect(screen.getByTestId('own').getAttribute('dir')).toBe('ltr')
    expect(screen.getByRole('textbox', { name: 'Own' }).getAttribute('dir')).toBe('ltr')
    expect(screen.getByRole('textbox', { name: 'Auto' }).getAttribute('dir')).toBe('auto')
  })

  test('MotionInputGroup scales the group in', () => {
    render(
      <MotionInputGroup data-testid="group" index={2}>
        <InputGroupInput aria-label="Pond" />
      </MotionInputGroup>,
    )

    const group = screen.getByTestId('group')
    expect(group.getAttribute('data-slot')).toBe('input-group')
    expect((group.parentElement as HTMLElement).style.transform).toContain('scale(')
  })
})
