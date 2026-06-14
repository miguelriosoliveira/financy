import type { MockLink } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing/react';
import { type RenderOptions, render } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { MemoryRouter } from 'react-router';

type Options = Omit<RenderOptions, 'wrapper'> & {
	mocks?: ReadonlyArray<MockLink.MockedResponse>;
};

export function renderWithProviders(ui: ReactElement, { mocks = [], ...options }: Options = {}) {
	function Wrapper({ children }: { children: ReactNode }) {
		return (
			<MockedProvider mocks={mocks}>
				<MemoryRouter>{children}</MemoryRouter>
			</MockedProvider>
		);
	}

	return render(ui, { wrapper: Wrapper, ...options });
}
