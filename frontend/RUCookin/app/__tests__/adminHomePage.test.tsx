// app/__tests__/adminHomePage.test.tsx

// 1) Stub AsyncStorage so we don’t hit native
jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem:    jest.fn(),
    setItem:    jest.fn(),
    removeItem: jest.fn(),
  }));
  
  // 2) Stub expo-constants so API_BASE is defined
  jest.mock('expo-constants', () => ({
    manifest:   { extra: { apiUrl: 'http://localhost:3001' } },
    expoConfig: { extra: { apiUrl: 'http://localhost:3001' } },
  }));
  
  // 3) Shared mockRouter for expo-router
  const mockRouter = { push: jest.fn() };
  jest.mock('expo-router', () => ({
    useRouter: () => mockRouter,
  }));
  
  // 4) Stub SafeAreaContext
  jest.mock('react-native-safe-area-context', () => ({
    SafeAreaProvider:  ({ children }: any) => children,
    SafeAreaView:      ({ children }: any) => children,
    useSafeAreaInsets: () => ({ top:0, right:0, bottom:0, left:0 }),
  }));
  
  // 5) Stub bottom nav so it doesn’t pull in native
  jest.mock('../../components/adminBottomNavBar', () => () => null);
  
  // 6) Stub react-navigation’s container (since the test wraps it)
  jest.mock('@react-navigation/native', () => ({
    NavigationContainer: ({ children }: any) => children,
  }));
  
  // 7) Stub out authChecker so real logic (alerts, router.replace) doesn’t run
  jest.mock('../../utils/authChecker', () => ({
    checkAuth:  jest.fn(),
    checkAdmin: jest.fn(),
  }));
  
  import React from 'react';
  import { render, fireEvent } from '@testing-library/react-native';
  import AdminHomePage from '../adminHomePage';
  import AsyncStorage from '@react-native-async-storage/async-storage';
  import { SafeAreaProvider } from 'react-native-safe-area-context';
  import { NavigationContainer } from '@react-navigation/native';
  
  describe('AdminHomePage', () => {
    it('renders title and logout button', () => {
      const { getByText } = render(
        <NavigationContainer>
          <SafeAreaProvider>
            <AdminHomePage />
          </SafeAreaProvider>
        </NavigationContainer>
      );
      expect(getByText('Admin Dashboard')).toBeTruthy();
      expect(getByText('Log Out')).toBeTruthy();
    });
  
    it('clears storage and navigates on logout', () => {
      const { getByText } = render(
        <NavigationContainer>
          <SafeAreaProvider>
            <AdminHomePage />
          </SafeAreaProvider>
        </NavigationContainer>
      );
      fireEvent.press(getByText('Log Out'));
  
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('token');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('userTheme');
      expect(mockRouter.push).toHaveBeenCalledWith('/Login');
    });
  });
  