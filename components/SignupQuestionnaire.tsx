import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useFamily } from '@/context/FamilyContext';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react-native';

const { width: screenWidth } = Dimensions.get('window');

interface Question {
  id: string;
  title: string;
  subtitle: string;
  options: QuestionOption[];
  field: string;
}

interface QuestionOption {
  id: string;
  text: string;
  emoji: string;
  value: string;
}

const QUESTIONS: Question[] = [
  {
    id: 'challenge',
    title: 'What part of the day can feel overwhelming for your family?',
    subtitle: 'Choose the option that feels most true for you right now:',
    field: 'primaryChallenge',
    options: [
      { id: 'mornings', text: 'Mornings & Getting Ready', emoji: '☀️', value: 'mornings' },
      { id: 'homework', text: 'After School & Homework Time', emoji: '🎒', value: 'homework' },
      { id: 'emotions', text: 'Big Emotions & Meltdowns', emoji: '😤', value: 'emotions' },
      { id: 'bedtime', text: 'Bedtime & Winding Down', emoji: '🌙', value: 'bedtime' },
      { id: 'changes', text: 'It changes every day', emoji: '🤷', value: 'changes' },
    ],
  },
  {
    id: 'strength',
    title: "What's a core strength of your family?",
    subtitle: 'Every family is amazing in its own way - what makes yours special?',
    field: 'familyStrength',
    options: [
      { id: 'creative', text: 'We are Creative & Imaginative', emoji: '🎨', value: 'creative' },
      { id: 'energy', text: 'We have lots of Energy & Enthusiasm', emoji: '⚡️', value: 'energy' },
      { id: 'kind', text: 'We are Kind & Caring', emoji: '❤️', value: 'kind' },
      { id: 'curious', text: 'We are Curious & Quick to Learn', emoji: '🧠', value: 'curious' },
      { id: 'other', text: 'Something else entirely', emoji: '🌟', value: 'other' },
    ],
  },
  {
    id: 'support',
    title: 'Who might be part of your family\'s support team?',
    subtitle: 'There\'s no right answer - every family is different:',
    field: 'supportNetwork',
    options: [
      { id: 'therapist', text: 'Doctor or therapist', emoji: '👨‍⚕️', value: 'therapist' },
      { id: 'teacher', text: 'Teacher or school support', emoji: '👩‍🏫', value: 'teacher' },
      { id: 'family', text: 'Extended family', emoji: '👨‍👩‍👧‍👦', value: 'family' },
      { id: 'groups', text: 'Support groups or other parents', emoji: '🤝', value: 'groups' },
      { id: 'figuring', text: 'We\'re figuring this out as we go', emoji: '❓', value: 'figuring' },
    ],
  },
  {
    id: 'strategies',
    title: "What's working well right now?",
    subtitle: 'We want to build on what\'s already working:',
    field: 'currentStrategies',
    options: [
      { id: 'routines', text: 'We have some good routines', emoji: '📅', value: 'routines' },
      { id: 'rewards', text: 'We use rewards and positive reinforcement', emoji: '🎯', value: 'rewards' },
      { id: 'calming', text: 'We practice calming techniques', emoji: '🧘', value: 'calming' },
      { id: 'figuring', text: 'We\'re still figuring it out', emoji: '🤷', value: 'figuring' },
      { id: 'trying', text: 'We\'re trying lots of different things', emoji: '💪', value: 'trying' },
    ],
  },
];

interface SignupQuestionnaireProps {
  onComplete: (answers: Record<string, string>) => void;
  onSkip: () => void;
}

export default function SignupQuestionnaire({ onComplete, onSkip }: SignupQuestionnaireProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === QUESTIONS.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
    
    // Animate the selection
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.7,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleNext = () => {
    if (!selectedOption) return;

    const newAnswers = {
      ...answers,
      [currentQuestion.field]: selectedOption,
    };
    setAnswers(newAnswers);

    if (isLastQuestion) {
      // Complete the questionnaire
      onComplete(newAnswers);
    } else {
      // Move to next question
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -screenWidth,
          duration: 0,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedOption(null);
        slideAnim.setValue(screenWidth);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }
  };

  const handleBack = () => {
    if (isFirstQuestion) {
      onSkip();
      return;
    }

    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: screenWidth,
        duration: 0,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedOption(answers[QUESTIONS[currentQuestionIndex - 1].field] || null);
      slideAnim.setValue(-screenWidth);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const getProgressColor = (index: number) => {
    if (index < currentQuestionIndex) return '#4CAF50'; // Completed
    if (index === currentQuestionIndex) return '#2196F3'; // Current
    return '#E0E0E0'; // Not started
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={24} color="#666" />
        </TouchableOpacity>
        
        <View style={styles.progressContainer}>
          {QUESTIONS.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                { backgroundColor: getProgressColor(index) }
              ]}
            />
          ))}
        </View>
        
        <TouchableOpacity onPress={onSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Question Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.questionTitle}>{currentQuestion.title}</Text>
          <Text style={styles.questionSubtitle}>{currentQuestion.subtitle}</Text>

          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionCard,
                  selectedOption === option.id && styles.optionSelected,
                ]}
                onPress={() => handleOptionSelect(option.id)}
                activeOpacity={0.7}
              >
                <View style={styles.optionContent}>
                  <Text style={styles.optionEmoji}>{option.emoji}</Text>
                  <Text style={[
                    styles.optionText,
                    selectedOption === option.id && styles.optionTextSelected,
                  ]}>
                    {option.text}
                  </Text>
                  {selectedOption === option.id && (
                    <View style={styles.checkmark}>
                      <Check size={20} color="#fff" />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </Animated.View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            !selectedOption && styles.nextButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={!selectedOption}
        >
          <Text style={styles.nextButtonText}>
            {isLastQuestion ? 'Complete' : 'Next'}
          </Text>
          {!isLastQuestion && <ChevronRight size={20} color="#fff" />}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  skipButton: {
    padding: 8,
  },
  skipText: {
    color: '#666',
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  questionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
    lineHeight: 32,
  },
  questionSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    lineHeight: 22,
  },
  optionsContainer: {
    gap: 16,
  },
  optionCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196F3',
    shadowColor: '#2196F3',
    shadowOpacity: 0.2,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionEmoji: {
    fontSize: 24,
    marginRight: 16,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
    lineHeight: 22,
  },
  optionTextSelected: {
    color: '#2196F3',
    fontWeight: '600',
  },
  checkmark: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  nextButton: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextButtonDisabled: {
    backgroundColor: '#e0e0e0',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 