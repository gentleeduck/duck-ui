import { expect, type Page, test } from '@playwright/test'
import { visitStory } from '../../__tests__/e2e-helpers'

// While the list is open, everything outside it is hidden from assistive technology, the trigger included.
const trigger = (page: Page) => page.locator('#food')
const value = (page: Page) => trigger(page).locator('span').first()
const listbox = (page: Page) => page.getByRole('listbox')
const option = (page: Page, name: string) => page.getByRole('option', { name, exact: true })
const output = (page: Page, name: string) => page.getByRole('status', { name })

async function visit(page: Page, ...toggles: string[]) {
  await visitStory(page, 'select--basic')
  for (const toggle of toggles) await page.getByRole('checkbox', { name: toggle, exact: true }).check()
}

test.describe('Select', () => {
  test('a required select left empty refuses to submit, and shows its placeholder', async ({ page }) => {
    await visit(page)

    await page.getByRole('button', { name: 'Submit' }).click()

    await expect(page.getByRole('combobox', { name: 'Food' })).toBeVisible()
    await expect(value(page)).toHaveText('Pick a food')
    await expect(trigger(page)).toHaveAttribute('data-placeholder', '')
    await expect(output(page, 'Submitted')).toHaveText('')
  })

  test('the keyboard opens it, steps past a disabled item, and Escape closes it back to the trigger', async ({
    page,
  }) => {
    await visit(page)

    await trigger(page).focus()
    await page.keyboard.press('Enter')
    await expect(listbox(page)).toBeVisible()
    await page.keyboard.type('bro')
    await expect(option(page, 'Broccoli')).toBeFocused()
    await page.keyboard.press('ArrowDown')

    await expect(option(page, 'Carrot')).toHaveAttribute('aria-disabled', 'true')
    await expect(option(page, 'Courgette')).toBeFocused()

    await page.keyboard.press('End')
    await expect(option(page, 'Chocolates')).toBeFocused()
    await page.keyboard.press('Escape')

    await expect(listbox(page)).toHaveCount(0)
    await expect(trigger(page)).toBeFocused()
    await expect(output(page, 'Value')).toHaveText('none')
  })

  for (const toggles of [[], ['Items']]) {
    const named = toggles.length ? ' given items' : ''

    test(`a click opens labelled groups, and a pick closes it and fills the form until a reset${named}`, async ({
      page,
    }) => {
      await visit(page, ...toggles)

      await trigger(page).click()

      await expect(trigger(page)).toHaveAttribute('aria-expanded', 'true')
      await expect(page.getByRole('group', { name: 'Fruits' }).getByRole('option')).toHaveCount(5)
      await expect(page.getByRole('group', { name: 'Vegetables' })).toContainText('Leek')

      await option(page, 'Grapes').click()
      await page.getByRole('button', { name: 'Submit' }).click()

      await expect(output(page, 'State')).toHaveText('closed')
      await expect(value(page)).toHaveText('Grapes')
      await expect(output(page, 'Submitted')).toHaveText('grapes')

      await page.getByRole('button', { name: 'Reset' }).click()

      await expect(output(page, 'Value')).toHaveText('none')
      await expect(value(page)).toHaveText('Pick a food')
    })

    test(`typing on the closed trigger picks the first match without opening it${named}`, async ({ page }) => {
      await visit(page, ...toggles)

      await trigger(page).focus()
      await page.keyboard.type('l')

      await expect(output(page, 'Value')).toHaveText('leek')
      await expect(value(page)).toHaveText('Leek')
      await expect(output(page, 'State')).toHaveText('closed')
    })

    test(`a value set from outside shows on the trigger, and the list opens on that item${named}`, async ({ page }) => {
      await visit(page, ...toggles)

      await page.getByRole('button', { name: 'Pick Grapes' }).click()
      await expect(value(page)).toHaveText('Grapes')
      await trigger(page).click()

      await expect(value(page)).toHaveText('Grapes')
      await expect(option(page, 'Grapes')).toHaveAttribute('aria-selected', 'true')
      await expect(option(page, 'Grapes')).toBeFocused()
    })
  }

  test('a pick shows once on the trigger and once in the form, while the list fades out and after', async ({
    page,
  }) => {
    await visit(page, 'Animated')
    const shown = () => [value(page).textContent(), page.locator('select option[value="grapes"]').count()]

    await trigger(page).click()
    await option(page, 'Grapes').click()
    const fading = await listbox(page).evaluate((list) => {
      for (const animation of list.getAnimations()) animation.pause()
      return list.dataset.state
    })

    expect([fading, ...(await Promise.all(shown()))]).toEqual(['closed', 'Grapes', 1])
    await listbox(page).evaluate((list) => {
      for (const animation of list.getAnimations()) animation.finish()
    })
    await expect(listbox(page)).toHaveCount(0)
    expect(await Promise.all(shown())).toEqual(['Grapes', 1])
  })

  test('a select in a disabled fieldset opens on neither a click nor a key, as a native select does', async ({
    page,
  }) => {
    await visit(page, 'Disabled fieldset')

    await expect(trigger(page)).toBeDisabled()

    await trigger(page).click({ force: true })
    await trigger(page).dispatchEvent('keydown', { key: 'Enter' })

    await expect(output(page, 'State')).toHaveText('closed')
  })

  test('a disabled select does not open', async ({ page }) => {
    await visit(page, 'Disabled')

    await expect(trigger(page)).toBeDisabled()

    await trigger(page).click({ force: true })

    await expect(output(page, 'State')).toHaveText('closed')
  })

  test('right-to-left reaches the trigger and the list', async ({ page }) => {
    await visit(page, 'Right-to-left')

    await trigger(page).click()

    await expect(trigger(page)).toHaveAttribute('dir', 'rtl')
    await expect(listbox(page)).toHaveAttribute('dir', 'rtl')
  })

  test('popper opens below the trigger, and item-aligned lays the chosen item over it', async ({ page }) => {
    await visit(page)
    await page.getByRole('button', { name: 'Pick Grapes' }).click()

    await trigger(page).click()
    const below = await listbox(page).boundingBox()
    const box = await trigger(page).boundingBox()

    expect(below?.y).toBeGreaterThanOrEqual((box?.y ?? 0) + (box?.height ?? 0))

    await page.keyboard.press('Escape')
    await page.getByRole('checkbox', { name: 'Item-aligned' }).check()
    await trigger(page).click()
    const grapes = await option(page, 'Grapes').boundingBox()

    expect(
      Math.abs((grapes?.y ?? 0) + (grapes?.height ?? 0) / 2 - ((box?.y ?? 0) + (box?.height ?? 0) / 2)),
    ).toBeLessThan(4)
  })

  test('a list taller than its box shows scroll buttons that scroll it', async ({ page }) => {
    await visit(page, 'Short list')

    await trigger(page).click()
    const down = page.getByText('down', { exact: true })

    await expect(page.getByText('up', { exact: true })).toHaveCount(0)
    await expect(down).toBeVisible()

    await down.hover()

    await expect(page.getByText('up', { exact: true })).toBeVisible()
  })
})

test.describe('Select with multiple', () => {
  const foods = (page: Page) => page.locator('#foods')
  const picks = (page: Page) => foods(page).locator('span').first()

  async function visitMultiple(page: Page, ...toggles: string[]) {
    await visitStory(page, 'select--multiple')
    for (const toggle of toggles) await page.getByRole('checkbox', { name: toggle, exact: true }).check()
  }

  for (const toggles of [[], ['Items']]) {
    const named = toggles.length ? ' given items' : ''

    test(`stays open through clicks, shows the picks in the order made, and submits each one${named}`, async ({
      page,
    }) => {
      await visitMultiple(page, ...toggles)

      await foods(page).click()
      await option(page, 'Leek').click()
      await option(page, 'Apple').click()
      await expect(listbox(page)).toBeVisible()
      await expect(listbox(page)).toHaveAttribute('aria-multiselectable', 'true')
      await expect(option(page, 'Banana')).toHaveAttribute('aria-selected', 'false')
      await page.keyboard.press('Escape')
      await page.getByRole('button', { name: 'Submit' }).click()

      await expect(picks(page)).toHaveText('Leek, Apple')
      await expect(output(page, 'Value')).toHaveText('leek,apple')
      await expect(output(page, 'Submitted')).toHaveText('apple,leek')
    })
  }

  test('the keyboard toggles items with Space and Enter, and the list opens again on the first pick', async ({
    page,
  }) => {
    await visitMultiple(page)

    await foods(page).focus()
    await page.keyboard.press('Enter')
    await expect(option(page, 'Apple')).toBeFocused()
    await page.keyboard.press('ArrowDown')
    await expect(option(page, 'Banana')).toBeFocused()
    await page.keyboard.press(' ')
    await page.keyboard.press('ArrowDown')
    await expect(option(page, 'Blueberry')).toBeFocused()
    await page.keyboard.press('Enter')
    await page.keyboard.press('ArrowUp')
    await expect(option(page, 'Banana')).toBeFocused()
    await page.keyboard.press(' ')
    await expect(option(page, 'Banana')).toHaveAttribute('aria-selected', 'false')
    await expect(option(page, 'Blueberry')).toHaveAttribute('aria-selected', 'true')
    await page.keyboard.press('Escape')
    await expect(foods(page)).toBeFocused()
    await expect(output(page, 'Value')).toHaveText('blueberry')
    await page.keyboard.press('Enter')

    await expect(option(page, 'Blueberry')).toBeFocused()
  })

  test('a required one left empty refuses to submit, and a reset clears its picks', async ({ page }) => {
    await visitMultiple(page)

    await page.getByRole('button', { name: 'Submit' }).click()
    await expect(output(page, 'Submitted')).toHaveText('')
    await page.getByRole('button', { name: 'Pick Leek and Apple' }).click()
    await expect(picks(page)).toHaveText('Leek, Apple')
    await page.getByRole('button', { name: 'Reset' }).click()

    await expect(output(page, 'Value')).toHaveText('none')
    await expect(picks(page)).toHaveText('Pick some foods')
  })

  test('item-aligned lays the first pick over the trigger, and the list holds still through picks', async ({
    page,
  }) => {
    await visitMultiple(page, 'Item-aligned')
    await page.getByRole('button', { name: 'Pick Leek and Apple' }).click()

    await foods(page).click()
    await expect(option(page, 'Leek')).toBeFocused()
    const box = await foods(page).boundingBox()
    const leek = await option(page, 'Leek').boundingBox()
    const opened = await listbox(page).boundingBox()
    await option(page, 'Leek').click()
    await option(page, 'Broccoli').click()
    await expect(option(page, 'Broccoli')).toHaveAttribute('aria-selected', 'true')

    expect(Math.abs((leek?.y ?? 0) + (leek?.height ?? 0) / 2 - ((box?.y ?? 0) + (box?.height ?? 0) / 2))).toBeLessThan(
      4,
    )
    expect(await listbox(page).boundingBox()).toEqual(opened)
    await page.keyboard.press('Escape')
    await expect(output(page, 'Value')).toHaveText('apple,broccoli')
  })
})

test.describe('Select in another root', () => {
  test.beforeEach(async ({ page }) => {
    await visitStory(page, 'select--hosts')
  })

  for (const where of ['an iframe', 'a shadow root'] as const) {
    const host = (page: Page) => (where === 'an iframe' ? page.frameLocator('iframe[title="Frame"]') : page)
    const name = where === 'an iframe' ? 'Fruit in a frame' : 'Fruit in a shadow root'

    test(`opens on the picked item and moves one item at a time inside ${where}`, async ({ page }) => {
      await host(page).getByRole('combobox', { name }).focus()
      await page.keyboard.press('Enter')

      await expect(host(page).getByRole('option', { name: 'Banana' })).toBeFocused()

      await page.keyboard.press('ArrowDown')

      await expect(host(page).getByRole('option', { name: 'Blueberry' })).toBeFocused()
    })

    test(`goes on to the next item a typed letter starts inside ${where}`, async ({ page }) => {
      await host(page).getByRole('combobox', { name }).focus()
      await page.keyboard.press('Enter')
      await expect(host(page).getByRole('option', { name: 'Banana' })).toBeFocused()

      await page.keyboard.press('b')

      await expect(host(page).getByRole('option', { name: 'Blueberry' })).toBeFocused()
    })
  }

  test('keeps the list open when the press that opened it is released over the picked item inside an iframe', async ({
    page,
  }) => {
    const frame = page.frameLocator('iframe[title="Frame"]')
    const box = await frame.getByRole('combobox', { name: 'Fruit in a frame' }).boundingBox()
    await page.mouse.move((box?.x ?? 0) + 20, (box?.y ?? 0) + (box?.height ?? 0) / 2)

    await page.mouse.down()
    await page.mouse.up()

    await expect(frame.getByRole('listbox')).toBeVisible()
    await expect(frame.getByRole('option', { name: 'Banana' })).toBeFocused()
  })

  test('closes when focus leaves the iframe it is in', async ({ page }) => {
    const frame = page.frameLocator('iframe[title="Frame"]')
    await frame.getByRole('combobox', { name: 'Fruit in a frame' }).focus()
    await page.keyboard.press('Enter')
    await expect(frame.getByRole('listbox')).toBeVisible()

    await page.getByRole('button', { name: 'Outside' }).evaluate((button: HTMLElement) => button.focus())

    await expect(frame.getByRole('listbox')).toHaveCount(0)
  })
})
