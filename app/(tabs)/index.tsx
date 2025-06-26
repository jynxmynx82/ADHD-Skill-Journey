import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Image, Platform, Dimensions } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Settings, Calendar, Search, Heart, PenTool, Users, Clock, BookOpen, Star, MessageSquare, AlertCircle, Mic } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { loadJournalEntries } from '@/lib/journalStorage';
import type { RecentActivity } from '@/types/journal';

export default function Home() {
  const { colors } = useTheme();
  const router = useRouter();
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

  const isWeb = Platform.OS === 'web';
  const windowWidth = Dimensions.get('window').width;

  // Load recent journal activities
  useEffect(() => {
    const loadRecentActivities = async () => {
      try {
        const entries = await loadJournalEntries();
        const recentEntries = entries
          .slice(0, 3)
          .map(entry => ({
            type: 'journal' as const,
            title: `Journal Entry - ${new Date(entry.timestamp).toLocaleDateString()}`,
            description: entry.content.substring(0, 100) + (entry.content.length > 100 ? '...' : ''),
            timestamp: entry.timestamp,
            icon: entry.type === 'audio' ? 'Mic' as const : 'PenTool' as const
          }));
        
        setRecentActivities(recentEntries);
      } catch (error) {
        console.error('Error loading recent journal activity:', error);
      }
    };

    loadRecentActivities();
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: isWeb ? 'center' : undefined,
      justifyContent: isWeb ? 'flex-start' : undefined,
      height: '100%',
      overflow: isWeb ? 'scroll' : undefined,
    },
    inner: {
      flex: 1,
      width: isWeb ? Math.min(windowWidth * 0.9, 1200) : '100%',
      maxWidth: isWeb ? 1200 : '100%',
      alignSelf: isWeb ? 'center' : 'stretch',
      backgroundColor: isWeb ? 'rgba(255,255,255,0.95)' : colors.background,
      borderRadius: isWeb ? 24 : 0,
      marginTop: isWeb ? 32 : 0,
      marginBottom: isWeb ? 32 : 0,
      marginLeft: isWeb ? 80 : 0,
      overflow: 'visible',
      paddingBottom: 32,
    },
    scrollView: {
      flex: 1,
      overflow: isWeb ? 'scroll' : undefined,
    },
    header: {
      padding: 16,
      paddingTop: 8,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
    },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    favicon: {
      width: 24,
      height: 24,
    },
    appTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
    },
    settingsButton: {
      padding: 8,
      marginLeft: 'auto',
    },
    pageTitle: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
      paddingLeft: 16,
    },
    welcome: {
      fontSize: 18,
      color: colors.textSecondary,
      marginBottom: 16,
      paddingLeft: 16,
    },
    section: {
      padding: 16,
      paddingTop: 0,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 12,
    },
    card: {
      padding: 16,
      borderRadius: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    cardText: {
      fontSize: 16,
      marginBottom: 12,
    },
    quickActionsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      justifyContent: 'space-between',
    },
    quickAction: Platform.select({
      web: {
        flex: 1,
        minWidth: 0,
        padding: 16,
        borderRadius: 12,
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        marginBottom: 12,
      },
      default: {
        width: '48%', // Slightly less than 50% to account for gap
        padding: 16,
        borderRadius: 12,
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        marginBottom: 12,
      },
    }),
    quickActionText: {
      fontSize: 14,
      fontWeight: '600',
      marginTop: 8,
      textAlign: 'center',
    },
    addEventButton: {
      padding: 16,
      borderRadius: 12,
      backgroundColor: colors.primary,
      alignItems: 'center',
      marginTop: 16,
    },
    addEventButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.background,
    },
    featureList: {
      marginLeft: 8,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      gap: 12,
    },
    featureItemText: {
      fontSize: 16,
      flex: 1,
    },
    statusList: {
      gap: 16,
    },
    statusItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      minWidth: 60,
      alignItems: 'center',
    },
    statusText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
    },
    statusItemText: {
      fontSize: 16,
    },
    comingSoonList: {
      gap: 16,
    },
    comingSoonItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    comingSoonText: {
      fontSize: 16,
    },
    feedbackButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      borderRadius: 12,
      marginTop: 16,
      gap: 8,
    },
    feedbackButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    activityList: {
      gap: 12,
    },
    activityItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
      paddingVertical: 8,
    },
    activityIcon: {
      marginTop: 2,
    },
    activityContent: {
      flex: 1,
    },
    activityTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    activityDescription: {
      fontSize: 12,
      color: colors.textSecondary,
      lineHeight: 16,
    },
    activityTimestamp: {
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 4,
    },
    emptyActivityText: {
      fontSize: 14,
      color: colors.textSecondary,
      fontStyle: 'italic',
    },
  });

  const formatActivityTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const getActivityIcon = (icon: 'Mic' | 'PenTool') => {
    switch (icon) {
      case 'Mic':
        return <Mic size={16} color={colors.primary} />;
      case 'PenTool':
        return <PenTool size={16} color={colors.primary} />;
      default:
        return <PenTool size={16} color={colors.primary} />;
    }
  };

  // Web-only gradient wrapper
  const WebGradientWrapper = ({ children }: { children: React.ReactNode }) =>
    isWeb ? (
      <div style={{ 
        minHeight: '100vh', 
        width: '100vw', 
        background: 'linear-gradient(135deg, #d0f5e8 0%, #b3e0ff 100%)',
        overflow: 'auto'
      }}>
        {children}
      </div>
    ) : (
      <>{children}</>
    );

  return (
    <WebGradientWrapper>
      <SafeAreaView style={[styles.container]}>
        <View style={styles.inner}>
          <ScrollView style={styles.scrollView}>
            <View style={styles.header}>
              <Text style={styles.appTitle}>Home</Text>
              <TouchableOpacity 
                onPress={() => router.push('/(settings)')}
                style={styles.settingsButton}
              >
                <Settings color={colors.primary} size={32} />
              </TouchableOpacity>
            </View>
            <Text style={styles.welcome}>Welcome! We're here to help!</Text>
            
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Overview</Text>
              <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Text style={[styles.cardText, { color: colors.text }]}>
                  Here you can:
                </Text>
                <View style={styles.featureList}>
                  <Text style={[styles.featureItem, { color: colors.text }]}>• Track your children's progress</Text>
                  <Text style={[styles.featureItem, { color: colors.text }]}>• Monitor daily activities</Text>
                  <Text style={[styles.featureItem, { color: colors.text }]}>• View upcoming appointments</Text>
                  <Text style={[styles.featureItem, { color: colors.text }]}>• Access family resources</Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
              <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Text style={[styles.cardText, { color: colors.text }]}>
                  Common tasks and actions you can take:
                </Text>
                <View style={styles.quickActionsContainer}>
                  <TouchableOpacity 
                    style={styles.quickAction} 
                    activeOpacity={0.8} 
                    accessibilityLabel="Schedule"
                    onPress={() => router.push({
                      pathname: '/(tabs)/schedule',
                      params: { view: 'today' }
                    })}
                  >
                    <Calendar color={colors.primary} size={32} />
                    <Text style={[styles.quickActionText, { color: colors.text }]}>Schedule</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.quickAction} 
                    activeOpacity={0.8} 
                    accessibilityLabel="Scanner"
                    onPress={() => router.push({
                      pathname: '/(tabs)/food-scanner',
                      params: { mode: 'scan' }
                    })}
                  >
                    <Search color={colors.primary} size={32} />
                    <Text style={[styles.quickActionText, { color: colors.text }]}>Scanner</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.quickAction} 
                    activeOpacity={0.8} 
                    accessibilityLabel="Self Care"
                    onPress={() => router.push({
                      pathname: '/(tabs)/resources',
                      params: { category: 'self-care' }
                    })}
                  >
                    <Heart color={colors.primary} size={32} />
                    <Text style={[styles.quickActionText, { color: colors.text }]}>Self Care</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.quickAction} 
                    activeOpacity={0.8} 
                    accessibilityLabel="Journal"
                    onPress={() => router.push('/(tabs)/journal')}
                  >
                    <PenTool color={colors.primary} size={32} />
                    <Text style={[styles.quickActionText, { color: colors.text }]}>Journal</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
              <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
                {recentActivities.length > 0 ? (
                  <View style={styles.activityList}>
                    {recentActivities.map((activity, index) => (
                      <View key={index} style={styles.activityItem}>
                        <View style={styles.activityIcon}>
                          {getActivityIcon(activity.icon)}
                        </View>
                        <View style={styles.activityContent}>
                          <Text style={styles.activityTitle}>{activity.title}</Text>
                          <Text style={styles.activityDescription}>{activity.description}</Text>
                          <Text style={styles.activityTimestamp}>
                            {formatActivityTimestamp(activity.timestamp)}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.emptyActivityText}>
                    No recent activity. Start by creating your first journal entry!
                  </Text>
                )}
              </View>
            </View>

            {/* Getting Started Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Getting Started</Text>
              <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Text style={[styles.cardText, { color: colors.text }]}>
                  Start your journey with these key features:
                </Text>
                <View style={styles.featureList}>
                  <View style={styles.featureItem}>
                    <Users size={20} color={colors.primary} />
                    <Text style={[styles.featureItemText, { color: colors.text }]}>Add your children's profiles</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Clock size={20} color={colors.primary} />
                    <Text style={[styles.featureItemText, { color: colors.text }]}>Create daily routines</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Search size={20} color={colors.primary} />
                    <Text style={[styles.featureItemText, { color: colors.text }]}>Scan food products</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <BookOpen size={20} color={colors.primary} />
                    <Text style={[styles.featureItemText, { color: colors.text }]}>Explore resources</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Feature Status Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Feature Status</Text>
              <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <View style={styles.statusList}>
                  <View style={styles.statusItem}>
                    <View style={[styles.statusBadge, { backgroundColor: '#4CAF50' }]}>
                      <Text style={styles.statusText}>Ready</Text>
                    </View>
                    <Text style={[styles.statusItemText, { color: colors.text }]}>Schedule & Routines</Text>
                  </View>
                  <View style={styles.statusItem}>
                    <View style={[styles.statusBadge, { backgroundColor: '#4CAF50' }]}>
                      <Text style={styles.statusText}>Ready</Text>
                    </View>
                    <Text style={[styles.statusItemText, { color: colors.text }]}>Resources</Text>
                  </View>
                  <View style={styles.statusItem}>
                    <View style={[styles.statusBadge, { backgroundColor: '#FFA000' }]}>
                      <Text style={styles.statusText}>Beta</Text>
                    </View>
                    <Text style={[styles.statusItemText, { color: colors.text }]}>Food Scanner</Text>
                  </View>
                  <View style={styles.statusItem}>
                    <View style={[styles.statusBadge, { backgroundColor: '#4CAF50' }]}>
                      <Text style={styles.statusText}>Ready</Text>
                    </View>
                    <Text style={[styles.statusItemText, { color: colors.text }]}>Journal</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Coming Soon Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Coming Soon</Text>
              <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <View style={styles.comingSoonList}>
                  <View style={styles.comingSoonItem}>
                    <Star size={20} color={colors.textSecondary} />
                    <Text style={[styles.comingSoonText, { color: colors.text }]}>Progress tracking and analytics</Text>
                  </View>
                  <View style={styles.comingSoonItem}>
                    <MessageSquare size={20} color={colors.textSecondary} />
                    <Text style={[styles.comingSoonText, { color: colors.text }]}>Family communication tools</Text>
                  </View>
                  <View style={styles.comingSoonItem}>
                    <AlertCircle size={20} color={colors.textSecondary} />
                    <Text style={[styles.comingSoonText, { color: colors.text }]}>Emergency support resources</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Feedback Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Help Us Improve</Text>
              <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Text style={[styles.cardText, { color: colors.text }]}>
                  We're actively developing new features and improvements. Your feedback helps us build a better app for families.
                </Text>
                <TouchableOpacity 
                  style={[styles.feedbackButton, { backgroundColor: colors.primary }]}
                  onPress={() => router.push('/(settings)/support' as any)}
                >
                  <MessageSquare size={20} color="#FFFFFF" />
                  <Text style={styles.feedbackButtonText}>Share Your Feedback</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </WebGradientWrapper>
  );
} 