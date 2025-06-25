import DialogPrimitive, {
	useDialogContext,
} from "@gentleduck/aria-feather/dialog";
import { cn } from "@gentleduck/libs/cn";
import {
	AnimDialogModalVariants,
	AnimDialogVariants,
	type AnimPopoverVariants,
	AnimVariants,
} from "@gentleduck/motion/anim";
import type { VariantProps } from "@gentleduck/variants";
import { X } from "lucide-react";
import type React from "react";
import { Button } from "../button";

function Dialog({
	...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root>) {
	return <DialogPrimitive.Root {...props} />;
}

function DialogTrigger({
	children,
	asChild,
	...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger> &
	React.ComponentPropsWithoutRef<typeof Button>) {
	return (
		<DialogPrimitive.Trigger>
			<Button {...props} asChild={asChild}>
				{children}
			</Button>
		</DialogPrimitive.Trigger>
	);
}

function DialogClose({
	ref,
	size = 16,
	children,
	className,
	...props
}: React.HTMLProps<HTMLButtonElement> & {
	size?: number;
}): React.JSX.Element {
	const { onOpenChange } = useDialogContext();

	return (
		<button
			{...props}
			ref={ref}
			type="button"
			aria-label="close"
			className={cn(
				"absolute inset-x-3 top-3 text-accent-foreground size-4 cursor-pointer opacity-70 rounded hover:opacity-100 transition-all",
				className,
			)}
			onClick={() => onOpenChange?.(false)}
		>
			{children ?? <X aria-hidden size={size} />}
		</button>
	);
}

export interface DialogContentProps
	extends React.HTMLProps<HTMLDialogElement>,
		VariantProps<typeof AnimVariants> {
	renderOnce?: boolean;
	closedby: "any" | "closerequest" | "none";
}

export function DialogContentPrimitive({
	children,
	className,
	renderOnce,
	overlay = "default",
	closedby = "any",
	...props
}: DialogContentProps) {
	const { ref, closeButton, modal, id } = useDialogContext();

	return (
		<dialog
			ref={ref}
			id={id}
			popover={modal ? undefined : "auto"}
			closedby={closedby}
			className={cn(
				AnimVariants({ overlay: overlay }),
				AnimDialogVariants(),
				className,
			)}
			{...props}
		>
			{/* <ShouldRender ref={ref} once={renderOnce} open={open}> */}
			{closeButton && <DialogClose />}
			{children}
			{/* </ShouldRender> */}
		</dialog>
	);
}

function DialogContent({
	children,
	className,
	...props
}: DialogContentProps): React.JSX.Element {
	return (
		<DialogContentPrimitive
			className={cn(AnimDialogModalVariants(), className)}
			{...props}
		>
			{children}
		</DialogContentPrimitive>
	);
}

/**
 * DialogHeader component renders a header section for a dialog.
 * It supports additional class names and props to customize the
 * appearance and behavior of the header. The component uses a
 * flexbox layout to arrange its children in a vertical column
 * and applies responsive text alignment.
 *
 * @param {React.HTMLProps<HTMLDivElement>} props - The properties passed to the component.
 * @param {string} [props.className] - Additional class names for styling.
 * @param {React.RefObject<HTMLDivElement>} props.ref - The ref to be forwarded to the component.
 * @param {React.HTMLProps<HTMLDivElement>} [...props] - Additional properties for the component.
 *
 * @returns {JSX.Element} The rendered DialogHeader component.
 */
function DialogHeader({
	className,
	ref,
	...props
}: React.HTMLProps<HTMLDivElement>): React.JSX.Element {
	return (
		<div
			ref={ref}
			className={cn("flex flex-col space-y-1.5 text-end", className)}
			{...props}
		/>
	);
}

/**
 * DialogFooter component renders a footer section for a dialog.
 * It supports additional class names and props to customize the
 * appearance and behavior of the footer. The component uses a
 * flexbox layout to arrange its children in a column on small
 * screens and in a row with space between items on larger screens.
 *
 * @param {React.HTMLProps<HTMLDivElement>} props - The properties passed to the component.
 * @param {string} props.className - Additional class names for styling.
 * @param {React.RefObject<HTMLDivElement>} props.ref - The ref to be forwarded to the component.
 * @param {React.HTMLProps<HTMLDivElement>} [...props] - Additional properties for the component.
 *
 * @returns {React.JSX.Element} The rendered DialogFooter component.
 */
function DialogFooter({
	className,
	ref,
	...props
}: React.HTMLProps<HTMLDivElement>): React.JSX.Element {
	return (
		<div
			ref={ref}
			className={cn(
				"flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
				className,
			)}
			{...props}
		/>
	);
}

/**
 * `DialogTitle` is a React component that forwards its ref to the `DialogTitle` component.
 * It accepts all props that `DialogTitle` accepts, along with an optional `className` prop
 * to customize its styling.
 *
 * @param {React.HTMLProps<HTMLHeadingElement>} props - The properties passed to the component.
 * @param {string} [props.className] - Optional additional class names to apply to the component.
 * @param {React.RefObject<HTMLHeadingElement>} [props.ref] - A ref that will be forwarded to the `DialogTitle` component.
 * @param {React.HTMLProps<HTMLHeadingElement>} [...props] - Additional props to be passed to the `DialogTitle` component.
 *
 * @returns {React.JSX.Element} The rendered `DialogTitle` component with forwarded ref and applied props.
 */
function DialogTitle({
	className,
	ref,
	...props
}: React.HTMLProps<HTMLHeadingElement>): React.JSX.Element {
	return (
		<h2
			ref={ref}
			className={cn(
				"text-lg font-semibold leading-none tracking-tight",
				className,
			)}
			{...props}
		/>
	);
}

/**
 * `DialogDescription` is a React component that forwards its ref to the `DialogDescription` component.
 * It applies additional class names to style the description text.
 *
 * @param {React.HTMLProps<HTMLParagraphElement>} props - The properties passed to the component.
 * @param {string} [props.className] - Additional class names to apply to the description text.
 * @param {React.RefObject<HTMLParagraphElement>} [props.ref] - The ref to be forwarded to the `DialogDescription` component.
 * @param {React.HTMLProps<HTMLParagraphElement>} [..props] - Additional props to be passed to the `DialogDescription` component.
 *
 * @returns {React.JSX.Element} The rendered `DialogDescription` component with forwarded ref and applied class names.
 */
const DialogDescription = ({
	className,
	ref,
	...props
}: React.HTMLProps<HTMLParagraphElement>): React.JSX.Element => (
	<p
		ref={ref}
		className={cn("text-sm text-muted-foreground", className)}
		{...props}
	/>
);

export {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogFooter,
	DialogTitle,
	DialogDescription,
	DialogClose,
};
