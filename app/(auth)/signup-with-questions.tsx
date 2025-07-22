import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform, ScrollView, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { createProvisionalProfile } from '@/lib/provisionalProfileService';
import SignupQuestionnaire from '@/components/SignupQuestionnaire';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface QuestionnaireAnswers {
  primaryChallenge?: string;
  familyStrength?: string;
  supportNetwork?: string;
  currentStrategies?: string;
}

export default function SignUpWithQuestionsScreen() {
  const [step, setStep] = useState<'form' | 'questionnaire'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupData, setSignupData] = useState<SignupData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });

  const { signUp } = useAuth();
  const { user } = useAuth();
  const router = useRouter();

  const handleSignUp = async () => {
    if (!signupData.email || !signupData.password || !signupData.firstName || !signupData.lastName) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await signUp(signupData.email, signupData.password, signupData.firstName, signupData.lastName);
      setStep('questionnaire');
    } catch (err) {
      console.error('Error signing up:', err);
      setError('Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionnaireComplete = async (answers: Record<string, string>) => {
    try {
      setLoading(true);
      
      // Get the current user ID from auth context
      if (!user?.uid) {
        throw new Error('User not authenticated');
      }
      
      // Create a provisional family profile with questionnaire data
      await createProvisionalProfile(user.uid, answers);
      
      Alert.alert(
        'Welcome!',
        'Your account has been created and personalized for your family. You can now start using the app and add your children\'s details when you\'re ready.',
        [
          {
            text: 'Get Started',
            onPress: () => router.push('/(tabs)' as any),
          },
        ]
      );
    } catch (err) {
      console.error('Error creating provisional profile:', err);
      Alert.alert(
        'Account Created',
        'Your account has been created successfully! You can personalize your experience later.',
        [
          {
            text: 'Continue',
            onPress: () => router.push('/(tabs)' as any),
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionnaireSkip = () => {
    Alert.alert(
      'Skip Questionnaire',
      'You can always complete this later in your profile settings.',
      [
        {
          text: 'Skip for Now',
          onPress: () => router.push('/(tabs)' as any),
        },
        {
          text: 'Continue',
          style: 'cancel',
        },
      ]
    );
  };

  if (step === 'questionnaire') {
    return (
      <SignupQuestionnaire
        onComplete={handleQuestionnaireComplete}
        onSkip={handleQuestionnaireSkip}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Image 
              source={require('@/assets/images/ADHD_Family_Logo.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join ADHD Family Support</Text>
            <Text style={styles.description}>
              We'll ask a few quick questions to personalize your experience
            </Text>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="First Name"
              value={signupData.firstName}
              onChangeText={(text) => setSignupData({ ...signupData, firstName: text })}
              autoCapitalize="words"
            />
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              value={signupData.lastName}
              onChangeText={(text) => setSignupData({ ...signupData, lastName: text })}
              autoCapitalize="words"
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={signupData.email}
              onChangeText={(text) => setSignupData({ ...signupData, email: text })}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={signupData.password}
              onChangeText={(text) => setSignupData({ ...signupData, password: text })}
              secureTextEntry
            />

            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSignUp}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Creating Account...' : 'Create Account & Continue'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.linkButton}
              onPress={() => router.push('/' as any)}
            >
              <Text style={styles.linkText}>Already have an account? Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    ...(Platform.OS === 'web' ? {
      alignItems: 'center',
      justifyContent: 'center',
    } : {}),
  },
  content: {
    width: '100%',
    maxWidth: 400,
    padding: 20,
    ...(Platform.OS === 'web' 
      ? { boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }
    ),
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 188,
    height: 188,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
    color: '#666',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
    color: '#888',
    lineHeight: 20,
  },
  form: {
    gap: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 16,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    ...(Platform.OS === 'web' ? {
      cursor: 'pointer',
      userSelect: 'none',
    } : {}),
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 16,
    alignItems: 'center',
    ...(Platform.OS === 'web' ? {
      cursor: 'pointer',
      userSelect: 'none',
    } : {}),
  },
  linkText: {
    color: '#007AFF',
    fontSize: 16,
  },
  error: {
    color: '#ff3b30',
    textAlign: 'center',
    marginBottom: 16,
  },
}); 