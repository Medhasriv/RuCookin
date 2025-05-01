// app/__tests__/RecipeDetail.test.tsx
import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import RecipeDetail from '../RecipeDetail';

// 1) Stub out the Expo router params
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({
    id: '42',
    title: 'Test Recipe',
    image: 'http://example.com/image.jpg',
  }),
}));

// 2) Fake fetch globally
global.fetch = jest.fn();

describe('RecipeDetail', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders recipe details after a successful fetch', async () => {
    // Arrange: make fetch resolve with our fake payload
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

    // Act
    const { getByText } = render(<RecipeDetail />);

    // Assert: wait until the HTML‐stripped summary shows up
    await waitFor(() => expect(getByText('Delicious pasta')).toBeTruthy());

    // Title passed via params
    expect(getByText('Test Recipe')).toBeTruthy();

    // Ingredients list
    expect(getByText('• 200g spaghetti')).toBeTruthy();
    expect(getByText('• 100g tomato sauce')).toBeTruthy();

    // Instructions, HTML stripped
    expect(getByText('Boil, drain, mix.')).toBeTruthy();
  });

  it('displays an error message if the fetch fails', async () => {
    // Arrange: make fetch reject
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('network error'));

    // Act
    const { findByText } = render(<RecipeDetail />);

    // Assert
    expect(await findByText('Failed to load recipe details.')).toBeTruthy();
  });
});
