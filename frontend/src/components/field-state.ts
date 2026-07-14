export type FieldState = 'empty' | 'active' | 'filled' | 'error' | 'disabled';

export function resolveFieldState({
	disabled,
	error,
	focused,
	hasValue,
}: {
	disabled?: boolean;
	error?: string;
	focused: boolean;
	hasValue: boolean;
}): FieldState {
	if (disabled) {
		return 'disabled';
	}
	if (error) {
		return 'error';
	}
	if (focused) {
		return 'active';
	}
	if (hasValue) {
		return 'filled';
	}
	return 'empty';
}
