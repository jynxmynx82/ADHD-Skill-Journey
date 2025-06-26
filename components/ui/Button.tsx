
import { 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator,
  View,
  StyleProp,
  TextStyle,
  ViewStyle
} from 'react-native';
import { theme } from '@/constants/theme';

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
  
  const getButtonStyles = () => {
    const baseStyle = [styles.button, styles[size], fullWidth && styles.fullWidth];
    
    if (disabled) {
      return StyleSheet.flatten([...baseStyle, styles[`${variant}Disabled`]]);
    }
    
    return StyleSheet.flatten([...baseStyle, styles[variant]]);
  };
  
  const getTextStyles = () => {
    const baseStyle = [styles.text, styles[`${size}Text`]];
    
    if (disabled) {
      return StyleSheet.flatten([...baseStyle, styles[`${variant}DisabledText`]]);
    }
    
    return StyleSheet.flatten([...baseStyle, styles[`${variant}Text`]]);
  };

  const flattenedStyle = style ? StyleSheet.flatten([getButtonStyles(), style]) : getButtonStyles();
  const flattenedTextStyle = textStyle ? StyleSheet.flatten([getTextStyles(), textStyle]) : getTextStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={flattenedStyle}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={styles[`${variant}Text`].color} />
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

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
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
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  sm: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  md: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  lg: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  smText: {
    fontSize: 14,
  },
  mdText: {
    fontSize: 16,
  },
  lgText: {
    fontSize: 18,
  },
  text: {
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
  // Primary Button
  primary: {
    backgroundColor: theme.colors.primary[600],
  },
  primaryText: {
    color: theme.colors.white,
  },
  primaryDisabled: {
    backgroundColor: theme.colors.primary[300],
  },
  primaryDisabledText: {
    color: theme.colors.white,
  },
  // Secondary Button
  secondary: {
    backgroundColor: theme.colors.secondary[600],
  },
  secondaryText: {
    color: theme.colors.white,
  },
  secondaryDisabled: {
    backgroundColor: theme.colors.secondary[300],
  },
  secondaryDisabledText: {
    color: theme.colors.white,
  },
  // Outline Button
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary[600],
  },
  outlineText: {
    color: theme.colors.primary[600],
  },
  outlineDisabled: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
  },
  outlineDisabledText: {
    color: theme.colors.gray[400],
  },
  // Ghost Button
  ghost: {
    backgroundColor: 'transparent',
  },
  ghostText: {
    color: theme.colors.primary[600],
  },
  ghostDisabled: {
    backgroundColor: 'transparent',
  },
  ghostDisabledText: {
    color: theme.colors.gray[400],
  },
  // Link Button
  link: {
    backgroundColor: 'transparent',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  linkText: {
    color: theme.colors.primary[600],
    textDecorationLine: 'underline',
  },
  linkDisabled: {
    backgroundColor: 'transparent',
  },
  linkDisabledText: {
    color: theme.colors.gray[400],
    textDecorationLine: 'underline',
  },
  // Danger Button
  danger: {
    backgroundColor: theme.colors.error[600],
  },
  dangerText: {
    color: theme.colors.white,
  },
  dangerDisabled: {
    backgroundColor: theme.colors.error[300],
  },
  dangerDisabledText: {
    color: theme.colors.white,
  },
});