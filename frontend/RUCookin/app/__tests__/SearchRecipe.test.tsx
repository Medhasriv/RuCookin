import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import SearchRecipe from "../SearchRecipe";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Text } from "react-native";

// Mock dependencies
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn() }),
  Link: jest.fn(({ children }) => children),
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaProvider: jest.fn(({ children }) => children),
  SafeAreaView: jest.fn(({ children }) => children),
  useSafeAreaInsets: jest.fn(() => ({ top: 0, right: 0, bottom: 0, left: 0 })),
}));

jest.mock("@expo/vector-icons", () => ({
  Ionicons: jest.fn(({ name }) => `Icon-${name}`),
}));

jest.mock("react-native-paper", () => {
  const { Text } = require("react-native");
  return {
    RadioButton: jest.fn(({ value, status, onPress }) => (
      <Text onPress={onPress}>Radio-{value}-{status}</Text>
    )),
    Checkbox: jest.fn(({ status, onPress }) => (
      <Text onPress={onPress}>Checkbox-{status ? "Checked" : "Unchecked"}</Text>
    )),
  };
});

jest.mock("../../utils/authChecker", () => ({
  checkAuth: jest.fn(),
  getToken: jest.fn(() => Promise.resolve("mock-token")),
  getTokenData: jest.fn(() => Promise.resolve("test-user")),
}));

const createMockResponse = (data: any, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: () => Promise.resolve(data),
} as unknown as Response);

describe("SearchRecipe Screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    global.fetch = jest.fn(() =>
      Promise.resolve(
        createMockResponse({
          results: [
            {
              id: 1,
              title: "Spaghetti",
              image: "https://example.com/spaghetti.jpg",
              summary: "<b>Tasty</b> spaghetti.",
              servings: 2,
              readyInMinutes: 30,
            },
          ],
        })
      )
    ) as jest.Mock;
  });

  test("renders the search input and button correctly", () => {
    const { getByPlaceholderText, getByText } = render(
      <SafeAreaProvider>
        <SearchRecipe />
      </SafeAreaProvider>
    );

    expect(getByPlaceholderText("Search for a recipe...")).toBeTruthy();
    expect(getByText("FILTER")).toBeTruthy();
  });

//   test("opens and closes the filter modal", async () => {
//     const { getByText, queryByText } = render(
//       <SafeAreaProvider>
//         <SearchRecipe />
//       </SafeAreaProvider>
//     );

//     fireEvent.press(getByText("FILTER"));

//     await waitFor(() => {
//       expect(getByText("Cuisine")).toBeTruthy();
//     });

//     fireEvent.press(getByText("close"));

//     await waitFor(() => {
//       expect(queryByText("Cuisine")).toBeNull();
//     });
//   });

  test("allows entering search text", () => {
    const { getByPlaceholderText } = render(
      <SafeAreaProvider>
        <SearchRecipe />
      </SafeAreaProvider>
    );

    const input = getByPlaceholderText("Search for a recipe...");
    fireEvent.changeText(input, "chicken");

    expect(input.props.value).toBe("chicken");
  });

//   test("toggles preferences checkbox in modal", async () => {
//     const { getByText } = render(
//       <SafeAreaProvider>
//         <SearchRecipe />
//       </SafeAreaProvider>
//     );

//     fireEvent.press(getByText("FILTER"));

//     const checkbox = getByText("Checkbox-Unchecked");  // Assuming initial state is "Unchecked"
//     fireEvent.press(checkbox);

//     // After press, the checkbox status should change to "Checked"
//     await waitFor(() => {
//       expect(getByText("Checkbox-Checked")).toBeTruthy();
//     });
//   });


});
