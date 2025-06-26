import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  Platform, 
  Dimensions,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { 
  Plus, 
  Target, 
  TrendingUp, 
  BookOpen, 
  Star, 
  Calendar,
  Award,
  Users,
  Heart,
  Zap
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useFamily } from '@/context/FamilyContext';
import { 
  skillService, 
  progressService, 
  milestoneService, 
  storyService, 
  statsService 
} from '@/lib/skillJourneyService';
import { 
  Skill, 
  SkillProgress, 
  SkillMilestone, 
  AIStory, 
  SkillJourneyStats,
  ProgressStatus 
} from '@/types/skillJourney';

export default function SkillJourneyScreen() {
  const { colors } = useTheme();
  const { userData } = useAuth();
  const { children, selectedChildId, setSelectedChildId, loading: familyLoading } = useFamily();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [latestProgress, setLatestProgress] = useState<Record<string, SkillProgress>>({});
  const [milestones, setMilestones] = useState<SkillMilestone[]>([]);
  const [stories, setStories] = useState<AIStory[]>([]);
  const [stats, setStats] = useState<SkillJourneyStats | null>(null);

  const isWeb = Platform.OS === 'web';
  const windowWidth = Dimensions.get('window').width;

  // Auto-select first child if none selected
  useEffect(() => {
    console.log('SkillJourney: children changed', children.length);
    if (children.length > 0 && !selectedChildId) {
      console.log('SkillJourney: Auto-selecting first child:', children[0].id);
      setSelectedChildId(children[0].id);
    } else if (children.length === 0) {
      console.log('SkillJourney: No children available');
      setSelectedChildId(null);
    }
  }, [children, selectedChildId, setSelectedChildId]);

  // Load all data when selectedChildId changes
  const loadData = async () => {
    console.log('SkillJourney: loadData called with childId:', selectedChildId);
    if (!selectedChildId) {
      console.log('SkillJourney: No selectedChildId, setting loading to false');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('SkillJourney: Starting data load...');
      
      const [
        skillsResult,
        progressResult,
        milestonesResult,
        storiesResult,
        statsResult
      ] = await Promise.all([
        skillService.getSkills(selectedChildId),
        progressService.getLatestProgress(selectedChildId),
        milestoneService.getChildMilestones(selectedChildId),
        storyService.getChildStories(selectedChildId),
        statsService.getChildStats(selectedChildId)
      ]);

      console.log('SkillJourney: Data load completed', {
        skills: skillsResult.data?.length || 0,
        progress: progressResult.data ? Object.keys(progressResult.data).length : 0,
        milestones: milestonesResult.data?.length || 0,
        stories: storiesResult.data?.length || 0,
        stats: !!statsResult.data
      });

      // Handle results with error checking
      if (skillsResult.data) setSkills(skillsResult.data);
      if (progressResult.data) setLatestProgress(progressResult.data);
      if (milestonesResult.data) setMilestones(milestonesResult.data);
      if (storiesResult.data) setStories(storiesResult.data);
      if (statsResult.data) setStats(statsResult.data);

      // Log any errors for debugging
      if (skillsResult.error) console.warn('Skills error:', skillsResult.error);
      if (progressResult.error) console.warn('Progress error:', progressResult.error);
      if (milestonesResult.error) console.warn('Milestones error:', milestonesResult.error);
      if (storiesResult.error) console.warn('Stories error:', storiesResult.error);
      if (statsResult.error) console.warn('Stats error:', statsResult.error);

    } catch (error) {
      console.error('Error loading skill journey data:', error);
      // Set empty states on error
      setSkills([]);
      setLatestProgress({});
      setMilestones([]);
      setStories([]);
      setStats(null);
    } finally {
      console.log('SkillJourney: Setting loading to false');
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, [selectedChildId]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
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
    header: {
      padding: 16,
      paddingTop: 8,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      marginTop: 4,
    },
    addButton: {
      backgroundColor: colors.primary,
      padding: 12,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    addButtonText: {
      color: colors.background,
      fontWeight: '600',
      fontSize: 16,
    },
    section: {
      padding: 16,
      paddingTop: 0,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 24,
    },
    statCard: {
      flex: 1,
      minWidth: 120,
      padding: 16,
      borderRadius: 12,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    statValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.primary,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    skillsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    skillCard: {
      width: isWeb ? '48%' : '48%',
      padding: 16,
      borderRadius: 12,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 12,
    },
    skillName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    skillCategory: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    progressBar: {
      height: 6,
      backgroundColor: colors.border,
      borderRadius: 3,
      marginBottom: 8,
    },
    progressFill: {
      height: '100%',
      borderRadius: 3,
    },
    progressText: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    milestoneCard: {
      padding: 16,
      borderRadius: 12,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    milestoneIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary + '20',
      justifyContent: 'center',
      alignItems: 'center',
    },
    milestoneContent: {
      flex: 1,
    },
    milestoneTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    milestoneDate: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    storyCard: {
      padding: 16,
      borderRadius: 12,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 12,
    },
    storyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    storyPreview: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
      marginBottom: 12,
    },
    storyMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    storyType: {
      fontSize: 12,
      color: colors.primary,
      fontWeight: '500',
    },
    storyReadCount: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    emptyState: {
      padding: 32,
      alignItems: 'center',
    },
    emptyIcon: {
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    emptyText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
    childSelector: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 8,
    },
    childButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    childButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    childButtonText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
    },
    childButtonTextActive: {
      color: colors.background,
    },
  });

  const getProgressPercentage = (skill: Skill): number => {
    const progress = latestProgress[skill.id];
    if (!progress) return 0;
    
    const statusValues: Record<ProgressStatus, number> = {
      'not-started': 0,
      'struggling': 20,
      'learning': 40,
      'improving': 60,
      'almost-there': 80,
      'mastered': 100,
      'maintaining': 100,
    };
    
    return statusValues[progress.status] || 0;
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 80) return colors.success;
    if (percentage >= 60) return colors.primary;
    if (percentage >= 40) return '#FFA500';
    return colors.error;
  };

  const getMilestoneIcon = (type: string) => {
    switch (type) {
      case 'first-attempt': return <Target size={20} color={colors.primary} />;
      case 'breakthrough': return <Zap size={20} color={colors.primary} />;
      case 'consistency': return <TrendingUp size={20} color={colors.primary} />;
      case 'independence': return <Award size={20} color={colors.primary} />;
      case 'teaching-others': return <Users size={20} color={colors.primary} />;
      case 'mastery': return <Star size={20} color={colors.primary} />;
      default: return <Award size={20} color={colors.primary} />;
    }
  };

  if (familyLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 16, color: colors.textSecondary }}>Loading family data...</Text>
      </View>
    );
  }

  if (children.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.inner, { justifyContent: 'center', alignItems: 'center', padding: 32 }]}>
          <Users size={64} color={colors.textSecondary} style={{ marginBottom: 16 }} />
          <Text style={[styles.title, { textAlign: 'center', marginBottom: 8 }]}>No Children Added</Text>
          <Text style={[styles.subtitle, { textAlign: 'center', marginBottom: 24 }]}>
            Add a child to your family to start tracking their skill journey
          </Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push('/children/add')}
          >
            <Plus size={20} color={colors.background} />
            <Text style={styles.addButtonText}>Add Child</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 16, color: colors.textSecondary }}>Loading your skill journey...</Text>
      </View>
    );
  }

  const selectedChild = children.find(child => child.id === selectedChildId);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.inner}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Skill Journey</Text>
            {selectedChild && (
              <Text style={styles.subtitle}>
                {selectedChild.name}'s learning adventure
              </Text>
            )}
            {children.length > 1 && (
              <View style={styles.childSelector}>
                {children.map((child) => (
                  <TouchableOpacity
                    key={child.id}
                    style={[
                      styles.childButton,
                      selectedChildId === child.id && styles.childButtonActive
                    ]}
                    onPress={() => setSelectedChildId(child.id)}
                  >
                    <Text style={[
                      styles.childButtonText,
                      selectedChildId === child.id && styles.childButtonTextActive
                    ]}>
                      {child.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push('/(tabs)/skill-journey/add-skill')}
          >
            <Plus size={20} color={colors.background} />
            <Text style={styles.addButtonText}>Add Skill</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Overview */}
        {stats && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <TrendingUp size={20} color={colors.primary} />
              Your Progress
            </Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.activeSkills}</Text>
                <Text style={styles.statLabel}>Active Skills</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.masteredSkills}</Text>
                <Text style={styles.statLabel}>Mastered</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.currentStreak}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.totalMilestones}</Text>
                <Text style={styles.statLabel}>Milestones</Text>
              </View>
            </View>
          </View>
        )}

        {/* Active Skills */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Target size={20} color={colors.primary} />
            Active Skills
          </Text>
          {skills.length > 0 ? (
            <View style={styles.skillsGrid}>
              {skills.slice(0, 6).map((skill) => {
                const progressPercentage = getProgressPercentage(skill);
                return (
                  <TouchableOpacity 
                    key={skill.id} 
                    style={styles.skillCard}
                    onPress={() => router.push(`/skill-journey/skill/${skill.id}`)}
                  >
                    <Text style={styles.skillName}>{skill.name}</Text>
                    <Text style={styles.skillCategory}>{skill.category}</Text>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { 
                            width: `${progressPercentage}%`,
                            backgroundColor: getProgressColor(progressPercentage)
                          }
                        ]} 
                      />
                    </View>
                    <Text style={styles.progressText}>{progressPercentage}% complete</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Target size={48} color={colors.textSecondary} style={styles.emptyIcon} />
              <Text style={styles.emptyTitle}>No skills yet</Text>
              <Text style={styles.emptyText}>
                Start by adding your first skill to track progress and celebrate achievements!
              </Text>
            </View>
          )}
        </View>

        {/* Recent Milestones */}
        {milestones.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Award size={20} color={colors.primary} />
              Recent Milestones
            </Text>
            {milestones.slice(0, 3).map((milestone) => (
              <TouchableOpacity 
                key={milestone.id} 
                style={styles.milestoneCard}
                onPress={() => router.push(`/skill-journey/milestone/${milestone.id}`)}
              >
                <View style={styles.milestoneIcon}>
                  {getMilestoneIcon(milestone.type)}
                </View>
                <View style={styles.milestoneContent}>
                  <Text style={styles.milestoneTitle}>{milestone.title}</Text>
                  <Text style={styles.milestoneDate}>
                    {new Date(milestone.date).toLocaleDateString()}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* AI Stories */}
        {stories.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <BookOpen size={20} color={colors.primary} />
              Your Stories
            </Text>
            {stories.slice(0, 2).map((story) => (
              <TouchableOpacity 
                key={story.id} 
                style={styles.storyCard}
                onPress={() => router.push(`/skill-journey/story/${story.id}`)}
              >
                <Text style={styles.storyTitle}>{story.title}</Text>
                <Text style={styles.storyPreview}>
                  {story.content.substring(0, 120)}...
                </Text>
                <View style={styles.storyMeta}>
                  <Text style={styles.storyType}>{story.storyType}</Text>
                  <Text style={styles.storyReadCount}>
                    Read {story.readCount} times
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
} 