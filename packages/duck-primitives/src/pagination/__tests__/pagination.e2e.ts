import { expect, test } from '@playwright/test'
import { visitStory } from '../../__tests__/e2e-helpers'

const current = '[aria-current="page"]'

test.describe('Pagination', () => {
  test('keeps Next under the pointer while it pages through', async ({ page }) => {
    await visitStory(page, 'pagination--buttons')
    const box = await page.getByRole('button', { name: 'Next page' }).boundingBox()
    if (!box) throw new Error('Next page has no box')

    for (let expected = 2; expected <= 14; expected++) {
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
      await expect(page.locator(current)).toHaveText(String(expected))
    }
  })

  test('follows a page link and opens on that page', async ({ page }) => {
    await visitStory(page, 'pagination--links')

    await page.getByRole('link', { name: '3' }).click()

    await expect(page).toHaveURL(/[?&]page=3$/)
    await expect(page.locator(current)).toHaveText('3')
  })

  test('leaves a link that goes nowhere out of the tab order', async ({ page, browserName }) => {
    await visitStory(page, 'pagination--links')

    // WebKit on macOS tabs to links only with Option held, as Safari does by default.
    await page.keyboard.press(browserName === 'webkit' ? 'Alt+Tab' : 'Tab')

    await expect(page.getByRole('link', { name: '1', exact: true })).toBeFocused()
  })
})

test.describe('Pagination client routing', () => {
  test('moves to the page a client router opens, without a reload', async ({ page }) => {
    await visitStory(page, 'pagination--client-routing')
    await page.evaluate(() => {
      document.body.dataset.kept = ''
    })

    await page.getByRole('link', { name: '3', exact: true }).click()

    await expect(page).toHaveURL(/[?&]page=3$/)
    await expect(page.locator(current)).toHaveText('3')
    await expect(page.locator('body[data-kept]')).toHaveCount(1)
  })
})

test.describe('Pagination empty', () => {
  test('draws no pages and leaves every trigger disabled', async ({ page }) => {
    await visitStory(page, 'pagination--empty')

    await expect(page.locator('[data-slot="pagination-page"]')).toHaveCount(0)
    for (const name of ['First page', 'Previous page', 'Next page', 'Last page']) {
      await expect(page.getByRole('button', { name })).toBeDisabled()
    }
  })
})

test.describe('Pagination compact', () => {
  test('steps through the pages with only Previous and Next', async ({ page }) => {
    await visitStory(page, 'pagination--compact')

    await page.getByRole('button', { name: 'Next page' }).click()
    await page.getByRole('button', { name: 'Next page' }).click()

    await expect(page.getByRole('status')).toHaveText('Page 3 of 12')
    await page.getByRole('button', { name: 'Previous page' }).click()
    await expect(page.getByRole('status')).toHaveText('Page 2 of 12')
  })
})

test.describe('Pagination controlled', () => {
  test('reports a click and follows a page set from outside', async ({ page }) => {
    await visitStory(page, 'pagination--controlled')

    await page.getByRole('button', { name: '7', exact: true }).click()
    await expect(page.getByRole('status', { name: 'Page' })).toHaveText('7')
    await page.getByRole('button', { name: 'Go to 10' }).click()

    await expect(page.locator(current)).toHaveText('10')
    await expect(page.getByRole('button', { name: 'Next page' })).toBeEnabled()
  })

  test('shows the last page when the count drops below the current one, with the triggers past it disabled', async ({
    page,
  }) => {
    await visitStory(page, 'pagination--controlled')

    await page.getByRole('button', { name: 'Toggle page count' }).click()

    await expect(page.locator(current)).toHaveText('4')
    await expect(page.locator('[data-slot="pagination-page"]')).toHaveText(['1', '2', '3', '4'])
    await expect(page.getByRole('button', { name: 'Next page' })).toBeDisabled()
    await expect(page.getByRole('button', { name: 'Last page' })).toBeDisabled()
  })

  test('widens the window around the page and drops the end pages', async ({ page }) => {
    await visitStory(page, 'pagination--controlled')

    await page.getByRole('checkbox', { name: 'Wide window' }).check()

    await expect(page.locator('[data-slot="pagination-page"]')).toHaveText(['4', '5', '6', '7', '8'])
    await expect(page.locator('[data-slot="pagination-ellipsis"]')).toHaveCount(2)
  })

  test('lays the controls out right to left, Next before Previous', async ({ page }) => {
    await visitStory(page, 'pagination--controlled')

    await page.getByRole('checkbox', { name: 'Right-to-left' }).check()
    const next = await page.getByRole('button', { name: 'Next page' }).boundingBox()
    const previous = await page.getByRole('button', { name: 'Previous page' }).boundingBox()

    expect(next && previous && next.x < previous.x).toBe(true)
  })

  test('moves with the keyboard: Tab reaches a page and Enter goes to it', async ({ page }) => {
    await visitStory(page, 'pagination--controlled')
    await page.getByRole('button', { name: '6', exact: true }).focus()

    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')

    await expect(page.getByRole('status', { name: 'Page' })).toHaveText('7')
    await expect(page.getByRole('button', { name: '7', exact: true })).toBeFocused()
  })
})

test.describe('Pagination custom range', () => {
  test('draws the range its own way, with its labels, and keeps a disabled trigger inert', async ({ page }) => {
    await visitStory(page, 'pagination--custom-range')

    await expect(page.getByRole('navigation', { name: 'Results' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Results page 8' })).toHaveAttribute('aria-current', 'page')
    await expect(page.getByLabel('Earlier pages')).toHaveText('...')
    await page.getByRole('button', { name: 'Newer results' }).click()

    await expect(page.locator(current)).toHaveText('p7')
    await expect(page.getByRole('button', { name: 'Next page' })).toBeDisabled()
  })
})
