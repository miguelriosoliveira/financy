import type { ApolloCache } from '@apollo/client';
import type { MockLink } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing/react';
import { type RenderOptions, render } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { MemoryRouter } from 'react-router';

type Options = Omit<RenderOptions, 'wrapper'> & {
	cache?: ApolloCache;
	mocks?: ReadonlyArray<MockLink.MockedResponse>;
};

export function renderWithProviders(
	ui: ReactElement,
	{ cache, mocks = [], ...options }: Options = {},
) {
	function Wrapper({ children }: { children: ReactNode }) {
		return (
			<MockedProvider cache={cache} mocks={mocks}>
				<MemoryRouter>{children}</MemoryRouter>
			</MockedProvider>
		);
	}

	return render(ui, { wrapper: Wrapper, ...options });
}
