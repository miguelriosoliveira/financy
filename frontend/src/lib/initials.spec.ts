import { describe, expect, it } from 'vitest';
import { getInitials } from './initials';

describe('getInitials', () => {
	it('returns first two letters for a single word', () => {
		expect(getInitials('Ada')).toBe('AD');
	});

	it('returns first letter of first two words', () => {
		expect(getInitials('Ada Lovelace')).toBe('AL');
	});

	it('returns empty string for blank input', () => {
		expect(getInitials('   ')).toBe('');
	});

	it('returns empty string for empty input', () => {
		expect(getInitials('')).toBe('');
	});

	it('returns a single letter for a one-character name', () => {
		expect(getInitials('A')).toBe('A');
	});

	it('uppercases lowercase input', () => {
		expect(getInitials('ada lovelace')).toBe('AL');
	});

	it('ignores extra whitespace around and between words', () => {
		expect(getInitials('  Ada   Lovelace  ')).toBe('AL');
	});

	it('uses only the first two words when there are more', () => {
		expect(getInitials('Ada Lovelace Turing')).toBe('AL');
	});

	it.each([
		{ name: 'Jo', expected: 'JO' },
		{ name: 'José Silva', expected: 'JS' },
		{ name: 'Conta teste', expected: 'CT' },
	])('returns $expected for "$name"', ({ name, expected }) => {
		expect(getInitials(name)).toBe(expected);
	});
});
