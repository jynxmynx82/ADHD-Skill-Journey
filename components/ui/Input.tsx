import React, { useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  Text,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { useAppTheme } from '@/lib/theme';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
  errorStyle?: StyleProp<TextStyle>;
  secureTextEntry?: boolean;
  touched?: boolean;
}

export const Input = React.memo(({
  label,
  error,
  leftIcon,
  rightIcon,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  secureTextEntry = false,
  touched,
  onFocus,
  onBlur,
  ...rest
}: InputProps) => {
  const { colors, spacing, borderRadius, fontSizes } = useAppTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  const togglePasswordVisibility = useCallback(() => {
    setIsPasswordVisible(prev => !prev);
  }, []);

  const handleFocus = useCallback((e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  }, [onFocus]);

  const handleBlur = useCallback((e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  }, [onBlur]);

  const passwordIcon = useMemo(() => {
    if (!secureTextEntry) return null;
    return isPasswordVisible ? (
      <EyeOff size={20} color={colors.textSecondary} />
    ) : (
      <Eye size={20} color={colors.textSecondary} />
    );
  }, [secureTextEntry, isPasswordVisible, colors.textSecondary]);

  const showError = error && (touched === undefined || touched);

  const styles = StyleSheet.create({
    container: {
      marginBottom: spacing[4],
      width: '100%',
    },
    label: {
      fontFamily: 'Inter-Regular',
      fontSize: fontSizes.sm,
      marginBottom: spacing[2],
      color: colors.textSecondary,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      backgroundColor: colors.background,
    },
    focused: {
      borderColor: colors.primary,
    },
    error: {
      borderColor: colors.error,
    },
    input: {
      flex: 1,
      fontFamily: 'Inter-Regular',
      fontSize: fontSizes.md,
      color: colors.text,
      paddingVertical: spacing[3],
      paddingHorizontal: spacing[4],
    },
    inputWithLeftIcon: {
      paddingLeft: spacing[2],
    },
    inputWithRightIcon: {
      paddingRight: spacing[2],
    },
    leftIcon: {
      paddingLeft: spacing[3],
    },
    rightIcon: {
      paddingRight: spacing[3],
    },
    errorText: {
      fontFamily: 'Inter-Regular',
      fontSize: fontSizes.xs,
      color: colors.error,
      marginTop: spacing[1],
    },
  });

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
      <View style={[styles.inputContainer, isFocused && styles.focused, showError && styles.error]}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          style={[
            styles.input,
            leftIcon ? styles.inputWithLeftIcon : null,
            (rightIcon || secureTextEntry) ? styles.inputWithRightIcon : null,
            inputStyle,
          ]}
          placeholderTextColor={colors.textSecondary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          {...rest}
        />
        {secureTextEntry && (
          <TouchableOpacity style={styles.rightIcon} onPress={togglePasswordVisibility}>
            {passwordIcon}
          </TouchableOpacity>
        )}
        {rightIcon && !secureTextEntry && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
      {showError && <Text style={[styles.errorText, errorStyle]}>{error}</Text>}
    </View>
  );
});
