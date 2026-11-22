---
'@gentleduck/motion': minor
---

The presets move the way they are named and settle cleanly.

- `slideFromLeft` and `slideFromRight` come in from the sides they name, where they came from the opposite ones.
- The blur settles on its own critically damped spring, where a spring carried it past zero to an invalid radius, and a transition's own blur is kept.
- With `tap`, the entrance scales on `scaleX` and `scaleY` and leaves `scale` to the press, so a press releases at once.
- `useMotionRoot` lets a close through when it lands in the frame an open from closed does, so a select picked straight after opening closes.
