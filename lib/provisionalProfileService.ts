import { doc, setDoc, getDoc, collection } from 'firebase/firestore';
import { db } from '@/firebaseConfig';

export interface ProvisionalProfile {
  id: string;
  userId: string;
  isPlaceholder: true;
  primaryChallenge: string;
  familyStrength: string;
  supportNetwork: string[];
  currentStrategies: string[];
  createdAt: Date;
  updatedAt: Date;
}

export const createProvisionalProfile = async (
  userId: string, 
  answers: Record<string, string>
): Promise<string> => {
  try {
    const profileData: Omit<ProvisionalProfile, 'id'> = {
      userId,
      isPlaceholder: true,
      primaryChallenge: answers.primaryChallenge || '',
      familyStrength: answers.familyStrength || '',
      supportNetwork: answers.supportNetwork ? [answers.supportNetwork] : [],
      currentStrategies: answers.currentStrategies ? [answers.currentStrategies] : [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Create a document with a predictable ID for easy retrieval
    const profileId = `provisional_${userId}`;
    const profileRef = doc(db, 'provisionalProfiles', profileId);
    
    await setDoc(profileRef, profileData);
    
    console.log('✅ Provisional profile created successfully:', profileId);
    return profileId;
  } catch (error) {
    console.error('❌ Error creating provisional profile:', error);
    throw new Error('Failed to create provisional profile');
  }
};

export const getProvisionalProfile = async (userId: string): Promise<ProvisionalProfile | null> => {
  try {
    const profileId = `provisional_${userId}`;
    const profileRef = doc(db, 'provisionalProfiles', profileId);
    const profileDoc = await getDoc(profileRef);
    
    if (profileDoc.exists()) {
      return {
        id: profileDoc.id,
        ...profileDoc.data()
      } as ProvisionalProfile;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error fetching provisional profile:', error);
    return null;
  }
};

export const updateProvisionalProfile = async (
  userId: string, 
  updates: Partial<Omit<ProvisionalProfile, 'id' | 'userId' | 'isPlaceholder' | 'createdAt'>>
): Promise<void> => {
  try {
    const profileId = `provisional_${userId}`;
    const profileRef = doc(db, 'provisionalProfiles', profileId);
    
    await setDoc(profileRef, {
      ...updates,
      updatedAt: new Date(),
    }, { merge: true });
    
    console.log('✅ Provisional profile updated successfully');
  } catch (error) {
    console.error('❌ Error updating provisional profile:', error);
    throw new Error('Failed to update provisional profile');
  }
}; 