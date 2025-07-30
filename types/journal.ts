import { BaseEntity, DataClassification, DataSensitivity } from './compliance';

export interface JournalEntry extends BaseEntity {
  type: 'text' | 'audio' | 'helpful_strategy' | 'advice_session';
  content: string; // Text content or transcription
  audioFile?: string; // Local file path for audio
  duration?: number; // Audio duration in seconds
  childId?: string; // If tracking multiple children
  tags?: string[]; // For categorization
  mood?: number; // 1-5 scale for quick mood tracking
  location?: string; // Optional location context
  
  // New fields for Personal Learning Hub
  challenge?: string; // What challenge this addresses
  advice?: string; // The helpful advice received
  worked?: boolean; // Did this strategy work?
  comments?: string; // User's notes about the strategy
  category?: string; // Category of the advice (morning_routine, homework_focus, etc.)
  confidence?: number; // How confident the system was in this advice
}

// New interface for advice sessions
export interface AdviceSession extends BaseEntity {
  question: string;
  advice: string;
  category: string;
  confidence: number;
  feedback?: 'helpful' | 'not_helpful';
  comments?: string; // User's additional thoughts
  savedAsStrategy?: boolean; // Did user save this as a helpful strategy?
  provisionalProfileContext?: {
    primaryChallenge: string;
    familyStrength: string;
    supportNetwork: string[];
    currentStrategies: string[];
  };
}

// New interface for helpful strategies
export interface HelpfulStrategy extends BaseEntity {
  challenge: string;
  strategy: string;
  category: string;
  worked: boolean;
  comments?: string;
  source: 'advice_session' | 'manual_entry';
  originalSessionId?: string; // If saved from an advice session
  tags?: string[];
}

// Usage tracking for free tier
export interface UsageTracking extends BaseEntity {
  month: string; // YYYY-MM format
  adviceSessionsCount: number;
  maxFreeSessions: number;
  isPremium: boolean;
  lastResetDate: string; // ISO string
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
  type: 'journal' | 'helpful_strategy' | 'advice_session';
  title: string;
  description: string;
  timestamp: string;
  icon: 'Mic' | 'PenTool' | 'Lightbulb' | 'MessageCircle';
} 