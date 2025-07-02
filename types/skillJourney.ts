/**
 * Skill Journey Types
 * Core data models for tracking skill development and progress
 */

export interface Skill {
  id: string;
  name: string;
  description: string;
  category: SkillCategory;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDays: number; // Average time to master
  childId: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  parentNotes?: string;
  childNotes?: string;
}

export type SkillCategory = 
  | 'self-care'      // Tying shoes, brushing teeth, etc.
  | 'academic'       // Reading, math, writing
  | 'social'         // Making friends, sharing, communication
  | 'emotional'      // Managing feelings, patience
  | 'physical'       // Sports, coordination, balance
  | 'creative'       // Art, music, imagination
  | 'life-skills'    // Cooking, cleaning, organization
  | 'technology'     // Using devices, apps, digital literacy
  | 'custom';        // User-defined skills

export interface SkillProgress {
  id: string;
  skillId: string;
  childId: string;
  date: Date;
  status: ProgressStatus;
  effort: 1 | 2 | 3 | 4 | 5; // 1 = minimal effort, 5 = maximum effort
  mood: 1 | 2 | 3 | 4 | 5; // 1 = very frustrated, 5 = very happy
  notes?: string;
  parentNotes?: string;
  evidence?: string[]; // URLs to photos/videos
  duration?: number; // Minutes spent practicing
  challenges?: string[];
  victories?: string[];
  createdAt: Date;
}

export type ProgressStatus = 
  | 'not-started'    // Skill hasn't been attempted yet
  | 'struggling'     // Having significant difficulty
  | 'learning'       // Making progress but not mastered
  | 'improving'      // Getting better, some success
  | 'almost-there'   // Close to mastery
  | 'mastered'       // Skill is fully learned
  | 'maintaining';   // Keeping the skill sharp

export interface SkillMilestone {
  id: string;
  skillId: string;
  childId: string;
  title: string;
  description: string;
  date: Date;
  type: MilestoneType;
  evidence?: string[]; // URLs to photos/videos
  parentNotes?: string;
  childNotes?: string;
  isCelebrated: boolean;
  createdAt: Date;
}

export type MilestoneType = 
  | 'first-attempt'    // First time trying the skill
  | 'breakthrough'     // Major progress moment
  | 'consistency'      // Regular practice achievement
  | 'independence'     // Doing it without help
  | 'teaching-others'  // Teaching someone else
  | 'mastery'          // Full skill mastery
  | 'custom';          // User-defined milestone

export interface AIStory {
  id: string;
  childId: string;
  title: string;
  content: string;
  storyType: StoryType;
  relatedSkills: string[]; // Skill IDs
  relatedMilestones: string[]; // Milestone IDs
  mood: 'adventure' | 'mystery' | 'fantasy' | 'realistic' | 'educational';
  heroName: string; // Child's name in the story
  isFavorite: boolean;
  lastRead: Date;
  readCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export type StoryType = 
  | 'progress-summary'    // Weekly/monthly progress overview
  | 'milestone-celebration' // Story about a specific achievement
  | 'challenge-overcome'   // Story about overcoming difficulties
  | 'skill-journey'        // Complete journey of learning a skill
  | 'character-growth'     // Story about personal development
  | 'family-adventure';    // Story involving family support

export interface SkillJourneyStats {
  childId: string;
  totalSkills: number;
  activeSkills: number;
  masteredSkills: number;
  totalPracticeTime: number; // Minutes
  currentStreak: number; // Days of consistent practice
  longestStreak: number;
  totalMilestones: number;
  averageEffort: number; // 1-5 scale
  averageMood: number; // 1-5 scale
  lastUpdated: Date;
}

export interface ParentInsight {
  id: string;
  childId: string;
  insightType: InsightType;
  title: string;
  content: string;
  relatedSkills: string[];
  confidence: number; // 0-100, how confident the insight is
  isActionable: boolean;
  suggestedActions?: string[];
  createdAt: Date;
  isRead: boolean;
}

export type InsightType = 
  | 'progress-pattern'     // Noticing patterns in progress
  | 'challenge-identification' // Identifying specific challenges
  | 'strength-recognition' // Recognizing child's strengths
  | 'motivation-tip'       // Tips for maintaining motivation
  | 'expectation-adjustment' // Adjusting realistic expectations
  | 'celebration-opportunity'; // Opportunities to celebrate

// Form types for creating/editing
export interface CreateSkillForm {
  name: string;
  description: string;
  category: SkillCategory;
  difficulty: Skill['difficulty'];
  estimatedDays: number;
  parentNotes?: string;
}

export interface UpdateProgressForm {
  status: ProgressStatus;
  effort: SkillProgress['effort'];
  mood: SkillProgress['mood'];
  notes?: string;
  parentNotes?: string;
  duration?: number;
  challenges?: string[];
  victories?: string[];
}

export interface CreateMilestoneForm {
  title: string;
  description: string;
  type: MilestoneType;
  evidence?: string[];
  parentNotes?: string;
  childNotes?: string;
}

// Filter and search types
export interface SkillFilters {
  category?: SkillCategory;
  status?: ProgressStatus;
  difficulty?: Skill['difficulty'];
  isActive?: boolean;
  searchQuery?: string;
}

export interface ProgressFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  status?: ProgressStatus;
  effort?: SkillProgress['effort'];
  mood?: SkillProgress['mood'];
}

// ===== SLICE 1: CORE LOOP TYPES =====

// Simplified skill for MVP
export interface SimpleSkill {
  id: string;
  name: string;
  category: SkillCategory;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDays: number;
  createdAt: Date;
}

// Adventure (replaces "attempts" with positive framing)
export interface Adventure {
  id: string;
  text: string;
  winType: AdventureWinType;
  photoUrl?: string;
  createdAt: Date;
}

export type AdventureWinType = 
  | 'tried-best'        // "We tried our best!"
  | 'no-frustration'    // "We didn't get frustrated!"
  | 'laughed-about-it'  // "We laughed about it!"
  | 'made-progress'     // "We made progress!"
  | 'kept-going'        // "We kept going!"
  | 'custom';           // Custom positive note

// Resilience Tree data
export interface ResilienceTree {
  treeLevel: number;
  leafCount: number;
  branchCount: number;
  lastUpdated: Date;
}

// Journey document (contains skill + adventures + stories)
export interface Journey {
  skillData: SimpleSkill;
  resilienceTree: ResilienceTree;
}

// Form types for Slice 1
export interface CreateSimpleSkillForm {
  name: string;
  category: SkillCategory;
  difficulty: SimpleSkill['difficulty'];
  estimatedDays: number;
}

export interface CreateAdventureForm {
  text: string;
  winType: AdventureWinType;
  photoUrl?: string;
} 