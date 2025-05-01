// app/__tests__/adminSignUp.test.tsx

// ─── 1) Stub AsyncStorage ─────────────────────────────────────────────────────
jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem:    jest.fn(),
    setItem:    jest.fn(),
    removeItem: jest.fn(),
  }));
  
  // ─── 2) Stub expo-constants so API_BASE is correct ─────────────────────────────
  jest.mock('expo-constants', () => ({
    manifest:   { extra: { apiUrl: 'http://localhost:3001' } },
    expoConfig: { extra: { apiUrl: 'http://localhost:3001' } },
  }));
  
  // ─── 3) Shared router mock for expo-router ────────────────────────────────────
  const mockRouter = { push: jest.fn(), replace: jest.fn() };
  jest.mock('expo-router', () => ({
    useRouter: () => mockRouter,
  }));
  
  // ─── 4) Stub out your authChecker to skip real logic ──────────────────────────
  jest.mock('../../utils/authChecker', () => ({
    checkAuth:  (_: any) => {},
    checkAdmin: (_: any) => {},
    getToken:   () => Promise.resolve('fake-token'),
  }));
  
  // ─── 5) Stub SafeAreaContext ──────────────────────────────────────────────────
  jest.mock('react-native-safe-area-context', () => ({
    SafeAreaProvider:  ({ children }: any) => children,
    SafeAreaView:      ({ children }: any) => children,
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  }));
  
  // ─── 6) Stub any bottom‐nav or other native components ────────────────────────
  jest.mock('../../components/adminBottomNavBar', () => () => null);
  
  // ─── 7) Stub React Navigation container ──────────────────────────────────────
  jest.mock('@react-navigation/native', () => ({
    NavigationContainer: ({ children }: any) => children,
  }));
  
  // ─── 8) Global fetch mock ─────────────────────────────────────────────────────
  (global.fetch as jest.Mock) = jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ token: 'abc' }),
  });
  
  // ─── Imports ───────────────────────────────────────────────────────────────────
  
  import React from 'react';
  import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
  import AsyncStorage from '@react-native-async-storage/async-storage';
  import { SafeAreaProvider } from 'react-native-safe-area-context';
  import { NavigationContainer } from '@react-navigation/native';
  import AdminSignUp from '../adminSignUp';
  
  // ─── Tests ─────────────────────────────────────────────────────────────────────
  
  describe('AdminSignUp', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it('renders form and shows validation errors', () => {
      const { getByText } = render(
        <SafeAreaProvider>
          <AdminSignUp />
        </SafeAreaProvider>
      );
      fireEvent.press(getByText('Continue'));
      expect(getByText('First name is required.')).toBeTruthy();
      expect(getByText('Last name is required.')).toBeTruthy();
    });
  
    it('submits valid form and navigates', async () => {
      const { getByPlaceholderText, getByText } = render(
        <SafeAreaProvider>
          <AdminSignUp />
        </SafeAreaProvider>
      );
  
      // Fill out the form
      fireEvent.changeText(getByPlaceholderText('First Name'), 'Alice');
      fireEvent.changeText(getByPlaceholderText('Last Name'), 'Smith');
      fireEvent.changeText(getByPlaceholderText('Email'), 'a@b.com');
      fireEvent.changeText(getByPlaceholderText('Username'), 'alice');
      fireEvent.changeText(getByPlaceholderText('Password'), 'pass123');
  
      // Press Continue inside act to flush async handlers
      await act(async () => {
        fireEvent.press(getByText('Continue'));
      });
  
      // 1) Check that fetch was called with the correct, fully-qualified URL
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:3001/routes/auth/adminCreateAccount',
          expect.objectContaining({ method: 'POST' })
        );
      });
  
      // 2) Check that the token was stored
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('token', 'abc');
  
      // 3) Check that we navigated to /adminHomePage
      expect(mockRouter.push).toHaveBeenCalledWith('/adminHomePage');
    });
  });
  