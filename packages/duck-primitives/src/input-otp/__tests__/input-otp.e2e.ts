import { expect, type Page, test } from '@playwright/test'
import { visitStory } from '../../__tests__/e2e-helpers'

const digit = (page: Page, place: number) => page.getByLabel(`Digit ${place}`, { exact: true })

test.describe('InputOTP code', () => {
  test.beforeEach(async ({ page }) => {
    await visitStory(page, 'inputotp--code')
  })

  test('fills a slot per digit, moves on as it goes, and reports the code once complete', async ({ page }) => {
    await digit(page, 1).focus()
    await page.keyboard.type('12345')

    await expect(digit(page, 6)).toBeFocused()
    await expect(page.getByLabel('Completed')).toHaveText('not yet')

    await page.keyboard.type('6')

    await expect(page.getByLabel('Value')).toHaveText('123456')
    await expect(page.getByLabel('Completed')).toHaveText('123456')
    await expect(page.getByText('-', { exact: true })).toHaveAttribute('aria-hidden', 'true')
  })

  test('is one stop for Tab, so Tab leaves the code and Shift+Tab comes back where typing goes', async ({ page }) => {
    await digit(page, 1).focus()
    await page.keyboard.type('12')

    await page.keyboard.press('Tab')
    await expect(page.getByRole('button', { name: 'Clear' })).toBeFocused()
    await page.keyboard.press('Shift+Tab')

    await expect(digit(page, 3)).toBeFocused()
  })

  test('refuses a letter the digits pattern does not take', async ({ page }) => {
    await digit(page, 1).focus()
    await page.keyboard.type('a1b')

    await expect(page.getByLabel('Value')).toHaveText('1')
    await expect(digit(page, 2)).toBeFocused()
  })

  test('takes Backspace in an empty slot back over the digit before it', async ({ page }) => {
    await digit(page, 1).focus()
    await page.keyboard.type('12')
    await page.keyboard.press('Backspace')

    await expect(page.getByLabel('Value')).toHaveText('1')
    await expect(digit(page, 2)).toBeFocused()
  })

  test('moves between slots on the arrow keys, and replaces the digit of a filled slot', async ({ page }) => {
    await digit(page, 1).focus()
    await page.keyboard.type('123')
    await page.keyboard.press('ArrowLeft')
    await page.keyboard.press('ArrowLeft')

    await expect(digit(page, 2)).toBeFocused()

    await page.keyboard.type('9')

    await expect(page.getByLabel('Value')).toHaveText('193')
  })

  test('fills every slot from a pasted code, keeping only its digits', async ({ browserName, page }) => {
    test.skip(browserName === 'firefox', 'Firefox empties the data of a paste event the page makes itself')
    await digit(page, 1).focus()
    await digit(page, 1).evaluate((slot) => {
      const data = new DataTransfer()
      data.setData('text', '12-34-56')
      slot.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: data }))
    })

    await expect(page.getByLabel('Value')).toHaveText('123456')
    await expect(page.getByLabel('Completed')).toHaveText('123456')
  })

  test('fills every slot from text inserted at once, as an autofilled code arrives', async ({ page }) => {
    await digit(page, 1).focus()
    await page.keyboard.insertText('654321')

    await expect(page.getByLabel('Value')).toHaveText('654321')
    await expect(digit(page, 6)).toBeFocused()
  })

  test('replaces the digit of a filled slot with one an on-screen keyboard puts after it', async ({ page }) => {
    await digit(page, 1).focus()
    await page.keyboard.type('12')
    await digit(page, 1).focus()
    await page.keyboard.press('End')
    await page.keyboard.insertText('9')

    await expect(page.getByLabel('Value')).toHaveText('92')
    await expect(digit(page, 1)).toHaveValue('9')
  })

  test('puts the caret in the first empty slot when a slot past the end of the code is clicked', async ({ page }) => {
    await digit(page, 1).focus()
    await page.keyboard.type('1')
    await digit(page, 3).click()

    await expect(digit(page, 2)).toBeFocused()

    await page.keyboard.type('2')

    await expect(page.getByLabel('Value')).toHaveText('12')
    await expect(digit(page, 2)).toHaveValue('2')
  })

  test('empties every slot when its owner clears the value', async ({ page }) => {
    await digit(page, 1).focus()
    await page.keyboard.type('123')
    await expect(digit(page, 3)).toHaveValue('3')
    await page.getByRole('button', { name: 'Clear' }).click()

    await expect(page.getByLabel('Value')).toHaveText('empty')
    for (const place of [1, 2, 3]) await expect(digit(page, place)).toHaveValue('')
  })
})

test.describe('InputOTP by touch', () => {
  test.use({ hasTouch: true })

  test('puts the caret in the first empty slot when a slot past the end of the code is tapped', async ({ page }) => {
    await visitStory(page, 'inputotp--code')
    await digit(page, 4).tap()

    await expect(digit(page, 1)).toBeFocused()
  })
})

test.describe('InputOTP in a form', () => {
  test.beforeEach(async ({ page }) => {
    await visitStory(page, 'inputotp--form-and-states')
  })

  test('submits the form under its name once the last slot is filled', async ({ page }) => {
    await digit(page, 3).focus()
    await page.keyboard.type('4')

    await expect(page.getByLabel('Submitted')).toHaveText('nothing')

    await page.keyboard.type('2')

    await expect(page.getByLabel('Submitted')).toHaveText('4242')
  })

  test('hides each character as a password slot', async ({ page }) => {
    await page.getByRole('checkbox', { name: 'Hide characters' }).check()

    for (const place of [1, 2, 3, 4]) await expect(digit(page, place)).toHaveAttribute('type', 'password')
  })

  test('takes no typing while read only, and no focus while disabled', async ({ page }) => {
    await page.getByRole('checkbox', { name: 'Read only' }).check()
    await digit(page, 3).focus()
    await page.keyboard.type('77')

    await expect(digit(page, 3)).toHaveValue('')
    await expect(page.getByLabel('Submitted')).toHaveText('nothing')

    await page.getByRole('checkbox', { name: 'Disabled' }).check()

    for (const place of [1, 2, 3, 4]) await expect(digit(page, place)).toBeDisabled()
  })

  test('goes back to its default code when the form is reset, and submits from there', async ({ page }) => {
    await digit(page, 3).focus()
    await page.keyboard.type('1')
    await page.getByRole('button', { name: 'Reset' }).click()

    for (const [place, char] of [
      [1, '4'],
      [2, '2'],
      [3, ''],
      [4, ''],
    ] as const) {
      await expect(digit(page, place)).toHaveValue(char)
    }

    await digit(page, 3).focus()
    await page.keyboard.type('13')

    await expect(page.getByLabel('Submitted')).toHaveText('4213')
  })

  test('submits the code on Enter in a form with no submit button', async ({ page }) => {
    await digit(page, 2).focus()
    await page.keyboard.press('Enter')

    await expect(page.getByLabel('Submitted')).toHaveText('42')
  })

  test('submits once on Enter in a form with a submit button, through that button', async ({ page }) => {
    await page.getByRole('checkbox', { name: 'Submit button' }).check()
    await digit(page, 2).focus()
    await page.keyboard.press('Enter')

    await expect(page.getByLabel('Submitted')).toHaveText('42')

    await page.keyboard.press('Enter')

    await expect(page.getByLabel('Submitted')).toHaveText('42, 42')
  })
})

test.describe('InputOTP right to left', () => {
  test('takes letters and digits, and moves to the slot on the side each arrow points to', async ({ page }) => {
    await visitStory(page, 'inputotp--right-to-left')
    await digit(page, 1).focus()
    await page.keyboard.type('a1b')

    await expect(page.getByLabel('Value')).toHaveText('a1b')
    await expect(digit(page, 4)).toBeFocused()

    await page.keyboard.press('ArrowRight')

    await expect(digit(page, 3)).toBeFocused()

    await page.keyboard.press('ArrowLeft')

    await expect(digit(page, 4)).toBeFocused()
  })
})
