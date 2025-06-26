export interface JournalEntry {
  id: string;
  timestamp: string; // ISO string
  type: 'text' | 'audio';
  content: string; // Text content or transcription
  audioFile?: string; // Local file path for audio
  duration?: number; // Audio duration in seconds
  childId?: string; // If tracking multiple children
  tags?: string[]; // For categorization
  mood?: number; // 1-5 scale for quick mood tracking
  location?: string; // Optional location context
}

export interface JournalSettings {
  autoBackup: boolean;
  maxStorageSize: number; // in MB
  retentionDays: number;
  transcriptionEnabled: boolean;
}

// Storage abstraction for easy migration to SecureStore
export interface JournalStorage {
  loadEntries(): Promise<JournalEntry[]>;
  saveEntries(entries: JournalEntry[]): Promise<void>;
  deleteEntry(id: string): Promise<void>;
  exportData(startDate: Date, endDate: Date): Promise<string>; // CSV format
}

// Recent activity interface for home screen integration
export interface RecentActivity {
  type: 'journal';
  title: string;
  description: string;
  timestamp: string;
  icon: 'Mic' | 'PenTool';
} 