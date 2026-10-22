import { expect, type Locator, type Page, test } from '@playwright/test'
import { visitStory } from '../../__tests__/e2e-helpers'

const tool = (page: Page, name: string) => page.getByRole('button', { exact: true, name })
const toolbar = (page: Page) => page.getByRole('toolbar', { name: 'Formatting' })
const tabStop = (page: Page) => page.getByRole('status', { name: 'Tab stop' })

async function check(page: Page, label: string, checked = true) {
  await page.getByRole('checkbox', { exact: true, name: label }).setChecked(checked)
}

async function tabIn(page: Page) {
  await page.getByLabel('Before').focus()
  await page.keyboard.press('Tab')
}

async function x(locator: Locator) {
  const box = await locator.boundingBox()
  if (!box) throw new Error('The element has no box.')
  return box.x
}

test.describe('RovingFocusGroup', () => {
  test.beforeEach(async ({ page }) => {
    await visitStory(page, 'rovingfocusgroup--basic')
  })

  test('Tab enters on the first item and leaves past the rest, and Shift+Tab comes back to the item it left', async ({
    page,
  }) => {
    await tabIn(page)

    await expect(tool(page, 'Bold')).toBeFocused()
    await expect(tabStop(page)).toHaveText('Bold')

    await page.keyboard.press('ArrowRight')
    await expect(tool(page, 'Italic')).toBeFocused()
    await page.keyboard.press('Tab')

    await expect(page.getByRole('button', { name: 'After' })).toBeFocused()

    await page.keyboard.press('Shift+Tab')

    await expect(tool(page, 'Italic')).toBeFocused()

    await page.keyboard.press('Shift+Tab')

    await expect(page.getByLabel('Before')).toBeFocused()
  })

  test('arrow keys move one item at a time past one that cannot take focus, stopping at the ends unless looping', async ({
    page,
  }) => {
    await check(page, 'Underline can take focus', false)
    await tabIn(page)

    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowRight')

    await expect(tool(page, 'Strike')).toBeFocused()

    await page.keyboard.press('End')
    await page.keyboard.press('ArrowRight')

    await expect(tool(page, 'Code')).toBeFocused()

    await page.keyboard.press('PageUp')

    await expect(tool(page, 'Bold')).toBeFocused()

    await page.keyboard.press('PageDown')

    await expect(tool(page, 'Code')).toBeFocused()

    await check(page, 'Loop')
    await tabIn(page)
    await page.keyboard.press('ArrowRight')

    await expect(tool(page, 'Bold')).toBeFocused()

    await page.keyboard.press('ArrowLeft')

    await expect(tool(page, 'Code')).toBeFocused()

    await page.keyboard.press('Home')

    await expect(tool(page, 'Bold')).toBeFocused()
  })

  test('a vertical group moves on the up and down arrows only', async ({ page }) => {
    await check(page, 'Vertical')
    await tabIn(page)

    await page.keyboard.press('ArrowRight')

    await expect(tool(page, 'Bold')).toBeFocused()

    await page.keyboard.press('ArrowDown')

    await expect(tool(page, 'Italic')).toBeFocused()
    expect(await x(tool(page, 'Italic'))).toBe(await x(tool(page, 'Bold')))

    await page.keyboard.press('ArrowUp')

    await expect(tool(page, 'Bold')).toBeFocused()
  })

  test('given its own right-to-left dir, it lays the items out the way it reads the arrow keys', async ({ page }) => {
    await check(page, 'Right-to-left')
    await tabIn(page)

    await page.keyboard.press('ArrowLeft')

    await expect(tool(page, 'Italic')).toBeFocused()
    expect(await x(tool(page, 'Italic'))).toBeLessThan(await x(tool(page, 'Bold')))

    await page.keyboard.press('ArrowRight')

    await expect(tool(page, 'Bold')).toBeFocused()
  })

  test('enters on the active item first, then on the item focus left', async ({ page }) => {
    await check(page, 'Italic is active')
    await tabIn(page)

    await expect(tool(page, 'Italic')).toBeFocused()

    await page.keyboard.press('ArrowRight')
    await check(page, 'Italic is active', false)
    await tabIn(page)

    await expect(tool(page, 'Underline')).toBeFocused()
  })

  test('a consumer preventing the entry focus keeps focus on the group', async ({ page }) => {
    await check(page, 'Prevent entry focus')
    await tabIn(page)

    await expect(toolbar(page)).toBeFocused()
  })

  test('after a click that moved no focus, Tab still enters on an item', async ({ page }) => {
    await tool(page, 'Italic').click()
    await tool(page, 'Italic').click()
    await page.getByLabel('Before').click()

    await page.keyboard.press('Tab')

    await expect(tool(page, 'Italic')).toBeFocused()
  })

  test('tells a function child whether its item is the tab stop and whether the group has one', async ({ page }) => {
    await expect(page.locator('[data-has-tab-stop]')).toHaveCount(0)

    await tabIn(page)
    await page.keyboard.press('ArrowRight')

    await expect(page.locator('[data-tab-stop]')).toHaveText(['Italic'])
    await expect(page.locator('[data-has-tab-stop]')).toHaveCount(5)
  })
})

test.describe('RovingFocusGroup in another root', () => {
  test.beforeEach(async ({ page }) => {
    await visitStory(page, 'rovingfocusgroup--hosts')
  })

  test('moves one item at a time inside an iframe', async ({ page }) => {
    const frame = page.frameLocator('iframe[title="Frame"]')
    await frame.getByRole('button', { name: 'One' }).focus()

    await page.keyboard.press('ArrowRight')

    await expect(frame.getByRole('button', { name: 'Two' })).toBeFocused()
  })

  test('moves one item at a time inside a shadow root', async ({ page }) => {
    await page.getByRole('button', { name: 'One' }).focus()

    await page.keyboard.press('ArrowRight')

    await expect(page.getByRole('button', { name: 'Two' })).toBeFocused()
  })
})
