// Design Token System for ADHD Family Support App
// This file provides consistent design tokens across the entire application

// ============================================================================
// TYPOGRAPHY TOKENS
// ============================================================================

export const TYPOGRAPHY = {
  // Font Sizes
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
  } as const,

  // Font Weights
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: 'bold',
  } as const,

  // Typography Styles
  styles: {
    // Main page titles
    title: {
      fontSize: 24,
      fontWeight: 'bold' as const,
      color: '#333',
    },
    
    // Section headers
    sectionHeader: {
      fontSize: 20,
      fontWeight: 'bold' as const,
      color: '#333',
    },
    
    // Body text
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      color: '#333',
    },
    
    // Secondary body text
    bodySecondary: {
      fontSize: 16,
      fontWeight: '400' as const,
      color: '#666',
    },
    
    // Button text
    button: {
      fontSize: 14,
      fontWeight: '600' as const,
      color: '#ffffff',
    },
    
    // Small text (timestamps, tags, metadata)
    small: {
      fontSize: 12,
      fontWeight: '500' as const,
      color: '#666',
    },
    
    // Tab navigation
    tab: {
      fontSize: 16,
      fontWeight: '500' as const,
      color: '#666',
    },
    
    tabActive: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: '#007bff',
    },
  } as const,
} as const;

// ============================================================================
// SPACING TOKENS
// ============================================================================

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
} as const;

// ============================================================================
// COLOR TOKENS
// ============================================================================

export const COLORS = {
  // Primary colors
  primary: '#007bff',
  primaryDark: '#0056b3',
  primaryLight: '#4da6ff',
  
  // Text colors
  text: {
    primary: '#333',
    secondary: '#666',
    muted: '#888',
    inverse: '#ffffff',
  },
  
  // Background colors
  background: {
    primary: '#ffffff',
    secondary: '#f8f9fa',
    tertiary: '#e9ecef',
  },
  
  // Border colors
  border: {
    light: '#e0e0e0',
    medium: '#ced4da',
    dark: '#adb5bd',
  },
  
  // Status colors
  status: {
    success: '#28a745',
    warning: '#ffc107',
    error: '#dc3545',
    info: '#17a2b8',
  },
  
  // Interactive colors
  interactive: {
    hover: '#0056b3',
    active: '#004085',
    disabled: '#6c757d',
  },
} as const;

// ============================================================================
// LAYOUT TOKENS
// ============================================================================

export const LAYOUT = {
  // SafeArea configuration
  safeArea: {
    edges: ['top'] as const,
    style: {
      flex: 1,
      backgroundColor: COLORS.background.primary,
    },
  },
  
  // Header configuration
  header: {
    padding: SPACING.md,
    paddingTop: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
    backgroundColor: COLORS.background.primary,
  },
  
  // Container configuration
  container: {
    paddingHorizontal: SPACING.md,
  },
  
  // Card configuration
  card: {
    backgroundColor: COLORS.background.primary,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  
  // Button configuration
  button: {
    primary: {
      backgroundColor: COLORS.primary,
      borderRadius: 8,
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    secondary: {
      backgroundColor: COLORS.interactive.disabled,
      borderRadius: 8,
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
  },
} as const;

// ============================================================================
// BORDER RADIUS TOKENS
// ============================================================================

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

// ============================================================================
// SHADOW TOKENS
// ============================================================================

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const createTypographyStyle = (variant: keyof typeof TYPOGRAPHY.styles) => {
  return TYPOGRAPHY.styles[variant];
};

export const createSpacingStyle = (size: keyof typeof SPACING) => {
  return SPACING[size];
};

export const createColorStyle = (colorPath: string) => {
  const path = colorPath.split('.');
  let color: any = COLORS;
  for (const key of path) {
    color = color[key];
  }
  return color;
};

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type TypographyVariant = keyof typeof TYPOGRAPHY.styles;
export type SpacingSize = keyof typeof SPACING;
export type ColorPath = string; // e.g., 'text.primary', 'status.success'

// ============================================================================
// LEGACY MIGRATION HELPERS
// ============================================================================

// Map old font sizes to new tokens
export const FONT_SIZE_MIGRATION = {
  12: TYPOGRAPHY.sizes.xs,
  14: TYPOGRAPHY.sizes.sm,
  16: TYPOGRAPHY.sizes.md,
  18: TYPOGRAPHY.sizes.lg,
  20: TYPOGRAPHY.sizes.xl,
  24: TYPOGRAPHY.sizes['2xl'],
  28: TYPOGRAPHY.sizes['3xl'],
} as const;

// Map old colors to new tokens
export const COLOR_MIGRATION = {
  '#333': COLORS.text.primary,
  '#666': COLORS.text.secondary,
  '#888': COLORS.text.muted,
  '#007bff': COLORS.primary,
  '#6c757d': COLORS.interactive.disabled,
  '#ffffff': COLORS.text.inverse,
  '#e0e0e0': COLORS.border.light,
  '#ced4da': COLORS.border.medium,
} as const; 