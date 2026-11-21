}>
  **Lesson 3 of 10**: `asChild` is the key to integrating primitives with your design-system components.

## Why `asChild` matters

Without `asChild`, you either accept default HTML nodes or add wrappers that hurt semantics and styling.

With `asChild`, primitives attach behavior to your element directly.

```tsx
<Dialog.Trigger asChild>
  <a href="#" className="inline-flex items-center">Open</a>
</Dialog.Trigger>
```

***

## Merge contract

When `asChild` is enabled:

* primitive and child event handlers compose,
* refs compose,
* class/style merge,
* ARIA/data attributes attach to child.

This keeps behavior while preserving your visual control.

***

## Ref-forwarding requirement

Custom child components must forward refs.

```tsx
const ActionButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => <button ref={ref} className={className} {...props} />,
)
ActionButton.displayName = 'ActionButton'
```

Then:

```tsx
<Dialog.Trigger asChild>
  <ActionButton>Open</ActionButton>
</Dialog.Trigger>
```

***

## Common failure modes

1. Text or several children under `asChild`, which throws an error naming the primitive.
2. Child component that drops incoming props.
3. Child component that does not forward ref.
4. Overriding `onClick` and forgetting composed behavior.

If trigger behavior disappears, inspect rendered element and ensure primitive props are present.

***

## Building your own `asChild` API

Use `Slot` for custom primitives:

```tsx
import { Slot } from '@gentleduck/primitives/slot'

function Box({ asChild, ...props }: { asChild?: boolean } & React.ComponentProps<'div'>) {
  const Comp = asChild ? Slot : 'div'
  return <Comp {...props} />
}
```

This aligns your custom components with library conventions.

***

## Lab

1. Convert `Dialog.Trigger` and `Dialog.Close` to design-system buttons via `asChild`.
2. Replace trigger with a link and verify ARIA/data attributes still apply.
3. Intentionally break ref forwarding and observe behavior, then fix it.

}>
  Next: [Lesson 4 - Popover and Positioning](/duck-primitives/course/04-popover)