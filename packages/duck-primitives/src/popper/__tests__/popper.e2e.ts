import { expect, type Locator, type Page, test } from '@playwright/test'
import { visitStoryById } from '../../__tests__/e2e-helpers'

type Box = { x: number; y: number; width: number; height: number }

async function box(locator: Locator): Promise<Box> {
  const found = await locator.boundingBox()
  if (!found) throw new Error('The element has no box.')
  return found
}

const right = (of: Box) => of.x + of.width
const bottom = (of: Box) => of.y + of.height
const middleX = (of: Box) => of.x + of.width / 2
const middleY = (of: Box) => of.y + of.height / 2
const near = (a: number, b: number) => Math.abs(a - b) <= 1
const px = (value: number) => Math.round(value) || 0

async function visit(page: Page, story: string) {
  await visitStoryById(page, `utilities-popper--${story}`)
}

async function choose(page: Page, group: string, option: string) {
  await page.getByRole('group', { name: group }).getByRole('radio', { exact: true, name: option }).check()
}

async function settled(content: Locator) {
  await expect(content).toBeVisible()
  await content.evaluate((element) => Promise.all(element.getAnimations().map((animation) => animation.finished)))
}

const anchor = (page: Page) => page.getByTestId('anchor')
const content = (page: Page) => page.getByTestId('content')
const arrow = (page: Page) => page.getByTestId('arrow')

// Each side: where the content sits against the anchor, and where the arrow sits between them, touching the content
// and centred on the anchor.
const placements: Record<string, (content: Box, anchor: Box, arrow: Box) => boolean[]> = {
  top: (c, a, r) => [
    near(a.y - bottom(c), 14),
    near(r.y, bottom(c)),
    near(bottom(r), a.y - 8),
    near(middleX(r), middleX(a)),
  ],
  right: (c, a, r) => [
    near(c.x - right(a), 14),
    near(right(r), c.x),
    near(r.x, right(a) + 8),
    near(middleY(r), middleY(a)),
  ],
  bottom: (c, a, r) => [
    near(c.y - bottom(a), 14),
    near(bottom(r), c.y),
    near(r.y, bottom(a) + 8),
    near(middleX(r), middleX(a)),
  ],
  left: (c, a, r) => [
    near(a.x - right(c), 14),
    near(r.x, right(c)),
    near(right(r), a.x - 8),
    near(middleY(r), middleY(a)),
  ],
}

test.describe('Popper placement', () => {
  for (const [side, check] of Object.entries(placements)) {
    test(`opens on the ${side} of its anchor, its arrow between them pointing at the anchor`, async ({ page }) => {
      await visit(page, 'placement')
      await choose(page, 'Side', side)

      await expect
        .poll(async () => check(await box(content(page)), await box(anchor(page)), await box(arrow(page))))
        .toEqual([true, true, true, true])
      await expect(anchor(page)).toHaveAttribute('data-popper-side', side)
    })
  }

  test('lines its start or end up with the anchor, moved along by its align offset', async ({ page }) => {
    await visit(page, 'placement')
    const edges = async () => {
      const [c, a] = [await box(content(page)), await box(anchor(page))]
      return [c.x - a.x, right(c) - right(a)].map(px)
    }

    await choose(page, 'Align', 'start')
    await expect.poll(edges).toEqual([0, expect.any(Number)])
    await expect(anchor(page)).toHaveAttribute('data-popper-align', 'start')
    await page.getByLabel('Align offset').fill('10')
    await expect.poll(async () => (await edges())[0]).toBe(10)
    await page.getByLabel('Align offset').fill('0')
    await choose(page, 'Align', 'end')
    await expect.poll(async () => (await edges())[1]).toBe(0)
  })

  test('stands off by its side offset plus the arrow', async ({ page }) => {
    await visit(page, 'placement')

    await page.getByLabel('Side offset').fill('20')

    await expect.poll(async () => px((await box(content(page))).y - bottom(await box(anchor(page))))).toBe(26)
  })

  test('mirrors left and right, and lines its start up with the right edge, right to left', async ({ page }) => {
    await visit(page, 'placement')
    await page.getByRole('checkbox', { name: 'Right to left' }).check()

    await choose(page, 'Align', 'start')
    await expect.poll(async () => near(right(await box(content(page))), right(await box(anchor(page))))).toBe(true)
    await choose(page, 'Side', 'left')
    await expect.poll(async () => (await box(content(page))).x >= right(await box(anchor(page)))).toBe(true)
    await expect(anchor(page)).toHaveAttribute('data-popper-side', 'right')
  })
})

test.describe('Popper resizing', () => {
  test('centres itself on its anchor again when either changes size', async ({ page }) => {
    await visit(page, 'placement')
    const offCentre = async () => px(middleX(await box(content(page))) - middleX(await box(anchor(page))))
    await expect.poll(offCentre).toBe(0)

    await anchor(page).evaluate((element: HTMLElement) => {
      element.style.width = '240px'
    })
    await expect.poll(offCentre).toBe(0)

    await content(page).evaluate((element) => {
      element.append(', and then a good deal longer')
    })
    await expect.poll(offCentre).toBe(0)
  })
})

test.describe('Popper collisions', () => {
  test.beforeEach(async ({ page }) => {
    await visit(page, 'collisions')
  })

  test('flips to the other side when it does not fit, unless told not to avoid collisions', async ({ page }) => {
    await choose(page, 'Anchor at', 'bottom edge')
    await expect.poll(async () => near(bottom(await box(content(page))), (await box(anchor(page))).y)).toBe(true)
    await expect(anchor(page)).toHaveAttribute('data-popper-side', 'top')

    await page.getByRole('checkbox', { name: 'Avoid collisions' }).uncheck()

    await expect
      .poll(async () => bottom(await box(content(page))) > bottom(await box(page.getByTestId('boundary'))))
      .toBe(true)
    await expect(anchor(page)).toHaveAttribute('data-popper-side', 'bottom')
  })

  test('shifts to stay inside the box, keeping its collision padding from the edge', async ({ page }) => {
    const gap = async () => px(right(await box(page.getByTestId('boundary'))) - right(await box(content(page))))
    await choose(page, 'Anchor at', 'right edge')
    await expect.poll(gap).toBe(0)

    await page.getByLabel('Collision padding').fill('16')

    await expect.poll(gap).toBe(16)
  })

  test('goes with an anchor that has left the box, or stays inside when sticky is always', async ({ page }) => {
    const past = async () => right(await box(content(page))) - right(await box(page.getByTestId('boundary')))
    await choose(page, 'Anchor at', 'past right edge')
    await expect.poll(past).toBeGreaterThan(1)

    await page.getByRole('checkbox', { name: 'Sticky always' }).check()

    await expect.poll(async () => px(await past())).toBe(0)
  })

  test('shifts along its own side instead of flipping when told to', async ({ page }) => {
    await choose(page, 'Side', 'right')
    await choose(page, 'Anchor at', 'right edge')
    await expect(anchor(page)).toHaveAttribute('data-popper-side', 'left')

    await page.getByRole('checkbox', { name: 'Shift cross axis' }).check()

    await expect(anchor(page)).toHaveAttribute('data-popper-side', 'right')
    await expect
      .poll(async () => px(right(await box(page.getByTestId('boundary'))) - right(await box(content(page)))))
      .toBe(0)
  })
})

test.describe('Popper arrow', () => {
  test.beforeEach(async ({ page }) => {
    await visit(page, 'arrow')
  })

  test('slides the content over to keep its padding and still point at the anchor', async ({ page }) => {
    const offsets = async () => {
      const [c, a, r] = [await box(content(page)), await box(anchor(page)), await box(arrow(page))]
      return [px(a.x - c.x), px(middleX(r) - middleX(a))]
    }
    await expect.poll(offsets).toEqual([0, 0])

    await page.getByLabel('Arrow padding').fill('12')

    await expect.poll(offsets).toEqual([8, 0])
    await expect(arrow(page)).toBeVisible()
  })

  test('hides once it cannot point at the middle of the anchor', async ({ page }) => {
    await page.getByRole('checkbox', { name: 'Wide anchor' }).check()

    await expect(arrow(page)).toBeHidden()
  })
})

test.describe('Popper virtual anchor', () => {
  test('follows the pointer every frame', async ({ page }) => {
    await visit(page, 'follows-pointer')
    const area = await box(page.getByTestId('area'))

    for (const [x, y] of [
      [area.x + 40, area.y + 60],
      [area.x + 200, area.y + 150],
    ] as const) {
      await page.mouse.move(x, y)
      await expect
        .poll(async () => {
          const c = await box(content(page))
          return [px(c.x - x), px(middleY(c) - y)]
        })
        .toEqual([8, 0])
    }
  })
})

test.describe('Popper animated', () => {
  for (const [side, origin] of Object.entries({
    top: (c: Box, a: Box) => [middleX(a) - c.x, c.height + 6],
    right: (c: Box, a: Box) => [-6, middleY(a) - c.y],
    bottom: (c: Box, a: Box) => [middleX(a) - c.x, -6],
    left: (c: Box, a: Box) => [c.width + 6, middleY(a) - c.y],
  })) {
    test(`runs the animation in its style once placed, growing from the arrow on the ${side}`, async ({ page }) => {
      await visit(page, 'animated')
      await choose(page, 'Side', side)

      await page.getByRole('checkbox', { name: 'Open' }).check()

      await expect(content(page)).toHaveCSS('animation-name', 'popper-story-grow')
      await settled(content(page))
      const [c, a] = [await box(content(page)), await box(anchor(page))]
      const grows = await content(page).evaluate((element) => getComputedStyle(element).transformOrigin)
      const [x, y] = grows.split(' ').map(Number.parseFloat)
      const [expectedX, expectedY] = origin(c, a)
      expect([x, y, near(x, expectedX), near(y, expectedY)]).toEqual([x, y, true, true])
    })
  }
})

test.describe('Popper available size', () => {
  test('fits the room left below its anchor at the width of the anchor, scrolling the rest', async ({ page }) => {
    await visit(page, 'available-size')
    const viewport = page.viewportSize()!

    const [c, a] = [await box(content(page)), await box(anchor(page))]

    expect([px(c.width - a.width), px(viewport.height - bottom(a) - 4 - c.height)]).toEqual([0, 0])
    expect(await content(page).evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true)
  })
})
