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
import { theme } from '@/constants/theme';

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
  onChangeText,
  ...rest
}: InputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  // Memoized event handlers to prevent re-renders
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

  // Memoized icons to prevent re-creation
  const passwordIcon = useMemo(() => {
    if (!secureTextEntry) return null;
    return isPasswordVisible ? (
      <EyeOff size={20} color={theme.colors.gray[500]} />
    ) : (
      <Eye size={20} color={theme.colors.gray[500]} />
    );
  }, [secureTextEntry, isPasswordVisible]);

  const showError = error && (touched === undefined || touched);

  // Memoized styles to prevent recalculation
  const containerStyles = useMemo(() => 
    containerStyle ? StyleSheet.flatten([styles.container, containerStyle]) : styles.container,
    [containerStyle]
  );

  const labelStyles = useMemo(() => 
    labelStyle ? StyleSheet.flatten([styles.label, labelStyle]) : styles.label,
    [labelStyle]
  );

  const inputContainerStyles = useMemo(() => 
    StyleSheet.flatten([
      styles.inputContainer,
      isFocused ? styles.focused : null,
      showError ? styles.error : null,
    ].filter(Boolean)),
    [isFocused, showError]
  );

  const inputStyles = useMemo(() => 
    StyleSheet.flatten([
      styles.input,
      leftIcon ? styles.inputWithLeftIcon : null,
      (rightIcon || secureTextEntry) ? styles.inputWithRightIcon : null,
      inputStyle,
    ].filter(Boolean)),
    [leftIcon, rightIcon, secureTextEntry, inputStyle]
  );

  const errorTextStyles = useMemo(() => 
    errorStyle ? StyleSheet.flatten([styles.errorText, errorStyle]) : styles.errorText,
    [errorStyle]
  );

  return (
    <View style={containerStyles}>
      {label && (
        <Text style={labelStyles}>{label}</Text>
      )}
      <View style={inputContainerStyles}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          style={inputStyles}
          placeholderTextColor={theme.colors.gray[400]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          {...rest}
        />
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.rightIcon}
            onPress={togglePasswordVisibility}
          >
            {passwordIcon}
          </TouchableOpacity>
        )}
        {rightIcon && !secureTextEntry && (
          <View style={styles.rightIcon}>{rightIcon}</View>
        )}
      </View>
      {showError && (
        <Text style={errorTextStyles}>{error}</Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginBottom: 8,
    color: theme.colors.gray[700],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    borderRadius: 8,
    backgroundColor: theme.colors.white,
  },
  focused: {
    borderColor: theme.colors.primary[500],
  },
  error: {
    borderColor: theme.colors.error[500],
  },
  input: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: theme.colors.gray[900],
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  inputWithLeftIcon: {
    paddingLeft: 8,
  },
  inputWithRightIcon: {
    paddingRight: 8,
  },
  leftIcon: {
    paddingLeft: 12,
  },
  rightIcon: {
    paddingRight: 12,
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: theme.colors.error[500],
    marginTop: 4,
  },
});