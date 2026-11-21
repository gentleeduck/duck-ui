}>
  duck-primitives use the `Presence` component to delay unmounting until CSS animations finish. No JavaScript animation library required.

## How animation works

duck-primitives use the `Presence` component to delay unmounting until CSS animations finish. This means you can use standard CSS `@keyframes` for enter/exit animations without any JavaScript animation library.

***

## CSS keyframes pattern

Define open and closed animations, then apply them via `data-state`:

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes scaleIn {
  from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
  to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}

@keyframes scaleOut {
  from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  to { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
}

.overlay[data-state="open"] { animation: fadeIn 200ms ease; }
.overlay[data-state="closed"] { animation: fadeOut 200ms ease; }

.content[data-state="open"] { animation: scaleIn 200ms ease; }
.content[data-state="closed"] { animation: scaleOut 200ms ease; }
```

}>
  Presence waits on the `finished` promise of every CSS animation the content runs as it closes, read from `element.getAnimations()`, and unmounts once the last of them ends. Make sure you define both open **and** closed animations  -  without a closed animation, or with one whose `@keyframes` are missing, Presence unmounts immediately. Where the browser has no `getAnimations()`, as in jsdom, content leaves at once.

***

## Tailwind CSS

```tsx
<Dialog.Overlay className="
  fixed inset-0 bg-black/50
  data-[state=open]:animate-in data-[state=open]:fade-in-0
  data-[state=closed]:animate-out data-[state=closed]:fade-out-0
" />

<Dialog.Content className="
  fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
  data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95
  data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95
" />
```

}>
  Requires the `tailwindcss-animate` plugin for `animate-in` / `animate-out` utilities.

***

## The `forceMount` escape hatch

If you want to control animation entirely yourself (e.g., with Framer Motion), use `forceMount` on Portal, Overlay, and Content to keep them always mounted:

```tsx
<Dialog.Portal forceMount>
  <Dialog.Overlay forceMount asChild>
    <motion.div
      animate={open ? { opacity: 1 } : { opacity: 0 }}
      initial={{ opacity: 0 }}
    />
  </Dialog.Overlay>
  <Dialog.Content forceMount asChild>
    <motion.div
      animate={open ? { scale: 1, opacity: 1 } : { scale: 0.95, opacity: 0 }}
    />
  </Dialog.Content>
</Dialog.Portal>
```

***

## Presence render function

For conditional class application without forceMount:

```tsx
<Presence present={isOpen}>
  {({ present }) => (
    <div className={present ? 'slide-in' : 'slide-out'}>
      Sidebar content
    </div>
  )}
</Presence>
```

***

## Tips

}>
  * Always define both open and closed animations. Without a closed animation, Presence unmounts immediately.
  * Keep animations short (150-300ms) for responsive UI. Longer animations feel sluggish.
  * Use `ease` or `cubic-bezier` timing functions. `linear` looks mechanical.
  * Test with reduced motion preferences: `@media (prefers-reduced-motion: reduce) { ... }`