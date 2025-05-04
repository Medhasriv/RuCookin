// KrogerShoppingCart.test.tsx
jest.mock('expo-constants', () => ({
  manifest: { extra: { apiUrl: 'http://localhost:3001', spoonacularApiKey: 'fake-key' } },
  expoConfig: { extra: { apiUrl: 'http://localhost:3001', spoonacularApiKey: 'fake-key' } },
}));

import React from "react";
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import KrogerShoppingCart from "../KrogerShoppingCart";
import AsyncStorage from "@react-native-async-storage/async-storage";

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(),
}));

jest.mock("../../utils/authChecker", () => ({
  checkAuth: jest.fn(),
  getToken: jest.fn(() => Promise.resolve("mock-token")),
}));

describe("KrogerShoppingCart", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (global.fetch as jest.Mock) = jest.fn((url: string) => {
      if (url.endsWith("/routes/api/shoppingCart")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              { _id: "1", itemName: "Apple", quantity: 2, origin: "Recipe" },
              { _id: "2", itemName: "Milk", quantity: 1, origin: "Recipe" },
            ]),
        });
      } else if (url.endsWith("/routes/api/krogerCart/prices")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              matched: [{ name: "Apple", price: 1.99, productId: "0000000003507" }],
              not_found: ["Milk"],
              total_cost: "3.98",
            }),
        });
      } else if (url.endsWith("/routes/api/krogerCart/clear")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });
      }
      return Promise.reject(new Error("Unhandled URL"));
    });
  });

  it('renders Kroger shopping cart header and items correctly', async () => {
    const { getByText } = render(<KrogerShoppingCart />);

    await waitFor(() => expect(getByText("Kroger Price Checker")).toBeTruthy());
    await waitFor(() => expect(getByText("Apple")).toBeTruthy());
    await waitFor(() => expect(getByText("Milk")).toBeTruthy());
  });

  it("fetches and displays Kroger prices correctly", async () => {
    const { getByPlaceholderText, getByText } = render(<KrogerShoppingCart />);

    const zipcodeInput = getByPlaceholderText("Enter ZIP Code");
    fireEvent.changeText(zipcodeInput, "45202");
    fireEvent(zipcodeInput, "submitEditing");

    await waitFor(() => expect(getByText("$1.99")).toBeTruthy());
  });

  // it("clears Kroger cart correctly", async () => {
  //   const { getByText, queryByText } = render(<KrogerShoppingCart />);

  //   await waitFor(() => expect(getByText("Apple")).toBeTruthy());

  //   const clearButton = getByText("Clear the Kroger List");
  //   fireEvent.press(clearButton);

  //   await waitFor(() => {
  //     expect(queryByText("Apple")).toBeNull();
  //     expect(queryByText("Milk")).toBeNull();
  //   });
  // });
});
