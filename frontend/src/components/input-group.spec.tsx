import { render, screen } from '@testing-library/react';
import { MailIcon } from 'lucide-react';
import { describe, expect, it } from 'vitest';
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from './input-group';

describe('InputGroup', () => {
	it('renders group with Financy default styles', () => {
		render(
			<InputGroup data-testid="input-group">
				<InputGroupInput id="email" placeholder="mail@example.com" />
			</InputGroup>,
		);

		const group = screen.getByTestId('input-group');
		expect(group.className).toContain('border-gray-300');
		expect(group.className).toContain('rounded-lg');
		expect(group.className).toContain('bg-white');
		expect(group.className).toContain('h-(--input-height)');
	});

	it('renders addon with gray-400 icon color and no extra start padding', () => {
		render(
			<InputGroup>
				<InputGroupAddon data-testid="addon">
					<MailIcon />
				</InputGroupAddon>
				<InputGroupInput id="email" />
			</InputGroup>,
		);

		const addon = screen.getByTestId('addon');
		expect(addon.className).toContain('text-gray-400');
		expect(addon.className).toContain('pl-0');
	});

	it('renders input with Financy typography and placeholder styles', () => {
		render(
			<InputGroup>
				<InputGroupInput id="email" placeholder="mail@example.com" />
			</InputGroup>,
		);

		const input = screen.getByPlaceholderText('mail@example.com');
		expect(input.className).toContain('text-gray-800');
		expect(input.className).toContain('caret-brand-base');
		expect(input.className).toContain('placeholder:text-gray-400');
	});

	it('renders text addon with gray-400 color', () => {
		render(
			<InputGroup>
				<InputGroupText data-testid="prefix">R$</InputGroupText>
				<InputGroupInput id="amount" />
			</InputGroup>,
		);

		expect(screen.getByTestId('prefix').className).toContain('text-gray-400');
	});

	it('keeps neutral border styling when input is invalid', () => {
		render(
			<InputGroup data-testid="input-group">
				<InputGroupInput id="email" aria-invalid />
			</InputGroup>,
		);

		const group = screen.getByTestId('input-group');
		expect(group.className).toContain('has-[[data-slot][aria-invalid=true]]:border-gray-300');
		expect(group.className).toContain('has-[[data-slot][aria-invalid=true]]:ring-0');

		const input = screen.getByRole('textbox');
		expect(input.className).toContain('aria-invalid:ring-0');
	});
});
