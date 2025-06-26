
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Link } from 'expo-router';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Mail, Lock, User } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { theme } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

const RegisterSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
});

export default function RegisterScreen() {
  const { signUp, isLoading } = useAuth();
  const [registerError, setRegisterError] = useState<string | null>(null);

  const handleRegister = async (values: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => {
    try {
      setRegisterError(null);
      await signUp(values.email, values.password, values.firstName, values.lastName);
    } catch (error: any) {
      setRegisterError(error.message || 'An error occurred during registration');
    }
  };

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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join our ADHD support community</Text>
        </View>

        <Formik
          initialValues={{
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '',
          }}
          validationSchema={RegisterSchema}
          onSubmit={handleRegister}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
          }) => (
            <View style={styles.form}>
              {registerError && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{registerError}</Text>
                </View>
              )}

              <View style={styles.nameContainer}>
                <View style={styles.nameField}>
                  <Input
                    label="First Name"
                    placeholder="John"
                    value={values.firstName}
                    onChangeText={handleChange('firstName')}
                    onBlur={handleBlur('firstName')}
                    error={errors.firstName}
                    touched={touched.firstName}
                    leftIcon={<User size={20} color={theme.colors.gray[500]} />}
                  />
                </View>
                <View style={styles.nameField}>
                  <Input
                    label="Last Name"
                    placeholder="Doe"
                    value={values.lastName}
                    onChangeText={handleChange('lastName')}
                    onBlur={handleBlur('lastName')}
                    error={errors.lastName}
                    touched={touched.lastName}
                    leftIcon={<User size={20} color={theme.colors.gray[500]} />}
                  />
                </View>
              </View>

              <Input
                label="Email"
                placeholder="example@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={values.email}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                error={errors.email}
                touched={touched.email}
                leftIcon={<Mail size={20} color={theme.colors.gray[500]} />}
              />

              <Input
                label="Password"
                placeholder="Create a password"
                secureTextEntry
                value={values.password}
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                error={errors.password}
                touched={touched.password}
                leftIcon={<Lock size={20} color={theme.colors.gray[500]} />}
              />

              <Input
                label="Confirm Password"
                placeholder="Confirm your password"
                secureTextEntry
                value={values.confirmPassword}
                onChangeText={handleChange('confirmPassword')}
                onBlur={handleBlur('confirmPassword')}
                error={errors.confirmPassword}
                touched={touched.confirmPassword}
                leftIcon={<Lock size={20} color={theme.colors.gray[500]} />}
              />

              <View style={styles.termsContainer}>
                <Text style={styles.termsText}>
                  By creating an account, you agree to our{' '}
                  <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </View>

              <Button
                title="Create Account"
                onPress={() => handleSubmit()}
                loading={isLoading}
                disabled={isLoading}
                fullWidth
              />
            </View>
          )}
        </Formik>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={styles.signInText}>Sign In</Text>
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
    marginTop: theme.spacing[10],
    marginBottom: theme.spacing[6],
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: theme.fontSizes['2xl'],
    color: theme.colors.primary[700],
    marginBottom: theme.spacing[2],
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: theme.fontSizes.md,
    color: theme.colors.gray[600],
  },
  form: {
    width: '100%',
    marginBottom: theme.spacing[4],
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nameField: {
    width: '48%',
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
  termsContainer: {
    marginBottom: theme.spacing[4],
  },
  termsText: {
    fontFamily: 'Inter-Regular',
    fontSize: theme.fontSizes.sm,
    color: theme.colors.gray[600],
    lineHeight: 20,
  },
  termsLink: {
    fontFamily: 'Inter-SemiBold',
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
  signInText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: theme.fontSizes.sm,
    color: theme.colors.primary[600],
  },
});