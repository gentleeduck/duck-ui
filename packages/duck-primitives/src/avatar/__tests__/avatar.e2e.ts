import { expect, test } from '@playwright/test'
import { visitStory } from '../../__tests__/e2e-helpers'

test.describe('Avatar', () => {
  test('shows the image once it loads, with no fallback, and reports loading then loaded', async ({ page }) => {
    await visitStory(page, 'avatar--loaded')

    await expect(page.getByRole('img', { name: 'Ada' })).toBeVisible()
    await expect(page.getByRole('img', { name: 'Ada' })).toHaveAttribute('data-state', 'loaded')
    await expect(page.getByText('AL')).toHaveCount(0)
    // StrictMode runs the status effect twice in development.
    await expect(page.getByText(/^Statuses (loading )+loaded$/)).toBeVisible()
  })

  test('shows the fallback when the image fails, and keeps the broken image out of sight', async ({ page }) => {
    await visitStory(page, 'avatar--broken')

    await expect(page.getByText('AL')).toBeVisible()
    await expect(page.getByRole('img', { name: 'Ada', includeHidden: true })).toHaveAttribute('data-state', 'error')
    await expect(page.getByRole('img', { name: 'Ada', includeHidden: true })).toBeHidden()
  })

  test('renders no image and shows the fallback when there is no source', async ({ page }) => {
    await visitStory(page, 'avatar--no-source')

    await expect(page.getByText('AL')).toBeVisible()
    await expect(page.locator('img')).toHaveCount(0)
  })

  test('holds the fallback back for delayMs', async ({ page }) => {
    await visitStory(page, 'avatar--delayed-fallback')

    await expect(page.locator('[data-slot="avatar"]')).toBeAttached()
    await expect(page.getByText('AL')).toHaveCount(0)
    await expect(page.getByText('AL')).toBeVisible()
  })

  test('follows a source that changes, from broken to loaded and back', async ({ page }) => {
    await visitStory(page, 'avatar--changing-source')
    await expect(page.getByText('AL')).toBeVisible()

    await page.getByRole('button', { name: 'Swap' }).click()
    await expect(page.getByRole('img', { name: 'Ada' })).toBeVisible()
    await expect(page.getByText('AL')).toHaveCount(0)

    await page.getByRole('button', { name: 'Swap' }).click()
    await expect(page.getByText('AL')).toBeVisible()
  })
})
