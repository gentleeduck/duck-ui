import { afterEach, describe, expect, test } from 'bun:test'
import { act, cleanup, fireEvent, render, renderHook } from '@testing-library/react'
import { LazyMotion, m } from 'motion/react'
import { loadDomAnimation } from '../motion-features'
import type { IUseMotionPresetOptions, MotionPresetName } from '../motion-presets'
import { useMotionPreset } from '../motion-presets'
import { createDirectionalPreset, createSlidePreset } from '../presets/directional'
import { fadeIn } from '../presets/fade-in'
import { popIn } from '../presets/pop-in'
import { rotateIn } from '../presets/rotate-in'
import { scaleIn } from '../presets/scale-in'
import { slideDown } from '../presets/slide-down'
import { slideFromLeft } from '../presets/slide-from-left'
import { slideFromRight } from '../presets/slide-from-right'
import { slideUp } from '../presets/slide-up'
import { springBouncy, springDefault } from '../transitions/springs'

const ALL_PRESETS: MotionPresetName[] = [
  'fadeIn',
  'scaleIn',
  'slideUp',
  'slideDown',
  'slideFromLeft',
  'slideFromRight',
  'rotateIn',
  'popIn',
]

describe('individual preset exports (tree-shakeable)', () => {
  test('fadeIn has opacity 0 to 1', () => {
    expect(fadeIn.initial.opacity).toBe(0)
    expect(fadeIn.animate.opacity).toBe(1)
  })

  test('scaleIn has asymmetric exit (0.9 not 0.95)', () => {
    expect(scaleIn.initial.scale).toBe(0.95)
    expect(scaleIn.exit.scale).toBe(0.9)
  })

  test('scaleIn has blur on initial and exit', () => {
    expect(scaleIn.initial.filter).toBe('blur(8px)')
    expect(scaleIn.exit.filter).toBe('blur(8px)')
  })

  test('slideUp has asymmetric offset (8px enter, 30px exit)', () => {
    expect(slideUp.initial.y).toBe(8)
    expect(slideUp.exit.y).toBe(30)
  })

  test('slideDown enters from -8 and exits to -30', () => {
    expect(slideDown.initial.y).toBe(-8)
    expect(slideDown.exit.y).toBe(-30)
  })

  test('slideFromLeft enters from 8px to the left and exits 30px back to the left', () => {
    expect(slideFromLeft.initial.x).toBe(-8)
    expect(slideFromLeft.exit.x).toBe(-30)
  })

  test('slideFromRight enters from 8px to the right and exits 30px back to the right', () => {
    expect(slideFromRight.initial.x).toBe(8)
    expect(slideFromRight.exit.x).toBe(30)
  })

  test('slide presets have light blur', () => {
    expect(slideUp.initial.filter).toBe('blur(4px)')
    expect(slideUp.exit.filter).toBe('blur(4px)')
  })

  test('slide presets do not introduce scale change (scale stays 1)', () => {
    expect(slideUp.initial.scale).toBe(1)
    expect(slideUp.animate.scale).toBe(1)
    expect(slideUp.exit.scale).toBe(1)
  })

  test('rotateIn initial has non-zero rotation', () => {
    expect(rotateIn.initial.rotate).not.toBe(0)
    expect(rotateIn.initial.rotate).not.toBeUndefined()
  })

  test('rotateIn exit has non-zero rotation (asymmetric)', () => {
    expect(rotateIn.exit.rotate).not.toBe(0)
    expect(rotateIn.exit.rotate).not.toBe(rotateIn.initial.rotate)
  })

  test('rotateIn initial has blur filter', () => {
    expect(rotateIn.initial.filter).toMatch(/blur\(\d+px\)/)
    expect(rotateIn.initial.filter).not.toBe('blur(0px)')
  })

  test('rotateIn animate is fully revealed (opacity 1, rotate 0)', () => {
    expect(rotateIn.animate.opacity).toBe(1)
    expect(rotateIn.animate.rotate).toBe(0)
  })

  test('popIn exit scale is 0', () => {
    expect(popIn.exit.scale).toBe(0)
  })

  test('popIn initial scale is less than animate scale', () => {
    expect(popIn.initial.scale as number).toBeLessThan(popIn.animate.scale as number)
  })

  test('popIn animate is fully visible', () => {
    expect(popIn.animate.opacity).toBe(1)
    expect(popIn.animate.scale).toBe(1)
  })
})

describe('createDirectionalPreset', () => {
  test('top direction offsets on y axis positively', () => {
    const preset = createDirectionalPreset('top')
    expect(preset.initial.y).toBe(8)
    expect(preset.exit.y).toBe(30)
  })

  test('bottom direction offsets on y axis negatively', () => {
    const preset = createDirectionalPreset('bottom')
    expect(preset.initial.y).toBe(-8)
    expect(preset.exit.y).toBe(-30)
  })

  test('left direction offsets on x axis positively', () => {
    const preset = createDirectionalPreset('left')
    expect(preset.initial.x).toBe(8)
    expect(preset.exit.x).toBe(30)
  })

  test('right direction offsets on x axis negatively', () => {
    const preset = createDirectionalPreset('right')
    expect(preset.initial.x).toBe(-8)
    expect(preset.exit.x).toBe(-30)
  })

  test('includes scale and blur', () => {
    const preset = createDirectionalPreset('top')
    expect(preset.initial.scale).toBe(0.95)
    expect(preset.exit.scale).toBe(0.9)
    expect(preset.initial.filter).toBe('blur(8px)')
  })

  test('custom offsets', () => {
    const preset = createDirectionalPreset('top', 12, 40, 6)
    expect(preset.initial.y).toBe(12)
    expect(preset.exit.y).toBe(40)
    expect(preset.initial.filter).toBe('blur(6px)')
  })
})

describe('createSlidePreset', () => {
  test('produces no scale change (scale 1 across states)', () => {
    const preset = createSlidePreset('top')
    expect(preset.initial.scale).toBe(1)
    expect(preset.animate.scale).toBe(1)
    expect(preset.exit.scale).toBe(1)
  })

  test('uses light blur (4px)', () => {
    const preset = createSlidePreset('top')
    expect(preset.initial.filter).toBe('blur(4px)')
    expect(preset.exit.filter).toBe('blur(4px)')
  })

  test('matches slideUp shape', () => {
    const preset = createSlidePreset('top')
    expect(preset.initial.y).toBe(slideUp.initial.y)
    expect(preset.exit.y).toBe(slideUp.exit.y)
  })
})

describe('useMotionPreset', () => {
  test('every preset returns initial, animate, exit, transition', () => {
    for (const name of ALL_PRESETS) {
      const { result } = renderHook(() => useMotionPreset(name))
      expect(result.current).toHaveProperty('initial')
      expect(result.current).toHaveProperty('animate')
      expect(result.current).toHaveProperty('exit')
      expect(result.current).toHaveProperty('transition')
    }
  })

  test('direction option overrides preset with directional values', () => {
    const { result } = renderHook(() => useMotionPreset('fadeIn', { direction: 'bottom' }))
    expect(result.current.initial.y).toBe(-8)
  })

  test('delay option adds delay to enter transition', () => {
    const { result } = renderHook(() => useMotionPreset('fadeIn', { delay: 0.05 }))
    const animateTransition = result.current.animate.transition as Record<string, unknown>
    expect(animateTransition.delay).toBe(0.05)
  })

  test('default transition is spring-based', () => {
    const { result } = renderHook(() => useMotionPreset('fadeIn'))
    expect(result.current.transition).toHaveProperty('type', 'spring')
  })

  test("a blur transition of the caller's own is kept, and only a spring one is damped", () => {
    const instant = { type: 'tween', duration: 0 } as const
    const springy = { type: 'spring', bounce: 0.6 } as const
    const { result: kept } = renderHook(() =>
      useMotionPreset('scaleIn', { transition: { ...springBouncy, filter: instant } }),
    )
    const { result: damped } = renderHook(() =>
      useMotionPreset('scaleIn', { transition: { ...springBouncy, filter: springy } }),
    )

    expect(kept.current.transition).toMatchObject({ filter: instant })
    expect(damped.current.transition).toMatchObject({ filter: { ...springy, bounce: 0 } })
  })

  test('tap keeps an axis a preset scales on its own, times the scale', () => {
    const mirrored = {
      initial: { scale: 0.5, scaleX: -1 },
      animate: { scale: 1, scaleX: -1 },
      exit: { scale: 0.5, scaleY: 2 },
    }
    const { result } = renderHook(() => useMotionPreset(mirrored, { tap: true }))

    expect(result.current.initial).toEqual({ scale: 1, scaleX: -0.5, scaleY: 0.5 })
    expect(result.current.animate).toMatchObject({ scale: 1, scaleX: -1, scaleY: 1 })
    expect(result.current.exit).toMatchObject({ scale: 1, scaleX: 0.5, scaleY: 1 })
  })
})

describe('useMotionPreset on an element', () => {
  afterEach(cleanup)

  function Box(options: IUseMotionPresetOptions) {
    const content = useMotionPreset(scaleIn, options)
    return (
      <LazyMotion features={loadDomAnimation}>
        <m.div animate={content.animate} data-testid="box" initial={content.initial} transition={content.transition} />
      </LazyMotion>
    )
  }

  const transformAfter = async (ms: number, options: IUseMotionPresetOptions) => {
    const { getByTestId } = render(<Box {...options} />)
    for (let step = 0; step < ms / 100; step++) await act(() => new Promise((resolve) => setTimeout(resolve, 100)))
    return getByTestId('box').style.transform
  }

  test('the delay holds the scale back with the rest of the entrance', async () => {
    expect(await transformAfter(300, { delay: 1 })).toBe('scale(0.95)')
  })

  test('tap keeps the entrance scale, held back by the delay, on scaleX and scaleY', async () => {
    expect(await transformAfter(300, { delay: 1, tap: true })).toBe('scaleX(0.95) scaleY(0.95)')
  })

  test('tap lets a press on scale release at once, apart from the entrance', async () => {
    function Pressable() {
      const content = useMotionPreset(scaleIn, { delay: 0.4, tap: true })
      return (
        <LazyMotion features={loadDomAnimation}>
          <m.button
            animate={content.animate}
            initial={content.initial}
            transition={content.transition}
            type="button"
            whileTap={{ scale: 0.5, transition: { duration: 0 } }}
          />
        </LazyMotion>
      )
    }
    const { getByRole } = render(<Pressable />)
    const button = getByRole('button')
    const wait = (ms: number) => act(() => new Promise((resolve) => setTimeout(resolve, ms)))
    // LazyMotion loads the press gesture after the first render.
    await wait(100)

    fireEvent.pointerDown(button, { button: 0, isPrimary: true, pointerType: 'mouse' })
    await wait(50)

    expect(button.style.transform).toBe('scale(0.5) scaleX(0.95) scaleY(0.95)')

    fireEvent.pointerUp(window, { button: 0, isPrimary: true, pointerType: 'mouse' })
    await wait(80)

    expect(button.style.transform).toBe('scaleX(0.95) scaleY(0.95)')
  })

  test.each([
    ['springBouncy', springBouncy],
    ['springDefault', springDefault],
  ])(
    '%s brings the blur to rest at zero without passing it, as a negative blur is no filter at all',
    async (_, transition) => {
      const radii: number[] = []
      function Blurred() {
        const content = useMotionPreset(scaleIn, { transition })
        return (
          <LazyMotion features={loadDomAnimation}>
            <m.div
              animate={content.animate}
              initial={content.initial}
              onUpdate={(latest) => radii.push(Number.parseFloat(String(latest.filter).slice('blur('.length)))}
              transition={content.transition}
            />
          </LazyMotion>
        )
      }

      render(<Blurred />)
      for (let step = 0; step < 8; step++) await act(() => new Promise((resolve) => setTimeout(resolve, 100)))

      expect(radii.length).toBeGreaterThan(5)
      expect(radii.filter((radius) => radius < 0)).toEqual([])
      expect(radii.at(-1)).toBe(0)
    },
  )
})
