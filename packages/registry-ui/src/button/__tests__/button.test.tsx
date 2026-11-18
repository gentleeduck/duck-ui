import { describe, expect, test } from 'bun:test'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { AnimationIcon, Button } from '../button'
import { buttonVariants } from '../button.constants'

describe('registry-ui button', () => {
  test('buttonVariants returns the shared base styles and defaults', () => {
    const classes = buttonVariants()

    expect(classes).toContain('inline-flex')
    expect(classes).toContain('bg-primary')
    expect(classes).toContain('h-9')
    expect(classes).toContain('shadow-xs')
  })

  test('buttonVariants applies explicit variant and size overrides', () => {
    const classes = buttonVariants({ size: 'sm', variant: 'ghost' })

    expect(classes).toContain('h-8')
    expect(classes).toContain('hover:bg-accent')
  })

  test('button exports keep stable display names', () => {
    expect(Button).toBeDefined()
    expect(Button.displayName).toBe('Button')
    expect(AnimationIcon.displayName).toBe('AnimationIcon')
  })

  test('Button renders loading state as a busy disabled native button', () => {
    const html = renderToStaticMarkup(<Button loading>Save</Button>)

    expect(html).toContain('type="button"')
    expect(html).toContain('aria-busy="true"')
    expect(html).toContain('disabled=""')
    expect(html).toContain('animate-spin motion-reduce:animate-none')
    expect(html).toContain('Save')
  })

  test('Button preserves explicit disabled state even when loading is false', () => {
    const html = renderToStaticMarkup(
      <Button disabled loading={false}>
        Save
      </Button>,
    )

    expect(html).toContain('disabled=""')
    expect(html).not.toContain('aria-busy="true"')
  })

  test('Button collapses into icon-only mode and hides secondary content', () => {
    const html = renderToStaticMarkup(
      <Button icon={<span data-icon="left">L</span>} isCollapsed secondIcon={<span data-icon="right">R</span>}>
        Save
      </Button>,
    )

    expect(html).toContain('data-icon="left"')
    expect(html).toContain('size-9')
    expect(html).not.toContain('Save')
    expect(html).not.toContain('data-icon="right"')
  })

  test('Button asChild merges button styles onto child element without type/disabled', () => {
    const html = renderToStaticMarkup(
      <Button asChild variant="outline">
        <a href="/docs">Go to docs</a>
      </Button>,
    )

    expect(html).toContain('href="/docs"')
    expect(html).toContain('Go to docs')
    expect(html).toContain('border-input')
    expect(html).not.toContain('type="button"')
    expect(html).not.toContain('disabled=""')
    expect(html).not.toContain('aria-busy')
  })

  test('AnimationIcon renders left and right placements around children', () => {
    const leftHtml = renderToStaticMarkup(
      <AnimationIcon animationIcon={{ icon: <span data-icon="left">L</span>, iconPlacement: 'left' }}>
        Label
      </AnimationIcon>,
    )
    const rightHtml = renderToStaticMarkup(
      <AnimationIcon animationIcon={{ icon: <span data-icon="right">R</span>, iconPlacement: 'right' }}>
        Label
      </AnimationIcon>,
    )

    expect(leftHtml).toContain('data-icon="left"')
    expect(leftHtml.indexOf('data-icon="left"')).toBeLessThan(leftHtml.indexOf('Label'))
    expect(rightHtml).toContain('data-icon="right"')
    expect(rightHtml.indexOf('Label')).toBeLessThan(rightHtml.indexOf('data-icon="right"'))
  })
})
