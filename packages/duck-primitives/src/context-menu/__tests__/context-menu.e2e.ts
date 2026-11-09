import { expect, type Page, test } from '@playwright/test'
import { visitStory } from '../../__tests__/e2e-helpers'

const openMenu = (page: Page) => page.getByText('Right Click Here', { exact: true }).click({ button: 'right' })

test.describe('ContextMenu items', () => {
  test.beforeEach(async ({ page }) => {
    await visitStory(page, 'contextmenu--checkable-items')
    await openMenu(page)
  })

  test('toggles a checkbox item and closes, or stays open for one with closeOnSelect off', async ({ page }) => {
    const ruler = page.getByRole('menuitemcheckbox', { name: 'Ruler' })
    await expect(ruler).toHaveAttribute('aria-checked', 'true')

    await ruler.click()

    await expect(page.getByRole('menu')).toHaveCount(0)
    await expect(page.getByLabel('View')).toHaveText('ruler off, grid off, zoom fit')

    await openMenu(page)
    await page.getByRole('menuitemcheckbox', { name: 'Grid' }).click()

    await expect(page.getByRole('menuitemcheckbox', { name: 'Grid' })).toHaveAttribute('aria-checked', 'true')
    await expect(page.getByLabel('View')).toHaveText('ruler off, grid on, zoom fit')
  })

  test('checks the one radio item chosen and unchecks the rest', async ({ page }) => {
    await page.getByRole('menuitemradio', { name: 'Actual size' }).click()
    await expect(page.getByLabel('View')).toHaveText('ruler on, grid off, zoom actual')

    await openMenu(page)

    await expect(page.getByRole('menuitemradio', { name: 'Actual size' })).toHaveAttribute('aria-checked', 'true')
    await expect(page.getByRole('menuitemradio', { name: 'Fit' })).toHaveAttribute('aria-checked', 'false')
  })

  test('passes over a disabled item on the keyboard and ignores a click on it', async ({ page }) => {
    const paste = page.getByRole('menuitem', { name: 'Paste' })
    await expect(paste).toHaveAttribute('aria-disabled', 'true')

    await paste.click({ force: true })
    await expect(page.getByRole('menu')).toBeVisible()

    await page.keyboard.press('End')
    await expect(page.getByRole('menuitemradio', { name: 'Actual size' })).toBeFocused()
  })
})

test.describe('ContextMenu modal and disabled', () => {
  test.beforeEach(async ({ page }) => {
    await visitStory(page, 'contextmenu--modal-and-disabled')
  })

  const pressCount = async (page: Page) => {
    const box = await page.getByRole('button', { name: 'Count', includeHidden: true }).boundingBox()
    if (!box) throw new Error('Count has no box')
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
  }

  test('keeps a press outside from the page while modal, and closes either way', async ({ page }) => {
    await openMenu(page)
    await pressCount(page)

    await expect(page.getByRole('menu')).toHaveCount(0)
    await expect(page.getByLabel('Clicks')).toHaveText('0')

    await page.getByLabel('Modal').uncheck()
    await openMenu(page)
    await pressCount(page)

    await expect(page.getByRole('menu')).toHaveCount(0)
    await expect(page.getByLabel('Clicks')).toHaveText('1')
  })

  test('closes on a right click at the trigger while open, modal or not', async ({ page }) => {
    const trigger = page.getByText('Right Click Here', { exact: true })
    await openMenu(page)
    await trigger.click({ button: 'right', force: true })

    await expect(page.getByRole('menu')).toHaveCount(0)

    await page.getByLabel('Modal').uncheck()
    await openMenu(page)
    await trigger.click({ button: 'right', force: true })

    await expect(page.getByRole('menu')).toHaveCount(0)
  })

  test('opens nothing from a disabled trigger', async ({ page }) => {
    await page.getByLabel('Disabled').check()

    await openMenu(page)

    await expect(page.getByText('Right Click Here', { exact: true })).toHaveAttribute('data-disabled', '')
    await expect(page.getByRole('menu')).toHaveCount(0)
  })
})
