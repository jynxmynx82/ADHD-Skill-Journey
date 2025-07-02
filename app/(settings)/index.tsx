import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Platform, Alert, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { 
  LogOut, 
  User, 
  Bell, 
  Moon, 
  LucideIcon, 
  ArrowLeft,
  HelpCircle,
  Book,
  Info,
  CreditCard,
  Shield,
  X
} from 'lucide-react-native';
import { ROUTES } from '../types/navigation';

interface SettingItemProps {
  icon: LucideIcon;
  title: string;
  onPress: () => void;
  isDestructive?: boolean;
  colors: {
    text: string;
    error: string;
    border: string;
  };
}

const SettingItem = ({ 
  icon: Icon, 
  title, 
  onPress, 
  isDestructive,
  colors 
}: SettingItemProps) => (
  <TouchableOpacity onPress={onPress}>
    <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
      <View style={styles.settingItemLeft}>
        <Icon color={isDestructive ? colors.error : colors.text} size={24} />
        <Text style={[
          styles.settingItemText, 
          { color: isDestructive ? colors.error : colors.text }
        ]}>{title}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

export default function SettingsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { signOut } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleNavigation = (route: string) => {
    router.push(route as any);
  };

  const handleLogoutPress = () => {
    if (Platform.OS === 'web') {
      setShowLogoutModal(true);
    } else {
      Alert.alert(
        'Log Out',
        'Are you sure you want to log out?',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Log Out',
            style: 'destructive',
            onPress: handleLogout
          }
        ]
      );
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const LogoutConfirmationModal = () => (
    <Modal
      visible={showLogoutModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowLogoutModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Log Out</Text>
            <TouchableOpacity onPress={() => setShowLogoutModal(false)}>
              <X color={colors.text} size={24} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.modalText, { color: colors.text }]}>
            Are you sure you want to log out?
          </Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, { borderColor: colors.border }]}
              onPress={() => setShowLogoutModal(false)}
            >
              <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonDestructive]}
              onPress={() => {
                setShowLogoutModal(false);
                handleLogout();
              }}
            >
              <Text style={[styles.modalButtonText, { color: '#fff' }]}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color={colors.text} size={24} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Account Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
            <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <SettingItem
                icon={Shield}
                title="Security"
                onPress={() => handleNavigation(ROUTES.PROFILE)}
                colors={colors}
              />
              <SettingItem
                icon={CreditCard}
                title="Subscription"
                onPress={() => handleNavigation(ROUTES.SUBSCRIPTION)}
                colors={colors}
              />
              <SettingItem 
                icon={LogOut} 
                title="Log Out"
                onPress={handleLogoutPress}
                isDestructive
                colors={colors}
              />
            </View>
          </View>

          {/* Preferences Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Preferences</Text>
            <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <SettingItem 
                icon={Moon} 
                title="Theme" 
                onPress={() => handleNavigation(ROUTES.THEME)}
                colors={colors}
              />
              <SettingItem 
                icon={Bell} 
                title="Notifications" 
                onPress={() => handleNavigation(ROUTES.NOTIFICATIONS)}
                colors={colors}
              />
            </View>
          </View>

          {/* Help Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Help</Text>
            <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <SettingItem 
                icon={HelpCircle} 
                title="Contact Support" 
                onPress={() => console.log('Contact support')}
                colors={colors}
              />
              <SettingItem 
                icon={Book} 
                title="User Guide" 
                onPress={() => console.log('User guide')}
                colors={colors}
              />
              <SettingItem 
                icon={Info} 
                title="App Version" 
                onPress={() => console.log('App version')}
                colors={colors}
              />
            </View>
          </View>
        </View>
      </ScrollView>
      {Platform.OS === 'web' && <LogoutConfirmationModal />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: Platform.OS === 'web' ? 8 : 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    padding: 16,
    ...(Platform.OS === 'web' && {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 24,
    }),
  },
  section: {
    flex: 1,
    minWidth: 300,
    ...(Platform.OS === 'web' && {
      flexBasis: '30%',
    }),
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)' }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }
    ),
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    ...(Platform.OS === 'web' && {
      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 100,
    alignItems: 'center',
  },
  modalButtonDestructive: {
    backgroundColor: '#FF3B30',
    borderColor: '#FF3B30',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
}); 