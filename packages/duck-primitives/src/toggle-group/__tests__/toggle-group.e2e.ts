import { expect, type Page, test } from '@playwright/test'
import { visitStory } from '../../__tests__/e2e-helpers'

const radio = (page: Page, name: string | RegExp) => page.getByRole('radio', { name })
const item = (page: Page, name: string) => page.getByRole('button', { exact: true, name })
const output = (page: Page, name: string) => page.getByRole('status', { name })

async function visit(page: Page, story: string, ...toggles: string[]) {
  await visitStory(page, `togglegroup--${story}`)
  for (const toggle of toggles) await page.getByRole('checkbox', { name: toggle }).check()
}

async function enter(page: Page) {
  await page.getByRole('button', { name: 'Before' }).focus()
  await page.keyboard.press('Tab')
}

// Roving focus moves focus in a timeout after the keydown, as Radix does, so each move is awaited before the next key,
// and a key that must not move focus is given that long to.
test.describe('ToggleGroup single', () => {
  test('is a radio group whose items turn each other off, and the item on can be turned off', async ({ page }) => {
    await visit(page, 'single')

    await expect(page.getByRole('radiogroup', { name: 'Alignment' })).toBeVisible()
    await expect(radio(page, 'Center')).toHaveAttribute('aria-checked', 'true')

    await radio(page, 'Left').click()

    await expect(radio(page, 'Left')).toHaveAttribute('aria-checked', 'true')
    await expect(radio(page, 'Center')).toHaveAttribute('aria-checked', 'false')
    await expect(output(page, 'Value')).toHaveText('left')

    await radio(page, 'Left').click()

    await expect(radio(page, 'Left')).toHaveAttribute('aria-checked', 'false')
    await expect(output(page, 'Value')).toHaveText('')
  })

  test('deselectable={false} keeps the item on when it is pressed again', async ({ page }) => {
    await visit(page, 'single', 'Keep one on')

    await radio(page, 'Center').click()

    await expect(radio(page, 'Center')).toHaveAttribute('aria-checked', 'true')
    await expect(output(page, 'Value')).toHaveText('center')
  })

  test('Tab enters on the item that is on and leaves with the next Tab; the arrows move focus, skip a disabled item and wrap', async ({
    page,
  }) => {
    await visit(page, 'single')
    await enter(page)

    await expect(radio(page, 'Center')).toBeFocused()

    await page.keyboard.press('ArrowRight')

    await expect(radio(page, /^Right/)).toBeFocused()

    await page.keyboard.press('ArrowRight')

    await expect(radio(page, 'Left')).toBeFocused()

    await page.keyboard.press('End')

    await expect(radio(page, /^Right/)).toBeFocused()

    await page.keyboard.press('Home')

    await expect(radio(page, 'Left')).toBeFocused()

    await page.keyboard.press('ArrowDown')

    await expect(radio(page, 'Center')).toBeFocused()
    await expect(output(page, 'Value')).toHaveText('center')

    await page.keyboard.press('Tab')

    await expect(page.getByRole('button', { name: 'After' })).toBeFocused()
  })

  test('Space and Enter turn the focused item on, and the render function reads its state', async ({ page }) => {
    await visit(page, 'single')
    await enter(page)
    await page.keyboard.press('ArrowRight')

    await expect(radio(page, /^Right/)).toBeFocused()

    await page.keyboard.press('Space')

    await expect(radio(page, 'Right (on)')).toHaveAttribute('aria-checked', 'true')
    await expect(output(page, 'Value')).toHaveText('right')

    await page.keyboard.press('Home')

    await expect(radio(page, 'Left')).toBeFocused()

    await page.keyboard.press('Enter')

    await expect(output(page, 'Value')).toHaveText('left')
    await expect(radio(page, 'Right')).toHaveAttribute('aria-checked', 'false')
  })

  test('loop={false} stops the arrows at either end', async ({ page }) => {
    await visit(page, 'single', 'No loop')
    await enter(page)
    await page.keyboard.press('End')

    await expect(radio(page, /^Right/)).toBeFocused()

    await page.keyboard.press('ArrowRight')
    await page.waitForTimeout(50)

    await expect(radio(page, /^Right/)).toBeFocused()

    await page.keyboard.press('Home')

    await expect(radio(page, 'Left')).toBeFocused()

    await page.keyboard.press('ArrowLeft')
    await page.waitForTimeout(50)

    await expect(radio(page, 'Left')).toBeFocused()
  })

  test('right-to-left turns the left and right arrows around', async ({ page }) => {
    await visit(page, 'single', 'Right-to-left')
    await enter(page)
    await page.keyboard.press('ArrowLeft')

    await expect(radio(page, /^Right/)).toBeFocused()

    await page.keyboard.press('ArrowRight')

    await expect(radio(page, 'Center')).toBeFocused()
  })

  test('vertical, it reads the up and down arrows and leaves left and right alone', async ({ page }) => {
    await visit(page, 'single', 'Vertical')

    await expect(page.getByRole('radiogroup')).toHaveAttribute('aria-orientation', 'vertical')

    await enter(page)
    await page.keyboard.press('ArrowRight')
    await page.waitForTimeout(50)

    await expect(radio(page, 'Center')).toBeFocused()

    await page.keyboard.press('ArrowUp')

    await expect(radio(page, 'Left')).toBeFocused()
  })

  test('disabled, it takes no click and no focus', async ({ page }) => {
    await visit(page, 'single', 'Disabled')

    await radio(page, 'Left').click({ force: true })
    await enter(page)

    await expect(radio(page, 'Left')).toHaveAttribute('aria-checked', 'false')
    await expect(page.getByRole('button', { name: 'After' })).toBeFocused()
    await expect(output(page, 'Value')).toHaveText('center')
  })
})

test.describe('ToggleGroup multiple', () => {
  test('is a toolbar of pressed buttons, each on or off by itself', async ({ page }) => {
    await visit(page, 'multiple')

    await expect(page.getByRole('toolbar', { name: 'Formatting' })).toBeVisible()
    await expect(item(page, 'Bold')).toHaveAttribute('aria-pressed', 'true')

    await item(page, 'Italic').click()

    await expect(output(page, 'Value')).toHaveText('bold, italic')

    await item(page, 'Bold').click()

    await expect(output(page, 'Value')).toHaveText('italic')
    await expect(item(page, 'Bold')).toHaveAttribute('aria-pressed', 'false')
  })

  test('deselectable={false} turns an item off only while another stays on', async ({ page }) => {
    await visit(page, 'multiple', 'Keep one on')

    await item(page, 'Bold').click()
    await item(page, 'Underline').click()

    await expect(output(page, 'Value')).toHaveText('bold, underline')

    await item(page, 'Bold').click()

    await expect(output(page, 'Value')).toHaveText('underline')
    await expect(item(page, 'Bold')).toHaveAttribute('aria-pressed', 'false')
  })

  test('rovingFocus={false} makes it a plain group with every enabled item in the tab order', async ({ page }) => {
    await visit(page, 'multiple', 'Roving focus off')

    await expect(page.getByRole('group', { name: 'Formatting' })).toBeVisible()

    await enter(page)

    await expect(item(page, 'Bold')).toBeFocused()

    await page.keyboard.press('ArrowRight')
    await page.waitForTimeout(50)

    await expect(item(page, 'Bold')).toBeFocused()

    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    await expect(item(page, 'Underline')).toBeFocused()

    await page.keyboard.press('Tab')

    await expect(page.getByRole('button', { name: 'After' })).toBeFocused()
  })
})

test.describe('ToggleGroup controlled', () => {
  test('reports each press, moves only when its owner follows, and follows a value set from outside', async ({
    page,
  }) => {
    await visit(page, 'controlled')

    await radio(page, 'Week').click()

    await expect(radio(page, 'Week')).toHaveAttribute('aria-checked', 'true')

    await page.getByRole('checkbox', { name: 'Locked' }).check()
    await radio(page, 'Month').click()

    await expect(radio(page, 'Week')).toHaveAttribute('aria-checked', 'true')

    await page.getByRole('checkbox', { name: 'Locked' }).uncheck()
    await page.getByRole('button', { name: 'Month from outside' }).click()

    await expect(radio(page, 'Month')).toHaveAttribute('aria-checked', 'true')

    await radio(page, 'Month').click()

    await expect(radio(page, 'Month')).toHaveAttribute('aria-checked', 'false')
    await expect(output(page, 'Asked')).toHaveText('week, month, (none)')
  })
})
