import React from "react";
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ShoppingCart from "../ShoppingCart";
import * as authChecker from "../../utils/authChecker";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Mock navigation
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(),
}));

// Mock authChecker
jest.mock("../../utils/authChecker", () => ({
  checkAuth: jest.fn(),
  getToken: jest.fn(() => Promise.resolve("mock-token")),
}));

// Mock WebBrowser and Linking
jest.mock("expo-web-browser", () => ({
  openAuthSessionAsync: jest.fn(() =>
    Promise.resolve({ type: "success", url: "myapp://KrogerShoppingCart?token=kroger123" })
  ),
}));
jest.mock("expo-linking", () => ({
  createURL: jest.fn(() => "myapp://KrogerShoppingCart"),
}));

describe("ShoppingCart", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock) = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve([
            {
              _id: "1",
              itemName: "Milk",
              quantity: 1,
              origin: "Recipe",
            },
          ]),
      })
    );
  });

  it('renders shopping cart header and items', async () => {
    const { getByPlaceholderText, getByText } = render(<ShoppingCart />);
  
    // Ensure header is rendered
    await waitFor(() => expect(getByText("Shopping Cart")).toBeTruthy());
  
    // Simulate typing "Milk" into the input
    const input = getByPlaceholderText("Search for item here...");
    fireEvent.changeText(input, "Milk");
  
    // Simulate clicking "Add To Cart"
    const addButton = getByText("Add To Cart");
    fireEvent.press(addButton);
  
    // Wait for "Milk" to appear in the cart
    await waitFor(() => expect(getByText("Milk")).toBeTruthy());
  });

  it("adds a new item on submit", async () => {
    const { getByPlaceholderText, getByText } = render(<ShoppingCart />);
    const input = getByPlaceholderText("Search for item here...");
    fireEvent.changeText(input, "Eggs");

    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    );

    fireEvent(input, "submitEditing");

    await waitFor(() => {
      expect(getByText("Eggs")).toBeTruthy();
    });
  });

  it("removes an item from the cart", async () => {
    const { getByText, getAllByRole } = render(<ShoppingCart />);
    await waitFor(() => expect(getByText("Milk")).toBeTruthy());

    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    );

    const removeButtons = getAllByRole("button");
    fireEvent.press(removeButtons[0]); // Assume first remove button

    await waitFor(() => {
      expect(() => getByText("Milk")).toThrow(); // Milk should be gone
    });
  });

  it("shows Kroger login button", async () => {
    const { getByText } = render(<ShoppingCart />);
    await waitFor(() => expect(getByText("Login with Kroger")).toBeTruthy());
  });
});
