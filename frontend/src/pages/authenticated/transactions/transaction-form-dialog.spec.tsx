import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/tests/helpers/render';
import { TransactionFormDialog } from './components/transaction-form-dialog';

const CATEGORIES = [{ id: 'category-1', name: 'Alimentação' }];

const TRANSACTION_FIELD_MESSAGES = {
	amount: 'Informe um valor maior que zero',
	date: 'Selecione a data',
	categoryId: 'Selecione uma categoria',
} as const;

const EDIT_INITIAL_VALUES = {
	type: 'EXPENSE' as const,
	description: 'Jantar no Restaurante',
	date: new Date('2025-11-30T12:00:00.000Z'),
	amount: '89.5',
	categoryId: 'category-1',
};

describe('TransactionFormDialog', () => {
	it('shows validation messages when submitting with empty required fields', async () => {
		renderWithProviders(
			<TransactionFormDialog
				mode="create"
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
				mode="create"
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

	it('shows the edit title and pre-fills fields from initialValues', async () => {
		renderWithProviders(
			<TransactionFormDialog
				mode="edit"
				open
				onOpenChange={() => undefined}
				categories={CATEGORIES}
				initialValues={EDIT_INITIAL_VALUES}
				onSubmit={() => undefined}
				loading={false}
			/>,
		);

		const dialog = screen.getByRole('dialog', { name: 'Editar transação' });

		expect(within(dialog).getByLabelText('Descrição')).toHaveValue('Jantar no Restaurante');
		expect(within(dialog).getByLabelText('Valor')).toHaveValue(89.5);
		expect(within(dialog).getByLabelText('Data')).toHaveTextContent('30/11/2025');
	});

	it('submits pre-filled values in edit mode', async () => {
		const onSubmit = vi.fn();
		renderWithProviders(
			<TransactionFormDialog
				mode="edit"
				open
				onOpenChange={() => undefined}
				categories={CATEGORIES}
				initialValues={EDIT_INITIAL_VALUES}
				onSubmit={onSubmit}
				loading={false}
			/>,
		);

		const dialog = screen.getByRole('dialog', { name: 'Editar transação' });
		const user = userEvent.setup();
		await user.click(within(dialog).getByRole('button', { name: 'Salvar' }));

		expect(onSubmit).toHaveBeenCalledWith({
			amount: 89.5,
			type: 'EXPENSE',
			description: 'Jantar no Restaurante',
			date: EDIT_INITIAL_VALUES.date,
			categoryId: 'category-1',
		});
	});
});
