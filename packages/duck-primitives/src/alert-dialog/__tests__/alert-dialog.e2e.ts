import { expect, test } from '@playwright/test'
import { visitStory } from '../../__tests__/e2e-helpers'

test.describe('AlertDialog', () => {
  test('focuses Cancel on open, keeps Tab inside, and hands focus back to the trigger on Escape', async ({ page }) => {
    await visitStory(page, 'alertdialog--basic')
    const trigger = page.getByRole('button', { name: 'Delete project' })

    await trigger.click()
    const dialog = page.getByRole('alertdialog', { name: 'Delete the project?' })
    await expect(dialog).toHaveAccessibleDescription('Its files go with it, and this cannot be undone.')
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(page.getByRole('button', { name: 'Delete', exact: true })).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeFocused()

    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
    await expect(trigger).toBeFocused()
  })

  test('stays open on a click outside, and runs the action once it is chosen', async ({ page }) => {
    await visitStory(page, 'alertdialog--basic')
    await page.getByRole('button', { name: 'Delete project' }).click()

    await page.mouse.click(5, 5)
    await expect(page.getByRole('alertdialog')).toBeVisible()

    await page.getByRole('button', { name: 'Delete', exact: true }).click()
    await expect(page.getByRole('alertdialog')).toHaveCount(0)
    await expect(page.getByText('Deleted 1')).toBeVisible()
  })

  test('closes on Cancel without running the action', async ({ page }) => {
    await visitStory(page, 'alertdialog--basic')
    await page.getByRole('button', { name: 'Delete project' }).click()

    await page.getByRole('button', { name: 'Cancel' }).click()

    await expect(page.getByRole('alertdialog')).toHaveCount(0)
    await expect(page.getByText('Deleted 0')).toBeVisible()
  })

  test('focuses the part initialFocus names in place of Cancel', async ({ page }) => {
    await visitStory(page, 'alertdialog--initial-focus')

    await page.getByRole('button', { name: 'Publish' }).click()

    await expect(page.getByRole('alertdialog').getByRole('button', { name: 'Publish' })).toBeFocused()
  })

  test('stays open while an action that prevented its close works, then closes', async ({ page }) => {
    await visitStory(page, 'alertdialog--async-action')
    await page.getByRole('button', { name: 'Delete project' }).click()

    await page.getByRole('button', { name: 'Delete', exact: true }).click()

    await expect(page.getByRole('button', { name: 'Deleting...' })).toBeVisible()
    await expect(page.getByRole('alertdialog')).toHaveCount(0)
  })

  test('writes the direction a provider gives on the content', async ({ page }) => {
    await visitStory(page, 'alertdialog--rtl')

    await page.getByRole('button', { name: 'حذف المشروع' }).click()

    await expect(page.getByRole('alertdialog')).toHaveAttribute('dir', 'rtl')
  })
})
