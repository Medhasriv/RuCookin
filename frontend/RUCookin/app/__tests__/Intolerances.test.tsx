import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import CuisineIntolerances from '../Intolerances';
import { useRouter } from 'expo-router';
import { checkAuth, getTokenData } from "../../utils/authChecker";

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// mck necessary functions
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../utils/authChecker', () => ({
  checkAuth: jest.fn(),
  getTokenData: jest.fn().mockResolvedValue('test-username'), // mocking token data
}));

// nock global fetch function w/ jest.fn()
global.fetch = jest.fn();

describe('CuisineIntolerances Component', () => {
  it('renders correctly', () => {
    render(<CuisineIntolerances />);
    
    expect(screen.getByText("Almost done. Select your food intolerances")).toBeTruthy();
  });

  it('toggles cuisine selection', async () => {
    render(<CuisineIntolerances />);
  
    // find a cuisine button & press
    const cuisineButton = screen.getByText('Peanut');
  
    //deselect the cuisine
    fireEvent.press(cuisineButton);
  
    expect(
      cuisineButton.props.style.some((style: { backgroundColor?: string }) => style.backgroundColor === '#FFC074')
    ).toBe(false);
  });

  it('calls handleContinue when the continue button is pressed and navigates', async () => {
    // nock router.push method
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    
    // mock the fetch
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
      status: 200,
      statusText: 'OK',
      headers: new Headers(),
      redirected: false,
    });

    render(<CuisineIntolerances />);
    
    //press the continue button
    const continueButton = screen.getByText('Continue');
    fireEvent.press(continueButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/HomePage');
    });

    //getTokenData was called with the correct argument
    expect(getTokenData).toHaveBeenCalledWith('username');
  });

  it('does not navigate if the API response not ok', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Error occurred' }),
      status: 400,
      statusText: 'Bad Request',
      headers: new Headers(),
      redirected: false,
    });

    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

    render(<CuisineIntolerances />);
    
    const continueButton = screen.getByText('Continue');
    fireEvent.press(continueButton);

    // after api call
    await waitFor(() => {
      // router.push was not called when the response is not ok
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
