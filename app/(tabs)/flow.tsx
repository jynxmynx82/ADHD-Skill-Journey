import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  Platform, 
  Dimensions,
  TouchableOpacity,
  StatusBar
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useFamily } from '@/context/FamilyContext';
import { Plus, Sparkles } from 'lucide-react-native';
import { slice1Service } from '@/lib/skillJourneyService';
import { Journey } from '@/types/skillJourney';
import FlowBackground from '@/components/FlowBackground';
import FlowQuickLog from '@/components/FlowQuickLog';
import FlowSkillOrbs from '@/components/FlowSkillOrbs';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function FlowScreen() {
  const { colors } = useTheme();
  const { userData } = useAuth();
  const { children, selectedChildId, setSelectedChildId } = useFamily();
  
  const [isQuickLogVisible, setIsQuickLogVisible] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [totalAdventures, setTotalAdventures] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load journeys and calculate aggregate data
  useEffect(() => {
    const loadJourneys = async () => {
      if (!selectedChildId) {
        setJourneys([]);
        setTotalAdventures(0);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await slice1Service.getJourneys(selectedChildId);
        
        if (result.data) {
          setJourneys(result.data);
          // Calculate total adventures across all skills
          const total = result.data.reduce((sum, journey) => {
            return sum + (journey.progress?.adventureCount || 0);
          }, 0);
          setTotalAdventures(total);
        }
      } catch (error) {
        console.error('Error loading journeys for Flow:', error);
        setJourneys([]);
        setTotalAdventures(0);
      } finally {
        setLoading(false);
      }
    };

    loadJourneys();
  }, [selectedChildId]);

  const getEncouragingMessage = (totalAdventures: number, journeyCount: number) => {
    if (journeyCount === 0) return "Your adventure story is just beginning!";
    if (totalAdventures === 0) return "Ready to start your first adventure?";
    if (totalAdventures <= 3) return "You're building something amazing!";
    if (totalAdventures <= 7) return "Look how far you've come!";
    if (totalAdventures <= 14) return "You're becoming unstoppable!";
    return "You're absolutely incredible!";
  };

  const selectedChild = children.find(c => c.id === selectedChildId);
  const encouragingMessage = getEncouragingMessage(totalAdventures, journeys.length);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 0,
      paddingBottom: 20,
      zIndex: 10,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
    },
    quickLogButton: {
      backgroundColor: colors.primary,
      borderRadius: 25,
      width: 50,
      height: 50,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    infoPanel: {
      backgroundColor: colors.background,
      borderRadius: 16,
      padding: 16,
      marginHorizontal: 20,
      marginBottom: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    infoHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    infoTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginLeft: 8,
    },
    encouragingMessage: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: '500',
      marginBottom: 8,
    },
    infoText: {
      fontSize: 12,
      color: colors.textSecondary,
      lineHeight: 16,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: '#E0E0E0',
    },
    statItem: {
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.primary,
    },
    statLabel: {
      fontSize: 10,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    canvasContainer: {
      flex: 1,
      position: 'relative',
    },
    closeButton: {
      position: 'absolute',
      top: 20,
      right: 20,
      backgroundColor: colors.background,
      borderRadius: 20,
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
  });

  const handleQuickLog = () => {
    setIsQuickLogVisible(true);
  };

  const handleCloseQuickLog = () => {
    setIsQuickLogVisible(false);
    setSelectedSkill(null);
  };

  const handleSkillSelect = (skillId: string) => {
    setSelectedSkill(skillId);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle={colors.text === '#000000' ? 'dark-content' : 'light-content'}
        backgroundColor={colors.background}
        translucent={true}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Flow</Text>
        <TouchableOpacity 
          style={styles.quickLogButton}
          onPress={handleQuickLog}
          accessibilityLabel="Quick log adventure"
        >
          <Plus size={24} color={colors.background} />
        </TouchableOpacity>
      </View>

      {/* Info Panel - enhanced with aggregate data */}
      <View style={styles.infoPanel}>
        <View style={styles.infoHeader}>
          <Sparkles size={16} color={colors.primary} />
          <Text style={styles.infoTitle}>Your Adventure Story</Text>
        </View>
        
        {!loading && (
          <>
            <Text style={styles.encouragingMessage}>
              {encouragingMessage}
            </Text>
            
            <Text style={styles.infoText}>
              Each orb represents a skill you're growing. The ripples show your recent adventures and progress.
            </Text>

            {journeys.length > 0 && (
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{journeys.length}</Text>
                  <Text style={styles.statLabel}>Skills Growing</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{totalAdventures}</Text>
                  <Text style={styles.statLabel}>Total Adventures</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {journeys.length > 0 ? Math.round(totalAdventures / journeys.length) : 0}
                  </Text>
                  <Text style={styles.statLabel}>Avg per Skill</Text>
                </View>
              </View>
            )}
          </>
        )}
      </View>

      {/* Main Canvas with Background */}
      <View style={styles.canvasContainer}>
        <FlowBackground />
        
        {/* Skill Orbs Overlay */}
        <FlowSkillOrbs 
          onSkillSelect={handleSkillSelect}
          selectedSkill={selectedSkill}
        />
      </View>

      {/* Quick Log Modal */}
      {isQuickLogVisible && (
        <FlowQuickLog 
          onClose={handleCloseQuickLog}
          selectedSkill={selectedSkill}
        />
      )}
    </SafeAreaView>
  );
} 