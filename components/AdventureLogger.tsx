import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { CreateAdventureForm, AdventureWinType } from '@/types/skillJourney';

interface AdventureLoggerProps {
  skillName: string;
  onLogAdventure: (adventure: CreateAdventureForm) => Promise<void>;
  isLoading?: boolean;
}

const WIN_TYPE_BUTTONS: { type: AdventureWinType; label: string; emoji: string; childFriendly: string }[] = [
  { type: 'tried-best', label: 'We tried our best!', emoji: '🌟', childFriendly: 'We gave it our all!' },
  { type: 'no-frustration', label: 'We didn\'t get frustrated!', emoji: '😌', childFriendly: 'We stayed calm!' },
  { type: 'laughed-about-it', label: 'We laughed about it!', emoji: '😄', childFriendly: 'We found the fun!' },
  { type: 'made-progress', label: 'We made progress!', emoji: '📈', childFriendly: 'We got better!' },
  { type: 'kept-going', label: 'We kept going!', emoji: '💪', childFriendly: 'We didn\'t give up!' },
];

export const AdventureLogger: React.FC<AdventureLoggerProps> = ({
  skillName,
  onLogAdventure,
  isLoading = false
}) => {
  const [selectedWinType, setSelectedWinType] = useState<AdventureWinType | null>(null);
  const [customText, setCustomText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogAdventure = async () => {
    if (!selectedWinType) {
      Alert.alert('Pick a Win!', 'Tell us what went well today!');
      return;
    }

    setIsSubmitting(true);
    try {
      const adventure: CreateAdventureForm = {
        text: customText.trim() || `Today's ${skillName} adventure: ${selectedWinType}`,
        winType: selectedWinType,
      };

      await onLogAdventure(adventure);
      
      // Reset form
      setSelectedWinType(null);
      setCustomText('');
      
      Alert.alert('Awesome!', 'Your adventure is now part of your story! 🌱');
    } catch (error) {
      Alert.alert('Oops!', 'Something went wrong. Let\'s try again!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSubmitDisabled = !selectedWinType || isSubmitting || isLoading;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>How did your "{skillName}" adventure go today?</Text>
      
      {/* Win Type Selection */}
      <Text style={styles.sectionTitle}>What was your biggest win today?</Text>
      <View style={styles.winTypeContainer}>
        {WIN_TYPE_BUTTONS.map((button) => (
          <TouchableOpacity
            key={button.type}
            style={[
              styles.winTypeButton,
              selectedWinType === button.type && styles.selectedWinTypeButton
            ]}
            onPress={() => setSelectedWinType(button.type)}
            disabled={isSubmitting || isLoading}
          >
            <Text style={styles.winTypeEmoji}>{button.emoji}</Text>
            <Text style={[
              styles.winTypeLabel,
              selectedWinType === button.type && styles.selectedWinTypeLabel
            ]}>
              {button.childFriendly}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Custom Text Input */}
      <Text style={styles.sectionTitle}>Want to share more about your adventure? (totally optional!)</Text>
      <TextInput
        style={styles.textInput}
        placeholder="Tell us about your adventure... (optional)"
        value={customText}
        onChangeText={setCustomText}
        multiline
        numberOfLines={3}
        maxLength={200}
        editable={!isSubmitting && !isLoading}
      />
      <Text style={styles.characterCount}>{customText.length}/200</Text>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, isSubmitDisabled && styles.disabledButton]}
        onPress={handleLogAdventure}
        disabled={isSubmitDisabled}
      >
        <Text style={[styles.submitButtonText, isSubmitDisabled && styles.disabledButtonText]}>
          {isSubmitting ? 'Adding to Your Story...' : 'Add to My Story!'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#2E7D32',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  winTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  winTypeButton: {
    width: '48%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedWinTypeButton: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E8',
  },
  winTypeEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  winTypeLabel: {
    fontSize: 12,
    textAlign: 'center',
    color: '#666',
    fontWeight: '500',
  },
  selectedWinTypeLabel: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    backgroundColor: '#FAFAFA',
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#E0E0E0',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButtonText: {
    color: '#999',
  },
});

export default AdventureLogger; 