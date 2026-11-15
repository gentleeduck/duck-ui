import { cva } from '@gentleduck/variants'

export const fieldVariants = cva('group/field flex w-full gap-3 data-[invalid=true]:text-destructive', {
  defaultVariants: {
    orientation: 'vertical',
  },
  variants: {
    orientation: {
      horizontal: [
        'flex-row items-center',
        '[&>[data-slot=field-label]]:flex-auto',
        'has-[>[data-slot=field-content]]:items-start',
        'has-[>[data-slot=field-content]]:*:has-[>[role=radio]]:mt-px has-[>[data-slot=field-content]]:*:data-[slot=checkbox]:mt-px',
      ],
      responsive: [
        '@md/field-group:flex-row flex-col @md/field-group:items-center @md/field-group:[&>*]:w-auto [&>*]:w-full [&>.sr-only]:w-auto',
        '@md/field-group:[&>[data-slot=field-label]]:flex-auto',
        '@md/field-group:has-[>[data-slot=field-content]]:items-start',
        '@md/field-group:has-[>[data-slot=field-content]]:*:has-[>[role=radio]]:mt-px @md/field-group:has-[>[data-slot=field-content]]:*:data-[slot=checkbox]:mt-px',
      ],
      vertical: ['flex-col [&>*]:w-full [&>.sr-only]:w-auto'],
    },
  },
})
