// app/(settings)/subscription.tsx
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { CheckCircle, Star, Heart, Users, FileText, Sparkles, Shield } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Header } from '@/components/ui/Header';

const SupporterFeature = ({ icon: Icon, title, description, isOnBlueBackground = false }: { 
  icon: any; 
  title: string; 
  description: string; 
  isOnBlueBackground?: boolean;
}) => {
  const { colors } = useTheme();
  const styles = StyleSheet.create({
    featureContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 16,
      paddingHorizontal: 4,
    },
    featureIcon: {
      marginRight: 12,
      marginTop: 2,
    },
    featureContent: {
      flex: 1,
    },
    featureTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: isOnBlueBackground ? '#FFFFFF' : colors.text,
      marginBottom: 4,
    },
    featureDescription: {
      fontSize: 14,
      color: isOnBlueBackground ? '#F0F0F0' : colors.textSecondary,
      lineHeight: 20,
    },
  });

  return (
    <View style={styles.featureContainer}>
      <Icon size={20} color={isOnBlueBackground ? '#FFFFFF' : colors.primary} style={styles.featureIcon} />
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
};

export default function SubscriptionScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      flexGrow: 1,
      padding: 16,
    },
    titleContainer: {
      alignItems: 'center',
      marginBottom: 32,
    },
    starIcon: {
      marginBottom: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      maxWidth: 400,
    },
    freeTierCard: {
      backgroundColor: colors.background,
      borderRadius: 16,
      padding: 24,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    freeFeaturesList: {
      marginBottom: 16,
    },
    supporterCard: {
      backgroundColor: colors.primary,
      borderRadius: 16,
      padding: 24,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    supporterTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#FFFFFF',
      marginBottom: 16,
      textAlign: 'center',
    },
    supporterDescription: {
      fontSize: 16,
      color: '#FFFFFF',
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 24,
    },
    supporterFeaturesList: {
      marginBottom: 24,
    },
    becomeSupporterButton: {
      backgroundColor: '#FFFFFF',
      paddingVertical: 16,
      paddingHorizontal: 32,
      borderRadius: 50,
      alignItems: 'center',
    },
    buttonText: {
      color: colors.primary,
      fontSize: 18,
      fontWeight: 'bold',
    },
    disclaimer: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 16,
      fontStyle: 'italic',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Become a Supporter" showBackButton />
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.titleContainer}>
          <Star size={48} color={colors.primary} style={styles.starIcon} />
          <Text style={styles.title}>Support Our Mission</Text>
          <Text style={styles.subtitle}>
            Help us continue building tools that support families with ADHD. 
            Your support enables us to develop new features and keep the core app free for everyone.
          </Text>
        </View>

        {/* Free Tier - What You Already Have */}
        <View style={styles.freeTierCard}>
          <Text style={styles.cardTitle}>What's Already Free</Text>
          <View style={styles.freeFeaturesList}>
            <SupporterFeature 
              icon={CheckCircle}
              title="Unlimited Core Features"
              description="Create unlimited skill journeys, adventures, and journal entries"
            />
            <SupporterFeature 
              icon={Shield}
              title="Secure Cloud Backup"
              description="Your data is safely backed up and synced across devices"
            />
            <SupporterFeature 
              icon={Heart}
              title="ADHD-Focused Food Scanner"
              description="Our unique custom score analyzing additives relevant to ADHD"
            />
            <SupporterFeature 
              icon={Users}
              title="Family Management"
              description="Add and manage all children in your family"
            />
          </View>
        </View>

        {/* Supporter Tier */}
        <View style={styles.supporterCard}>
          <Text style={styles.supporterTitle}>Become a Supporter</Text>
          <Text style={styles.supporterDescription}>
            Support our mission and unlock powerful tools to enhance your family's journey
          </Text>
          
          <View style={styles.supporterFeaturesList}>
            <SupporterFeature 
              icon={Sparkles}
              title="Unlimited AI Adventure Stories"
              description="Create magical, personalized stories celebrating your child's progress"
              isOnBlueBackground={true}
            />
            <SupporterFeature 
              icon={FileText}
              title="Advanced PDF Reports"
              description="Generate professional reports for teachers and therapists"
              isOnBlueBackground={true}
            />
            <SupporterFeature 
              icon={Users}
              title="Family & Therapist Sharing"
              description="Securely collaborate with your support network"
              isOnBlueBackground={true}
            />
            <SupporterFeature 
              icon={Star}
              title="Full Expert Resource Library"
              description="Access our complete library of in-depth guides and expert interviews"
              isOnBlueBackground={true}
            />
            <SupporterFeature 
              icon={Heart}
              title="Advanced Journaling"
              description="Record audio notes and attach photos to your journal entries"
              isOnBlueBackground={true}
            />
          </View>

          <TouchableOpacity style={styles.becomeSupporterButton}>
            <Text style={styles.buttonText}>Become a Supporter</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.disclaimer}>
          Payment processing coming soon. This is a placeholder screen.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
} 