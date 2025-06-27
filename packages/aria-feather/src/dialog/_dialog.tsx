import { useComputedTimeoutTransition, useStableId } from "@gentleduck/hooks";
import {
	apply as applyClosedBy,
	isSupported as isClosedBySupported,
} from "dialog-closedby-polyfill";
import {
	apply as applyInvokers,
	isSupported as isInvokersSupported,
} from "invokers-polyfill/fn";
import React from "react";
import { Slot } from "../slot";
import { useDialog, useDialogContext } from "./_dialog.hooks";
import type { DialogContextType, DialogProps } from "./dialog.types";

if (!isClosedBySupported()) {
	applyClosedBy();
}

if (!isInvokersSupported()) {
	applyInvokers();
}

/**
 * Context for managing the open state of the dialog.
 *
 */
export const DialogContext = React.createContext<DialogContextType | null>(
	null,
);

/**
 * Dialog component that provides a context for managing its open state and
 * behavior. It uses a ref to handle the underlying HTMLDialogElement.
 */

export function Root({
	children,
	open: openProp,
	onOpenChange,
	lockScroll = true,
	hoverable = false,
	modal = true,
	popover = false,
	closeButton = false,
	skipDelayDuration = 300,
	delayDuration = 0,
}: DialogProps): React.JSX.Element {
	const {
		open,
		onOpenChange: _onOpenChange,
		ref,
		triggerRef,
	} = useDialog({
		openProp,
		onOpenChange,
		lockScroll,
		hoverable,
		modal,
		skipDelayDuration,
		delayDuration,
	});
	const id = useStableId();

	return (
		<DialogContext.Provider
			value={{
				open,
				onOpenChange: _onOpenChange,
				ref,
				triggerRef,
				id,
				modal,
				popover,
				closeButton,
				hoverable,
				lockScroll,
			}}
		>
			{children}
		</DialogContext.Provider>
	);
}

export function Trigger({
	onClick,
	open,
	...props
}: React.ComponentPropsWithRef<typeof Slot> & {
	open?: boolean;
	asChild?: boolean;
}): React.JSX.Element {
	const {
		onOpenChange,
		open: _open,
		id,
		triggerRef,
		popover,
	} = useDialogContext();

	return (
		<Slot
			{...(popover
				? {
						popoverTarget: id,
						style: {
							"--position-anchor": `--${id}`,
							anchorName: "var(--position-anchor)",
							...(props.style || {}),
						} as React.CSSProperties,
					}
				: {})}
			ref={triggerRef}
			aria-haspopup="dialog"
			aria-controls={id}
			onClick={(e) => {
				onOpenChange(open ?? !_open);
				onClick?.(e);
			}}
			{...props}
		/>
	);
}

export function ShouldRender({
	once = false,
	open = false,
	children,
	ref,
}: {
	once?: boolean;
	open?: boolean;
	children?: React.ReactNode;
	ref?: React.RefObject<HTMLDialogElement | null>;
}) {
	const [_shouldRender, setShouldRender] = React.useState<boolean>(false);
	const [isVisible, setIsVisible] = React.useState<boolean>(false);
	const shouldRender = once ? _shouldRender : open;

	React.useEffect(() => {
		if (open && once) {
			setShouldRender(true);
		}
		if (shouldRender) {
			setIsVisible(true);
		} else {
			const element = ref?.current;
			if (element) {
				useComputedTimeoutTransition(element, () => {
					setIsVisible(false);
				});
			}
		}
	}, [shouldRender, ref, open, once]);

	if (!shouldRender && !isVisible) return null;

	return children;
}

export default {
	Root,
	Trigger,
};
