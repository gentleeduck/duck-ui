import { expect, type Page, test } from '@playwright/test'
import { visitStory } from '../../__tests__/e2e-helpers'

const settings = (page: Page) => page.getByRole('dialog', { name: 'Pond settings' })
const trigger = (page: Page) => page.getByRole('button', { name: 'Pond settings' })
const pageButton = (page: Page) => page.getByRole('button', { name: 'Page button' })
const scrollY = (page: Page) => page.evaluate(() => window.scrollY)

async function openSettings(page: Page, ...unchecked: string[]) {
  await visitStory(page, 'dialog--basic')
  for (const toggle of unchecked) await page.getByRole('checkbox', { name: toggle }).uncheck()
  await trigger(page).click()
  await expect(settings(page)).toBeVisible()
}

async function wheelOverPage(page: Page) {
  await page.mouse.move(20, 400)
  await page.mouse.wheel(0, 600)
}

test.describe('Dialog', () => {
  test('modal, it hides the page from assistive tech until it closes', async ({ page }) => {
    await openSettings(page)

    await expect(pageButton(page)).toHaveCount(0)

    await page.keyboard.press('Escape')

    await expect(settings(page)).toHaveCount(0)
    await expect(pageButton(page)).toBeVisible()
    await expect(trigger(page)).toBeFocused()
  })

  test('modal, it locks the page while its own list scrolls', async ({ page }) => {
    await openSettings(page)

    await wheelOverPage(page)
    await page.waitForTimeout(100)

    expect(await scrollY(page)).toBe(0)

    const ponds = page.getByRole('list', { name: 'Ponds' })
    await ponds.hover()
    await page.mouse.wheel(0, 600)

    await expect.poll(() => ponds.evaluate((node) => node.scrollTop)).toBeGreaterThan(0)
    expect(await scrollY(page)).toBe(0)
  })

  test('modal, an overlay with lockScroll off leaves the page free to scroll', async ({ page }) => {
    await openSettings(page, 'Lock scroll')

    await wheelOverPage(page)

    await expect.poll(() => scrollY(page)).toBeGreaterThan(0)
  })

  test('non-modal, the page stays usable and scrolls, and a press outside closes it and reaches the page', async ({
    page,
  }) => {
    await openSettings(page, 'Modal')

    await expect(pageButton(page)).toBeVisible()

    await wheelOverPage(page)

    await expect.poll(() => scrollY(page)).toBeGreaterThan(0)

    await pageButton(page).click()

    await expect(settings(page)).toHaveCount(0)
    await expect(page.getByLabel('Page presses')).toHaveText('1')
  })

  test('right-to-left, the direction lands on the content and the overlay, not the trigger', async ({ page }) => {
    await visitStory(page, 'dialog--basic')
    await page.getByRole('checkbox', { name: 'Right-to-left' }).check()
    await trigger(page).click()

    await expect(settings(page)).toHaveAttribute('dir', 'rtl')
    await expect(page.getByTestId('overlay')).toHaveAttribute('dir', 'rtl')
    await expect(page.getByRole('button', { name: 'Pond settings', includeHidden: true })).not.toHaveAttribute('dir')
  })
})

test.describe('Dialog focus targets', () => {
  test('focuses what initialFocus names on open, and what finalFocus names on close', async ({ page }) => {
    await visitStory(page, 'dialog--focus-targets')

    await page.getByRole('button', { name: 'rename' }).click()

    await expect(page.getByRole('textbox', { name: 'name' })).toBeFocused()

    await page.keyboard.press('Escape')

    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'next step' })).toBeFocused()
  })

  test('leaves focus where it is when initialFocus or finalFocus is false', async ({ page }) => {
    await visitStory(page, 'dialog--focus-targets')
    const rename = page.getByRole('button', { name: 'rename', includeHidden: true })
    await page.getByRole('checkbox', { name: 'focus the name on open' }).uncheck()
    await rename.focus()
    await page.keyboard.press('Enter')

    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(rename).toBeFocused()

    await page.keyboard.press('Escape')

    await expect(page.getByRole('button', { name: 'next step' })).toBeFocused()

    await page.getByRole('checkbox', { name: 'focus the name on open' }).check()
    await page.getByRole('checkbox', { name: 'focus next step on close' }).uncheck()
    await rename.focus()
    await page.keyboard.press('Enter')

    await expect(page.getByRole('textbox', { name: 'name' })).toBeFocused()

    await page.keyboard.press('Escape')

    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect.poll(() => page.evaluate(() => document.activeElement === document.body)).toBe(true)
  })
})

test.describe('Dialog guarded and nested', () => {
  test.beforeEach(async ({ page }) => {
    await visitStory(page, 'dialog--guarded-and-nested')
    await page.getByRole('button', { name: 'edit' }).click()
  })

  test('closes on Escape while nothing is unsaved', async ({ page }) => {
    await page.keyboard.press('Escape')

    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(page.getByLabel('State')).toHaveText('closed')
  })

  test('stays open on Escape and an outside press while notes are unsaved', async ({ page }) => {
    await page.getByRole('textbox', { name: 'notes' }).fill('reeds')

    await page.keyboard.press('Escape')
    await page.getByTestId('overlay').click({ position: { x: 5, y: 5 } })

    await expect(page.getByRole('dialog', { name: 'Edit the pond' })).toBeVisible()
    await expect(page.getByLabel('State', { exact: true })).toHaveText('open, unsaved')
  })

  test('marks a nested dialog and its overlay, and counts the dialogs in front of the one they were opened from', async ({
    page,
  }) => {
    const outer = page.getByRole('dialog', { name: 'Edit the pond', includeHidden: true })
    const nestedCount = () =>
      outer.evaluate((node) => getComputedStyle(node).getPropertyValue('--gentleduck-dialog-nested-dialogs'))

    await expect(outer).not.toHaveAttribute('data-nested-dialog-open')
    await expect.poll(nestedCount).toBe('0')

    await page.getByRole('button', { name: 'discard' }).click()

    await expect(page.getByRole('dialog', { name: 'Discard the notes?' })).toHaveAttribute('data-nested', '')
    await expect(page.getByTestId('nested-overlay')).toHaveAttribute('data-nested', '')
    await expect(page.getByTestId('overlay')).not.toHaveAttribute('data-nested')
    await expect(outer).not.toHaveAttribute('data-nested')
    await expect(outer).toHaveAttribute('data-nested-dialog-open', '')
    await expect.poll(nestedCount).toBe('1')

    await page.getByRole('button', { name: 'why' }).click()

    await expect(page.getByRole('dialog', { name: 'Why discard?' })).toBeVisible()
    await expect.poll(nestedCount).toBe('2')

    await page.keyboard.press('Escape')

    await expect(page.getByRole('dialog', { name: 'Why discard?' })).toHaveCount(0)
    await expect.poll(nestedCount).toBe('1')

    await page.keyboard.press('Escape')

    await expect(outer).not.toHaveAttribute('data-nested-dialog-open')
    await expect.poll(nestedCount).toBe('0')
  })

  test('closes only the nested dialog on Escape, and both from its own button', async ({ page }) => {
    await page.getByRole('textbox', { name: 'notes' }).fill('reeds')
    await page.getByRole('button', { name: 'discard' }).click()
    await expect(page.getByRole('dialog', { name: 'Discard the notes?' })).toBeVisible()

    await page.keyboard.press('Escape')

    await expect(page.getByRole('dialog', { name: 'Discard the notes?' })).toHaveCount(0)
    await expect(page.getByRole('dialog', { name: 'Edit the pond' })).toBeVisible()

    await page.getByRole('button', { name: 'discard' }).click()
    await page.getByRole('button', { name: 'discard notes' }).click()

    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(page.getByLabel('State')).toHaveText('closed')
  })
})
