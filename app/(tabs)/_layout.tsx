import React, { useState } from 'react';
import { Tabs } from 'expo-router';
import { Home, Users, Search, BookOpen, PenTool, Clock, Menu, X, Settings, User, Bell, Moon, CreditCard, Lock, HelpCircle, Book, Info, Target } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { Platform, View, Text, StyleSheet, TouchableOpacity, Modal, Animated, Dimensions, ScrollView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';

export default function MainTabLayout() {
  const { colors } = useTheme();
  const router = useRouter();
  const isWeb = Platform.OS === 'web';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuAnimation] = useState(new Animated.Value(0));

  const toggleMenu = () => {
    const toValue = isMenuOpen ? 0 : 1;
    Animated.spring(menuAnimation, {
      toValue,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
    setIsMenuOpen(!isMenuOpen);
  };

  const styles = StyleSheet.create({
    header: {
      padding: 16,
      paddingTop: Platform.OS === 'web' ? 8 : (StatusBar.currentHeight || 0) + 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.background,
    },
    menuButton: {
      padding: 8,
      marginRight: 8,
    },
    appTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      flex: 1,
      textAlign: 'center',
    },
    dateText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginLeft: 8,
    },
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

  const HeaderTitle = () => (
    <View style={[styles.header, { flexDirection: 'column', alignItems: 'flex-start' }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 8 }}>
        <Text style={[styles.appTitle, { textAlign: 'left' }]}>ADHD Family Support</Text>
        <Text style={styles.dateText}>
          {new Date().toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          })}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
        {isWeb && (
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={toggleMenu}
            accessibilityLabel="Open menu"
          >
            <Menu color={colors.text} size={24} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <>
      <HeaderTitle />
      
      {/* Hamburger Menu Modal */}
      <Modal
        visible={isMenuOpen}
        transparent
        animationType="none"
        onRequestClose={toggleMenu}
      >
        <TouchableOpacity 
          style={styles.menuOverlay} 
          activeOpacity={1} 
          onPress={toggleMenu}
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
              <TouchableOpacity style={styles.closeButton} onPress={toggleMenu}>
                <X color={colors.text} size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1 }}>
              {/* Navigation Section */}
              <MenuSection title="">
                <MenuItem 
                  icon={Home} 
                  title="Home" 
                  onPress={() => {
                    router.push('/(tabs)/');
                    toggleMenu();
                  }}
                />
                <MenuItem 
                  icon={Target} 
                  title="Skill Journey" 
                  onPress={() => {
                    router.push('/(tabs)/skill-journey');
                    toggleMenu();
                  }}
                />
                <MenuItem 
                  icon={Users} 
                  title="Children" 
                  onPress={() => {
                    router.push('/(tabs)/children');
                    toggleMenu();
                  }}
                />
                <MenuItem 
                  icon={Clock} 
                  title="Schedule" 
                  onPress={() => {
                    router.push('/(tabs)/schedule');
                    toggleMenu();
                  }}
                />
                <MenuItem 
                  icon={Search} 
                  title="Food Scanner" 
                  onPress={() => {
                    router.push('/(tabs)/food-scanner');
                    toggleMenu();
                  }}
                />
                <MenuItem 
                  icon={BookOpen} 
                  title="Resources" 
                  onPress={() => {
                    router.push('/(tabs)/resources');
                    toggleMenu();
                  }}
                />
                <MenuItem 
                  icon={PenTool} 
                  title="Journal" 
                  onPress={() => {
                    router.push('/(tabs)/journal');
                    toggleMenu();
                  }}
                />
              </MenuSection>

              {/* Settings Section */}
              <MenuSection title="">
                <MenuItem 
                  icon={User} 
                  title="Profile" 
                  onPress={() => {
                    router.push('/(settings)/profile' as any);
                    toggleMenu();
                  }}
                />
                <MenuItem 
                  icon={Bell} 
                  title="Notifications" 
                  onPress={() => {
                    router.push('/(settings)/notifications' as any);
                    toggleMenu();
                  }}
                />
                <MenuItem 
                  icon={Moon} 
                  title="Theme" 
                  onPress={() => {
                    router.push('/(settings)/theme' as any);
                    toggleMenu();
                  }}
                />
                <MenuItem 
                  icon={CreditCard} 
                  title="Subscription" 
                  onPress={() => {
                    router.push('/(settings)/subscription' as any);
                    toggleMenu();
                  }}
                />
              </MenuSection>

              {/* Help Section */}
              <MenuSection title="">
                <MenuItem 
                  icon={HelpCircle} 
                  title="Contact Support" 
                  onPress={() => {
                    console.log('Contact support');
                    toggleMenu();
                  }}
                />
                <MenuItem 
                  icon={Book} 
                  title="User Guide" 
                  onPress={() => {
                    console.log('User guide');
                    toggleMenu();
                  }}
                />
                <MenuItem 
                  icon={Info} 
                  title="App Version" 
                  onPress={() => {
                    console.log('App version');
                    toggleMenu();
                  }}
                />
              </MenuSection>
            </ScrollView>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: Platform.select({
            web: {
              display: 'none',
            },
            default: {
              backgroundColor: colors.background,
              borderTopColor: colors.border,
              height: 60,
              paddingBottom: 8,
              paddingTop: 8,
            },
          }),
          tabBarItemStyle: {
            padding: 8,
          },
          tabBarIconStyle: {
            width: 28,
            height: 28,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarShowLabel: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="skill-journey"
          options={{
            title: 'Skill Journey',
            tabBarIcon: ({ color, size }) => <Target color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="children"
          options={{
            title: 'Children',
            tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="schedule"
          options={{
            title: 'Schedule',
            tabBarIcon: ({ color, size }) => <Clock color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="food-scanner"
          options={{
            title: 'Scanner',
            tabBarIcon: ({ color, size }) => <Search color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="resources"
          options={{
            title: 'Resources',
            tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="journal"
          options={{
            title: 'Journal',
            tabBarIcon: ({ color, size }) => <PenTool color={color} size={size} />,
          }}
        />
      </Tabs>
    </>
  );
} 