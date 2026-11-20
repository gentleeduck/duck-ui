import { DirectionProvider } from '@gentleduck/primitives/direction'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test } from 'vitest'
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../card'
import { MotionCard, MotionCardContent, MotionCardFooter, MotionCardHeader } from '../motion-card'

afterEach(cleanup)

describe('registry-ui Card', () => {
  test('lays out a header with an action, content and a footer, each part marked by its slot', () => {
    render(
      <Card data-testid="card">
        <CardHeader>
          <CardTitle>Mill pond</CardTitle>
          <CardDescription>Twelve ducks</CardDescription>
          <CardAction>
            <button type="button">Follow</button>
          </CardAction>
        </CardHeader>
        <CardContent>Open all year.</CardContent>
        <CardFooter className="border-t">
          <button type="button">Visit</button>
        </CardFooter>
      </Card>,
    )

    const card = screen.getByTestId('card')
    expect(card.hasAttribute('data-card')).toBe(true)
    expect(card.getAttribute('dir')).toBe('ltr')
    expect(screen.getByText('Mill pond').getAttribute('data-slot')).toBe('card-title')
    expect(screen.getByText('Twelve ducks').getAttribute('data-slot')).toBe('card-description')
    expect(screen.getByRole('button', { name: 'Follow' }).parentElement?.getAttribute('data-slot')).toBe('card-action')
    expect(screen.getByText('Open all year.').getAttribute('data-slot')).toBe('card-content')
    const footer = screen.getByRole('button', { name: 'Visit' }).parentElement as HTMLElement
    expect(footer.getAttribute('data-slot')).toBe('card-footer')
    expect(footer.className.split(' ')).toContain('border-t')
    expect(Array.from(card.children, (part) => part.getAttribute('data-slot'))).toEqual([
      'card-header',
      'card-content',
      'card-footer',
    ])
  })

  test('takes its direction from a provider, from its own dir before that', () => {
    render(
      <DirectionProvider dir="rtl">
        <Card data-testid="inherited" />
        <Card data-testid="own" dir="ltr" />
      </DirectionProvider>,
    )

    expect(screen.getByTestId('inherited').getAttribute('dir')).toBe('rtl')
    expect(screen.getByTestId('own').getAttribute('dir')).toBe('ltr')
  })

  test('MotionCard scales the card and each of its parts in, one after the other', () => {
    render(
      <MotionCard data-testid="card">
        <MotionCardHeader>
          <CardTitle>Mill pond</CardTitle>
        </MotionCardHeader>
        <MotionCardContent>Open all year.</MotionCardContent>
        <MotionCardFooter>Visit</MotionCardFooter>
      </MotionCard>,
    )

    const card = screen.getByTestId('card')
    const header = screen.getByText('Mill pond').parentElement as HTMLElement
    expect(header.getAttribute('data-slot')).toBe('card-header')
    for (const part of [card, header, screen.getByText('Open all year.'), screen.getByText('Visit')]) {
      expect((part.parentElement as HTMLElement).style.transform).toContain('scale(')
    }
  })
})
