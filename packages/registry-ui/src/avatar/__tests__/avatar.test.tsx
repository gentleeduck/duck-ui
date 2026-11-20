import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, test } from 'vitest'
import { AvatarGroup } from '../avatar'
import type { IAvatarGroupProps } from '../avatar.types'
import { MotionAvatarGroup } from '../motion-avatar'

const team = [{ alt: 'Ada Lovelace' }, { alt: 'Grace Hopper' }, { alt: 'Alan Turing' }, { alt: 'Edsger Dijkstra' }]

describe.each([
  ['AvatarGroup', AvatarGroup],
  ['MotionAvatarGroup', MotionAvatarGroup],
])('%s', (_, Group) => {
  function group(props: IAvatarGroupProps) {
    const html = renderToStaticMarkup(<Group {...props} />)
    return {
      labels: [...html.matchAll(/data-slot="avatar-fallback"[^>]*>([^<]*)</g)].map(([, label]) => label),
      names: [...html.matchAll(/<span[^>]*aria-label="([^"]*)"[^>]*role="img"/g)].map(([, name]) => name),
      html,
    }
  }

  test('shows the first three people and counts the rest', () => {
    const { labels, html } = group({ imgs: team })

    expect(labels).toEqual(['Ad', 'Gr', 'Al'])
    expect(html).toContain('+1')
  })

  test('names its count of the rest in words, or in the words getOverflowLabel gives', () => {
    const counter = (html: string) => {
      const attributes = html.match(/<div([^>]*)>\+1</)?.[1] ?? ''
      return attributes.includes('role="img"') ? attributes.match(/aria-label="([^"]*)"/)?.[1] : undefined
    }

    expect([
      counter(group({ imgs: team }).html),
      counter(group({ imgs: team, getOverflowLabel: (count) => `${count} de plus` }).html),
    ]).toEqual(['1 more', '1 de plus'])
  })

  test('shows everyone without a count when they all fit', () => {
    const { labels, html } = group({ imgs: team, maxVisible: 4 })

    expect(labels).toEqual(['Ad', 'Gr', 'Al', 'Ed'])
    expect(html).not.toContain('+')
  })

  test('puts every visible image in the server HTML, so each download starts before hydration', () => {
    const { html } = group({
      imgs: [
        { alt: 'Ada', src: '/ada.png' },
        { alt: 'Grace', src: '/grace.png' },
      ],
    })

    expect([...html.matchAll(/<img[^>]*src="([^"]*)"/g)].map(([, src]) => src)).toEqual(['/ada.png', '/grace.png'])
  })

  test('labels a person with the start of their fallback before their alt', () => {
    const { labels } = group({ imgs: [{ alt: 'Ada Lovelace', fallback: 'AL' }] })

    expect(labels).toEqual(['AL'])
  })

  test('labels a person by the first two letters a reader sees, never half of one', () => {
    const flag = '\u{1F1EA}\u{1F1EC}'
    const accented = 'Re\u0301my'
    const coder = '\u{1F469}\u200D\u{1F4BB}Ada'

    const { labels } = group({ imgs: [{ fallback: flag }, { alt: accented }, { alt: coder }] })

    expect(labels).toEqual([flag, 'Re\u0301', '\u{1F469}\u200D\u{1F4BB}A'])
  })

  test('names each fallback by the alt, so a screen reader hears the same name before and after the photo loads', () => {
    const { names, labels } = group({ imgs: [{ alt: 'Ada Lovelace', fallback: 'AL' }, { fallback: 'GH' }] })

    expect(names).toEqual(['Ada Lovelace'])
    expect(labels).toEqual(['AL', 'GH'])
  })
})
