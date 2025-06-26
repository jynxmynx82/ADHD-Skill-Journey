// context/FamilyContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../firebaseConfig'; // Fixed import path
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';

// Complete Child interface
export interface Child {
  id: string;
  familyId: string;
  name: string;
  age: number;
  diagnosis: string;
  strengths: string[];
  challenges: string[];
  medications?: string;
  allergies?: string;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Context type with CRUD operations
interface FamilyContextType {
  children: Child[];
  selectedChildId: string | null;
  loading: boolean;
  error: Error | null;
  fetchChildren: () => Promise<void>;
  addChild: (childData: Omit<Child, 'id' | 'familyId' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateChild: (childId: string, updates: Partial<Child>) => Promise<void>;
  deleteChild: (childId: string) => Promise<void>;
  deleteAllChildren: () => Promise<void>; // For testing
  setSelectedChildId: (childId: string | null) => void;
  getSelectedChild: () => Child | null;
}

// Create the context
const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

// FamilyProvider component
export function FamilyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [familyChildren, setFamilyChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(false); // Start as false, not true
  const [error, setError] = useState<Error | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  // Use useCallback to prevent unnecessary re-renders
  const fetchChildren = useCallback(async () => {
    // Don't fetch if no user
    if (!user || !user.uid) {
      setFamilyChildren([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const familyId = `family_${user.uid}`;
      const q = query(collection(db, 'children'), where('familyId', '==', familyId));
      const querySnapshot = await getDocs(q);
      const childrenData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Child, 'id'>),
      }));
      setFamilyChildren(childrenData);
    } catch (err: any) {
      console.error("Error fetching children:", err);
      setError(err);
      setFamilyChildren([]); // Clear children on error
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addChild = async (childData: Omit<Child, 'id' | 'familyId' | 'createdAt' | 'updatedAt'>) => {
    console.log('🔥 FamilyContext: Starting addChild...', { childData, userId: user?.uid });
    
    if (!user || !user.uid) {
      console.error('❌ FamilyContext: User not authenticated');
      throw new Error("User not authenticated");
    }
    
    try {
      // Clean the data to ensure no undefined values
      const cleanChildData: any = {
        name: childData.name,
        age: childData.age,
        diagnosis: childData.diagnosis,
        strengths: childData.strengths || [],
        challenges: childData.challenges || [],
        familyId: `family_${user.uid}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Only add optional fields if they exist and have content
      if (childData.medications && childData.medications.trim()) {
        cleanChildData.medications = childData.medications.trim();
      }
      
      if (childData.allergies && childData.allergies.trim()) {
        cleanChildData.allergies = childData.allergies.trim();
      }
      
      console.log('📝 FamilyContext: Cleaned child data for Firebase:', cleanChildData);
      
      const docRef = await addDoc(collection(db, 'children'), cleanChildData);
      console.log('✅ FamilyContext: Child added to Firebase with ID:', docRef.id);
      
      await fetchChildren(); // Refresh the list
      return docRef.id;
    } catch (error: any) {
      console.error('❌ FamilyContext: Error adding child to Firebase:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      
      // Re-throw with more specific error message
      if (error.code === 'permission-denied') {
        throw new Error('Permission denied: Unable to add child');
      } else if (error.code === 'unavailable') {
        throw new Error('Network error: Unable to connect to database');
      } else if (error.message?.includes('invalid data')) {
        throw new Error('Invalid data format: Please check your input');
      } else {
        throw new Error('Failed to add child to profile');
      }
    }
  };

  const updateChild = async (childId: string, updates: Partial<Child>) => {
    const childRef = doc(db, 'children', childId);
    await updateDoc(childRef, { ...updates, updatedAt: new Date() });
    await fetchChildren();
  };

  const deleteChild = async (childId: string) => {
    await deleteDoc(doc(db, 'children', childId));
    await fetchChildren();
  };

  const deleteAllChildren = async () => {
    console.log('🗑️ FamilyContext: Starting deleteAllChildren...', { userId: user?.uid });
    
    if (!user || !user.uid) {
      console.error('❌ FamilyContext: User not authenticated');
      throw new Error("User not authenticated");
    }
    
    try {
      const familyId = `family_${user.uid}`;
      const q = query(collection(db, 'children'), where('familyId', '==', familyId));
      const querySnapshot = await getDocs(q);
      
      console.log(`🗑️ FamilyContext: Found ${querySnapshot.docs.length} children to delete`);
      
      // Delete all children in parallel
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      console.log('✅ FamilyContext: All children deleted successfully');
      
      // Refresh the list
      await fetchChildren();
    } catch (error: any) {
      console.error('❌ FamilyContext: Error deleting all children:', error);
      throw new Error('Failed to delete all children');
    }
  };

  // Only fetch children when user changes and user exists
  useEffect(() => {
    if (user) {
      fetchChildren();
    } else {
      // Clear data when user logs out
      setFamilyChildren([]);
      setLoading(false);
      setError(null);
    }
  }, [user, fetchChildren]);

  const value: FamilyContextType = {
    children: familyChildren,
    selectedChildId,
    loading,
    error,
    fetchChildren,
    addChild,
    updateChild,
    deleteChild,
    deleteAllChildren,
    setSelectedChildId,
    getSelectedChild: () => familyChildren.find(c => c.id === selectedChildId) || null,
  };

  return (
    <FamilyContext.Provider value={value}>
      {children}
    </FamilyContext.Provider>
  );
}

// Custom hook to consume the context
export function useFamily() {
  const context = useContext(FamilyContext);
  if (context === undefined) {
    throw new Error('useFamily must be used within a FamilyProvider');
  }
  return context;
}
