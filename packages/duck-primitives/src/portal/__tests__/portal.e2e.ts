import { expect, type Page, test } from '@playwright/test'
import { visitStoryById } from '../../__tests__/e2e-helpers'

const visit = (page: Page, story: string) => visitStoryById(page, `utilities-portal--${story}`)

test.describe('Portal', () => {
  test('renders its content into the body, out of a box that clips, and takes it out when it goes', async ({
    page,
  }) => {
    await visit(page, 'clipping-box')
    const content = page.getByText('Out of the box')

    await expect(content).toBeInViewport()
    expect(await page.locator('[data-portaled]').evaluate((element) => element.parentElement === document.body)).toBe(
      true,
    )
    await expect(page.locator('[data-portaled]')).toHaveAttribute('data-slot', 'portal')
    await expect(page.locator('[data-clip] *')).toHaveCount(0)
    await page.getByLabel('Shown').uncheck()
    await expect(content).toHaveCount(0)
  })

  test('renders into the element a ref holds, when that element renders after it', async ({ page }) => {
    await visit(page, 'into-ref')

    await expect(page.getByRole('region', { name: 'Target' }).getByText('Rendered before its container')).toBeVisible()
  })

  test('renders into a form holding a control named current, where its field shows and the form sends it', async ({
    page,
  }) => {
    await visit(page, 'into-form')
    await page.getByLabel('Note').fill('duck')
    await page.getByRole('button', { name: 'Send' }).click()

    await expect(page.getByLabel('Sent')).toHaveText('current=1&note=duck')
  })

  test('renders into a shadow root', async ({ page }) => {
    await visit(page, 'into-shadow-root')

    await expect(page.locator('[data-host]').getByText('In the shadow')).toBeVisible()
  })

  test('portals its child itself with asChild, leaving the child its own data-slot', async ({ page }) => {
    await visit(page, 'as-child')
    const card = page.getByRole('complementary', { name: 'Card' })

    await expect(card).toHaveAttribute('data-slot', 'card')
    expect(await card.evaluate((element) => element.parentElement === document.body)).toBe(true)
  })
})
