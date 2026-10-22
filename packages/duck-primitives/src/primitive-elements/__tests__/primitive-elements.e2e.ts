import { expect, type Page, test } from '@playwright/test'
import { visitStoryById } from '../../__tests__/e2e-helpers'

const visit = (page: Page, story: string) => visitStoryById(page, `utilities-primitive--${story}`)

test.describe('Primitive', () => {
  test('a form built of primitives sends its text field and its select', async ({ page }) => {
    await visit(page, 'form')
    await page.getByLabel('Name').fill('duck')
    await page.getByLabel('Size').selectOption('l')
    await page.getByRole('button', { name: 'Send' }).click()

    await expect(page.getByRole('status', { name: 'Sent' })).toHaveText('name=duck&size=l')
  })

  test("renders the element it is given with asChild, running its handler after the element's own", async ({
    page,
  }) => {
    await visit(page, 'as-child')
    await page.getByRole('link', { name: 'Next' }).click()

    await expect(page.getByLabel('Calls')).toHaveText('link, button')
    expect(new URL(page.url()).hash).toBe('#next')
    await expect(page.getByRole('button')).toHaveCount(0)
  })
})
