import { expect, type Page, test } from '@playwright/test'
import { visitStory } from '../../__tests__/e2e-helpers'

const radio = (page: Page, name: string) => page.getByRole('radio', { name })
const output = (page: Page, name: string) => page.getByRole('status', { name })

test.describe('RadioGroup', () => {
  test.beforeEach(async ({ page }) => {
    await visitStory(page, 'radiogroup--basic')
  })

  test('a required group refuses an empty submit, then a label click checks a fruit the form submits', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Submit' }).click()

    await expect(output(page, 'Submitted')).toHaveText('')

    await page.locator('label', { hasText: 'Cherry' }).click()

    await expect(radio(page, 'Cherry')).toHaveAttribute('aria-checked', 'true')
    await expect(radio(page, 'Cherry')).toHaveAttribute('data-state', 'checked')
    await expect(radio(page, 'Apple')).toHaveAttribute('data-state', 'unchecked')
    await expect(output(page, 'Value')).toHaveText('Cherry')
    await expect(output(page, 'Form changes')).toHaveText('1')

    await page.getByRole('button', { name: 'Submit' }).click()

    await expect(output(page, 'Submitted')).toHaveText('Cherry')
  })

  test('a refused submit focuses the first radio, so arrow keys pick a fruit the group shows', async ({ page }) => {
    await page.getByRole('button', { name: 'Submit' }).click()

    await expect(radio(page, 'Apple')).toBeFocused()

    await page.keyboard.press('ArrowDown')

    await expect(radio(page, 'Cherry')).toHaveAttribute('aria-checked', 'true')
    await expect(output(page, 'Value')).toHaveText('Cherry')

    await page.getByRole('button', { name: 'Submit' }).click()

    await expect(output(page, 'Submitted')).toHaveText('Cherry')
  })

  test('arrow keys check the radio they land on, pass over a disabled one, and loop unless told not to', async ({
    page,
  }) => {
    await radio(page, 'Apple').click()
    await page.keyboard.press('ArrowDown')

    await expect(radio(page, 'Cherry')).toBeFocused()
    await expect(output(page, 'Value')).toHaveText('Cherry')

    await page.keyboard.press('End')

    await expect(output(page, 'Value')).toHaveText('Elderberry')

    await page.keyboard.press('ArrowRight')

    await expect(output(page, 'Value')).toHaveText('Apple')

    await page.getByRole('checkbox', { name: 'Loop' }).uncheck()
    await radio(page, 'Apple').click()
    await page.keyboard.press('ArrowUp')

    await expect(radio(page, 'Apple')).toBeFocused()

    await page.keyboard.press('PageDown')

    await expect(output(page, 'Value')).toHaveText('Elderberry')

    await page.getByRole('checkbox', { name: 'Disable Banana' }).uncheck()
    await radio(page, 'Apple').click()
    await page.keyboard.press('ArrowDown')

    await expect(output(page, 'Value')).toHaveText('Banana')
  })

  test('horizontal and right-to-left, ArrowLeft moves on and ArrowUp moves nowhere', async ({ page }) => {
    await page.getByRole('checkbox', { name: 'Horizontal' }).check()
    await page.getByRole('checkbox', { name: 'Right-to-left' }).check()
    const group = page.getByRole('radiogroup', { name: 'Fruit' })

    await expect(group).toHaveAttribute('aria-orientation', 'horizontal')
    await expect(group).toHaveAttribute('dir', 'rtl')

    await radio(page, 'Apple').click()
    await page.keyboard.press('ArrowLeft')

    await expect(output(page, 'Value')).toHaveText('Cherry')

    await page.keyboard.press('ArrowDown')

    await expect(radio(page, 'Cherry')).toBeFocused()

    await page.keyboard.press('ArrowRight')

    await expect(output(page, 'Value')).toHaveText('Apple')
  })

  test('Space checks the focused radio and Enter does not', async ({ page }) => {
    await radio(page, 'Apple').focus()
    await page.keyboard.press('Enter')

    await expect(radio(page, 'Apple')).toHaveAttribute('aria-checked', 'false')

    await page.keyboard.press('Space')

    await expect(radio(page, 'Apple')).toHaveAttribute('aria-checked', 'true')
  })

  test('a letter jumps to the fruit it starts, and G and g g reach the ends', async ({ page }) => {
    await radio(page, 'Apple').click()
    await page.keyboard.press('d')

    await expect(radio(page, 'Durian')).toBeFocused()
    await expect(output(page, 'Value')).toHaveText('Durian')

    await page.keyboard.press('Shift+G')

    await expect(output(page, 'Value')).toHaveText('Elderberry')

    await page.keyboard.press('g')
    await page.keyboard.press('g')

    await expect(output(page, 'Value')).toHaveText('Apple')
  })

  test('read-only keeps the choice while focus still moves', async ({ page }) => {
    await radio(page, 'Apple').click()
    await page.getByRole('checkbox', { name: 'Read-only' }).check()

    await expect(page.getByRole('radiogroup', { name: 'Fruit' })).toHaveAttribute('aria-readonly', 'true')

    await radio(page, 'Apple').focus()
    await page.keyboard.press('ArrowDown')

    await expect(radio(page, 'Cherry')).toBeFocused()

    await radio(page, 'Durian').click()

    await expect(output(page, 'Value')).toHaveText('Apple')
    await expect(radio(page, 'Durian')).toHaveAttribute('aria-checked', 'false')
  })

  test('a disabled group disables every radio, and a label click checks nothing', async ({ page }) => {
    await page.getByRole('checkbox', { name: 'Disable the group' }).check()

    for (const radioButton of await page.getByRole('radio').all()) await expect(radioButton).toBeDisabled()

    await page.locator('label', { hasText: 'Apple' }).click({ force: true })

    await expect(output(page, 'Value')).toHaveText('')
  })

  test('a value set from outside checks its radio, and a form reset puts back the first value', async ({ page }) => {
    await page.getByRole('button', { name: 'Pick Durian' }).click()

    await expect(radio(page, 'Durian')).toHaveAttribute('aria-checked', 'true')

    await page.getByRole('button', { name: 'Reset' }).click()

    await expect(output(page, 'Value')).toHaveText('')
    await expect(page.getByRole('radio', { checked: true })).toHaveCount(0)
  })
})

test.describe('RadioGroup composed from its parts', () => {
  test.beforeEach(async ({ page }) => {
    await visitStory(page, 'radiogroup--composed')
  })

  test('a provider, trigger and bubble input submit with a form outside the group', async ({ page }) => {
    const indicators = page.locator('[data-slot="radio-group-indicator"]')

    await expect(radio(page, 'Pro')).toHaveAttribute('aria-checked', 'true')
    await expect(radio(page, 'Team')).toBeDisabled()
    await expect(indicators).toHaveCount(3)
    await expect(indicators.nth(0)).toHaveAttribute('data-state', 'unchecked')
    await expect(indicators.nth(2)).toHaveAttribute('data-disabled', '')

    await page.getByRole('button', { name: 'Submit plan' }).click()

    await expect(output(page, 'Submitted plan')).toHaveText('Pro')

    await radio(page, 'Pro').focus()
    await page.keyboard.press('ArrowLeft')

    await expect(radio(page, 'Hobby')).toHaveAttribute('aria-checked', 'true')

    await page.keyboard.press('ArrowRight')

    await expect(radio(page, 'Pro')).toHaveAttribute('aria-checked', 'true')

    await page.keyboard.press('ArrowRight')

    await expect(radio(page, 'Hobby')).toHaveAttribute('aria-checked', 'true')

    await page.getByRole('button', { name: 'Submit plan' }).click()

    await expect(output(page, 'Submitted plan')).toHaveText('Hobby')
  })
})
