import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import type { JournalEntry } from '@/types/journal';

// --- Storage Keys ---
const STORAGE_KEYS = {
  JOURNAL_ENTRIES: 'journal_entries',
  AUDIO_FILES: 'journal_audio_files',
  SETTINGS: 'journal_settings',
};

// --- Storage Functions (Easy to upgrade to SecureStore) ---
export const loadJournalEntries = async (): Promise<JournalEntry[]> => {
  try {
    const entriesJson = await AsyncStorage.getItem(STORAGE_KEYS.JOURNAL_ENTRIES);
    return entriesJson ? JSON.parse(entriesJson) : [];
  } catch (error) {
    console.error('Error loading journal entries:', error);
    return [];
  }
};

export const saveJournalEntries = async (entries: JournalEntry[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.JOURNAL_ENTRIES, JSON.stringify(entries));
  } catch (error) {
    console.error('Error saving journal entries:', error);
  }
};

export const deleteJournalEntry = async (entryId: string): Promise<void> => {
  try {
    const entries = await loadJournalEntries();
    const entryToDelete = entries.find(e => e.id === entryId);
    
    // Delete audio file if it exists
    if (entryToDelete?.audioFile) {
      try {
        await FileSystem.deleteAsync(entryToDelete.audioFile);
      } catch (error) {
        console.error('Failed to delete audio file:', error);
      }
    }
    
    // Remove entry from storage
    const updatedEntries = entries.filter(e => e.id !== entryId);
    await saveJournalEntries(updatedEntries);
  } catch (error) {
    console.error('Error deleting journal entry:', error);
  }
};

// --- Audio File Management ---
export const getAudioDirectory = (): string => {
  return `${FileSystem.documentDirectory}journal_audio/`;
};

export const ensureAudioDirectory = async (): Promise<void> => {
  const audioDir = getAudioDirectory();
  const dirInfo = await FileSystem.getInfoAsync(audioDir);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(audioDir, { intermediates: true });
  }
};

export const saveAudioFile = async (originalUri: string, entryId: string): Promise<string> => {
  await ensureAudioDirectory();
  
  const audioDir = getAudioDirectory();
  const filename = `journal_audio_${entryId}.m4a`;
  const newUri = audioDir + filename;
  
  // Move file to our directory
  await FileSystem.moveAsync({
    from: originalUri,
    to: newUri
  });
  
  return newUri;
};

// --- Export Functionality (for premium features) ---
export const exportJournalData = async (startDate: Date, endDate: Date): Promise<string> => {
  try {
    const entries = await loadJournalEntries();
    const filteredEntries = entries.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= startDate && entryDate <= endDate;
    });
    
    // Create CSV content
    const csvHeaders = ['Date', 'Time', 'Type', 'Content', 'Duration', 'Tags', 'Mood'];
    const csvRows = filteredEntries.map(entry => [
      new Date(entry.timestamp).toLocaleDateString(),
      new Date(entry.timestamp).toLocaleTimeString(),
      entry.type,
      `"${entry.content.replace(/"/g, '""')}"`, // Escape quotes in content
      entry.duration ? `${Math.floor(entry.duration / 60)}:${(entry.duration % 60).toString().padStart(2, '0')}` : '',
      entry.tags?.join(', ') || '',
      entry.mood || ''
    ]);
    
    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.join(','))
      .join('\n');
    
    return csvContent;
  } catch (error) {
    console.error('Error exporting journal data:', error);
    throw new Error('Failed to export journal data');
  }
};

// --- Cleanup Functions ---
export const cleanupOldAudioFiles = async (retentionDays: number = 30): Promise<void> => {
  try {
    const entries = await loadJournalEntries();
    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    
    const oldEntries = entries.filter(entry => 
      new Date(entry.timestamp) < cutoffDate && entry.audioFile
    );
    
    // Delete old audio files
    for (const entry of oldEntries) {
      if (entry.audioFile) {
        try {
          await FileSystem.deleteAsync(entry.audioFile);
        } catch (error) {
          console.error('Failed to delete old audio file:', error);
        }
      }
    }
    
    // Keep metadata for export purposes
    console.log(`Cleaned up ${oldEntries.length} old audio files`);
  } catch (error) {
    console.error('Error cleaning up old audio files:', error);
  }
};

// --- Storage Statistics ---
export const getStorageStats = async (): Promise<{
  totalEntries: number;
  textEntries: number;
  audioEntries: number;
  totalAudioDuration: number;
  storageSize: number;
}> => {
  try {
    const entries = await loadJournalEntries();
    const audioEntries = entries.filter(e => e.type === 'audio');
    const totalAudioDuration = audioEntries.reduce((sum, e) => sum + (e.duration || 0), 0);
    
    // Estimate storage size (rough calculation)
    const textSize = entries.reduce((sum, e) => sum + e.content.length, 0);
    const audioSize = audioEntries.length * 1024 * 1024; // Rough estimate: 1MB per audio file
    const metadataSize = entries.length * 500; // Rough estimate: 500 bytes per entry metadata
    const totalSize = textSize + audioSize + metadataSize;
    
    return {
      totalEntries: entries.length,
      textEntries: entries.filter(e => e.type === 'text').length,
      audioEntries: audioEntries.length,
      totalAudioDuration,
      storageSize: totalSize
    };
  } catch (error) {
    console.error('Error getting storage stats:', error);
    return {
      totalEntries: 0,
      textEntries: 0,
      audioEntries: 0,
      totalAudioDuration: 0,
      storageSize: 0
    };
  }
}; 