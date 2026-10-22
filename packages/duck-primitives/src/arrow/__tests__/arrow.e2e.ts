import { expect, type Locator, type Page, test } from '@playwright/test'
import { visitStoryById } from '../../__tests__/e2e-helpers'

const visit = (page: Page, story: string) => visitStoryById(page, `utilities-arrow--${story}`)

const box = (locator: Locator) =>
  locator.evaluate((element) => {
    const { x, y, width, height } = element.getBoundingClientRect()
    return [x, y, width, height].map((value) => Math.round(value * 10) / 10)
  })

test.describe('Arrow', () => {
  test('draws its rounded arrow 10 by 5 unless sized, stretched over the whole box', async ({ page }) => {
    await visit(page, 'sizes')

    for (const [name, size] of [
      ['default', [10, 5]],
      ['sized', [40, 20]],
    ] as const) {
      const arrow = page.locator(`[data-arrow="${name}"]`)
      const [x, y, width, height] = await box(arrow)
      expect([width, height]).toEqual(size)
      expect(await box(arrow.locator('path'))).toEqual([x, y, width, height])
    }
  })

  test('takes its fill from the stylesheet', async ({ page }) => {
    await visit(page, 'sizes')

    await expect(page.locator('[data-arrow="default"] path')).toHaveCSS('fill', 'rgb(65, 105, 225)')
  })

  test('draws a custom shape in the viewBox it is given, keeping the aspect ratio it is given', async ({ page }) => {
    await visit(page, 'custom-shape')
    const sharp = page.locator('[data-arrow="sharp"]')
    const kept = page.locator('[data-arrow="kept"]')

    await expect(sharp.locator('path')).toHaveCount(1)
    await expect(sharp.locator('path')).toHaveAttribute('d', 'M0 0h14L7 8z')
    expect(await box(sharp.locator('path'))).toEqual(await box(sharp))
    const [x, y, , height] = await box(kept)
    expect(await box(kept.locator('path'))).toEqual([x + 12.5, y, 35, height])
  })
})
