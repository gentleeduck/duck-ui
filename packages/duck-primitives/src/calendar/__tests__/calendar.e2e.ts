import { expect, type Page, test } from '@playwright/test'
import { visitStory } from '../../__tests__/e2e-helpers'

const day = (page: Page, name: string) =>
  page.getByRole('gridcell', { name, exact: true }).and(page.locator(':not([data-outside-month])'))
const picked = (page: Page) => page.getByRole('status', { name: 'Picked' })
const header = (page: Page) => page.locator('[data-slot="calendar-header"]')

test.describe('Calendar', () => {
  test('picks a day on a click, and leaves one day of the month in the tab order', async ({ page }) => {
    await visitStory(page, 'calendar--single')

    await day(page, 'Thursday, March 12, 2026').click()

    await expect(picked(page)).toHaveText('2026-03-12')
    await expect(day(page, 'Thursday, March 12, 2026')).toHaveAttribute('aria-selected', 'true')
    await expect(page.locator('[data-slot="calendar-day"][tabindex="0"]')).toHaveCount(1)
  })

  test('moves through the days with the arrow keys, Home, End and PageDown, and picks one on Enter', async ({
    page,
  }) => {
    await visitStory(page, 'calendar--single')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await expect(day(page, 'Sunday, March 1, 2026')).toBeFocused()

    await page.keyboard.press('ArrowRight')
    await expect(day(page, 'Monday, March 2, 2026')).toBeFocused()
    await page.keyboard.press('ArrowDown')
    await expect(day(page, 'Monday, March 9, 2026')).toBeFocused()
    await page.keyboard.press('End')
    await expect(day(page, 'Saturday, March 14, 2026')).toBeFocused()
    await page.keyboard.press('Home')
    await expect(day(page, 'Sunday, March 8, 2026')).toBeFocused()
    await page.keyboard.press('PageDown')
    await expect(day(page, 'Wednesday, April 8, 2026')).toBeFocused()
    await expect(header(page)).toHaveText('April 2026')

    await page.keyboard.press('Enter')
    await expect(picked(page)).toHaveText('2026-04-08')
  })

  test('pages a month at a time with its buttons', async ({ page }) => {
    await visitStory(page, 'calendar--single')

    await page.getByRole('button', { name: 'Go to next month' }).click()
    await expect(header(page)).toHaveText('April 2026')

    await page.getByRole('button', { name: 'Go to previous month' }).click()
    await page.getByRole('button', { name: 'Go to previous month' }).click()
    await expect(header(page)).toHaveText('February 2026')
  })

  test('picks a range across two months, and pages by both with pageBehavior visible', async ({ page }) => {
    await visitStory(page, 'calendar--range')

    await day(page, 'Tuesday, March 10, 2026').click()
    await expect(picked(page)).toHaveText('2026-03-10 to ...')
    await day(page, 'Friday, April 3, 2026').click()

    await expect(picked(page)).toHaveText('2026-03-10 to 2026-04-03')
    await expect(day(page, 'Friday, March 20, 2026')).toHaveAttribute('data-range-middle', 'true')

    await page.getByRole('button', { name: 'Go to next month' }).click()
    await expect(header(page)).toHaveText('May 2026')
  })

  test('picks several days, and drops one picked again', async ({ page }) => {
    await visitStory(page, 'calendar--multiple')

    await day(page, 'Tuesday, March 3, 2026').click()
    await day(page, 'Thursday, March 5, 2026').click()
    await expect(picked(page)).toHaveText('2026-03-03, 2026-03-05')

    await day(page, 'Tuesday, March 3, 2026').click()
    await expect(picked(page)).toHaveText('2026-03-05')
  })

  test('refuses the days outside its bounds, a disabled day and an unavailable one, and the keys pass over the disabled ones', async ({
    page,
  }) => {
    await visitStory(page, 'calendar--bounds')

    await expect(page.getByRole('button', { name: 'Go to previous month' })).toBeDisabled()
    for (const name of ['Monday, March 9, 2026', 'Saturday, March 14, 2026', 'Tuesday, March 17, 2026']) {
      await expect(day(page, name)).toHaveAttribute('aria-disabled', 'true')
    }

    await day(page, 'Saturday, March 14, 2026').click({ force: true })
    await expect(day(page, 'Saturday, March 14, 2026')).toHaveAttribute('aria-selected', 'false')

    await day(page, 'Monday, March 16, 2026').click()
    await day(page, 'Monday, March 16, 2026').focus()
    await page.keyboard.press('ArrowRight')
    await expect(day(page, 'Wednesday, March 18, 2026')).toBeFocused()
    await page.keyboard.press('Home')
    await expect(day(page, 'Sunday, March 15, 2026')).toBeFocused()

    await page.getByRole('button', { name: 'Go to next month' }).click()
    await expect(page.getByRole('button', { name: 'Go to next month' })).toBeDisabled()
  })

  test('keeps its selection when read-only', async ({ page }) => {
    await visitStory(page, 'calendar--read-only')
    await expect(page.getByRole('grid')).toHaveAttribute('aria-readonly', 'true')

    await day(page, 'Sunday, March 15, 2026').click()

    await expect(day(page, 'Sunday, March 15, 2026')).toHaveAttribute('aria-selected', 'false')
    await expect(day(page, 'Thursday, March 12, 2026')).toHaveAttribute('aria-selected', 'true')
  })

  test('starts each week on its locale day, with its ISO week number', async ({ page }) => {
    await visitStory(page, 'calendar--week-numbers')

    await expect(page.getByRole('rowheader')).toHaveText(['9', '10', '11', '12', '13', '14'])
    await expect(page.getByRole('columnheader').first()).toHaveAttribute('title', /^Mon/)
  })

  test('moves the month a year or a month picked in its views points at', async ({ page }) => {
    await visitStory(page, 'calendar--views')
    const calendar = page.getByTestId('calendar')

    await page.getByRole('button', { name: 'Pick a year' }).click()
    await page.getByRole('gridcell', { name: '2028', exact: true }).click()
    await expect(calendar).toHaveAttribute('data-view', 'months')
    await expect(header(page)).toHaveText('March 2028')

    await page.getByRole('gridcell', { name: /^Jul/ }).click()
    await expect(calendar).toHaveAttribute('data-view', 'days')
    await expect(header(page)).toHaveText('July 2028')
    await page.getByRole('gridcell', { name: /July 14, 2028/ }).click()
    await expect(page.getByRole('gridcell', { name: /July 14, 2028/ })).toHaveAttribute('aria-selected', 'true')
  })

  test('shows only the picker or the days its view names', async ({ page }) => {
    await visitStory(page, 'calendar--views')

    const shown = () =>
      Promise.all(
        ['calendar-year-view', 'calendar-month-view', 'calendar-grid'].map((slot) =>
          page.locator(`[data-slot="${slot}"]`).first().isVisible(),
        ),
      )
    const days = await shown()
    await page.getByRole('button', { name: 'Pick a year' }).click()

    expect([days, await shown()]).toEqual([
      [false, false, true],
      [true, false, false],
    ])
  })

  test('opens the view its trigger names', async ({ page }) => {
    await visitStory(page, 'calendar--views')
    const calendar = page.getByTestId('calendar')

    await page.getByRole('button', { name: 'Pick a year' }).click()
    await expect(calendar).toHaveAttribute('data-view', 'years')
    await expect(page.getByRole('button', { name: 'Pick a year' })).toHaveAttribute('data-state', 'active')
    await page.getByRole('button', { name: 'Pick a month' }).click()

    await expect(calendar).toHaveAttribute('data-view', 'months')
  })

  test('lays a right-to-left calendar out from the right, and takes ArrowLeft to the next day', async ({ page }) => {
    await visitStory(page, 'calendar--right-to-left')
    const calendar = page.getByTestId('calendar')
    const inMonth = page.locator('[data-slot="calendar-day"]:not([data-outside-month])')
    const first = inMonth.filter({ hasText: /^1$/ })
    const second = inMonth.filter({ hasText: /^2$/ })

    await expect(calendar).toHaveAttribute('dir', 'rtl')
    const [one, two] = await Promise.all([first.boundingBox(), second.boundingBox()])
    expect(two!.x).toBeLessThan(one!.x)

    await first.focus()
    await page.keyboard.press('ArrowLeft')
    await expect(second).toBeFocused()
  })

  test('shows a Persian month, and picks its Gregorian day', async ({ page }) => {
    await visitStory(page, 'calendar--persian')

    await expect(header(page)).toContainText('اسفند')
    await page.locator('[data-slot="calendar-day"]:not([data-outside-month])').first().click()

    await expect(picked(page)).toHaveText('2026-02-20')
  })

  test('picks two ranges, a day after the first range ends starting the second', async ({ page }) => {
    await visitStory(page, 'calendar--multi-range')

    await day(page, 'Monday, March 2, 2026').click()
    await day(page, 'Wednesday, March 4, 2026').click()
    await day(page, 'Monday, March 16, 2026').click()
    await day(page, 'Wednesday, March 18, 2026').click()

    await expect(picked(page)).toHaveText('2026-03-02 to 2026-03-04, 2026-03-16 to 2026-03-18')
    await expect(day(page, 'Tuesday, March 3, 2026')).toHaveAttribute('data-range-middle', 'true')
    await expect(day(page, 'Tuesday, March 17, 2026')).toHaveAttribute('data-range-middle', 'true')
  })

  test('shows the month and the day it is handed, and tells the owner of a page, a pick and Escape', async ({
    page,
  }) => {
    await visitStory(page, 'calendar--controlled')
    await expect(day(page, 'Thursday, March 12, 2026')).toHaveAttribute('aria-selected', 'true')

    await page.getByRole('button', { name: 'Go to next month' }).click()
    await expect(header(page)).toHaveText('April 2026')
    await expect(picked(page)).toHaveText('2026-04-01 2026-03-12 dismissed 0')

    await page.getByRole('button', { name: 'June' }).click()
    await expect(header(page)).toHaveText('June 2026')

    await day(page, 'Monday, June 15, 2026').click()
    await expect(picked(page)).toHaveText('2026-06-01 2026-06-15 dismissed 0')

    await page.keyboard.press('Escape')
    await expect(picked(page)).toHaveText('2026-06-01 2026-06-15 dismissed 1')

    await page.getByRole('button', { name: 'Clear' }).click()
    await expect(day(page, 'Monday, June 15, 2026')).toHaveAttribute('aria-selected', 'false')
  })

  test('keeps six rows with fixedWeeks, and hides the days of the months either side', async ({ page }) => {
    await visitStory(page, 'calendar--fixed-weeks')

    await expect(page.locator('[data-slot="calendar-week"]')).toHaveCount(6)
    const outside = page.getByRole('gridcell', { name: 'Sunday, March 1, 2026', includeHidden: true })
    await expect(outside).toHaveAttribute('data-hidden', 'true')
    await expect(outside).toBeHidden()
    await expect(page.getByRole('gridcell', { name: 'Sunday, February 1, 2026' })).toBeVisible()
  })

  test('marks the grid and the picked days invalid', async ({ page }) => {
    await visitStory(page, 'calendar--invalid')

    await expect(page.getByRole('grid')).toHaveAttribute('data-invalid', 'true')
    await expect(day(page, 'Tuesday, March 10, 2026')).toHaveAttribute('aria-invalid', 'true')
    await expect(day(page, 'Wednesday, March 11, 2026')).toHaveAttribute('aria-invalid', 'true')
    await expect(day(page, 'Friday, March 13, 2026')).not.toHaveAttribute('aria-invalid', 'true')
  })
})
