// app/(settings)/subscribe.tsx
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { ArrowLeft, CheckCircle, Star } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';

const PremiumFeature = ({ text }: { text: string }) => {
  const { colors } = useTheme();
  const styles = StyleSheet.create({
    featureContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    featureIcon: {
      marginRight: 12,
    },
    featureText: {
      fontSize: 16,
      color: colors.text,
      flex: 1,
    },
  });
  return (
    <View style={styles.featureContainer}>
      <CheckCircle size={20} color={colors.primary} style={styles.featureIcon} />
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
};

export default function SubscribeScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      padding: 8,
      marginRight: 8,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    scrollContainer: {
      flexGrow: 1,
      padding: 24,
    },
    titleContainer: {
      alignItems: 'center',
      marginBottom: 24,
    },
    starIcon: {
      marginBottom: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    featuresCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 20,
      marginBottom: 24,
    },
    cardTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 16,
    },
    footer: {
      padding: 24,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    disclaimer: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 16,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Unlock Premium</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.titleContainer}>
          <Star size={48} color={colors.primary} style={styles.starIcon} />
          <Text style={styles.title}>Get Your Superpowers</Text>
          <Text style={styles.subtitle}>
            Upgrade to the Premium Plan to unlock exclusive features and support your family's journey.
          </Text>
        </View>

        <View style={styles.featuresCard}>
          <Text style={styles.cardTitle}>Premium Features Include:</Text>
          <PremiumFeature text="AI-Generated Adventure Stories" />
          <PremiumFeature text="Advanced PDF Progress Reports" />
          <PremiumFeature text="Full Access to Expert Resources" />
          <PremiumFeature text="Secure Cloud Backup & Sync" />
          <PremiumFeature text="Family & Therapist Sharing" />
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Button
          title="Upgrade Now (Coming Soon)"
          onPress={() => {}}
          disabled={true}
          fullWidth
          size="lg"
        />
        <Text style={styles.disclaimer}>
          Payment processing is not yet implemented. This is a placeholder screen.
        </Text>
      </View>
    </SafeAreaView>
  );
}
