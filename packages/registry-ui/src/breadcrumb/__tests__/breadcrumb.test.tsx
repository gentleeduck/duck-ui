import { DirectionProvider } from '@gentleduck/primitives/direction'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test } from 'vitest'
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../breadcrumb'
import { MotionBreadcrumbItem, MotionBreadcrumbList, MotionBreadcrumbSeparator } from '../motion-breadcrumb'

afterEach(cleanup)

describe('registry-ui Breadcrumb', () => {
  test('names the trail, marks the current page and hides the separators', () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbEllipsis />
          </BreadcrumbItem>
          <BreadcrumbSeparator>/</BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>Ponds</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    )

    const nav = screen.getByRole('navigation', { name: 'breadcrumb' })
    expect(nav.getAttribute('dir')).toBe('ltr')
    expect(screen.getByRole('link', { name: 'Home' }).getAttribute('href')).toBe('/')
    expect(screen.getByText('Ponds').getAttribute('aria-current')).toBe('page')
    expect(screen.getByRole('img', { name: 'More' }).getAttribute('data-slot')).toBe('breadcrumb-ellipsis')

    const separators = nav.querySelectorAll('[data-slot="breadcrumb-separator"]')
    expect(Array.from(separators, (separator) => separator.getAttribute('aria-hidden'))).toEqual(['true', 'true'])
    expect(separators[0]?.querySelector('svg')).not.toBeNull()
    expect(separators[1]?.textContent).toBe('/')
  })

  test('names the ellipsis by its text, and a link can render its own element', () => {
    render(
      <DirectionProvider dir="rtl">
        <Breadcrumb>
          <BreadcrumbLink asChild>
            <button type="button">Back</button>
          </BreadcrumbLink>
          <BreadcrumbEllipsis text="Hidden folders" />
        </Breadcrumb>
      </DirectionProvider>,
    )

    expect(screen.getByRole('navigation').getAttribute('dir')).toBe('rtl')
    expect(screen.getByRole('button', { name: 'Back' }).getAttribute('data-slot')).toBe('breadcrumb-link')
    expect(screen.getByRole('img', { name: 'Hidden folders' })).toBeTruthy()
  })
})

describe('registry-ui MotionBreadcrumb', () => {
  function Trail() {
    return (
      <MotionBreadcrumbList>
        <MotionBreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </MotionBreadcrumbItem>
        <MotionBreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Ponds</BreadcrumbPage>
        </BreadcrumbItem>
      </MotionBreadcrumbList>
    )
  }

  test('scales its items in and keeps a plain item as it is', () => {
    render(<Trail />)

    const item = screen.getByRole('link', { name: 'Home' }).parentElement as HTMLElement
    expect(item.getAttribute('data-slot')).toBe('breadcrumb-item')
    expect(item.style.transform).toContain('scale(')
    expect((screen.getByText('Ponds').parentElement as HTMLElement).style.transform).toBe('')
  })

  test.each([
    ['ltr', '-'],
    ['rtl', ''],
  ] as const)('slides a separator in from the side the trail starts on, %s', (dir, sign) => {
    render(
      <DirectionProvider dir={dir}>
        <Trail />
      </DirectionProvider>,
    )

    const separator = document.querySelector('[data-slot="breadcrumb-separator"]') as HTMLElement
    expect(separator.getAttribute('aria-hidden')).toBe('true')
    expect(separator.querySelector('svg')).not.toBeNull()
    expect(separator.style.transform).toContain(`translateX(${sign}8px)`)
  })
})
