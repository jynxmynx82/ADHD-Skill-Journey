import { db } from '@/firebaseConfig';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  getDoc,
  setDoc,
  increment
} from 'firebase/firestore';
import { 
  JournalEntry, 
  AdviceSession, 
  HelpfulStrategy, 
  UsageTracking 
} from '@/types/journal';
import { getProvisionalProfile } from './provisionalProfileService';
import { AuditLoggingService } from './auditLoggingService';
import { DataValidationService } from './dataValidationService';

export class PersonalLearningHubService {
  
  // ===== HELPFUL STRATEGIES MANAGEMENT =====
  
  /**
   * Save a new helpful strategy
   */
  async saveHelpfulStrategy(strategy: Omit<HelpfulStrategy, 'id'>): Promise<HelpfulStrategy> {
    try {
      const now = new Date().toISOString();
      const entity: HelpfulStrategy = {
        id: '', // Will be set by Firestore
        ...strategy,
        createdAt: now,
        updatedAt: now,
        dataClassification: 'non_hipaa',
        dataSensitivity: 'confidential',
        encryptionLevel: 'none',
        createdBy: strategy.userId,
        lastModifiedBy: strategy.userId,
        version: 1,
        autoDelete: false
      };
      
      const docRef = await addDoc(collection(db, 'helpfulStrategies'), entity);
      
      // Log the creation
      await AuditLoggingService.logCreate(
        entity.userId,
        'helpfulStrategies',
        docRef.id,
        'User saved helpful strategy'
      );
      
      return {
        ...entity,
        id: docRef.id
      };
    } catch (error) {
      console.error('Error saving helpful strategy:', error);
      throw new Error('Failed to save helpful strategy');
    }
  }
  
  /**
   * Get all helpful strategies for a user
   */
  async getHelpfulStrategies(userId: string): Promise<HelpfulStrategy[]> {
    try {
      const q = query(
        collection(db, 'helpfulStrategies'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as HelpfulStrategy[];
    } catch (error) {
      console.error('Error getting helpful strategies:', error);
      throw new Error('Failed to get helpful strategies');
    }
  }
  
  /**
   * Get strategies by category
   */
  async getStrategiesByCategory(userId: string, category: string): Promise<HelpfulStrategy[]> {
    try {
      const q = query(
        collection(db, 'helpfulStrategies'),
        where('userId', '==', userId),
        where('category', '==', category),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as HelpfulStrategy[];
    } catch (error) {
      console.error('Error getting strategies by category:', error);
      throw new Error('Failed to get strategies by category');
    }
  }
  
  /**
   * Update strategy effectiveness
   */
  async updateStrategyEffectiveness(
    strategyId: string, 
    worked: boolean, 
    comments?: string
  ): Promise<void> {
    try {
      const strategyRef = doc(db, 'helpfulStrategies', strategyId);
      await updateDoc(strategyRef, {
        worked,
        comments: comments || null,
        updatedAt: new Date().toISOString()
      });
      
      // Get the strategy to get userId
      const strategyDoc = await getDoc(strategyRef);
      const strategy = strategyDoc.data() as HelpfulStrategy;
      
      // Log the update
      await AuditLoggingService.logUpdate(
        strategy.userId,
        'helpfulStrategies',
        strategyId,
        'User updated strategy effectiveness',
        { worked, comments }
      );
    } catch (error) {
      console.error('Error updating strategy effectiveness:', error);
      throw new Error('Failed to update strategy effectiveness');
    }
  }
  
  /**
   * Delete a strategy
   */
  async deleteStrategy(strategyId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'helpfulStrategies', strategyId));
    } catch (error) {
      console.error('Error deleting strategy:', error);
      throw new Error('Failed to delete strategy');
    }
  }
  
  /**
   * Save strategy from advice session
   */
  async saveStrategyFromSession(
    sessionId: string,
    userId: string,
    comments?: string
  ): Promise<HelpfulStrategy> {
    try {
      // Get the advice session
      const sessionRef = doc(db, 'adviceSessions', sessionId);
      const sessionDoc = await getDoc(sessionRef);
      
      if (!sessionDoc.exists()) {
        throw new Error('Advice session not found');
      }
      
      const session = sessionDoc.data() as AdviceSession;
      
                   const now = new Date().toISOString();
      // Create helpful strategy from session
      const strategy: Omit<HelpfulStrategy, 'id'> = {
        userId,
        challenge: session.question,
        strategy: session.advice,
        category: session.category,
        worked: false, // Will be updated later when user provides feedback
        comments: comments || '',
        source: 'advice_session',
        originalSessionId: sessionId,
        createdAt: now,
        updatedAt: now,
        dataClassification: 'non_hipaa',
        dataSensitivity: 'confidential',
        encryptionLevel: 'none',
        createdBy: userId,
        lastModifiedBy: userId,
        version: 1,
        autoDelete: false
      };
      
      const savedStrategy = await this.saveHelpfulStrategy(strategy);
      
      // Update session to mark as saved
      await updateDoc(sessionRef, {
        savedAsStrategy: true
      });
      
      return savedStrategy;
    } catch (error) {
      console.error('Error saving strategy from session:', error);
      throw new Error('Failed to save strategy from session');
    }
  }
  
  // ===== ADVICE SESSIONS MANAGEMENT =====
  
  /**
   * Save a new advice session
   */
  async saveAdviceSession(session: Omit<AdviceSession, 'id'>): Promise<AdviceSession> {
    try {
      const now = new Date().toISOString();
      
      // Filter out undefined fields to prevent Firestore errors
      const cleanSession = Object.fromEntries(
        Object.entries(session).filter(([_, value]) => value !== undefined)
      );
      
      const entity: AdviceSession = {
        id: '', // Will be set by Firestore
        userId: session.userId,
        question: session.question,
        advice: session.advice,
        category: session.category,
        confidence: session.confidence,
        ...cleanSession,
        createdAt: now,
        updatedAt: now,
        dataClassification: 'non_hipaa',
        dataSensitivity: 'confidential',
        encryptionLevel: 'none',
        createdBy: session.userId,
        lastModifiedBy: session.userId,
        version: 1,
        autoDelete: false
      };
      
      const docRef = await addDoc(collection(db, 'adviceSessions'), entity);
      
      // Log the creation
      await AuditLoggingService.logCreate(
        entity.userId,
        'adviceSessions',
        docRef.id,
        'User created advice session'
      );
      
      return {
        ...entity,
        id: docRef.id
      };
    } catch (error) {
      console.error('Error saving advice session:', error);
      throw new Error('Failed to save advice session');
    }
  }
  
  /**
   * Get all advice sessions for a user
   */
  async getAdviceSessions(userId: string): Promise<AdviceSession[]> {
    try {
      const q = query(
        collection(db, 'adviceSessions'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AdviceSession[];
    } catch (error) {
      console.error('Error getting advice sessions:', error);
      throw new Error('Failed to get advice sessions');
    }
  }
  
  /**
   * Update session feedback
   */
  async updateSessionFeedback(
    sessionId: string,
    feedback: 'helpful' | 'not_helpful',
    comments?: string
  ): Promise<void> {
    try {
      const sessionRef = doc(db, 'adviceSessions', sessionId);
      await updateDoc(sessionRef, {
        feedback,
        comments: comments || null,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating session feedback:', error);
      throw new Error('Failed to update session feedback');
    }
  }
  
  /**
   * Get feedback analytics
   */
  async getFeedbackAnalytics(userId: string): Promise<{
    helpfulCount: number;
    notHelpfulCount: number;
    totalSessions: number;
    helpfulPercentage: number;
  }> {
    try {
      const sessions = await this.getAdviceSessions(userId);
      const sessionsWithFeedback = sessions.filter(s => s.feedback);
      
      const helpfulCount = sessionsWithFeedback.filter(s => s.feedback === 'helpful').length;
      const notHelpfulCount = sessionsWithFeedback.filter(s => s.feedback === 'not_helpful').length;
      const totalSessions = sessions.length;
      const helpfulPercentage = sessionsWithFeedback.length > 0 
        ? (helpfulCount / sessionsWithFeedback.length) * 100 
        : 0;
      
      return {
        helpfulCount,
        notHelpfulCount,
        totalSessions,
        helpfulPercentage
      };
    } catch (error) {
      console.error('Error getting feedback analytics:', error);
      throw new Error('Failed to get feedback analytics');
    }
  }
  
  // ===== USAGE TRACKING =====
  
  /**
   * Check if user can make another advice request
   */
  async checkUsageLimit(userId: string): Promise<{ 
    canUse: boolean; 
    remaining: number; 
    isPremium: boolean;
    resetDate: string;
  }> {
    try {
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      const usageRef = doc(db, 'usageTracking', `${userId}_${currentMonth}`);
      const usageDoc = await getDoc(usageRef);
      
      if (!usageDoc.exists()) {
        // First time user this month
        return {
          canUse: true,
          remaining: 3,
          isPremium: false,
          resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString()
        };
      }
      
      const usage = usageDoc.data() as UsageTracking;
      const remaining = Math.max(0, usage.maxFreeSessions - usage.adviceSessionsCount);
      
      return {
        canUse: usage.isPremium || remaining > 0,
        remaining,
        isPremium: usage.isPremium,
        resetDate: usage.lastResetDate
      };
    } catch (error) {
      console.error('Error checking usage limit:', error);
      throw new Error('Failed to check usage limit');
    }
  }
  
  /**
   * Increment usage count
   */
  async incrementUsage(userId: string): Promise<void> {
    try {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const usageRef = doc(db, 'usageTracking', `${userId}_${currentMonth}`);
      const usageDoc = await getDoc(usageRef);
      
      if (!usageDoc.exists()) {
        // Create new usage record
        await setDoc(usageRef, {
          userId,
          month: currentMonth,
          adviceSessionsCount: 1,
          maxFreeSessions: 3,
          isPremium: false,
          lastResetDate: new Date().toISOString()
        });
      } else {
        // Increment existing usage
        await updateDoc(usageRef, {
          adviceSessionsCount: increment(1)
        });
      }
    } catch (error) {
      console.error('Error incrementing usage:', error);
      throw new Error('Failed to increment usage');
    }
  }
  
  /**
   * Reset monthly usage (called automatically or manually)
   */
  async resetMonthlyUsage(userId: string): Promise<void> {
    try {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const usageRef = doc(db, 'usageTracking', `${userId}_${currentMonth}`);
      
      await setDoc(usageRef, {
        userId,
        month: currentMonth,
        adviceSessionsCount: 0,
        maxFreeSessions: 3,
        isPremium: false,
        lastResetDate: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error resetting monthly usage:', error);
      throw new Error('Failed to reset monthly usage');
    }
  }
  
  // ===== JOURNAL INTEGRATION =====
  
  /**
   * Save entry to journal
   */
  async saveToJournal(entry: Omit<JournalEntry, 'id'>): Promise<JournalEntry> {
    try {
      const now = new Date().toISOString();
      const entity: JournalEntry = {
        id: '', // Will be set by Firestore
        ...entry,
        createdAt: now,
        updatedAt: now,
        dataClassification: 'non_hipaa',
        dataSensitivity: 'confidential',
        encryptionLevel: 'none',
        createdBy: entry.userId,
        lastModifiedBy: entry.userId,
        version: 1,
        autoDelete: false
      };
      
      const docRef = await addDoc(collection(db, 'journalEntries'), entity);
      
      // Log the creation
      await AuditLoggingService.logCreate(
        entity.userId,
        'journalEntries',
        docRef.id,
        'User saved journal entry'
      );
      
      return {
        ...entity,
        id: docRef.id
      };
    } catch (error) {
      console.error('Error saving to journal:', error);
      throw new Error('Failed to save to journal');
    }
  }
  
  /**
   * Get journal entries for a user
   */
  async getJournalEntries(userId: string, type?: string): Promise<JournalEntry[]> {
    try {
      let q = query(
        collection(db, 'journalEntries'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      if (type) {
        q = query(q, where('type', '==', type));
      }
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as JournalEntry[];
    } catch (error) {
      console.error('Error getting journal entries:', error);
      throw new Error('Failed to get journal entries');
    }
  }
  
  /**
   * Get recent activity for home screen
   */
  async getRecentActivity(userId: string, limit: number = 10): Promise<{
    journalEntries: JournalEntry[];
    helpfulStrategies: HelpfulStrategy[];
    adviceSessions: AdviceSession[];
  }> {
    try {
      const [journalEntries, helpfulStrategies, adviceSessions] = await Promise.all([
        this.getJournalEntries(userId),
        this.getHelpfulStrategies(userId),
        this.getAdviceSessions(userId)
      ]);
      
      return {
        journalEntries: journalEntries.slice(0, limit),
        helpfulStrategies: helpfulStrategies.slice(0, limit),
        adviceSessions: adviceSessions.slice(0, limit)
      };
    } catch (error) {
      console.error('Error getting recent activity:', error);
      throw new Error('Failed to get recent activity');
    }
  }
}

// Export singleton instance
export const personalLearningHub = new PersonalLearningHubService(); 