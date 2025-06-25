export interface DialogCommonType {
	lockScroll?: boolean;
	hoverable?: boolean;
	modal?: boolean;
	closeButton?: boolean;
	open?: boolean;
	id?: string;
	onOpenChange?: (open: boolean) => void;
}

export interface DialogContextType extends DialogCommonType {
	ref: React.RefObject<HTMLDialogElement | null>;
	triggerRef: React.RefObject<HTMLElement | HTMLButtonElement | null>;
}

export interface DialogProps extends DialogCommonType {
	children?: React.ReactNode;
	openProp?: boolean;
}
