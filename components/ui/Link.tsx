import React from 'react';
import { Text, StyleSheet, StyleProp, TextStyle, Platform, TouchableOpacity, View } from 'react-native';
import { Link as ExpoLink, Href } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';

interface LinkProps {
  href: Href<string>;
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  onPress?: () => void;
}

const WebLink = ({ children, style, onPress }: { children: React.ReactNode; style?: StyleProp<TextStyle>; onPress?: () => void }) => {
  return (
    <View style={styles.container} onTouchEnd={onPress}>
      {children}
    </View>
  );
};

export const Link = ({ href, children, style, onPress }: LinkProps) => {
  const { colors } = useTheme();

  const content = typeof children === 'string' ? (
    <Text style={[styles.text, { color: colors.primary }, style]}>
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
  text: {
    fontSize: 16,
  },
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
}); 