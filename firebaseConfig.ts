import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { initializeAuth, getAuth, connectAuthEmulator, Auth } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Validate required Firebase configuration
const requiredConfigKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
const missingKeys = requiredConfigKeys.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig]);

if (missingKeys.length > 0) {
  throw new Error(`Missing required Firebase configuration: ${missingKeys.join(', ')}. Please check your .env file.`);
}

let app: FirebaseApp;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize Auth with proper React Native persistence
let auth: Auth;
try {
  // Try to use React Native persistence if available
  const { getReactNativePersistence } = require('firebase/auth');
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
} catch (error) {
  // Fallback to standard initialization
  auth = initializeAuth(app);
}

const db: Firestore = getFirestore(app);
const functions = getFunctions(app);

// Connect to Firebase emulators in development
if (__DEV__) {
  // Use hostname instead of hardcoded IP for better portability
  const EMULATOR_HOST = 'mac.lan';
  
  try {
    // Connect to Auth emulator using hostname
    connectAuthEmulator(auth, `http://${EMULATOR_HOST}:9099`, { disableWarnings: true });
    console.log('🔥 Auth Emulator connected');
  } catch (e) {
    console.warn('Error connecting to Auth Emulator:', e);
  }
  
  try {
    // Connect to Firestore emulator using hostname
    connectFirestoreEmulator(db, EMULATOR_HOST, 8080);
    console.log('🔥 Firestore Emulator connected');
  } catch (e) {
    console.warn('Error connecting to Firestore Emulator:', e);
  }
  
  try {
    // Connect to Functions emulator using hostname
    connectFunctionsEmulator(functions, EMULATOR_HOST, 5001);
    console.log('🔥 Functions Emulator connected');
  } catch (e) {
    console.warn('Error connecting to Functions Emulator:', e);
  }
}

export { app, auth, db, functions };