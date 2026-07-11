type TransactionType = 'INCOME' | 'EXPENSE';

function formatAmount(value: number) {
	return value.toLocaleString('pt-BR', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
}

export function formatCurrency(value: number) {
	return `R$ ${formatAmount(value)}`;
}

export function formatSignedAmount(value: number, type: TransactionType) {
	const formatted = formatAmount(value);
	const sign = type === 'INCOME' ? '+' : '-';
	return `${sign} R$ ${formatted}`;
}
