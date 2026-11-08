import { expect, type Page, test } from '@playwright/test'
import { visitStory } from '../../__tests__/e2e-helpers'

const view = (page: Page) => page.getByRole('button', { name: 'View' })

// A modal menu turns the page's pointer events off, so a press there is a press at a point, not on an element.
async function pressOn(page: Page, name: string) {
  const box = await page.getByRole(name === 'Notes' ? 'textbox' : 'button', { name, includeHidden: true }).boundingBox()
  if (!box) throw new Error(`${name} has no box`)
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
}

test.describe('DropdownMenu opened from the keyboard', () => {
  test.beforeEach(async ({ page }) => {
    await visitStory(page, 'dropdownmenu--checkable-items')
  })

  for (const key of ['Enter', ' ', 'ArrowDown']) {
    test(`opens on ${key === ' ' ? 'Space' : key} with the first item focused`, async ({ page }) => {
      await view(page).focus()
      await page.keyboard.press(key)

      await expect(page.getByRole('menu')).toBeVisible()
      await expect(page.getByRole('menuitemcheckbox', { name: 'Ruler' })).toBeFocused()
    })
  }

  test('skips a disabled item, and gives focus back to the trigger on Escape', async ({ page }) => {
    await view(page).focus()
    await page.keyboard.press('Enter')
    await page.keyboard.press('End')

    await expect(page.getByRole('menuitemradio', { name: 'Actual size' })).toBeFocused()

    await page.keyboard.press('Escape')

    await expect(page.getByRole('menu')).toHaveCount(0)
    await expect(view(page)).toBeFocused()
  })
})

test.describe('DropdownMenu checkable items', () => {
  test.beforeEach(async ({ page }) => {
    await visitStory(page, 'dropdownmenu--checkable-items')
    await view(page).click()
  })

  test('toggles a checkbox item and closes, or stays open when closeOnSelect is off', async ({ page }) => {
    await page.getByRole('menuitemcheckbox', { name: 'Ruler' }).click()

    await expect(page.getByRole('menu')).toHaveCount(0)
    await expect(page.getByLabel('Settings')).toHaveText('ruler off, grid off, zoom fit')

    await view(page).click()
    await page.getByRole('menuitemcheckbox', { name: 'Grid' }).click()

    await expect(page.getByRole('menu')).toBeVisible()
    await expect(page.getByRole('menuitemcheckbox', { name: 'Grid' })).toHaveAttribute('aria-checked', 'true')
    await expect(page.getByLabel('Settings')).toHaveText('ruler off, grid on, zoom fit')
  })

  test('checks only the chosen radio item', async ({ page }) => {
    await page.getByRole('menuitemradio', { name: 'Actual size' }).click()
    await view(page).click()

    await expect(page.getByRole('menuitemradio', { name: 'Actual size' })).toHaveAttribute('aria-checked', 'true')
    await expect(page.getByRole('menuitemradio', { name: 'Fit' })).toHaveAttribute('aria-checked', 'false')
  })

  test('ignores a click on a disabled item', async ({ page }) => {
    await page.getByRole('menuitem', { name: 'Paste' }).click({ force: true })

    await expect(page.getByRole('menu')).toBeVisible()
  })
})

test.describe('DropdownMenu modal and disabled', () => {
  test.beforeEach(async ({ page }) => {
    await visitStory(page, 'dropdownmenu--modal-and-disabled')
  })

  test('keeps a click outside a modal menu from reaching the page, and closes', async ({ page }) => {
    await page.getByRole('button', { name: 'Open' }).click()
    await pressOn(page, 'Count')

    await expect(page.getByRole('menu')).toHaveCount(0)
    await expect(page.getByLabel('Clicks')).toHaveText('0')
  })

  test('lets a click outside a non-modal menu reach the page, and closes', async ({ page }) => {
    await page.getByRole('checkbox', { name: 'Modal' }).uncheck()
    await page.getByRole('button', { name: 'Open' }).click()
    await pressOn(page, 'Count')

    await expect(page.getByRole('menu')).toHaveCount(0)
    await expect(page.getByLabel('Clicks')).toHaveText('1')
  })

  test('gives focus back to the trigger after a press outside a modal menu', async ({ page }) => {
    await page.getByRole('button', { name: 'Open' }).click()
    await pressOn(page, 'Notes')

    await expect(page.getByRole('menu')).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Open' })).toBeFocused()
  })

  test('leaves focus where a press outside a non-modal menu put it', async ({ page }) => {
    await page.getByRole('checkbox', { name: 'Modal' }).uncheck()
    await page.getByRole('button', { name: 'Open' }).click()
    await pressOn(page, 'Notes')

    await expect(page.getByRole('menu')).toHaveCount(0)
    await expect(page.getByRole('textbox', { name: 'Notes' })).toBeFocused()
  })

  for (const modal of [true, false]) {
    test(`${modal ? 'keeps the page from scrolling under a modal menu' : 'lets the page scroll under a non-modal menu'}`, async ({
      page,
    }) => {
      if (!modal) await page.getByRole('checkbox', { name: 'Modal' }).uncheck()
      await page.getByRole('button', { name: 'Open' }).click()
      await page.evaluate(() => {
        window.addEventListener('wheel', (event) => {
          document.body.dataset.wheel = String(event.defaultPrevented)
        })
      })
      await page.mouse.move(400, 300)
      await page.mouse.wheel(0, 400)

      await expect(page.locator('body')).toHaveAttribute('data-wheel', String(modal))
      if (!modal) await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0)
    })
  }

  test('opens a non-modal menu on ArrowDown without scrolling the page', async ({ page }) => {
    await page.getByRole('checkbox', { name: 'Modal' }).uncheck()
    await page.getByRole('button', { name: 'Open' }).focus()
    await page.keyboard.press('ArrowDown')

    await expect(page.getByRole('menuitem', { name: 'New Tab' })).toBeFocused()
    expect(await page.evaluate(() => window.scrollY)).toBe(0)
  })

  test('takes focus into a non-modal menu the pointer opened, so ArrowDown reaches its items', async ({ page }) => {
    await page.getByRole('checkbox', { name: 'Modal' }).uncheck()
    await page.getByRole('button', { name: 'Open' }).click()
    await page.keyboard.press('ArrowDown')

    await expect(page.getByRole('menuitem', { name: 'New Tab' })).toBeFocused()
  })

  test('closes a non-modal menu on a second press of its trigger', async ({ page }) => {
    await page.getByRole('checkbox', { name: 'Modal' }).uncheck()
    const trigger = page.getByRole('button', { name: 'Open' })
    await trigger.click()
    await trigger.click()

    await expect(page.getByRole('menu')).toHaveCount(0)
  })

  test('closes a modal menu on a press where its trigger is, and focuses the trigger', async ({ page }) => {
    await page.getByRole('button', { name: 'Open' }).click()
    await pressOn(page, 'Open')

    await expect(page.getByRole('menu')).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Open' })).toBeFocused()
  })

  test('opens nothing on a right press or a control press of its trigger', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Open' })
    await trigger.click({ button: 'right' })
    await trigger.click({ modifiers: ['Control'] })

    await expect(page.getByRole('menu')).toHaveCount(0)
  })

  test('opens no menu from a disabled trigger', async ({ page }) => {
    await page.getByRole('checkbox', { name: 'Disabled' }).check()
    const trigger = page.getByRole('button', { name: 'Open' })

    await expect(trigger).toBeDisabled()
    await trigger.click({ force: true })
    await trigger.focus()
    await page.keyboard.press('Enter')

    await expect(page.getByRole('menu')).toHaveCount(0)
  })
})

test.describe('DropdownMenu item that opens a dialog', () => {
  test.beforeEach(async ({ page }) => {
    await visitStory(page, 'dropdownmenu--opens-dialog')
  })

  test('moves focus into the dialog, and back to the menu trigger once it closes', async ({ page }) => {
    await page.getByRole('button', { name: 'Actions' }).click()
    await page.getByRole('menuitem', { name: 'Delete' }).click()

    await expect(page.getByRole('menu')).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeFocused()

    await page.keyboard.press('Escape')

    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Actions' })).toBeFocused()
  })

  test('opens the dialog from the keyboard, and acts on its own button', async ({ page }) => {
    await page.getByRole('button', { name: 'Actions' }).focus()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('menuitem', { name: 'Rename' })).toBeFocused()
    await page.keyboard.press('ArrowDown')
    await expect(page.getByRole('menuitem', { name: 'Delete' })).toBeFocused()
    await page.keyboard.press('Enter')
    await page.getByRole('button', { name: 'Delete for good' }).click()

    await expect(page.getByLabel('File')).toHaveText('deleted')
    await expect(page.getByRole('button', { name: 'Actions' })).toBeFocused()
  })
})

test.describe('DropdownMenu link items', () => {
  test.beforeEach(async ({ page }) => {
    await visitStory(page, 'dropdownmenu--links')
  })

  test('follows a link on a click, and closes', async ({ page }) => {
    await page.getByRole('button', { name: 'Account' }).click()
    await page.getByRole('menuitem', { name: 'Profile' }).click()

    await expect(page.getByLabel('Location')).toHaveText('#profile')
    await expect(page.getByRole('menu')).toHaveCount(0)
  })

  test('follows a link on Enter, and closes', async ({ page }) => {
    await page.getByRole('button', { name: 'Account' }).focus()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('menuitem', { name: 'Profile' })).toBeFocused()
    await page.keyboard.press('ArrowDown')
    await expect(page.getByRole('menuitem', { name: 'Billing' })).toBeFocused()
    await page.keyboard.press('Enter')

    await expect(page.getByLabel('Location')).toHaveText('#billing')
    await expect(page.getByRole('menu')).toHaveCount(0)
  })

  test('follows no disabled link', async ({ page }) => {
    await page.getByRole('button', { name: 'Account' }).click()
    await page.getByRole('menuitem', { name: 'Team' }).click({ force: true })

    // The hash changes in the click itself, where the event that would show it comes a task later.
    expect(await page.evaluate(() => window.location.hash)).toBe('')
    await expect(page.getByRole('menu')).toBeVisible()
  })
})

test.describe('DropdownMenu with more items than fit', () => {
  test.use({ viewport: { width: 800, height: 400 } })

  test.beforeEach(async ({ page }) => {
    await visitStory(page, 'dropdownmenu--long-list')
    await page.getByRole('button', { name: 'Country' }).focus()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('menuitem', { name: 'Argentina' })).toBeFocused()
  })

  test('fits the space below its trigger, and scrolls to the item the keyboard reaches', async ({ page }) => {
    const box = await page.getByRole('menu').boundingBox()

    expect(box && box.y + box.height).toBeLessThanOrEqual(400)

    await page.keyboard.press('End')

    await expect(page.getByRole('menuitem', { name: 'Vietnam' })).toBeFocused()
    await expect(page.getByRole('menuitem', { name: 'Vietnam' })).toBeInViewport()

    await page.keyboard.press('Home')

    await expect(page.getByRole('menuitem', { name: 'Argentina' })).toBeInViewport()
  })

  test('scrolls to the item a typed name finds', async ({ page }) => {
    await page.keyboard.type('sw')

    await expect(page.getByRole('menuitem', { name: 'Sweden' })).toBeFocused()
    await expect(page.getByRole('menuitem', { name: 'Sweden' })).toBeInViewport()
  })
})

test.describe('DropdownMenu placement', () => {
  test.beforeEach(async ({ page }) => {
    await visitStory(page, 'dropdownmenu--placement')
  })

  const open = async (page: Page, side: string, align: string) => {
    await page.getByRole('radio', { name: side }).check()
    await page.getByRole('radio', { name: align }).check()
    const trigger = await page.getByRole('button', { name: 'Open' }).boundingBox()
    await page.getByRole('button', { name: 'Open' }).click()
    const menu = await page.getByRole('menu').boundingBox()
    if (!trigger || !menu) throw new Error('no box')
    return { trigger, menu }
  }

  test("takes its trigger's width", async ({ page }) => {
    const { trigger, menu } = await open(page, 'bottom', 'start')

    expect(menu.width).toBeCloseTo(trigger.width, 0)
    expect(menu.x).toBeCloseTo(trigger.x, 0)
    expect(menu.y).toBeGreaterThan(trigger.y + trigger.height)
  })

  test('opens above its trigger, its end edge on the end of the trigger', async ({ page }) => {
    const { trigger, menu } = await open(page, 'top', 'end')

    await expect(page.getByRole('menu')).toHaveAttribute('data-side', 'top')
    await expect(page.getByRole('menu')).toHaveAttribute('data-align', 'end')
    expect(menu.y + menu.height).toBeLessThan(trigger.y)
    expect(menu.x + menu.width).toBeCloseTo(trigger.x + trigger.width, 0)
  })

  test('opens to the right of its trigger, centred on it', async ({ page }) => {
    const { trigger, menu } = await open(page, 'right', 'center')

    expect(menu.x).toBeGreaterThan(trigger.x + trigger.width)
    expect(menu.y + menu.height / 2).toBeCloseTo(trigger.y + trigger.height / 2, 0)
  })
})

test.describe('DropdownMenu trigger inside a tooltip trigger', () => {
  test.beforeEach(async ({ page }) => {
    await visitStory(page, 'dropdownmenu--with-tooltip')
  })

  const trigger = (page: Page) => page.getByRole('button', { name: 'More actions' })

  test('opens the menu and hides the tooltip the hover opened', async ({ page }) => {
    await trigger(page).hover()

    await expect(page.getByRole('tooltip')).toHaveText('More actions')

    await trigger(page).click()

    await expect(page.getByRole('menu')).toBeVisible()
    await expect(page.getByRole('tooltip')).toHaveCount(0)
  })

  test('shows the tooltip when Escape gives focus back to the trigger', async ({ page }) => {
    await trigger(page).focus()
    await page.keyboard.press('Enter')

    await expect(page.getByRole('menu')).toBeVisible()
    await expect(page.getByRole('tooltip')).toHaveCount(0)

    await page.keyboard.press('Escape')

    await expect(trigger(page)).toBeFocused()
    await expect(page.getByRole('tooltip')).toHaveText('More actions')
  })

  test('shows no tooltip when an item chosen with the pointer gives focus back to the trigger', async ({ page }) => {
    await trigger(page).click()
    await page.getByRole('menuitem', { name: 'Archive' }).click()

    await expect(trigger(page)).toBeFocused()
    await expect(page.getByRole('tooltip')).toHaveCount(0)
  })
})

test.describe('DropdownMenu with an exit animation', () => {
  test.beforeEach(async ({ page }) => {
    await visitStory(page, 'dropdownmenu--animated')
  })

  test('stays until its animation ends, then gives focus back to the trigger', async ({ page }) => {
    await page.getByRole('button', { name: 'Open' }).click()
    await expect(page.getByRole('menu')).toHaveCSS('animation-name', /animateIn/)
    await page.keyboard.press('Escape')

    await expect(page.getByRole('menu')).toHaveAttribute('data-state', 'closed')
    await expect(page.getByRole('menu')).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Open' })).toBeFocused()
  })
})
