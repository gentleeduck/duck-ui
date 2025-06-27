"use client";

import type DialogPrimitive from "@gentleduck/aria-feather/dialog";
import { cn } from "@gentleduck/libs/cn";
import {
	CheckIcon,
	ChevronDown,
	ChevronDownIcon,
	ChevronUp,
} from "lucide-react";
import type * as React from "react";
// import { useHandleKeyDown } from '../command'

import { useStableId } from "@gentleduck/hooks";
import type { AnimPopoverVariants } from "@gentleduck/motion/anim";
import type { VariantProps } from "@gentleduck/variants";
import type { Button } from "../button";
import type { DialogContentProps } from "../dialog";
import { Popover, PopoverContent, PopoverTrigger } from "../popover/_popover";
import { Separator } from "../separator";

const Select = Popover;

function SelectTrigger({
	children,
	className,
	customIndicator,
	...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger> &
	React.ComponentPropsWithoutRef<typeof Button> & {
		customIndicator: React.ReactNode;
	}) {
	return (
		<PopoverTrigger
			duck-dropdown-menu-trigger=""
			icon={customIndicator ?? <ChevronDownIcon className="open:rotate-180" />}
			className={cn(
				"font-normal pe-3 data-[open=true]:bg-secondary data-[open=true]:text-accent-foreground",
				className,
			)}
			{...props}
		>
			{children}
		</PopoverTrigger>
	);
}

function SelectContent({
	className,
	children,
	...props
}: DialogContentProps &
	VariantProps<typeof AnimPopoverVariants>): React.JSX.Element {
	return (
		<PopoverContent
			role="select"
			aria-activedescendant
			className={cn("px-1.5 py-1", className)}
			{...props}
		>
			{children}
		</PopoverContent>
	);
}

function SelectGroup({
	children,
	...props
}: React.HTMLProps<HTMLUListElement>) {
	return (
		<ul role="listbox" {...props}>
			{children}
		</ul>
	);
}

function SelectValue({
	className,
	children,
	placeholder,
	...props
}: React.HTMLProps<HTMLDivElement>) {
	return (
		<div
			className={cn(
				"relative flex select-none items-center gap-2 truncate rounded-xs text-sm outline-hidden",
				className,
			)}
			{...props}
			duck-select-value=""
		>
			{placeholder}
		</div>
	);
}

function SelectLabel({
	children,
	className,
	ref,
	...props
}: React.HTMLProps<HTMLLabelElement>) {
	return (
		<label
			ref={ref}
			className={cn("px-2 py-1.5 text-muted-foreground text-xs", className)}
			{...props}
		>
			{children}
		</label>
	);
}

const SelectSeparator = Separator;

function SelectItem({
	children,
	ref,
	className,
	...props
}: React.HTMLProps<HTMLLIElement>) {
	const id = useStableId();
	return (
		<li
			role="option"
			ref={ref}
			id={id}
			duck-select-item=""
			{...props}
			className={cn(
				"relative flex items-center gap-2 data-[selected='true']:bg-accent [&[aria-selected]]:bg-secondary [&[aria-selected]>#select-indicator]:bg-secondary hover:bg-muted data-[disabled=true]:opacity-50 px-2 py-1.5 rounded-sm outline-hidden text-sm transition-color duration-300 data-[selected=true]:text-accent-foreground hover:text-accent-foreground cursor-pointer data-[disabled=true]:pointer-events-none select-none",
				className,
			)}
		>
			{children}
			{/* {selectedItem?.id === id && ( */}
			<span
				className="end-2 block-full absolute flex justify-center items-center ps-2"
				id="select-indicator"
			>
				<CheckIcon className="!size-3.5 shrink-0" />
			</span>
			{/* // )} */}
		</li>
	);
}

export {
	Select,
	SelectGroup,
	SelectValue,
	SelectTrigger,
	SelectContent,
	SelectLabel,
	SelectItem,
	SelectSeparator,
	// SelectScrollUpButton,
	// SelectScrollDownButton,
};
