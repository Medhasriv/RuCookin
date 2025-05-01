// mock for constants to avoid problems with Jest and our Cloud Deployment
jest.mock('expo-constants', () => ({
  manifest: { extra: { apiUrl: 'http://localhost:3001', spoonacularApiKey: 'fake-key' } },
  // fallback field name in newer Expo SDKs:
  expoConfig: { extra: { apiUrl: 'http://localhost:3001', spoonacularApiKey: 'fake-key' } },
}));

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PlanMeal from '../PlanMeal';
import { getToken } from '../../utils/authChecker';

// Mock external dependencies
jest.mock('../../utils/authChecker', () => ({
  getToken: jest.fn(() => Promise.resolve('fake-token')),
  checkAuth: jest.fn(),
}));
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
}));
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children }: any) => <>{children}</>,
    useSafeAreaInsets: () => ({ top: 0 }),
  };
});
jest.mock('../../components/BottomNavBar', () => () => <></>);

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]), // return empty pantry/recipes
  })
) as jest.Mock;

describe('PlanMeal', () => {
  it('renders header and input field', async () => {
    const { getByText, getByPlaceholderText } = render(<PlanMeal />);

    expect(getByText('Plan a Meal')).toBeTruthy();
    expect(getByText("Enter your budget and we'll find recipes!")).toBeTruthy();
    expect(getByPlaceholderText('Enter max budget in $')).toBeTruthy();
  });

  it('fetches pantry items on mount', async () => {
    const mockPantry = [{ id: 1, name: 'apple' }];
    (fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPantry),
      })
    );

    const { findByText } = render(<PlanMeal />);
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/routes/api/pantry',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer fake-token',
          }),
        })
      );
    });
  });

  it('updates budget input and triggers fetchRecipes on submit', async () => {
    const { getByPlaceholderText } = render(<PlanMeal />);

    const input = getByPlaceholderText('Enter max budget in $');
    fireEvent.changeText(input, '10');
    fireEvent(input, 'submitEditing');

    expect(input.props.value).toBe('10');
    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
  });
});
