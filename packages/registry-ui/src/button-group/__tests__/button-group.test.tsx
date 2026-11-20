import { DirectionProvider } from '@gentleduck/primitives/direction'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test } from 'vitest'
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from '../button-group'
import { MotionButtonGroup } from '../motion-button-group'

afterEach(cleanup)

const GROUPS = [
  ['ButtonGroup', ButtonGroup],
  ['MotionButtonGroup', MotionButtonGroup],
] as const

describe('registry-ui ButtonGroup', () => {
  test.each(GROUPS)('%s groups its buttons in a row unless told to stack them', (_, Group) => {
    render(
      <>
        <Group aria-label="Edit">
          <button type="button">Copy</button>
        </Group>
        <Group aria-label="Move" orientation="vertical">
          <button type="button">Up</button>
        </Group>
      </>,
    )

    const row = screen.getByRole('group', { name: 'Edit' })
    const column = screen.getByRole('group', { name: 'Move' })
    expect(row.getAttribute('data-orientation')).toBe('horizontal')
    expect(row.className.split(' ')).not.toContain('flex-col')
    expect(column.getAttribute('data-orientation')).toBe('vertical')
    expect(column.className.split(' ')).toContain('flex-col')
  })

  test.each(GROUPS)('%s takes its direction from a provider, from its own dir before that', (_, Group) => {
    render(
      <DirectionProvider dir="rtl">
        <Group aria-label="Inherited" />
        <Group aria-label="Own" dir="ltr" />
      </DirectionProvider>,
    )

    expect(screen.getByRole('group', { name: 'Inherited' }).getAttribute('dir')).toBe('rtl')
    expect(screen.getByRole('group', { name: 'Own' }).getAttribute('dir')).toBe('ltr')
  })

  test('MotionButtonGroup scales the group in', () => {
    render(<MotionButtonGroup aria-label="Edit" />)

    expect(screen.getByRole('group', { name: 'Edit' }).style.transform).toContain('scale(')
  })

  test('draws a vertical separator, marked so it stretches to the height of the buttons', () => {
    render(
      <ButtonGroup aria-label="Edit">
        <button type="button">Copy</button>
        <ButtonGroupSeparator />
        <button type="button">Paste</button>
      </ButtonGroup>,
    )

    const separator = screen.getByRole('separator')
    expect(separator.getAttribute('aria-orientation')).toBe('vertical')
    expect(separator.getAttribute('data-orientation')).toBe('vertical')
    expect(separator.className.split(' ')).toEqual(
      expect.arrayContaining(['self-stretch', 'data-[orientation=vertical]:h-auto']),
    )
  })

  test('shows text beside the buttons, in its own element or the one it is given', () => {
    render(
      <ButtonGroup aria-label="Search">
        <ButtonGroupText>https://</ButtonGroupText>
        <ButtonGroupText asChild>
          <label htmlFor="query">Query</label>
        </ButtonGroupText>
        <input id="query" />
      </ButtonGroup>,
    )

    const prefix = screen.getByText('https://')
    expect(prefix.tagName).toBe('DIV')
    expect(prefix.className.split(' ')).toContain('bg-muted')
    expect(screen.getByLabelText('Query').id).toBe('query')
    expect(screen.getByText('Query').className.split(' ')).toContain('bg-muted')
  })
})
