import { expect, type Page, test } from '@playwright/test'
import { visitStoryById } from '../../__tests__/e2e-helpers'

const visit = (page: Page, story: string) => visitStoryById(page, `utilities-slot--${story}`)

test.describe('Slot', () => {
  test('lands on the link, runs its click handler before the slot one, by pointer and by Enter', async ({ page }) => {
    await visit(page, 'as-child')
    const link = page.getByRole('link', { name: 'Docs' })

    await link.click()
    await link.press('Enter')

    await expect(page.getByRole('button', { name: 'Docs' })).toHaveCount(0)
    await expect(page.getByLabel('Calls')).toHaveText('link, button, link, button')
  })

  test('joins the classes, slot first, and lets the child style win', async ({ page }) => {
    await visit(page, 'as-child')
    const link = page.getByRole('link', { name: 'Docs' })

    await expect(link).toHaveAttribute('class', /button.* .*link/)
    await expect(link).toHaveCSS('color', 'rgb(65, 105, 225)')
    await expect(link).toHaveCSS('padding', '8px 16px')
  })

  test('describes the link by its note and the slot hint, and by the hint alone once the note is false', async ({
    page,
  }) => {
    await visit(page, 'as-child')
    const link = page.getByRole('link', { name: 'Docs' })

    await expect(link).toHaveAccessibleDescription('Opens the guide. Press Enter or click.')
    await page.getByLabel('Note').uncheck()

    await expect(link).toHaveAttribute('aria-describedby', 'hint')
    await expect(link).toHaveAccessibleDescription('Press Enter or click.')
  })

  test('hands the link to both its own ref and the slot ref', async ({ page }) => {
    await visit(page, 'as-child')

    await page.getByRole('button', { name: 'Read refs' }).click()

    await expect(page.getByLabel('Refs')).toHaveText('A A')
  })

  test('puts its other children inside the Slottable element, which keeps what was typed as they change', async ({
    page,
  }) => {
    await visit(page, 'icons')
    const field = page.locator('[data-field]')
    const input = page.getByRole('textbox', { name: 'Email' })

    await expect(field).toHaveText('@Email .com')
    await expect(field).toHaveJSProperty('tagName', 'LABEL')
    await input.fill('duck')
    await page.getByLabel('Icon').uncheck()

    await expect(field).toHaveText('Email .com')
    await expect(input).toHaveValue('duck')
  })

  test('wraps the element children with a render prop Slottable', async ({ page }) => {
    await visit(page, 'render-prop')
    const link = page.getByRole('link', { name: 'Tags' })

    await expect(link.locator('span').first()).toHaveText('Tags')
    await expect(link).toHaveText('Tags->')
    await expect(link).toHaveAttribute('class', /button/)
  })

  test('lands on a lazy component once it loads', async ({ page }) => {
    await visit(page, 'lazy')

    await expect(page.getByRole('link', { name: 'Lazy docs' })).toHaveAttribute('class', /button/)
    await expect(page.getByText('Loading')).toHaveCount(0)
  })

  test('throws an error naming its owner for text, several elements and a Slottable around text', async ({ page }) => {
    await visit(page, 'unslottable')
    const alert = page.getByRole('alert')

    await expect(alert).toHaveText(
      'Toolbar.Button failed to slot onto its children. Expected a single React element child or `Slottable`.',
    )
    await page.getByLabel('elements').check()
    await expect(alert).toHaveText(
      'Toolbar.Button failed to slot onto its children. Expected a single React element child or `Slottable`.',
    )
    await page.getByLabel('slottable').check()
    await expect(alert).toHaveText(
      'Toolbar.Button failed to slot onto its `Slottable`. Expected a single React element inside `Slottable`.',
    )
  })

  test('attaches a ref that renders no more however often the slot renders again', async ({ page }) => {
    await visit(page, 'ref-that-renders')
    const again = page.getByRole('button', { name: 'Render again' })
    const attached = page.getByLabel('Attached')
    // Strict mode attaches it twice on mount.
    await expect(attached).toHaveText('2')

    await again.click()
    await again.click()
    await again.click()

    await expect(attached).toHaveText('2')
  })

  test('renders no raw HTML a child sets', async ({ page }) => {
    await visit(page, 'raw-html')

    await expect(page.locator('[data-raw]')).toBeAttached()
    await expect(page.locator('#injected')).toHaveCount(0)
  })
})
