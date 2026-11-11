import type { ICommand } from '@gentleduck/primitives/command'

/**
 * Props for the CommandBadge component (also used as CommandShortcut).
 * This component displays a badge that indicates the keyboard shortcut for a command.
 */
export interface ICommandBadgeProps extends React.HTMLProps<HTMLElement> {
  variant?: 'default' | 'secondary'
  /** The keyboard shortcut keys (e.g., "mod+k", which is Cmd on Mac and Ctrl elsewhere). */
  keys?: string
  /** Callback function that is invoked when the shortcut keys are pressed. */
  onKeysPressed?: () => void
}

/** What `CommandDialog` and `MotionCommandDialog` take beside the dialog's own props. */
export interface ICommandDialogProps
  extends Pick<
    ICommand.IProps,
    | 'shouldFilter'
    | 'loop'
    | 'filter'
    | 'vimBindings'
    | 'disablePointerSelection'
    | 'limit'
    | 'value'
    | 'defaultValue'
    | 'onValueChange'
  > {
  contentClassName?: string
  /** The dialog's title, read by screen readers. */
  title?: string
  /** The dialog's description, read by screen readers. */
  description?: string
}
