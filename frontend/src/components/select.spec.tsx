import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Select, SelectTrigger, SelectValue } from './select';

describe('Select', () => {
	it('renders trigger with Financy default styles', () => {
		render(
			<Select>
				<SelectTrigger>
					<SelectValue placeholder="Selecione" />
				</SelectTrigger>
			</Select>,
		);

		const trigger = screen.getByRole('combobox');
		expect(trigger.className).toContain('border-gray-300');
		expect(trigger.className).toContain('rounded-lg');
		expect(trigger.className).toContain('text-gray-800');
	});
});
