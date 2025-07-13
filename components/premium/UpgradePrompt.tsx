// components/premium/UpgradePrompt.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Sparkles } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface UpgradePromptProps {
  feature?: string;
}

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({ feature }) => {
  const { colors } = useTheme();
  const router = useRouter();

  const handleUpgrade = () => {
    // For now, this can navigate to a placeholder "subscribe" page
    // or simply show an alert.
    router.push('/(settings)/subscribe'); // Assuming a future subscribe screen
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      padding: 20,
      margin: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.primary,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    iconContainer: {
      marginBottom: 12,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    description: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 16,
      lineHeight: 20,
    },
    upgradeButton: {
      backgroundColor: colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 32,
      borderRadius: 50,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Sparkles size={32} color={colors.primary} />
      </View>
      <Text style={styles.title}>Unlock Premium Superpowers</Text>
      <Text style={styles.description}>
        {feature
          ? `Upgrade to access "${feature}" and other powerful tools to support your family's journey.`
          : 'Upgrade to unlock all premium features and get the most out of the app.'}
      </Text>
      <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade}>
        <Text style={styles.buttonText}>Upgrade Now</Text>
      </TouchableOpacity>
    </View>
  );
};
