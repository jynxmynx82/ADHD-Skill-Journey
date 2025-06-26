/**
 * Skill Journey Service
 * Firebase operations for managing skill development and progress tracking
 */

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  Timestamp,
  writeBatch,
  onSnapshot,
  QuerySnapshot,
  DocumentData
} from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { 
  Skill, 
  SkillProgress, 
  SkillMilestone, 
  AIStory, 
  SkillJourneyStats,
  ParentInsight,
  CreateSkillForm,
  UpdateProgressForm,
  CreateMilestoneForm,
  SkillFilters,
  ProgressFilters
} from '@/types/skillJourney';
import { handleAsyncOperation, handleFirebaseError } from '@/lib/errorHandling';

// Collection names
const COLLECTIONS = {
  SKILLS: 'skills',
  PROGRESS: 'skill_progress',
  MILESTONES: 'skill_milestones',
  STORIES: 'ai_stories',
  STATS: 'skill_journey_stats',
  INSIGHTS: 'parent_insights'
} as const;

// Convert Firestore timestamp to Date
const timestampToDate = (timestamp: Timestamp | Date): Date => {
  if (timestamp instanceof Date) return timestamp;
  return timestamp.toDate();
};

// Convert Date to Firestore timestamp
const dateToTimestamp = (date: Date): Timestamp => {
  return Timestamp.fromDate(date);
};

// Convert Firestore document to typed object
const convertFirestoreDoc = <T>(doc: DocumentData): T => {
  const data = doc.data();
  const converted: any = { id: doc.id, ...data };
  
  // Convert timestamps to dates
  Object.keys(converted).forEach(key => {
    if (converted[key] instanceof Timestamp) {
      converted[key] = timestampToDate(converted[key]);
    }
  });
  
  return converted as T;
};

// Skills CRUD operations
export const skillService = {
  // Create a new skill
  async createSkill(childId: string, skillData: CreateSkillForm): Promise<{ data: Skill | null; error: any }> {
    return handleAsyncOperation(async () => {
      const skill: Omit<Skill, 'id'> = {
        ...skillData,
        childId,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      };
      
      const docRef = await addDoc(collection(db, COLLECTIONS.SKILLS), skill);
      return { ...skill, id: docRef.id };
    }, 'createSkill');
  },

  // Get skills for a child
  async getSkills(childId: string, filters?: SkillFilters): Promise<{ data: Skill[] | null; error: any }> {
    return handleAsyncOperation(async () => {
      let q = query(
        collection(db, COLLECTIONS.SKILLS),
        where('childId', '==', childId),
        orderBy('createdAt', 'desc')
      );

      if (filters?.category) {
        q = query(q, where('category', '==', filters.category));
      }
      if (filters?.isActive !== undefined) {
        q = query(q, where('isActive', '==', filters.isActive));
      }

      const snapshot = await getDocs(q);
      let skills = snapshot.docs.map(convertFirestoreDoc<Skill>);

      // Apply text search filter
      if (filters?.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        skills = skills.filter(skill => 
          skill.name.toLowerCase().includes(query) ||
          skill.description.toLowerCase().includes(query)
        );
      }

      return skills;
    }, 'getSkills');
  },

  // Get a single skill
  async getSkill(skillId: string): Promise<{ data: Skill | null; error: any }> {
    return handleAsyncOperation(async () => {
      const docRef = doc(db, COLLECTIONS.SKILLS, skillId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) return null;
      return convertFirestoreDoc<Skill>(docSnap);
    }, 'getSkill');
  },

  // Update a skill
  async updateSkill(skillId: string, updates: Partial<Skill>): Promise<{ data: void | null; error: any }> {
    return handleAsyncOperation(async () => {
      const docRef = doc(db, COLLECTIONS.SKILLS, skillId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date()
      });
    }, 'updateSkill');
  },

  // Delete a skill (soft delete by setting isActive to false)
  async deleteSkill(skillId: string): Promise<{ data: void | null; error: any }> {
    return handleAsyncOperation(async () => {
      await this.updateSkill(skillId, { isActive: false });
    }, 'deleteSkill');
  }
};

// Progress tracking operations
export const progressService = {
  // Record progress for a skill
  async recordProgress(childId: string, skillId: string, progressData: UpdateProgressForm): Promise<{ data: SkillProgress | null; error: any }> {
    return handleAsyncOperation(async () => {
      const progress: Omit<SkillProgress, 'id'> = {
        skillId,
        childId,
        date: new Date(),
        ...progressData,
        createdAt: new Date()
      };
      
      const docRef = await addDoc(collection(db, COLLECTIONS.PROGRESS), progress);
      return { ...progress, id: docRef.id };
    }, 'recordProgress');
  },

  // Get progress for a skill
  async getSkillProgress(skillId: string, filters?: ProgressFilters): Promise<{ data: SkillProgress[] | null; error: any }> {
    return handleAsyncOperation(async () => {
      let q = query(
        collection(db, COLLECTIONS.PROGRESS),
        where('skillId', '==', skillId),
        orderBy('date', 'desc')
      );

      if (filters?.status) {
        q = query(q, where('status', '==', filters.status));
      }

      const snapshot = await getDocs(q);
      let progress = snapshot.docs.map(convertFirestoreDoc<SkillProgress>);

      // Apply date range filter
      if (filters?.dateRange) {
        progress = progress.filter(p => 
          p.date >= filters.dateRange!.start && p.date <= filters.dateRange!.end
        );
      }

      return progress;
    }, 'getSkillProgress');
  },

  // Get all progress for a child
  async getChildProgress(childId: string, filters?: ProgressFilters): Promise<{ data: SkillProgress[] | null; error: any }> {
    return handleAsyncOperation(async () => {
      let q = query(
        collection(db, COLLECTIONS.PROGRESS),
        where('childId', '==', childId),
        orderBy('date', 'desc')
      );

      const snapshot = await getDocs(q);
      let progress = snapshot.docs.map(convertFirestoreDoc<SkillProgress>);

      // Apply filters
      if (filters?.status) {
        progress = progress.filter(p => p.status === filters.status);
      }
      if (filters?.dateRange) {
        progress = progress.filter(p => 
          p.date >= filters.dateRange!.start && p.date <= filters.dateRange!.end
        );
      }

      return progress;
    }, 'getChildProgress');
  },

  // Get latest progress for each skill
  async getLatestProgress(childId: string): Promise<{ data: Record<string, SkillProgress> | null; error: any }> {
    return handleAsyncOperation(async () => {
      const progressResult = await this.getChildProgress(childId);
      if (progressResult.error || !progressResult.data) {
        return {};
      }
      
      const progress = progressResult.data;
      const latest: Record<string, SkillProgress> = {};
      
      progress.forEach(p => {
        if (!latest[p.skillId] || p.date > latest[p.skillId].date) {
          latest[p.skillId] = p;
        }
      });
      
      return latest;
    }, 'getLatestProgress');
  }
};

// Milestones operations
export const milestoneService = {
  // Create a milestone
  async createMilestone(childId: string, skillId: string, milestoneData: CreateMilestoneForm): Promise<{ data: SkillMilestone | null; error: any }> {
    return handleAsyncOperation(async () => {
      const milestone: Omit<SkillMilestone, 'id'> = {
        skillId,
        childId,
        ...milestoneData,
        date: new Date(),
        isCelebrated: false,
        createdAt: new Date()
      };
      
      const docRef = await addDoc(collection(db, COLLECTIONS.MILESTONES), milestone);
      return { ...milestone, id: docRef.id };
    }, 'createMilestone');
  },

  // Get milestones for a skill
  async getSkillMilestones(skillId: string): Promise<{ data: SkillMilestone[] | null; error: any }> {
    return handleAsyncOperation(async () => {
      const q = query(
        collection(db, COLLECTIONS.MILESTONES),
        where('skillId', '==', skillId),
        orderBy('date', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(convertFirestoreDoc<SkillMilestone>);
    }, 'getSkillMilestones');
  },

  // Get all milestones for a child
  async getChildMilestones(childId: string): Promise<{ data: SkillMilestone[] | null; error: any }> {
    return handleAsyncOperation(async () => {
      const q = query(
        collection(db, COLLECTIONS.MILESTONES),
        where('childId', '==', childId),
        orderBy('date', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(convertFirestoreDoc<SkillMilestone>);
    }, 'getChildMilestones');
  },

  // Mark milestone as celebrated
  async celebrateMilestone(milestoneId: string): Promise<{ data: void | null; error: any }> {
    return handleAsyncOperation(async () => {
      const docRef = doc(db, COLLECTIONS.MILESTONES, milestoneId);
      await updateDoc(docRef, { isCelebrated: true });
    }, 'celebrateMilestone');
  }
};

// AI Stories operations
export const storyService = {
  // Create an AI story
  async createStory(storyData: Omit<AIStory, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ data: AIStory | null; error: any }> {
    return handleAsyncOperation(async () => {
      const story: Omit<AIStory, 'id'> = {
        ...storyData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const docRef = await addDoc(collection(db, COLLECTIONS.STORIES), story);
      return { ...story, id: docRef.id };
    }, 'createStory');
  },

  // Get stories for a child
  async getChildStories(childId: string): Promise<{ data: AIStory[] | null; error: any }> {
    return handleAsyncOperation(async () => {
      const q = query(
        collection(db, COLLECTIONS.STORIES),
        where('childId', '==', childId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(convertFirestoreDoc<AIStory>);
    }, 'getChildStories');
  },

  // Mark story as read
  async markStoryAsRead(storyId: string): Promise<{ data: void | null; error: any }> {
    return handleAsyncOperation(async () => {
      const docRef = doc(db, COLLECTIONS.STORIES, storyId);
      await updateDoc(docRef, { 
        lastRead: new Date(),
        readCount: (await getDoc(docRef)).data()?.readCount + 1 || 1
      });
    }, 'markStoryAsRead');
  },

  // Toggle story favorite status
  async toggleStoryFavorite(storyId: string): Promise<{ data: void | null; error: any }> {
    return handleAsyncOperation(async () => {
      const docRef = doc(db, COLLECTIONS.STORIES, storyId);
      const docSnap = await getDoc(docRef);
      const currentFavorite = docSnap.data()?.isFavorite || false;
      
      await updateDoc(docRef, { 
        isFavorite: !currentFavorite,
        updatedAt: new Date()
      });
    }, 'toggleStoryFavorite');
  }
};

// Stats operations
export const statsService = {
  // Calculate and update stats for a child
  async updateChildStats(childId: string): Promise<{ data: SkillJourneyStats | null; error: any }> {
    return handleAsyncOperation(async () => {
      // Get all data for the child
      const [skillsResult, progressResult, milestonesResult] = await Promise.all([
        skillService.getSkills(childId),
        progressService.getChildProgress(childId),
        milestoneService.getChildMilestones(childId)
      ]);

      if (skillsResult.error || progressResult.error || milestonesResult.error) {
        throw new Error('Failed to fetch data for stats calculation');
      }

      const skills = skillsResult.data || [];
      const progress = progressResult.data || [];
      const milestones = milestonesResult.data || [];

      // Calculate stats
      const activeSkills = skills.filter(s => s.isActive);
      const masteredSkills = progress.filter(p => p.status === 'mastered').length;
      
      const totalPracticeTime = progress.reduce((sum, p) => sum + (p.duration || 0), 0);
      const averageEffort = progress.length > 0 
        ? progress.reduce((sum, p) => sum + p.effort, 0) / progress.length 
        : 0;
      const averageMood = progress.length > 0 
        ? progress.reduce((sum, p) => sum + p.mood, 0) / progress.length 
        : 0;

      // Calculate streak (simplified - could be more sophisticated)
      const sortedProgress = progress.sort((a, b) => b.date.getTime() - a.date.getTime());
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      
      for (let i = 0; i < sortedProgress.length; i++) {
        if (i === 0 || 
            Math.abs(sortedProgress[i].date.getTime() - sortedProgress[i-1].date.getTime()) <= 24 * 60 * 60 * 1000) {
          tempStreak++;
          if (i === 0) currentStreak = tempStreak;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);

      const stats: SkillJourneyStats = {
        childId,
        totalSkills: skills.length,
        activeSkills: activeSkills.length,
        masteredSkills,
        totalPracticeTime,
        currentStreak,
        longestStreak,
        totalMilestones: milestones.length,
        averageEffort,
        averageMood,
        lastUpdated: new Date()
      };

      // Save to Firestore
      const existingStats = await this.getChildStats(childId);
      if (existingStats.data) {
        // Use the document ID from the existing stats
        const docRef = doc(db, COLLECTIONS.STATS, existingStats.data.childId);
        await updateDoc(docRef, {
          totalSkills: stats.totalSkills,
          activeSkills: stats.activeSkills,
          masteredSkills: stats.masteredSkills,
          totalPracticeTime: stats.totalPracticeTime,
          currentStreak: stats.currentStreak,
          longestStreak: stats.longestStreak,
          totalMilestones: stats.totalMilestones,
          averageEffort: stats.averageEffort,
          averageMood: stats.averageMood,
          lastUpdated: stats.lastUpdated
        });
      } else {
        // Create new stats document
        await addDoc(collection(db, COLLECTIONS.STATS), stats);
      }

      return stats;
    }, 'updateChildStats');
  },

  // Get stats for a child
  async getChildStats(childId: string): Promise<{ data: SkillJourneyStats | null; error: any }> {
    return handleAsyncOperation(async () => {
      const q = query(
        collection(db, COLLECTIONS.STATS),
        where('childId', '==', childId),
        limit(1)
      );
      
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      
      return convertFirestoreDoc<SkillJourneyStats>(snapshot.docs[0]);
    }, 'getChildStats');
  }
};

// Real-time listeners
export const realtimeService = {
  // Listen to skills changes
  onSkillsChange(childId: string, callback: (skills: Skill[]) => void) {
    const q = query(
      collection(db, COLLECTIONS.SKILLS),
      where('childId', '==', childId),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot: QuerySnapshot) => {
      const skills = snapshot.docs.map(convertFirestoreDoc<Skill>);
      callback(skills);
    });
  },

  // Listen to progress changes for a skill
  onSkillProgressChange(skillId: string, callback: (progress: SkillProgress[]) => void) {
    const q = query(
      collection(db, COLLECTIONS.PROGRESS),
      where('skillId', '==', skillId),
      orderBy('date', 'desc')
    );
    
    return onSnapshot(q, (snapshot: QuerySnapshot) => {
      const progress = snapshot.docs.map(convertFirestoreDoc<SkillProgress>);
      callback(progress);
    });
  }
}; 