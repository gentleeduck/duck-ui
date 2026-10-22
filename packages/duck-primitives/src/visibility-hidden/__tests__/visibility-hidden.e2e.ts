import { expect, type Locator, type Page, test } from '@playwright/test'
import { visitStoryById } from '../../__tests__/e2e-helpers'

const visit = (page: Page, story: string) => visitStoryById(page, `utilities-visuallyhidden--${story}`)

const size = (locator: Locator) =>
  locator.evaluate((element) => {
    const { width, height } = element.getBoundingClientRect()
    return [width, height]
  })

test.describe('VisuallyHidden', () => {
  test('names an icon button while drawing nothing and taking no room in it', async ({ page }) => {
    await visit(page, 'icon-button')
    const button = page.getByRole('button', { name: 'Open notifications' })

    await expect(button).toBeVisible()
    expect(await size(page.locator('[data-label]'))).toEqual([1, 1])
    await expect(page.locator('[data-label]')).toHaveCSS('clip', 'rect(0px, 0px, 0px, 0px)')
    expect(await size(button)).toEqual([32, 32])
  })

  test('hides a control it slots onto down to one pixel, border and padding included', async ({ page }) => {
    await visit(page, 'icon-button')

    expect(await size(page.getByRole('button', { name: 'Hidden control' }))).toEqual([1, 1])
  })

  test('hides a dialog title that still names the dialog and keeps its own data-slot', async ({ page }) => {
    await visit(page, 'hidden-title')
    const title = page.getByRole('heading', { name: 'Settings' })

    await expect(page.getByRole('dialog', { name: 'Settings' })).toBeVisible()
    await expect(title).toHaveAttribute('data-slot', 'dialog-title')
    expect(await size(title)).toEqual([1, 1])
  })
})
