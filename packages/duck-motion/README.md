<p align="center">
  <img src="../../public/logo-dark.svg" alt="@gentleduck/motion" width="120"/>
</p>

<h1 align="center">@gentleduck/motion</h1>

<p align="center">
  Motion primitives for gentleduck/ui components.
</p>

<p align="center">
  <a href="../../LICENSE">MIT</a> -
  <a href="../../CHANGELOG.md">Changelog</a> -
  <a href="../../CONTRIBUTING.md">Contributing</a> -
  <a href="https://gentleduck.org/duck-ui">Docs</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@gentleduck/motion"><img src="https://img.shields.io/npm/v/@gentleduck/motion.svg" alt="npm"/></a>
  <a href="https://www.npmjs.com/package/@gentleduck/motion"><img src="https://img.shields.io/npm/dm/@gentleduck/motion.svg" alt="downloads"/></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/npm/l/@gentleduck/motion.svg" alt="MIT"/></a>
</p>

---

Animation tokens, presets, and reduced motion support for the gentleduck ecosystem. Optionally integrates with the motion library for rich enter/exit animations.

## Quick Start

```bash
bun add @gentleduck/motion
```

```tsx
import { useDuckReducedMotion, motionTransition } from '@gentleduck/motion'

function Fade() {
  const reduced = useDuckReducedMotion()
  const transition = motionTransition(reduced, { duration: 200, easing: 'ease-out' })
  // ...
}
```

## Features

- **Easing presets** -- `duckMotionEasing.standard`, `.exit`, `.expo`, `.easeOut`, `.spring`
- **Duration tokens** -- `duckMotionDurationMs.fast` (150ms), `.normal` (200ms), `.slow` (300ms), `.exit` (180ms fallback)
- **Spring transitions** -- `springDefault`, `springSnappy`, `springGentle`, `springBouncy`, `springStiff`, `springSmooth`, `springInstant`
- **CSS custom properties** -- `--gentleduck-motion-dur`, `--gentleduck-motion-ease` via `@gentleduck/motion/css`
- **Reduced motion** -- `useDuckReducedMotion()`, `motionTransition()`
- **Animation presets** -- tree-shakeable presets like `fadeIn`, `scaleIn`, `slideUp` with blur and asymmetric exits; under a spring the blur settles at zero without bouncing past it
- **Directional presets** -- `createDirectionalPreset('bottom')` for menu/popover animations; `createSlidePreset` for pure slides
- **Motion library integration** -- `MotionProvider`, `LazyMotion` feature loaders, `useMotionPreset` hook

## Exports

| Entry point | What it provides |
| --- | --- |
| `@gentleduck/motion` | Tokens, easing, reduced motion hooks, CVA animation variants |
| `@gentleduck/motion/css` | CSS file with motion custom properties and reduced motion fallback |
| `@gentleduck/motion/transitions` | Duration/easing mapped to motion Transition objects, spring presets |
| `@gentleduck/motion/motion-presets` | `useMotionPreset` hook |
| `@gentleduck/motion/motion-features` | `loadDomAnimation`, `loadDomMax` LazyMotion feature loaders |
| `@gentleduck/motion/motion-provider` | `MotionProvider` wrapping LazyMotion + MotionConfig |
| `@gentleduck/motion/presets` | Individual tree-shakeable preset exports (`fadeIn`, `scaleIn`, etc.) |
| `@gentleduck/motion/presets/fade-in` | Single preset import for best tree-shaking |

## License

MIT
