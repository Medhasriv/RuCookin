// import statements for mocks
import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import SearchRecipe from "../SearchRecipe";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Text } from "react-native";

// mock for AsyncStorage so that there is no initial saved theme
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// mock for router
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn() }),
  Link: jest.fn(({ children }) => children),
}));

// mock for SafeAreaContext which includes SafeAreaProvider and SafeAreaView
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaProvider: jest.fn(({ children }) => children),
  SafeAreaView: jest.fn(({ children }) => children),
  useSafeAreaInsets: jest.fn(() => ({ top: 0, right: 0, bottom: 0, left: 0 })),
}));

// mock for favorite icon, uses testID as a text for testing purposes
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    Ionicons: ({ name }: { name: string }) => (
      <Text testID={`icon-${name}`}>{`Icon-${name}`}</Text>
    ),
  };
});

// mock for radiobuttons and checkboxes
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

// mock for authChecker so that login is not required
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
            { // mocking a result for spaghetti
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

  // test to check if the search button is working
  test("renders the search input and button correctly", () => { // search button works
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

// display results in SafeAreaProvider
  test("allows entering search text", () => {
    const { getByPlaceholderText } = render(
      <SafeAreaProvider>
        <SearchRecipe />
      </SafeAreaProvider>
    );

    // roleplaying the user entering text "chicken" into the search input
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

// test to check if recipe is marked as favourite when star icon is clicked
});
  test("toggles favourite star icon when pressed", async () => {
      jest.clearAllMocks();
  
      // 1) GET favourites returns [1]
      // 2) complexSearch returns our one recipe
      // 3) POST/DELETE for toggling favourites
      (global.fetch as jest.Mock).mockImplementation((url: string, opts?: any) => {
        if (opts?.method === "GET" && url.includes("/routes/api/favoriteRecipe")) {
          return Promise.resolve(
            createMockResponse([1])
          );
        }
        if (url.includes("complexSearch")) {
          return Promise.resolve(
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
          );
        }
        // For toggle POST/DELETE
        if (opts?.method === "POST" || opts?.method === "DELETE") {
          return Promise.resolve(createMockResponse({}));
        }
        return Promise.reject(`Unexpected fetch: ${url}`);
      });
  
      const { getByPlaceholderText, getByTestId, getByText } = render(
        <SafeAreaProvider>
          <SearchRecipe />
      </SafeAreaProvider>
      );
  
      // perform search
      const input = getByPlaceholderText("Search for a recipe...");
      fireEvent.changeText(input, "spaghetti");
      fireEvent(input, "submitEditing");
  
      // wait for the recipe tile to show up
      await waitFor(() => {
        expect(getByText("Spaghetti")).toBeTruthy();
      });

      // since GET favourites returned [1], it should render a filled star
      expect(getByText("Icon-star")).toBeTruthy();
  
      // press the star button
      fireEvent.press(getByTestId("star-button-1"));
  
      // now it should render the outline star
      await waitFor(() => {
        expect(getByText("Icon-star-outline")).toBeTruthy();
  });
});