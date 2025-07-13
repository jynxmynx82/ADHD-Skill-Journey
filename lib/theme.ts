// lib/theme.ts
import { useColorScheme } from 'react-native';
import { theme as appTheme } from '@/constants/theme';

/**
 * Custom hook to access the application's theme.
 * This is the central utility for consuming design tokens.
 * It handles light/dark mode logic and provides simplified color access.
 */
export const useAppTheme = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  // Define simplified color mappings for easy access in components.
  // This is where you can define how your color palettes are used in light vs. dark mode.
  const colors = {
    primary: appTheme.colors.primary[600],
    secondary: appTheme.colors.secondary[500],
    accent: appTheme.colors.accent[500],
    success: appTheme.colors.success[500],
    warning: appTheme.colors.warning[500],
    error: appTheme.colors.error[500],
    
    // Mode-dependent colors
    background: isDarkMode ? appTheme.colors.gray[900] : appTheme.colors.white,
    text: isDarkMode ? appTheme.colors.white : appTheme.colors.gray[900],
    textSecondary: isDarkMode ? appTheme.colors.gray[400] : appTheme.colors.gray[600],
    border: isDarkMode ? appTheme.colors.gray[700] : appTheme.colors.gray[200],
    card: isDarkMode ? appTheme.colors.gray[800] : appTheme.colors.white,
  };

  return {
    isDarkMode,
    colors,
    spacing: appTheme.spacing,
    borderRadius: appTheme.borderRadius,
    shadows: appTheme.shadows,
    fontSizes: appTheme.fontSizes,
    fontWeights: appTheme.fontWeights,
    lineHeights: appTheme.lineHeights,
  };
};
