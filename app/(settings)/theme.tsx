import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'expo-router';
import { ArrowLeft, Sun, Moon, Monitor } from 'lucide-react-native';
import { WebGradientWrapper } from '@/components/WebGradientWrapper';

interface ThemeOptionProps {
  icon: React.ElementType;
  title: string;
  description: string;
  isSelected: boolean;
  onPress: () => void;
  colors: {
    text: string;
    textSecondary: string;
    background: string;
    border: string;
    primary: string;
  };
}

const ThemeOption = ({ icon: Icon, title, description, isSelected, onPress, colors }: ThemeOptionProps) => (
  <TouchableOpacity
    style={[
      styles.themeOption,
      {
        backgroundColor: colors.background,
        borderColor: isSelected ? colors.primary : colors.border,
      },
    ]}
    onPress={onPress}
  >
    <View style={styles.themeOptionContent}>
      <Icon size={24} color={isSelected ? colors.primary : colors.text} />
      <View style={styles.themeOptionText}>
        <Text style={[styles.themeOptionTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.themeOptionDescription, { color: colors.textSecondary }]}>
          {description}
        </Text>
      </View>
    </View>
    {isSelected && (
      <View
        style={[
          styles.selectedIndicator,
          { backgroundColor: colors.primary },
        ]}
      />
    )}
  </TouchableOpacity>
);

export default function ThemeScreen() {
  const { colors, theme, setTheme } = useTheme();
  const router = useRouter();
  const isWeb = Platform.OS === 'web';

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
  };

  return (
    <WebGradientWrapper>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Theme</Text>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
            <View style={styles.themeOptions}>
              <ThemeOption
                icon={Sun}
                title="Light"
                description="Use light theme"
                isSelected={theme === 'light'}
                onPress={() => handleThemeChange('light')}
                colors={colors}
              />
              <ThemeOption
                icon={Moon}
                title="Dark"
                description="Use dark theme"
                isSelected={theme === 'dark'}
                onPress={() => handleThemeChange('dark')}
                colors={colors}
              />
              <ThemeOption
                icon={Monitor}
                title="System"
                description="Match system theme"
                isSelected={theme === 'system'}
                onPress={() => handleThemeChange('system')}
                colors={colors}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </WebGradientWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'web' ? 16 : 8,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  themeOptions: {
    gap: 12,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  themeOptionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  themeOptionText: {
    flex: 1,
  },
  themeOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  themeOptionDescription: {
    fontSize: 14,
  },
  selectedIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
}); 