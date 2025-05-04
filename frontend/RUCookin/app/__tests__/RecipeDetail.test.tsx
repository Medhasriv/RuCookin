/**
 * app/__tests__/RecipeDetail.test.tsx
 * Jest tests for <RecipeDetail />
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react-native';

/* ────────────────────────────────────────────────────────────── */
/*  Runtime mocks                                                */
/* ────────────────────────────────────────────────────────────── */

/* expo‑constants – provides the API key fields the component expects */

jest.mock('expo-constants', () => {
  const constants = {
    manifest:   { extra: { spoonacularApiKey: 'TEST_KEY' } },
    expoConfig: { expo: { extra: { spoonacularApiKey: 'TEST_KEY' } } },
  };
  return { ...constants, default: constants };   // ← key line
});


/* expo‑router – stubs navigation + search params */
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useLocalSearchParams: () => ({
    id: '42',
    title: 'Test Recipe',
    image: 'http://example.com/image.jpg',
  }),
}));

/* global fetch – Jest stub */
global.fetch = jest.fn();

/* ────────────────────────────────────────────────────────────── */
/*  Import component AFTER mocks                                 */
/* ────────────────────────────────────────────────────────────── */

import RecipeDetail from '../RecipeDetail';

/* ────────────────────────────────────────────────────────────── */
/*  Tests                                                        */
/* ────────────────────────────────────────────────────────────── */

describe('<RecipeDetail />', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders recipe details after a successful fetch', async () => {
    const fakePayload = {
      summary: '<p>Delicious <i>pasta</i></p>',
      extendedIngredients: [
        { original: '200g spaghetti' },
        { original: '100g tomato sauce' },
      ],
      instructions: '<p>Boil, drain, mix.</p>',
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve(fakePayload),
    });

    const { getByText } = render(<RecipeDetail />);

    await waitFor(() => expect(getByText('Delicious pasta')).toBeTruthy());

    expect(getByText('Test Recipe')).toBeTruthy();
    expect(getByText('• 200g spaghetti')).toBeTruthy();
    expect(getByText('• 100g tomato sauce')).toBeTruthy();
    expect(getByText('Boil, drain, mix.')).toBeTruthy();
  });

  it('shows an error message when the fetch fails', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('network error'));

    const { findByText } = render(<RecipeDetail />);
    expect(await findByText('Failed to load recipe details.')).toBeTruthy();
  });
});
