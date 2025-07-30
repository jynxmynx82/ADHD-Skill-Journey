import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { X, ThumbsUp, ThumbsDown, MessageCircle, Sparkles, Save } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { personalLearningHub } from '@/lib/personalLearningHubService';
import { useAuth } from '@/context/AuthContext';

interface AIResponseModalProps {
  visible: boolean;
  onClose: () => void;
  question: string;
  response?: string;
  isLoading?: boolean;
  onFeedback?: (isHelpful: boolean) => void;
  sessionId?: string; // ID of the advice session for feedback
  category?: string; // Category of the advice
}

export default function AIResponseModal({ 
  visible, 
  onClose, 
  question, 
  response, 
  isLoading = false,
  onFeedback,
  sessionId,
  category
}: AIResponseModalProps) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [savingStrategy, setSavingStrategy] = useState(false);

  const styles = StyleSheet.create({
    modal: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
      paddingBottom: 40,
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
    },
    closeButton: {
      padding: 8,
    },
    questionContainer: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
    },
    questionLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 8,
    },
    questionText: {
      fontSize: 16,
      color: colors.text,
      lineHeight: 22,
    },
    responseContainer: {
      backgroundColor: colors.primary + '10',
      borderWidth: 1,
      borderColor: colors.primary + '30',
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
    },
    responseHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    responseIcon: {
      marginRight: 8,
    },
    responseLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
    },
    responseText: {
      fontSize: 16,
      color: colors.text,
      lineHeight: 24,
    },
    loadingContainer: {
      alignItems: 'center',
      padding: 40,
    },
    loadingText: {
      fontSize: 16,
      color: colors.textSecondary,
      marginTop: 16,
      textAlign: 'center',
    },
    feedbackContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 20,
      paddingTop: 20,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    feedbackButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 16,
      marginHorizontal: 8,
      borderRadius: 20,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    feedbackButtonText: {
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 4,
    },
    helpfulButton: {
      backgroundColor: colors.success + '20',
      borderColor: colors.success,
    },
    helpfulButtonText: {
      color: colors.success,
    },
    notHelpfulButton: {
      backgroundColor: colors.error + '20',
      borderColor: colors.error,
    },
    notHelpfulButtonText: {
      color: colors.error,
    },
    saveButton: {
      backgroundColor: colors.primary + '20',
      borderColor: colors.primary,
      marginTop: 12,
    },
    saveButtonText: {
      color: colors.primary,
    },
    feedbackMessage: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 12,
      fontStyle: 'italic',
    },
  });

  const handleFeedback = async (isHelpful: boolean) => {
    setFeedbackGiven(true);
    
    // Call the original feedback handler
    onFeedback?.(isHelpful);
    
    // Update the advice session with feedback if sessionId is provided
    if (sessionId && user?.uid) {
      try {
        await personalLearningHub.updateSessionFeedback(
          sessionId,
          isHelpful ? 'helpful' : 'not_helpful'
        );
        console.log('✅ Feedback saved to advice session');
      } catch (error) {
        console.error('Error saving feedback:', error);
      }
    }
  };

  const handleSaveStrategy = async () => {
    if (!user?.uid || !sessionId || !response) {
      Alert.alert('Error', 'Unable to save strategy. Please try again.');
      return;
    }

    setSavingStrategy(true);
    try {
      await personalLearningHub.saveStrategyFromSession(
        sessionId,
        user.uid,
        'Saved from AI advice'
      );
      Alert.alert('Success', 'Strategy saved to your helpful strategies!');
    } catch (error) {
      console.error('Error saving strategy:', error);
      Alert.alert('Error', 'Failed to save strategy. Please try again.');
    } finally {
      setSavingStrategy(false);
    }
  };

  const handleClose = () => {
    setFeedbackGiven(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modal}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>AI Quick Advice</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.questionContainer}>
              <Text style={styles.questionLabel}>Your Question:</Text>
              <Text style={styles.questionText}>{question}</Text>
            </View>

            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>
                  Getting personalized advice for your situation...
                </Text>
              </View>
            ) : response ? (
              <View style={styles.responseContainer}>
                <View style={styles.responseHeader}>
                  <Sparkles size={20} color={colors.primary} style={styles.responseIcon} />
                  <Text style={styles.responseLabel}>AI Advice</Text>
                </View>
                <Text style={styles.responseText}>{response}</Text>
              </View>
            ) : null}

            {response && !feedbackGiven && (
              <View style={styles.feedbackContainer}>
                <TouchableOpacity
                  style={[styles.feedbackButton, styles.helpfulButton]}
                  onPress={() => handleFeedback(true)}
                  activeOpacity={0.8}
                >
                  <ThumbsUp size={16} color={colors.success} />
                  <Text style={[styles.feedbackButtonText, styles.helpfulButtonText]}>
                    Helpful
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.feedbackButton, styles.notHelpfulButton]}
                  onPress={() => handleFeedback(false)}
                  activeOpacity={0.8}
                >
                  <ThumbsDown size={16} color={colors.error} />
                  <Text style={[styles.feedbackButtonText, styles.notHelpfulButtonText]}>
                    Not Helpful
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {response && sessionId && (
              <TouchableOpacity
                style={[styles.feedbackButton, styles.saveButton]}
                onPress={handleSaveStrategy}
                disabled={savingStrategy}
                activeOpacity={0.8}
              >
                {savingStrategy ? (
                  <ActivityIndicator size={16} color={colors.primary} />
                ) : (
                  <Save size={16} color={colors.primary} />
                )}
                <Text style={[styles.feedbackButtonText, styles.saveButtonText]}>
                  {savingStrategy ? 'Saving...' : 'Save as Strategy'}
                </Text>
              </TouchableOpacity>
            )}

            {feedbackGiven && (
              <Text style={styles.feedbackMessage}>
                Thank you for your feedback! This helps us improve our advice.
              </Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
} 