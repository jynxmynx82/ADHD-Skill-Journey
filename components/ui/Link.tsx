import React from 'react';
import { Text, StyleSheet, StyleProp, TextStyle, Platform, TouchableOpacity, View } from 'react-native';
import { Link as ExpoLink, Href } from 'expo-router';
import { useAppTheme } from '@/lib/theme';

interface LinkProps {
  href: Href<string>;
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  onPress?: () => void;
}

const WebLink = ({ children, onPress }: { children: React.ReactNode; onPress?: () => void }) => {
  return (
    <View style={styles.container} onTouchEnd={onPress}>
      {children}
    </View>
  );
};

export const Link = ({ href, children, style, onPress }: LinkProps) => {
  const { colors, fontSizes } = useAppTheme();

  const linkStyles = StyleSheet.create({
    text: {
      fontSize: fontSizes.md,
      color: colors.primary,
    },
  });

  const content = typeof children === 'string' ? (
    <Text style={[linkStyles.text, style]}>
      {children}
    </Text>
  ) : (
    children
  );

  if (Platform.OS === 'web') {
    return (
      <ExpoLink href={href} asChild>
        <WebLink onPress={onPress}>
          {content}
        </WebLink>
      </ExpoLink>
    );
  }

  return (
    <ExpoLink href={href} asChild>
      <TouchableOpacity onPress={onPress} style={styles.container}>
        {content}
      </TouchableOpacity>
    </ExpoLink>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
});