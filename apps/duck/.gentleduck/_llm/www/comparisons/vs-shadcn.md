## Quick comparison

| | gentleduck/ui | shadcn/ui |
|---|---|---|
| **Styled components** | 57 | 50+ |
| **Primitives** | Own (`@gentleduck/primitives`, 23 components) | Radix UI (external dependency) |
| **Blocks** | 6 categories (auth, dashboard, calendar, charts, blog, sidebar) | 6 categories |
| **Calendar** | Own engine (`@gentleduck/calendar`, 9.7 KB as a calendar, 0 deps) | react-day-picker (20.0 KB with date-fns) |
| **Variant system** | `@gentleduck/variants` (cva with memoization) | class-variance-authority |
| **Motion / Animation** | `@gentleduck/motion` (tokens + reduced-motion) | None |
| **Keyboard engine** | `@gentleduck/vim` (bindings, sequences, recorder) | None |
| **State management** | `@gentleduck/state` (atom-based) | None |
| **CLI commands** | `init`, `add`, `diff`, `update`, `remove`, `list` | `init`, `add`, `diff` |
| **Source ownership** | Full stack (primitives + components) | Components only (primitives are in node\_modules) |
| **Styling** | Tailwind + `cn()` + `data-*` state selectors | Tailwind + `cn()` |
| **TypeScript** | Full type safety | Full type safety |
| **React** | 18+ | 18+ |

***

## Same foundation, more depth

Both projects share the same core idea: components are copied into your project, not installed as dependencies. You own the code. You can modify anything. The CLI scaffolds components the same way.

```bash
# shadcn
npx shadcn@latest add button

# gentleduck
npx gentleduck add button
```

Both use Tailwind for styling, `cn()` for class merging, CSS variables for theming, and the Root / Trigger / Content compound pattern for complex components. The JSX is nearly identical. If you know shadcn, you already know gentleduck.

The difference is what happens underneath.

***

## What shadcn depends on, gentleduck owns

### Primitives

shadcn/ui imports Radix UI from node\_modules. You own the styled layer, but the accessibility, focus management, dismiss behavior, and animation logic live in packages you cannot modify. When Radix ships a breaking change or deprecates an API, your components break and you wait for a fix.

gentleduck/ui uses `@gentleduck/primitives` - 23 headless components with the same compound-component API as Radix, each 1% to 67% smaller gzipped. You own the source. Modify focus trapping, dismiss behavior, or animation hooks directly.

See the [full primitives comparison](/www/comparisons/vs-radix).

### Calendar

shadcn/ui wraps react-day-picker, which pulls in date-fns. That is 20.0 KB gzipped for a single calendar system (Gregorian).

gentleduck/ui uses `@gentleduck/calendar` - 9.7 KB gzipped for a whole calendar and 5.8 KB for the hook alone, with zero required dependencies. The adapter pattern lets you use native Date, date-fns, dayjs, or luxon without changing your components. Non-Gregorian calendars (Islamic, Persian, Hebrew) work through pluggable adapters. No other copy-paste component library ships this.

See the [full calendar comparison](/www/comparisons/vs-react-day-picker).

### Keyboard engine

`@gentleduck/vim` provides key bindings, multi-key sequences (vim-style), macro recording, and platform-aware formatting (`Cmd` on Mac, `Ctrl` elsewhere). shadcn/ui has no keyboard abstraction - you wire up event listeners manually.

```tsx
import { useKeymap } from '@gentleduck/vim/react'

useKeymap({
  'Mod+k': () => openCommandPalette(),
  'Mod+s': () => save(),
  'g g': () => scrollToTop(),
})
```

### Animation tokens

`@gentleduck/motion` provides prebuilt animation keyframes and a reduced-motion system that integrates with the Presence primitive. Animations respect `prefers-reduced-motion` automatically. shadcn/ui leaves animation to you.

### State management

`@gentleduck/state` provides an atom-based state management system for component-level and app-level state. shadcn/ui does not include state tooling.

### CLI

| Feature | gentleduck | shadcn |
|---|---|---|
| `init` | Yes | Yes |
| `add` | Yes | Yes |
| `diff` (view changes) | Yes, with interactive TUI | Yes |
| `list` (installed components) | Yes | No |
| `update` (pull latest + merge) | Yes, with interactive merge TUI | No |
| `remove` (clean uninstall) | Yes | No |
| Template scaffolding | `--template` flag for full project scaffold | No |
| Monorepo support | `--monorepo` flag, workspace-aware config | No |
| Interactive merge TUI | Hunk-by-hunk resolution with vim keys | No |
| Syntax-highlighted diffs | Side-by-side terminal view | No |

The `update` command is the standout. When you update a component, it detects your local modifications and launches an interactive merge screen in your terminal. You see each change as a hunk and choose per-hunk: keep your version (1), take the registry version (2), or keep both (3). Navigate with vim keys (h/l between files, j/k between hunks), preview the merged result before writing, and confirm with Enter. No manual conflict resolution. No git merge markers.

`remove` cleanly deletes a component and its unused dependencies. `list` shows every available component with its install status. `diff` shows what changed between your local copy and the latest registry version in a syntax-highlighted side-by-side TUI.

***

## shadcn ecosystem compatibility

gentleduck/ui is structurally compatible with the shadcn ecosystem. Same component names, same compound patterns, same Tailwind approach, same CSS variable theming. Any shadcn template, block, or third-party integration works with gentleduck - you swap the base component imports and everything else stays the same.

This means you do not lose access to the shadcn ecosystem by switching. You gain a deeper stack underneath it.

***

## Same components, more features

Every gentleduck component is a drop-in replacement for its shadcn equivalent. Same JSX, same props, same Tailwind classes. The difference is what you get for free.

### Button

shadcn ships a basic button with variant and size props. gentleduck adds:

| Feature | gentleduck | shadcn |
|---|---|---|
| Loading state with spinner | `loading` prop, auto-disables | Manual implementation |
| Icon placement | `icon` and `secondIcon` props | Manual children |
| Collapsed mode | `isCollapsed` for sidebar toggles | Manual implementation |
| Animated icon | `AnimationIcon` with slide/fade on hover | Not available |
| Border variants | `border` prop (primary, destructive, warning) | Not available |
| Dashed variant | `variant="dashed"` | Not available |
| Extra sizes | `icon-lg`, `icon-sm` | Not available |

```tsx
// shadcn: you build loading state yourself
<Button disabled={isLoading}>
  {isLoading ? <Loader className="animate-spin" /> : null}
  {isLoading ? 'Saving...' : 'Save'}
</Button>

// gentleduck: one prop
<Button loading={isLoading} icon={<Save />}>Save</Button>
```

### Dialog

shadcn ships a basic dialog. gentleduck adds a `DialogResponsive` variant that automatically switches between Dialog on desktop and Drawer on mobile at 768px. No media query code. No conditional rendering. One component.

```tsx
// shadcn: you build responsive behavior yourself
const isDesktop = useMediaQuery('(min-width: 768px)')
return isDesktop ? <Dialog>...</Dialog> : <Drawer>...</Drawer>

// gentleduck: built-in
<DialogResponsive>
  <DialogTriggerResponsive>Open</DialogTriggerResponsive>
  <DialogContentResponsive>
    {/* Same content, renders as Dialog or Drawer automatically */}
  </DialogContentResponsive>
</DialogResponsive>
```

### Calendar

shadcn wraps react-day-picker (20.0 KB with date-fns). gentleduck ships a full calendar at 9.7 KB with zero dependencies:

| Feature | gentleduck | shadcn |
|---|---|---|
| Bundle size | 9.7 KB gzipped | 20.0 KB gzipped, date-fns included |
| Calendar systems | 4 (Gregorian, Islamic, Persian, Hebrew) | Gregorian, or another through a `dateLib` you supply |
| Date adapters | 7 (Native, date-fns, dayjs, luxon, + 3 calendar-specific) | date-fns, overridable through `dateLib` |
| Selection modes | Single, range, multi | Single, range, multi |
| Render props | `renderDay`, `renderHeader`, `renderWeekday`, `renderFooter` | Limited |
| Month/year dropdowns | `showDropdowns` prop | Manual implementation |
| Multiple months | `numberOfMonths` prop | `numberOfMonths` prop |
| Locale/RTL | Full i18n with Arabic numerals, Persian text | Basic locale |

### Combobox

shadcn documents a combobox pattern using Command + Popover manually. gentleduck ships a dedicated `Combobox` component:

| Feature | gentleduck | shadcn |
|---|---|---|
| Single + multi select | Generic type for both modes | Manual implementation |
| Search filtering | `withSearch` prop | Manual Command integration |
| Selected item display | Badges with "+N Selected" truncation | Manual implementation |
| RTL support | Built-in `dir` prop | Not available |

### InputGroup and ButtonGroup

These components do not exist in shadcn at all.

**InputGroup** provides addon slots (icons, buttons, labels) that attach to inputs with proper focus delegation - clicking the addon focuses the input. Supports inline-start, inline-end, block-start, block-end positions. Error states cascade from input to the group wrapper automatically.

**ButtonGroup** provides horizontal/vertical grouping with separators and text labels, with full RTL support.

### Tooltip

gentleduck's tooltip supports `disableCloseOnClick` for wrapping interactive elements like toggles. In shadcn, putting a tooltip on a toggle button causes the tooltip to intercept the click and close instead of toggling. gentleduck solves this at the primitive level.

### Sidebar

Both ship a sidebar component. gentleduck adds:

| Feature | gentleduck | shadcn |
|---|---|---|
| Collapse modes | `offcanvas`, `icon`, `none` | `offcanvas`, `icon`, `none` |
| Cookie persistence | Auto-saves state to cookies | Auto-saves state to cookies |
| Keyboard shortcut | Cmd/Ctrl+B toggles sidebar | Cmd/Ctrl+B toggles sidebar |
| RTL support | Built-in `side` + `dir` props | `side` prop |
| Mobile sheet | Auto-switches to Sheet on mobile | Auto-switches to Sheet on mobile |

The sidebar implementations are nearly identical. This is an example of where shadcn got it right and gentleduck matches the behavior while running on lighter primitives underneath.

***

## Code comparison

The same Button component in both:

### shadcn/ui

```tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Slot } from '@radix-ui/react-slot'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium ...',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        outline: 'border border-input bg-background hover:bg-accent',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  },
)
```

### gentleduck/ui

```tsx
import { cva } from '@gentleduck/variants'
import { cn } from '@gentleduck/libs/cn'
import { Slot, Slottable } from '@gentleduck/primitives/slot'

const buttonVariants = cva(
  'relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 ...',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
        outline: 'border border-input bg-background shadow-xs hover:bg-accent',
        destructive: 'bg-destructive/90 text-destructive-foreground shadow-xs hover:bg-destructive/70',
        ghost: 'text-accent-foreground hover:bg-accent',
        link: 'text-primary underline-offset-4 hover:underline',
        dashed: 'border border-input border-dashed bg-background shadow-xs hover:bg-accent/50',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 px-6 has-[>svg]:px-4',
        icon: 'size-9',
      },
      border: {
        default: '',
        primary: 'border border-border/40 hover:border-border/80',
        destructive: 'border border-destructive/40 bg-destructive/40 hover:border-destructive',
      },
    },
    defaultVariants: { variant: 'default', size: 'default', border: 'default' },
  },
)

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant, size, border, asChild, className, loading, icon, ...props }, ref) => {
    const Comp = (asChild ? Slot : 'button') as React.ElementType
    return (
      <Comp
        data-slot="button"
        className={cn(buttonVariants({ border, variant, size, className }))}
        disabled={loading || props.disabled}
        ref={ref}
        {...props}>
        {loading ? <Loader className="animate-spin motion-reduce:animate-none" /> : icon}
        <Slottable>{children}</Slottable>
      </Comp>
    )
  },
)
Button.displayName = 'Button'
```

The gentleduck Button ships with more: a `loading` state with spinner, `icon` prop, `border` variant dimension, `dashed` and `warning` variants, and `Slottable` for proper `asChild` content projection. The `cva` API is the same but `@gentleduck/variants` adds memoization - repeated calls with the same props return a cached result. The `data-slot` attribute enables parent-scoped styling without fragile descendant selectors.

***

## Migration

Migration is incremental. Both component sets coexist in the same project. Replace one at a time.

### 1. Install and initialize

```bash
npm install -D @gentleduck/cli
npx gentleduck init
```

### 2. Replace components one by one

```bash
npx gentleduck add button
npx gentleduck add dialog
npx gentleduck add calendar
```

Each gentleduck component drops in where the shadcn equivalent was. Same props, same patterns, same Tailwind classes.

### 3. Remove Radix dependencies as they become unused

```bash
npm uninstall @radix-ui/react-dialog @radix-ui/react-popover
```

### 4. Swap cva import

```diff
- import { cva } from 'class-variance-authority'
+ import { cva } from '@gentleduck/variants'
```

Same API. No code changes needed beyond the import path.

***

## Why teams switch

A smaller bundle, immediately. The calendar drops from 20.0 KB to 9.7 KB. Each primitive is 1% to 67% lighter than its Radix equivalent. The variant system adds memoization. These land the moment you swap a component, with no refactoring.

The full stack is yours. With shadcn, you own the styled layer but depend on Radix for behavior. With gentleduck, you own primitives, calendar, keyboard engine, motion tokens, and state management. When something breaks, you fix it in your repo instead of filing an issue and waiting.

You get more in the box. A keyboard command system, animation tokens with automatic reduced-motion support, an atom-based state manager, and a CLI that can update, remove, and list components - not just add them.

You keep the shadcn ecosystem. Templates, blocks, and third-party integrations built for shadcn work with gentleduck because the component structure is the same. Switching does not mean starting over.