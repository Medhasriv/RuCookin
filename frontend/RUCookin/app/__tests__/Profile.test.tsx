import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import Profile from './Profile';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve('dark')),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

it('renders Profile correctly', async () => {
  await waitFor(() => {
    render(<Profile />);
  });

  expect(screen.findByText("JohnDoe's Profile")).toBeTruthy();
  expect(screen.findByText("John")).toBeTruthy();
  expect(screen.findByText("Doe")).toBeTruthy();
  expect(screen.findByText('john@example.com')).toBeTruthy();
  expect(screen.findByText('New York')).toBeTruthy();
});

test('toggleEditing should toggle the editing state for firstName', () => {
  const { getByText, getByTestId } = render(<Profile />);

  expect(getByText("First Name:")).toBeTruthy();
  
  const editButton = getByTestId('edit-firstName');
  fireEvent.press(editButton);
  
  expect(getByTestId('firstName-input')).toBeTruthy();
});

it('saves changes to first name', async () => {
  await waitFor(() => render(<Profile />));

  fireEvent.press(screen.getByTestId('edit-first-name-icon'));
  fireEvent.changeText(screen.getByDisplayValue('John'), 'Jane');
  fireEvent.press(screen.getByTestId('save-first-name-icon'));

  expect(screen.findByText('Jane')).toBeTruthy();
});

it('saves changes to last name', async () => {
  await waitFor(() => render(<Profile />));

  fireEvent.press(screen.getByTestId('edit-last-name-icon'));
  fireEvent.changeText(screen.getByDisplayValue("Doe"), 'Smith');
  fireEvent.press(screen.getByTestId('save-last-name-icon'));

  expect(await screen.findByText('Smith')).toBeTruthy();
});

test('edits email successfully', async () => {
  render(<Profile />);

  fireEvent.press(screen.getByTestId('edit-email-icon'));

  await waitFor(() => {
    expect(screen.getByTestId('email-input')).toBeTruthy();
  });

  fireEvent.changeText(screen.getByTestId('email-input'), 'jane@example.com');
  fireEvent.press(screen.getByTestId('save-email-icon'));

  await waitFor(() => {
    expect(screen.getByTestId('email-display')).toHaveTextContent('jane@example.com');
  });
});

test('edits location successfully', async () => {
  render(<Profile />);

  fireEvent.press(screen.getByTestId('edit-location-icon'));

  await waitFor(() => {
    expect(screen.getByTestId('location-input')).toBeTruthy();
  });

  fireEvent.changeText(screen.getByTestId('location-input'), 'Los Angeles');
  fireEvent.press(screen.getByTestId('save-location-icon'));

  await waitFor(() => {
    expect(screen.getByTestId('location-display')).toHaveTextContent('Los Angeles');
  });
});
