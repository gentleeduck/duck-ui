import { describe, expect, it } from 'bun:test'
import { render, screen } from '@testing-library/react'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { freshDom } from '../../__tests__/dom'
import * as PortalModule from '..'
import { Portal } from '../portal'

freshDom()

describe('Portal', () => {
  it('renders children into document.body by default', () => {
    render(
      <Portal>
        <span data-testid="portaled">hello</span>
      </Portal>,
    )
    const el = document.body.querySelector('[data-testid="portaled"]')
    expect(el).not.toBeNull()
    expect(el?.textContent).toBe('hello')
  })

  it('renders with data-slot="portal"', () => {
    render(
      <Portal>
        <span>content</span>
      </Portal>,
    )
    expect(document.body.querySelector('[data-slot="portal"]')).not.toBeNull()
  })

  it('takes a data-slot it is given over its own', () => {
    render(
      <Portal data-slot="dialog-portal">
        <span>content</span>
      </Portal>,
    )
    expect(document.body.querySelector('[data-slot="dialog-portal"]')).not.toBeNull()
  })

  it('leaves the data-slot to the component it slots onto', () => {
    const Content = (props: React.ComponentProps<'span'>) => <span data-slot="content" {...props} />
    render(
      <Portal asChild>
        <Content data-testid="slotted" />
      </Portal>,
    )
    expect(document.body.querySelector('[data-testid="slotted"]')?.getAttribute('data-slot')).toBe('content')
  })

  it('renders into a custom container', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    render(
      <Portal container={container}>
        <span data-testid="custom">in container</span>
      </Portal>,
    )
    expect(container.querySelector('[data-testid="custom"]')).not.toBeNull()
    document.body.removeChild(container)
  })

  it('renders into a form holding a control named current, which a browser shows as a property of the form', () => {
    const form = document.createElement('form')
    form.innerHTML = '<input name="current">'
    Object.defineProperty(form, 'current', { value: form.firstElementChild })
    document.body.append(form)
    render(
      <Portal container={form}>
        <span data-testid="portaled" />
      </Portal>,
    )

    expect(screen.getByTestId('portaled').parentElement?.parentElement).toBe(form)
    form.remove()
  })

  it('renders into the element a ref holds, when that element renders after it', () => {
    function IntoRef() {
      const ref = React.useRef<HTMLElement>(null)
      return (
        <>
          <Portal container={ref}>
            <span data-testid="portaled" />
          </Portal>
          <section ref={ref} />
        </>
      )
    }

    render(<IntoRef />)

    expect(screen.getByTestId('portaled').closest('section')).not.toBeNull()
  })

  it('renders its children in the commit it mounts in', () => {
    const phases: string[] = []
    render(
      <React.Profiler id="portal" onRender={(_id, phase) => phases.push(phase)}>
        <Portal>
          <span />
        </Portal>
      </React.Profiler>,
    )

    expect(phases).toEqual(['mount'])
  })

  it('renders nothing while its ref holds no element', () => {
    render(
      <Portal container={{ current: null }}>
        <span data-testid="portaled" />
      </Portal>,
    )

    expect(screen.queryByTestId('portaled')).toBeNull()
  })

  it('renders nothing on the server, where a portal cannot render', () => {
    expect(renderToString(<Portal>hello</Portal>)).toBe('')
  })

  it('is also exported as Root, the name Radix gives it, and names itself Portal', () => {
    expect([PortalModule.Root === Portal, Portal.displayName]).toEqual([true, 'Portal'])
  })

  it('forwards ref', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(
      <Portal ref={ref}>
        <span>ref test</span>
      </Portal>,
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})
