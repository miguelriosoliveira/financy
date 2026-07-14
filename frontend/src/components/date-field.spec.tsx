import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { DateField } from './date-field';

describe('DateField', () => {
	it('renders with Financy input group styles', () => {
		render(<DateField label="Data" id="transaction-date" value={undefined} onChange={() => {}} />);

		const trigger = screen.getByLabelText('Data');
		const group = trigger.closest('[data-slot="input-group"]');

		expect(screen.getByText('Data').className).toContain('font-medium');
		expect(screen.getByText('Data').className).toContain('text-gray-700');
		expect(group?.className).toContain('border-gray-300');
		expect(group?.className).toContain('h-(--input-height)');
	});

	it('renders empty placeholder in gray-400', () => {
		render(<DateField label="Data" id="transaction-date" value={undefined} onChange={() => {}} />);

		expect(screen.getByLabelText('Data').className).toContain('text-gray-400');
		expect(screen.getByLabelText('Data')).toHaveTextContent('Selecione');
	});

	it('renders active state styles when opened', async () => {
		const user = userEvent.setup();

		render(<DateField label="Data" id="transaction-date" value={undefined} onChange={() => {}} />);

		await user.click(screen.getByLabelText('Data'));

		expect(screen.getByText('Data').className).toContain('text-brand-base');
	});

	it('renders error state styles', () => {
		render(
			<DateField
				label="Data"
				id="transaction-date"
				value={undefined}
				onChange={() => {}}
				error="Selecione a data"
			/>,
		);

		expect(screen.getByText('Data').className).toContain('text-danger');
		expect(screen.getByText('Selecione a data').className).toContain('text-gray-500');
		expect(screen.getByLabelText('Data')).toHaveAttribute('aria-invalid', 'true');
	});
});
