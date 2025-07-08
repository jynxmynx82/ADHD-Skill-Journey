import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { CreateSimpleSkillForm, SkillCategory } from '@/types/skillJourney';

interface SimpleSkillFormProps {
  onSubmit: (skillData: CreateSimpleSkillForm) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const SKILL_CATEGORIES: { value: SkillCategory; label: string; emoji: string }[] = [
  { value: 'self-care', label: 'Self Care', emoji: '🧴' },
  { value: 'academic', label: 'Academic', emoji: '📚' },
  { value: 'social', label: 'Social', emoji: '👥' },
  { value: 'emotional', label: 'Emotional', emoji: '💙' },
  { value: 'physical', label: 'Physical', emoji: '🏃' },
  { value: 'creative', label: 'Creative', emoji: '🎨' },
  { value: 'life-skills', label: 'Life Skills', emoji: '🏠' },
  { value: 'technology', label: 'Technology', emoji: '💻' },
];

const DIFFICULTY_LEVELS: { value: 'beginner' | 'intermediate' | 'advanced'; label: string; color: string }[] = [
  { value: 'beginner', label: 'Beginner', color: '#4CAF50' },
  { value: 'intermediate', label: 'Intermediate', color: '#FF9800' },
  { value: 'advanced', label: 'Advanced', color: '#F44336' },
];

export const SimpleSkillForm: React.FC<SimpleSkillFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [skillName, setSkillName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'beginner' | 'intermediate' | 'advanced' | null>(null);
  const [estimatedDays, setEstimatedDays] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!skillName.trim()) {
      newErrors.name = 'Skill name is required';
    }

    if (!selectedCategory) {
      newErrors.category = 'Please select a category';
    }

    if (!selectedDifficulty) {
      newErrors.difficulty = 'Please select a difficulty level';
    }

    const days = parseInt(estimatedDays);
    if (isNaN(days) || days < 1 || days > 365) {
      newErrors.estimatedDays = 'Please enter a number between 1 and 365';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const skillData: CreateSimpleSkillForm = {
        name: skillName.trim(),
        category: selectedCategory!,
        difficulty: selectedDifficulty!,
        estimatedDays: parseInt(estimatedDays),
      };

      await onSubmit(skillData);
      
      // Reset form
      setSkillName('');
      setSelectedCategory(null);
      setSelectedDifficulty(null);
      setEstimatedDays('');
      setErrors({});
      
      Alert.alert('Skill Created!', 'Your new skill journey has been created. Start logging adventures to build your progress!');
    } catch (error) {
      Alert.alert('Error', 'Failed to create skill. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSubmitDisabled = !skillName.trim() || !selectedCategory || !selectedDifficulty || !estimatedDays || isSubmitting || isLoading;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Create a New Skill Journey</Text>
      <Text style={styles.subtitle}>What skill would you like to learn together?</Text>

      {/* Skill Name */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Skill Name *</Text>
        <TextInput
          style={[styles.textInput, errors.name ? styles.errorInput : null]}
          placeholder="e.g., Tying Shoes, Reading, Making Friends"
          value={skillName}
          onChangeText={(text) => {
            setSkillName(text);
            if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
          }}
          maxLength={50}
          editable={!isSubmitting && !isLoading}
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
      </View>

      {/* Category Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Category *</Text>
        <View style={styles.categoryContainer}>
          {SKILL_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.value}
              style={[
                styles.categoryButton,
                selectedCategory === category.value && styles.selectedCategoryButton,
                errors.category && !selectedCategory ? styles.errorCategoryButton : null
              ]}
              onPress={() => {
                setSelectedCategory(category.value);
                if (errors.category) setErrors(prev => ({ ...prev, category: '' }));
              }}
              disabled={isSubmitting || isLoading}
            >
              <Text style={styles.categoryEmoji}>{category.emoji}</Text>
              <Text style={[
                styles.categoryLabel,
                selectedCategory === category.value && styles.selectedCategoryLabel
              ]}>
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
      </View>

      {/* Difficulty Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Difficulty Level *</Text>
        <View style={styles.difficultyContainer}>
          {DIFFICULTY_LEVELS.map((difficulty) => (
            <TouchableOpacity
              key={difficulty.value}
              style={[
                styles.difficultyButton,
                selectedDifficulty === difficulty.value && styles.selectedDifficultyButton,
                errors.difficulty && !selectedDifficulty ? styles.errorDifficultyButton : null,
                { borderColor: difficulty.color }
              ]}
              onPress={() => {
                setSelectedDifficulty(difficulty.value);
                if (errors.difficulty) setErrors(prev => ({ ...prev, difficulty: '' }));
              }}
              disabled={isSubmitting || isLoading}
            >
              <Text style={[
                styles.difficultyLabel,
                selectedDifficulty === difficulty.value && { color: difficulty.color }
              ]}>
                {difficulty.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.difficulty && <Text style={styles.errorText}>{errors.difficulty}</Text>}
      </View>

      {/* Estimated Days */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estimated Days to Master *</Text>
        <TextInput
          style={[styles.textInput, errors.estimatedDays ? styles.errorInput : null]}
          placeholder="e.g., 30"
          value={estimatedDays}
          onChangeText={(text) => {
            setEstimatedDays(text);
            if (errors.estimatedDays) setErrors(prev => ({ ...prev, estimatedDays: '' }));
          }}
          keyboardType="numeric"
          maxLength={3}
          editable={!isSubmitting && !isLoading}
        />
        {errors.estimatedDays && <Text style={styles.errorText}>{errors.estimatedDays}</Text>}
        <Text style={styles.helperText}>
          How many days do you think it might take to master this skill?
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onCancel}
          disabled={isSubmitting || isLoading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.submitButton, isSubmitDisabled && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={isSubmitDisabled}
        >
          <Text style={[styles.submitButtonText, isSubmitDisabled && styles.disabledButtonText]}>
            {isSubmitting ? 'Creating...' : 'Create Skill'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryButton: {
    width: '48%',
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedCategoryButton: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E8',
  },
  categoryEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  categoryLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  selectedCategoryLabel: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  difficultyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  difficultyButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  selectedDifficultyButton: {
    backgroundColor: '#fff',
  },
  difficultyLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 40,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 2,
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
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
  errorInput: {
    borderColor: '#F44336',
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 4,
  },
  errorCategoryButton: {
    borderColor: '#F44336',
    backgroundColor: '#FFE8E8',
  },
  errorDifficultyButton: {
    borderColor: '#F44336',
    backgroundColor: '#FFE8E8',
  },
});

export default SimpleSkillForm; 