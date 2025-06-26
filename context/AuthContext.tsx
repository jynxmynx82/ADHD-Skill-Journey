import React, { createContext, useContext, useState, useEffect } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User, deleteUser } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { auth, app } from '@/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserData {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  userRole?: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  setUserRole: (role: 'user' | 'admin') => Promise<void>;
  logout: () => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const db = getFirestore(app);

  useEffect(() => {
    let mounted = true;

    const loadStoredUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser && mounted) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error loading stored user:', error);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (mounted) {
        setUser(user);
        if (user) {
          try {
            // Store user in AsyncStorage
            await AsyncStorage.setItem('user', JSON.stringify(user));
            
            // Fetch user data from Firestore
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
              const data = userDoc.data() as UserData;
              setUserData(data);
              await AsyncStorage.setItem('userData', JSON.stringify(data));
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
          }
        } else {
          setUserData(null);
          await AsyncStorage.removeItem('user');
          await AsyncStorage.removeItem('userData');
        }
        setLoading(false);
      }
    });

    loadStoredUser();

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [db]);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      await AsyncStorage.setItem('user', JSON.stringify(userCredential.user));
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      setIsLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user document in Firestore
      const userData: UserData = {
        uid: user.uid,
        email: user.email!,
        firstName,
        lastName,
        createdAt: new Date(),
      };

      await setDoc(doc(db, 'users', user.uid), userData);
      setUserData(userData);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const setUserRole = async (role: 'user' | 'admin') => {
    if (!user) throw new Error('No user logged in');
    
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { userRole: role }, { merge: true });
      
      // Update local state
      const updatedUserData = userData ? { ...userData, userRole: role } : null;
      setUserData(updatedUserData);
      if (updatedUserData) {
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));
      }
    } catch (error) {
      console.error('Error setting user role:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserData(null);
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('userData');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const deleteAccount = async () => {
    if (!user) throw new Error('No user logged in');
    
    try {
      setIsLoading(true);
      
      // Delete user data from Firestore
      await deleteDoc(doc(db, 'users', user.uid));
      
      // Delete the user account from Firebase Auth
      await deleteUser(user);
      
      // Clear local state and storage
      setUser(null);
      setUserData(null);
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('userData');
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    userData,
    loading,
    isLoading,
    signIn,
    signUp,
    setUserRole,
    logout,
    signOut,
    deleteAccount,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
