import { expect, type Locator, type Page, test } from '@playwright/test'
import { visitStory } from '../../__tests__/e2e-helpers'

const resolved = (page: Page, name: string) => page.getByRole('status', { exact: true, name })
const pick = (page: Page, name: string, value: string) =>
  page.getByRole('combobox', { exact: true, name }).selectOption(value)
const box = async (locator: Locator) => {
  const found = await locator.boundingBox()
  if (!found) throw new Error('no box')
  return found
}
const right = async (locator: Locator) => {
  const { width, x } = await box(locator)
  return x + width
}

test.describe('Direction', () => {
  test.beforeEach(async ({ page }) => {
    await visitStory(page, 'direction--basic')
  })

  test('reads <html dir> where no provider is set, and follows a change to it', async ({ page }) => {
    await expect(resolved(page, 'Page')).toHaveText('ltr')

    await pick(page, 'Document', 'rtl')

    for (const name of ['Page', 'Provider', 'Nested', 'Local']) await expect(resolved(page, name)).toHaveText('rtl')

    await page.evaluate(() => document.documentElement.removeAttribute('dir'))

    await expect(resolved(page, 'Page')).toHaveText('ltr')

    await pick(page, 'Document', 'RTL')

    await expect(resolved(page, 'Page')).toHaveText('rtl')

    await pick(page, 'Document', 'auto')

    await expect(resolved(page, 'Page')).toHaveText('ltr')
  })

  test('a provider wins over the document, a nested one over its parent, and a local dir over both', async ({
    page,
  }) => {
    await pick(page, 'Document', 'rtl')
    await pick(page, 'Provider dir', 'ltr')

    await expect(resolved(page, 'Page')).toHaveText('rtl')
    await expect(resolved(page, 'Provider')).toHaveText('ltr')
    await expect(resolved(page, 'Nested')).toHaveText('ltr')

    await pick(page, 'Nested provider dir', 'rtl')

    await expect(resolved(page, 'Provider')).toHaveText('ltr')
    await expect(resolved(page, 'Nested')).toHaveText('rtl')

    await pick(page, 'Local dir', 'ltr')

    await expect(resolved(page, 'Nested')).toHaveText('rtl')
    await expect(resolved(page, 'Local')).toHaveText('ltr')
  })
})

test.describe('Direction layout', () => {
  test.beforeEach(async ({ page }) => {
    await visitStory(page, 'direction--layout')
  })

  test('lays its subtree out right to left and matches a [dir=rtl] selector, then left to right once switched', async ({
    page,
  }) => {
    const first = page.getByText('First', { exact: true })
    const second = page.getByText('Second', { exact: true })
    const marked = page.getByText('Marked', { exact: true })

    expect((await box(first)).x).toBeGreaterThan((await box(second)).x)
    await expect(marked).toHaveCSS('color', 'rgb(200, 0, 0)')

    await page.getByRole('checkbox', { name: 'Right-to-left' }).uncheck()

    expect((await box(first)).x).toBeLessThan((await box(second)).x)
    await expect(marked).not.toHaveCSS('color', 'rgb(200, 0, 0)')
  })

  test('draws no box of its own, so its children are the grid items', async ({ page }) => {
    const one = await box(page.getByText('Cell one', { exact: true }))
    const two = await box(page.getByText('Cell two', { exact: true }))

    expect(two.y).toBe(one.y)
    expect(two.x).not.toBe(one.x)
  })
})

test.describe('Direction portalled', () => {
  test.beforeEach(async ({ page }) => {
    await visitStory(page, 'direction--portalled')
  })

  test('reaches a popover portalled out of it, which aligns its start to the right', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Align start' })
    const content = page.getByRole('dialog', { name: 'Below' })

    await trigger.click()

    await expect(content).toHaveAttribute('dir', 'rtl')
    await expect(content).toHaveCSS('direction', 'rtl')
    await expect.poll(async () => Math.abs((await right(content)) - (await right(trigger)))).toBeLessThanOrEqual(1)

    await page.keyboard.press('Escape')
    await page.getByRole('checkbox', { name: 'Right-to-left' }).uncheck()
    await trigger.click()

    await expect(content).toHaveCSS('direction', 'ltr')
    await expect.poll(async () => Math.abs((await box(content)).x - (await box(trigger)).x)).toBeLessThanOrEqual(1)
  })

  test('mirrors a right side to the left', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Side right' })
    const content = page.getByRole('dialog', { name: 'Beside' })

    await trigger.click()

    await expect.poll(async () => (await right(content)) - (await box(trigger)).x).toBeLessThanOrEqual(0)
  })
})
