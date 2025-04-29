// frontend/RUCookin/app/__tests__/Pantry.test.tsx

import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import Pantry from "../Pantry";
import * as authChecker from "../../utils/authChecker";

// Mock react-native dependencies
jest.mock("react-native/Libraries/Animated/NativeAnimatedHelper");
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
}));
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));
jest.mock("../../components/BottomNavBar", () => () => <></>);
jest.mock("../../utils/authChecker", () => ({
  checkAuth: jest.fn(),
  getToken: jest.fn(() => Promise.resolve("mock-token")),
}));

// Setup fetch mock
global.fetch = jest.fn();

describe("Pantry Screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with static text", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    const { getByText, getByPlaceholderText } = render(<Pantry />);
    
    expect(getByText("Pantry")).toBeTruthy();
    expect(getByText("Search and add ingredients to your pantry")).toBeTruthy();
    expect(getByPlaceholderText("Search for ingredients...")).toBeTruthy();

    await waitFor(() => {
      expect(authChecker.checkAuth).toHaveBeenCalled();
      expect(fetch).toHaveBeenCalled();
    });
  });

  it("searches ingredients on submit", async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => [] }) // fetchPantryItems
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [{ id: 1, name: "apple", image: "apple.png" }],
        }),
      });

    const { getByPlaceholderText, getByText } = render(<Pantry />);

    const input = getByPlaceholderText("Search for ingredients...");
    fireEvent.changeText(input, "apple");
    fireEvent(input, "submitEditing");

    await waitFor(() => {
      expect(getByText("apple")).toBeTruthy();
    });
  });

  it("adds a new ingredient to pantry", async () => {
    const mockIngredient = { id: 2, name: "banana", image: "banana.png" };

    (fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => [] }) // fetchPantryItems on mount
      .mockResolvedValueOnce({ ok: true, json: async () => ({ results: [mockIngredient] }) }) // fetchIngredients
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) }) // POST addToPantry
      .mockResolvedValueOnce({ ok: true, json: async () => [] }); // re-fetch pantry

    const { getByPlaceholderText, getByText, queryByText } = render(<Pantry />);
    const input = getByPlaceholderText("Search for ingredients...");

    fireEvent.changeText(input, "banana");
    fireEvent(input, "submitEditing");

    await waitFor(() => expect(getByText("banana")).toBeTruthy());

    fireEvent.press(getByText("banana"));

    await waitFor(() => {
      expect(queryByText("banana")).not.toBeTruthy(); // After add, search results are cleared
    });
  });

  it("removes an ingredient from pantry", async () => {
    const mockPantryItem = [{ id: 3, name: "carrot", image: "carrot.png", expirationDate: "2025-01-01" }];

    (fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => mockPantryItem }) // fetchPantryItems
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) }); // delete

    const { getByText, getAllByRole } = render(<Pantry />);

    await waitFor(() => expect(getByText("carrot")).toBeTruthy());

    const deleteButtons = getAllByRole("button");
    fireEvent.press(deleteButtons[deleteButtons.length - 1]); // Press last button (delete)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/pantry"), expect.objectContaining({
        method: "DELETE",
      }));
    });
  });
});
