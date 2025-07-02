import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
  Switch,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bell, Calendar, Clock, MessageSquare, AlertCircle } from 'lucide-react-native';
import { WebGradientWrapper } from '@/components/WebGradientWrapper';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NotificationSettingProps {
  icon: React.ElementType;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  colors: {
    text: string;
    textSecondary: string;
    background: string;
    border: string;
    primary: string;
  };
}

const NotificationSetting = ({
  icon: Icon,
  title,
  description,
  value,
  onValueChange,
  colors,
}: NotificationSettingProps) => (
  <View
    style={[
      styles.notificationSetting,
      {
        backgroundColor: colors.background,
        borderColor: colors.border,
      },
    ]}
  >
    <View style={styles.notificationSettingContent}>
      <Icon size={24} color={colors.primary} />
      <View style={styles.notificationSettingText}>
        <Text style={[styles.notificationSettingTitle, { color: colors.text }]}>
          {title}
        </Text>
        <Text style={[styles.notificationSettingDescription, { color: colors.textSecondary }]}>
          {description}
        </Text>
      </View>
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: colors.border, true: colors.primary }}
      thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : value ? colors.primary : '#F4F3F4'}
    />
  </View>
);

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const isWeb = Platform.OS === 'web';

  const [notificationSettings, setNotificationSettings] = useState({
    reminders: true,
    schedule: true,
    messages: true,
    alerts: true,
  });

  const handleSettingChange = async (key: keyof typeof notificationSettings, value: boolean) => {
    try {
      const newSettings = { ...notificationSettings, [key]: value };
      setNotificationSettings(newSettings);
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  };

  // Load saved settings
  React.useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem('notificationSettings');
        if (savedSettings) {
          setNotificationSettings(JSON.parse(savedSettings));
        }
      } catch (error) {
        console.error('Error loading notification settings:', error);
      }
    };
    loadSettings();
  }, []);

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
          <Text style={[styles.title, { color: colors.text }]}>Notifications</Text>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Notification Preferences</Text>
            <View style={styles.notificationSettings}>
              <NotificationSetting
                icon={Bell}
                title="Reminders"
                description="Get notified about important reminders and tasks"
                value={notificationSettings.reminders}
                onValueChange={(value) => handleSettingChange('reminders', value)}
                colors={colors}
              />
              <NotificationSetting
                icon={Calendar}
                title="Schedule Updates"
                description="Receive notifications about schedule changes"
                value={notificationSettings.schedule}
                onValueChange={(value) => handleSettingChange('schedule', value)}
                colors={colors}
              />
              <NotificationSetting
                icon={MessageSquare}
                title="Messages"
                description="Get notified about new messages and updates"
                value={notificationSettings.messages}
                onValueChange={(value) => handleSettingChange('messages', value)}
                colors={colors}
              />
              <NotificationSetting
                icon={AlertCircle}
                title="Alerts"
                description="Receive important alerts and notifications"
                value={notificationSettings.alerts}
                onValueChange={(value) => handleSettingChange('alerts', value)}
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
  notificationSettings: {
    gap: 12,
  },
  notificationSetting: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  notificationSettingContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationSettingText: {
    flex: 1,
  },
  notificationSettingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationSettingDescription: {
    fontSize: 14,
  },
}); 