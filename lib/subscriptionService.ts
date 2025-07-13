// lib/subscriptionService.ts
import { Child } from "@/context/FamilyContext"; // Assuming User is similar to Child or we can define a User type

// Define a simple User type for now
export interface User {
  uid: string;
  subscription?: {
    tier: 'free' | 'premium';
  };
}

export interface SubscriptionTier {
  tier: 'free' | 'premium';
  features: string[];
  limits: Record<string, number | 'unlimited'>;
}

export const SUBSCRIPTION_CONFIG: Record<'free' | 'premium', SubscriptionTier> = {
  free: {
    tier: 'free',
    features: [
      'unlimited_skill_journeys',
      'unlimited_journal_entries', 
      'unlimited_adventures',
      'basic_food_scanner',
      'family_management',
      'basic_export'
    ],
    limits: {
      skillJourneys: 'unlimited',
      journalEntries: 'unlimited',
      adventures: 'unlimited',
      familyMembers: 'unlimited'
    }
  },
  premium: {
    tier: 'premium',
    features: [
      'ai_story_generation',
      'advanced_reports',
      'expert_resources',
      'family_sharing',
      'cloud_backup'
    ],
    limits: {
      aiStories: 'unlimited',
      reports: 'unlimited',
      resources: 'unlimited'
    }
  }
};

/**
 * Checks if a user has access to a specific feature.
 * For now, it's hardcoded to check against the free tier.
 * @param feature The feature to check access for (e.g., 'ai_story_generation')
 * @param user The user object
 * @returns boolean
 */
export const canAccessFeature = (feature: string, user: User | null): boolean => {
  // Default to free tier if no user or subscription info
  const subscriptionTier = user?.subscription?.tier || 'free';

  if (subscriptionTier === 'premium') {
    return true; // Premium users have access to everything
  }

  // Check if the feature is in the free plan
  const freeTierFeatures = SUBSCRIPTION_CONFIG.free.features;
  return freeTierFeatures.includes(feature);
};
