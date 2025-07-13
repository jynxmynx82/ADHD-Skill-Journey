import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, Platform } from 'react-native';
import { useAppTheme } from '@/lib/theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const Card = ({ children, style }: CardProps) => {
  const { colors, borderRadius, shadows } = useAppTheme();

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: 16,
      ...Platform.select({
        web: shadows.md,
        native: shadows.sm,
      }),
      borderWidth: Platform.OS === 'web' ? 0 : 1,
      borderColor: colors.border,
    },
  });

  return <View style={[styles.card, style]}>{children}</View>;
};
