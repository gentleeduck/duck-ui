import { DirectionProvider } from '@gentleduck/primitives/direction'
import { cleanup, render, screen } from '@testing-library/react'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, test } from 'vitest'
import { Checkbox } from '../../checkbox'
import { RadioGroup, RadioGroupItem } from '../../radio-group'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from '../field'
import { MotionField, MotionFieldError, MotionFieldGroup } from '../motion-field'

afterEach(cleanup)

const classes = (element: Element | null) => (element as HTMLElement).className.split(' ')

describe('registry-ui field error', () => {
  test('renders nothing while no error carries a message', () => {
    expect(renderToStaticMarkup(<FieldError errors={[]} />)).toBe('')
    expect(renderToStaticMarkup(<FieldError errors={[undefined, {}]} />)).toBe('')
  })

  test('shows a lone message as itself, with no list around it', () => {
    expect(renderToStaticMarkup(<FieldError errors={[undefined, { message: 'Required' }]} />)).toMatch(
      /role="alert">Required<\/div>$/,
    )
  })

  test('lists several messages', () => {
    expect(renderToStaticMarkup(<FieldError errors={[{ message: 'Too short' }, { message: 'No digit' }]} />)).toContain(
      '<li>Too short</li><li>No digit</li>',
    )
  })

  test('shows its own children over the errors', () => {
    render(<FieldError errors={[{ message: 'Required' }]}>Pick a pond.</FieldError>)

    expect(screen.getByRole('alert').textContent).toBe('Pick a pond.')
  })
})

describe('registry-ui Field', () => {
  test('lays out a set with a legend, a group of fields and their parts, each marked by its slot', () => {
    render(
      <FieldSet data-testid="set">
        <FieldLegend>Pond</FieldLegend>
        <FieldDescription>
          Where the ducks live. <a href="#ponds">See all</a>
        </FieldDescription>
        <FieldGroup>
          <Field data-invalid="true">
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <input id="name" />
            <FieldError>Required</FieldError>
          </Field>
          <FieldSeparator />
          <Field orientation="horizontal">
            <FieldContent>
              <FieldTitle>Open all year</FieldTitle>
            </FieldContent>
          </Field>
        </FieldGroup>
      </FieldSet>,
    )

    const set = screen.getByTestId('set')
    expect(set.tagName).toBe('FIELDSET')
    expect(set.getAttribute('data-slot')).toBe('field-set')
    expect(set.getAttribute('dir')).toBe('ltr')
    const legend = screen.getByText('Pond')
    expect(legend.tagName).toBe('LEGEND')
    expect(legend.getAttribute('data-variant')).toBe('legend')
    const description = screen.getByText('See all').parentElement as HTMLElement
    expect(description.tagName).toBe('P')
    expect(description.getAttribute('data-slot')).toBe('field-description')
    expect(classes(description)).toContain('[&>a]:underline')

    const [, vertical, horizontal] = screen.getAllByRole('group')
    expect(vertical.parentElement?.getAttribute('data-slot')).toBe('field-group')
    expect(vertical.getAttribute('data-orientation')).toBe('vertical')
    expect(vertical.getAttribute('data-invalid')).toBe('true')
    expect(classes(vertical)).toContain('flex-col')
    expect(horizontal.getAttribute('data-orientation')).toBe('horizontal')
    expect(classes(horizontal)).toContain('flex-row')
    const label = screen.getByText('Name')
    expect(label.tagName).toBe('LABEL')
    expect(label.getAttribute('for')).toBe('name')
    expect(label.getAttribute('data-slot')).toBe('field-label')
    expect(screen.getByRole('alert').getAttribute('data-slot')).toBe('field-error')
    const title = screen.getByText('Open all year')
    expect(title.getAttribute('data-slot')).toBe('field-label')
    expect(title.parentElement?.getAttribute('data-slot')).toBe('field-content')
  })

  test('draws a legend at label size, and a field that lays itself out by its container', () => {
    render(
      <>
        <FieldLegend variant="label">Pond</FieldLegend>
        <Field data-testid="field" orientation="responsive" />
      </>,
    )

    expect(screen.getByText('Pond').getAttribute('data-variant')).toBe('label')
    expect(screen.getByTestId('field').getAttribute('data-orientation')).toBe('responsive')
    expect(classes(screen.getByTestId('field'))).toContain('@md/field-group:flex-row')
  })

  // The nudge is a class, so this pins it to the children those classes select: the Checkbox input itself, and the
  // wrapper RadioGroupItem draws around its radio.
  test('drops a checkbox or a radio beside a title and description a pixel, as the field child it is', () => {
    render(
      <RadioGroup>
        {(['horizontal', 'responsive'] as const).map((orientation) => (
          <React.Fragment key={orientation}>
            <Field data-testid={`checkbox-${orientation}`} orientation={orientation}>
              <Checkbox />
              <FieldContent>Pond</FieldContent>
            </Field>
            <Field data-testid={`radio-${orientation}`} orientation={orientation}>
              <RadioGroupItem value={orientation} />
              <FieldContent>Lake</FieldContent>
            </Field>
          </React.Fragment>
        ))}
      </RadioGroup>,
    )
    const nudged = (field: HTMLElement, prefix: string) =>
      classes(field)
        .filter((name) => name.endsWith(':mt-px'))
        .map((name) => name.slice(prefix.length))
        .sort()

    for (const [orientation, prefix] of [
      ['horizontal', ''],
      ['responsive', '@md/field-group:'],
    ] as const) {
      const checkbox = screen.getByTestId(`checkbox-${orientation}`)
      const radio = screen.getByTestId(`radio-${orientation}`)

      expect(checkbox.firstElementChild?.getAttribute('data-slot')).toBe('checkbox')
      expect(radio.firstElementChild?.matches(':has(>[role=radio])')).toBe(true)
      expect(nudged(checkbox, prefix)).toEqual([
        'has-[>[data-slot=field-content]]:*:data-[slot=checkbox]:mt-px',
        'has-[>[data-slot=field-content]]:*:has-[>[role=radio]]:mt-px',
      ])
    }
  })

  // Checkbox and Switch are native inputs with no data-state, so only :checked finds them.
  test('marks a choice card checked from a native checkbox or switch, as from a radio item', () => {
    render(
      <FieldLabel htmlFor="all-year">
        <Field orientation="horizontal">
          <FieldTitle>Open all year</FieldTitle>
          <input id="all-year" type="checkbox" />
        </Field>
      </FieldLabel>,
    )

    expect(classes(screen.getByText('Open all year').closest('label'))).toEqual(
      expect.arrayContaining([
        'has-data-[state=checked]:border-primary',
        'has-checked:border-primary',
        'has-checked:bg-primary/5',
        'dark:has-checked:bg-primary/10',
      ]),
    )
  })

  test('draws a separator alone, or with text across it', () => {
    render(
      <>
        <FieldSeparator data-testid="bare" />
        <FieldSeparator data-testid="worded">Or</FieldSeparator>
      </>,
    )

    const bare = screen.getByTestId('bare')
    expect(bare.getAttribute('data-content')).toBe('false')
    expect(bare.querySelector('[data-slot="field-separator-content"]')).toBeNull()
    const worded = screen.getByTestId('worded')
    expect(worded.getAttribute('data-content')).toBe('true')
    expect(screen.getByText('Or').getAttribute('data-slot')).toBe('field-separator-content')
  })

  test('takes its direction from a provider, from its own dir before that', () => {
    render(
      <DirectionProvider dir="rtl">
        <FieldSet data-testid="inherited" />
        <FieldSet data-testid="own" dir="ltr" />
      </DirectionProvider>,
    )

    expect(screen.getByTestId('inherited').getAttribute('dir')).toBe('rtl')
    expect(screen.getByTestId('own').getAttribute('dir')).toBe('ltr')
  })

  test('MotionField, MotionFieldGroup and MotionFieldError scale their parts in', () => {
    render(
      <MotionFieldGroup data-testid="group">
        <MotionField data-testid="first" index={1} orientation="horizontal" />
        <MotionField data-testid="second" />
        <MotionFieldError errors={[{ message: 'Required' }]} />
      </MotionFieldGroup>,
    )

    const parts = [
      screen.getByTestId('group'),
      screen.getByTestId('first'),
      screen.getByTestId('second'),
      screen.getByRole('alert'),
    ]
    expect(parts.map((part) => part.getAttribute('data-slot'))).toEqual([
      'field-group',
      'field',
      'field',
      'field-error',
    ])
    expect(screen.getByTestId('first').getAttribute('data-orientation')).toBe('horizontal')
    for (const part of parts) {
      expect((part.parentElement as HTMLElement).style.transform).toContain('scale(')
    }
  })
})
