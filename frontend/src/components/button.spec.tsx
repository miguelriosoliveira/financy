import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button } from './button';

describe('Button', () => {
	it('renders primary md by default', () => {
		render(<Button>Label</Button>);

		const element = screen.getByRole('button', { name: 'Label' });
		expect(element.className).toContain('bg-brand-base');
		expect(element.className).toContain('h-12');
	});

	it('renders secondary outline classes', () => {
		render(<Button color="secondary">Label</Button>);

		const element = screen.getByRole('button', { name: 'Label' });
		expect(element.className).toContain('bg-white');
		expect(element.className).toContain('border-gray-300');
		expect(element.className).toContain('text-gray-700');
	});

	it('renders sm size classes', () => {
		render(<Button size="sm">Label</Button>);

		const element = screen.getByRole('button', { name: 'Label' });
		expect(element.className).toContain('h-9');
		expect(element.className).toContain('text-sm');
	});

	it('merges caller className with variant styles', () => {
		render(<Button className="min-w-9">Label</Button>);

		const element = screen.getByRole('button', { name: 'Label' });
		expect(element.className).toContain('bg-brand-base');
		expect(element.className).toContain('min-w-9');
	});
});
