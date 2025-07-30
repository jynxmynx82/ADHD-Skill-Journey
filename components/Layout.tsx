import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native';
import { LAYOUT, TYPOGRAPHY, COLORS, SPACING, SHADOWS } from '@/constants/designTokens';

// ============================================================================
// SAFE AREA COMPONENT
// ============================================================================

interface AppSafeAreaProps {
  children: React.ReactNode;
  style?: ViewStyle;
  backgroundColor?: string;
}

export const AppSafeArea: React.FC<AppSafeAreaProps> = ({ 
  children, 
  style, 
  backgroundColor = COLORS.background.primary 
}) => {
  return (
    <SafeAreaView style={[LAYOUT.safeArea.style, { backgroundColor }, style]}>
      {children}
    </SafeAreaView>
  );
};

// ============================================================================
// PAGE HEADER COMPONENT
// ============================================================================

interface PageHeaderProps {
  title: string;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  onBack?: () => void;
  rightComponent?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  style, 
  titleStyle,
  onBack,
  rightComponent
}) => {
  return (
    <View style={[LAYOUT.header, style]}>
      <View style={styles.headerContent}>
        {onBack && (
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={[TYPOGRAPHY.styles.body, { color: COLORS.primary }]}>←</Text>
          </TouchableOpacity>
        )}
        <Text style={[TYPOGRAPHY.styles.title, titleStyle, { flex: 1 }]}>
          {title}
        </Text>
        {rightComponent && (
          <View style={styles.rightComponent}>
            {rightComponent}
          </View>
        )}
      </View>
    </View>
  );
};

// ============================================================================
// SECTION HEADER COMPONENT
// ============================================================================

interface SectionHeaderProps {
  title: string;
  style?: ViewStyle;
  titleStyle?: TextStyle;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  title, 
  style, 
  titleStyle 
}) => {
  return (
    <View style={[styles.sectionHeader, style]}>
      <Text style={[TYPOGRAPHY.styles.sectionHeader, titleStyle]}>
        {title}
      </Text>
    </View>
  );
};

// ============================================================================
// CARD COMPONENT
// ============================================================================

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof SPACING;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  style, 
  padding = 'md' 
}) => {
  return (
    <View style={[
      LAYOUT.card, 
      { padding: SPACING[padding] }, 
      style
    ]}>
      {children}
    </View>
  );
};

// ============================================================================
// CONTAINER COMPONENT
// ============================================================================

interface ContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof SPACING;
}

export const Container: React.FC<ContainerProps> = ({ 
  children, 
  style, 
  padding = 'md' 
}) => {
  return (
    <View style={[
      LAYOUT.container, 
      { paddingHorizontal: SPACING[padding] }, 
      style
    ]}>
      {children}
    </View>
  );
};

// ============================================================================
// BUTTON COMPONENT
// ============================================================================

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  title, 
  onPress, 
  variant = 'primary',
  style,
  textStyle,
  disabled = false
}) => {
  const buttonStyle = disabled 
    ? [LAYOUT.button.secondary, { opacity: 0.6 }, style]
    : [LAYOUT.button[variant], style];

  const textStyleFinal = disabled
    ? [TYPOGRAPHY.styles.button, { color: COLORS.text.muted }, textStyle]
    : [TYPOGRAPHY.styles.button, textStyle];

  return (
    <View style={buttonStyle} onTouchEnd={disabled ? undefined : onPress}>
      <Text style={textStyleFinal}>
        {title}
      </Text>
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  sectionHeader: {
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  backButton: {
    marginRight: SPACING.sm,
    padding: SPACING.xs,
  },
  rightComponent: {
    marginLeft: SPACING.sm,
  },
});

// ============================================================================
// EXPORTS
// ============================================================================

export {
  LAYOUT,
  TYPOGRAPHY,
  COLORS,
  SPACING,
  SHADOWS,
  BORDER_RADIUS,
} from '@/constants/designTokens'; 