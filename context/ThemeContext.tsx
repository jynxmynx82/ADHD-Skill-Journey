/**
 * Theme Context
 * 
 * This context provides theme-related functionality across the app.
 * Currently supports:
 * - Light/dark mode
 * - Role-based theming (parent/adult)
 * 
 * @component
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { useAuth } from './AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  colors: typeof lightColors;
  setTheme: (theme: Theme) => Promise<void>;
}

const lightColors = {
  primary: '#007AFF',
  background: '#FFFFFF',
  text: '#000000',
  textSecondary: '#666666',
  border: '#DDDDDD',
  error: '#FF3B30',
  success: '#34C759',
  card: '#FFFFFF',
};

const darkColors = {
  ...lightColors,
  background: '#000000',
  text: '#FFFFFF',
  textSecondary: '#999999',
  border: '#333333',
  card: '#1C1C1E',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const systemColorScheme = useColorScheme();
  const { userData } = useAuth();

  // Load saved theme preference
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme) {
          setThemeState(savedTheme as Theme);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    };
    loadTheme();
  }, []);

  const setTheme = async (newTheme: Theme) => {
    try {
      await AsyncStorage.setItem('theme', newTheme);
      setThemeState(newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  // Determine if dark mode should be active
  const isDark = theme === 'system' 
    ? systemColorScheme === 'dark'
    : theme === 'dark';

  const colors = isDark ? darkColors : lightColors;

  const value = {
    theme,
    isDark,
    colors,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 