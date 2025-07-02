import React, { useState } from 'react';
import { Tabs } from 'expo-router';
import { Home, Target, PenTool, Menu } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { Platform, View, Text, StyleSheet, TouchableOpacity, StatusBar, SafeAreaView } from 'react-native';
import HamburgerMenu from '@/components/HamburgerMenu';

export default function MainTabLayout() {
  const { colors } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
  });

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
        {Platform.OS === 'web' && (
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => setIsMenuOpen(true)}
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
      <StatusBar 
        barStyle={colors.text === '#000000' ? 'dark-content' : 'light-content'}
        backgroundColor={colors.background}
        translucent={true}
      />
      <SafeAreaView style={styles.safeArea}>
        <HeaderTitle />
        
        <HamburgerMenu 
          isOpen={isMenuOpen} 
          onClose={() => setIsMenuOpen(false)} 
        />

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
            name="journal"
            options={{
              title: 'Journal',
              tabBarIcon: ({ color, size }) => <PenTool color={color} size={size} />,
            }}
          />
          <Tabs.Screen
            name="children"
            options={{
              href: null, // Hide from tab bar
            }}
          />
          <Tabs.Screen
            name="schedule"
            options={{
              href: null, // Hide from tab bar
            }}
          />
          <Tabs.Screen
            name="food-scanner"
            options={{
              href: null, // Hide from tab bar
            }}
          />
          <Tabs.Screen
            name="resources"
            options={{
              href: null, // Hide from tab bar
            }}
          />
        </Tabs>
      </SafeAreaView>
    </>
  );
} 