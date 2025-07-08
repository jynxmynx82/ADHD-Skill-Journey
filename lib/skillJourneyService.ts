/**
 * Skill Journey Service - Slice 1 (Flow Mode)
 * Firebase operations for the simplified adventure-based system
 */

import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  Timestamp,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { 
  SimpleSkill, 
  Adventure, 
  Journey, 
  CreateSimpleSkillForm, 
  CreateAdventureForm,
  JourneyProgress,
  AdventureWinType 
} from '@/types/skillJourney';

// Helper function to convert Firestore timestamps to Date objects
const timestampToDate = (timestamp: any): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  if (typeof timestamp === 'string') {
    return new Date(timestamp);
  }
  return new Date();
};

// Helper function to convert Date to Firestore timestamp
const dateToTimestamp = (date: Date): Timestamp => {
  return Timestamp.fromDate(date);
};

export const slice1Service = {
  // Get all journeys for a child
  async getJourneys(childId: string): Promise<{ data: Journey[] | null; error: string | null }> {
    try {
      console.log('Getting journeys for childId:', childId);
      
      const journeysRef = collection(db, 'journeys');
      const q = query(
        journeysRef,
        where('childId', '==', childId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const journeys: Journey[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('Journey data:', data);
        
        // Convert timestamps in the progress
        const progress: JourneyProgress = {
          ...data.progress,
          lastUpdated: timestampToDate(data.progress.lastUpdated)
        };
        
        const journey: Journey = {
          skillData: {
            ...data.skillData,
            createdAt: timestampToDate(data.skillData.createdAt)
          },
          progress
        };
        
        journeys.push(journey);
      });
      
      console.log('Processed journeys:', journeys);
      return { data: journeys, error: null };
    } catch (error) {
      console.error('Error getting journeys:', error);
      return { data: null, error: 'Failed to get journeys' };
    }
  },

  // Create a new journey (skill + progress) for a child
  async createJourney(childId: string, skillData: CreateSimpleSkillForm): Promise<{ data: Journey | null; error: string | null }> {
    try {
      console.log('Creating journey for childId:', childId, 'skillData:', skillData);
      
      const progress: JourneyProgress = {
        adventureCount: 0,
        lastUpdated: new Date()
      };
      
      const journeyData = {
        childId,
        skillData: {
          ...skillData,
          id: `skill_${Date.now()}`,
          createdAt: new Date()
        },
        progress,
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'journeys'), journeyData);
      console.log('Journey created with ID:', docRef.id);
      
      const journey: Journey = {
        skillData: journeyData.skillData,
        progress
      };
      
      return { data: journey, error: null };
    } catch (error) {
      console.error('Error creating journey:', error);
      return { data: null, error: 'Failed to create journey' };
    }
  },

  // Get adventures for a specific skill
  async getAdventures(childId: string, skillId: string): Promise<{ data: Adventure[] | null; error: string | null }> {
    try {
      console.log('Getting adventures for childId:', childId, 'skillId:', skillId);
      
      const adventuresRef = collection(db, 'adventures');
      const q = query(
        adventuresRef,
        where('childId', '==', childId),
        where('skillId', '==', skillId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const adventures: Adventure[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const adventure: Adventure = {
          id: doc.id,
          text: data.text,
          winType: data.winType,
          photoUrl: data.photoUrl,
          createdAt: timestampToDate(data.createdAt)
        };
        adventures.push(adventure);
      });
      
      console.log('Processed adventures:', adventures);
      return { data: adventures, error: null };
    } catch (error) {
      console.error('Error getting adventures:', error);
      return { data: null, error: 'Failed to get adventures' };
    }
  },

  // Log a new adventure and update progress
  async logAdventure(childId: string, skillId: string, adventureData: CreateAdventureForm): Promise<{ data: Adventure | null; error: string | null }> {
    try {
      console.log('Logging adventure for childId:', childId, 'skillId:', skillId, 'adventureData:', adventureData);
      
      // First, log the adventure
      const adventureDoc = {
        childId,
        skillId,
        text: adventureData.text,
        winType: adventureData.winType,
        photoUrl: adventureData.photoUrl,
        createdAt: serverTimestamp()
      };
      
      const adventureRef = await addDoc(collection(db, 'adventures'), adventureDoc);
      console.log('Adventure logged with ID:', adventureRef.id);
      
      // Then, update the journey's progress
      const journeysRef = collection(db, 'journeys');
      const journeyQuery = query(
        journeysRef,
        where('childId', '==', childId),
        where('skillData.id', '==', skillId)
      );
      
      const journeySnapshot = await getDocs(journeyQuery);
      if (journeySnapshot.empty) {
        throw new Error('Journey not found');
      }
      
      const journeyDoc = journeySnapshot.docs[0];
      const journeyData = journeyDoc.data();
      
      const updatedProgress: JourneyProgress = {
        ...journeyData.progress,
        adventureCount: journeyData.progress.adventureCount + 1,
        lastUpdated: new Date()
      };
      
      await updateDoc(journeyDoc.ref, {
        'progress': updatedProgress
      });
      
      console.log('Progress updated:', updatedProgress);
      
      const adventure: Adventure = {
        id: adventureRef.id,
        text: adventureData.text,
        winType: adventureData.winType,
        photoUrl: adventureData.photoUrl,
        createdAt: new Date()
      };
      
      return { data: adventure, error: null };
    } catch (error) {
      console.error('Error logging adventure:', error);
      return { data: null, error: 'Failed to log adventure' };
    }
  }
}; 