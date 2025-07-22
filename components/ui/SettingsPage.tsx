// components/ui/SettingsPage.tsx
import React from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, Platform } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Header } from './Header';
import { WebGradientWrapper } from '@/components/WebGradientWrapper';

interface SettingsPageProps {
  title: string;
  children: React.ReactNode;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ 
  title, 
  children, 
  showBackButton = true,
  onBackPress,
  rightComponent 
}) => {
  const { colors } = useTheme();
  const isWeb = Platform.OS === 'web';

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    inner: {
      flex: 1,
      width: isWeb ? '90%' : '100%',
      maxWidth: isWeb ? 1200 : '100%',
      alignSelf: isWeb ? 'center' : 'stretch',
      backgroundColor: isWeb ? 'rgba(255,255,255,0.95)' : colors.background,
      borderRadius: isWeb ? 24 : 0,
      marginTop: isWeb ? 32 : 0,
      marginBottom: isWeb ? 32 : 0,
      overflow: 'hidden',
    },
    content: {
      flex: 1,
      padding: 16,
    },
  });

  const PageContent = () => (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <Header 
          title={title} 
          showBackButton={showBackButton}
          onBackPress={onBackPress}
          rightComponent={rightComponent}
        />
        <ScrollView style={styles.content}>
          {children}
        </ScrollView>
      </View>
    </SafeAreaView>
  );

  return isWeb ? (
    <WebGradientWrapper>
      <PageContent />
    </WebGradientWrapper>
  ) : (
    <PageContent />
  );
}; 