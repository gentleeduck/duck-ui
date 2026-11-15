import { afterEach, describe, expect, test } from 'bun:test'
import { DirectionProvider } from '@gentleduck/primitives/direction'
import { cleanup, render, screen } from '@testing-library/react'
import { Alert, AlertDescription, AlertTitle } from '../alert'
import { MotionAlert, MotionAlertDescription, MotionAlertTitle } from '../motion-alert'

afterEach(cleanup)

const ALERTS = [
  ['Alert', Alert, AlertTitle, AlertDescription],
  ['MotionAlert', MotionAlert, MotionAlertTitle, MotionAlertDescription],
] as const

describe('registry-ui Alert', () => {
  test.each(ALERTS)('%s announces its title and description as one alert', (_, Root, Title, Description) => {
    render(
      <Root>
        <Title>Pond drained</Title>
        <Description>The ducks moved to the lake.</Description>
      </Root>,
    )

    const alert = screen.getByRole('alert')
    expect(alert.textContent).toBe('Pond drainedThe ducks moved to the lake.')
    expect(alert.getAttribute('data-slot')).toBe('alert')
    expect(screen.getByText('Pond drained').getAttribute('data-slot')).toBe('alert-title')
    expect(screen.getByText('The ducks moved to the lake.').getAttribute('data-slot')).toBe('alert-description')
  })

  test.each(ALERTS)('%s draws the destructive variant in the destructive colour', (_, Root) => {
    render(
      <>
        <Root data-testid="default">Saved</Root>
        <Root data-testid="destructive" variant="destructive">
          Failed
        </Root>
      </>,
    )

    expect(screen.getByTestId('default').className.split(' ')).toContain('text-card-foreground')
    expect(screen.getByTestId('destructive').className.split(' ')).toContain('text-destructive')
  })

  test.each(ALERTS)('%s takes its direction from a provider, from its own dir before that', (_, Root) => {
    render(
      <DirectionProvider dir="rtl">
        <Root data-testid="inherited">One</Root>
        <Root data-testid="own" dir="ltr">
          Two
        </Root>
        <Root data-testid="unknown" dir="auto">
          Three
        </Root>
      </DirectionProvider>,
    )

    expect(screen.getByTestId('inherited').getAttribute('dir')).toBe('rtl')
    expect(screen.getByTestId('own').getAttribute('dir')).toBe('ltr')
    expect(screen.getByTestId('unknown').getAttribute('dir')).toBe('rtl')
  })

  test('MotionAlert scales its parts in, and they animate inside a plain Alert too', () => {
    render(
      <>
        <MotionAlert data-testid="motion">Moving</MotionAlert>
        <Alert>
          <MotionAlertTitle>Title</MotionAlertTitle>
          <MotionAlertDescription>Description</MotionAlertDescription>
        </Alert>
      </>,
    )

    expect(screen.getByTestId('motion').style.transform).toContain('scale(')
    expect(screen.getByText('Title').style.transform).toContain('scale(')
    expect(screen.getByText('Description').style.transform).toContain('scale(')
  })
})
