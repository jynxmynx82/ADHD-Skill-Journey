// components/premium/PremiumFeatureGate.tsx
import React, { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { canAccessFeature, User } from '@/lib/subscriptionService';
import { UpgradePrompt } from './UpgradePrompt';

interface PremiumFeatureGateProps {
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export const PremiumFeatureGate: React.FC<PremiumFeatureGateProps> = ({
  feature,
  children,
  fallback,
}) => {
  const { user } = useAuth();

  // The canAccessFeature function needs a User object with a specific structure.
  // We adapt the user object from useAuth() to fit what canAccessFeature expects.
  const appUser: User | null = user ? { uid: user.uid } : null;

  const hasAccess = canAccessFeature(feature, appUser);

  if (!hasAccess) {
    // If a specific fallback is provided, render it.
    // Otherwise, render the default UpgradePrompt.
    return fallback || <UpgradePrompt feature={feature} />;
  }

  // If the user has access, render the actual feature.
  return <>{children}</>;
};
