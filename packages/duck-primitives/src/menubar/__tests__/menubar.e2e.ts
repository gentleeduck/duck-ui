import { expect, type Page, test } from '@playwright/test'
import { visitStory } from '../../__tests__/e2e-helpers'

const trigger = (page: Page, name: string) => page.getByRole('menuitem', { exact: true, name })

test.describe('Menubar opened from the keyboard', () => {
  test.beforeEach(async ({ page }) => {
    await visitStory(page, 'menubar--checkable-items')
  })

  for (const key of ['Enter', ' ', 'ArrowDown']) {
    test(`opens on ${key === ' ' ? 'Space' : key} with the first item focused`, async ({ page }) => {
      await trigger(page, 'View').focus()
      await page.keyboard.press(key)

      await expect(page.getByRole('menu')).toBeVisible()
      await expect(page.getByRole('menuitemcheckbox', { name: 'Ruler' })).toBeFocused()
    })
  }

  test('skips a disabled item, and gives focus back to the trigger on Escape', async ({ page }) => {
    await trigger(page, 'View').focus()
    await page.keyboard.press('Enter')
    await page.keyboard.press('End')

    await expect(page.getByRole('menuitemradio', { name: 'Actual size' })).toBeFocused()

    await page.keyboard.press('Escape')

    await expect(page.getByRole('menu')).toHaveCount(0)
    await expect(trigger(page, 'View')).toBeFocused()
  })
})

test.describe('Menubar checkable items', () => {
  test.beforeEach(async ({ page }) => {
    await visitStory(page, 'menubar--checkable-items')
    await trigger(page, 'View').click()
  })

  test('toggles a checkbox item and closes, or stays open when closeOnSelect is off', async ({ page }) => {
    await page.getByRole('menuitemcheckbox', { name: 'Ruler' }).click()

    await expect(page.getByRole('menu')).toHaveCount(0)
    await expect(page.getByLabel('Settings')).toHaveText('ruler off, grid off, zoom fit')

    await trigger(page, 'View').click()
    await page.getByRole('menuitemcheckbox', { name: 'Grid' }).click()

    await expect(page.getByRole('menu')).toBeVisible()
    await expect(page.getByRole('menuitemcheckbox', { name: 'Grid' })).toHaveAttribute('aria-checked', 'true')
    await expect(page.getByLabel('Settings')).toHaveText('ruler off, grid on, zoom fit')
  })

  test('checks only the chosen radio item, inside its named group', async ({ page }) => {
    await expect(page.getByRole('group', { name: 'Zoom' })).toBeVisible()
    await page.getByRole('menuitemradio', { name: 'Actual size' }).click()
    await trigger(page, 'View').click()

    await expect(page.getByRole('menuitemradio', { name: 'Actual size' })).toHaveAttribute('aria-checked', 'true')
    await expect(page.getByRole('menuitemradio', { name: 'Fit' })).toHaveAttribute('aria-checked', 'false')
    await expect(page.getByLabel('Settings')).toHaveText('ruler on, grid off, zoom actual')
  })

  test('closes only a submenu that keeps its menu open on Escape, then the menu', async ({ page }) => {
    await page.getByRole('menuitem', { name: 'Panels' }).focus()
    await page.keyboard.press('ArrowRight')

    await expect(page.getByRole('menuitem', { name: 'Layers' })).toBeFocused()

    await page.keyboard.press('Escape')

    await expect(page.getByRole('menuitem', { name: 'Layers' })).toHaveCount(0)
    await expect(page.getByRole('menuitem', { name: 'Panels' })).toBeFocused()

    await page.keyboard.press('Escape')

    await expect(page.getByRole('menu')).toHaveCount(0)
    await expect(trigger(page, 'View')).toBeFocused()
  })

  test('ignores a click on a disabled item', async ({ page }) => {
    await page.getByRole('menuitem', { name: 'Paste' }).click({ force: true })

    await expect(page.getByRole('menu')).toBeVisible()
  })
})

test.describe('Menubar controlled, disabled, vertical and modal', () => {
  const pressCount = async (page: Page) => {
    const box = await page.getByRole('button', { includeHidden: true, name: 'Count' }).boundingBox()
    if (!box) throw new Error('Count has no box')
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
  }

  test.beforeEach(async ({ page }) => {
    await visitStory(page, 'menubar--controlled-and-disabled')
  })

  test('opens the menu its value names, and reports the menu a click or a key opens', async ({ page }) => {
    await page.getByRole('button', { name: 'Open Edit' }).click()

    await expect(page.getByRole('menuitem', { name: 'Undo' })).toBeVisible()
    await expect(trigger(page, 'Edit')).toHaveAttribute('aria-expanded', 'true')

    await page.keyboard.press('Escape')

    await expect(page.getByLabel('Open menu')).toHaveText('none')

    await trigger(page, 'File').click()

    await expect(page.getByLabel('Open menu')).toHaveText('file')

    await page.keyboard.press('ArrowRight')

    await expect(page.getByLabel('Open menu')).toHaveText('edit')
    await expect(page.getByRole('menuitem', { name: 'Undo' })).toBeVisible()
  })

  test('passes over a disabled trigger, and wraps from the last trigger to the first', async ({ page }) => {
    await trigger(page, 'Edit').click()
    await page.keyboard.press('Escape')
    await expect(trigger(page, 'Edit')).toBeFocused()
    await page.keyboard.press('ArrowRight')

    await expect(trigger(page, 'Help')).toBeDisabled()
    await expect(trigger(page, 'File')).toBeFocused()
  })

  test('opens the last menu on Shift+A and the first on Shift+I, passing over a disabled one', async ({ page }) => {
    await trigger(page, 'File').click()
    await page.keyboard.press('Shift+A')

    await expect(page.getByLabel('Open menu')).toHaveText('edit')

    await page.keyboard.press('Shift+I')

    await expect(page.getByLabel('Open menu')).toHaveText('file')
  })

  test('keeps the open menu when the pointer moves onto a disabled trigger', async ({ page }) => {
    await trigger(page, 'Edit').click()
    await trigger(page, 'Help').hover({ force: true })

    await expect(page.getByLabel('Open menu')).toHaveText('edit')
    await expect(page.getByRole('menuitem', { name: 'Undo' })).toBeVisible()
  })

  test('opens no menu while the bar is disabled', async ({ page }) => {
    await page.getByRole('checkbox', { name: 'Disabled' }).check()

    await expect(trigger(page, 'File')).toBeDisabled()
    await trigger(page, 'File').click({ force: true })

    await expect(page.getByRole('menu')).toHaveCount(0)
    await expect(page.getByLabel('Open menu')).toHaveText('none')
  })

  test('in a vertical bar, moves between triggers on the up and down arrows and opens on the right one', async ({
    page,
  }) => {
    await page.getByRole('checkbox', { name: 'Vertical' }).check()
    await trigger(page, 'File').click()
    await page.keyboard.press('Escape')
    await expect(trigger(page, 'File')).toBeFocused()
    await page.keyboard.press('ArrowDown')

    await expect(trigger(page, 'Edit')).toBeFocused()
    await expect(page.getByRole('menu')).toHaveCount(0)

    await page.keyboard.press('ArrowRight')

    await expect(page.getByRole('menuitem', { name: 'Undo' })).toBeFocused()
    await expect(page.getByLabel('Open menu')).toHaveText('edit')
  })

  test('lets a click outside a menu reach the page, and closes', async ({ page }) => {
    await trigger(page, 'File').click()
    await pressCount(page)

    await expect(page.getByRole('menu')).toHaveCount(0)
    await expect(page.getByLabel('Clicks')).toHaveText('1')
  })

  test('closes on a second press of the trigger that opened it', async ({ page }) => {
    await trigger(page, 'File').click()

    await expect(page.getByRole('menu')).toBeVisible()

    await trigger(page, 'File').click()

    await expect(page.getByRole('menu')).toHaveCount(0)
  })

  test('keeps a click outside a modal bar from reaching the page, and closes', async ({ page }) => {
    await page.getByRole('checkbox', { name: 'Modal' }).check()
    await trigger(page, 'File').click()
    await pressCount(page)

    await expect(page.getByRole('menu')).toHaveCount(0)
    await expect(page.getByLabel('Clicks')).toHaveText('0')
  })
})
