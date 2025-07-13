import {
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  View,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { useAppTheme } from '@/lib/theme'; // Import the new hook

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean;
}

export const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) => {
  const { colors, fontWeights, fontSizes, borderRadius, spacing } = useAppTheme();

  const styles = StyleSheet.create({
    button: {
      borderRadius: borderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
    },
    fullWidth: {
      width: '100%',
    },
    contentContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconLeft: {
      marginRight: spacing[2],
    },
    iconRight: {
      marginLeft: spacing[2],
    },
    sm: {
      paddingVertical: spacing[2],
      paddingHorizontal: spacing[4],
    },
    md: {
      paddingVertical: spacing[3],
      paddingHorizontal: spacing[5],
    },
    lg: {
      paddingVertical: spacing[4],
      paddingHorizontal: spacing[6],
    },
    smText: {
      fontSize: fontSizes.sm,
    },
    mdText: {
      fontSize: fontSizes.md,
    },
    lgText: {
      fontSize: fontSizes.lg,
    },
    text: {
      fontFamily: 'Inter-SemiBold', // Assuming this font is loaded
      textAlign: 'center',
    },
    // Variant styles using the new theme hook
    primary: { backgroundColor: colors.primary },
    primaryText: { color: colors.background },
    primaryDisabled: { backgroundColor: colors.primary, opacity: 0.5 },
    secondary: { backgroundColor: colors.secondary },
    secondaryText: { color: colors.background },
    secondaryDisabled: { backgroundColor: colors.secondary, opacity: 0.5 },
    outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.primary },
    outlineText: { color: colors.primary },
    outlineDisabled: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
    ghost: { backgroundColor: 'transparent' },
    ghostText: { color: colors.primary },
    ghostDisabled: { backgroundColor: 'transparent' },
    link: { backgroundColor: 'transparent', paddingVertical: 0, paddingHorizontal: 0 },
    linkText: { color: colors.primary, textDecorationLine: 'underline' },
    linkDisabled: { backgroundColor: 'transparent' },
    danger: { backgroundColor: colors.error },
    dangerText: { color: colors.background },
    dangerDisabled: { backgroundColor: colors.error, opacity: 0.5 },
    // Disabled text styles
    disabledText: { color: colors.textSecondary },
  });

  const getButtonStyles = () => {
    const baseStyle = [styles.button, styles[size], fullWidth && styles.fullWidth];
    return StyleSheet.flatten([...baseStyle, styles[variant], (disabled || loading) && styles[`${variant}Disabled`]]);
  };

  const getTextStyles = () => {
    const baseStyle = [styles.text, styles[`${size}Text`]];
    const variantTextStyle = styles[`${variant}Text` as keyof typeof styles] || {};
    const disabledTextStyle = disabled ? styles.disabledText : {};
    return StyleSheet.flatten([baseStyle, variantTextStyle, disabledTextStyle]);
  };

  const flattenedStyle = style ? StyleSheet.flatten([getButtonStyles(), style]) : getButtonStyles();
  const flattenedTextStyle = textStyle ? StyleSheet.flatten([getTextStyles(), textStyle]) : getTextStyles();
  const activityIndicatorColor = (styles[`${variant}Text` as keyof typeof styles] as TextStyle)?.color || colors.text;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={flattenedStyle}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={activityIndicatorColor} />
      ) : (
        <View style={styles.contentContainer}>
          {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
          <Text style={flattenedTextStyle}>{title}</Text>
          {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};