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
  RefreshControl,
  Alert
} from 'react-native';
import { Plus, ArrowLeft, Sparkles } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useFamily } from '@/context/FamilyContext';
import { slice1Service } from '@/lib/skillJourneyService';
import { Journey, Adventure, CreateSimpleSkillForm, CreateAdventureForm, AIStory } from '@/types/skillJourney';
import { aiStoryService } from '@/lib/aiStoryService';
import { PremiumFeatureGate } from '@/components/premium/PremiumFeatureGate';

import AdventureLogger from '@/components/AdventureLogger';
import MemoryLane from '@/components/MemoryLane';
import SimpleSkillForm from '@/components/SimpleSkillForm';

export default function SkillJourneyScreen() {
  const { colors } = useTheme();
  const { userData } = useAuth();
  const { children, selectedChildId, setSelectedChildId, loading: familyLoading } = useFamily();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null);
  const [adventures, setAdventures] = useState<Adventure[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAdventureLogger, setShowAdventureLogger] = useState(false);

  const isWeb = Platform.OS === 'web';
  const windowWidth = Dimensions.get('window').width;

  // Auto-select first child if none selected
  useEffect(() => {
    if (children.length > 0 && !selectedChildId) {
      setSelectedChildId(children[0].id);
    } else if (children.length === 0) {
      setSelectedChildId(null);
    }
  }, [children, selectedChildId, setSelectedChildId]);

  // Load journeys when selectedChildId changes
  const loadJourneys = async () => {
    if (!selectedChildId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const result = await slice1Service.getJourneys(selectedChildId);
      
      if (result.data) {
        setJourneys(result.data);
        // Auto-select first journey if available
        if (result.data.length > 0 && !selectedJourney) {
          setSelectedJourney(result.data[0]);
        }
      }
    } catch (error) {
      console.error('Error loading journeys:', error);
      setJourneys([]);
    } finally {
      setLoading(false);
    }
  };

  // Load adventures when selectedJourney changes
  const loadAdventures = async () => {
    if (!selectedChildId || !selectedJourney) {
      setAdventures([]);
      return;
    }

    try {
      const result = await slice1Service.getAdventures(selectedChildId, selectedJourney.skillData.id);
      if (result.data) {
        setAdventures(result.data);
      }
    } catch (error) {
      console.error('Error loading adventures:', error);
      setAdventures([]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadJourneys();
    setRefreshing(false);
  };

  useEffect(() => {
    loadJourneys();
  }, [selectedChildId]);

  useEffect(() => {
    loadAdventures();
  }, [selectedJourney]);

  // Create new skill journey
  const handleCreateSkill = async (skillData: CreateSimpleSkillForm) => {
    if (!selectedChildId) {
      Alert.alert('Error', 'No child selected');
      return;
    }

    try {
      const result = await slice1Service.createJourney(selectedChildId, skillData);
      if (result.data) {
        setJourneys(prev => [result.data!, ...prev]);
        setSelectedJourney(result.data);
        setShowCreateForm(false);
        Alert.alert('Success', 'Skill journey created! Start logging adventures to build your progress.');
      }
    } catch (error) {
      console.error('Error creating skill:', error);
      Alert.alert('Error', 'Failed to create skill journey');
    }
  };

  // Log new adventure
  const handleLogAdventure = async (adventureData: CreateAdventureForm) => {
    if (!selectedChildId || !selectedJourney) {
      Alert.alert('Error', 'No skill selected');
      return;
    }

    try {
      const result = await slice1Service.logAdventure(selectedChildId, selectedJourney.skillData.id, adventureData);
      if (result.data) {
        setAdventures(prev => [result.data!, ...prev]);
        // Update the journey's progress data
        setSelectedJourney(prev => prev ? {
          ...prev,
          progress: {
            ...prev.progress,
            adventureCount: prev.progress.adventureCount + 1,
            lastUpdated: new Date()
          }
        } : null);
        setShowAdventureLogger(false);
      }
    } catch (error) {
      console.error('Error logging adventure:', error);
      throw error; // Let the component handle the error
    }
  };

  if (familyLoading || loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading skill journeys...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (children.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Children Added</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Add a child to start tracking skill journeys
          </Text>
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/children/add')}
          >
            <Plus size={20} color={colors.background} />
            <Text style={[styles.addButtonText, { color: colors.background }]}>
              Add Child
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (showCreateForm) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setShowCreateForm(false)}
          >
            <ArrowLeft size={24} color={colors.text} />
            <Text style={[styles.backButtonText, { color: colors.text }]}>Back</Text>
          </TouchableOpacity>
        </View>
        <SimpleSkillForm
          onSubmit={handleCreateSkill}
          onCancel={() => setShowCreateForm(false)}
          isLoading={false}
        />
      </SafeAreaView>
    );
  }

  if (showAdventureLogger && selectedJourney) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setShowAdventureLogger(false)}
          >
            <ArrowLeft size={24} color={colors.text} />
            <Text style={[styles.backButtonText, { color: colors.text }]}>Back</Text>
          </TouchableOpacity>
        </View>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <AdventureLogger
            skillName={selectedJourney.skillData.name}
            onLogAdventure={handleLogAdventure}
            isLoading={loading}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  const selectedChild = children.find(c => c.id === selectedChildId);
  const totalAdventures = adventures.length;
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>Skill Journey</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {selectedChild?.name || 'Select a child'}
            </Text>
          </View>
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={() => setShowCreateForm(true)}
          >
            <Plus size={20} color={colors.background} />
            <Text style={[styles.addButtonText, { color: colors.background }]}>
              New Skill
            </Text>
          </TouchableOpacity>
        </View>

        {/* Daily Check-in Section */}
        {journeys.length > 0 && (
          <View style={[styles.dailyCheckin, { backgroundColor: colors.background }]}>
            <View style={styles.checkinHeader}>
              <Sparkles size={20} color={colors.primary} />
              <Text style={[styles.checkinTitle, { color: colors.text }]}>
                How's {today} going?
              </Text>
            </View>
            <Text style={[styles.checkinSubtitle, { color: colors.textSecondary }]}>
              Share a quick moment from today's adventures
            </Text>
            
            {selectedJourney && (
              <TouchableOpacity 
                style={[styles.quickLogButton, { backgroundColor: colors.primary }]}
                onPress={() => setShowAdventureLogger(true)}
              >
                <Text style={[styles.quickLogText, { color: colors.background }]}>
                  Log {selectedJourney.skillData.name} Adventure
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {journeys.length === 0 ? (
          <View style={styles.emptyJourneysContainer}>
            <Text style={[styles.emptyJourneysTitle, { color: colors.text }]}>
              No Skills Yet
            </Text>
            <Text style={[styles.emptyJourneysText, { color: colors.textSecondary }]}>
              Create your first skill journey to start building your adventure story!
            </Text>
            <TouchableOpacity 
              style={[styles.createFirstButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowCreateForm(true)}
            >
              <Plus size={20} color={colors.background} />
              <Text style={[styles.createFirstButtonText, { color: colors.background }]}>
                Create First Skill
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.content}>
            {/* Journey Selection */}
            <View style={styles.journeySelector}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Select a Skill</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {journeys.map((journey) => (
                  <TouchableOpacity
                    key={journey.skillData.id}
                    style={[
                      styles.journeyCard,
                      selectedJourney?.skillData.id === journey.skillData.id && 
                      { borderColor: colors.primary, backgroundColor: colors.primary + '10' }
                    ]}
                    onPress={() => setSelectedJourney(journey)}
                  >
                    <Text style={[styles.journeyName, { color: colors.text }]}>
                      {journey.skillData.name}
                    </Text>
                    <Text style={[styles.journeyCategory, { color: colors.textSecondary }]}>
                      {journey.skillData.category}
                    </Text>
                    <Text style={[styles.journeyAdventures, { color: colors.primary }]}>
                      {journey.progress.adventureCount} adventures
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {selectedJourney && (
              <>
                {/* Progress Section */}
                <View style={styles.progressSection}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Progress</Text>
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { 
                            backgroundColor: colors.primary,
                            width: `${Math.min((selectedJourney.progress.adventureCount / 10) * 100, 100)}%`
                          }
                        ]} 
                      />
                    </View>
                    <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                      {selectedJourney.progress.adventureCount} adventures logged
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={[styles.logAdventureButton, { backgroundColor: colors.primary }]}
                    onPress={() => setShowAdventureLogger(true)}
                  >
                    <Text style={[styles.logAdventureButtonText, { color: colors.background }]}>
                      Log Today's Adventure
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Memory Lane */}
                <View style={styles.memoryLaneSection}>
                  <MemoryLane adventures={adventures} journey={selectedJourney} isLoading={loading} />
                </View>
              </>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    marginLeft: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  addButton: {
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  emptyJourneysContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyJourneysTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyJourneysText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  createFirstButton: {
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  createFirstButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  journeySelector: {
    marginBottom: 24,
  },
  journeyCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#F5F5F5',
    marginRight: 12,
    minWidth: 120,
  },
  journeyName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  journeyCategory: {
    fontSize: 12,
    marginBottom: 8,
  },
  journeyAdventures: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  progressContainer: {
    marginTop: 30,
    marginBottom: 16,
    alignItems: 'center',
    width: '100%',
  },
  progressBar: {
    width: '80%',
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    textAlign: 'center',
  },
  logAdventureButton: {
    padding: 16,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  logAdventureButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  memoryLaneSection: {
    flex: 1,
  },
  dailyCheckin: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  checkinHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkinTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  checkinSubtitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  quickLogButton: {
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quickLogText: {
    fontSize: 16,
    fontWeight: '600',
  },
  storyButton: {
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  storyButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  storyButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 