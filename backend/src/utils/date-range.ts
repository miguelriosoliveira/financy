export type DateRange = {
	start: Date;
	end: Date;
};

export function getCurrentMonthRange(referenceDate = new Date()): DateRange {
	const year = referenceDate.getUTCFullYear();
	const month = referenceDate.getUTCMonth();
	const start = new Date(Date.UTC(year, month, 1));
	const end = new Date(Date.UTC(year, month + 1, 1));
	return { start, end };
}
