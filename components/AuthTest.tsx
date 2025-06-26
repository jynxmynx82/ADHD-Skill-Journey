import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform, ViewStyle, TextStyle } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';

export default function AuthTest() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('test123');
  const [isSignUp, setIsSignUp] = useState(false);
  const { user, signIn, signUp, logout } = useAuth();
  const router = useRouter();

  const handleTestAuth = async () => {
    try {
      console.log('Starting test authentication...');
      // Try to sign in first
      try {
        await signIn(email, password);
        console.log('Sign in successful');
        Alert.alert('Success', 'Signed in successfully!');
        router.replace('/(tabs)');
      } catch (signInError: any) {
        console.log('Sign in failed, attempting sign up...', signInError);
        // If sign in fails, try to sign up
        await signUp(email, password, 'Test', 'User');
        console.log('Sign up successful');
        Alert.alert('Success', 'Test account created and signed in!');
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      Alert.alert('Error', error.message || 'Authentication failed');
    }
  };

  const handleAuth = async () => {
    try {
      if (isSignUp) {
        await signUp(email, password, 'Test', 'User');
        Alert.alert('Success', 'Account created successfully!');
        router.replace('/(tabs)');
      } else {
        await signIn(email, password);
        Alert.alert('Success', 'Signed in successfully!');
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      Alert.alert('Error', error.message || 'Authentication failed');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      Alert.alert('Success', 'Signed out successfully!');
      router.replace('/(auth)');
    } catch (error: any) {
      console.error('Logout error:', error);
      Alert.alert('Error', error.message || 'Failed to sign out');
    }
  };

  if (user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Welcome!</Text>
        <Text style={styles.userInfo}>Email: {user.email}</Text>
        <Text style={styles.userInfo}>Display Name: {user.displayName || 'Not set'}</Text>
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleLogout}
          {...(Platform.OS === 'web' ? { role: 'button' } : {})}
        >
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Authentication Test</Text>
      
      <TouchableOpacity 
        style={[styles.button, styles.testButton]} 
        onPress={handleTestAuth}
        {...(Platform.OS === 'web' ? { role: 'button' } : {})}
      >
        <Text style={styles.buttonText}>Test Authentication</Text>
      </TouchableOpacity>

      <Text style={styles.divider}>Or</Text>

      <Text style={styles.subtitle}>{isSignUp ? 'Create Account' : 'Sign In'}</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        {...(Platform.OS === 'web' ? { type: 'email' } : {})}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        {...(Platform.OS === 'web' ? { type: 'password' } : {})}
      />
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleAuth}
        {...(Platform.OS === 'web' ? { role: 'button' } : {})}
      >
        <Text style={styles.buttonText}>
          {isSignUp ? 'Sign Up' : 'Sign In'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.switchButton}
        onPress={() => setIsSignUp(!isSignUp)}
        {...(Platform.OS === 'web' ? { role: 'button' } : {})}
      >
        <Text style={styles.switchButtonText}>
          {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
    ...(Platform.OS === 'web'
      ? {
          maxWidth: 400,
          marginHorizontal: 'auto',
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
          borderRadius: 8,
        }
      : {}
    ),
  } as ViewStyle,
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#1a1a1a',
  } as TextStyle,
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#1a1a1a',
  } as TextStyle,
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    marginBottom: 15,
    borderRadius: 5,
    fontSize: 16,
  } as TextStyle,
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    ...(Platform.OS === 'web' ? {
      cursor: 'pointer',
      userSelect: 'none',
    } : {}),
  } as ViewStyle,
  testButton: {
    backgroundColor: '#34C759',
  } as ViewStyle,
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  } as TextStyle,
  switchButton: {
    padding: 10,
    ...(Platform.OS === 'web' ? {
      cursor: 'pointer',
      userSelect: 'none',
    } : {}),
  } as ViewStyle,
  switchButtonText: {
    color: '#007AFF',
    textAlign: 'center',
    fontSize: 14,
  } as TextStyle,
  userInfo: {
    fontSize: 16,
    marginBottom: 10,
    color: '#666',
  } as TextStyle,
  divider: {
    textAlign: 'center',
    marginVertical: 20,
    color: '#666',
    fontSize: 16,
  } as TextStyle,
}); 