import { expect, type Page, test } from '@playwright/test'
import { visitStory } from '../../__tests__/e2e-helpers'

const thumb = (page: Page, name: string) => page.getByRole('slider', { exact: true, name })
const output = (page: Page, name: string) => page.getByRole('status', { name })

async function visit(page: Page, story: string, ...toggles: string[]) {
  await visitStory(page, `slider--${story}`)
  for (const toggle of toggles) await page.getByRole('checkbox', { name: toggle }).check()
}

// The point on the first slider at a fraction of its length, measured from its left, or from its bottom when vertical.
async function point(page: Page, fraction: number) {
  const box = await page.locator('[data-slot="slider"]').first().boundingBox()
  if (!box) throw new Error('no slider')
  return box.height > box.width
    ? { x: box.x + box.width / 2, y: box.y + box.height * (1 - fraction) }
    : { x: box.x + box.width * fraction, y: box.y + box.height / 2 }
}

async function press(page: Page, fraction: number) {
  const { x, y } = await point(page, fraction)
  await page.mouse.click(x, y)
}

async function drag(page: Page, name: string, fraction: number) {
  const box = await thumb(page, name).boundingBox()
  if (!box) throw new Error(`no ${name} thumb`)
  const target = await point(page, fraction)
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(target.x, target.y, { steps: 8 })
}

test.describe('Slider', () => {
  test('arrow keys move a step, Shift and the Page keys a large step, Home and End to the ends, each one committed', async ({
    page,
  }) => {
    await visit(page, 'basic')
    await thumb(page, 'Volume').focus()

    for (const [key, value] of [
      ['ArrowRight', '35'],
      ['Shift+ArrowRight', '55'],
      ['PageDown', '35'],
      ['End', '100'],
      ['Home', '0'],
    ]) {
      await page.keyboard.press(key)

      await expect(thumb(page, 'Volume')).toHaveAttribute('aria-valuenow', value)
      await expect(output(page, 'Committed')).toHaveText(value)
    }
  })

  test('a drag moves the value as it goes and commits it once, on release', async ({ page }) => {
    await visit(page, 'basic')

    await drag(page, 'Volume', 0.75)

    await expect(output(page, 'Value')).toHaveText('75')
    await expect(output(page, 'Committed')).toHaveText('30')

    await page.mouse.up()

    await expect(output(page, 'Committed')).toHaveText('75')
    await expect(thumb(page, 'Volume')).toBeFocused()
  })

  test('a drag the browser cancels ends where it stopped, committed', async ({ page }) => {
    await visit(page, 'basic')
    await page.evaluate(() =>
      addEventListener(
        'pointerdown',
        (event) => {
          document.body.dataset.pointerId = String(event.pointerId)
        },
        true,
      ),
    )

    await drag(page, 'Volume', 0.75)
    await thumb(page, 'Volume').evaluate((element) =>
      element.dispatchEvent(
        new PointerEvent('pointercancel', { bubbles: true, pointerId: Number(document.body.dataset.pointerId) }),
      ),
    )

    await expect(output(page, 'Committed')).toHaveText('75')

    const further = await point(page, 0.9)
    await page.mouse.move(further.x, further.y)

    await expect(output(page, 'Value')).toHaveText('75')
  })

  test('a press on the track moves the thumb there', async ({ page }) => {
    await visit(page, 'basic')

    await press(page, 0.9)

    await expect(thumb(page, 'Volume')).toHaveAttribute('aria-valuenow', '90')
    await expect(output(page, 'Committed')).toHaveText('90')
  })

  test('a right click or a Control click on the track moves nothing, since each opens the context menu', async ({
    page,
  }) => {
    await visit(page, 'basic')
    const { x, y } = await point(page, 0.9)

    await page.mouse.click(x, y, { button: 'right' })
    await page.keyboard.down('Control')
    await page.mouse.click(x, y)
    await page.keyboard.up('Control')

    await expect(output(page, 'Value')).toHaveText('30')
  })

  test('a press beside the thumb that leaves the value where it was still focuses it, so a key moves it', async ({
    page,
  }) => {
    await visit(page, 'in-form')
    const box = await thumb(page, 'Rating').boundingBox()
    if (!box) throw new Error('no Rating thumb')

    await page.mouse.click(box.x + box.width + 12, box.y + box.height / 2)

    await expect(thumb(page, 'Rating')).toBeFocused()
    await expect(thumb(page, 'Rating')).toHaveAttribute('aria-valuenow', '3')

    await page.keyboard.press('ArrowRight')

    await expect(thumb(page, 'Rating')).toHaveAttribute('aria-valuenow', '4')
  })

  test('a drag begun beside the thumb, where the value stays, reports each change once', async ({ page }) => {
    await visit(page, 'in-form')
    const box = await thumb(page, 'Rating').boundingBox()
    const root = await page.locator('[data-slot="slider"]').nth(1).boundingBox()
    if (!box || !root) throw new Error('no Rating slider')
    await page.mouse.move(box.x + box.width + 12, box.y + box.height / 2)
    await page.mouse.down()

    await page.mouse.move(root.x + root.width * 0.75, box.y + box.height / 2)

    await expect(thumb(page, 'Rating')).toHaveAttribute('aria-valuenow', '4')
    await expect(output(page, 'Rating changes')).toHaveText('1')
  })

  for (const toggles of [[], ['Right-to-left'], ['Inverted'], ['Vertical'], ['Vertical', 'Inverted']]) {
    test(`keeps the thumb inside the slider at either end${toggles.length ? `, ${toggles.join(' and ').toLowerCase()}` : ''}`, async ({
      page,
    }) => {
      await visit(page, 'basic', ...toggles)
      const root = await page.locator('[data-slot="slider"]').boundingBox()
      if (!root) throw new Error('no slider')
      const [start, size] = toggles.includes('Vertical') ? (['y', 'height'] as const) : (['x', 'width'] as const)
      await thumb(page, 'Volume').focus()

      for (const key of ['Home', 'End']) {
        await page.keyboard.press(key)
        const box = await thumb(page, 'Volume').boundingBox()
        if (!box) throw new Error('no thumb')
        expect([box[start] >= root[start] - 0.5, box[start] + box[size] <= root[start] + root[size] + 0.5]).toEqual([
          true,
          true,
        ])
      }
    })
  }

  test('right to left, the track fills from the right and ArrowRight lowers the value', async ({ page }) => {
    await visit(page, 'basic', 'Right-to-left')

    await press(page, 0.1)

    await expect(thumb(page, 'Volume')).toHaveAttribute('aria-valuenow', '90')

    await page.keyboard.press('ArrowRight')

    await expect(output(page, 'Value')).toHaveText('85')

    const range = await page.locator('[data-slot="slider-range"]').boundingBox()
    const track = await page.locator('[data-slot="slider-track"]').boundingBox()
    if (!range || !track) throw new Error('no track or range')

    expect(Math.round(range.x + range.width)).toBe(Math.round(track.x + track.width))
  })

  test('vertical, the value rises from the bottom and ArrowUp raises it', async ({ page }) => {
    await visit(page, 'basic', 'Vertical')

    await press(page, 0.8)

    await expect(thumb(page, 'Volume')).toHaveAttribute('aria-valuenow', '80')
    await expect(thumb(page, 'Volume')).toHaveAttribute('aria-orientation', 'vertical')

    await page.keyboard.press('ArrowUp')

    await expect(output(page, 'Value')).toHaveText('85')
  })

  test('inverted, the track runs from the right and ArrowRight lowers the value', async ({ page }) => {
    await visit(page, 'basic', 'Inverted')

    await press(page, 0.25)

    await expect(thumb(page, 'Volume')).toHaveAttribute('aria-valuenow', '75')

    await page.keyboard.press('ArrowRight')

    await expect(output(page, 'Value')).toHaveText('70')
  })

  test('disabled, the thumb says so, takes no focus, and a press moves nothing', async ({ page }) => {
    await visit(page, 'basic', 'Disabled')

    await press(page, 0.9)
    await page.keyboard.press('Tab')

    await expect(thumb(page, 'Volume')).toHaveAttribute('aria-disabled', 'true')
    await expect(thumb(page, 'Volume')).not.toHaveAttribute('tabindex')
    await expect(thumb(page, 'Volume')).not.toBeFocused()
    await expect(output(page, 'Value')).toHaveText('30')
  })

  test('Home and End move the focused thumb, kept minStepsBetweenThumbs from the other', async ({ page }) => {
    await visit(page, 'range', 'Keep order')
    await thumb(page, 'Maximum').focus()

    await page.keyboard.press('Home')

    await expect(thumb(page, 'Maximum')).toHaveAttribute('aria-valuenow', '30')
    await expect(page.locator('[data-slot="slider-value"]')).toHaveText('20 to 30')

    await thumb(page, 'Minimum').focus()
    await page.keyboard.press('End')

    await expect(thumb(page, 'Minimum')).toHaveAttribute('aria-valuenow', '20')
  })

  test('an uncontrolled slider commits a key once', async ({ page }) => {
    await visit(page, 'range')
    await thumb(page, 'Minimum').focus()

    await page.keyboard.press('ArrowRight')

    await expect(output(page, 'Commits')).toHaveText('1')
  })

  test('a press on the content inside a thumb focuses that thumb and moves nothing', async ({ page }) => {
    await visit(page, 'range')
    const grip = await thumb(page, 'Minimum').locator('span').boundingBox()
    if (!grip) throw new Error('no grip')

    await page.mouse.click(grip.x + grip.width - 1, grip.y + grip.height / 2)

    await expect(thumb(page, 'Minimum')).toBeFocused()
    await expect(output(page, 'Value')).toHaveText('20, 80')
  })

  test('without kept order, End takes the first thumb past the second, and focus goes with it', async ({ page }) => {
    await visit(page, 'range')
    await thumb(page, 'Minimum').focus()

    await page.keyboard.press('End')

    await expect(output(page, 'Value')).toHaveText('80, 100')
    await expect(thumb(page, 'Maximum')).toBeFocused()
  })

  test('dragged past the other, a thumb swaps with it, unless the order is kept', async ({ page }) => {
    await visit(page, 'range')

    await drag(page, 'Minimum', 0.95)
    await page.mouse.up()

    await expect(output(page, 'Value')).toHaveText('80, 95')
    await expect(thumb(page, 'Maximum')).toBeFocused()

    await page.getByRole('checkbox', { name: 'Keep order' }).check()
    await drag(page, 'Minimum', 0.95)
    await page.mouse.up()

    await expect(output(page, 'Value')).toHaveText('70, 80')
  })

  test('a form submits a value per thumb, a range under name[], and a slider outside it through form', async ({
    page,
  }) => {
    await visit(page, 'in-form')

    await page.getByRole('button', { name: 'Apply' }).click()

    await expect(output(page, 'Submitted')).toHaveText('price[]=20&price[]=60&rating=3')
  })

  test("a key reaches the form's onChange, and Reset restores every default, the outside slider's too", async ({
    page,
  }) => {
    await visit(page, 'in-form')
    await thumb(page, 'Minimum').focus()

    await page.keyboard.press('ArrowRight')

    await expect(output(page, 'Changed')).toHaveText('price[]=21')

    await thumb(page, 'Rating').focus()
    await page.keyboard.press('ArrowRight')
    await page.getByRole('button', { name: 'Reset' }).click()

    await expect(thumb(page, 'Minimum')).toHaveAttribute('aria-valuenow', '20')
    await expect(thumb(page, 'Rating')).toHaveAttribute('aria-valuenow', '3')
  })

  test('Reset leaves focus on the button, though a key moved a thumb last', async ({ page }) => {
    await visit(page, 'in-form')
    await thumb(page, 'Minimum').focus()
    await page.keyboard.press('ArrowRight')
    await page.getByRole('button', { name: 'Reset' }).focus()

    await page.keyboard.press('Enter')

    await expect(thumb(page, 'Minimum')).toHaveAttribute('aria-valuenow', '20')
    await expect(page.getByRole('button', { name: 'Reset' })).toBeFocused()
  })

  test('composed from its parts, the hidden input carries the name and value, and its change bubbles', async ({
    page,
  }) => {
    await visit(page, 'composed')
    const input = page.locator('input[name="volume"]')

    await expect(input).toHaveValue('40')

    await thumb(page, 'Volume').focus()
    await page.keyboard.press('ArrowRight')

    await expect(input).toHaveValue('41')
    await expect(output(page, 'Changed')).toHaveText('volume=41')
  })
})
