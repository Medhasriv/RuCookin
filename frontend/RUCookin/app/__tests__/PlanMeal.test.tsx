import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import PlanMeal from '../PlanMeal';
import { useRouter } from 'expo-router';
import * as authChecker from '../../utils/authChecker';

// Mocks
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
}));

jest.mock('react-native-safe-area-context', () => {
  const actual = jest.requireActual('react-native-safe-area-context');
  return {
    ...actual,
    useSafeAreaInsets: () => ({ top: 0 }),
  };
});

jest.spyOn(authChecker, 'checkAuth').mockImplementation(jest.fn());
jest.spyOn(authChecker, 'getToken').mockResolvedValue('test-token');

global.fetch = jest.fn();

describe('PlanMeal Component', () => {
  const mockPush = jest.fn();
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    jest.clearAllMocks();
  });

  it('renders static content correctly', () => {
    render(<PlanMeal />);
    expect(screen.getByText('Plan a Meal')).toBeTruthy();
    expect(screen.getByPlaceholderText('Enter max budget in $')).toBeTruthy();
  });

  it('fetches pantry items on mount', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 1, name: 'tomato' }],
    });

    render(<PlanMeal />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/routes/api/pantry',
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
        })
      );
    });
  });

  it('calls Spoonacular API and filters recipes on submit', async () => {
    const pantryItems = [{ id: 1, name: 'tomato' }];

    // First fetch = pantry
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => pantryItems,
    });

    // Second fetch = base recipes
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 123, title: 'Tomato Soup', image: 'img.jpg', usedIngredientCount: 1, missedIngredientCount: 2 },
      ],
    });

    // Third fetch = price breakdown
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ingredients: [
          { name: 'onion', price: 50 },
          { name: 'salt', price: 25 },
        ],
      }),
    });

    render(<PlanMeal />);

    const input = screen.getByPlaceholderText('Enter max budget in $');
    fireEvent.changeText(input, '1');
    fireEvent(input, 'submitEditing');

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(3); // Pantry, recipes, price breakdown
      expect(screen.getByText('Tomato Soup')).toBeTruthy();
      expect(screen.getByText(/Used: 1/)).toBeTruthy();
    });
  });

  it('does not call recipe API if budget input is empty', async () => {
    render(<PlanMeal />);
    const input = screen.getByPlaceholderText('Enter max budget in $');
    fireEvent.changeText(input, '');
    fireEvent(input, 'submitEditing');
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1); // Only pantry fetch
    });
  });
});
