---
'@gentleduck/registry-ui': major
---

Every styled component is rebuilt on the reworked primitives and takes their new props. Coverage is 100%, and each prop a component's docs page lists has an example.

**Added**

- The dialog, sheet, alert dialog, context menu and menubar contents take `container`, so they portal into an element of your own, such as one carrying another theme.
- Select draws one highlight that slides to each item taking focus. Command adds `CommandLoading`, `CommandStatus` and an exported `MotionCommandDialog`, with `useCommandState` and `fuzzyFilter`.
- Checkbox takes `indeterminateIndicator`, calendar takes `weekStartDay`, `showWeekNumber`, `pageBehavior`, `unavailable`, `readOnly` and `invalid`, and accordion items take `onOpenChange`.
- A dialog, sheet or alert dialog kept mounted with `forceMount` stays in the page while closed, its overlay letting presses through.

**Breaking**

- A checkbox given `checked` without `onCheckedChange` no longer moves on a click, and a subtask's `checked` in `CheckboxGroup` is where it starts.
- Progress `value` is optional, with `null` indeterminate, and the fill sizes by `width`.
- The hover card takes `openDelay` and `side` where it took `delayDuration` and `placement`, and `HoverCardPlacementContext` holds a side, never `undefined`.
- `useCommandListContext` is gone; read the search with `useCommandSearch()`. The command input wrapper's slot is `command-input-wrapper`, and the combobox's props are a union on `type`.
- `withMotion` takes `stagger` where it took `optionsFromProps`.
- `AvatarImage` carries `data-slot="avatar-image"`, `Collapsible` carries a `dir` only when given one, and `InputOTPSeparator` drops `customIndicator`.
- `ICalendarHeaderProps.adapter` is required, and the unused `_audio` folder is gone.
