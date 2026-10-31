// A dialog holding an open one steps back behind it, a step for each dialog in front.
export const dialogStackStyle =
  'transition-[scale,top] duration-200 ease-(--gentleduck-motion-ease) motion-reduce:transition-none data-[nested-dialog-open]:top-[calc(50%_-_1.25rem_*_var(--gentleduck-dialog-nested-dialogs))] data-[nested-dialog-open]:scale-[calc(1_-_0.05_*_var(--gentleduck-dialog-nested-dialogs))]'
