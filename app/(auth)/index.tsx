import React from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, Image } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AuthScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome to ADHD Family Support</Text>
            <Text style={styles.subtitle}>Your companion for managing ADHD in the family</Text>
          </View>
          
          <View style={styles.buttonContainer}>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Sign In</Text>
              </TouchableOpacity>
            </Link>

            <View style={styles.createAccountSection}>
              <Link href="/(auth)/signup-with-questions" asChild>
                <TouchableOpacity style={styles.primaryButton}>
                  <Text style={styles.primaryButtonText}>Create Account</Text>
                </TouchableOpacity>
              </Link>
              <Text style={styles.createAccountSubtext}>
                We'll ask a few quick questions to personalize your experience
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>
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
    color: '#666',
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    ...(Platform.OS === 'web' ? {
      cursor: 'pointer',
      userSelect: 'none',
    } : {}),
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    ...(Platform.OS === 'web' ? {
      cursor: 'pointer',
      userSelect: 'none',
    } : {}),
  },
  secondaryButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
    ...(Platform.OS === 'web' ? {
      cursor: 'pointer',
      userSelect: 'none',
    } : {}),
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  createAccountSection: {
    alignItems: 'center',
    marginTop: 24,
  },
  createAccountSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  quickSignupSection: {
    alignItems: 'center',
    marginTop: 32,
  },
  quickSignupLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    fontWeight: '500',
  },
  footer: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#666',
  },
}); 