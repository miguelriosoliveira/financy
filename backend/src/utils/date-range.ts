export type DateRange = {
	start: Date;
	end: Date;
};

export function getMonthRange(year: number, month: number): DateRange {
	const start = new Date(Date.UTC(year, month - 1, 1));
	const end = new Date(Date.UTC(year, month, 1));
	return { start, end };
}

export function getCurrentMonthRange(referenceDate = new Date()): DateRange {
	const year = referenceDate.getUTCFullYear();
	const month = referenceDate.getUTCMonth();
	return getMonthRange(year, month + 1);
}
