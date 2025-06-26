import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Platform,
  Dimensions,
  ActivityIndicator,
  Alert
} from 'react-native';
import { ArrowLeft, Save, Target } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useFamily } from '@/context/FamilyContext';
import { skillService } from '@/lib/skillJourneyService';
import { CreateSkillForm, SkillCategory, SkillDifficulty } from '@/types/skillJourney';
import { validateForm, schemas } from '@/lib/validation';

export default function AddSkillScreen() {
  const { colors } = useTheme();
  const { userData } = useAuth();
  const { selectedChildId } = useFamily();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateSkillForm>({
    name: '',
    description: '',
    category: 'self-care',
    difficulty: 'beginner',
    estimatedDays: 30,
    parentNotes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [estimatedDaysText, setEstimatedDaysText] = useState('30');

  const isWeb = Platform.OS === 'web';
  const windowWidth = Dimensions.get('window').width;

  // Memoized styles to prevent re-calculation on every render
  const styles = useMemo(() => StyleSheet.create({
    container: { 
      flex: 1, 
      backgroundColor: colors.background, 
      position: 'relative' 
    },
    inner: { 
      flex: 1, 
      width: isWeb ? Math.min(windowWidth * 0.9, 800) : '100%', 
      maxWidth: isWeb ? 800 : '100%', 
      alignSelf: isWeb ? 'center' : 'stretch', 
      backgroundColor: isWeb ? 'rgba(255,255,255,0.95)' : colors.background, 
      borderRadius: isWeb ? 24 : 0, 
      marginTop: isWeb ? 32 : 0, 
      marginBottom: isWeb ? 32 : 0, 
      marginLeft: isWeb ? 80 : 0, 
      overflow: 'visible', 
      paddingBottom: 100 
    },
    header: { 
      paddingHorizontal: 16, 
      paddingVertical: 12, 
      paddingTop: Platform.OS === 'ios' ? 16 : 12, 
      flexDirection: 'row', 
      alignItems: 'center', 
      gap: 16 
    },
    backButton: { 
      padding: 12, 
      borderRadius: 12, 
      backgroundColor: colors.border, 
      minWidth: 44, 
      minHeight: 44, 
      alignItems: 'center', 
      justifyContent: 'center' 
    },
    title: { 
      fontSize: 24, 
      fontWeight: '700', 
      color: colors.text, 
      flex: 1, 
      textAlign: 'center', 
      marginHorizontal: 16 
    },
    bottomSaveContainer: { 
      position: 'absolute', 
      bottom: 0, 
      left: 0, 
      right: 0, 
      backgroundColor: colors.background, 
      paddingHorizontal: 16, 
      paddingVertical: 16, 
      borderTopWidth: 1, 
      borderTopColor: colors.border, 
      paddingBottom: Platform.OS === 'ios' ? 34 : 16 
    },
    bottomSaveButton: { 
      backgroundColor: colors.primary, 
      paddingVertical: 16, 
      paddingHorizontal: 24, 
      borderRadius: 16, 
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'center', 
      gap: 12, 
      shadowColor: colors.primary, 
      shadowOffset: { width: 0, height: 4 }, 
      shadowOpacity: 0.3, 
      shadowRadius: 8, 
      elevation: 8 
    },
    bottomSaveButtonDisabled: { 
      backgroundColor: colors.border, 
      shadowOpacity: 0, 
      elevation: 0 
    },
    bottomSaveButtonText: { 
      color: colors.background, 
      fontWeight: '700', 
      fontSize: 18 
    },
    form: { 
      padding: 16 
    },
    section: { 
      marginBottom: 24 
    },
    sectionTitle: { 
      fontSize: 18, 
      fontWeight: '600', 
      color: colors.text, 
      marginBottom: 12 
    },
    inputGroup: { 
      marginBottom: 16 
    },
    label: { 
      fontSize: 16, 
      fontWeight: '500', 
      color: colors.text, 
      marginBottom: 8 
    },
    input: { 
      borderWidth: 1, 
      borderColor: colors.border, 
      borderRadius: 8, 
      padding: 12, 
      fontSize: 16, 
      color: colors.text, 
      backgroundColor: colors.background 
    },
    textArea: { 
      borderWidth: 1, 
      borderColor: colors.border, 
      borderRadius: 8, 
      padding: 12, 
      fontSize: 16, 
      color: colors.text, 
      backgroundColor: colors.background, 
      minHeight: 100, 
      textAlignVertical: 'top' 
    },
    errorText: { 
      color: colors.error, 
      fontSize: 14, 
      marginTop: 4 
    },
    categoryGrid: { 
      flexDirection: 'row', 
      flexWrap: 'wrap', 
      gap: 8 
    },
    categoryButton: { 
      paddingHorizontal: 16, 
      paddingVertical: 8, 
      borderRadius: 20, 
      borderWidth: 2, 
      minWidth: 100, 
      alignItems: 'center', 
      flexDirection: 'row', 
      justifyContent: 'center', 
      gap: 6 
    },
    categoryButtonText: { 
      fontSize: 14, 
      fontWeight: '500' 
    },
    difficultyGrid: { 
      flexDirection: 'row', 
      gap: 12 
    },
    difficultyButton: { 
      flex: 1, 
      paddingVertical: 12, 
      paddingHorizontal: 16, 
      borderRadius: 8, 
      borderWidth: 2, 
      alignItems: 'center' 
    },
    difficultyButtonText: { 
      fontSize: 14, 
      fontWeight: '600' 
    },
    numberInput: { 
      borderWidth: 1, 
      borderColor: colors.border, 
      borderRadius: 8, 
      padding: 12, 
      fontSize: 16, 
      color: colors.text, 
      backgroundColor: colors.background, 
      textAlign: 'center' 
    },
    helpText: { 
      fontSize: 14, 
      color: colors.textSecondary, 
      marginTop: 4, 
      lineHeight: 20 
    },
  }), [colors, isWeb, windowWidth]);

  const skillCategories: { value: SkillCategory; label: string; icon: string }[] = [
    { value: 'self-care', label: 'Self Care', icon: '🛁' }, 
    { value: 'academic', label: 'Academic', icon: '📚' },
    { value: 'social', label: 'Social', icon: '👥' }, 
    { value: 'emotional', label: 'Emotional', icon: '💭' },
    { value: 'physical', label: 'Physical', icon: '🏃' }, 
    { value: 'creative', label: 'Creative', icon: '🎨' },
    { value: 'life-skills', label: 'Life Skills', icon: '🏠' }, 
    { value: 'technology', label: 'Technology', icon: '💻' },
    { value: 'custom', label: 'Custom', icon: '⭐' },
  ];

  const difficulties: { value: SkillDifficulty; label: string; description: string }[] = [
    { value: 'beginner', label: 'Beginner', description: 'New to this skill' },
    { value: 'intermediate', label: 'Intermediate', description: 'Some experience' },
    { value: 'advanced', label: 'Advanced', description: 'Building mastery' },
  ];

  const handleInputChange = (field: keyof CreateSkillForm, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) { 
      setErrors(prev => ({ ...prev, [field]: '' })); 
    }
  };

  const handleEstimatedDaysChange = (value: string) => {
    setEstimatedDaysText(value);
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0) { 
      handleInputChange('estimatedDays', numValue); 
    } else if (value === '') { 
      setFormData(prev => ({ ...prev, estimatedDays: 0 })); 
    }
  };

  const validateFormData = async (): Promise<boolean> => {
    try {
      const validationResult = await validateForm(schemas.skillJourney || schemas.profile, formData);
      if (!validationResult.isValid) {
        setErrors(validationResult.errors);
        return false;
      }
      setErrors({});
      return true;
    } catch (error) {
      console.error('Validation error:', error);
      return false;
    }
  };

  const handleSave = async () => {
    if (!selectedChildId) {
      Alert.alert('Error', 'Child not selected');
      return;
    }

    const isValid = await validateFormData();
    if (!isValid) {
      Alert.alert('Validation Error', 'Please check the form and try again');
      return;
    }

    setLoading(true);
    try {
      const result = await skillService.createSkill(selectedChildId, formData);
      
      if (result.error) {
        Alert.alert('Error', result.error.message || 'Failed to create skill');
        return;
      }

      Alert.alert(
        'Success!', 
        `Skill "${formData.name}" has been created. You can now start tracking progress!`,
        [
          {
            text: 'Continue',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error('Error creating skill:', error);
      Alert.alert('Error', 'Failed to create skill. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.name.trim() && formData.description.trim() && formData.estimatedDays > 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.inner} 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()} 
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Create New Skill</Text>
          <View style={[styles.backButton, { backgroundColor: 'transparent' }]} />
        </View>
        
        <View style={styles.form}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Skill Name *</Text>
              <TextInput 
                style={[styles.input, errors.name ? { borderColor: colors.error } : null]} 
                value={formData.name} 
                onChangeText={(value) => handleInputChange('name', value)} 
                placeholder="e.g., Tying shoes, Reading, Making friends" 
                placeholderTextColor={colors.textSecondary} 
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description *</Text>
              <TextInput 
                style={[styles.textArea, errors.description ? { borderColor: colors.error } : null]} 
                value={formData.description} 
                onChangeText={(value) => handleInputChange('description', value)} 
                placeholder="Describe what this skill involves..." 
                placeholderTextColor={colors.textSecondary} 
                multiline 
                numberOfLines={4} 
              />
              {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category</Text>
            <View style={styles.categoryGrid}>
              {skillCategories.map((category) => (
                <TouchableOpacity
                  key={category.value}
                  style={[
                    styles.categoryButton,
                    {
                      borderColor: formData.category === category.value ? colors.primary : colors.border,
                      backgroundColor: formData.category === category.value ? colors.primary + '20' : 'transparent',
                    }
                  ]}
                  onPress={() => handleInputChange('category', category.value)}
                >
                  <Text style={{ fontSize: 18, marginRight: 6 }}>{category.icon}</Text>
                  <Text style={[
                    styles.categoryButtonText,
                    {
                      color: formData.category === category.value ? colors.primary : colors.text,
                    }
                  ]}>
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Difficulty Level</Text>
            <View style={styles.difficultyGrid}>
              {difficulties.map((difficulty) => (
                <TouchableOpacity
                  key={difficulty.value}
                  style={[
                    styles.difficultyButton,
                    {
                      borderColor: formData.difficulty === difficulty.value ? colors.primary : colors.border,
                      backgroundColor: formData.difficulty === difficulty.value ? colors.primary + '20' : 'transparent',
                    }
                  ]}
                  onPress={() => handleInputChange('difficulty', difficulty.value)}
                >
                  <Text style={[
                    styles.difficultyButtonText,
                    {
                      color: formData.difficulty === difficulty.value ? colors.primary : colors.text,
                    }
                  ]}>
                    {difficulty.label}
                  </Text>
                  <Text style={[styles.helpText, { fontSize: 12, marginTop: 2 }]}>
                    {difficulty.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Estimated Time */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Estimated Time to Master</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Days</Text>
              <TextInput
                style={[
                  styles.numberInput, 
                  formData.estimatedDays === 0 && estimatedDaysText !== '' && { borderColor: colors.error }
                ]}
                value={estimatedDaysText}
                onChangeText={handleEstimatedDaysChange}
                placeholder="30"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
              {formData.estimatedDays === 0 && estimatedDaysText !== '' && (
                <Text style={styles.errorText}>Please enter a valid number of days</Text>
              )}
              <Text style={styles.helpText}>
                This helps set realistic expectations. Most skills take 30-90 days to master.
              </Text>
            </View>
          </View>

          {/* Parent Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Parent Notes (Optional)</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Additional Notes</Text>
              <TextInput
                style={styles.textArea}
                value={formData.parentNotes}
                onChangeText={(value) => handleInputChange('parentNotes', value)}
                placeholder="Any specific challenges, strategies, or observations about this skill..."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={3}
              />
              <Text style={styles.helpText}>
                These notes help us personalize the experience further.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.bottomSaveContainer}>
        <TouchableOpacity
          style={[styles.bottomSaveButton, !isFormValid && styles.bottomSaveButtonDisabled]}
          onPress={handleSave}
          disabled={!isFormValid || loading}
        >
          {loading ? (
            <ActivityIndicator size={20} color={colors.background} />
          ) : (
            <>
              <Save size={24} color={colors.background} />
              <Text style={styles.bottomSaveButtonText}>Create Skill</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
} 