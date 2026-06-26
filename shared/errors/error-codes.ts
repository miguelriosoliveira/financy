export const ERROR_CODES = {
	CATEGORY_ALREADY_EXISTS: 'CATEGORY_ALREADY_EXISTS',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
