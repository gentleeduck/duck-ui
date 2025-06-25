"use client";

import * as React from "react";
import { cn } from "@gentleduck/libs/cn";
import { Root as Popover } from "@gentleduck/aria-feather/popover";
import {
	AnimPopoverVariants,
	AnimTooltipVariants,
} from "@gentleduck/motion/anim";
import { PopoverContent, PopoverTrigger } from "../popover/_popover";
import { DialogContentProps } from "../dialog";
import { VariantProps } from "@gentleduck/variants";

const Tooltip = Popover;

const TooltipTrigger = PopoverTrigger;

function TooltipContent({
	className,
	children,
	position,
	...props
}: DialogContentProps &
	VariantProps<typeof AnimPopoverVariants>): React.JSX.Element {
	return (
		<PopoverContent
			role="tooltip"
			position={position}
			className={cn(AnimTooltipVariants(), className)}
			{...props}
		>
			{children}
		</PopoverContent>
	);
}

// function PopoverAnchor({
//   ...props
// }: React.ComponentProps<'dialog'>) {
//   return <dialog {...props} />
// }

export { Tooltip, TooltipTrigger, TooltipContent };

// PopoverWrapper Component
// export interface PopoverWrapperProps {
//   wrapper?: React.ComponentPropsWithoutRef<typeof Popover>
//   trigger?: React.ComponentPropsWithoutRef<typeof PopoverTrigger>
//   content?: React.ComponentPropsWithoutRef<typeof PopoverContent>
// }

// const PopoverWrapper: React.FC<PopoverWrapperProps> = ({ content, trigger, wrapper }) => {
//   const { className: triggerClassName, key: triggerKey, children: triggerChildren, ...triggerProps } = trigger ?? {}
//   const { className: contentClassName, key: contentKey, children: contentChildren, ...contentProps } = content ?? {}

//   return (
//     <Popover {...wrapper}>
//       <PopoverTrigger asChild className={cn('', triggerClassName)} {...triggerProps}>
//         {triggerChildren}
//       </PopoverTrigger>
//       <PopoverContent className={cn('w-80', contentClassName)} {...contentProps}>
//         {contentChildren}
//       </PopoverContent>
//     </Popover>
//   )
// }

// PopoverWrapper.displayName = 'PopoverWrapper'

// export { Popover, PopoverTrigger, PopoverContent, PopoverWrapper, PopoverClose }

// export { Popover, PopoverTrigger, PopoverContent, PopoverWrapper, PopoverClose }
