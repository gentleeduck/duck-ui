import { afterEach, describe, expect, mock, test } from 'bun:test'
import { DirectionProvider } from '@gentleduck/primitives/direction'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import { Checkbox } from '../../checkbox'
import { Switch } from '../../switch'
import { Label } from '../label'
import { MotionLabel } from '../motion-label'

afterEach(cleanup)

// The selectors the label's has-disabled: and [:where(.peer):disabled+&]: variants compile to.
const AFTER_DISABLED_PEER = ':where(.peer):disabled + *'
const AROUND_DISABLED = ':has(:disabled)'

describe('registry-ui Label', () => {
  test('names the control it points at, and takes the direction around it', () => {
    const ref = React.createRef<HTMLLabelElement>()
    render(
      <DirectionProvider dir="rtl">
        <Label className="text-base" htmlFor="email" ref={ref}>
          Email
        </Label>
        <input id="email" />
        <Label dir="ltr">Code</Label>
      </DirectionProvider>,
    )

    const label = screen.getByText('Email')
    expect(screen.getByLabelText('Email').id).toBe('email')
    expect(ref.current).toBe(label as HTMLLabelElement)
    expect(label.getAttribute('data-slot')).toBe('label')
    expect(label.getAttribute('dir')).toBe('rtl')
    expect(label.className.split(' ')).toContain('text-base')
    expect(label.className.split(' ')).not.toContain('text-sm')
    expect(screen.getByText('Code').getAttribute('dir')).toBe('ltr')
  })

  test('dims right after a disabled checkbox or switch, and around a disabled control', () => {
    render(
      <>
        <div>
          <Checkbox disabled id="a" />
          <Label htmlFor="a">After a checkbox</Label>
          <Checkbox id="c" />
          <Label htmlFor="c">After an enabled checkbox</Label>
        </div>
        <div>
          <Switch disabled id="b" />
          <Label htmlFor="b">After a switch</Label>
        </div>
        <Label>
          <input disabled /> Around an input
        </Label>
      </>,
    )

    const label = (text: string) => screen.getByText(text, { exact: false })
    expect(label('After a checkbox').matches(AFTER_DISABLED_PEER)).toBe(true)
    expect(label('After a switch').matches(AFTER_DISABLED_PEER)).toBe(true)
    expect(label('After an enabled checkbox').matches(AFTER_DISABLED_PEER)).toBe(false)
    expect(label('Around an input').matches(AROUND_DISABLED)).toBe(true)
    for (const variant of ['[:where(.peer):disabled+&]:opacity-70', 'has-disabled:opacity-70']) {
      expect(label('Around an input').className.split(' ')).toContain(variant)
    }
  })

  test('keeps a double click from selecting its text, but not inside a control it holds', () => {
    const onMouseDown = mock((event: React.MouseEvent) => {
      if (event.button === 1) event.preventDefault()
    })
    render(
      <Label onMouseDown={onMouseDown}>
        Remember me <input type="checkbox" />
      </Label>,
    )

    const label = screen.getByText('Remember me', { exact: false })
    expect(fireEvent.mouseDown(label, { detail: 1 })).toBe(true)
    expect(fireEvent.mouseDown(label, { detail: 2 })).toBe(false)
    expect(fireEvent.mouseDown(screen.getByRole('checkbox'), { detail: 2 })).toBe(true)
    expect(fireEvent.mouseDown(label, { button: 1, detail: 1 })).toBe(false)
    expect(onMouseDown).toHaveBeenCalledTimes(4)
  })
})

describe('registry-ui MotionLabel', () => {
  test('scales the label in and keeps its index off the element', () => {
    render(
      <MotionLabel htmlFor="name" index={1}>
        Name
      </MotionLabel>,
    )

    const label = screen.getByText('Name')
    expect((label.parentElement as HTMLElement).style.transform).toContain('scale(')
    expect(label.hasAttribute('index')).toBe(false)
  })
})
