import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Modal, Alert, Image, Animated } from 'react-native';
import { Mic, MicOff, X, Send } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import AIResponseModal from './AIResponseModal';
import { generateAIAdvice } from '@/lib/aiAdviceService';
import { transcribeAudio } from '@/lib/speechToTextService';
import { personalLearningHub } from '@/lib/personalLearningHubService';
import { Audio } from 'expo-av';

interface AIQuickAdviceFABProps {
  onAdviceRequested?: (message: string) => void;
}

export default function AIQuickAdviceFAB({ onAdviceRequested }: AIQuickAdviceFABProps) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [isResponseModalVisible, setIsResponseModalVisible] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [sessionId, setSessionId] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [micPermission, requestMicPermission] = Audio.usePermissions();

  // Ripple animation
  const rippleScale = useRef(new Animated.Value(0)).current;
  const rippleOpacity = useRef(new Animated.Value(0)).current;

  const styles = StyleSheet.create({
    fabContainer: {
      position: 'absolute',
      bottom: 80,
      right: 20,
      zIndex: 1000,
    },
    fab: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: '#FFFFFF',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
      borderWidth: 1,
      borderColor: '#E5E7EB',
    },
    fabText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: 'bold',
      marginTop: 4,
    },
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
      minHeight: 300,
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
    recordingContainer: {
      alignItems: 'center',
      marginBottom: 20,
    },
    recordingButton: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: 'transparent',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    recordingText: {
      color: colors.textSecondary,
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 20,
    },
    textInputContainer: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
      minHeight: 100,
    },
    textInput: {
      color: colors.text,
      fontSize: 16,
      textAlignVertical: 'top',
    },
    sendButton: {
      backgroundColor: colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 25,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
    },
    sendButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
      marginLeft: 8,
    },
    placeholderText: {
      color: colors.textSecondary,
      fontSize: 16,
    },
    ripple: {
      position: 'absolute',
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: 'rgba(255, 165, 0, 0.3)', // Orange with transparency
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: -1, // Put behind the icon
    },
    iconContainer: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: '#FFFFFF',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#E5E7EB',
    },
  });

  const handleFabPress = async () => {
    // Trigger ripple animation
    rippleScale.setValue(0);
    rippleOpacity.setValue(1);
    
    Animated.parallel([
      Animated.timing(rippleScale, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(rippleOpacity, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to use AI Quick Advice.');
      return;
    }

    // Check usage limits before opening the modal
    try {
      const usageCheck = await personalLearningHub.checkUsageLimit(user.uid);
      if (!usageCheck.canUse) {
        Alert.alert(
          'Usage Limit Reached',
          `You have ${usageCheck.remaining} sessions remaining this month. Upgrade to premium for unlimited access.`,
          [{ text: 'OK' }]
        );
        return;
      }
    } catch (error) {
      console.error('Error checking usage limit:', error);
      // Continue anyway - don't block the user
    }
    
    setIsModalVisible(true);
  };

  const startRecording = async () => {
    let permission = micPermission;
    if (!permission || permission.status !== 'granted') {
      console.log('Requesting microphone permission...');
      permission = await requestMicPermission();
    }

    if (permission.status !== 'granted') {
      Alert.alert('Permission Required', 'Microphone access is needed to record audio.');
      return;
    }
    
    try {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      
      setRecording(recording);
      setIsRecording(true);
      setTranscribedText(''); // Clear previous text

    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Recording Error', 'Failed to start audio recording.');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    console.log('Stopping recording..');
    setIsRecording(false);
    
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      console.log('Recording stopped and stored at', uri);
  
      if (!uri) {
        Alert.alert('Recording Error', 'Could not save the recording.');
        return;
      }

      // Show loading state for transcription
      setTranscribedText('Transcribing...');
      
      // Transcribe the audio
      const transcription = await transcribeAudio(uri);
      
      if (transcription.error) {
        Alert.alert('Transcription Error', transcription.error);
        setTranscribedText('');
      } else {
        setTranscribedText(transcription.text);
        console.log('Transcription completed:', transcription.text);
      }
      
    } catch (error) {
      console.error('Error on stopping recording:', error);
      Alert.alert('Recording Error', 'Failed to stop recording.');
      setTranscribedText('');
    } finally {
      setRecording(null);
    }
  };

  const handleSendAdvice = async () => {
    if (transcribedText.trim()) {
      const question = transcribedText;
      setCurrentQuestion(question);
      setIsLoading(true);
      setIsResponseModalVisible(true);
      setIsModalVisible(false);
      setTranscribedText('');

      try {
        const response = await generateAIAdvice(question, user?.uid);
        setAiResponse(response.advice);
        setSessionId(response.sessionId || '');
        setCategory(response.category || '');
      } catch (error) {
        console.error('Error generating AI response:', error);
        
        // Check if it's a usage limit error
        if (error instanceof Error && error.message.includes('Usage limit reached')) {
          Alert.alert('Usage Limit Reached', error.message);
          setIsResponseModalVisible(false);
          return;
        }
        
        setAiResponse('Sorry, I encountered an error. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setTranscribedText('');
    setIsRecording(false);
    if (recording) {
      recording.stopAndUnloadAsync();
      setRecording(null);
    }
  };

  const handleCloseResponseModal = () => {
    setIsResponseModalVisible(false);
    setCurrentQuestion('');
    setAiResponse('');
    setSessionId('');
    setCategory('');
    setIsLoading(false);
  };

  const handleFeedback = (isHelpful: boolean) => {
    // TODO: Send feedback to analytics/backend
    console.log('Feedback:', isHelpful ? 'Helpful' : 'Not Helpful');
  };

  return (
    <>
      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={styles.fab}
          onPress={handleFabPress}
          activeOpacity={0.8}
          accessibilityLabel="Get Quick Advice"
          accessibilityRole="button"
          accessibilityHint="Tap to get quick advice"
        >
          <Animated.View
            style={[
              styles.ripple,
              {
                transform: [{ scale: rippleScale }],
                opacity: rippleOpacity,
              },
            ]}
          />
          <View style={styles.iconContainer}>
            <Image 
              source={require('@/assets/images/AIChatIcon.png')}
              style={{ width: 52, height: 52 }}
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>
      </View>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Quick Advice</Text>
              <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.recordingContainer}>
              <TouchableOpacity
                style={styles.recordingButton}
                onPress={isRecording ? stopRecording : startRecording}
                activeOpacity={0.8}
              >
                {isRecording ? (
                  <Image 
                    source={require('@/assets/images/AIChatIcon.png')}
                    style={{ 
                      width: 70, 
                      height: 70,
                      opacity: 0.5,
                      tintColor: '#666666'
                    }}
                    resizeMode="contain"
                  />
                ) : (
                  <Image 
                    source={require('@/assets/images/AIChatIcon.png')}
                    style={{ width: 70, height: 70 }}
                    resizeMode="contain"
                  />
                )}
              </TouchableOpacity>
              <Text style={styles.recordingText}>
                {isRecording 
                  ? 'Recording... Tap to stop' 
                  : 'Tap to record your question'
                }
              </Text>
            </View>

            <View style={styles.textInputContainer}>
              <Text style={styles.textInput}>
                {transcribedText || (
                  <Text style={styles.placeholderText}>
                    Your question will appear here after recording, or you can type it directly...
                  </Text>
                )}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendAdvice}
              disabled={!transcribedText.trim()}
              activeOpacity={0.8}
            >
              <Send size={20} color="#FFFFFF" />
              <Text style={styles.sendButtonText}>Get Advice</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

              <AIResponseModal
          visible={isResponseModalVisible}
          onClose={handleCloseResponseModal}
          question={currentQuestion}
          response={aiResponse}
          isLoading={isLoading}
          onFeedback={handleFeedback}
          sessionId={sessionId}
          category={category}
        />
    </>
  );
} 