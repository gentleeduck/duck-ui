import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { MotionRadioGroup, MotionRadioGroupItem } from '../motion-radio-group'
import { RadioGroup, RadioGroupItem } from '../radio-group'

const radio = (html: string) => html.match(/<button[^>]*role="radio"[^>]*>/)?.[0] ?? ''

afterEach(cleanup)

const items: [string, typeof RadioGroup, typeof RadioGroupItem][] = [
  ['RadioGroupItem', RadioGroup, RadioGroupItem],
  ['MotionRadioGroupItem', MotionRadioGroup, MotionRadioGroupItem],
]

describe.each(items)('registry-ui %s label', (_, Group, Item) => {
  test('dims and refuses the pointer while its radio is disabled, by the item or by the group', () => {
    render(
      <>
        <Group>
          <Item value="apple">Apple</Item>
          <Item disabled value="pear">
            Pear
          </Item>
        </Group>
        <Group disabled>
          <Item value="plum">Plum</Item>
        </Group>
      </>,
    )

    for (const name of ['Apple', 'Pear', 'Plum']) {
      const label = screen.getByText(name)
      const row = label.closest('.group\\/radio')

      expect(row?.contains(screen.getByRole('radio', { name }))).toBe(true)
      expect(label.className).toContain('group-has-disabled/radio:cursor-not-allowed')
      expect(label.className).toContain('group-has-disabled/radio:opacity-70')
    }
    expect(screen.getByRole('radio', { name: 'Pear' }).hasAttribute('disabled')).toBe(true)
    expect(screen.getByRole('radio', { name: 'Plum' }).hasAttribute('disabled')).toBe(true)
  })

  test('names its radio by a label of 0, as on a scale that starts there', () => {
    render(
      <Group>
        <Item value="0">{0}</Item>
      </Group>,
    )

    expect(screen.getByRole('radio', { name: '0' }).getAttribute('data-text-value')).toBe('0')
  })
})

describe('registry-ui RadioGroup', () => {
  test('hands the label to typeahead as the radio text value', () => {
    const html = renderToStaticMarkup(
      <RadioGroup>
        <RadioGroupItem value="apple">Apple</RadioGroupItem>
      </RadioGroup>,
    )

    expect(radio(html)).toContain('data-text-value="Apple"')
  })

  test('prefers an explicit textValue over the label', () => {
    const html = renderToStaticMarkup(
      <RadioGroup>
        <RadioGroupItem value="apple" textValue="Granny Smith">
          Apple
        </RadioGroupItem>
      </RadioGroup>,
    )

    expect(radio(html)).toContain('data-text-value="Granny Smith"')
  })

  test('points the label at a consumer id', () => {
    const html = renderToStaticMarkup(
      <RadioGroup>
        <RadioGroupItem id="fruit-apple" value="apple">
          Apple
        </RadioGroupItem>
      </RadioGroup>,
    )

    expect(radio(html)).toContain('id="fruit-apple"')
    expect(html).toContain('for="fruit-apple"')
  })

  test('keeps a consumer style on the radio', () => {
    const html = renderToStaticMarkup(
      <RadioGroup>
        <RadioGroupItem value="apple" style={{ opacity: 0.5 }}>
          Apple
        </RadioGroupItem>
      </RadioGroup>,
    )

    expect(radio(html)).toMatch(/style="[^"]*opacity:0.5/)
  })
})

describe('registry-ui MotionRadioGroup', () => {
  test('hands the label to typeahead and points it at a consumer id', () => {
    const html = renderToStaticMarkup(
      <MotionRadioGroup>
        <MotionRadioGroupItem id="fruit-pear" value="pear">
          Pear
        </MotionRadioGroupItem>
      </MotionRadioGroup>,
    )

    expect(radio(html)).toContain('data-text-value="Pear"')
    expect(radio(html)).toContain('id="fruit-pear"')
    expect(html).toContain('for="fruit-pear"')
  })

  test('a click checks the radio and still reaches the consumer onClick', () => {
    const onClick = vi.fn()
    const onValueChange = vi.fn()
    render(
      <MotionRadioGroup onValueChange={onValueChange}>
        <MotionRadioGroupItem onClick={onClick} value="pear">
          Pear
        </MotionRadioGroupItem>
      </MotionRadioGroup>,
    )

    fireEvent.click(screen.getByRole('radio', { name: 'Pear' }))

    expect(onClick).toHaveBeenCalledTimes(1)
    expect(onValueChange).toHaveBeenCalledWith('pear')
    expect(screen.getByRole('radio', { name: 'Pear' }).getAttribute('aria-checked')).toBe('true')
  })

  test('bounces the circle on every click, not only the first', async () => {
    render(
      <MotionRadioGroup>
        <MotionRadioGroupItem value="pear">Pear</MotionRadioGroupItem>
      </MotionRadioGroup>,
    )
    const pear = screen.getByRole('radio', { name: 'Pear' })
    const bouncing = () => (pear.parentElement as HTMLElement).style.transform

    fireEvent.click(pear)

    await waitFor(() => expect(bouncing()).toContain('scale('))
    await waitFor(() => expect(bouncing()).toBe('none'))

    fireEvent.click(pear)

    await waitFor(() => expect(bouncing()).toContain('scale('))
  })

  test('passes a child that is not a motion item through untouched', () => {
    render(
      <MotionRadioGroup>
        <p>Pick one</p>
        {null}
        <MotionRadioGroupItem value="pear">Pear</MotionRadioGroupItem>
      </MotionRadioGroup>,
    )

    expect(screen.getByText('Pick one').tagName).toBe('P')
    expect(screen.getByRole('radio', { name: 'Pear' })).toBeTruthy()
  })
})
