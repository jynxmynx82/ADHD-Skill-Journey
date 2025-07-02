import React, { useState } from 'react';
import { 
  Home, Users, Search, BookOpen, PenTool, Clock, Menu, X, 
  User, Bell, Moon, CreditCard, Lock, HelpCircle, Book, Info, Target 
} from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { 
  Platform, View, Text, StyleSheet, TouchableOpacity, Modal, 
  Animated, Dimensions, ScrollView, StatusBar 
} from 'react-native';
import { useRouter } from 'expo-router';

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HamburgerMenu({ isOpen, onClose }: HamburgerMenuProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const [menuAnimation] = useState(new Animated.Value(0));

  React.useEffect(() => {
    const toValue = isOpen ? 1 : 0;
    Animated.spring(menuAnimation, {
      toValue,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  }, [isOpen, menuAnimation]);

  const handleMenuItemPress = (route: string) => {
    router.push(route as any);
    onClose();
  };

  const styles = StyleSheet.create({
    menuOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1000,
    },
    menuContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      width: Math.min(300, Dimensions.get('window').width * 0.8),
      backgroundColor: colors.background,
      borderRightWidth: 1,
      borderRightColor: colors.border,
      paddingTop: Platform.OS === 'web' ? 8 : (StatusBar.currentHeight || 0) + 16,
      paddingHorizontal: 16,
    },
    menuHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    menuTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
    },
    closeButton: {
      padding: 8,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    menuItemText: {
      fontSize: 16,
      color: colors.text,
      marginLeft: 12,
    },
    menuSection: {
      marginTop: 16,
    },
    menuSectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 8,
      paddingHorizontal: 8,
    },
  });

  const MenuItem = ({ icon: Icon, title, onPress }: { icon: any; title: string; onPress: () => void }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Icon color={colors.text} size={20} />
      <Text style={styles.menuItemText}>{title}</Text>
    </TouchableOpacity>
  );

  const MenuSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.menuSection}>
      <Text style={styles.menuSectionTitle}>{title}</Text>
      {children}
    </View>
  );

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.menuOverlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <Animated.View 
          style={[
            styles.menuContainer,
            {
              transform: [{
                translateX: menuAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-300, 0],
                }),
              }],
            },
          ]}
        >
          <View style={styles.menuHeader}>
            <Text style={styles.menuTitle}>Menu</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X color={colors.text} size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }}>
            {/* Navigation Section */}
            <MenuSection title="">
              <MenuItem 
                icon={Home} 
                title="Home" 
                onPress={() => handleMenuItemPress('/(tabs)/')}
              />
              <MenuItem 
                icon={Target} 
                title="Skill Journey" 
                onPress={() => handleMenuItemPress('/(tabs)/skill-journey')}
              />
              <MenuItem 
                icon={Users} 
                title="Children" 
                onPress={() => handleMenuItemPress('/(tabs)/children')}
              />
              <MenuItem 
                icon={Clock} 
                title="Schedule" 
                onPress={() => handleMenuItemPress('/(tabs)/schedule')}
              />
              <MenuItem 
                icon={Search} 
                title="Food Scanner" 
                onPress={() => handleMenuItemPress('/(tabs)/food-scanner')}
              />
              <MenuItem 
                icon={BookOpen} 
                title="Resources" 
                onPress={() => handleMenuItemPress('/(tabs)/resources')}
              />
              <MenuItem 
                icon={PenTool} 
                title="Journal" 
                onPress={() => handleMenuItemPress('/(tabs)/journal')}
              />
            </MenuSection>

            {/* Settings Section */}
            <MenuSection title="">
              <MenuItem 
                icon={User} 
                title="Profile" 
                onPress={() => handleMenuItemPress('/(settings)/profile')}
              />
              <MenuItem 
                icon={Bell} 
                title="Notifications" 
                onPress={() => handleMenuItemPress('/(settings)/notifications')}
              />
              <MenuItem 
                icon={Moon} 
                title="Theme" 
                onPress={() => handleMenuItemPress('/(settings)/theme')}
              />
              <MenuItem 
                icon={CreditCard} 
                title="Subscription" 
                onPress={() => handleMenuItemPress('/(settings)/subscription')}
              />
            </MenuSection>

            {/* Help Section */}
            <MenuSection title="">
              <MenuItem 
                icon={HelpCircle} 
                title="Contact Support" 
                onPress={() => {
                  console.log('Contact support');
                  onClose();
                }}
              />
              <MenuItem 
                icon={Book} 
                title="User Guide" 
                onPress={() => {
                  console.log('User guide');
                  onClose();
                }}
              />
              <MenuItem 
                icon={Info} 
                title="App Version" 
                onPress={() => {
                  console.log('App version');
                  onClose();
                }}
              />
            </MenuSection>
          </ScrollView>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
} 