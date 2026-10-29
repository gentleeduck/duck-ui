import { describe, expect, it, spyOn } from 'bun:test'
import { act, render, screen } from '@testing-library/react'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { freshDom } from '../../__tests__/dom'
import { Avatar, createAvatarScope } from '../avatar'
import { AvatarFallback } from '../fallback'
import { AvatarImage } from '../image'
import { mockImageLoading } from './image-loading'

freshDom()

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

  it('hands its parts the scope it is given', () => {
    const useAvatarScope = createAvatarScope()
    function Scoped() {
      const scope = useAvatarScope(undefined)
      return (
        <Avatar {...scope}>
          <AvatarFallback {...scope}>AL</AvatarFallback>
        </Avatar>
      )
    }

    render(<Scoped />)

    expect(screen.getByText('AL').dataset.slot).toBe('avatar-fallback')
  })

  it('names each part in React DevTools', () => {
    expect([Avatar.displayName, AvatarImage.displayName, AvatarFallback.displayName]).toEqual([
      'Avatar',
      'AvatarImage',
      'AvatarFallback',
    ])
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

  it('takes any dir an element takes, auto included, since it reads none', () => {
    const { container } = render(<Avatar dir="auto" />)
    expect(container.querySelector('[data-slot="avatar"]')?.getAttribute('dir')).toBe('auto')
  })

  it('leaves the direction to the document when no dir is passed', () => {
    const { container } = render(<Avatar />)
    expect(container.querySelector('[data-slot="avatar"]')?.hasAttribute('dir')).toBe(false)
  })
})

// jsdom never loads an image, so a test settles the one it rendered the way a browser would.
function settle(image: HTMLImageElement | null, naturalWidth = 300, event = naturalWidth ? 'load' : 'error') {
  if (!image) throw new Error('no image rendered')
  Object.defineProperties(image, {
    complete: { value: true, configurable: true },
    naturalWidth: { value: naturalWidth, configurable: true },
  })
  act(() => {
    image.dispatchEvent(new Event(event))
  })
}

function avatar(image: React.ReactElement) {
  return (
    <Avatar>
      {image}
      <AvatarFallback>AL</AvatarFallback>
    </Avatar>
  )
}

describe('AvatarImage loading', () => {
  const image = (container: HTMLElement) => container.querySelector('img')
  const fallback = (container: HTMLElement) => container.querySelector('[data-slot="avatar-fallback"]')

  it('starts the download from the server HTML', () => {
    expect(renderToString(avatar(<AvatarImage src="/ada.png" alt="Ada" />))).toContain('src="/ada.png"')
  })

  it('renders no image without a src or srcSet', () => {
    const { container } = render(avatar(<AvatarImage src="" alt="Ada" />))

    expect(image(container)).toBeNull()
    expect(fallback(container)).not.toBeNull()
  })

  it('marks the image with data-slot="avatar-image"', () => {
    const { container } = render(avatar(<AvatarImage src="/ada.png" alt="Ada" />))

    expect(image(container)?.dataset.slot).toBe('avatar-image')
  })

  it('keeps the style it was given on a loading image', () => {
    const { container } = render(avatar(<AvatarImage src="/ada.png" alt="Ada" style={{ borderRadius: 4 }} />))

    expect([image(container)?.style.borderRadius, image(container)?.style.visibility]).toEqual(['4px', 'hidden'])
  })

  it('says nothing about two images in production', () => {
    const env = process.env.NODE_ENV
    const warn = spyOn(console, 'warn').mockImplementation(() => {})
    process.env.NODE_ENV = 'production'

    try {
      render(
        <Avatar>
          <AvatarImage src="/ada.png" alt="Ada" />
          <AvatarImage src="/grace.png" alt="Grace" />
        </Avatar>,
      )

      expect(warn).not.toHaveBeenCalled()
    } finally {
      process.env.NODE_ENV = env
      warn.mockRestore()
    }
  })

  it('keeps a loading image laid out, so a lazy one near the viewport still loads', () => {
    const { container } = render(avatar(<AvatarImage src="/ada.png" alt="Ada" loading="lazy" />))

    const loading = image(container)
    expect(loading?.dataset.state).toBe('loading')
    expect(loading?.style.visibility).toBe('hidden')
    expect(loading && getComputedStyle(loading).display).not.toBe('none')
    expect(screen.queryByRole('img')).toBeNull()
  })

  it('shows the image once it loads, with the style it was given', () => {
    const { container } = render(avatar(<AvatarImage src="/ada.png" alt="Ada" style={{ borderRadius: 4 }} />))

    settle(image(container))

    expect(image(container)?.getAttribute('style')).toBe('border-radius: 4px;')
    expect(screen.getByRole('img', { name: 'Ada' }).dataset.state).toBe('loaded')
    expect(fallback(container)).toBeNull()
  })

  it('keeps the image hidden and the fallback shown when it fails', () => {
    const { container } = render(avatar(<AvatarImage src="/missing.png" alt="Ada" />))

    settle(image(container), 0)

    expect(image(container)?.dataset.state).toBe('error')
    expect(screen.queryByRole('img')).toBeNull()
    expect(fallback(container)).not.toBeNull()
  })

  it('shows an image that loaded before the page hydrated', () => {
    const ui = avatar(<AvatarImage src="/ada.png" alt="Ada" />)
    const container = document.body.appendChild(document.createElement('div'))
    container.innerHTML = renderToString(ui)
    Object.defineProperties(image(container), {
      complete: { value: true },
      naturalWidth: { value: 300 },
    })

    render(ui, { hydrate: true, container })

    expect(image(container)?.dataset.state).toBe('loaded')
    expect(fallback(container)).toBeNull()
  })

  it('ignores a load that arrives while the image is not complete, as one for a replaced request does', () => {
    const { container } = render(avatar(<AvatarImage src="/ada.png" alt="Ada" />))

    act(() => {
      image(container)?.dispatchEvent(new Event('load'))
    })

    expect(image(container)?.dataset.state).toBe('loading')
  })

  it('hides the image again while a new src loads, though the old image still reports complete', () => {
    const { container, rerender } = render(avatar(<AvatarImage src="/ada.png" alt="Ada" />))
    settle(image(container))

    rerender(avatar(<AvatarImage src="/grace.png" alt="Grace" />))

    expect(image(container)?.dataset.state).toBe('loading')
    expect(fallback(container)).not.toBeNull()
    settle(image(container))
    expect(image(container)?.dataset.state).toBe('loaded')
  })

  it('hides the image again while a new srcSet loads under the same src', () => {
    const { container, rerender } = render(avatar(<AvatarImage src="/ada.png" srcSet="/ada-2x.png 2x" alt="Ada" />))
    settle(image(container))

    rerender(avatar(<AvatarImage src="/ada.png" srcSet="/ada-3x.png 3x" alt="Ada" />))

    expect(image(container)?.dataset.state).toBe('loading')
    expect(fallback(container)).not.toBeNull()
  })

  it('shows the fallback while a src that went away and came back loads again', () => {
    const { container, rerender } = render(avatar(<AvatarImage src="/ada.png" alt="Ada" />))
    settle(image(container))

    rerender(avatar(<AvatarImage src="" alt="Ada" />))
    rerender(avatar(<AvatarImage src="/ada.png" alt="Ada" />))

    expect(image(container)?.dataset.state).toBe('loading')
    expect(fallback(container)).not.toBeNull()
  })

  it('shows a new src at once when the browser already has it', () => {
    const restore = mockImageLoading({ cache: new Set(['/ada.png', '/grace.png']) })
    try {
      const { container, rerender } = render(avatar(<AvatarImage src="/ada.png" alt="Ada" />))

      rerender(avatar(<AvatarImage src="/grace.png" alt="Grace" />))

      expect(image(container)?.dataset.state).toBe('loaded')
    } finally {
      restore()
    }
  })

  it('loads and shows an image that has only a srcSet', () => {
    const { container } = render(avatar(<AvatarImage srcSet="/ada-2x.png 2x" alt="Ada" />))

    settle(image(container))

    expect(screen.getByRole('img', { name: 'Ada' }).getAttribute('srcset')).toBe('/ada-2x.png 2x')
  })

  it('still calls the onLoad and onError it was given', () => {
    const events: string[] = []
    const { container } = render(
      avatar(
        <AvatarImage
          src="/ada.png"
          alt="Ada"
          onLoad={(event) => events.push(event.type)}
          onError={(event) => events.push(event.type)}
        />,
      ),
    )

    settle(image(container), 0)
    settle(image(container))

    expect(events).toEqual(['error', 'load'])
  })

  it('does not warn about two images when one replaces another', () => {
    const warn = spyOn(console, 'warn').mockImplementation(() => {})
    const { rerender } = render(avatar(<AvatarImage key="ada" src="/ada.png" alt="Ada" />))

    rerender(avatar(<AvatarImage key="grace" src="/grace.png" alt="Grace" />))
    rerender(avatar(<AvatarImage key="lin" src="/lin.png" alt="Lin" />))

    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
  })
})

describe('AvatarFallback delay', () => {
  it('shows the fallback after a delay of 0', async () => {
    const { container } = render(
      <Avatar>
        <AvatarFallback delayMs={0}>AL</AvatarFallback>
      </Avatar>,
    )

    await act(() => new Promise((resolve) => setTimeout(resolve, 10)))

    expect(container.querySelector('[data-slot="avatar-fallback"]')?.textContent).toBe('AL')
  })

  it('starts the wait over when the delay changes before it ends', async () => {
    const { container, rerender } = render(
      <Avatar>
        <AvatarFallback delayMs={10}>AL</AvatarFallback>
      </Avatar>,
    )

    rerender(
      <Avatar>
        <AvatarFallback delayMs={1000}>AL</AvatarFallback>
      </Avatar>,
    )
    await act(() => new Promise((resolve) => setTimeout(resolve, 50)))

    expect(container.querySelector('[data-slot="avatar-fallback"]')).toBeNull()
  })
})
