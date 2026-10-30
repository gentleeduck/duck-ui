import { afterEach, describe, expect, mock, test } from 'bun:test'
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react'
import * as React from 'react'
import { MotionCheckbox, MotionCheckboxGroup } from '../motion-checkbox'

afterEach(cleanup)

const box = () => document.querySelector('input') as HTMLInputElement

describe('registry-ui MotionCheckbox', () => {
  test('hands a ref the input and reports a click', () => {
    const ref = React.createRef<HTMLInputElement>()
    const onCheckedChange = mock()
    render(<MotionCheckbox onCheckedChange={onCheckedChange} ref={ref} />)

    fireEvent.click(box())

    expect(ref.current).toBe(box())
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  test('bounces on every tick, not only the first', async () => {
    const { container } = render(<MotionCheckbox />)
    const bouncing = () => (container.firstElementChild as HTMLElement).style.transform
    fireEvent.click(box())
    await waitFor(() => expect(bouncing()).toContain('scale('))
    await waitFor(() => expect(bouncing()).toBe('none'))

    fireEvent.click(box())

    await waitFor(() => expect(bouncing()).toContain('scale('))
  })
})

describe('registry-ui MotionCheckboxGroup', () => {
  test('starts a subtask on its value and lets it be unticked', () => {
    render(<MotionCheckboxGroup subtasks={[{ checked: true, id: 'wireframes', title: 'Design wireframes' }]} />)
    expect(box().checked).toBe(true)

    fireEvent.click(box())

    expect(box().checked).toBe(false)
  })
})
