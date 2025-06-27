"use client";

import { useDialogContext } from "@gentleduck/aria-feather/dialog";
import { Root } from "@gentleduck/aria-feather/popover";
import { cn } from "@gentleduck/libs/cn";
import { AnimPopoverVariants } from "@gentleduck/motion/anim";
import type { VariantProps } from "@gentleduck/variants";
import type * as React from "react";
import {
	DialogContentPrimitive,
	type DialogContentProps,
	DialogTrigger,
} from "../dialog";

function Popover({
	hoverable = false,
	modal = false,
	popover = true,
	...props
}: React.ComponentPropsWithoutRef<typeof Root>) {
	return (
		<Root {...props} hoverable={hoverable} modal={modal} popover={popover} />
	);
}

const PopoverTrigger = DialogTrigger;

function PopoverContent({
	children,
	className,
	side = "top",
	sideOffset = 4,
	align = "default",
	...props
}: DialogContentProps &
	VariantProps<typeof AnimPopoverVariants> & {
		sideOffset: number | string;
	}): React.JSX.Element {
	const { id } = useDialogContext();
	return (
		<DialogContentPrimitive
			style={
				{
					"--position-anchor": `--${id}`,
					"--sideOffset": `${sideOffset}px`,
				} as React.CSSProperties
			}
			overlay="nothing"
			className={cn(
				AnimPopoverVariants({ side: side, align: align }),
				className,
			)}
			{...props}
		>
			{children}
		</DialogContentPrimitive>
	);
}

export { Popover, PopoverTrigger, PopoverContent };

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
