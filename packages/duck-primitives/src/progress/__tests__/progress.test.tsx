import { afterEach, beforeEach, describe, expect, it, spyOn } from 'bun:test'
import { render } from '@testing-library/react'
import * as React from 'react'
import { freshDom } from '../../__tests__/dom'
import { ProgressIndicator } from '../indicator'
import { ProgressLabel } from '../label'
import { createProgressScope, Progress } from '../progress'
import { ProgressValue } from '../value'

freshDom()

describe('Progress', () => {
  it('renders with data-slot="progress"', () => {
    const { container } = render(<Progress value={50} />)
    expect(container.querySelector('[data-slot="progress"]')).not.toBeNull()
  })

  it('has role="progressbar"', () => {
    const { container } = render(<Progress value={50} />)
    const el = container.querySelector('[role="progressbar"]')!
    expect(el).not.toBeNull()
  })

  it('sets aria-valuemin, aria-valuemax, aria-valuenow', () => {
    const { container } = render(<Progress value={30} max={100} />)
    const el = container.querySelector('[role="progressbar"]')!
    expect(el.getAttribute('aria-valuemin')).toBe('0')
    expect(el.getAttribute('aria-valuemax')).toBe('100')
    expect(el.getAttribute('aria-valuenow')).toBe('30')
  })

  it('defaults max to 100', () => {
    const { container } = render(<Progress value={50} />)
    const el = container.querySelector('[role="progressbar"]')!
    expect(el.getAttribute('aria-valuemax')).toBe('100')
  })

  it('computes aria-valuetext as percentage', () => {
    const { container } = render(<Progress value={75} max={100} />)
    const el = container.querySelector('[role="progressbar"]')!
    expect(el.getAttribute('aria-valuetext')).toBe('75%')
  })

  it('uses custom getValueLabel', () => {
    const { container } = render(<Progress value={3} max={10} getValueLabel={(v, m) => `${v} of ${m} steps`} />)
    const el = container.querySelector('[role="progressbar"]')!
    expect(el.getAttribute('aria-valuetext')).toBe('3 of 10 steps')
  })

  it('sets data-state="loading" when value < max', () => {
    const { container } = render(<Progress value={50} />)
    const el = container.querySelector('[role="progressbar"]')!
    expect(el.getAttribute('data-state')).toBe('loading')
  })

  it('sets data-state="complete" when value === max', () => {
    const { container } = render(<Progress value={100} max={100} />)
    const el = container.querySelector('[role="progressbar"]')!
    expect(el.getAttribute('data-state')).toBe('complete')
  })

  it('sets data-state="indeterminate" when value is null', () => {
    const { container } = render(<Progress value={null} />)
    const el = container.querySelector('[role="progressbar"]')!
    expect(el.getAttribute('data-state')).toBe('indeterminate')
  })

  it('forwards ref', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(<Progress ref={ref} value={50} />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('value=0 is loading, not indeterminate', () => {
    const { container } = render(<Progress value={0} />)
    const el = container.querySelector('[role="progressbar"]')!
    expect(el.getAttribute('data-state')).toBe('loading')
    expect(el.getAttribute('aria-valuenow')).toBe('0')
  })

  it('handles custom max value', () => {
    const { container } = render(<Progress value={5} max={10} />)
    const el = container.querySelector('[role="progressbar"]')!
    expect(el.getAttribute('aria-valuemax')).toBe('10')
    expect(el.getAttribute('aria-valuenow')).toBe('5')
  })

  it('sets data-value and data-max attributes', () => {
    const { container } = render(<Progress value={30} max={100} />)
    const el = container.querySelector('[role="progressbar"]')!
    expect(el.getAttribute('data-value')).toBe('30')
    expect(el.getAttribute('data-max')).toBe('100')
  })

  it('indeterminate has no aria-valuenow', () => {
    const { container } = render(<Progress value={null} />)
    const el = container.querySelector('[role="progressbar"]')!
    expect(el.getAttribute('aria-valuenow')).toBeNull()
  })

  it('passes className', () => {
    const { container } = render(<Progress value={50} className="my-progress" />)
    expect(container.querySelector('.my-progress')).not.toBeNull()
  })

  it('sets dir attribute', () => {
    const { container } = render(<Progress value={50} dir="rtl" />)
    expect(container.querySelector('[role="progressbar"]')?.getAttribute('dir')).toBe('rtl')
  })

  it('takes any dir an element takes, auto included, since it reads none', () => {
    const { container } = render(<Progress value={50} dir="auto" />)
    expect(container.querySelector('[role="progressbar"]')?.getAttribute('dir')).toBe('auto')
  })

  it('leaves the direction to the document when no dir is passed', () => {
    const { container } = render(<Progress value={50} />)
    expect(container.querySelector('[role="progressbar"]')?.hasAttribute('dir')).toBe(false)
  })
})

describe('Progress with invalid props', () => {
  let errorSpy: ReturnType<typeof spyOn>

  beforeEach(() => {
    errorSpy = spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    errorSpy.mockRestore()
  })

  it('logs an invalid max and falls back to 100', () => {
    const { container } = render(<Progress value={10} max={-5} />)

    expect(errorSpy.mock.calls.some(([message]) => String(message).includes('`-5`'))).toBe(true)
    expect(container.querySelector('[role="progressbar"]')?.getAttribute('aria-valuemax')).toBe('100')
  })

  it('logs nothing in production, and still falls back', () => {
    const env = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'
    try {
      const { container } = render(<Progress value={150} max={-5} />)
      const el = container.querySelector('[role="progressbar"]')

      expect(errorSpy).not.toHaveBeenCalled()
      expect(el?.getAttribute('aria-valuemax')).toBe('100')
      expect(el?.hasAttribute('aria-valuenow')).toBe(false)
    } finally {
      process.env.NODE_ENV = env
    }
  })

  it('logs nothing when no value is given, and is indeterminate', () => {
    const { container } = render(
      <Progress>
        <ProgressIndicator />
      </Progress>,
    )
    const root = container.querySelector('[role="progressbar"]')
    const indicator = container.querySelector('[data-slot="progress-indicator"]')

    expect(errorSpy).not.toHaveBeenCalled()
    expect([
      root?.getAttribute('data-state'),
      root?.hasAttribute('aria-valuenow'),
      root?.hasAttribute('data-value'),
    ]).toEqual(['indeterminate', false, false])
    expect([indicator?.getAttribute('data-state'), indicator?.hasAttribute('data-value')]).toEqual([
      'indeterminate',
      false,
    ])
  })

  it('logs a max of 0 and falls back to 100', () => {
    const { container } = render(<Progress value={10} max={0} />)

    expect(errorSpy.mock.calls.some(([message]) => String(message).includes('`0`'))).toBe(true)
    expect(container.querySelector('[role="progressbar"]')?.getAttribute('aria-valuemax')).toBe('100')
  })

  it('logs a value past max and renders it as indeterminate', () => {
    const { container } = render(<Progress value={150} />)

    expect(errorSpy.mock.calls.some(([message]) => String(message).includes('`150`'))).toBe(true)
    expect(container.querySelector('[role="progressbar"]')?.hasAttribute('aria-valuenow')).toBe(false)
  })
})

describe('Progress min', () => {
  let errorSpy: ReturnType<typeof spyOn>

  beforeEach(() => {
    errorSpy = spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    errorSpy.mockRestore()
  })

  it('measures the value from min', () => {
    const { container } = render(<Progress value={30} min={20} max={70} />)
    const el = container.querySelector('[role="progressbar"]')

    expect(el?.getAttribute('aria-valuemin')).toBe('20')
    expect(el?.getAttribute('aria-valuenow')).toBe('30')
    expect(el?.getAttribute('aria-valuetext')).toBe('20%')
  })

  it('hands min to getValueLabel', () => {
    const { container } = render(
      <Progress value={30} min={20} max={70} getValueLabel={(value, max, min) => `${value - min} of ${max - min}`} />,
    )

    expect(container.querySelector('[role="progressbar"]')?.getAttribute('aria-valuetext')).toBe('10 of 50')
  })

  it('logs a value below min and renders it as indeterminate', () => {
    const { container } = render(<Progress value={10} min={20} />)

    expect(errorSpy.mock.calls.some(([message]) => String(message).includes('`10`'))).toBe(true)
    expect(container.querySelector('[role="progressbar"]')?.getAttribute('data-state')).toBe('indeterminate')
  })

  it('logs a max that is not above min and falls back to 100', () => {
    const { container } = render(<Progress value={50} min={20} max={20} />)

    expect(errorSpy.mock.calls.some(([message]) => String(message).includes('`20`'))).toBe(true)
    expect(container.querySelector('[role="progressbar"]')?.getAttribute('aria-valuemax')).toBe('100')
  })

  it('falls back to a max 100 past a min that reaches 100, so the label stays a number', () => {
    const { container } = render(<Progress value={100} min={100} max={100} />)
    const el = container.querySelector('[role="progressbar"]')

    expect([el?.getAttribute('aria-valuemax'), el?.getAttribute('aria-valuetext')]).toEqual(['200', '0%'])
  })
})

describe('Progress parts', () => {
  it('hands its parts the scope it is given', () => {
    const useProgressScope = createProgressScope()
    function Scoped() {
      const scope = useProgressScope(undefined)
      return (
        <Progress {...scope} value={10} max={10}>
          <ProgressLabel {...scope}>Upload</ProgressLabel>
          <ProgressIndicator {...scope} />
          <ProgressValue {...scope} />
        </Progress>
      )
    }

    const { container } = render(<Scoped />)

    expect([...container.querySelectorAll('[data-state]')].map((node) => node.getAttribute('data-state'))).toEqual([
      'complete',
      'complete',
      'complete',
      'complete',
    ])
  })

  it('names each part in React DevTools', () => {
    expect([
      Progress.displayName,
      ProgressIndicator.displayName,
      ProgressLabel.displayName,
      ProgressValue.displayName,
    ]).toEqual(['Progress', 'ProgressIndicator', 'ProgressLabel', 'ProgressValue'])
  })

  it('hands the label and the value their refs', () => {
    const label = React.createRef<HTMLSpanElement>()
    const value = React.createRef<HTMLSpanElement>()
    render(
      <Progress value={10}>
        <ProgressLabel ref={label}>Upload</ProgressLabel>
        <ProgressValue ref={value} />
      </Progress>,
    )

    expect([label.current?.dataset.slot, value.current?.dataset.slot]).toEqual(['progress-label', 'progress-value'])
  })
})

describe('ProgressIndicator', () => {
  it("carries the root's value, max and state", () => {
    const { container } = render(
      <Progress value={10} max={10}>
        <ProgressIndicator />
      </Progress>,
    )
    const indicator = container.querySelector('[data-slot="progress-indicator"]')

    expect([indicator?.getAttribute('data-value'), indicator?.getAttribute('data-max')]).toEqual(['10', '10'])
    expect(indicator?.getAttribute('data-state')).toBe('complete')
  })
})

describe('ProgressLabel', () => {
  it('names the progress bar it sits in', () => {
    const { container, getByText } = render(
      <Progress value={30}>
        <ProgressLabel>Uploading</ProgressLabel>
      </Progress>,
    )
    const label = getByText('Uploading')

    expect(label.tagName).toBe('SPAN')
    expect(label.id).not.toBe('')
    expect(container.querySelector('[role="progressbar"]')?.getAttribute('aria-labelledby')).toBe(label.id)
  })

  it('keeps an id passed to it', () => {
    const { container } = render(
      <Progress value={30}>
        <ProgressLabel id="upload-label">Uploading</ProgressLabel>
      </Progress>,
    )

    expect(container.querySelector('[role="progressbar"]')?.getAttribute('aria-labelledby')).toBe('upload-label')
  })

  it('stops naming the progress bar once it unmounts', () => {
    const ui = (withLabel: boolean) => (
      <Progress value={30}>{withLabel ? <ProgressLabel>Uploading</ProgressLabel> : null}</Progress>
    )
    const { container, rerender } = render(ui(true))

    rerender(ui(false))

    expect(container.querySelector('[role="progressbar"]')?.hasAttribute('aria-labelledby')).toBe(false)
  })

  it('leaves an aria-labelledby passed to the root alone', () => {
    const { container } = render(
      <Progress value={30} aria-labelledby="heading">
        <ProgressLabel>Uploading</ProgressLabel>
      </Progress>,
    )

    expect(container.querySelector('[role="progressbar"]')?.getAttribute('aria-labelledby')).toBe('heading')
  })

  it('carries the state of the progress', () => {
    const { getByText } = render(
      <Progress value={null}>
        <ProgressLabel>Uploading</ProgressLabel>
      </Progress>,
    )

    expect(getByText('Uploading').getAttribute('data-state')).toBe('indeterminate')
  })
})

describe('ProgressValue', () => {
  it('shows the value as a percentage of max, hidden from assistive technology', () => {
    const { container } = render(
      <Progress value={1} max={4}>
        <ProgressValue />
      </Progress>,
    )
    const value = container.querySelector('[data-slot="progress-value"]')

    expect(value?.textContent).toBe('25%')
    expect(value?.getAttribute('aria-hidden')).toBe('true')
  })

  it('shows the label the root formats', () => {
    const { container } = render(
      <Progress value={3} max={10} getValueLabel={(value, max) => `${value} of ${max} files`}>
        <ProgressValue />
      </Progress>,
    )

    expect(container.querySelector('[data-slot="progress-value"]')?.textContent).toBe('3 of 10 files')
  })

  it('shows nothing while the progress is indeterminate', () => {
    const { container } = render(
      <Progress value={null}>
        <ProgressValue />
      </Progress>,
    )

    expect(container.querySelector('[data-slot="progress-value"]')?.textContent).toBe('')
  })

  it('hands the label and the value to a render function', () => {
    const { container } = render(
      <Progress value={40}>
        <ProgressValue>{(label, value) => `${label} (${value})`}</ProgressValue>
      </Progress>,
    )

    expect(container.querySelector('[data-slot="progress-value"]')?.textContent).toBe('40% (40)')
  })

  it('shows children it is given in place of the label', () => {
    const { container } = render(
      <Progress value={40}>
        <ProgressValue className="count">Almost there</ProgressValue>
      </Progress>,
    )
    const value = container.querySelector('[data-slot="progress-value"]')

    expect([value?.textContent, value?.className]).toEqual(['Almost there', 'count'])
  })

  it('carries the state of the progress', () => {
    const { container } = render(
      <Progress value={100}>
        <ProgressValue />
      </Progress>,
    )

    expect(container.querySelector('[data-slot="progress-value"]')?.getAttribute('data-state')).toBe('complete')
  })
})
