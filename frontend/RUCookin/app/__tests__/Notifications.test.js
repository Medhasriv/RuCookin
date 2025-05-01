// mock for constants to avoid problems with Jest and our Cloud Deployment
jest.mock('expo-constants', () => ({
  manifest: { extra: { apiUrl: 'http://localhost:3001', spoonacularApiKey: 'fake-key' } },
  // fallback field name in newer Expo SDKs:
  expoConfig: { extra: { apiUrl: 'http://localhost:3001', spoonacularApiKey: 'fake-key' } },
}));

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Index from '../../Index'; 
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock 
jest.mock('expo-notifications', () => ({
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve()),
  cancelAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve()),
  addNotificationResponseReceivedListener: jest.fn(),
  addNotificationReceivedListener: jest.fn(),
  EventEmitter: {
    addListener: jest.fn(),
    removeAllListeners: jest.fn(),
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

jest.mock('expo', () => ({
  registerRootComponent: jest.fn(),
}));

describe('Notification Toggle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the switch and toggles it', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce('false');

    const { getByText, getByRole } = render(<Index />);
    const switchComponent = getByRole('switch');

    expect(getByText('Enable Notifications:')).toBeTruthy();
    expect(switchComponent.props.value).toBe(false);

    fireEvent(switchComponent, 'valueChange');

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'notificationsEnabled',
        'true'
      );
      expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
    });
  });

  it('schedules notifications when enabled & permission granted', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce('true');

    render(<Index />);

    await waitFor(() => {
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(3);
    });
  });
});
