import { expect, type Page, test } from '@playwright/test'
import { visitStory } from '../../__tests__/e2e-helpers'

const item = (page: Page, name: string) => page.getByRole('menuitem', { name })
const output = (page: Page, name: string) => page.getByLabel(name, { exact: true })
const openFromKeyboard = async (page: Page) => {
  await page.getByRole('button', { name: 'Open' }).focus()
  await page.keyboard.press('Enter')
  await expect(item(page, 'New tab')).toBeFocused()
}
const pressPageButton = async (page: Page) => {
  const box = await page.getByRole('button', { includeHidden: true, name: 'Page button' }).boundingBox()
  if (!box) throw new Error('Page button has no box')
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
}

test.describe('Menu', () => {
  test.beforeEach(async ({ page }) => {
    await visitStory(page, 'menu--basic')
  })

  test('opened from the keyboard, walks its items past the disabled one', async ({ page }) => {
    await openFromKeyboard(page)
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowDown')

    await expect(item(page, 'Zoom in')).toBeFocused()

    await page.keyboard.press('End')

    await expect(item(page, 'History')).toBeFocused()
  })

  test('moves to the item a typed letter starts, read from its textValue', async ({ page }) => {
    await openFromKeyboard(page)
    await page.keyboard.type('h')

    await expect(item(page, 'History')).toBeFocused()
  })

  test('takes a letter the focused item starts to the next item it starts', async ({ page }) => {
    await openFromKeyboard(page)
    await page.keyboard.type('n')

    await expect(item(page, 'New window')).toBeFocused()
  })

  test('selects an item with Enter and closes, and returns focus to the trigger', async ({ page }) => {
    await openFromKeyboard(page)
    await page.keyboard.press('ArrowDown')
    await expect(item(page, 'New window')).toBeFocused()
    await page.keyboard.press('Enter')

    await expect(output(page, 'Selected')).toHaveText('new window')
    await expect(output(page, 'State')).toHaveText('closed')
    await expect(page.getByRole('button', { name: 'Open' })).toBeFocused()
  })

  test('stays open for an item that asks to, by prop or by preventing its select', async ({ page }) => {
    await page.getByRole('button', { name: 'Open' }).click()
    await item(page, 'Zoom in').click()
    await item(page, 'Stays open').click()

    await expect(output(page, 'Selected')).toHaveText('zoom in')
    await expect(page.getByRole('menu')).toBeVisible()
  })

  test('never selects a disabled item', async ({ page }) => {
    await page.getByRole('button', { name: 'Open' }).click()
    await item(page, 'Print').click({ force: true })

    await expect(output(page, 'Selected')).toHaveText('')
    await expect(page.getByRole('menu')).toBeVisible()
  })

  test('closes on Escape', async ({ page }) => {
    await openFromKeyboard(page)
    await page.keyboard.press('Escape')

    await expect(page.getByRole('menu')).toHaveCount(0)
    await expect(output(page, 'State')).toHaveText('closed')
  })

  test('wraps from the last item to the first only with loop', async ({ page }) => {
    await openFromKeyboard(page)
    await page.keyboard.press('End')
    await page.keyboard.press('ArrowDown')

    await expect(item(page, 'History')).toBeFocused()

    await page.keyboard.press('Escape')
    await page.getByRole('checkbox', { name: 'Loop' }).check()
    await openFromKeyboard(page)
    await page.keyboard.press('End')
    await page.keyboard.press('ArrowDown')

    await expect(item(page, 'New tab')).toBeFocused()
  })

  test('closes on a press outside, which a modal menu keeps from the page', async ({ page }) => {
    await page.getByRole('button', { name: 'Open' }).click()
    await pressPageButton(page)

    await expect(page.getByRole('menu')).toHaveCount(0)
    await expect(output(page, 'Selected')).toHaveText('')

    await page.getByRole('checkbox', { name: 'Modal' }).uncheck()
    await page.getByRole('button', { name: 'Open' }).click()
    await pressPageButton(page)

    await expect(page.getByRole('menu')).toHaveCount(0)
    await expect(output(page, 'Selected')).toHaveText('page')
  })

  test('closes on a second press of the trigger', async ({ page }) => {
    await page.getByRole('checkbox', { name: 'Modal' }).uncheck()
    await page.getByRole('button', { name: 'Open' }).click()

    await expect(page.getByRole('menu')).toBeVisible()

    await page.getByRole('button', { name: 'Open' }).click()

    await expect(page.getByRole('menu')).toHaveCount(0)
  })
})

test.describe('Menu checkable items', () => {
  test.beforeEach(async ({ page }) => {
    await visitStory(page, 'menu--checkable-items')
    await page.getByRole('button', { name: 'Open' }).click()
  })

  test('toggles a checkbox item and keeps the parent mixed until every one is on', async ({ page }) => {
    const all = page.getByRole('menuitemcheckbox', { name: 'All formats' })

    await expect(all).toHaveAttribute('aria-checked', 'mixed')
    await expect(page.getByRole('menuitemcheckbox', { name: 'Bold' })).toHaveAttribute('aria-checked', 'true')

    await page.getByRole('menuitemcheckbox', { name: 'Italic' }).click()

    await expect(all).toHaveAttribute('aria-checked', 'true')
    await expect(output(page, 'Formats')).toHaveText('bold, italic')
  })

  test('turns a mixed checkbox item on, not off', async ({ page }) => {
    await page.getByRole('menuitemcheckbox', { name: 'All formats' }).click()

    await expect(output(page, 'Formats')).toHaveText('bold, italic')
    await expect(page.getByRole('menu')).toHaveCount(0)
  })

  test('checks one radio item in its group', async ({ page }) => {
    await page.getByRole('menuitemradio', { name: 'center' }).click()

    await expect(output(page, 'Align')).toHaveText('center')

    await page.getByRole('button', { name: 'Open' }).click()

    await expect(page.getByRole('menuitemradio', { name: 'center' })).toHaveAttribute('aria-checked', 'true')
    await expect(page.getByRole('menuitemradio', { name: 'start' })).toHaveAttribute('aria-checked', 'false')
  })
})

test.describe('Menu submenus', () => {
  test.beforeEach(async ({ page }) => {
    await visitStory(page, 'menu--submenus')
  })

  for (const [dir, open, close] of [
    ['ltr', 'ArrowRight', 'ArrowLeft'],
    ['rtl', 'ArrowLeft', 'ArrowRight'],
  ] as const) {
    test(`opens a submenu with ${open} and closes it with ${close} in ${dir}`, async ({ page }) => {
      if (dir === 'rtl') await page.getByRole('checkbox', { name: 'Right-to-left' }).check()
      await openFromKeyboard(page)
      await page.keyboard.press('ArrowDown')
      await expect(item(page, 'Bookmarks')).toBeFocused()
      await page.keyboard.press(open)

      await expect(item(page, 'Inbox')).toBeFocused()

      await page.keyboard.press(close)

      await expect(item(page, 'Inbox')).toHaveCount(0)
      await expect(item(page, 'Bookmarks')).toBeFocused()
    })
  }

  test('opens nested submenus on hover and selects from the deepest', async ({ page }) => {
    await page.getByRole('button', { name: 'Open' }).click()
    await item(page, 'Bookmarks').hover()
    await item(page, 'Work').hover()
    await item(page, 'Notes').click()

    await expect(output(page, 'Selected')).toHaveText('notes')
    await expect(page.getByRole('menu')).toHaveCount(0)
  })

  test('never opens a disabled submenu', async ({ page }) => {
    await page.getByRole('button', { name: 'Open' }).click()
    await item(page, 'History').click({ force: true })

    await expect(item(page, 'History')).toHaveAttribute('aria-expanded', 'false')
    await expect(item(page, 'Yesterday')).toHaveCount(0)
  })

  test('closes every menu on Escape, or only the submenu when it says so', async ({ page }) => {
    await openFromKeyboard(page)
    await page.keyboard.press('ArrowDown')
    await expect(item(page, 'Bookmarks')).toBeFocused()
    await page.keyboard.press('ArrowRight')
    await expect(item(page, 'Inbox')).toBeFocused()
    await page.keyboard.press('Escape')

    await expect(page.getByRole('menu')).toHaveCount(0)
    await expect(output(page, 'State')).toHaveText('closed')

    await page.getByRole('checkbox', { name: 'Escape closes only the submenu' }).check()
    await openFromKeyboard(page)
    await page.keyboard.press('ArrowDown')
    await expect(item(page, 'Bookmarks')).toBeFocused()
    await page.keyboard.press('ArrowRight')
    await expect(item(page, 'Inbox')).toBeFocused()
    await page.keyboard.press('Escape')

    await expect(item(page, 'Inbox')).toHaveCount(0)
    await expect(item(page, 'Bookmarks')).toBeFocused()
    await expect(output(page, 'State')).toHaveText('open')
  })
})
