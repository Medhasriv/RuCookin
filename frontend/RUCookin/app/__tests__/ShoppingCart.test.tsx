import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ShoppingCart from '../ShoppingCart';
import { useRouter } from 'expo-router';
import * as authChecker from "../../utils/authChecker";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));
jest.mock('../utils/authChecker', () => ({
  checkAuth: jest.fn(),
  getToken: jest.fn(),
}));
jest.mock('@react-native-async-storage/async-storage');
jest.mock('expo-web-browser');
jest.mock('expo-linking');

global.fetch = jest.fn();

const mockRouterPush = jest.fn();
(useRouter as jest.Mock).mockReturnValue({ push: mockRouterPush });

describe('ShoppingCart', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders shopping cart header and search input', async () => {
    (authChecker.checkAuth as jest.Mock).mockImplementation(() => {});
    (authChecker.getToken as jest.Mock).mockResolvedValue('test-token');
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    const { getByText, getByPlaceholderText } = render(<ShoppingCart />);
    
    expect(getByText('Shopping Cart')).toBeTruthy();
    expect(getByPlaceholderText('Search for item here...')).toBeTruthy();
  });

  it('adds item to cart when submitted', async () => {
    (authChecker.getToken as jest.Mock).mockResolvedValue('token123');
    (fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => [] }) // initial fetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) }); // add item

    const { getByPlaceholderText, getByText } = render(<ShoppingCart />);
    const input = getByPlaceholderText('Search for item here...');
    const button = getByText('Add To Cart');

    fireEvent.changeText(input, 'Bananas');
    fireEvent.press(button);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/shoppingCart'),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  it('removes item from cart', async () => {
    (authChecker.getToken as jest.Mock).mockResolvedValue('token123');
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { _id: 'item-1', itemName: 'Apples', quantity: 1, origin: 'Search' },
        ],
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    const { getByText, getByRole, queryByText } = render(<ShoppingCart />);
    await waitFor(() => expect(getByText('Apples')).toBeTruthy());

    const removeButton = getByRole('button');
    fireEvent.press(removeButton);

    await waitFor(() => {
      expect(queryByText('Apples')).toBeNull();
    });
  });

  it('initiates Kroger login and redirects on success', async () => {
    (WebBrowser.openAuthSessionAsync as jest.Mock).mockResolvedValue({
      type: 'success',
      url: 'myapp://KrogerShoppingCart?token=fake-token',
    });

    const { getByText } = render(<ShoppingCart />);
    const krogerButton = getByText('Login with Kroger');

    fireEvent.press(krogerButton);

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('krogerToken', 'fake-token');
      expect(mockRouterPush).toHaveBeenCalledWith('/KrogerShoppingCart');
    });
  });
});
