export interface DialogCommonType {
	lockScroll?: boolean;
	hoverable?: boolean;
	modal?: boolean;
	popover?: boolean;
	closeButton?: boolean;
	open?: boolean;
	id?: string;

	skipDelayDuration?: number;
	delayDuration?: number;
	onOpenChange?: (open: boolean) => void;
}

export interface DialogContextType extends DialogCommonType {
	ref: React.RefObject<HTMLDialogElement | null>;
	triggerRef: React.RefObject<
		HTMLElement | HTMLDivElement | HTMLButtonElement | null
	>;
}

export interface DialogProps extends DialogCommonType {
	children?: React.ReactNode;
	openProp?: boolean;
}
