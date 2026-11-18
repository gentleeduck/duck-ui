import { describe, expect, it } from 'bun:test'
import { render } from '@testing-library/react'
import * as React from 'react'
import { Avatar } from '../avatar'
import { AvatarFallback } from '../fallback'

describe('Avatar', () => {
  it('renders with data-slot="avatar"', () => {
    const { container } = render(<Avatar />)
    expect(container.querySelector('[data-slot="avatar"]')).not.toBeNull()
  })

  it('renders as a span', () => {
    const { container } = render(<Avatar />)
    expect(container.querySelector('span[data-slot="avatar"]')).not.toBeNull()
  })

  it('forwards ref', () => {
    const ref = React.createRef<HTMLSpanElement>()
    render(<Avatar ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLSpanElement)
  })

  it('passes className through', () => {
    const { container } = render(<Avatar className="custom" />)
    expect(container.querySelector('[data-slot="avatar"]')?.className).toContain('custom')
  })
})

describe('AvatarFallback', () => {
  it('renders fallback with data-slot="avatar-fallback" when no image', () => {
    const { container } = render(
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    )
    const fallback = container.querySelector('[data-slot="avatar-fallback"]')
    expect(fallback).not.toBeNull()
    expect(fallback?.textContent).toBe('JD')
  })

  it('renders fallback as a span', () => {
    const { container } = render(
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>,
    )
    expect(container.querySelector('span[data-slot="avatar-fallback"]')).not.toBeNull()
  })

  it('fallback forwards ref', () => {
    const ref = React.createRef<HTMLSpanElement>()
    render(
      <Avatar>
        <AvatarFallback ref={ref}>JD</AvatarFallback>
      </Avatar>,
    )
    expect(ref.current).toBeInstanceOf(HTMLSpanElement)
  })

  it('fallback passes className', () => {
    const { container } = render(
      <Avatar>
        <AvatarFallback className="fb-class">JD</AvatarFallback>
      </Avatar>,
    )
    expect(container.querySelector('.fb-class')).not.toBeNull()
  })
})

describe('Avatar (composition)', () => {
  it('renders avatar with children', () => {
    const { container } = render(
      <Avatar>
        <AvatarFallback>WD</AvatarFallback>
      </Avatar>,
    )
    expect(container.querySelector('[data-slot="avatar"]')).not.toBeNull()
    expect(container.querySelector('[data-slot="avatar-fallback"]')?.textContent).toBe('WD')
  })

  it('sets dir on avatar', () => {
    const { container } = render(<Avatar dir="rtl" />)
    expect(container.querySelector('[data-slot="avatar"]')?.getAttribute('dir')).toBe('rtl')
  })

  it('defaults to ltr', () => {
    const { container } = render(<Avatar />)
    expect(container.querySelector('[data-slot="avatar"]')?.getAttribute('dir')).toBe('ltr')
  })
})
