import { afterEach, describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { cleanup, render, screen } from '@testing-library/react'
import * as React from 'react'
import { Typeset } from '../typeset'

afterEach(cleanup)

const stylesheet = readFileSync(new URL('../typeset.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')

function topLevel(css: string) {
  const blocks: string[] = []
  let depth = 0
  let start = 0
  for (let index = 0; index < css.length; index++) {
    if (css[index] === '{' && depth++ === 0) blocks.push(css.slice(start, index).trim())
    if (css[index] === '}' && --depth === 0) start = index + 1
  }
  return { blocks, rest: css.slice(start).trim() }
}

function wrapper(text: string) {
  const node = screen.getByText(text).parentElement
  if (!node) throw new Error(`no wrapper around ${text}`)
  return node
}

describe('registry-ui Typeset', () => {
  test('wraps its content in a div that carries only the typeset class and its slot', () => {
    render(
      <Typeset>
        <p>Body</p>
      </Typeset>,
    )
    const root = wrapper('Body')

    expect(root.tagName).toBe('DIV')
    expect(root.className).toBe('typeset')
    expect(root.getAttribute('data-slot')).toBe('typeset')
  })

  test.each([
    ['sm', ['[--typeset-flow:1em]', '[--typeset-leading:1.65]', '[--typeset-size:0.875rem]']],
    ['lg', ['[--typeset-flow:1.4em]', '[--typeset-leading:1.8]', '[--typeset-size:1.125rem]']],
  ] as const)('size %s sets the flow, the leading and the size together', (size, classes) => {
    render(
      <Typeset size={size}>
        <p>Body</p>
      </Typeset>,
    )

    expect(Array.from(wrapper('Body').classList).sort()).toEqual(['typeset', ...classes].sort())
  })

  test('a variable passed as a class replaces the one the size sets, and keeps the others', () => {
    render(
      <Typeset className="max-w-xl [--typeset-flow:2em]" size="sm">
        <p>Body</p>
      </Typeset>,
    )
    const classes = Array.from(wrapper('Body').classList)

    expect(classes).toContain('[--typeset-flow:2em]')
    expect(classes).not.toContain('[--typeset-flow:1em]')
    expect(classes).toEqual(expect.arrayContaining(['max-w-xl', '[--typeset-size:0.875rem]']))
  })

  test('the rest of the props and the ref reach the div', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(
      <Typeset aria-live="polite" id="answer" ref={ref}>
        <p>Body</p>
      </Typeset>,
    )
    const root = wrapper('Body')

    expect(ref.current).toBe(root as HTMLDivElement)
    expect([root.id, root.getAttribute('aria-live')]).toEqual(['answer', 'polite'])
  })

  test('asChild styles the element it is given, which keeps its own props, and takes the ref', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(
      <Typeset asChild className="mx-auto" ref={ref} size="lg">
        <article id="post">
          <p>Body</p>
        </article>
      </Typeset>,
    )
    const root = wrapper('Body')

    expect(root.tagName).toBe('ARTICLE')
    expect(ref.current).toBe(root as HTMLDivElement)
    expect(root.id).toBe('post')
    expect(root.getAttribute('data-slot')).toBe('typeset')
    expect(Array.from(root.classList)).toEqual(
      expect.arrayContaining(['typeset', 'mx-auto', '[--typeset-size:1.125rem]']),
    )
    expect(document.querySelectorAll('div')).toHaveLength(1)
  })
})

describe('registry-ui typeset.css', () => {
  test('every rule sits in the components layer, so a utility on any element wins without !important', () => {
    const { blocks, rest } = topLevel(stylesheet)

    expect(blocks).toEqual(['@property --typeset-flow', '@layer components'])
    expect(rest).toBe('')
    expect(stylesheet).not.toContain('!important')
  })

  test('no selector waits on content that has not arrived, so a streamed block never restyles the ones above it', () => {
    expect(stylesheet).not.toMatch(/:last-child|:last-of-type|:nth-last|:only-child|:has\(|:empty/)
  })

  test('blocks are spaced only above themselves', () => {
    const margins = Array.from(stylesheet.matchAll(/(?:^|[\s;{])((?:scroll-)?margin[\w-]*)\s*:/g), (match) => match[1])

    expect(new Set(margins)).toEqual(new Set(['margin-block-start', 'scroll-margin-block-start', 'margin-inline-end']))
  })
})
