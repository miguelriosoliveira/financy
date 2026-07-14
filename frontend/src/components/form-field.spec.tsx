import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MailIcon } from 'lucide-react';
import { describe, expect, it } from 'vitest';
import { FormField } from './form-field';

describe('FormField', () => {
	it('renders empty state styles', () => {
		render(
			<FormField
				label="E-mail"
				id="email"
				icon={<MailIcon data-testid="mail-icon" />}
				placeholder="mail@example.com"
				value=""
				onChange={() => {}}
			/>,
		);

		expect(screen.getByText('E-mail').className).toContain('text-gray-700');
		expect(
			screen.getByPlaceholderText('mail@example.com').closest('[data-slot="input-group"]')
				?.className,
		).toContain('border-gray-300');
	});

	it('renders active state styles on focus', async () => {
		const user = userEvent.setup();

		render(
			<FormField
				label="E-mail"
				id="email"
				icon={<MailIcon />}
				placeholder="mail@example.com"
				value="ada@example.com"
				onChange={() => {}}
			/>,
		);

		await user.click(screen.getByLabelText('E-mail'));

		expect(screen.getByText('E-mail').className).toContain('text-brand-base');
	});

	it('renders filled state styles when blurred with a value', async () => {
		const user = userEvent.setup();

		render(
			<FormField
				label="E-mail"
				id="email"
				icon={<MailIcon data-testid="mail-icon" />}
				value="ada@example.com"
				onChange={() => {}}
			/>,
		);

		const input = screen.getByLabelText('E-mail');
		await user.click(input);
		await user.tab();

		expect(screen.getByText('E-mail').className).toContain('text-gray-700');
		expect(screen.getByTestId('mail-icon').parentElement?.className).toContain('text-gray-800');
	});

	it('renders error state styles', () => {
		render(
			<FormField
				label="E-mail"
				id="email"
				icon={<MailIcon data-testid="mail-icon" />}
				value="invalid"
				error="Informe um e-mail válido"
				onChange={() => {}}
			/>,
		);

		expect(screen.getByText('E-mail').className).toContain('text-danger');
		expect(screen.getByTestId('mail-icon').parentElement?.className).toContain('text-danger');
		expect(screen.getByText('Informe um e-mail válido').className).toContain('text-gray-500');
		expect(screen.getByLabelText('E-mail')).toHaveAttribute('aria-invalid', 'true');
	});

	it('renders disabled state styles on the input group only', () => {
		render(
			<FormField label="E-mail" id="email" value="ada@example.com" disabled onChange={() => {}} />,
		);

		expect(screen.getByText('E-mail').className).toContain('text-gray-700');
		expect(
			screen.getByLabelText('E-mail').closest('[data-slot="input-group"]')?.className,
		).toContain('opacity-50');
	});
});
