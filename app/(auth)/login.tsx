import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Link } from 'expo-router';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Mail, Lock } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { theme } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

export default function LoginScreen() {
  const { signIn, isLoading } = useAuth();
  const [loginError, setLoginError] = useState<string | null>(null);

  // Setup useFormik at the top level of the component
  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: LoginSchema,
    validateOnChange: false, // Only validate on blur for better performance
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        setLoginError(null);
        await signIn(values.email, values.password);
      } catch (error: any) {
        setLoginError(error.message || 'An error occurred during login');
      }
    },
  });

  // Stable handlers using the formik object
  const handleEmailChange = useCallback((text: string) => {
    formik.setFieldValue('email', text);
  }, [formik.setFieldValue]);

  const handlePasswordChange = useCallback((text: string) => {
    formik.setFieldValue('password', text);
  }, [formik.setFieldValue]);

  const handleEmailBlur = useCallback(() => {
    formik.setFieldTouched('email');
  }, [formik.setFieldTouched]);

  const handlePasswordBlur = useCallback(() => {
    formik.setFieldTouched('password');
  }, [formik.setFieldTouched]);

  const handleSubmit = useCallback(() => {
    formik.handleSubmit();
  }, [formik.handleSubmit]);

  // Memoized icon components
  const mailIcon = useMemo(() => <Mail size={20} color={theme.colors.gray[500]} />, []);
  const lockIcon = useMemo(() => <Lock size={20} color={theme.colors.gray[500]} />, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Image
            source={require('@/assets/images/ADHD_Family_Logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>ADHD Family Support</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>
        </View>
        
        <View style={styles.form}>
          {loginError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{loginError}</Text>
            </View>
          )}

          <Input
            label="Email"
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={formik.values.email}
            onChangeText={handleEmailChange}
            onBlur={handleEmailBlur}
            error={formik.touched.email ? formik.errors.email : undefined}
            touched={formik.touched.email}
            leftIcon={mailIcon}
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            secureTextEntry
            value={formik.values.password}
            onChangeText={handlePasswordChange}
            onBlur={handlePasswordBlur}
            error={formik.touched.password ? formik.errors.password : undefined}
            touched={formik.touched.password}
            leftIcon={lockIcon}
          />

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>

          <Button
            title="Sign In"
            onPress={handleSubmit}
            loading={isLoading}
            disabled={isLoading}
            fullWidth
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity>
              <Text style={styles.signUpText}>Sign Up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: theme.colors.white, 
  },
  scrollContent: { 
    flexGrow: 1, 
    padding: theme.spacing[5], 
  },
  header: { 
    alignItems: 'center', 
    marginBottom: theme.spacing[6], 
    marginTop: theme.spacing[10], 
  },
  logo: { 
    width: Platform.select({ web: 200, default: 150, }), 
    height: Platform.select({ web: 200, default: 150, }), 
    marginBottom: theme.spacing[4], 
    ...Platform.select({ 
      web: { 
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)', 
      }, 
      default: { 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.1, 
        shadowRadius: 4, 
        elevation: 3, 
      }, 
    }), 
  },
  title: { 
    fontFamily: 'Inter-Bold', 
    fontSize: theme.fontSizes['2xl'], 
    color: theme.colors.primary[700], 
    marginTop: theme.spacing[4], 
    marginBottom: theme.spacing[2], 
  },
  subtitle: { 
    fontFamily: 'Inter-Regular', 
    fontSize: theme.fontSizes.md, 
    color: theme.colors.gray[600], 
  },
  form: { 
    width: '100%', 
    marginBottom: theme.spacing[6], 
  },
  errorContainer: { 
    backgroundColor: theme.colors.error[50], 
    borderRadius: theme.borderRadius.md, 
    padding: theme.spacing[3], 
    marginBottom: theme.spacing[4], 
    borderWidth: 1, 
    borderColor: theme.colors.error[200], 
  },
  errorText: { 
    fontFamily: 'Inter-Regular', 
    fontSize: theme.fontSizes.sm, 
    color: theme.colors.error[700], 
  },
  forgotPassword: { 
    alignSelf: 'flex-end', 
    marginBottom: theme.spacing[4], 
  },
  forgotPasswordText: { 
    fontFamily: 'Inter-Regular', 
    fontSize: theme.fontSizes.sm, 
    color: theme.colors.primary[600], 
  },
  footer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    marginTop: 'auto', 
    paddingBottom: theme.spacing[4], 
  },
  footerText: { 
    fontFamily: 'Inter-Regular', 
    fontSize: theme.fontSizes.sm, 
    color: theme.colors.gray[600], 
    marginRight: theme.spacing[1], 
  },
  signUpText: { 
    fontFamily: 'Inter-SemiBold', 
    fontSize: theme.fontSizes.sm, 
    color: theme.colors.primary[600], 
  },
});
