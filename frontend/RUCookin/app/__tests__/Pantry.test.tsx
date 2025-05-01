// mock for constants to avoid problems with Jest and our Cloud Deployment
jest.mock('expo-constants', () => ({
  manifest: { extra: { apiUrl: 'http://localhost:3001', spoonacularApiKey: 'fake-key' } },
  // fallback field name in newer Expo SDKs:
  expoConfig: { extra: { apiUrl: 'http://localhost:3001', spoonacularApiKey: 'fake-key' } },
}));

import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import Pantry from "../Pantry";
import * as authChecker from "../../utils/authChecker";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Mock dependencies
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
}));

jest.mock("../../utils/authChecker", () => ({
  checkAuth: jest.fn(),
  getToken: jest.fn(() => Promise.resolve("fake-token")),
}));

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve([
        { id: 1, name: "Apple", image: "apple.png", expirationDate: "2025-05-01T00:00:00Z" },
      ]),
    })
  ) as jest.Mock;
});

describe("Pantry", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders header and fetches pantry items", async () => {
    const { getByText, getByPlaceholderText } = render(<Pantry />);

    await waitFor(() => {
      expect(getByText("Pantry")).toBeTruthy();
      expect(getByText("Apple")).toBeTruthy();
    });

    expect(getByPlaceholderText("Search for ingredients...")).toBeTruthy();
  });

  it("searches and adds ingredient on submit", async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            results: [{ id: 2, name: "Banana", image: "banana.png" }],
          }),
      })
    );

    const { getByPlaceholderText, getByText } = render(<Pantry />);

    const input = getByPlaceholderText("Search for ingredients...");
    fireEvent.changeText(input, "Banana");
    fireEvent(input, "submitEditing");

    await waitFor(() => {
      expect(getByText("Banana")).toBeTruthy();
    });
  });

  it("displays expiration date and allows editing", async () => {
    const { getByDisplayValue, getByText } = render(<Pantry />);

    await waitFor(() => {
      expect(getByDisplayValue("2025-05-01")).toBeTruthy();
    });

    const saveButton = getByText("Save");
    expect(saveButton).toBeTruthy();
  });
});
