import { DirectionProvider } from '@gentleduck/primitives/direction'
import { cleanup, render, screen, within } from '@testing-library/react'
import * as React from 'react'
import { afterEach, describe, expect, test } from 'vitest'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from '../item'
import { MotionItem, MotionItemGroup } from '../motion-item'

afterEach(cleanup)

const classes = (element: Element | null) => (element as HTMLElement).className.split(' ')

describe('registry-ui Item', () => {
  test('lays out its parts, each marked by its slot', () => {
    render(
      <Item data-testid="item">
        <ItemHeader>Header</ItemHeader>
        <ItemMedia>Media</ItemMedia>
        <ItemContent>
          <ItemTitle>Pond</ItemTitle>
          <ItemDescription>
            Still water, <a href="#ducks">ducks</a>
          </ItemDescription>
        </ItemContent>
        <ItemActions>Actions</ItemActions>
        <ItemFooter>Footer</ItemFooter>
      </Item>,
    )

    const item = screen.getByTestId('item')
    expect(item.getAttribute('data-slot')).toBe('item')
    expect(item.getAttribute('data-variant')).toBe('default')
    expect(item.getAttribute('data-size')).toBe('default')
    expect(classes(item)).toEqual(expect.arrayContaining(['bg-transparent', 'gap-4', 'p-4']))
    expect(screen.getByText('Header').getAttribute('data-slot')).toBe('item-header')
    expect(screen.getByText('Media').getAttribute('data-variant')).toBe('default')
    expect(screen.getByText('Pond').getAttribute('data-slot')).toBe('item-title')
    expect(screen.getByText('Pond').parentElement?.getAttribute('data-slot')).toBe('item-content')
    const description = screen.getByRole('link', { name: 'ducks' }).parentElement as HTMLElement
    expect(description.tagName).toBe('P')
    expect(description.getAttribute('data-slot')).toBe('item-description')
    expect(screen.getByText('Actions').getAttribute('data-slot')).toBe('item-actions')
    expect(screen.getByText('Footer').getAttribute('data-slot')).toBe('item-footer')
  })

  test('takes a variant and a size, and its media an icon or image variant', () => {
    render(
      <>
        <Item data-testid="outline" size="sm" variant="outline">
          <ItemMedia variant="icon">Icon</ItemMedia>
        </Item>
        <Item data-testid="muted" variant="muted">
          <ItemMedia variant="image">Image</ItemMedia>
        </Item>
      </>,
    )

    const outline = screen.getByTestId('outline')
    expect([outline.getAttribute('data-variant'), outline.getAttribute('data-size')]).toEqual(['outline', 'sm'])
    expect(classes(outline)).toEqual(expect.arrayContaining(['border-border', 'py-3']))
    expect(classes(screen.getByTestId('muted'))).toContain('bg-muted/50')
    expect(screen.getByText('Icon').getAttribute('data-variant')).toBe('icon')
    expect(classes(screen.getByText('Icon'))).toEqual(expect.arrayContaining(['size-8', 'bg-muted']))
    expect(classes(screen.getByText('Image'))).toContain('size-10')
  })

  test('stays out of the list roles on its own, and a link given asChild stays a link', () => {
    render(
      <>
        <Item data-testid="plain">Plain</Item>
        <Item asChild variant="outline">
          <a href="#dashboard">Dashboard</a>
        </Item>
      </>,
    )

    expect(screen.getByTestId('plain').hasAttribute('role')).toBe(false)
    const link = screen.getByRole('link', { name: 'Dashboard' })
    expect(link.getAttribute('data-slot')).toBe('item')
    expect(classes(link)).toContain('border-border')
    expect(screen.queryByRole('listitem')).toBeNull()
  })

  test('is a list item in a group, and a link item stays a link inside one', () => {
    render(
      <ItemGroup>
        <Item>Plain</Item>
        <ItemSeparator data-testid="separator" />
        <Item asChild>
          <a href="#dashboard">Dashboard</a>
        </Item>
        <Item role="option">Own role</Item>
      </ItemGroup>,
    )

    const list = screen.getByRole('list')
    expect(list.getAttribute('data-slot')).toBe('item-group')
    const [plain, linked] = within(list).getAllByRole('listitem')
    expect(plain.textContent).toBe('Plain')
    expect(within(linked).getByRole('link', { name: 'Dashboard' }).getAttribute('data-slot')).toBe('item')
    expect(classes(linked)).toContain('contents')
    expect(screen.getByText('Own role').getAttribute('role')).toBe('option')
    const separator = screen.getByTestId('separator')
    expect(separator.getAttribute('data-slot')).toBe('item-separator')
    expect(separator.getAttribute('role')).toBe('none')
  })

  test('a separator outside a group is still a separator', () => {
    render(<ItemSeparator />)

    expect(screen.getByRole('separator').getAttribute('data-slot')).toBe('item-separator')
  })

  test('the group takes its direction from a provider, from its own dir before that', () => {
    render(
      <DirectionProvider dir="rtl">
        <ItemGroup data-testid="inherited" />
        <ItemGroup data-testid="own" dir="ltr" />
      </DirectionProvider>,
    )

    expect(screen.getByTestId('inherited').getAttribute('dir')).toBe('rtl')
    expect(screen.getByTestId('own').getAttribute('dir')).toBe('ltr')
  })

  test('MotionItemGroup and MotionItem scale in, and a motion item is still a list item', () => {
    render(
      <MotionItemGroup data-testid="group">
        <MotionItem index={1} variant="muted">
          Pond
        </MotionItem>
      </MotionItemGroup>,
    )

    const group = screen.getByTestId('group')
    expect((group.parentElement as HTMLElement).style.transform).toContain('scale(')
    const item = within(group).getByRole('listitem')
    expect(item.getAttribute('data-variant')).toBe('muted')
    expect((item.parentElement as HTMLElement).style.transform).toContain('scale(')
  })
})
