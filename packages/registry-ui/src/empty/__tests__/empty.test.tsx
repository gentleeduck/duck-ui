import { afterEach, describe, expect, test } from 'bun:test'
import { DirectionProvider } from '@gentleduck/primitives/direction'
import { cleanup, render, screen } from '@testing-library/react'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../empty'
import {
  MotionEmpty,
  MotionEmptyContent,
  MotionEmptyDescription,
  MotionEmptyMedia,
  MotionEmptyTitle,
} from '../motion-empty'

afterEach(cleanup)

const classes = (element: Element | null) => (element as HTMLElement).className.split(' ')

describe('registry-ui Empty', () => {
  test('lays out a header over its content, each part marked by its slot', () => {
    render(
      <Empty className="border" data-testid="empty">
        <EmptyHeader>
          <EmptyMedia>
            <span>duck</span>
          </EmptyMedia>
          <EmptyTitle>No ponds yet</EmptyTitle>
          <EmptyDescription>
            Add one, or read <a href="#ponds">the guide</a>.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <button type="button">Add a pond</button>
        </EmptyContent>
      </Empty>,
    )

    const empty = screen.getByTestId('empty')
    expect(empty.getAttribute('data-slot')).toBe('empty')
    expect(empty.getAttribute('dir')).toBe('ltr')
    expect(classes(empty)).toContain('border')
    expect(Array.from(empty.children, (part) => part.getAttribute('data-slot'))).toEqual([
      'empty-header',
      'empty-content',
    ])
    const header = empty.children[0] as HTMLElement
    expect(Array.from(header.children, (part) => part.getAttribute('data-slot'))).toEqual([
      'empty-icon',
      'empty-title',
      'empty-description',
    ])
    expect(classes(screen.getByText('the guide').parentElement)).toContain('[&>a]:underline')
  })

  test('draws its media bare by default, and on a tile as an icon', () => {
    render(
      <>
        <EmptyMedia data-testid="bare" />
        <EmptyMedia data-testid="icon" variant="icon" />
      </>,
    )

    const bare = screen.getByTestId('bare')
    expect(bare.getAttribute('data-variant')).toBe('default')
    expect(classes(bare)).toContain('bg-transparent')
    const icon = screen.getByTestId('icon')
    expect(icon.getAttribute('data-variant')).toBe('icon')
    expect(classes(icon)).toEqual(expect.arrayContaining(['size-10', 'bg-muted']))
  })

  test('takes its direction from a provider, from its own dir before that', () => {
    render(
      <DirectionProvider dir="rtl">
        <Empty data-testid="inherited" />
        <Empty data-testid="own" dir="ltr" />
      </DirectionProvider>,
    )

    expect(screen.getByTestId('inherited').getAttribute('dir')).toBe('rtl')
    expect(screen.getByTestId('own').getAttribute('dir')).toBe('ltr')
  })

  test('MotionEmpty scales the empty state and each of its parts in', () => {
    render(
      <MotionEmpty data-testid="empty">
        <EmptyHeader>
          <MotionEmptyMedia data-testid="media" variant="icon" />
          <MotionEmptyTitle>No ponds yet</MotionEmptyTitle>
          <MotionEmptyDescription>Add one to start.</MotionEmptyDescription>
        </EmptyHeader>
        <MotionEmptyContent>Add a pond</MotionEmptyContent>
      </MotionEmpty>,
    )

    const parts = [
      screen.getByTestId('empty'),
      screen.getByTestId('media'),
      screen.getByText('No ponds yet'),
      screen.getByText('Add one to start.'),
      screen.getByText('Add a pond'),
    ]
    expect(parts.map((part) => part.getAttribute('data-slot'))).toEqual([
      'empty',
      'empty-icon',
      'empty-title',
      'empty-description',
      'empty-content',
    ])
    expect(screen.getByTestId('media').getAttribute('data-variant')).toBe('icon')
    for (const part of parts) {
      expect((part.parentElement as HTMLElement).style.transform).toContain('scale(')
    }
  })
})
