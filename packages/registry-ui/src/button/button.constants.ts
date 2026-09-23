import { cva } from '@gentleduck/variants'

export const buttonVariants = cva(
  "relative inline-flex shrink-0 cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium text-sm outline-none transition-all focus-visible:border-ring focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",

  {
    defaultVariants: {
      border: 'default',
      size: 'default',
      variant: 'default',
    },
    variants: {
      border: {
        default: '',
        destructive: 'border border-destructive/40 bg-destructive/40 hover:border-destructive hover:bg-destructive/65',
        primary: 'border border-border/40 hover:border-border/80',
        secondary: 'border border-secondary/40 bg-secondary/40 hover:border-secondary hover:bg-secondary/65',
        warning: 'border border-warning/40 bg-warning/40 hover:border-warning hover:bg-warning/65',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        icon: 'size-9',
        'icon-lg': 'size-10',
        'icon-sm': 'size-8',
        lg: 'h-10 px-6 has-[>svg]:px-4',
        sm: 'h-8 gap-1.5 px-3 has-[>svg]:px-2.5',
      },
      variant: {
        dashed:
          'border border-input border-dashed bg-background text-accent-foreground shadow-xs hover:bg-accent/50 hover:text-accent-foreground',
        default: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
        destructive: 'bg-destructive/90 text-destructive-foreground shadow-xs hover:bg-destructive/70',
        expandIcon: 'group relative bg-primary text-primary-foreground hover:bg-primary/90',
        ghost: 'text-accent-foreground hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        nothing: '',
        outline:
          'border border-input bg-background text-accent-foreground shadow-xs hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
        warning: 'bg-warning/90 text-warning-foreground shadow-xs hover:bg-warning/70',
      },
    },
  },
)
