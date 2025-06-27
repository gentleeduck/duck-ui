"use client";

import type { Root } from "@gentleduck/aria-feather/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "../popover/_popover";

function HoverCard({
	hoverable = true,
	popover = true,
	delayDuration = 500,
	...props
}: React.ComponentPropsWithoutRef<typeof Root>) {
	return (
		<Popover
			{...props}
			hoverable={hoverable}
			popover={popover}
			delayDuration={delayDuration}
		/>
	);
}

const HoverCardTrigger = PopoverTrigger;

const HoverCardContent = PopoverContent;

export { HoverCard, HoverCardTrigger, HoverCardContent };

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
