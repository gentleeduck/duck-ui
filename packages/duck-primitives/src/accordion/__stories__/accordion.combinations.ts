export const TYPES = ['single', 'collapsible', 'multiple'] as const
export const ORIENTATIONS = ['vertical', 'horizontal'] as const
export const DIRECTIONS = ['ltr', 'rtl'] as const
export const MOTIONS = ['animated', 'static'] as const
export const MODES = ['unmount', 'force-mount', 'until-found'] as const

export const COMBINATIONS = TYPES.flatMap((type) =>
  ORIENTATIONS.flatMap((orientation) =>
    DIRECTIONS.flatMap((dir) =>
      MOTIONS.flatMap((motion) =>
        MODES.map((mode) => ({
          key: `${type}-${orientation}-${dir}-${motion}-${mode}`,
          type,
          orientation,
          dir,
          motion,
          mode,
        })),
      ),
    ),
  ),
)

export type ICombination = (typeof COMBINATIONS)[number]

export const COMBINATION_ITEMS = [
  { value: 'one', label: 'One', disabled: false },
  { value: 'two', label: 'Two', disabled: false },
  { value: 'three', label: 'Three', disabled: false },
  { value: 'four', label: 'Four', disabled: true },
] as const
