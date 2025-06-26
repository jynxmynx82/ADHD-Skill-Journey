// app/(tabs)/journal.tsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, StyleSheet, Text, TextInput, TouchableOpacity,
  Alert, FlatList, KeyboardAvoidingView, Platform, SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { tw } from 'react-native-tailwindcss';
import { PenTool, Mic, Square } from 'lucide-react-native';
import { Audio } from 'expo-av';

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
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
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
    // This effect runs once to load initial data and check permissions
    setIsLoading(false); // For now, we just set loading to false
    micPermission?.getAsync(); // Check initial permission status
  }, []);
  
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
      <Text style={styles.entryTimestamp}>{new Date(item.timestamp).toLocaleString()}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8}}>
        {item.type === 'audio' && <Mic size={16} color="#007bff" style={{marginRight: 8}} />}
        <Text style={styles.entryContent}>{item.content}</Text>
      </View>
      {item.duration !== undefined && <Text style={styles.durationText}>Duration: {formatDuration(item.duration)}</Text>}
      {item.tags && item.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {item.tags.map(tag => (
            <Text key={tag} style={styles.tag}>#{tag}</Text>
          ))}
        </View>
      )}
    </View>
  );

  if (isLoading) {
    return <View style={styles.centered}><ActivityIndicator /></View>;
  }
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: 'Journal', headerShown: true }} />
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={styles.header}>
          <Text style={styles.title}>Journal</Text>
        </View>

        <View style={tw.mX4}>
          <Text style={[tw.textLg, tw.fontBold, tw.textGray700]}>Hello</Text>
        </View>

        {showEntryInput ? (
          <View style={styles.entryInputView}>
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
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            <View style={styles.newEntryContainer}>
              <TouchableOpacity style={[styles.buttonBase, styles.newEntryButton]} onPress={() => { setShowEntryInput(true); setIsRecording(false); }}>
                <PenTool size={20} color="#ffffff" style={{ marginRight: 8 }} />
                <Text style={styles.buttonText}>New Text Entry</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.buttonBase, styles.newEntryButton, {backgroundColor: '#6c757d'}]} onPress={startRecording}>
                <Mic size={20} color={micPermission?.granted ? '#4CAF50' : '#F44336'} style={{ marginRight: 8 }} />
                <Text style={styles.buttonText}>Record Audio</Text>
              </TouchableOpacity>
            </View>
            
            {entries.length === 0 ? (
              <View style={styles.emptyState}><Text style={styles.emptyText}>No journal entries yet.</Text></View>
            ) : (
              <FlatList data={entries} renderItem={renderEntryItem} keyExtractor={item => item.id} contentContainerStyle={styles.listContent} />
            )}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8f9fa' },
  container: { flex: 1 },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#E0E0E0', backgroundColor: '#ffffff' },
  title: { fontSize: 28, fontWeight: 'bold' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 16 },
  entryCard: { backgroundColor: '#ffffff', borderRadius: 8, padding: 16, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3.0, elevation: 2 },
  entryTimestamp: { fontSize: 12, color: '#666', marginBottom: 8 },
  entryContent: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  durationText: { fontSize: 12, color: '#666', fontStyle: 'italic', marginTop: 4},
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
  tag: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12, backgroundColor: '#e0e0e0', color: '#333', fontSize: 12, marginRight: 8, marginBottom: 4, overflow: 'hidden' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#888', textAlign: 'center' },
  newEntryContainer: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#E0E0E0', backgroundColor: '#ffffff', flexDirection: 'row', justifyContent: 'space-around', gap: 12 },
  entryInputView: { flex: 1, padding: 16, backgroundColor: '#ffffff' },
  inlineTextInput: { flex: 1, borderWidth: 1, borderColor: '#ced4da', borderRadius: 8, padding: 12, fontSize: 16, textAlignVertical: 'top' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16, gap: 12 },
  buttonBase: { borderRadius: 8, paddingVertical: 12, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  newEntryButton: { backgroundColor: '#007bff', flex: 1 },
  saveButton: { backgroundColor: '#28a745' },
  cancelButton: { backgroundColor: '#6c757d' },
  tagTitle: { fontSize: 16, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  tagContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  tagButton: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1, borderColor: '#007bff', marginRight: 8, marginBottom: 8 },
  tagSelected: { backgroundColor: '#007bff' },
  tagText: { color: '#007bff' },
  tagTextSelected: { color: '#ffffff' },
  recordingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  recordingText: { fontSize: 18, marginBottom: 12 },
  recordingTimer: { fontSize: 48, fontFamily: 'monospace', fontWeight: 'bold', marginBottom: 24 },
  stopButton: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#dc3545', justifyContent: 'center', alignItems: 'center' },
});