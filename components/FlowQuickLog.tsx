import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  ScrollView,
  TextInput,
  Alert
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useFamily } from '@/context/FamilyContext';
import { slice1Service } from '@/lib/skillJourneyService';
import { Journey, CreateAdventureForm, AdventureWinType } from '@/types/skillJourney';
import { X, Check, Plus, Sparkles } from 'lucide-react-native';

interface FlowQuickLogProps {
  onClose: () => void;
  selectedSkill: string | null;
}

export default function FlowQuickLog({ onClose, selectedSkill }: FlowQuickLogProps) {
  const { colors } = useTheme();
  const { selectedChildId } = useFamily();
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  // Load journeys
  useEffect(() => {
    const loadJourneys = async () => {
      if (!selectedChildId) return;

      try {
        const result = await slice1Service.getJourneys(selectedChildId);
        if (result.data) {
          setJourneys(result.data);
          // Auto-select the pre-selected skill or first journey
          if (selectedSkill) {
            const preSelected = result.data.find(j => j.skillData.id === selectedSkill);
            setSelectedJourney(preSelected || result.data[0]);
          } else {
            setSelectedJourney(result.data[0]);
          }
        }
      } catch (error) {
        console.error('Error loading journeys:', error);
      }
    };

    loadJourneys();
  }, [selectedChildId, selectedSkill]);

  const handleQuickLog = async (winType: AdventureWinType) => {
    if (!selectedChildId || !selectedJourney) {
      Alert.alert('Oops!', 'Please select a skill first!');
      return;
    }

    setLoading(true);
    try {
      const adventureData: CreateAdventureForm = {
        winType,
        text: note.trim() || `Quick ${winType} adventure logged`,
      };

      const result = await slice1Service.logAdventure(
        selectedChildId, 
        selectedJourney.skillData.id, 
        adventureData
      );

      if (result.data) {
        Alert.alert('Awesome!', 'Your adventure is now part of your story! 🌱', [
          { text: 'OK', onPress: onClose }
        ]);
        setNote('');
      }
    } catch (error) {
      console.error('Error logging adventure:', error);
      Alert.alert('Oops!', 'Something went wrong. Let\'s try again!');
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: colors.background,
      borderRadius: 20,
      padding: 24,
      margin: 20,
      maxWidth: 400,
      width: '100%',
      maxHeight: '80%',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
    },
    closeButton: {
      padding: 8,
    },
    skillSelector: {
      marginBottom: 20,
    },
    skillSelectorTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 10,
    },
    skillButtons: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    skillButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    skillButtonSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    skillButtonText: {
      fontSize: 14,
      color: colors.text,
    },
    skillButtonTextSelected: {
      color: colors.background,
    },
    noteInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 12,
      marginBottom: 20,
      color: colors.text,
      fontSize: 16,
      minHeight: 80,
      textAlignVertical: 'top',
    },
    winTypeButtons: {
      gap: 12,
    },
    winTypeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    winTypeButtonText: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
      marginLeft: 12,
    },
    loadingButton: {
      opacity: 0.6,
    },
    encouragingText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 16,
      fontStyle: 'italic',
    },
  });

  const winTypes = [
    { key: 'tried-best' as const, label: 'We gave it our all!', icon: '🌟' },
    { key: 'made-progress' as const, label: 'We got better!', icon: '📈' },
    { key: 'kept-going' as const, label: 'We didn\'t give up!', icon: '💪' },
    { key: 'no-frustration' as const, label: 'We stayed calm!', icon: '😌' },
  ];

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Sparkles size={20} color={colors.primary} />
              <Text style={styles.title}>Quick Adventure Log</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <Text style={styles.encouragingText}>
            Share a quick moment from today's adventure
          </Text>

          {/* Skill Selector */}
          <View style={styles.skillSelector}>
            <Text style={styles.skillSelectorTitle}>Which skill adventure?</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.skillButtons}>
                {journeys.map((journey) => (
                  <TouchableOpacity
                    key={journey.skillData.id}
                    style={[
                      styles.skillButton,
                      selectedJourney?.skillData.id === journey.skillData.id && styles.skillButtonSelected,
                    ]}
                    onPress={() => setSelectedJourney(journey)}
                  >
                    <Text
                      style={[
                        styles.skillButtonText,
                        selectedJourney?.skillData.id === journey.skillData.id && styles.skillButtonTextSelected,
                      ]}
                    >
                      {journey.skillData.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Note Input */}
          <TextInput
            style={styles.noteInput}
            placeholder="Want to share more? (totally optional!)"
            placeholderTextColor={colors.textSecondary}
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={3}
          />

          {/* Win Type Buttons */}
          <View style={styles.winTypeButtons}>
            {winTypes.map((winType) => (
              <TouchableOpacity
                key={winType.key}
                style={[styles.winTypeButton, loading && styles.loadingButton]}
                onPress={() => handleQuickLog(winType.key)}
                disabled={loading}
              >
                <Text style={{ fontSize: 20 }}>{winType.icon}</Text>
                <Text style={styles.winTypeButtonText}>{winType.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
} 