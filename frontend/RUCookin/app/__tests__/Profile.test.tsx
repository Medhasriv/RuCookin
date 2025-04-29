import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import Profile from '../Profile';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ✅ Mock router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
}));

// ✅ Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        user: {
          id: '1',
          username: 'JohnDoe',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          location: 'New York',
          cuisineLike: [],
          cuisineDislike: [],
          diet: [],
          intolerance: [],
        },
      }),
  })
) as jest.Mock;

// ✅ Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn((key) => {
    if (key === 'token') return Promise.resolve('mock-token');
    if (key === 'userTheme') return Promise.resolve('dark');
    return Promise.resolve(null);
  }),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('Profile screen', () => {
  it('renders Profile correctly', async () => {
    render(<Profile />);

    expect(await screen.findByTestId('profile-header')).toHaveTextContent("JohnDoe's Profile");
    expect(await screen.findByTestId('first-name-display')).toHaveTextContent('John');
    expect(await screen.findByTestId('last-name-display')).toHaveTextContent('Doe');
    expect(await screen.findByTestId('email-display')).toHaveTextContent('john@example.com');
    expect(await screen.findByTestId('location-display')).toHaveTextContent('New York');
  });

  it('toggles editing state for firstName', async () => {
    render(<Profile />);
    await waitFor(() => screen.getByTestId('edit-first-name-icon'));

    fireEvent.press(screen.getByTestId('edit-first-name-icon'));
    expect(screen.getByTestId('first-name-input')).toBeTruthy();
  });

  it('saves changes to first name', async () => {
    render(<Profile />);
    await waitFor(() => screen.getByTestId('edit-first-name-icon'));

    fireEvent.press(screen.getByTestId('edit-first-name-icon'));
    fireEvent.changeText(screen.getByTestId('first-name-input'), 'Jane');
    fireEvent.press(screen.getByTestId('save-first-name-icon'));

    await waitFor(() => {
      expect(screen.getByTestId('first-name-display')).toHaveTextContent('Jane');
    });
  });

  it('saves changes to last name', async () => {
    render(<Profile />);
    await waitFor(() => screen.getByTestId('edit-last-name-icon'));

    fireEvent.press(screen.getByTestId('edit-last-name-icon'));
    fireEvent.changeText(screen.getByTestId('last-name-input'), 'Smith');
    fireEvent.press(screen.getByTestId('save-last-name-icon'));

    await waitFor(() => {
      expect(screen.getByTestId('last-name-display')).toHaveTextContent('Smith');
    });
  });

  it('edits email successfully', async () => {
    render(<Profile />);
    await waitFor(() => screen.getByTestId('edit-email-icon'));

    fireEvent.press(screen.getByTestId('edit-email-icon'));
    fireEvent.changeText(screen.getByTestId('email-input'), 'jane@example.com');
    fireEvent.press(screen.getByTestId('save-email-icon'));

    await waitFor(() => {
      expect(screen.getByTestId('email-display')).toHaveTextContent('jane@example.com');
    });
  });

  it('edits location successfully', async () => {
    render(<Profile />);
    await waitFor(() => screen.getByTestId('edit-location-icon'));

    fireEvent.press(screen.getByTestId('edit-location-icon'));
    fireEvent.changeText(screen.getByTestId('location-input'), 'Los Angeles');
    fireEvent.press(screen.getByTestId('save-location-icon'));

    await waitFor(() => {
      expect(screen.getByTestId('location-display')).toHaveTextContent('Los Angeles');
    });
  });
});
