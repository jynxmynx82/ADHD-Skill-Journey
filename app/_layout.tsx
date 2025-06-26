/**
 * Root Layout
 * * This is the root layout component that handles:
 * 1. Authentication state
 * 2. Theme provider setup
 * 3. Schedule data provider setup
 * * @component
 */

import 'react-native-reanimated';
import { useEffect } from 'react';
import { Stack, useRouter, SplashScreen, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ScheduleProvider } from '@/context/ScheduleContext'; // --- 1. IMPORT THE NEW PROVIDER ---
import { FamilyProvider } from '@/context/FamilyContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Platform, StyleSheet, View, ViewStyle, ScrollView, SafeAreaView } from 'react-native';
import {
  Inter_300Light,
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold
} from '@expo-google-fonts/inter';
// Note: These Firebase imports are likely not needed here anymore if firebaseConfig.ts handles initialization.
// import { initializeAuth, browserLocalPersistence } from 'firebase/auth';
// import { getReactNativePersistence } from 'firebase/auth/react-native';
import '@/app/config/navigation';

// Keep splash screen visible until we hide it manually
SplashScreen.preventAutoHideAsync();

// Store fontsLoaded and fontError globally or pass them down if RootNavigation is separate
let appFontsLoaded = false;
let appFontError: Error | null = null;

// Global style reset for web
const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    ...(Platform.OS === 'web' ? {
      flexDirection: 'column',
      width: '100%',
    } : {}),
  } as ViewStyle,
});

// This component handles the navigation logic
function RootNavigation() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return;
    }

    // Hide splash screen once auth state is loaded
    SplashScreen.hideAsync();

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';

    if (!user && !inAuthGroup) {
      // Not signed in, redirect to auth
      router.replace('/(auth)');
    } else if (user && inAuthGroup) {
      // Signed in, redirect to main app
      router.replace('/(tabs)');
    }
  }, [user, loading, segments]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(settings)" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Light': Inter_300Light,
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    appFontsLoaded = fontsLoaded;
    appFontError = fontError;
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AuthProvider>
      <ThemeProvider>
        <ErrorBoundary>
          <FamilyProvider>
            <ScheduleProvider>
              <RootNavigation />
            </ScheduleProvider>
          </FamilyProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </AuthProvider>
  );
}

// Note: This local styles object is not used if globalStyles is used for the main View.
// It can be removed if not needed elsewhere.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    // Add appropriate styles for the header
  },
  contentContainer: {
    // Add appropriate styles for the content container
  },
});
