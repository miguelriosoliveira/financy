import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/tests/helpers/render';
import { TransactionFormDialog } from './components/transaction-form-dialog';

const CATEGORIES = [{ id: 'category-1', name: 'Alimentação' }];

const TRANSACTION_FIELD_MESSAGES = {
	amount: 'Informe um valor maior que zero',
	date: 'Selecione a data',
	categoryId: 'Selecione uma categoria',
} as const;

describe('TransactionFormDialog', () => {
	it('shows validation messages when submitting with empty required fields', async () => {
		renderWithProviders(
			<TransactionFormDialog
				open
				onOpenChange={() => undefined}
				categories={CATEGORIES}
				onSubmit={() => undefined}
				loading={false}
			/>,
		);

		const dialog = screen.getByRole('dialog', { name: 'Nova transação' });
		const user = userEvent.setup();
		await user.click(within(dialog).getByRole('button', { name: 'Salvar' }));

		expect(await screen.findByText(TRANSACTION_FIELD_MESSAGES.amount)).toBeInTheDocument();
		expect(screen.getByText(TRANSACTION_FIELD_MESSAGES.date)).toBeInTheDocument();
		expect(screen.getByText(TRANSACTION_FIELD_MESSAGES.categoryId)).toBeInTheDocument();
	});

	it('renders form fields when open', async () => {
		renderWithProviders(
			<TransactionFormDialog
				open
				onOpenChange={() => undefined}
				categories={CATEGORIES}
				onSubmit={() => undefined}
				loading={false}
			/>,
		);

		const dialog = screen.getByRole('dialog', { name: 'Nova transação' });

		expect(within(dialog).getByLabelText('Descrição')).toBeInTheDocument();
		expect(within(dialog).getByLabelText('Data')).toBeInTheDocument();
		expect(within(dialog).getByLabelText('Valor')).toBeInTheDocument();
		expect(within(dialog).getByLabelText('Categoria')).toBeInTheDocument();

		await waitFor(() => {
			expect(within(dialog).getByRole('button', { name: 'Salvar' })).toBeInTheDocument();
		});
	});
});
