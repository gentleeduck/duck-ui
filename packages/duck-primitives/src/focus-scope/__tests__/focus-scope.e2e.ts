import { expect, type FrameLocator, type Locator, type Page, test } from '@playwright/test'
import { visitStory } from '../../__tests__/e2e-helpers'

type Root = Page | FrameLocator

const button = (root: Root, name: string) => root.getByRole('button', { exact: true, name })
const output = (page: Page, name: string) => page.getByRole('status', { exact: true, name })
const nameField = (root: Root) => root.getByRole('textbox', { name: 'Name' })
const selection = (field: Locator) =>
  field.evaluate((input: HTMLInputElement) => [input.selectionStart, input.selectionEnd])

async function press(root: Root, page: Page, name: string) {
  await button(root, name).focus()
  await page.keyboard.press('Enter')
}

test.describe('FocusScope', () => {
  test.beforeEach(async ({ page }) => {
    await visitStory(page, 'focusscope--basic')
  })

  test('focuses its first element that is not a link on mount, with its text selected, and gives focus back on unmount', async ({
    page,
  }) => {
    await press(page, page, 'Open')

    await expect(nameField(page)).toBeFocused()
    expect(await selection(nameField(page))).toEqual([0, 12])

    await press(page, page, 'Close')

    await expect(button(page, 'Open')).toBeFocused()
    await expect(output(page, 'Events')).toHaveText('onMountAutoFocus, onUnmountAutoFocus')
  })

  test('leaves focus alone on mount and on unmount when their handlers prevent it', async ({ page }) => {
    await page.getByRole('checkbox', { name: 'Prevent focus on mount' }).check()
    await page.getByRole('checkbox', { name: 'Prevent focus on unmount' }).check()
    await press(page, page, 'Open')

    await expect(button(page, 'Open')).toBeFocused()

    await press(page, page, 'Close')

    await expect(output(page, 'Events')).toHaveText('onMountAutoFocus, onUnmountAutoFocus')
    expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true)
  })

  test('loops Tab from its last element to its first, and Shift+Tab from its first to its last', async ({ page }) => {
    await press(page, page, 'Open')
    await button(page, 'Close').focus()
    await page.keyboard.press('Tab')

    await expect(page.getByRole('link', { name: 'Help' })).toBeFocused()

    await page.keyboard.press('Shift+Tab')

    await expect(button(page, 'Close')).toBeFocused()
  })

  test('hands each key to its own onKeyDown', async ({ page }) => {
    await press(page, page, 'Open')
    await page.keyboard.press('Tab')

    await expect(output(page, 'Last key')).toHaveText('Tab')
  })

  test('holds Tab on its last element and Shift+Tab on its first when trapped without looping', async ({ page }) => {
    await page.getByRole('checkbox', { name: 'Loop' }).uncheck()
    await press(page, page, 'Open')
    await button(page, 'Close').focus()
    await page.keyboard.press('Tab')

    await expect(button(page, 'Close')).toBeFocused()

    await page.getByRole('link', { name: 'Help' }).focus()
    await page.keyboard.press('Shift+Tab')

    await expect(page.getByRole('link', { name: 'Help' })).toBeFocused()
  })

  test('lets Tab leave its last element when it neither traps nor loops', async ({ page }) => {
    await page.getByRole('checkbox', { name: 'Trapped' }).uncheck()
    await page.getByRole('checkbox', { name: 'Loop' }).uncheck()
    await press(page, page, 'Open')
    await button(page, 'Close').focus()
    await page.keyboard.press('Tab')

    await expect(button(page, 'Outside')).toBeFocused()
  })

  test('takes focus back from outside while trapped, and lets it go once it is not', async ({ page }) => {
    await press(page, page, 'Open')
    await button(page, 'Save').focus()
    await button(page, 'Outside').focus()

    await expect(button(page, 'Save')).toBeFocused()

    await page.getByRole('checkbox', { name: 'Trapped' }).uncheck()
    await button(page, 'Outside').focus()

    await expect(button(page, 'Outside')).toBeFocused()
  })

  test('takes focus back from an element outside that keeps its focus events from the page', async ({ page }) => {
    await press(page, page, 'Open')
    await button(page, 'Save').focus()
    await button(page, 'Widget keeping its focus events').focus()

    await expect(button(page, 'Save')).toBeFocused()
  })
})

test.describe('FocusScope trapped when the focused element goes', () => {
  test('takes focus to its own element', async ({ page }) => {
    await visitStory(page, 'focusscope--removal')
    await press(page, page, 'Remove me')

    await expect(page.getByRole('group', { name: 'Scope' })).toBeFocused()
  })
})

test.describe('FocusScope skipping what is not a stop', () => {
  test('loops past hidden, invisible, inert and disabled elements and those out of the tab order', async ({ page }) => {
    await visitStory(page, 'focusscope--skipped')
    await button(page, 'Last').focus()
    await page.keyboard.press('Tab')

    await expect(button(page, 'First')).toBeFocused()

    await page.keyboard.press('Shift+Tab')

    await expect(button(page, 'Last')).toBeFocused()
  })

  test('reads a focusable svg at its end as its last stop', async ({ page }) => {
    await visitStory(page, 'focusscope--svg')
    await page.getByRole('img', { name: 'Icon' }).focus()
    await page.keyboard.press('Tab')

    await expect(button(page, 'Before the icon')).toBeFocused()

    await page.keyboard.press('Shift+Tab')

    await expect(page.getByRole('img', { name: 'Icon' })).toBeFocused()
  })
})

test.describe('FocusScope looping past native radios', () => {
  test.beforeEach(async ({ page }) => {
    await visitStory(page, 'focusscope--radios')
  })

  test('loops from any radio of the group that ends it onto the checked radio of the group that starts it', async ({
    page,
  }) => {
    await page.getByRole('radio', { name: 'M' }).check()
    await page.getByRole('radio', { name: 'Red' }).focus()
    await page.keyboard.press('Tab')

    await expect(page.getByRole('radio', { name: 'M' })).toBeFocused()
  })

  test('loops back from any radio of the group that starts it onto the checked radio of the group that ends it', async ({
    page,
  }) => {
    await page.getByRole('radio', { name: 'Green' }).check()
    await page.getByRole('radio', { name: 'S' }).focus()
    await page.keyboard.press('Shift+Tab')

    await expect(page.getByRole('radio', { name: 'Green' })).toBeFocused()
  })
})

test.describe('FocusScope nested', () => {
  test.beforeEach(async ({ page }) => {
    await visitStory(page, 'focusscope--nested')
  })

  test('leaves the outer scope alone while the inner one is open, and traps again once it closes', async ({ page }) => {
    await press(page, page, 'Open inner')

    await expect(button(page, 'Inner button')).toBeFocused()

    await button(page, 'Outer button').focus()

    await expect(button(page, 'Inner button')).toBeFocused()

    await press(page, page, 'Close inner')

    await expect(button(page, 'Open inner')).toBeFocused()

    await button(page, 'Outside').focus()

    await expect(button(page, 'Open inner')).toBeFocused()
  })

  test('lets Tab move focus inside the inner scope while the outer one is paused', async ({ page }) => {
    await press(page, page, 'Open inner')
    await page.keyboard.press('Tab')

    await expect(page.getByRole('checkbox', { name: 'Replace this element' })).toBeFocused()
  })

  test('keeps the outer scope paused once the inner one renders another element', async ({ page }) => {
    await press(page, page, 'Open inner')
    await page.getByRole('checkbox', { name: 'Replace this element' }).check()

    await expect(page.getByRole('region', { name: 'Inner' })).toBeVisible()

    await button(page, 'Outer button').focus()

    await expect(button(page, 'Inner button')).toBeFocused()

    await button(page, 'Close inner').focus()
    await page.keyboard.press('Tab')

    await expect(button(page, 'Inner button')).toBeFocused()
  })
})

test.describe('FocusScope with branches', () => {
  test('lets focus into a registered branch, and takes it back from a portal that is not one', async ({ page }) => {
    await visitStory(page, 'focusscope--branches')

    await expect(button(page, 'Inside')).toBeFocused()

    await button(page, 'Branch button').focus()

    await expect(button(page, 'Branch button')).toBeFocused()

    await button(page, 'Stray button').focus()

    await expect(button(page, 'Branch button')).toBeFocused()

    await button(page, 'Outside').focus()

    await expect(button(page, 'Branch button')).toBeFocused()
  })
})

test.describe('FocusScope holding a shadow root', () => {
  test('gives focus back to the field inside it, not to its host', async ({ page }) => {
    await visitStory(page, 'focusscope--shadow-content')
    await page.getByRole('textbox', { name: 'Shadow field' }).focus()
    await button(page, 'Outside').focus()

    await expect(page.getByRole('textbox', { name: 'Shadow field' })).toBeFocused()
  })
})

for (const [where, story, rootOf] of [
  ['in an iframe', 'focusscope--in-iframe', (page: Page) => page.frameLocator('iframe[title="Frame"]')],
  ['in a shadow root', 'focusscope--in-shadow-root', (page: Page) => page],
] as const) {
  test.describe(`FocusScope ${where}`, () => {
    test.beforeEach(async ({ page }) => {
      await visitStory(page, story)
    })

    test('focuses its first element on mount and gives focus back on unmount', async ({ page }) => {
      const root = rootOf(page)
      await press(root, page, 'Open')

      await expect(nameField(root)).toBeFocused()
      expect(await selection(nameField(root))).toEqual([0, 12])

      await press(root, page, 'Close')

      await expect(button(root, 'Open')).toBeFocused()
    })

    test('loops Tab and Shift+Tab at its edges', async ({ page }) => {
      const root = rootOf(page)
      await press(root, page, 'Open')
      await button(root, 'Close').focus()
      await page.keyboard.press('Tab')

      await expect(nameField(root)).toBeFocused()

      await page.keyboard.press('Shift+Tab')

      await expect(button(root, 'Close')).toBeFocused()
    })

    test('takes focus back from outside', async ({ page }) => {
      const root = rootOf(page)
      await press(root, page, 'Open')
      await button(root, 'Save').focus()
      await button(root, 'Outside').focus()

      await expect(button(root, 'Save')).toBeFocused()
    })
  })
}
