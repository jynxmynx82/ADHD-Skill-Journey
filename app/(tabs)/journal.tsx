// app/(tabs)/journal.tsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert, Platform, KeyboardAvoidingView, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import { Mic, PenTool, Square, Lightbulb, MessageCircle } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { personalLearningHub } from '@/lib/personalLearningHubService';
import { HelpfulStrategy, AdviceSession } from '@/types/journal';
import { AppSafeArea, PageHeader, SectionHeader, Card, Container, TYPOGRAPHY, COLORS, SPACING } from '@/components/Layout';

// --- MOCK DATA & TYPES ---
type JournalCategory = 'Focus Level' | 'Food' | 'Mood' | 'Meds' | 'Sleep' | 'YAY';
interface JournalEntry { 
  id: string; 
  timestamp: string; 
  type: 'text' | 'audio'; 
  content: string; 
  tags?: JournalCategory[];
  audioUri?: string;
  duration?: number;
}
const JOURNAL_CATEGORIES: readonly JournalCategory[] = ['Focus Level', 'Food', 'Mood', 'Meds', 'Sleep', 'YAY'];
// ---

// --- Memoized Child Component ---
const MemoizedTextInput = React.memo(({ value, onChangeText }: { value: string; onChangeText: (text: string) => void; }) => {
  return (
    <TextInput
      style={styles.inlineTextInput}
      placeholder="Write your thoughts, observations, or notes..."
      value={value}
      onChangeText={onChangeText}
      multiline
      autoFocus
      textAlignVertical="top"
    />
  );
});

// --- JOURNAL SCREEN COMPONENT ---
export default function JournalScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [helpfulStrategies, setHelpfulStrategies] = useState<HelpfulStrategy[]>([]);
  const [adviceSessions, setAdviceSessions] = useState<AdviceSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'journal' | 'strategies' | 'advice'>('journal');
  
  const [showEntryInput, setShowEntryInput] = useState(false);
  const [currentContent, setCurrentContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<JournalCategory[]>([]);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [micPermission, requestMicPermission] = Audio.usePermissions();
  
  // --- This useEffect now handles the recording timer ---
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      // Start a timer that increments the duration every second
      interval = setInterval(() => {
        setRecordingDuration(prevDuration => prevDuration + 1);
      }, 1000);
    }
    // The cleanup function will run when the component unmounts or when isRecording changes
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRecording]); // This effect runs only when the isRecording state changes
  // ---

  useEffect(() => {
    // Load data when component mounts
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user?.uid) return;
    
    setIsLoading(true);
    try {
      // Load helpful strategies
      const strategies = await personalLearningHub.getHelpfulStrategies(user.uid);
      setHelpfulStrategies(strategies);
      
      // Load advice sessions
      const sessions = await personalLearningHub.getAdviceSessions(user.uid);
      setAdviceSessions(sessions);
      
      // TODO: Load journal entries from Personal Learning Hub
      // For now, we'll keep the mock data since Journal uses old structure
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleContentChange = useCallback((text: string) => {
    setCurrentContent(text);
  }, []);

  const handleTagToggle = useCallback((tag: JournalCategory) => {
    setSelectedTags(prevTags => 
      prevTags.includes(tag) ? prevTags.filter(t => t !== tag) : [...prevTags, tag]
    );
  }, []);

  const resetInputState = () => {
    setCurrentContent('');
    setSelectedTags([]);
    setShowEntryInput(false);
    setIsRecording(false);
    setRecording(null);
    setRecordingDuration(0);
  };

  const handleSaveTextEntry = () => {
    if (!currentContent.trim()) {
      Alert.alert("Empty Entry", "Please write something before saving.");
      return;
    }
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      type: 'text',
      content: currentContent.trim(),
      tags: selectedTags.length > 0 ? selectedTags : undefined,
    };
    setEntries(prevEntries => [newEntry, ...prevEntries]);
    resetInputState();
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
      setShowEntryInput(true);
      setRecordingDuration(0); // Reset duration
      setIsRecording(true); // This will trigger the useEffect to start the timer

      // --- The broken setOnPlaybackStatusUpdate call has been REMOVED from here ---

    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Recording Error', 'Failed to start audio recording.');
    }
  };

  const stopRecordingAndSave = async () => {
    if (!recording) return;

    console.log('Stopping recording..');
    setIsRecording(false); // This will trigger the useEffect to stop the timer
    
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      console.log('Recording stopped and stored at', uri);
  
      if (!uri) return;
  
      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        type: 'audio',
        content: `Audio Entry - ${new Date().toLocaleDateString()}`,
        audioUri: uri,
        duration: recordingDuration,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
      };
      setEntries(prevEntries => [newEntry, ...prevEntries]);
    } catch (error) {
      console.error('Error on stopping recording:', error);
    } finally {
      resetInputState();
    }
  };

  const cancelEntry = async () => {
    if (isRecording && recording) {
      console.log('Cancelling recording...');
      setIsRecording(false); // Stop the timer
      await recording.stopAndUnloadAsync(); // Stop and discard
    }
    resetInputState();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderEntryItem = ({ item }: { item: JournalEntry }) => (
    <View style={styles.entryCard}>
      <View style={styles.entryHeader}>
        <Text style={styles.entryDate}>
          {new Date(item.timestamp).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true 
          })}
        </Text>
        {item.type === 'audio' && <Mic size={16} color="#666" />}
      </View>
      <Text style={styles.entryContent} numberOfLines={3}>
        {item.content}
      </Text>
      {item.tags && item.tags.length > 0 && (
        <View style={styles.entryTags}>
          {item.tags.map(tag => (
            <View key={tag} style={styles.entryTag}>
              <Text style={styles.entryTagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderStrategyItem = ({ item }: { item: HelpfulStrategy }) => (
    <View style={styles.entryCard}>
      <Text style={styles.entryDate}>Challenge: {item.challenge}</Text>
      <Text style={styles.entryContent}>{item.strategy}</Text>
      <View style={styles.entryTags}>
        <View style={styles.entryTag}>
          <Text style={styles.entryTagText}>{item.category}</Text>
        </View>
        <View style={[styles.entryTag, item.worked ? { backgroundColor: '#d4edda' } : { backgroundColor: '#f8d7da' }]}>
          <Text style={[styles.entryTagText, item.worked ? { color: '#155724' } : { color: '#721c24' }]}>
            {item.worked ? 'Worked' : 'Not Worked'}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderAdviceItem = ({ item }: { item: AdviceSession }) => (
    <View style={styles.entryCard}>
      <Text style={styles.entryDate}>Question: {item.question}</Text>
      <Text style={styles.entryContent}>{item.advice}</Text>
      <View style={styles.entryTags}>
        <View style={styles.entryTag}>
          <Text style={styles.entryTagText}>{item.category}</Text>
        </View>
        {item.feedback && (
          <View style={[styles.entryTag, item.feedback === 'helpful' ? { backgroundColor: '#d4edda' } : { backgroundColor: '#f8d7da' }]}>
            <Text style={[styles.entryTagText, item.feedback === 'helpful' ? { color: '#155724' } : { color: '#721c24' }]}>
              {item.feedback === 'helpful' ? 'Helpful' : 'Not Helpful'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  if (isLoading) {
    return <View style={styles.centered}><ActivityIndicator /></View>;
  }
  
  return (
    <AppSafeArea>
      <PageHeader title="Learning Hub" />
      
      <Container>
        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'journal' && styles.tabButtonActive]}
            onPress={() => setActiveTab('journal')}
          >
            <Text style={[styles.tabText, activeTab === 'journal' && styles.tabTextActive]}>Notes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'strategies' && styles.tabButtonActive]}
            onPress={() => setActiveTab('strategies')}
          >
            <Text style={[styles.tabText, activeTab === 'strategies' && styles.tabTextActive]}>Strategies</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'advice' && styles.tabButtonActive]}
            onPress={() => setActiveTab('advice')}
          >
            <Text style={[styles.tabText, activeTab === 'advice' && styles.tabTextActive]}>Advice</Text>
          </TouchableOpacity>
        </View>

        {/* Content Area */}
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          {activeTab === 'journal' && (
            <>
              {/* Quick Capture Section */}
              <SectionHeader title="📝 Quick Capture" />
              <Card>
                <View style={styles.quickCaptureCard}>
                  <Text style={styles.placeholderText}>How is your child doing today?</Text>
                  <View style={styles.quickCaptureButtons}>
                    <TouchableOpacity 
                      style={[styles.quickCaptureButton, styles.recordButton]} 
                      onPress={startRecording}
                    >
                      <Mic size={16} color="#ffffff" />
                      <Text style={styles.quickCaptureButtonText}>Record Audio</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.quickCaptureButton, styles.writeButton]} 
                      onPress={() => { setShowEntryInput(true); setIsRecording(false); }}
                    >
                      <PenTool size={16} color="#ffffff" />
                      <Text style={styles.quickCaptureButtonText}>Write Note</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>

              {/* Recent Activity Section */}
              <SectionHeader title="📊 Recent Activity" />
              {entries.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No notes yet. Start by writing or recording your thoughts.</Text>
                </View>
              ) : (
                <FlatList 
                  data={entries} 
                  renderItem={renderEntryItem} 
                  keyExtractor={item => item.id} 
                  contentContainerStyle={styles.listContent}
                  showsVerticalScrollIndicator={false}
                />
              )}
            </>
          )}

          {activeTab === 'strategies' && (
            <View style={{ flex: 1 }}>
              <SectionHeader title="💡 Helpful Strategies" />
              {helpfulStrategies.length === 0 ? (
                <View style={styles.emptyState}>
                  <Lightbulb size={48} color="#ccc" style={{ marginBottom: 16 }} />
                  <Text style={styles.emptyText}>No helpful strategies saved yet.</Text>
                  <Text style={[styles.emptyText, { fontSize: 14, marginTop: 8 }]}>
                    Save strategies from AI advice to see them here.
                  </Text>
                </View>
              ) : (
                <FlatList 
                  data={helpfulStrategies} 
                  renderItem={renderStrategyItem} 
                  keyExtractor={item => item.id} 
                  contentContainerStyle={styles.listContent} 
                />
              )}
            </View>
          )}

          {activeTab === 'advice' && (
            <View style={{ flex: 1 }}>
              <SectionHeader title="💬 AI Quick Advice" />
              {adviceSessions.length === 0 ? (
                <View style={styles.emptyState}>
                  <MessageCircle size={48} color="#ccc" style={{ marginBottom: 16 }} />
                  <Text style={styles.emptyText}>No advice sessions yet.</Text>
                  <Text style={[styles.emptyText, { fontSize: 14, marginTop: 8 }]}>
                    Use the AI Quick Advice button to get personalized help.
                  </Text>
                </View>
              ) : (
                <FlatList 
                  data={adviceSessions} 
                  renderItem={renderAdviceItem} 
                  keyExtractor={item => item.id} 
                  contentContainerStyle={styles.listContent} 
                />
              )}
            </View>
          )}

          {showEntryInput && (
            <KeyboardAvoidingView style={styles.entryInputView} behavior={Platform.OS === "ios" ? "padding" : "height"}>
              {isRecording ? (
                <View style={styles.recordingContainer}>
                  <Text style={styles.recordingText}>Recording...</Text>
                  <Text style={styles.recordingTimer}>{formatDuration(recordingDuration)}</Text>
                  <TouchableOpacity onPress={stopRecordingAndSave} style={styles.stopButton}>
                    <Square size={24} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              ) : (
                <MemoizedTextInput value={currentContent} onChangeText={handleContentChange} />
              )}
              
              <View>
                <Text style={styles.tagTitle}>Categories</Text>
                <View style={styles.tagContainer}>
                  {JOURNAL_CATEGORIES.map(tag => (
                    <TouchableOpacity key={tag} onPress={() => handleTagToggle(tag)} style={[styles.tagButton, selectedTags.includes(tag) && styles.tagSelected]}>
                      <Text style={[styles.tagText, selectedTags.includes(tag) && styles.tagTextSelected]}>{tag}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity style={[styles.buttonBase, styles.cancelButton]} onPress={cancelEntry}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.buttonBase, styles.saveButton]} onPress={isRecording ? stopRecordingAndSave : handleSaveTextEntry}>
                  <Text style={styles.buttonText}>{isRecording ? 'Stop & Save' : 'Save Entry'}</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          )}
        </ScrollView>
      </Container>
    </AppSafeArea>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8f9fa' },
  container: { flex: 1 },
  header: { 
    padding: 16,
    paddingTop: 8,
    borderBottomWidth: 1, 
    borderBottomColor: '#E0E0E0', 
    backgroundColor: '#ffffff' 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold',
    color: '#333'
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { 
    paddingVertical: SPACING.sm 
  },
  entryCard: { 
    ...TYPOGRAPHY.styles.body,
    marginBottom: SPACING.md 
  },
  entryHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: SPACING.sm 
  },
  entryDate: { 
    ...TYPOGRAPHY.styles.small
  },
  entryContent: { 
    ...TYPOGRAPHY.styles.body,
    marginBottom: SPACING.sm 
  },
  entryTags: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    marginTop: SPACING.sm 
  },
  entryTag: { 
    paddingVertical: 4, 
    paddingHorizontal: 10, 
    borderRadius: 12, 
    backgroundColor: COLORS.background.tertiary, 
    marginRight: SPACING.sm, 
    marginBottom: 4 
  },
  entryTagText: { 
    ...TYPOGRAPHY.styles.small
  },
  inlineTextInput: { 
    flex: 1, 
    borderWidth: 1, 
    borderColor: COLORS.border.medium, 
    borderRadius: 8, 
    padding: SPACING.md, 
    ...TYPOGRAPHY.styles.body,
    textAlignVertical: 'top' 
  },
  tabContainer: { 
    flexDirection: 'row', 
    backgroundColor: COLORS.background.primary, 
    borderBottomWidth: 1, 
    borderBottomColor: COLORS.border.light 
  },
  tabButton: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: SPACING.md, 
    paddingHorizontal: SPACING.sm, 
    gap: 4 
  },
  tabButtonActive: { 
    borderBottomWidth: 2, 
    borderBottomColor: COLORS.primary 
  },
  tabText: { 
    ...TYPOGRAPHY.styles.tab
  },
  tabTextActive: { 
    ...TYPOGRAPHY.styles.tabActive
  },
  entryInputView: { 
    flex: 1, 
    padding: SPACING.md, 
    backgroundColor: COLORS.background.primary 
  },
  durationText: { 
    ...TYPOGRAPHY.styles.small,
    fontStyle: 'italic', 
    marginTop: 4
  },
  tagsContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    marginTop: SPACING.md 
  },
  tag: { 
    backgroundColor: COLORS.background.tertiary, 
    paddingHorizontal: SPACING.sm, 
    paddingVertical: 4, 
    borderRadius: 12, 
    marginRight: SPACING.sm, 
    marginBottom: 4, 
    ...TYPOGRAPHY.styles.small
  },
  tagTitle: { 
    ...TYPOGRAPHY.styles.sectionHeader,
    marginBottom: SPACING.md 
  },
  tagContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    marginBottom: SPACING.md 
  },
  tagButton: { 
    backgroundColor: COLORS.background.secondary, 
    paddingHorizontal: SPACING.md, 
    paddingVertical: 6, 
    borderRadius: 16, 
    marginRight: SPACING.sm, 
    marginBottom: SPACING.sm 
  },
  tagSelected: { 
    backgroundColor: COLORS.primary 
  },
  tagText: { 
    ...TYPOGRAPHY.styles.body
  },
  tagTextSelected: { 
    color: COLORS.text.inverse 
  },
  buttonContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: SPACING.md 
  },
  buttonBase: { 
    flex: 1, 
    paddingVertical: SPACING.md, 
    paddingHorizontal: SPACING.md, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginHorizontal: 4 
  },
  cancelButton: { 
    backgroundColor: COLORS.interactive.disabled 
  },
  saveButton: { 
    backgroundColor: COLORS.primary 
  },
  buttonText: { 
    ...TYPOGRAPHY.styles.button
  },
  recordingContainer: { 
    alignItems: 'center', 
    padding: SPACING.md 
  },
  recordingText: { 
    ...TYPOGRAPHY.styles.sectionHeader,
    color: COLORS.status.error, 
    marginBottom: SPACING.sm 
  },
  recordingTimer: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: COLORS.status.error, 
    marginBottom: SPACING.md 
  },
  stopButton: { 
    backgroundColor: COLORS.status.error, 
    padding: SPACING.md, 
    borderRadius: 50 
  },
  emptyState: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: SPACING.xl 
  },
  emptyText: { 
    ...TYPOGRAPHY.styles.bodySecondary,
    textAlign: 'center', 
    lineHeight: 24 
  },
  quickCaptureSection: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3.0,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  quickCaptureCard: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: 8,
    padding: SPACING.md,
    alignItems: 'center',
  },
  placeholderText: {
    ...TYPOGRAPHY.styles.bodySecondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  quickCaptureButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  quickCaptureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  recordButton: {
    backgroundColor: COLORS.primary,
  },
  writeButton: {
    backgroundColor: COLORS.interactive.disabled,
  },
  quickCaptureButtonText: {
    ...TYPOGRAPHY.styles.button,
    marginLeft: SPACING.sm,
  },
  recentActivitySection: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3.0,
    elevation: 2,
  },
});