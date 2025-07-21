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
        <Text style={styles.headerTitle}>Become a Supporter</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.titleContainer}>
          <Star size={48} color={colors.primary} style={styles.starIcon} />
          <Text style={styles.title}>Support Our Mission</Text>
          <Text style={styles.subtitle}>
            Help us continue building tools that support families with ADHD. 
            Your support enables us to develop new features and keep the core app free for everyone.
          </Text>
        </View>

        <View style={styles.featuresCard}>
          <Text style={styles.cardTitle}>Supporter Features Include:</Text>
          <PremiumFeature text="Unlimited AI Adventure Stories" />
          <PremiumFeature text="Advanced PDF Progress Reports" />
          <PremiumFeature text="Full Access to Expert Resources" />
          <PremiumFeature text="Family & Therapist Sharing" />
          <PremiumFeature text="Advanced Journaling with Audio & Photos" />
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Button
          title="Become a Supporter (Coming Soon)"
          onPress={() => {}}
          disabled={true}
          fullWidth
          size="lg"
        />
        <Text style={styles.disclaimer}>
          Payment processing coming soon. This is a placeholder screen.
        </Text>
      </View>
    </SafeAreaView>
  );
}
