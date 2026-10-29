import { expect, type Locator, test } from '@playwright/test'
import { visitStory } from '../../__tests__/e2e-helpers'

async function box(locator: Locator) {
  const rect = await locator.boundingBox()
  if (!rect) throw new Error('no box')
  return rect
}

test.describe('Progress', () => {
  test.beforeEach(async ({ page }) => {
    await visitStory(page, 'progress--basic')
  })

  test('is named by its label and reads its value out as text', async ({ page }) => {
    const bar = page.getByRole('progressbar', { name: 'Upload' })
    const labelId = await page.locator('[data-slot="progress-label"]').getAttribute('id')

    await expect(bar).toHaveAttribute('aria-labelledby', labelId ?? '')
    await expect(bar).toHaveAttribute('aria-valuenow', '30')
    await expect(bar).toHaveAttribute('aria-valuetext', '30%')
    await expect(page.locator('[data-slot="progress-value"]').first()).toHaveText('30%')
    await expect(page.locator('[data-slot="progress-value"]').last()).toHaveText('Done: 30%')
  })

  test('marks every part complete at max, and loading again below it', async ({ page }) => {
    const parts = page.locator('[data-slot^="progress"]')

    await page.getByRole('button', { name: 'Finish' }).click()

    await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100')
    for (const part of await parts.all()) await expect(part).toHaveAttribute('data-state', 'complete')

    await page.getByRole('button', { name: 'Back' }).click()

    await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuetext', '90%')
    for (const part of await parts.all()) await expect(part).toHaveAttribute('data-state', 'loading')
  })

  test('an unknown amount is indeterminate, with no value to read', async ({ page }) => {
    const bar = page.getByRole('progressbar')

    await page.getByRole('button', { name: 'Unknown amount' }).click()

    await expect(bar).toHaveAttribute('data-state', 'indeterminate')
    await expect(bar).not.toHaveAttribute('aria-valuenow')
    await expect(bar).not.toHaveAttribute('aria-valuetext')
    await expect(page.locator('[data-slot="progress-value"]').first()).toHaveText('')
    await expect(page.locator('[data-slot="progress-value"]').last()).toHaveText('Waiting to start')

    await page.getByRole('button', { name: 'Step' }).click()

    await expect(bar).toHaveAttribute('aria-valuenow', '10')
  })

  test('refuses a value past max and shows it as indeterminate', async ({ page }) => {
    await page.getByRole('button', { name: 'Overshoot' }).click()

    await expect(page.getByRole('progressbar')).toHaveAttribute('data-state', 'indeterminate')
    await expect(page.getByRole('progressbar')).not.toHaveAttribute('aria-valuenow')
  })

  test('reads its value through getValueLabel', async ({ page }) => {
    const bar = page.getByRole('progressbar')

    await page.getByRole('radio', { name: 'files' }).check()

    await expect(bar).toHaveAttribute('aria-valuemax', '8')
    await expect(bar).toHaveAttribute('aria-valuetext', '3 of 8 files')

    await page.getByRole('button', { name: 'Step' }).click()

    await expect(page.locator('[data-slot="progress-value"]').first()).toHaveText('4 of 8 files')
  })

  test('measures from min, so the default label is the share of the way from min to max', async ({ page }) => {
    const bar = page.getByRole('progressbar')
    const indicator = page.locator('[data-slot="progress-indicator"]')

    await page.getByRole('radio', { name: 'from 20' }).check()

    await expect(bar).toHaveAttribute('aria-valuemin', '20')
    await expect(bar).toHaveAttribute('aria-valuenow', '70')
    await expect(bar).toHaveAttribute('aria-valuetext', '50%')
    await expect
      .poll(async () => (await box(indicator)).width / (await box(indicator.locator('..'))).width)
      .toBeCloseTo(0.5)
  })

  test('fills from the right in right-to-left', async ({ page }) => {
    const indicator = page.locator('[data-slot="progress-indicator"]')

    await page.getByRole('checkbox', { exact: true, name: 'Right-to-left' }).check()

    await expect(page.getByRole('progressbar')).toHaveAttribute('dir', 'rtl')
    const track = await box(indicator.locator('..'))
    const fill = await box(indicator)
    expect(fill.x + fill.width).toBeCloseTo(track.x + track.width)
    expect(fill.x).toBeGreaterThan(track.x)
  })

  test('fills from the right on a right-to-left page, with no dir of its own', async ({ page }) => {
    const indicator = page.locator('[data-slot="progress-indicator"]')

    await page.getByRole('checkbox', { name: 'Right-to-left page' }).check()

    await expect(page.getByRole('progressbar')).not.toHaveAttribute('dir')
    const track = await box(indicator.locator('..'))
    const fill = await box(indicator)
    expect(fill.x + fill.width).toBeCloseTo(track.x + track.width)
    expect(fill.x).toBeGreaterThan(track.x)
  })

  test('drops aria-labelledby once its label is gone', async ({ page }) => {
    await page.getByRole('checkbox', { name: 'Show label' }).uncheck()

    await expect(page.getByRole('progressbar')).not.toHaveAttribute('aria-labelledby')
  })
})
