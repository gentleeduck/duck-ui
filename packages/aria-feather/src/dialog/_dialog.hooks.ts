import React from "react";
import { DialogContext } from "./_dialog";
import { DialogContextType, DialogProps } from "./dialog.types";
import { lockScrollbar, cleanLockScrollbar } from "./dialog.libs";

export function useDialogContext(name: string = "Dialog"): DialogContextType {
	const context = React.useContext(DialogContext);
	if (!context) {
		throw new Error(`useDialogContext must be used within a ${name}`);
	}
	return context;
}

export function useDialog({
	openProp,
	onOpenChange,
	lockScroll,
	hoverable,
	modal,
	skipDelayDuration,
	delayDuration,
}: DialogProps) {
	const dialogRef = React.useRef<HTMLDialogElement | null>(null);
	const triggerRef = React.useRef<HTMLElement | HTMLButtonElement | null>(null);
	const [open, setOpen] = React.useState<boolean>(openProp ?? false);

	function handleOpenChange(state: boolean) {
		try {
			const dialog = dialogRef.current;
			if (!dialog) return;
			if (state) {
				modal ? dialog.showModal() : dialog.showPopover();
			} else {
				modal ? dialog.close() : dialog.hidePopover();
			}
			setOpen(state);
			onOpenChange?.(state);
		} catch (e) {
			console.warn("Dialog failed to toggle", e);
		}
	}

	React.useEffect(() => {
		const dialog = dialogRef.current;
		const trigger = triggerRef.current;
		// if (!dialog) return;
		// if (!trigger) return;

		if (lockScroll) lockScrollbar(open);

		if (openProp) {
			handleOpenChange(true);
		} else if (openProp === false) {
			handleOpenChange(false);
		}
		function dialogClose() {
			handleOpenChange(false);
		}

		dialog?.addEventListener("close", dialogClose);
		dialog?.addEventListener("beforetoggle", dialogClose);

		let openTimer = null;
		let closeTimer = null;

		function openAfterDelay() {
			clearTimeout(closeTimer);
			openTimer = setTimeout(() => handleOpenChange(true), delayDuration);
		}

		function closeAfterDelay() {
			clearTimeout(openTimer);
			closeTimer = setTimeout(() => handleOpenChange(false), skipDelayDuration);
		}

		// TODO: focus visible not working and if applied it leads to random UI rendering
		if (hoverable) {
			[trigger, dialog].forEach((elm) => {
				elm?.addEventListener("mouseover", openAfterDelay);
				elm?.addEventListener("mouseout", closeAfterDelay);
			});
		}

		return () => {
			dialog?.removeEventListener("close", dialogClose);
			dialog?.removeEventListener("beforetoggle", dialogClose);

			if (hoverable) {
				[trigger, dialog].forEach((elm) => {
					elm?.removeEventListener("mouseover", openAfterDelay);
					elm?.removeEventListener("mouseout", closeAfterDelay);
				});
			}
			cleanLockScrollbar();
		};
	}, [handleOpenChange, open, openProp]);

	return {
		triggerRef,
		ref: dialogRef,
		open,
		onOpenChange: handleOpenChange,
	} as const;
}
